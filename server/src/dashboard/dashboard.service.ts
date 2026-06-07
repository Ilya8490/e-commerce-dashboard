import { funnelSteps } from "../analytics/analytics.enums";
import { CommerceAdapter, todayKey } from "./commerce.adapter";
import type { DateRange, ProductQuery, RevenuePoint } from "./dashboard.types";

const funnelLabels = {
  visit: "Visit",
  product_view: "Product view",
  add_to_cart: "Add to cart",
  checkout: "Checkout",
  order: "Order"
} as const;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function percentageDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return round(((current - previous) / previous) * 100);
}

function previousRange(range: DateRange): DateRange {
  const duration = range.to.getTime() - range.from.getTime() + 1;

  return {
    from: new Date(range.from.getTime() - duration),
    to: new Date(range.from.getTime() - 1)
  };
}

function dateKeys(range: DateRange) {
  const keys: string[] = [];
  const cursor = new Date(range.from);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor <= range.to) {
    keys.push(todayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

function csvEscape(value: string | number) {
  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }

  return text;
}

function csvRow(values: Array<string | number>) {
  return `${values.map(csvEscape).join(",")}\n`;
}

export class DashboardService {
  constructor(private readonly commerce = new CommerceAdapter()) {}

  async getOverview(userId: string, range: DateRange) {
    const prior = previousRange(range);
    const [currentTotals, priorTotals, visits, revenueByDate, orderStatusChart] = await Promise.all([
      this.commerce.getOrderTotals(userId, range),
      this.commerce.getOrderTotals(userId, prior),
      this.commerce.getVisitCount(userId, range),
      this.commerce.getRevenueByDate(userId, range),
      this.commerce.getOrderStatusCounts(userId, range)
    ]);
    const revenueChart: RevenuePoint[] = dateKeys(range).map((date) => ({
      date,
      revenue: revenueByDate.get(date) ?? 0
    }));

    return {
      revenue: currentTotals.revenue,
      orders: currentTotals.orders,
      cvr: visits === 0 ? 0 : round((currentTotals.orders / visits) * 100),
      aov: currentTotals.orders === 0 ? 0 : round(currentTotals.revenue / currentTotals.orders),
      revenueDelta: percentageDelta(currentTotals.revenue, priorTotals.revenue),
      ordersDelta: percentageDelta(currentTotals.orders, priorTotals.orders),
      revenueChart,
      orderStatusChart
    };
  }

  async getProducts(userId: string, query: ProductQuery) {
    const page = await this.commerce.getProducts(userId, query);

    return {
      products: page.products,
      total: page.total,
      page: query.page
    };
  }

  async getFunnel(userId: string, range: DateRange) {
    const counts = await this.commerce.getFunnelCounts(userId, range);
    let previousCount = 0;

    return {
      steps: funnelSteps.map((step, index) => {
        const count = counts.get(step) ?? 0;
        const rate = index === 0 ? 100 : previousCount === 0 ? 0 : round((count / previousCount) * 100);
        previousCount = count;

        return {
          label: funnelLabels[step],
          count,
          rate
        };
      })
    };
  }

  async getTraffic(userId: string, range: DateRange) {
    return {
      sources: await this.commerce.getTrafficSources(userId, range)
    };
  }

  async getCustomers(userId: string, range: DateRange) {
    const [newCount, returningCount, topByLtv] = await Promise.all([
      this.commerce.getNewCustomerCount(userId, range),
      this.commerce.getReturningCustomerCount(userId, range),
      this.commerce.getTopCustomersByLtv(userId, 5)
    ]);

    return { newCount, returningCount, topByLtv };
  }

  async *streamCsv(userId: string, entity: "orders" | "products", range: DateRange) {
    if (entity === "orders") {
      yield csvRow(["id", "customerId", "status", "total", "source", "createdAt", "itemCount"]);

      const orders = await this.commerce.getOrdersForCsv(userId, range);

      for (const order of orders) {
        const row = this.commerce.toCsvOrder(order);
        yield csvRow([row.id, row.customerId, row.status, row.total, row.source, row.createdAt, row.itemCount]);
      }

      return;
    }

    yield csvRow(["id", "name", "category", "price", "stock", "soldUnits", "unitsSold", "revenue", "createdAt"]);

    const products = await this.commerce.getProductsForCsv(userId, range);

    for (const product of products) {
      yield csvRow([
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.soldUnits,
        product.unitsSold,
        product.revenue,
        product.createdAt
      ]);
    }
  }
}
