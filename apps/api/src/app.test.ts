import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { ApartmentService } from './service.js';
import type {
  Apartment,
  ApartmentQuery,
  ApartmentRepository,
  NewApartment,
} from './types.js';

const sample: Apartment = {
  id: '11a11111-1111-4111-8111-111111111111',
  unitName: 'Palm Residence',
  unitNumber: 'PW-101',
  project: 'Palm Hills',
  location: 'New Cairo',
  price: 8_500_000,
  bedrooms: 3,
  bathrooms: 3,
  areaSqm: 185,
  description: 'A bright apartment overlooking landscaped gardens.',
  imageUrl: 'https://example.com/apartment.jpg',
  status: 'available',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

class MemoryApartmentRepository implements ApartmentRepository {
  private readonly apartments = [sample];

  async list(query: ApartmentQuery) {
    const search = query.search?.toLowerCase();
    const items = search
      ? this.apartments.filter((apartment) =>
          [apartment.unitName, apartment.unitNumber, apartment.project].some(
            (field) => field.toLowerCase().includes(search),
          ),
        )
      : this.apartments;
    return { items, total: items.length };
  }

  async findById(id: string) {
    return this.apartments.find((apartment) => apartment.id === id) ?? null;
  }

  async create(input: NewApartment) {
    const apartment = {
      ...input,
      id: '22a22222-2222-4222-8222-222222222222',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    this.apartments.push(apartment);
    return apartment;
  }
}

describe('apartments HTTP API', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createApp(
      new ApartmentService(new MemoryApartmentRepository()),
    ).listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Test server did not bind to a TCP port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it('lists and searches apartments with pagination metadata', async () => {
    const response = await fetch(`${baseUrl}/api/apartments?search=PW-101`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.pagination).toMatchObject({ page: 1, total: 1, totalPages: 1 });
  });

  it('returns an apartment by id', async () => {
    const response = await fetch(`${baseUrl}/api/apartments/${sample.id}`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.item.unitNumber).toBe('PW-101');
  });

  it('creates a valid apartment', async () => {
    const { id, createdAt, updatedAt, ...input } = sample;
    void id;
    void createdAt;
    void updatedAt;
    const response = await fetch(`${baseUrl}/api/apartments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...input, unitNumber: 'PW-102' }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.item.unitNumber).toBe('PW-102');
  });

  it('returns field-level validation errors', async () => {
    const response = await fetch(`${baseUrl}/api/apartments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ unitName: '' }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.fieldErrors).toHaveProperty('unitName');
  });

  it('rejects malformed ids before querying the repository', async () => {
    const response = await fetch(`${baseUrl}/api/apartments/not-a-uuid`);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
