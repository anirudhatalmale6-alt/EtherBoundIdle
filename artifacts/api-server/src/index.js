import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger";

console.log("ENV TEST:", process.env.DATABASE_URL);

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error("PORT is missing");
}

const port = Number(rawPort);

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
