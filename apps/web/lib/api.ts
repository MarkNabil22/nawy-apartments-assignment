import type {Apartment,ApartmentList} from './types';
const api=process.env.API_INTERNAL_URL??process.env.NEXT_PUBLIC_API_URL??'http://localhost:4000/api';
async function request<T>(path:string):Promise<T>{const response=await fetch(`${api}${path}`,{next:{revalidate:30}});if(!response.ok)throw new Error(`API request failed (${response.status})`);return response.json() as Promise<T>}
export const getApartments=(search='')=>request<ApartmentList>(`/apartments${search?`?search=${encodeURIComponent(search)}`:''}`);
export const getApartment=(id:string)=>request<{item:Apartment}>(`/apartments/${id}`);
