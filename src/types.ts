export interface AppConfig {
  youtubeLinks: string[];
  hotmartLink: string;
  prices: {
    semanal: number;
    quincenal: number;
    mensual: number;
  };
}

export type ViewType = 'Inicio' | 'Academia' | 'CerrajeroYa' | 'Tienda' | 'Videos' | 'EbookPremium' | 'AdminPanel';
