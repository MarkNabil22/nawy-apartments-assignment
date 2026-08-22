import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './errors.js';
import type { ApartmentService } from './service.js';
import {
  createApartmentSchema,
  idSchema,
  listQuerySchema,
} from './validation.js';

export function createApp(service: ApartmentService) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/apartments', async (request, response, next) => {
    try {
      const query = listQuerySchema.parse(request.query);
      response.json(await service.list(query));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/apartments/:id', async (request, response, next) => {
    try {
      const id = idSchema.parse(request.params.id);
      response.json({ item: await service.get(id) });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/apartments', async (request, response, next) => {
    try {
      const apartment = createApartmentSchema.parse(request.body);
      response.status(201).json({ item: await service.create(apartment) });
    } catch (error) {
      next(error);
    }
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
