export type PlanType = 'semanal' | 'quincenal' | 'mensual';

export interface Locksmith {
  id: string;
  name: string;
  phone: string;
  zone: string;
  registrationDate: string; // ISO format
  isPaidActive: boolean;
  selectedPlan: PlanType | null;
  rating: number;
  distance: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  link: string;
  category: string;
}

export interface AppConfig {
  youtubeLinks: string[];
  hotmartLink: string;
  prices: {
    semanal: number;
    quincenal: number;
    mensual: number;
  };
  locksmiths: Locksmith[];
  products: Product[];
}

export type ViewType = 'Inicio' | 'Academia' | 'CerrajeroYa' | 'Tienda' | 'Videos' | 'EbookPremium' | 'AdminPanel' | 'PortalCerrajero';
