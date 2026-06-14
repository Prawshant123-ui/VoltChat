const { redisClient } = require("../config/redis");

const rateLimiter = (limit, windowInSeconds) => {
  return async (req, res, next) => {
    try {
      const ip =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;

      const key = `rate_limit:${ip}`;

      const current = await redisClient.get(key);

      if (!current) {
        await redisClient.setEx(key, windowInSeconds, 1);
        return next();
      }

      const requestCount = parseInt(current);

      if (requestCount >= limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      await redisClient.incr(key);

      next();
    } catch (error) {
      console.error("Rate Limiter Error:", error);

      next();
    }
  };
};

module.exports = rateLimiter;
