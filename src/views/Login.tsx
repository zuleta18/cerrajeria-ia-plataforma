import React, { useState } from 'react';
import { ViewType } from '../types';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Key, User, Mail, Lock } from 'lucide-react';

export const Login = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('Inicio');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto w-full pb-8 flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-2xl flex items-center justify-center mb-6 mt-4">
        <Key className="w-8 h-8 text-black" />
      </div>
      <h2 className="text-2xl font-serif text-white mb-2 text-center">Inicia Sesión</h2>
      <p className="text-zinc-400 text-sm mb-8 text-center">Bienvenido de vuelta a La Llave del Éxito</p>

      {error && <div className="w-full bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Correo Electrónico</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="tu@correo.com" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Contraseña</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="••••••••" />
          </div>
        </div>
        
        <button type="submit" className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all active:scale-95">
          Ingresar
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">
        ¿No tienes cuenta? <button onClick={() => navigate('Registro')} className="text-[#D4AF37] hover:underline font-semibold">Regístrate aquí</button>
      </div>
    </div>
  );
};
