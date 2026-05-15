'use strict';

const Redis = require('ioredis');
const config = require('../../config');
const logger = require('../../utils/logger');

let client = null;
let isConnected = false;

const createClient = () => {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    keyPrefix: config.redis.keyPrefix,
    connectTimeout: config.redis.connectTimeout,
    lazyConnect: config.redis.lazyConnect,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('[redis] Max reconnection attempts reached');
        return null;
      }
      return Math.min(times * 500, 5000);
    },
    enableOfflineQueue: false,
  });

  redis.on('connect', () => {
    isConnected = true;
    logger.info('[redis] Connected');
  });

  redis.on('error', (err) => {
    isConnected = false;
    logger.error('[redis] Connection error', { error: err.message });
  });

  redis.on('close', () => {
    isConnected = false;
    logger.warn('[redis] Connection closed');
  });

  return redis;
};

const getClient = () => {
  if (!client) {
    client = createClient();
  }
  return client;
};

const connect = async () => {
  const redis = getClient();
  try {
    await redis.connect();
  } catch (err) {
    logger.warn('[redis] Could not connect, will retry automatically', {
      error: err.message,
    });
  }
};

const disconnect = async () => {
  if (client) {
    await client.quit();
    client = null;
    isConnected = false;
    logger.info('[redis] Disconnected');
  }
};

const get = async (key) => {
  if (!isConnected) return null;
  try {
    const val = await getClient().get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    logger.warn('[redis] get failed', { key, error: err.message });
    return null;
  }
};

const set = async (key, value, ttlSeconds) => {
  if (!isConnected) return false;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await getClient().setex(key, ttlSeconds, serialized);
    } else {
      await getClient().set(key, serialized);
    }
    return true;
  } catch (err) {
    logger.warn('[redis] set failed', { key, error: err.message });
    return false;
  }
};

const del = async (key) => {
  if (!isConnected) return false;
  try {
    await getClient().del(key);
    return true;
  } catch (err) {
    logger.warn('[redis] del failed', { key, error: err.message });
    return false;
  }
};

const isReady = () => isConnected;

module.exports = { connect, disconnect, get, set, del, isReady };
