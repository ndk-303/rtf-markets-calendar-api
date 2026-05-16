'use strict';

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

const CACHE_KEY = 'market:indexes';
const cacheManager = require('./cache/cacheManager');

const transformData = (raw) => {
  return {
    indexes: raw?.data?.result ?? [],
    fetchedAt: new Date().toISOString(),
    source: 'rapidapi',
  };
};

const fetchFromApi = async () => {
  try {
    const date = new Date();
    const fromTime = Math.floor(date.getTime() / 1000 - 60 * 60 * 24 * 1);
    const toTime = Math.floor(date.getTime() / 1000 + 60 * 60 * 24 * 1);

    const response = await axios.get(config.rapidApi.baseUrl, {
      params: {
        from: fromTime,
        to: toTime,
      },
      headers: {
        'x-rapidapi-key': config.rapidApi.key,
        'x-rapidapi-host': config.rapidApi.host
      }
    });
    console.log('Data: ' + JSON.stringify(response.data?.data?.result ?? response.data, null, 2));
    return transformData(response.data);
  } catch (error) {
    logger.error('[rapidapi] Axios fetch failed', { error: error.message });
    throw error;
  }
};

const fetchMarketIndexes = async () => {
  return retry(fetchFromApi, {
    retries: config.rapidApi.maxRetries,
    delay: config.rapidApi.retryDelay,
    label: 'rapidapi:market-indexes',
  });
};

const fetchAndCache = async () => {
  logger.info('[rapidapi] Fetching market indexes');
  try {
    const data = await fetchMarketIndexes();
    await cacheManager.set(CACHE_KEY, data, config.cache.ttl);
    logger.info('[rapidapi] Market indexes cached', {
      count: data.indexes?.length ?? 0,
    });
    return data;
  } catch (err) {
    logger.error('[rapidapi] Fetch failed', { error: err.message });
    throw err;
  }
};

const getCached = async () => {
  return cacheManager.get(CACHE_KEY);
};

module.exports = { fetchAndCache, getCached, CACHE_KEY };
