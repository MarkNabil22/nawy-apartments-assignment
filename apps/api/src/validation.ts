import { z } from 'zod';

const money = z.coerce.number().int().positive().max(1_000_000_000);
export const idSchema = z.string().uuid();

export const listQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  minPrice: money.optional(),
  maxPrice: money.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
}).refine(
  ({ minPrice, maxPrice }) => minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
  { message: 'minPrice must not exceed maxPrice', path: ['minPrice'] },
);

export const createApartmentSchema = z.object({
  unitName: z.string().trim().min(2).max(120),
  unitNumber: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9-]+$/),
  project: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(160),
  price: money,
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(20),
  areaSqm: z.number().int().positive().max(10_000),
  description: z.string().trim().min(20).max(2_000),
  imageUrl: z.url().max(1_000),
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
}).strict();
