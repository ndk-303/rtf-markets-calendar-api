'use strict';

const memoryCache = require('./memoryCache');
const redisClient = require('./redisClient');
const config = require('../../config');
const logger = require('../../utils/logger');

const DEFAULT_TTL = config.cache.ttl;

const get = async (key) => {
  const memHit = memoryCache.get(key);
  if (memHit !== null) {
    logger.debug('[cache] Memory hit', { key });
    return memHit;
  }

  const redisHit = await redisClient.get(key);
  if (redisHit !== null) {
    logger.debug('[cache] Redis hit', { key });
    memoryCache.set(key, redisHit, DEFAULT_TTL);
    return redisHit;
  }

  logger.debug('[cache] Miss', { key });
  return null;
};

const set = async (key, value, ttlSeconds = DEFAULT_TTL) => {
  memoryCache.set(key, value, ttlSeconds);
  await redisClient.set(key, value, ttlSeconds);
};

const del = async (key) => {
  memoryCache.del(key);
  await redisClient.del(key);
};

module.exports = { get, set, del };
