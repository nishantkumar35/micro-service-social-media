require("dotenv").config();

const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const redis = require("ioredis");

const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const router = require("./route/search-route");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlears/search-event-handler");

const app = express();
const PORT = process.env.PORT || 3004;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("connected to mongodb"))
  .catch((e) => logger.error("mongo connection err", e));

const redisClient = new redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`received ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    service: "search-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: "unknown",
      redis: "unknown",
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
    await redisClient.ping();
    health.dependencies.redis = "ok";
  } catch (e) {
    health.dependencies.redis = "error";
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

app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  router
);

async function startServer() {
  try {
    await connectToRabbitMQ();

    //consume all the events
    await consumeEvent("post.created", (event) =>
      handlePostCreated(event, redisClient),
    );
    await consumeEvent("post.deleted", (event) =>
      handlePostDeleted(event, redisClient),
    );

    app.listen(PORT, () => {
      logger.info(`Post service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled Reajection at ", promise, "reason:", reason);
});
