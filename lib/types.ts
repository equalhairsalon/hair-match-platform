export type ServiceKey = 'wash'|'cut'|'color'|'perm'|'care'|'style';
export type DemandStatus = 'collecting'|'matched'|'booked'|'closed';

export interface Demand {
  id: string;
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
  hairLength: string;
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
  avatar: string;
  cover: string;
  rating: number;
  reviews: number;
  completed: number;
  distanceKm: number;
  availableText: string;
  isAvailableNow: boolean;
  location: string;
  specialties: string[];
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
