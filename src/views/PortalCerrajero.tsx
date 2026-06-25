import React, { useState, useEffect } from 'react';
import { useConfig } from '../ConfigContext';
import { Locksmith, PlanType } from '../types';
import { Key, User, Phone, MapPin, CheckCircle, ExternalLink } from 'lucide-react';

export const PortalCerrajero = () => {
  const { config, updateConfig } = useConfig();
  const [currentUser, setCurrentUser] = useState<Locksmith | null>(null);
  const [view, setView] = useState<'register' | 'plans' | 'payment'>('register');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('');

  useEffect(() => {
    const savedId = localStorage.getItem('cerrajeria_ia_current_locksmith');
    if (savedId) {
      const user = config.locksmiths.find(l => l.id === savedId);
      if (user) {
        setCurrentUser(user);
        setView('plans');
      }
    }
  }, [config.locksmiths]);

  const calculateFreeDays = (registrationDate: string) => {
    const start = new Date(registrationDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - diffDays);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newLocksmith: Locksmith = {
      id: Date.now().toString(),
      name,
      phone,
      zone,
      registrationDate: new Date().toISOString(),
      isPaidActive: false,
      selectedPlan: null,
      rating: 5.0,
      distance: (Math.random() * 5 + 1).toFixed(1) + ' km'
    };

    updateConfig({
      ...config,
      locksmiths: [...config.locksmiths, newLocksmith]
    });
    localStorage.setItem('cerrajeria_ia_current_locksmith', newLocksmith.id);
    setCurrentUser(newLocksmith);
    setView('plans');
  };

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setView('payment');
    
    if (currentUser) {
      const updatedUser = { ...currentUser, selectedPlan: plan };
      setCurrentUser(updatedUser);
      const updatedLocksmiths = config.locksmiths.map(l => l.id === currentUser.id ? updatedUser : l);
      updateConfig({ ...config, locksmiths: updatedLocksmiths });
    }
  };

  const getPlanPrice = (plan: PlanType) => {
    return config.prices[plan].toLocaleString('es-CO');
  };

  const freeDays = currentUser ? calculateFreeDays(currentUser.registrationDate) : 0;

  if (view === 'register') {
    return (
      <div className="p-6 max-w-md mx-auto w-full pb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-2xl flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2 text-center">Portal para <span className="text-[#D4AF37]">Cerrajeros</span></h2>
        <p className="text-zinc-400 text-sm mb-8 text-center">Únete a nuestra red de profesionales y recibe solicitudes de clientes en tu zona.</p>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Nombre Completo</label>
            <div className="relative">
              <User className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. Juan Pérez" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Número de Celular</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. 3001234567" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Ciudad / Zona de Trabajo</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="text" value={zone} onChange={e => setZone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. Bogotá - Norte" />
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all active:scale-95">
            Registrarme Gratis
          </button>
        </form>
      </div>
    );
  }

  if (view === 'plans') {
    return (
      <div className="p-4 max-w-md mx-auto w-full pb-8">
        <h2 className="text-2xl font-serif text-white mb-2 text-center mt-4">Hola, <span className="text-[#D4AF37]">{currentUser?.name}</span></h2>
        
        <div className="bg-zinc-900 border border-[#D4AF37]/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-zinc-300">
            Los primeros <strong className="text-[#D4AF37]">3 meses</strong> son completamente gratis para cerrajeros registrados. Después de ese periodo, elige tu plan preferido.
          </p>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Periodo de Prueba</span>
            <p className="text-2xl font-bold text-white mt-1">{freeDays} <span className="text-sm font-normal text-zinc-400">días restantes</span></p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-4">Elige tu plan</h3>
        <div className="space-y-4">
          {(['semanal', 'quincenal', 'mensual'] as PlanType[]).map(plan => (
            <div key={plan} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center text-center">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">{plan}</h4>
              <p className="text-3xl font-bold text-[#D4AF37] mb-4">${getPlanPrice(plan)} <span className="text-sm text-zinc-500 font-normal">COP</span></p>
              <button onClick={() => handleSelectPlan(plan)} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl border border-zinc-700 transition-colors">
                Elegir este plan
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'payment' && selectedPlan) {
    const whatsappMsg = `Hola, soy ${currentUser?.name}, acabo de transferir el pago de mi plan ${selectedPlan} de CerrajeríaIA. Adjunto mi comprobante.`;
    const whatsappUrl = `https://wa.me/573026437096?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="p-4 max-w-md mx-auto w-full pb-8">
        <button onClick={() => setView('plans')} className="text-zinc-500 text-sm mb-4 hover:text-white">&larr; Volver a planes</button>
        
        <div className="bg-zinc-900 border border-[#D4AF37] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] opacity-5 rounded-bl-[100px]"></div>
          
          <h2 className="text-xl font-serif text-white mb-6">Activar plan <span className="text-[#D4AF37] uppercase">{selectedPlan}</span></h2>
          
          <div className="space-y-4 mb-8 relative z-10">
            <p className="text-sm text-zinc-300 font-medium">Para activar tu plan, sigue estos pasos:</p>
            <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-400">
              <li>Transfiere <strong className="text-[#D4AF37]">${getPlanPrice(selectedPlan)} COP</strong> al número de Nequi: <strong className="text-white">302 643 7096</strong></li>
              <li>Envía el comprobante de pago por WhatsApp al mismo número.</li>
              <li>Tu plan se activará en menos de 24 horas después de confirmar tu pago.</li>
            </ol>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-95">
            <CheckCircle className="w-5 h-5" />
            <span>Enviar comprobante por WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return null;
};
