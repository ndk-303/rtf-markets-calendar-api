'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const corsOptions = require('./middleware/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const healthRoutes = require('./routes/healthRoutes');
const marketRoutes = require('./routes/marketRoutes');
const sseRoutes = require('./routes/sseRoutes');

const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    })
  );
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));

  // Cấu hình Rate Limiting (Chống DDoS & Spam)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', limiter);

  app.use('/', healthRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/sse', sseRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
