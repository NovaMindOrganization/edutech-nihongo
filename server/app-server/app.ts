import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { apiRouter } from './routes/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerSpec = JSON.parse(
  readFileSync(join(__dirname, 'docs', 'openapi.json'), 'utf-8'),
) as Record<string, unknown>;

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
