'use strict';

const { Router } = require('express');
const redisClient = require('../services/cache/redisClient');
const sseManager = require('../services/sse/sseManager');

const router = Router();

router.get('/health', async (req, res) => {
  const redisOk = redisClient.isReady();

  const status = {
    status: redisOk ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      redis: redisOk ? 'connected' : 'disconnected',
      sse: { clients: sseManager.getClientCount() },
    },
    memory: process.memoryUsage(),
  };

  res.status(redisOk ? 200 : 207).json(status);
});

module.exports = router;
