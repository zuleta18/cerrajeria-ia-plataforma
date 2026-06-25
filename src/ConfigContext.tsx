import React, { createContext, useContext, useState } from 'react';
import { AppConfig } from './types';

const defaultConfig: AppConfig = {
  youtubeLinks: [
    'https://www.youtube.com/embed/oSY_P_GyyQY',
    'https://www.youtube.com/embed/PunUmi69pFk',
    'https://www.youtube.com/embed/YNb7oIJOVpw'
  ],
  hotmartLink: 'https://go.hotmart.com/U105937574Y',
  prices: {
    semanal: 15000,
    quincenal: 25000,
    mensual: 40000
  },
  locksmiths: [
    { id: '1', name: 'Juan Pérez', phone: '3001234567', zone: 'Centro', registrationDate: new Date().toISOString(), isPaidActive: true, selectedPlan: null, rating: 4.8, distance: '1.2 km' },
    { id: '2', name: 'Carlos Gomez', phone: '3109876543', zone: 'Norte', registrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), isPaidActive: true, selectedPlan: 'mensual', rating: 4.9, distance: '2.5 km' },
    { id: '3', name: 'Miguel Rojas', phone: '3205556677', zone: 'Sur', registrationDate: new Date().toISOString(), isPaidActive: false, selectedPlan: null, rating: 4.6, distance: '3.8 km' }
  ],
  products: [
    {
      id: '1',
      name: 'Kit de Ganzúas Profesional',
      image: 'https://images.unsplash.com/photo-1588628566587-bf5c464c76cb?w=400&q=80',
      price: '$85.000 COP',
      link: 'https://mercadolibre.com.co',
      category: 'Herramientas'
    },
    {
      id: '2',
      name: 'Cerradura de Seguridad KL',
      image: 'https://images.unsplash.com/photo-1621360155099-01584ea414c7?w=400&q=80',
      price: '$120.000 COP',
      link: 'https://mercadolibre.com.co',
      category: 'Cerraduras'
    },
    {
      id: '3',
      name: 'Set de Llaves de Tubo',
      image: 'https://images.unsplash.com/photo-1510657999885-3b09cedd496a?w=400&q=80',
      price: '$60.000 COP',
      link: 'https://es.aliexpress.com',
      category: 'Herramientas'
    }
  ]
};

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: AppConfig) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {}
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('cerrajeria_ia_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed };
      } catch (e) {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('cerrajeria_ia_config', JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
