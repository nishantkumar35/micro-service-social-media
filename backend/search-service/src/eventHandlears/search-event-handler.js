const Search = require("../models/Search");
const logger = require("../utils/logger");

async function handlePostCreated(event, redisClient) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      username: event.username || "Anonymous",
      content: event.content,
      mediaIds: event.mediaIds || [],
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    logger.info(
      `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`,
    );

    //invalidate cache
    const keys = await redisClient.keys("search:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info("Search cache invalidated");
    }
  } catch (e) {
    logger.error("Error handling post creation event", e);
  }
}

async function handlePostDeleted(event, redisClient) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    logger.info(`Search post deleted: ${event.postId}}`);

    //invalidate cache
    const keys = await redisClient.keys("search:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info("Search cache invalidated");
    }
  } catch (error) {
    logger.error("Error handling post deletion event", error);
  }
}

module.exports = { handlePostCreated, handlePostDeleted };