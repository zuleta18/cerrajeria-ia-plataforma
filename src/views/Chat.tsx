import React, { useState, useEffect, useRef } from 'react';
import { ViewType, Mensaje, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { Send, ArrowLeft, Loader2, UserCircle } from 'lucide-react';

export const Chat = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('Login');
      return;
    }

    // Find active request
    const q = query(
      collection(db, 'solicitudes'),
      where(role === 'Cliente' ? 'clienteId' : 'cerrajeroAsignadoId', '==', user.uid),
      where('estado', '==', 'aceptado')
    );

    const unsubscribeSolicitud = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as Solicitud;
        setSolicitud({ ...docData, id: snapshot.docs[0].id });
      } else {
        setSolicitud(null);
      }
      setLoading(false);
    });

    return () => unsubscribeSolicitud();
  }, [user, role, navigate]);

  useEffect(() => {
    if (!solicitud) return;

    const q = query(
      collection(db, 'mensajes'),
      where('solicitudId', '==', solicitud.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs: Mensaje[] = [];
      snapshot.forEach(doc => {
        msgs.push({ ...doc.data(), id: doc.id } as Mensaje);
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribeMessages();
  }, [solicitud]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !solicitud || !user) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'mensajes'), {
        solicitudId: solicitud.id,
        remitenteId: user.uid,
        texto: text,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al enviar mensaje", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="p-6 text-center text-zinc-400 flex flex-col items-center">
        <UserCircle className="w-12 h-12 mb-2 opacity-50" />
        <p>No tienes ningún servicio activo.</p>
        <button onClick={() => navigate(role === 'Cerrajero' ? 'PortalCerrajero' : 'CerrajeroYa')} className="mt-4 text-[#D4AF37] underline">Volver</button>
      </div>
    );
  }

  const otherName = role === 'Cliente' ? (solicitud.cerrajeroNombre || 'Cerrajero') : solicitud.clienteNombre;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-950">
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3">
        <button onClick={() => navigate(role === 'Cerrajero' ? 'PortalCerrajero' : 'CerrajeroYa')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-full flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="font-bold text-white">{otherName}</h3>
          <p className="text-xs text-[#D4AF37]">En camino</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-4">
            Envía un mensaje a {otherName}...
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.remitenteId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-[#D4AF37] text-black rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm'}`}>
                  <p className="text-sm">{msg.texto}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="w-10 h-10 bg-[#D4AF37] disabled:opacity-50 hover:bg-[#b5952f] rounded-full flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4 text-black ml-[-2px]" />
        </button>
      </form>
    </div>
  );
};
