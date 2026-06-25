import React from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { useConfig } from '../ConfigContext';

export const Tienda = () => {
  const { config } = useConfig();

  return (
    <div className="p-4 max-w-md mx-auto w-full pb-8">
      <div className="flex items-center gap-2 mb-6 mt-4">
        <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
        <h2 className="text-xl font-serif text-white">Tienda de <span className="text-[#D4AF37]">Equipos</span></h2>
      </div>

      <div className="space-y-4">
        {config.products?.map(product => (
          <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-40 w-full bg-zinc-800 relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
              {product.category && (
                <span className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {product.category}
                </span>
              )}
            </div>
            
            <div className="p-4 flex flex-col gap-3 -mt-6 relative z-10">
              <h3 className="text-zinc-100 font-medium text-lg leading-tight">{product.name}</h3>
              <p className="text-[#D4AF37] font-semibold">{product.price}</p>
              
              <a 
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-4 rounded-xl transition-colors border border-zinc-700 hover:border-zinc-500"
              >
                <span className="text-sm font-medium">Comprar producto</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
        {(!config.products || config.products.length === 0) && (
          <p className="text-zinc-500 text-sm text-center py-8">No hay productos disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};
