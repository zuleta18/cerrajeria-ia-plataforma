import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-[#D4AF37]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-[#D4AF37]/10 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <h2 className="text-xl font-serif font-bold text-white">⚠️ Aviso Importante</h2>
          
          <p className="text-sm text-zinc-300 leading-relaxed">
            Todo el contenido educativo, técnicas y material mostrado en esta plataforma tiene fines exclusivamente educativos y de formación profesional en el oficio de la cerrajería. La Llave del Éxito no se hace responsable por el uso indebido, ilegal o diferente al educativo que el usuario o estudiante le dé a esta información. Al continuar, usted declara que utilizará este conocimiento de manera ética, legal y responsable.
          </p>

          <button
            onClick={handleAccept}
            className="mt-4 w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 px-4 rounded-xl transition-colors uppercase tracking-wider text-sm"
          >
            Entiendo y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};
