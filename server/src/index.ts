import dotenv from "dotenv";

import { createApp } from "./app";
import { connectDatabase } from "./config/database";

async function startServer() {
  console.log("Loading environment variables");
  dotenv.config();

  const port = Number(process.env.PORT ?? 4000);
  const app = createApp();

  console.log("Connecting database");
  await connectDatabase();
  console.log("Database connected");

  console.log("Starting HTTP server");
  app.listen(port, "0.0.0.0", () => {
    console.log(`API server listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Server startup failed");
  console.error(error);
  process.exit(1);
});
