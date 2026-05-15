'use strict';

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal Server Error';

  logger.error('[errorHandler]', {
    status,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
