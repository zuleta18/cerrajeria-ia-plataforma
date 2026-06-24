import React from 'react';
import { BookOpen, MapPin, ShoppingCart, Play, Key, Book } from 'lucide-react';
import { ViewType } from '../types';

export const Inicio = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  return (
    <div className="flex flex-col gap-6 p-6">
      
      <div className="p-8 bg-zinc-900/50 border border-[#D4AF37]/20 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-serif mb-2 text-white">Plataforma de <br/><span className="text-[#D4AF37]">Cerrajería</span></h2>
          <p className="text-zinc-400 max-w-lg text-sm mt-3 leading-relaxed">Tu aliado experto en seguridad y apertura. Academia, tienda y asistencia inmediata en un solo lugar.</p>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Key className="w-48 h-48 text-[#D4AF37]" strokeWidth={1} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button onClick={() => navigate('Academia')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-[#D4AF37] group transition-all cursor-pointer active:scale-95">
          <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-sm">Academia</h3>
            <p className="text-[10px] text-zinc-500">Aula Virtual</p>
          </div>
        </button>
        <button onClick={() => navigate('CerrajeroYa')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-[#D4AF37] group transition-all cursor-pointer active:scale-95">
          <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
            <MapPin className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-sm">Cerrajero Ya</h3>
            <p className="text-[10px] text-zinc-500">Asistencia Local</p>
          </div>
        </button>
        <button onClick={() => navigate('Tienda')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-[#D4AF37] group transition-all cursor-pointer active:scale-95">
          <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
            <ShoppingCart className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-sm">Tienda</h3>
            <p className="text-[10px] text-zinc-500">Herramientas Pro</p>
          </div>
        </button>
        <button onClick={() => navigate('Videos')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-[#D4AF37] group transition-all cursor-pointer active:scale-95">
          <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
            <Play className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-sm">Videos</h3>
            <p className="text-[10px] text-zinc-500">Tutoriales Paso a Paso</p>
          </div>
        </button>
        <button onClick={() => navigate('EbookPremium')} className="col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-[#D4AF37] group transition-all cursor-pointer active:scale-95">
          <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
            <Book className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-sm">Ebook Premium</h3>
            <p className="text-[10px] text-zinc-500">El Arte de la Cerrajería</p>
          </div>
        </button>
      </div>
    </div>
  );
};
