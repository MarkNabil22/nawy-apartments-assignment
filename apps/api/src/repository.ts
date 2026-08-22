import { Pool, type QueryResultRow } from 'pg';
import type {
  Apartment,
  ApartmentQuery,
  ApartmentRepository,
  NewApartment,
} from './types.js';

const apartmentColumns = `
  id,
  unit_name AS "unitName",
  unit_number AS "unitNumber",
  project,
  location,
  price::float8 AS price,
  bedrooms,
  bathrooms,
  area_sqm AS "areaSqm",
  description,
  image_url AS "imageUrl",
  status,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export class PostgresApartmentRepository implements ApartmentRepository {
  constructor(private readonly pool: Pool) {}

  async list(query: ApartmentQuery) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const parameter = (value: unknown) => {
      values.push(value);
      return `$${values.length}`;
    };

    if (query.search) {
      const search = parameter(`%${query.search}%`);
      conditions.push(
        `(unit_name ILIKE ${search} OR unit_number ILIKE ${search} OR project ILIKE ${search})`,
      );
    }
    if (query.bedrooms !== undefined) {
      conditions.push(`bedrooms = ${parameter(query.bedrooms)}`);
    }
    if (query.minPrice !== undefined) {
      conditions.push(`price >= ${parameter(query.minPrice)}`);
    }
    if (query.maxPrice !== undefined) {
      conditions.push(`price <= ${parameter(query.maxPrice)}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM apartments ${where}`,
      values,
    );

    const limit = parameter(query.limit);
    const offset = parameter((query.page - 1) * query.limit);
    const result = await this.pool.query<Apartment & QueryResultRow>(
      `SELECT ${apartmentColumns}
       FROM apartments
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values,
    );

    return {
      items: result.rows,
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  }

  async findById(id: string) {
    const result = await this.pool.query<Apartment & QueryResultRow>(
      `SELECT ${apartmentColumns} FROM apartments WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(apartment: NewApartment) {
    const values = [
      apartment.unitName,
      apartment.unitNumber,
      apartment.project,
      apartment.location,
      apartment.price,
      apartment.bedrooms,
      apartment.bathrooms,
      apartment.areaSqm,
      apartment.description,
      apartment.imageUrl,
      apartment.status,
    ];

    const result = await this.pool.query<Apartment & QueryResultRow>(
      `INSERT INTO apartments (
         unit_name, unit_number, project, location, price, bedrooms,
         bathrooms, area_sqm, description, image_url, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${apartmentColumns}`,
      values,
    );
    return result.rows[0]!;
  }
}
