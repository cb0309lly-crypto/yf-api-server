export const redisConfig = {
  host: process.env.REDIS_HOST || 'r-bp1ixn3gbvaaqoxs2ppd.redis.rds.aliyuncs.com',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME || 'yf_redis',
  password: process.env.REDIS_PASSWORD || 'Yf@123456',
  db: parseInt(process.env.REDIS_DB || '12', 10),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};
