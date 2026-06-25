import React, { useState, useEffect } from 'react';
import { MapPin, Star, Navigation, UserCircle, Loader2, MessageCircle } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { ViewType, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export const CerrajeroYa = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { config } = useConfig();
  const { user, userData, role } = useAuth();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen to active request
  useEffect(() => {
    if (!user || role !== 'Cliente') return;

    const q = query(
      collection(db, 'solicitudes'),
      where('clienteId', '==', user.uid),
      where('estado', 'in', ['pendiente', 'aceptado'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as Solicitud;
        setSolicitud({ ...docData, id: snapshot.docs[0].id });
      } else {
        setSolicitud(null);
      }
    });

    return () => unsubscribe();
  }, [user, role]);

  const handleSolicitar = async () => {
    if (!user) {
      navigate('Login');
      return;
    }
    
    if (role !== 'Cliente') {
      setError('Solo los clientes pueden solicitar servicios desde aquí.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'solicitudes'), {
        clienteId: user.uid,
        clienteNombre: userData?.name || 'Cliente',
        clienteTelefono: userData?.phone || '',
        ubicacion: { lat: 4.6097, lng: -74.0817 }, // Mock location
        tipoServicio: 'Asistencia general de cerrajería',
        estado: 'pendiente',
        cerrajeroAsignadoId: '',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Error al solicitar cerrajero');
    } finally {
      setLoading(false);
    }
  };

  const calculateFreeDays = (registrationDate: string) => {
    const start = new Date(registrationDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - diffDays);
  };

  const activeLocksmiths = config.locksmiths.filter(l => l.isPaidActive || calculateFreeDays(l.registrationDate) > 0);

  return (
    <div className="flex flex-col pb-8">
      {/* Map Simulation */}
      <div className="h-48 w-full bg-zinc-800 relative overflow-hidden border-b border-zinc-700">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at center, #D4AF37 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <MapPin className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]/20 animate-bounce" />
          <div className="w-12 h-4 bg-black/40 blur-sm rounded-[100%] mt-1"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

        {!solicitud && (
          <>
            <button 
              onClick={handleSolicitar}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              {loading ? 'Solicitando...' : 'Solicitar Cerrajero'}
            </button>

            <div>
              <h3 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">Cerrajeros Cercanos ({activeLocksmiths.length})</h3>
              {activeLocksmiths.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4 bg-zinc-900 border border-zinc-800 rounded-xl">No hay cerrajeros disponibles en este momento.</p>
              ) : (
                <div className="space-y-3">
                  {activeLocksmiths.map(locksmith => (
                    <div key={locksmith.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-zinc-100 font-medium">{locksmith.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                          <span className="text-xs text-zinc-400">{locksmith.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{locksmith.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {!user && (
              <div className="pt-4 border-t border-zinc-800">
                <button onClick={() => navigate('Registro')} className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-zinc-800 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold rounded-xl transition-all active:scale-95">
                  <UserCircle className="w-5 h-5" />
                  <span>Soy Cerrajero: Únete o inicia sesión</span>
                </button>
              </div>
            )}
          </>
        )}

        {solicitud && solicitud.estado === 'pendiente' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Buscando cerrajero...</h3>
            <p className="text-zinc-400 text-sm">Estamos notificando a los cerrajeros más cercanos a tu ubicación.</p>
          </div>
        )}

        {solicitud && solicitud.estado === 'aceptado' && (
          <div className="bg-zinc-900 border border-[#D4AF37]/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] opacity-10 rounded-bl-[100px]"></div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-full flex items-center justify-center mb-4 relative z-10">
              <UserCircle className="w-10 h-10 text-black" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">¡Cerrajero en camino!</h3>
            <p className="text-zinc-400 text-sm mb-6">Tu experto llegará pronto.</p>
            
            <div className="w-full bg-zinc-800/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Asignado a</p>
              <h4 className="text-lg font-bold text-white">{solicitud.cerrajeroNombre || 'Cerrajero'}</h4>
              {solicitud.cerrajeroRating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-sm text-zinc-300">{solicitud.cerrajeroRating}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate('Chat')}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-4 rounded-xl transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Abrir Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
