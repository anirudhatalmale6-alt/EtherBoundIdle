import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import { authMiddleware } from "./middleware/auth.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import entityRoutes from "./routes/entities.js";
import functionRoutes from "./routes/functions.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.use(authMiddleware);

app.get("/api/test", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), server: "etherbound-backend" });
});

app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", entityRoutes);
app.use("/api", functionRoutes);

export default app;
