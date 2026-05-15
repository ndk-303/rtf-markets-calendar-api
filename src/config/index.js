'use strict';

const dotenv = require('dotenv');
dotenv.config();

const env = (key, fallback) => process.env[key] ?? fallback;

module.exports = {
  env: env('NODE_ENV', 'production'),
  port: parseInt(env('PORT', '3000'), 10),

  serpApi: {
    key: env('SERP_API_KEY', ''),
    baseUrl: 'https://serpapi.com/search.json',
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 2000,
  },

  redis: {
    host: env('REDIS_HOST', 'localhost'),
    port: parseInt(env('REDIS_PORT', '6379'), 10),
    password: env('REDIS_PASSWORD', '') || undefined,
    db: parseInt(env('REDIS_DB', '0'), 10),
    keyPrefix: 'rtf:',
    connectTimeout: 5000,
    lazyConnect: true,
  },

  scheduler: {
    fetchInterval: parseInt(env('FETCH_INTERVAL', '30000'), 10),
  },

  cache: {
    ttl: parseInt(env('CACHE_TTL', '60'), 10),
    memoryMaxSize: 100,
  },

  cors: {
    origins: env('ALLOWED_ORIGINS', '*')
      .split(',')
      .map((o) => o.trim()),
  },

  logging: {
    level: env('LOG_LEVEL', 'info'),
  },
};
