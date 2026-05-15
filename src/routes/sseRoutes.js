'use strict';

const { Router } = require('express');
const sseManager = require('../services/sse/sseManager');
const { getCached } = require('../services/financialService');

const router = Router();

router.get('/indexes', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
  });

  res.flushHeaders();

  res.write(': connected\n\n');

  const cachedData = await getCached();
  if (cachedData) {
    sseManager.sendToClient(res, 'market:indexes', cachedData);
  }

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 25000);

  sseManager.addClient(res);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

module.exports = router;
