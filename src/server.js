'use strict';

require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
const createApp = require('./app');
const redisClient = require('./services/cache/redisClient');
const fetchScheduler = require('./services/scheduler/fetchScheduler');
const sseManager = require('./services/sse/sseManager');

const bootstrap = async () => {
  await redisClient.connect();

  await fetchScheduler.start();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`[server] Listening on port ${config.port}`, {
      env: config.env,
      fetchInterval: config.scheduler.fetchInterval,
    });
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  const shutdown = async (signal) => {
    logger.info(`[server] ${signal} received - graceful shutdown`);

    fetchScheduler.stop();
    sseManager.closeAll();

    server.close(async () => {
      logger.info('[server] HTTP server closed');
      await redisClient.disconnect();
      logger.info('[server] Shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('[server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('[server] Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('[server] Unhandled rejection', { reason: String(reason) });
  });
};

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
