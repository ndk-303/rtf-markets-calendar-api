'use strict';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, { retries = 3, delay = 1000, label = 'operation' } = {}) => {
  const logger = require('./logger');
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`[retry] ${label} failed (attempt ${attempt}/${retries})`, {
        error: err.message,
      });
      if (attempt < retries) await sleep(delay * attempt);
    }
  }

  throw lastError;
};

module.exports = { sleep, retry };
