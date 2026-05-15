'use strict';

const config = require('../../config');
const logger = require('../../utils/logger');
const { fetchAndCache } = require('../financialService');
const sseManager = require('../sse/sseManager');

let intervalId = null;
let isFetching = false;

const tick = async () => {
  if (isFetching) {
    logger.warn('[scheduler] Skipping tick - previous fetch still running');
    return;
  }

  isFetching = true;
  try {
    const data = await fetchAndCache();
    sseManager.broadcast('market:indexes', data);
  } catch (err) {
    logger.error('[scheduler] Tick error', { error: err.message });
  } finally {
    isFetching = false;
  }
};

const start = async () => {
  logger.info('[scheduler] Starting', {
    interval: config.scheduler.fetchInterval,
  });

  await tick();

  intervalId = setInterval(tick, config.scheduler.fetchInterval);
};

const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('[scheduler] Stopped');
  }
};

module.exports = { start, stop };
