'use strict';

const { Router } = require('express');
const { getCached, fetchAndCache } = require('../services/financialService');

const router = Router();

router.get('/indexes', async (req, res, next) => {
  try {
    let data = await getCached();

    if (!data) {
      data = await fetchAndCache();
    }

    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Market data temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      updatedAt: data.fetchedAt,
      data: data.indexes,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
