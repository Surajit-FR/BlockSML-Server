const Redis = require('ioredis');

const redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
});

redisClient.on('connect', () => {
    console.log(`Connected to Redis: ${redisClient.options.host}:${redisClient.options.port}`);
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;