import React, { createContext, useContext, useState } from 'react';
import { AppConfig } from './types';

const defaultConfig: AppConfig = {
  youtubeLinks: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/tgbNymZ7vqY'
  ],
  hotmartLink: 'https://hotmart.com/es',
  prices: {
    semanal: 15000,
    quincenal: 25000,
    mensual: 40000
  }
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
        return JSON.parse(saved);
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
