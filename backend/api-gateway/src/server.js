require("dotenv").config();

const express = require("express");
const cors = require("cors");
const redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const proxy = require("express-http-proxy");
const errorHandler = require("./middelware/errorHandler");
const { validateToken } = require("./middelware/authmiddelware");

const app = express();

const redisClient = new redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// rateLimiting
const ratelimitOption = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "too many request" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(ratelimitOption);

app.use((req, res, next) => {
  logger.info(`received ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const newPath = req.originalUrl.replace(/^\/v1/, "/api");
    return newPath;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`proxy error :%${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

// setting up proxy for user service
app.use(
  "/v1/auth",
  proxy(process.env.USER_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

// setting up proxy for post service
app.use(
  "/v1/posts",
  validateToken,
  proxy(process.env.POST_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId || srcReq.user.id;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from post service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

// setting up proxy for media service
app.use(
  "/v1/media",
  validateToken,
  proxy(process.env.MEDIA_SERVICE, {
    ...proxyOptions,
    parseReqBody: false,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId || srcReq.user.id;
      const contentType = srcReq.headers["content-type"];
      if (
        !contentType ||
        !contentType.toLowerCase().startsWith("multipart/form-data")
      ) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

// setting up proxy for search service
app.use(
  "/v1/search",
  validateToken,
  proxy(process.env.SEARCH_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId || srcReq.user.id;
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from search service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`api gateway is runing on port ${PORT}`);
  logger.info(`user service is runing on port ${process.env.USER_SERVICE}`);
  logger.info(`post service is runing on port ${process.env.POST_SERVICE}`);
  logger.info(`media service is runing on port ${process.env.MEDIA_SERVICE}`);
  logger.info(`search service is runing on port ${process.env.SEARCH_SERVICE}`);
  logger.info(`redis url is runing on port ${process.env.REDIS_URL}`);
});
