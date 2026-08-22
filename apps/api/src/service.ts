import { AppError } from './errors.js';
import type { ApartmentQuery, ApartmentRepository, NewApartment } from './types.js';

export class ApartmentService {
  constructor(private readonly repository: ApartmentRepository) {}

  async list(query: ApartmentQuery) {
    const result = await this.repository.list(query);
    return {
      ...result,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async get(id: string) {
    const apartment = await this.repository.findById(id);
    if (!apartment) {
      throw new AppError(404, 'APARTMENT_NOT_FOUND', 'Apartment was not found');
    }
    return apartment;
  }

  create(input: NewApartment) {
    return this.repository.create(input);
  }
}
