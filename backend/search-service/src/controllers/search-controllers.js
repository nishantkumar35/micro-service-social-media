const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");

  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const cacheKey = `search:${query}`;

    const cachedData = await req.redisClient.get(cacheKey);

    if (cachedData) {
      logger.info("Serving from Redis cache");
      return res.json(JSON.parse(cachedData));
    }

    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    await req.redisClient.setex(
      cacheKey,
      300,
      JSON.stringify(results)
    );

    logger.info("Serving from DB and caching result");

    res.json(results);
  } catch (error) {
    logger.error("Error while searching post", error);

    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };