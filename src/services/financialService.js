'use strict';

const { getJson } = require('serpapi');
const config = require('../config');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

const CACHE_KEY = 'market:indexes';
const cacheManager = require('./cache/cacheManager');

const transformData = (raw) => {
  const markets = raw?.market_trends ?? [];
  const indexes = markets[0];
  return {
    indexes: indexes?.results ?? [],
    fetchedAt: new Date().toISOString(),
    source: 'serpapi',
  };
};

const fetchFromApi = () => {
  return new Promise((resolve, reject) => {
    getJson({
      engine: 'google_finance_markets',
      trend: 'indexes',
      index_market: 'americas',
      api_key: config.serpApi.key,
    }, (json) => {
      console.log('Data: ' + JSON.stringify(json, null, 2));
      resolve(transformData(json));
    });
  });
};

const fetchMarketIndexes = async () => {
  return retry(fetchFromApi, {
    retries: config.serpApi.maxRetries,
    delay: config.serpApi.retryDelay,
    label: 'serpapi:market-indexes',
  });
};

const fetchAndCache = async () => {
  logger.info('[serpapi] Fetching market indexes');
  try {
    const data = await fetchMarketIndexes();
    await cacheManager.set(CACHE_KEY, data, config.cache.ttl);
    logger.info('[serpapi] Market indexes cached', {
      count: data.indexes?.length ?? 0,
    });
    return data;
  } catch (err) {
    logger.error('[serpapi] Fetch failed', { error: err.message });
    throw err;
  }
};

const getCached = async () => {
  return cacheManager.get(CACHE_KEY);
};

module.exports = { fetchAndCache, getCached, CACHE_KEY };
