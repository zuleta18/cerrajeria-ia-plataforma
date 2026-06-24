import React from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Kit Multifuncional Profesional',
    price: 'Consulta el precio actual',
    image: 'https://images.unsplash.com/photo-1588628566587-bf5c464c76cb?w=400&q=80',
    amazonUrl: 'https://amzn.to/3Qiyj91'
  },
  {
    id: 2,
    name: 'Herramientas Mecánicas Antideslizantes',
    price: 'Consulta el precio actual',
    image: 'https://images.unsplash.com/photo-1621360155099-01584ea414c7?w=400&q=80',
    amazonUrl: 'https://amzn.to/4uR4YQU'
  },
  {
    id: 3,
    name: 'Kit Ganzúas de Precisión',
    price: 'Consulta el precio actual',
    image: 'https://images.unsplash.com/photo-1510657999885-3b09cedd496a?w=400&q=80',
    amazonUrl: 'https://amzn.to/4eYowye'
  }
];

export const Tienda = () => {
  return (
    <div className="p-4 max-w-md mx-auto w-full pb-8">
      <div className="flex items-center gap-2 mb-6 mt-4">
        <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
        <h2 className="text-xl font-serif text-white">Tienda de <span className="text-[#D4AF37]">Equipos</span></h2>
      </div>

      <div className="space-y-4">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-40 w-full bg-zinc-800 relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
            </div>
            
            <div className="p-4 flex flex-col gap-3 -mt-6 relative z-10">
              <h3 className="text-zinc-100 font-medium text-lg leading-tight">{product.name}</h3>
              <p className="text-[#D4AF37] font-semibold">{product.price}</p>
              
              <a 
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-4 rounded-xl transition-colors border border-zinc-700 hover:border-zinc-500"
              >
                <span className="text-sm font-medium">Ver en Amazon</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
