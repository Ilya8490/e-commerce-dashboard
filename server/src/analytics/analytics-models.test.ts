import { describe, expect, it } from "vitest";

import { CustomerModel } from "./customer.model";
import { FunnelEventModel } from "./funnel-event.model";
import { OrderModel } from "./order.model";
import { ProductModel } from "./product.model";
import { SessionModel } from "./session.model";

describe("analytics Mongoose models", () => {
  it("defines WooCommerce-compatible optional external IDs for synced entities", () => {
    expect(ProductModel.schema.path("externalId")?.isRequired).not.toBe(true);
    expect(OrderModel.schema.path("externalId")?.isRequired).not.toBe(true);
    expect(CustomerModel.schema.path("externalId")?.isRequired).not.toBe(true);
  });

  it("indexes userId, createdAt, and externalId where relevant", () => {
    expect(ProductModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ userId: 1 }, expect.any(Object)],
        [{ createdAt: -1 }, expect.any(Object)],
        [{ userId: 1, externalId: 1 }, expect.objectContaining({ sparse: true })]
      ])
    );
    expect(OrderModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ userId: 1 }, expect.any(Object)],
        [{ createdAt: -1 }, expect.any(Object)],
        [{ userId: 1, externalId: 1 }, expect.objectContaining({ sparse: true })]
      ])
    );
    expect(CustomerModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ userId: 1 }, expect.any(Object)],
        [{ createdAt: -1 }, expect.any(Object)],
        [{ userId: 1, externalId: 1 }, expect.objectContaining({ sparse: true })]
      ])
    );
  });

  it("restricts analytics enums to supported dashboard values", () => {
    expect(OrderModel.schema.path("status")?.options.enum).toEqual([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ]);
    expect(SessionModel.schema.path("source")?.options.enum).toEqual([
      "organic",
      "paid",
      "direct",
      "social",
      "email"
    ]);
    expect(SessionModel.schema.path("device")?.options.enum).toEqual([
      "desktop",
      "mobile",
      "tablet"
    ]);
    expect(FunnelEventModel.schema.path("step")?.options.enum).toEqual([
      "visit",
      "product_view",
      "add_to_cart",
      "checkout",
      "order"
    ]);
  });

  it("keeps required structures ready for seeded mock data", async () => {
    const order = new OrderModel({
      userId: "665000000000000000000001",
      customerId: "665000000000000000000002",
      status: "processing",
      total: 129.98,
      items: [
        {
          productId: "665000000000000000000003",
          qty: 2,
          price: 64.99
        }
      ],
      source: "organic"
    });

    await expect(order.validate()).resolves.toBeUndefined();
  });
});
