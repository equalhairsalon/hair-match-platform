export type ServiceKey = string;
export type ServiceCategoryKey = 'hair'|'nails'|'lashes'|'beauty'|string;
export type DemandStatus = 'collecting'|'matched'|'booked'|'closed';

export interface Demand {
  id: string;
  categoryKey?: ServiceCategoryKey;
  service: ServiceKey;
  serviceLabel: string;
  when: 'now'|'scheduled';
  dateText: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  lat?: number;
  lng?: number;
  notes: string;
  hairLength?: string;
  styleTags: string[];
  photoUrls: string[];
  quoteCount: number;
  status: DemandStatus;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  salon: string;
  organization?: string;
  avatar: string;
  cover: string;
  rating: number;
  reviews: number;
  completed: number;
  distanceKm: number | null;
  availableText: string;
  isAvailableNow: boolean;
  location: string;
  specialties: string[];
  categoryKeys?: string[];
  categoryLabels?: string[];
  intro: string;
  instagram: string;
  works: string[];
  services: {label:string; price:string}[];
}

export interface Quote {
  id: string;
  demandId: string;
  providerId: string;
  price: number;
  availableAt: string;
  message: string;
  included: string[];
  workImages: string[];
  createdAt: string;
}
