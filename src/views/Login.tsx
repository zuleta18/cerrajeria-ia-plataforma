import React, { useState } from 'react';
import { ViewType } from '../types';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Key, User, Mail, Lock } from 'lucide-react';

export const Login = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Auto-repair logic
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log("Cuenta huérfana detectada, creando documento en Firestore...");
        try {
          await setDoc(userDocRef, {
            name: '',
            phone: '',
            country: '',
            city: '',
            zone: '',
            rol: 'cliente', // Por defecto
            email: user.email || email,
            lat: 0,
            lng: 0,
            registrationDate: serverTimestamp(),
            suscripcionActiva: false
          });
        } catch (firestoreErr: any) {
          console.error("Error reparando cuenta huérfana:", firestoreErr);
        }
      }

      navigate('Inicio');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage('');
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.');
      setResetEmail('');
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setResetError('El correo electrónico no es válido.');
      } else if (err.code === 'auth/user-not-found') {
        setResetError('No hay un usuario registrado con este correo.');
      } else {
        setResetError('Ocurrió un error al intentar restablecer la contraseña.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (showReset) {
    return (
      <div className="p-6 max-w-md mx-auto w-full pb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-2xl flex items-center justify-center mb-6 mt-4">
          <Key className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2 text-center">Recuperar Contraseña</h2>
        <p className="text-zinc-400 text-sm mb-8 text-center">Ingresa tu correo para recibir un enlace de recuperación</p>

        {resetMessage && <div className="w-full bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded-lg text-sm mb-4">{resetMessage}</div>}
        {resetError && <div className="w-full bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-4">{resetError}</div>}

        <form onSubmit={handleResetPassword} className="w-full space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none" placeholder="tu@correo.com" />
            </div>
          </div>
          
          <button type="submit" disabled={isResetting} className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50">
            {isResetting ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <button onClick={() => { setShowReset(false); setResetMessage(''); setResetError(''); }} className="mt-6 text-zinc-400 text-sm hover:text-white transition-colors">
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

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

      <button onClick={() => setShowReset(true)} className="mt-4 text-[#D4AF37] text-sm hover:underline">
        ¿Olvidaste tu contraseña?
      </button>

      <div className="mt-6 text-center text-sm text-zinc-400">
        ¿No tienes cuenta? <button onClick={() => navigate('Registro')} className="text-[#D4AF37] hover:underline font-semibold">Regístrate aquí</button>
      </div>
    </div>
  );
};
