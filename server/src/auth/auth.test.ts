import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

import { createApp } from "../app";
import { UserModel } from "./user.model";

const app = createApp();

describe("authentication API", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("registers a user, hashes the password, and sets an httpOnly auth cookie", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "owner@example.com",
      password: "demo1234",
      storeName: "Demo Store"
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: {
        email: "owner@example.com",
        storeName: "Demo Store"
      }
    });
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");

    const user = await UserModel.findOne({ email: "owner@example.com" }).lean();
    expect(user?.passwordHash).toBeDefined();
    expect(user?.passwordHash).not.toBe("demo1234");
  });

  it("logs in a registered user and allows access to the protected me route", async () => {
    await request(app).post("/api/auth/register").send({
      email: "owner@example.com",
      password: "demo1234",
      storeName: "Demo Store"
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "demo1234"
    });

    expect(login.status).toBe(200);
    const cookie = login.headers["set-cookie"];
    expect(cookie?.[0]).toContain("HttpOnly");

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({
      email: "owner@example.com",
      storeName: "Demo Store"
    });
  });

  it("returns a bearer token on login for browsers that block cross-site cookies", async () => {
    await request(app).post("/api/auth/register").send({
      email: "owner@example.com",
      password: "demo1234",
      storeName: "Demo Store"
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "demo1234"
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
  });

  it("allows access to protected routes with a bearer token when no cookie is sent", async () => {
    await request(app).post("/api/auth/register").send({
      email: "owner@example.com",
      password: "demo1234",
      storeName: "Demo Store"
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "demo1234"
    });

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({
      email: "owner@example.com",
      storeName: "Demo Store"
    });
  });

  it("rejects invalid login credentials with the standard error format", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "missing@example.com",
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid email or password" });
  });

  it("clears the auth cookie on logout and blocks the protected route", async () => {
    await request(app).post("/api/auth/register").send({
      email: "owner@example.com",
      password: "demo1234",
      storeName: "Demo Store"
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "demo1234"
    });

    const logout = await request(app).post("/api/auth/logout").set("Cookie", login.headers["set-cookie"]);

    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ success: true });
    expect(logout.headers["set-cookie"]?.[0]).toContain("auth_token=;");

    const me = await request(app).get("/api/auth/me");
    expect(me.status).toBe(401);
    expect(me.body).toEqual({ error: "Authentication required" });
  });

  it("returns field-level validation errors", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "short",
      storeName: ""
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: expect.any(String),
      field: expect.any(String)
    });
  });
});
