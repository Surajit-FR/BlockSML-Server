const Redis = require('ioredis');

const redisClient = new Redis({
    port: 6379, // Replace with your Redis port
    host: '127.0.0.1', // Replace with your Redis host
});

redisClient.on('connect', () => {
    console.log(`Connected to Redis: ${redisClient.options.host}:${redisClient.options.port}`);
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;