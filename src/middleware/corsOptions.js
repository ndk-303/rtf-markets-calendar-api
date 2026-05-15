'use strict';

const config = require('../config');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = config.cors.origins;
    if (allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true,
  maxAge: 86400,
};

module.exports = corsOptions;
