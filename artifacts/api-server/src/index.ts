import "./load-env.js";
import app from "./app";
import { logger } from "./lib/logger";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";

const rawPort = process.env["PORT"];

if (!rawPort) {
  // ... (keeping existing logging)
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  // ... (keeping existing logging)
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

// Socket.io initialization
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Redis Adapter for Socket.io (if Redis URL is provided)
if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Redis adapter for Socket.io enabled");
}

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected via WebSocket");
  
  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Client disconnected from WebSocket");
  });
});

httpServer.listen(port, () => {
  // #region agent log
  try {
    const logPath = path.resolve(import.meta.dirname, "..", "..", "..", "debug-f3a3f4.log");
    fs.appendFileSync(
      logPath,
      JSON.stringify({
        sessionId: "f3a3f4",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "api-server/src/index.ts:70",
        message: "API server listening with WebSocket support",
        data: { port },
        timestamp: Date.now(),
      }) + "\n",
      "utf8",
    );
  } catch {}
  // #endregion agent log
  logger.info(
    { port, groqChat: process.env.GROQ_API_KEY ? "configured" : "missing" },
    "Server listening with WebSocket support",
  );
});
