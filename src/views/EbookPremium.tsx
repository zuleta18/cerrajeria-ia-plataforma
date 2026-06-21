import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useConfig } from '../ConfigContext';

export const EbookPremium = () => {
  const { config } = useConfig();

  return (
    <div className="flex flex-col items-center p-6 text-center max-w-md mx-auto w-full pb-8">
      <div className="w-full flex justify-center mb-8 mt-4">
        <div className="relative w-48 h-64 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 flex flex-col items-center justify-center p-4">
          {/* Ebook Graphic */}
          <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-900 rounded-lg"></div>
          <div className="absolute inset-x-0 h-1 top-0 bg-[#D4AF37] rounded-t-lg"></div>
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800/50"></div>
          
          <BookOpen className="w-12 h-12 text-[#D4AF37] mb-4 relative z-10" strokeWidth={1} />
          <h2 className="text-xl font-bold text-white leading-tight uppercase relative z-10 font-serif tracking-wider">
            El Arte de la
          </h2>
          <h2 className="text-xl font-bold text-[#D4AF37] leading-tight uppercase relative z-10 font-serif tracking-wider mb-2">
            Cerrajería
          </h2>
          <span className="text-[10px] text-zinc-400 mt-4 relative z-10 tracking-widest uppercase">Edición Premium</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-zinc-100 mb-2">Dominio Absoluto</h2>
      <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
        Descubre los secretos mejor guardados y conviértete en un maestro de la cerrajería con nuestra guía definitiva. Más de 200 páginas de contenido exclusivo.
      </p>

      <ul className="text-left w-full space-y-3 mb-8">
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <span className="text-sm text-zinc-300">Técnicas avanzadas de apertura sin daño</span>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <span className="text-sm text-zinc-300">Identificación y bypass de sistemas de alta seguridad</span>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <span className="text-sm text-zinc-300">Gana dinero rápido con servicios de urgencia</span>
        </li>
      </ul>
      
      <a 
        href={config.hotmartLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-[#F34F29] hover:bg-[#D93F19] text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#F34F29]/20"
      >
        <span>Comprar en Hotmart</span>
        <ExternalLink className="w-5 h-5" />
      </a>
      
      <p className="text-xs text-zinc-600 mt-4 flex items-center gap-1">
        Compra segura y garantizada
      </p>
    </div>
  );
};
