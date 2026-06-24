import React from 'react';
import { PlayCircle } from 'lucide-react';
import { useConfig } from '../ConfigContext';

export const Videos = () => {
  const { config } = useConfig();

  return (
    <div className="p-4 max-w-md mx-auto w-full pb-8">
      <div className="flex items-center gap-2 mb-6 mt-4">
        <PlayCircle className="w-6 h-6 text-[#D4AF37]" />
        <h2 className="text-xl font-serif text-white">Videos <span className="text-[#D4AF37]">Destacados</span></h2>
      </div>

      <div className="space-y-6">
        {config.youtubeLinks.map((url, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className={`w-full bg-black ${url.includes('OXRP1KPZvYg') || idx === 2 ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'}`}>
              {url ? (
                <iframe 
                  className="w-full h-full"
                  src={url} 
                  title={`YouTube video ${idx + 1}`} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                  <PlayCircle className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Enlace no configurado</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-zinc-200 font-medium text-sm">Contenido Educativo #{idx + 1}</h3>
              <p className="text-zinc-500 text-xs mt-1">Aprende técnicas profesionales de cerrajería en este video actualizado.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
