import { Types } from "mongoose";

import {
  CustomerModel,
  OrderModel,
  ProductModel,
  SessionModel,
  type CustomerDocument,
  type OrderDocument,
  type ProductDocument
} from "../analytics";
import { funnelSteps, type FunnelStep, type TrafficSource } from "../analytics/analytics.enums";
import { FunnelEventModel } from "../analytics/funnel-event.model";
import type { DashboardProduct, DateRange, ProductQuery, TrafficSourceResult } from "./dashboard.types";

const revenueStatuses = ["pending", "processing", "shipped", "delivered"] as const;

type LeanProduct = ProductDocument & { _id: Types.ObjectId };
type LeanOrder = OrderDocument & { _id: Types.ObjectId };
type LeanCustomer = CustomerDocument & { _id: Types.ObjectId };

interface OrderTotals {
  revenue: number;
  orders: number;
}

interface ProductMetric {
  revenue: number;
  unitsSold: number;
}

function userObjectId(userId: string) {
  return new Types.ObjectId(userId);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function serializeProduct(product: LeanProduct, metric?: ProductMetric): DashboardProduct {
  return {
    id: product._id.toString(),
    userId: product.userId.toString(),
    externalId: product.externalId,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    soldUnits: product.soldUnits,
    createdAt: product.createdAt.toISOString(),
    revenue: metric?.revenue ?? 0,
    unitsSold: metric?.unitsSold ?? 0
  };
}

function orderDateFilter(userId: string, range: DateRange, revenueOnly = true) {
  return {
    userId: userObjectId(userId),
    createdAt: { $gte: range.from, $lte: range.to },
    ...(revenueOnly ? { status: { $in: revenueStatuses } } : {})
  };
}

export class CommerceAdapter {
  async getOrderTotals(userId: string, range: DateRange): Promise<OrderTotals> {
    const result = await OrderModel.aggregate<{ _id: null; revenue: number; orders: number }>([
      { $match: orderDateFilter(userId, range) },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      }
    ]);

    return {
      revenue: round(result[0]?.revenue ?? 0),
      orders: result[0]?.orders ?? 0
    };
  }

  async getRevenueByDate(userId: string, range: DateRange): Promise<Map<string, number>> {
    const rows = await OrderModel.aggregate<{ _id: string; revenue: number }>([
      { $match: orderDateFilter(userId, range) },
      {
        $group: {
          _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
          revenue: { $sum: "$total" }
        }
      }
    ]);

    return new Map(rows.map((row) => [row._id, round(row.revenue)]));
  }

  async getVisitCount(userId: string, range: DateRange): Promise<number> {
    const result = await SessionModel.aggregate<{ _id: null; visits: number }>([
      {
        $match: {
          userId: userObjectId(userId),
          date: { $gte: range.from, $lte: range.to }
        }
      },
      { $group: { _id: null, visits: { $sum: "$visits" } } }
    ]);

    return result[0]?.visits ?? 0;
  }

  async getProducts(userId: string, query: ProductQuery): Promise<{ products: DashboardProduct[]; total: number }> {
    const searchFilter = query.search
      ? {
          $or: [
            { name: { $regex: query.search, $options: "i" } },
            { category: { $regex: query.search, $options: "i" } }
          ]
        }
      : {};
    const match = { userId: userObjectId(userId), ...searchFilter };
    const [products, total, metrics] = await Promise.all([
      ProductModel.find(match).lean<LeanProduct[]>(),
      ProductModel.countDocuments(match),
      this.getProductMetrics(userId)
    ]);

    const sorted = products
      .map((product) => serializeProduct(product, metrics.get(product._id.toString())))
      .sort((left, right) => {
        const leftValue = query.sort === "revenue" ? left.revenue : left.unitsSold;
        const rightValue = query.sort === "revenue" ? right.revenue : right.unitsSold;
        const direction = query.order === "asc" ? 1 : -1;

        if (leftValue === rightValue) {
          return left.name.localeCompare(right.name) * direction;
        }

        return (leftValue - rightValue) * direction;
      });
    const start = (query.page - 1) * query.limit;

    return { products: sorted.slice(start, start + query.limit), total };
  }

  async getFunnelCounts(userId: string, range: DateRange): Promise<Map<FunnelStep, number>> {
    const rows = await FunnelEventModel.aggregate<{ _id: FunnelStep; count: number }>([
      {
        $match: {
          userId: userObjectId(userId),
          date: { $gte: range.from, $lte: range.to }
        }
      },
      { $group: { _id: "$step", count: { $sum: "$count" } } }
    ]);
    const counts = new Map<FunnelStep, number>(funnelSteps.map((step) => [step, 0]));

    for (const row of rows) {
      counts.set(row._id, row.count);
    }

    return counts;
  }

  async getTrafficSources(userId: string, range: DateRange): Promise<TrafficSourceResult[]> {
    const rows = await SessionModel.aggregate<{ _id: TrafficSource; visits: number }>([
      {
        $match: {
          userId: userObjectId(userId),
          date: { $gte: range.from, $lte: range.to }
        }
      },
      { $group: { _id: "$source", visits: { $sum: "$visits" } } },
      { $sort: { visits: -1 } }
    ]);
    const total = rows.reduce((sum, row) => sum + row.visits, 0);

    return rows.map((row) => ({
      source: row._id,
      visits: row.visits,
      percentage: total === 0 ? 0 : round((row.visits / total) * 100)
    }));
  }

  async getNewCustomerCount(userId: string, range: DateRange): Promise<number> {
    return CustomerModel.countDocuments({
      userId: userObjectId(userId),
      createdAt: { $gte: range.from, $lte: range.to }
    });
  }

  async getReturningCustomerCount(userId: string, range: DateRange): Promise<number> {
    const rows = await OrderModel.aggregate<{ _id: Types.ObjectId }>([
      { $match: orderDateFilter(userId, range) },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      { $match: { "customer.createdAt": { $lt: range.from } } },
      { $group: { _id: "$customerId" } }
    ]);

    return rows.length;
  }

  async getTopCustomersByLtv(userId: string, limit: number) {
    const customers = await CustomerModel.find({ userId: userObjectId(userId) })
      .sort({ lifetimeValue: -1, name: 1 })
      .limit(limit)
      .lean<LeanCustomer[]>();

    return customers.map((customer) => ({
      name: customer.name,
      email: customer.email,
      ltv: customer.lifetimeValue
    }));
  }

  async getOrdersForCsv(userId: string, range: DateRange): Promise<LeanOrder[]> {
    return OrderModel.find(orderDateFilter(userId, range, false)).sort({ createdAt: 1 }).lean<LeanOrder[]>();
  }

  async getProductsForCsv(userId: string, range: DateRange): Promise<DashboardProduct[]> {
    const [products, metrics] = await Promise.all([
      ProductModel.find({ userId: userObjectId(userId) }).sort({ name: 1 }).lean<LeanProduct[]>(),
      this.getProductMetrics(userId, range)
    ]);

    return products.map((product) => serializeProduct(product, metrics.get(product._id.toString())));
  }

  private async getProductMetrics(userId: string, range?: DateRange): Promise<Map<string, ProductMetric>> {
    const rows = await OrderModel.aggregate<{ _id: Types.ObjectId; revenue: number; unitsSold: number }>([
      {
        $match: {
          userId: userObjectId(userId),
          status: { $in: revenueStatuses },
          ...(range ? { createdAt: { $gte: range.from, $lte: range.to } } : {})
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
          unitsSold: { $sum: "$items.qty" }
        }
      }
    ]);

    return new Map(
      rows.map((row) => [
        row._id.toString(),
        {
          revenue: round(row.revenue),
          unitsSold: row.unitsSold
        }
      ])
    );
  }

  toCsvOrder(order: LeanOrder) {
    return {
      id: order._id.toString(),
      customerId: order.customerId.toString(),
      status: order.status,
      total: order.total,
      source: order.source,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.qty, 0)
    };
  }
}

export function todayKey(date: Date) {
  return toDateKey(date);
}
