import { Router, type Request } from "express";

import { requireAuth as authMiddleware, type AuthenticatedRequest } from "../auth/auth.middleware";
import { DashboardService } from "./dashboard.service";
import type { DateRange, ProductQuery } from "./dashboard.types";

export const dashboardRouter = Router();

const service = new DashboardService();

function parseDateRange(query: Record<string, unknown>): DateRange {
  const now = new Date();
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const defaultFrom = new Date(defaultTo);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from = typeof query.from === "string" ? parseDate(query.from, false) : defaultFrom;
  const to = typeof query.to === "string" ? parseDate(query.to, true) : defaultTo;

  if (from > to) {
    throw new Error("from must be before to");
  }

  return { from, to };
}

function parseDate(value: string, endOfDay: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Dates must use YYYY-MM-DD");
  }

  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const date = new Date(`${value}${suffix}`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Dates must use YYYY-MM-DD");
  }

  return date;
}

function parseProductsQuery(query: Record<string, unknown>): ProductQuery {
  const sort = query.sort === "units" ? "units" : "revenue";
  const order = query.order === "asc" ? "asc" : "desc";
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const page = positiveInt(query.page, 1, 1, 1000);
  const limit = positiveInt(query.limit, 20, 1, 100);

  return { sort, order, search, page, limit };
}

function positiveInt(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function authUserId(request: Request) {
  return (request as AuthenticatedRequest).user.id;
}

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/dashboard/overview", async (request, response) => {
  try {
    response.status(200).json(await service.getOverview(authUserId(request), parseDateRange(request.query)));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
  }
});

dashboardRouter.get("/products", async (request, response) => {
  response.status(200).json(await service.getProducts(authUserId(request), parseProductsQuery(request.query)));
});

dashboardRouter.get("/funnel", async (request, response) => {
  try {
    response.status(200).json(await service.getFunnel(authUserId(request), parseDateRange(request.query)));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
  }
});

dashboardRouter.get("/traffic", async (request, response) => {
  try {
    response.status(200).json(await service.getTraffic(authUserId(request), parseDateRange(request.query)));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
  }
});

dashboardRouter.get("/customers", async (request, response) => {
  try {
    response.status(200).json(await service.getCustomers(authUserId(request), parseDateRange(request.query)));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
  }
});

dashboardRouter.get("/export/csv", async (request, response) => {
  try {
    const entity = request.query.entity;

    if (entity !== "orders" && entity !== "products") {
      response.status(400).json({ error: "entity must be orders or products" });
      return;
    }

    const range = parseDateRange(request.query);
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${entity}.csv"`);

    for await (const chunk of service.streamCsv(authUserId(request), entity, range)) {
      response.write(chunk);
    }

    response.end();
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
  }
});
