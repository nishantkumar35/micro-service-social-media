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
