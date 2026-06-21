import React from 'react';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const Academia = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
      <GraduationCap className="w-16 h-16 text-[#D4AF37] mb-6" strokeWidth={1.5} />
      <h2 className="text-3xl font-serif mb-2 text-white">Aula <span className="text-[#D4AF37]">Virtual</span></h2>
      <p className="text-zinc-400 mb-8 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
        Accede a todos los cursos y materiales de estudio desde nuestra academia en línea.
      </p>
      
      <a 
        href="https://cerrajeria-ia-aula-virtual.vercel.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full max-w-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
      >
        <span>Ingresar a la Academia</span>
        <ExternalLink className="w-5 h-5" />
      </a>
    </div>
  );
};
