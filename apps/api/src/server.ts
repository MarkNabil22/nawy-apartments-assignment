import 'dotenv/config';
import { Pool } from 'pg';
import { createApp } from './app.js';
import { PostgresApartmentRepository } from './repository.js';
import { ApartmentService } from './service.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 4000);
const repository = new PostgresApartmentRepository(pool);
const service = new ApartmentService(repository);
const app = createApp(service);

const server = app.listen(port, () => {
  console.log(`API listening on ${port}`);
});

const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
