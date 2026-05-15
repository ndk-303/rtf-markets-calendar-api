'use strict';

const config = require('../config');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[config.logging.level] ?? 2;

const timestamp = () => new Date().toISOString();

const format = (level, message, meta) => {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
  error: (msg, meta) => {
    if (currentLevel >= 0) console.error(format('error', msg, meta));
  },
  warn: (msg, meta) => {
    if (currentLevel >= 1) console.warn(format('warn', msg, meta));
  },
  info: (msg, meta) => {
    if (currentLevel >= 2) console.log(format('info', msg, meta));
  },
  debug: (msg, meta) => {
    if (currentLevel >= 3) console.log(format('debug', msg, meta));
  },
};

module.exports = logger;
