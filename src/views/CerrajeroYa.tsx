import React from 'react';
import { MapPin, Star, Navigation, UserCircle } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { ViewType } from '../types';

export const CerrajeroYa = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { config } = useConfig();

  const calculateFreeDays = (registrationDate: string) => {
    const start = new Date(registrationDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - diffDays);
  };

  const activeLocksmiths = config.locksmiths.filter(l => l.isPaidActive || calculateFreeDays(l.registrationDate) > 0);

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
          <h3 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">Cerrajeros Cercanos ({activeLocksmiths.length})</h3>
          {activeLocksmiths.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4 bg-zinc-900 border border-zinc-800 rounded-xl">No hay cerrajeros disponibles en este momento.</p>
          ) : (
            <div className="space-y-3">
              {activeLocksmiths.map(locksmith => (
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
          )}
        </div>

        {/* Portal CTA */}
        <div className="pt-4 border-t border-zinc-800">
          <button onClick={() => navigate('PortalCerrajero')} className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-zinc-800 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold rounded-xl transition-all active:scale-95">
            <UserCircle className="w-5 h-5" />
            <span>Soy Cerrajero: Únete o inicia sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
