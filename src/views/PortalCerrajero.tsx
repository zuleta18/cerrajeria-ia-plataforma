import React, { useState, useEffect } from 'react';
import { ViewType, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Key, MapPin, User, CheckCircle, Navigation, MessageCircle, LogOut, CreditCard } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { PayPalButton } from '../components/PayPalButton';
import { calculateFreeDays } from '../utils/date';

export const PortalCerrajero = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, role, userData } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [activeSolicitud, setActiveSolicitud] = useState<Solicitud | null>(null);
  const [activeTab, setActiveTab] = useState<'servicios' | 'suscripcion'>('servicios');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    if (!user || activeSolicitud) return;

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

  const isColombia = userData?.country === 'Colombia';
  const freeDays = userData?.registrationDate ? calculateFreeDays(userData.registrationDate) : 0;
  const isSubscribed = userData?.suscripcionActiva || false;
  const canAccessServices = isSubscribed || freeDays > 0;

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
        
        <div className="flex mt-6 gap-2 bg-zinc-900 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('servicios')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'servicios' ? 'bg-[#D4AF37] text-black' : 'text-zinc-400'}`}
          >
            Servicios
          </button>
          <button 
            onClick={() => setActiveTab('suscripcion')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'suscripcion' ? 'bg-[#D4AF37] text-black' : 'text-zinc-400'}`}
          >
            Suscripción
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'suscripcion' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <CreditCard className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <h3 className="font-bold text-white text-lg">Estado de tu cuenta</h3>
              {isSubscribed ? (
                <p className="text-[#D4AF37] mt-2 font-semibold">✅ Suscripción Activa</p>
              ) : freeDays > 0 ? (
                <p className="text-zinc-400 mt-2">Tienes <strong className="text-[#D4AF37]">{freeDays} días de prueba</strong> restantes.</p>
              ) : (
                <p className="text-red-400 mt-2">Tu periodo de prueba ha expirado. Necesitas una suscripción activa para recibir servicios.</p>
              )}
            </div>

            {paymentSuccess ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-green-500 font-bold mb-2">¡Pago en proceso!</h3>
                <p className="text-zinc-300 text-sm">Una vez completado el pago, tu suscripción será activada en menos de 24 horas tras verificación manual.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-[#D4AF37] font-bold text-center uppercase tracking-widest text-sm">Elige tu Plan</h3>
                
                {isColombia ? (
                  // NEQUI FLOW
                  <div className="space-y-4">
                    {[{
                      id: 'semanal', name: 'Plan Semanal', price: '$15.000 COP'
                    }, {
                      id: 'quincenal', name: 'Plan Quincenal', price: '$25.000 COP'
                    }, {
                      id: 'mensual', name: 'Plan Mensual', price: '$40.000 COP'
                    }].map(plan => (
                      <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                          <span className="text-[#D4AF37] font-bold">{plan.price}</span>
                        </div>
                        <div className="text-zinc-400 text-sm mb-4">
                          <p>Transfiere el valor exacto a la cuenta Nequi:</p>
                          <p className="text-white font-mono text-lg mt-1 bg-black p-2 rounded">300 123 4567</p>
                        </div>
                        <button 
                          onClick={() => setPaymentSuccess(true)}
                          className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 rounded-lg transition-all"
                        >
                          Ya realicé el pago
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  // PAYPAL FLOW
                  <div className="space-y-4">
                    {[{
                      id: 'semanal', name: 'Plan Semanal', price: '$4.99 USD', paypalId: 'J8RZFFTR6WKGN'
                    }, {
                      id: 'quincenal', name: 'Plan Quincenal', price: '$7.99 USD', paypalId: 'QTYPYUT82RA9U'
                    }, {
                      id: 'mensual', name: 'Plan Mensual', price: '$11.99 USD', paypalId: 'LK6RWJHWGTLCS'
                    }].map(plan => (
                      <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                          <span className="text-[#D4AF37] font-bold">{plan.price}</span>
                        </div>
                        <div className="bg-white rounded-lg p-2 flex items-center justify-center min-h-[50px] relative z-0">
                           <div onClick={() => { setTimeout(() => setPaymentSuccess(true), 3000) }} className="w-full relative z-10">
                             <PayPalButton hostedButtonId={plan.paypalId} />
                           </div>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 text-center">Haz clic en el botón de arriba y luego avísanos.</p>
                        <button 
                          onClick={() => setPaymentSuccess(true)}
                          className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-lg transition-all text-sm"
                        >
                          Notificar pago completado
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'servicios' && (
          <div>
            {!canAccessServices ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <Navigation className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 mb-4">No puedes recibir servicios porque no tienes una suscripción activa ni días de prueba.</p>
                <button onClick={() => setActiveTab('suscripcion')} className="bg-[#D4AF37] text-black font-bold py-2 px-6 rounded-lg">
                  Ver Planes
                </button>
              </div>
            ) : activeSolicitud ? (
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
        )}
      </div>
    </div>
  );
};
