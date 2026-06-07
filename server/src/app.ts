import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { authRouter } from "./auth/auth.routes";
import { dashboardRouter } from "./dashboard/dashboard.routes";

function allowedOrigins() {
  const configuredOrigins = process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

  return configuredOrigins.split(",").map((origin) => origin.trim());
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: allowedOrigins(),
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", dashboardRouter);

  return app;
}
