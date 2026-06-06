import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CustomerModel, FunnelEventModel, OrderModel, ProductModel, SessionModel } from "../src/analytics";
import { UserModel } from "../src/auth/user.model";
import { seedDatabase } from "./seed";

describe("seedDatabase", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("creates an idempotent demo analytics dataset with valid relationships", async () => {
    const uri = mongo.getUri();

    const firstRun = await seedDatabase(uri);
    const secondRun = await seedDatabase(uri);

    expect(secondRun).toEqual(firstRun);
    expect(secondRun).toMatchObject({
      users: 1,
      products: 20,
      customers: 20,
      orders: 50,
      sessions: 90,
      funnelEvents: 450
    });

    const user = await UserModel.findOne({ email: "demo@demo.com" }).lean();
    expect(user?.storeName).toBe("Demo Store");
    expect(user?.passwordHash).toBeDefined();
    expect(await bcrypt.compare("demo1234", user?.passwordHash ?? "")).toBe(true);

    const products = await ProductModel.find({ userId: user?._id }).lean();
    const customers = await CustomerModel.find({ userId: user?._id }).lean();
    const orders = await OrderModel.find({ userId: user?._id }).lean();
    const sessions = await SessionModel.find({ userId: user?._id }).lean();
    const funnelEvents = await FunnelEventModel.find({ userId: user?._id }).lean();

    expect(products).toHaveLength(20);
    expect(customers).toHaveLength(20);
    expect(orders).toHaveLength(50);
    expect(sessions).toHaveLength(90);
    expect(funnelEvents).toHaveLength(450);
    expect(products.every((product) => product.externalId === undefined)).toBe(true);
    expect(customers.every((customer) => customer.externalId === undefined)).toBe(true);
    expect(orders.every((order) => order.externalId === undefined)).toBe(true);

    const productIds = new Set(products.map((product) => product._id.toString()));
    const customerIds = new Set(customers.map((customer) => customer._id.toString()));

    for (const order of orders) {
      expect(customerIds.has(order.customerId.toString())).toBe(true);
      expect(order.items.length).toBeGreaterThanOrEqual(1);
      expect(order.items.every((item) => productIds.has(item.productId.toString()))).toBe(true);

      const calculatedTotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
      expect(order.total).toBeCloseTo(calculatedTotal, 2);
    }

    const funnelDates = new Set(funnelEvents.map((event) => event.date.toISOString().slice(0, 10)));
    expect(funnelDates.size).toBe(90);

    for (const date of funnelDates) {
      const eventsForDate = funnelEvents.filter((event) => event.date.toISOString().startsWith(date));
      const visit = eventsForDate.find((event) => event.step === "visit")?.count ?? 0;
      const productView = eventsForDate.find((event) => event.step === "product_view")?.count ?? 0;
      const addToCart = eventsForDate.find((event) => event.step === "add_to_cart")?.count ?? 0;
      const checkout = eventsForDate.find((event) => event.step === "checkout")?.count ?? 0;
      const order = eventsForDate.find((event) => event.step === "order")?.count ?? 0;

      expect(visit).toBeGreaterThanOrEqual(productView);
      expect(productView).toBeGreaterThanOrEqual(addToCart);
      expect(addToCart).toBeGreaterThanOrEqual(checkout);
      expect(checkout).toBeGreaterThanOrEqual(order);
    }
  });
});
