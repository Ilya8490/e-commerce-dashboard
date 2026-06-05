import dotenv from "dotenv";

import { createApp } from "./app";
import { connectDatabase } from "./config/database";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

await connectDatabase();

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
