import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Star, Navigation, UserCircle, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { ViewType, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { calculateFreeDays } from '../utils/date';

export const CerrajeroYa = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, userData, role, isRepairingLocation, repairLocationStatus } = useAuth();
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
          where('rol', '==', 'cerrajero')
        );

        const querySnapshot = await getDocs(q);
        const allLocksmiths = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        console.log(`Documentos devueltos de Firestore (total cerrajeros):`, allLocksmiths.length);

        const normalize = (str: string) => {
          if (!str) return '';
          return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        };

        const userCountry = normalize(userData.country);
        const userCity = normalize(userData.city);

        // Helper for Haversine distance
        const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
          const parseCoord = (val: any) => {
            if (typeof val === 'string') return Number(val.replace(',', '.'));
            return Number(val);
          };
          const l1 = parseCoord(lat1);
          const ln1 = parseCoord(lon1);
          const l2 = parseCoord(lat2);
          const ln2 = parseCoord(lon2);
          if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2) || (l1===0 && ln1===0) || (l2===0 && ln2===0)) return 999;
          const R = 6371; // km
          const dLat = (l2 - l1) * Math.PI / 180;
          const dLon = (ln2 - ln1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(l1 * Math.PI / 180) * Math.cos(l2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const clampedA = Math.min(1, Math.max(0, a));
          const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1-clampedA));
          return R * c;
        };

        const userLat = userData.lat || 4.6097; // fallback to Bogota
        const userLng = userData.lng || -74.0817;

        let filteredLocksmiths = allLocksmiths.map(l => {
          let reason = [];
          
          if (userCountry && normalize(l.country) !== userCountry) reason.push('País distinto');
          if (userCity && normalize(l.city) !== userCity) reason.push('Ciudad distinta');
          
          const isPaid = l.suscripcionActiva === true || String(l.suscripcionActiva) === "true";
          const hasFreeDays = calculateFreeDays(l.registrationDate) > 0;
          if (!isPaid && !hasFreeDays) reason.push('Inactivo/Sin pago');
          
          if (l.lat === undefined || l.lng === undefined || l.lat === null || l.lng === null || l.lat === '' || l.lng === '') {
            reason.push('Sin ubicación');
          }
          
          let dist = 999;
          if (reason.length === 0) {
            dist = calculateDistance(userLat, userLng, l.lat, l.lng);
            if (dist > 20) reason.push(`Lejos (${dist.toFixed(1)}km)`);
          }
          
          return {
            ...l,
            distanceNum: dist,
            distance: dist !== 999 ? dist.toFixed(1) + ' km' : 'N/A',
            rating: 5.0,
            passed: reason.length === 0,
            reason: reason.join(', ')
          };
        });

        const withinRadius = filteredLocksmiths.filter(l => l.passed).sort((a, b) => a.distanceNum - b.distanceNum);
        console.log(`Cerrajeros activos, en misma ciudad y en un radio de 20km:`, withinRadius.length);
        
        setActiveLocksmiths(withinRadius);
      } catch (error) {
        console.error("Error fetching locksmiths:", error);
      }
    };
    
    fetchLocksmiths();
  }, [user, userData]);

  const handleSolicitar = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
        ubicacion: { lat: userData?.lat || 4.6097, lng: userData?.lng || -74.0817 }, // Fallback to mock if undefined
        tipoServicio: 'Asistencia general de cerrajería',
        estado: 'pendiente',
        cerrajeroAsignadoId: '',
        timestamp: new Date().toISOString()
      });
      sessionRequestIds.current.add(docRef.id);
    } catch (err: any) {
      console.error("Error completo al solicitar cerrajero:", err);
      setError(err.message || 'Error al solicitar cerrajero');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (solicitud) {
      const currentId = solicitud.id;
      // Optimistic update to clear UI immediately and avoid getting stuck
      setSolicitud(null);
      setSearchTimeout(false);
      sessionRequestIds.current.delete(currentId);
      
      try {
        await updateDoc(doc(db, 'solicitudes', currentId), { estado: 'cancelado' });
      } catch (err) {
        console.error("Error al cancelar en base de datos", err);
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
              disabled={loading || isRepairingLocation}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {(loading || isRepairingLocation) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              <span>{isRepairingLocation ? 'Obteniendo tu ubicación...' : (loading ? 'Solicitando...' : 'Solicitar Cerrajero')}</span>
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
                    onClick={async (e) => {
                      if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
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
