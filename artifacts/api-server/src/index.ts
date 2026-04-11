import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { initSocketIO } from "./lib/socketio.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
initSocketIO(httpServer);

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening (HTTP + WebSocket)");
});

httpServer.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
