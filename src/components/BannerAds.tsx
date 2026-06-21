import React from 'react';

export const BannerAd = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`w-full max-w-md mx-auto h-20 bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs text-center rounded-lg ${className}`}>
      {/* // AQUÍ VA EL BANNER DE ADMOB */}
      ESPACIO PARA BANNER DE ADMOB
    </div>
  );
};
