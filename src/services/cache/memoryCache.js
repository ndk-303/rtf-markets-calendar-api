'use strict';

const config = require('../../config');
const logger = require('../../utils/logger');

class MemoryCache {
  constructor({ ttl = 60, maxSize = 100 } = {}) {
    this._store = new Map();
    this._ttl = ttl * 1000;
    this._maxSize = maxSize;
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds) {
    if (this._store.size >= this._maxSize) {
      const firstKey = this._store.keys().next().value;
      this._store.delete(firstKey);
    }
    this._store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : this._ttl),
    });
  }

  del(key) {
    this._store.delete(key);
  }

  flush() {
    this._store.clear();
  }
}

const memoryCache = new MemoryCache({
  ttl: config.cache.ttl,
  maxSize: config.cache.memoryMaxSize,
});

module.exports = memoryCache;
