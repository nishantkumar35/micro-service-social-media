require("dotenv").config();

const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const router = require("./routes/user-routes");
const errorHandler = require('./middelwares/errorHandler')


const app = express();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("connected to mongodb"))
  .catch((e) => logger.error("mongo connection err", e));

const redishClient = new redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`received ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

// ddos pritection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redishClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn(`Ratte limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "too many request" });
    });
});

// ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs : 15*60*1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders: false,
    handler: (req,res)=>{
        logger.warn(`sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "too many request" });
    },
    store : new RedisStore({
        sendCommand : (...args) => redishClient.call(...args),
    }),
});

// apply this sensitiveEndpointsLimiter to our routes

app.use('/api/auth/register',sensitiveEndpointsLimiter);

// routes

app.use('/api/auth',router);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
    logger.info(`user service runing on port ${PORT}`);
})

// unhandled promise rejection

process.on('unhandledRejection',(reason,promise)=>{
  logger.error("unhandled Reajection at ", promise, "reason:", reason);
})
