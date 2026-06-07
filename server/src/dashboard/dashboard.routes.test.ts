import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app";
import { seedDatabase } from "../../scripts/seed";

const app = createApp();
const rangeQuery = "from=2025-01-01&to=2026-12-31";

describe("dashboard API", () => {
  let mongo: MongoMemoryServer;
  let cookie: string[];

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    mongo = await MongoMemoryServer.create();
    await seedDatabase(mongo.getUri());

    const login = await request(app).post("/api/auth/login").send({
      email: "demo@demo.com",
      password: "demo1234"
    });

    const setCookie = login.headers["set-cookie"];
    cookie = Array.isArray(setCookie) ? setCookie : [setCookie].filter((value): value is string => Boolean(value));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("protects dashboard endpoints", async () => {
    const response = await request(app).get(`/api/dashboard/overview?${rangeQuery}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("returns overview analytics with a stable JSON shape", async () => {
    const response = await request(app).get(`/api/dashboard/overview?${rangeQuery}`).set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      revenue: expect.any(Number),
      orders: expect.any(Number),
      cvr: expect.any(Number),
      aov: expect.any(Number),
      revenueDelta: expect.any(Number),
      ordersDelta: expect.any(Number),
      revenueChart: expect.any(Array),
      orderStatusChart: expect.any(Array)
    });
    expect(response.body.orders).toBe(288);
    expect(response.body.revenue).toBeGreaterThan(0);
    expect(response.body.orderStatusChart).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "delivered", count: expect.any(Number) }),
        expect.objectContaining({ status: "cancelled", count: expect.any(Number) })
      ])
    );
  });

  it("returns searchable and paginated product metrics", async () => {
    const response = await request(app)
      .get("/api/products?sort=units&order=desc&search=Apparel&page=1&limit=5")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      products: expect.any(Array),
      total: expect.any(Number),
      page: 1
    });
    expect(response.body.products.length).toBeLessThanOrEqual(5);
    expect(response.body.products[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      category: "Apparel",
      revenue: expect.any(Number),
      unitsSold: expect.any(Number)
    });
  });

  it("returns funnel, traffic, and customer analytics", async () => {
    const [funnel, traffic, customers] = await Promise.all([
      request(app).get(`/api/funnel?${rangeQuery}`).set("Cookie", cookie),
      request(app).get(`/api/traffic?${rangeQuery}`).set("Cookie", cookie),
      request(app).get(`/api/customers?${rangeQuery}`).set("Cookie", cookie)
    ]);

    expect(funnel.status).toBe(200);
    expect(funnel.body.steps).toHaveLength(5);
    expect(funnel.body.steps[0]).toMatchObject({ label: "Visit", rate: 100 });

    expect(traffic.status).toBe(200);
    expect(traffic.body.sources[0]).toMatchObject({
      source: expect.any(String),
      visits: expect.any(Number),
      percentage: expect.any(Number)
    });

    expect(customers.status).toBe(200);
    expect(customers.body).toMatchObject({
      newCount: expect.any(Number),
      returningCount: expect.any(Number),
      topByLtv: expect.any(Array)
    });
  });

  it("streams CSV exports with attachment headers", async () => {
    const response = await request(app).get(`/api/export/csv?entity=orders&${rangeQuery}`).set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain("attachment");
    expect(response.text.split("\n")[0]).toBe("id,customerId,status,total,source,createdAt,itemCount");
  });
});
