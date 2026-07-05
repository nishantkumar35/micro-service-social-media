require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./route/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlears/media-event-handler");

const app = express();
const PORT = process.env.PORT || 3003;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    service: "media-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: "unknown",
      rabbitmq: "unknown",
    },
  };
  try {
    const mongoose = require("mongoose");
    health.dependencies.mongodb =
      mongoose.connection.readyState === 1 ? "ok" : "error";
  } catch (e) {
    health.dependencies.mongodb = "error";
  }
  try {
    const { getChannel } = require("./utils/rabbitmq");
    health.dependencies.rabbitmq = getChannel() ? "ok" : "error";
  } catch (e) {
    health.dependencies.rabbitmq = "error";
  }
  if (Object.values(health.dependencies).includes("error")) {
    health.status = "degraded";
  }
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});
// ─────────────────────────────────────────────────────────────────────────────

//*** Homework - implement Ip based rate limiting for sensitive endpoints

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    //consume all the events
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});