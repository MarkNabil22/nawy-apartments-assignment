export type ApartmentStatus = 'available' | 'reserved' | 'sold';

export interface Apartment {
  id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  description: string;
  imageUrl: string;
  status: ApartmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type NewApartment = Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'>;

export interface ApartmentQuery {
  search?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface ApartmentRepository {
  list(query: ApartmentQuery): Promise<{ items: Apartment[]; total: number }>;
  findById(id: string): Promise<Apartment | null>;
  create(input: NewApartment): Promise<Apartment>;
}
