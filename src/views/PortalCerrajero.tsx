import React, { useState, useEffect } from 'react';
import { ViewType, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Key, MapPin, User, CheckCircle, Navigation, MessageCircle, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';

export const PortalCerrajero = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, role, userData } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [activeSolicitud, setActiveSolicitud] = useState<Solicitud | null>(null);

  useEffect(() => {
    if (!user || role !== 'Cerrajero') {
      navigate('Login');
      return;
    }

    // Listen to pending requests
    const qPending = query(
      collection(db, 'solicitudes'),
      where('estado', '==', 'pendiente')
    );

    const unsubPending = onSnapshot(qPending, (snapshot) => {
      const reqs: Solicitud[] = [];
      snapshot.forEach(doc => {
        reqs.push({ ...doc.data(), id: doc.id } as Solicitud);
      });
      setSolicitudes(reqs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });

    // Listen to my active accepted request
    const qActive = query(
      collection(db, 'solicitudes'),
      where('cerrajeroAsignadoId', '==', user.uid),
      where('estado', '==', 'aceptado')
    );

    const unsubActive = onSnapshot(qActive, (snapshot) => {
      if (!snapshot.empty) {
        setActiveSolicitud({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Solicitud);
      } else {
        setActiveSolicitud(null);
      }
    });

    return () => {
      unsubPending();
      unsubActive();
    };
  }, [user, role, navigate]);

  const handleAccept = async (solicitud: Solicitud) => {
    if (!user || activeSolicitud) return; // Only one active allowed

    try {
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        estado: 'aceptado',
        cerrajeroAsignadoId: user.uid,
        cerrajeroNombre: userData?.name || 'Cerrajero',
        cerrajeroRating: 5.0
      });
    } catch (error) {
      console.error("Error accepting request", error);
    }
  };

  const handleComplete = async () => {
    if (!activeSolicitud) return;
    try {
      await updateDoc(doc(db, 'solicitudes', activeSolicitud.id), {
        estado: 'completado'
      });
    } catch (error) {
      console.error("Error completing request", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('Inicio');
  };

  if (!user || role !== 'Cerrajero') return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 pb-20">
      <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border-b border-[#D4AF37]/20">
        <div className="flex justify-between items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-xl flex items-center justify-center">
            <Key className="w-6 h-6 text-black" />
          </div>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
        <h2 className="text-2xl font-serif text-white">Panel de Cerrajero</h2>
        <p className="text-zinc-400 text-sm mt-1">Hola, {userData?.name}</p>
      </div>

      <div className="p-4 space-y-6">
        {activeSolicitud ? (
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <h3 className="font-bold text-[#D4AF37] uppercase tracking-wider text-sm">Servicio en Curso</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase">Cliente</p>
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{activeSolicitud.clienteNombre}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase">Contacto</p>
                <p className="text-white">{activeSolicitud.clienteTelefono}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => navigate('Chat')} className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button onClick={handleComplete} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-zinc-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">Solicitudes Pendientes ({solicitudes.length})</h3>
            
            {solicitudes.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <Navigation className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No hay servicios pendientes en tu área por ahora.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map(sol => (
                  <div key={sol.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">{sol.tipoServicio}</h4>
                        <p className="text-zinc-400 text-sm mt-1">{sol.clienteNombre}</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded uppercase font-bold tracking-wider">Nueva</span>
                    </div>
                    
                    <button 
                      onClick={() => handleAccept(sol)}
                      className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aceptar Servicio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
