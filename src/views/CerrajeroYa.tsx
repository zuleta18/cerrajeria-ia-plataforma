import React from 'react';
import { MapPin, Star, Navigation } from 'lucide-react';
import { useConfig } from '../ConfigContext';

const LOCKSMITHS = [
  { id: 1, name: 'Juan Pérez', rating: 4.8, distance: '1.2 km' },
  { id: 2, name: 'Carlos Gomez', rating: 4.9, distance: '2.5 km' },
  { id: 3, name: 'Miguel Rojas', rating: 4.6, distance: '3.8 km' },
];

export const CerrajeroYa = () => {
  const { config } = useConfig();

  return (
    <div className="flex flex-col pb-8">
      {/* Map Simulation */}
      <div className="h-48 w-full bg-zinc-800 relative overflow-hidden border-b border-zinc-700">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at center, #D4AF37 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <MapPin className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]/20 animate-bounce" />
          <div className="w-12 h-4 bg-black/40 blur-sm rounded-[100%] mt-1"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Call to action */}
        <button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
          <Navigation className="w-5 h-5" />
          Solicitar Cerrajero
        </button>

        {/* Nearby */}
        <div>
          <h3 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">Cerrajeros Cercanos</h3>
          <div className="space-y-3">
            {LOCKSMITHS.map(locksmith => (
              <div key={locksmith.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-zinc-100 font-medium">{locksmith.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-xs text-zinc-400">{locksmith.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-zinc-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">{locksmith.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="pt-4 border-t border-zinc-800">
          <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Planes de Afiliación</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center flex flex-col justify-center">
              <span className="block text-xs text-zinc-500 mb-1">Semanal</span>
              <span className="block text-sm font-semibold text-[#D4AF37]">${config.prices.semanal.toLocaleString('es-CO')}</span>
            </div>
            <div className="bg-zinc-900 border border-[#D4AF37]/50 rounded-lg p-3 text-center flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl-sm">PRO</div>
              <span className="block text-xs text-zinc-500 mb-1">Quincenal</span>
              <span className="block text-sm font-semibold text-[#D4AF37]">${config.prices.quincenal.toLocaleString('es-CO')}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center flex flex-col justify-center">
              <span className="block text-xs text-zinc-500 mb-1">Mensual</span>
              <span className="block text-sm font-semibold text-[#D4AF37]">${config.prices.mensual.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
