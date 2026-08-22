export interface Apartment {id:string;unitName:string;unitNumber:string;project:string;location:string;price:number;bedrooms:number;bathrooms:number;areaSqm:number;description:string;imageUrl:string;status:'available'|'reserved'|'sold';createdAt:string;updatedAt:string}
export interface ApartmentList {items:Apartment[];pagination:{page:number;limit:number;total:number;totalPages:number}}
