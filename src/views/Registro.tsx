import React, { useState } from 'react';
import { ViewType } from '../types';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Key, User, Mail, Lock, Phone, MapPin, Globe } from 'lucide-react';

const COUNTRIES = [
  'Colombia', 'México', 'España', 'Argentina', 'Chile', 
  'Perú', 'Ecuador', 'Venezuela', 'Otros'
];

export const Registro = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [role, setRole] = useState<'Cliente' | 'Cerrajero'>('Cliente');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'usuarios', user.uid), {
        name,
        phone,
        country,
        city,
        zone: role === 'Cerrajero' ? zone : '',
        role,
        email,
        registrationDate: new Date().toISOString(),
        suscripcionActiva: false
      });
      
      navigate(role === 'Cerrajero' ? 'PortalCerrajero' : 'Inicio');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto w-full pb-8 flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-2xl flex items-center justify-center mb-6 mt-4">
        <Key className="w-8 h-8 text-black" />
      </div>
      <h2 className="text-2xl font-serif text-white mb-2 text-center">Crea tu Cuenta</h2>
      
      <div className="flex gap-4 w-full mb-6 mt-2">
        <button 
          onClick={() => setRole('Cliente')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${role === 'Cliente' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'}`}
        >
          Soy Cliente
        </button>
        <button 
          onClick={() => setRole('Cerrajero')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${role === 'Cerrajero' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'}`}
        >
          Soy Cerrajero
        </button>
      </div>

      {error && <div className="w-full bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleRegister} className="w-full space-y-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Nombre Completo</label>
          <div className="relative">
            <User className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Juan Pérez" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Correo Electrónico</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="tu@correo.com" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Número de Celular</label>
          <div className="relative">
            <Phone className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. 3001234567" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">País</label>
            <div className="relative">
              <Globe className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select required value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none appearance-none">
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Ciudad</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. Bogotá" />
            </div>
          </div>
        </div>

        {role === 'Cerrajero' && (
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Zona de Trabajo (opcional)</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={zone} onChange={e => setZone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="Ej. Norte" />
            </div>
          </div>
        )}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Contraseña</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="••••••••" />
          </div>
        </div>
        
        <button type="submit" className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all active:scale-95">
          Registrarme
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">
        ¿Ya tienes cuenta? <button onClick={() => navigate('Login')} className="text-[#D4AF37] hover:underline font-semibold">Inicia Sesión</button>
      </div>
    </div>
  );
};
