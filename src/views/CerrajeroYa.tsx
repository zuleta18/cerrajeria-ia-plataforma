import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Star, Navigation, UserCircle, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { ViewType, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { calculateFreeDays } from '../utils/date';

export const CerrajeroYa = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, userData, role } = useAuth();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeLocksmiths, setActiveLocksmiths] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState(false);
  const sessionRequestIds = useRef<Set<string>>(new Set());

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
        const acceptedDoc = snapshot.docs.find(d => d.data().estado === 'aceptado');
        if (acceptedDoc) {
          setSolicitud({ ...acceptedDoc.data(), id: acceptedDoc.id } as Solicitud);
        } else {
          const pendingSessionDoc = snapshot.docs.find(d => d.data().estado === 'pendiente' && sessionRequestIds.current.has(d.id));
          if (pendingSessionDoc) {
            setSolicitud({ ...pendingSessionDoc.data(), id: pendingSessionDoc.id } as Solicitud);
          } else {
            setSolicitud(null);
          }
        }
      } else {
        setSolicitud(null);
      }
    });

    return () => unsubscribe();
  }, [user, role]);

  useEffect(() => {
    let timer: any;
    if (solicitud && solicitud.estado === 'pendiente') {
      setSearchTimeout(false);
      timer = setTimeout(() => {
        setSearchTimeout(true);
      }, 10000);
    } else {
      setSearchTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [solicitud]);

  // Fetch nearby locksmiths based on country and city
  useEffect(() => {
    if (!user || !userData?.country) return;

    const fetchLocksmiths = async () => {
      try {
        let q = query(
          collection(db, 'usuarios'),
          where('rol', '==', 'cerrajero'),
          where('country', '==', userData.country)
        );

        const querySnapshot = await getDocs(q);
        let locksmiths = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // Filter by city if available, otherwise just keep country filter
        if (userData.city) {
          const sameCity = locksmiths.filter(l => l.city?.toLowerCase() === userData.city?.toLowerCase());
          if (sameCity.length > 0) {
            locksmiths = sameCity;
          }
        }
        
        // Filter only active subscriptions (or free days)
        const active = locksmiths.filter(l => {
          if (l.suscripcionActiva) return true;
          return calculateFreeDays(l.registrationDate) > 0;
        });

        // Mock distance
        const withDistance = active.map(l => ({
          ...l,
          distance: (Math.random() * 5 + 1).toFixed(1) + ' km',
          rating: 5.0
        })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        
        setActiveLocksmiths(withDistance);
      } catch (error) {
        console.error("Error fetching locksmiths:", error);
      }
    };
    
    fetchLocksmiths();
  }, [user, userData]);

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
      const docRef = await addDoc(collection(db, 'solicitudes'), {
        clienteId: user.uid,
        clienteNombre: userData?.name || 'Cliente',
        clienteTelefono: userData?.phone || '',
        ubicacion: { lat: 4.6097, lng: -74.0817 }, // Mock location
        tipoServicio: 'Asistencia general de cerrajería',
        estado: 'pendiente',
        cerrajeroAsignadoId: '',
        timestamp: new Date().toISOString()
      });
      sessionRequestIds.current.add(docRef.id);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar cerrajero');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (solicitud) {
      try {
        await updateDoc(doc(db, 'solicitudes', solicitud.id), { estado: 'cancelado' });
      } catch (err) {
        console.error("Error al cancelar en base de datos", err);
      } finally {
        setSolicitud(null);
        setSearchTimeout(false);
        sessionRequestIds.current.delete(solicitud.id);
      }
    }
  };

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
                <p className="text-zinc-500 text-sm text-center py-4 bg-zinc-900 border border-zinc-800 rounded-xl">No hay cerrajeros disponibles en tu zona por el momento.</p>
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
            {searchTimeout ? (
              <>
                <XCircle className="w-12 h-12 text-zinc-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sin respuesta</h3>
                <p className="text-zinc-400 text-sm mb-6">No hay cerrajeros disponibles en tu zona por el momento.</p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={handleCancelar}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all border border-zinc-700"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={async () => {
                      await handleCancelar();
                      handleSolicitar();
                    }}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 rounded-xl transition-all"
                  >
                    Reintentar
                  </button>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Buscando cerrajero...</h3>
                <p className="text-zinc-400 text-sm mb-6">Estamos notificando a los cerrajeros más cercanos a tu ubicación.</p>
                <button 
                  onClick={handleCancelar}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar búsqueda
                </button>
              </>
            )}
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
