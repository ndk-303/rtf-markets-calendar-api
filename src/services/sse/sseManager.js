'use strict';

const logger = require('../../utils/logger');

const clients = new Map();
let clientIdCounter = 0;

const addClient = (res) => {
  const id = ++clientIdCounter;
  clients.set(id, res);
  logger.info('[sse] Client connected', { id, total: clients.size });

  res.on('close', () => {
    clients.delete(id);
    logger.info('[sse] Client disconnected', { id, total: clients.size });
  });

  return id;
};

const broadcast = (event, data) => {
  if (clients.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const [id, res] of clients) {
    try {
      res.write(payload);
    } catch (err) {
      logger.warn('[sse] Failed to write to client, removing', {
        id,
        error: err.message,
      });
      clients.delete(id);
    }
  }

  logger.debug('[sse] Broadcast', { event, clientCount: clients.size });
};

const sendToClient = (res, event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  res.write(payload);
};

const getClientCount = () => clients.size;

const closeAll = () => {
  for (const [, res] of clients) {
    try {
      res.end();
    } catch (_) {}
  }
  clients.clear();
  logger.info('[sse] All clients closed');
};

module.exports = { addClient, broadcast, sendToClient, getClientCount, closeAll };
