import React, { useState, useEffect, useRef } from 'react';
import { ViewType, Mensaje, Solicitud } from '../types';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import {
  collection, addDoc, query, where, onSnapshot,
  serverTimestamp, writeBatch, doc
} from 'firebase/firestore';
import { Send, ArrowLeft, Loader2, UserCircle } from 'lucide-react';

export const Chat = ({ navigate }: { navigate: (v: ViewType) => void }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── 1. Buscar solicitud activa ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('Login'); return; }

    const q = query(
      collection(db, 'solicitudes'),
      where(role === 'Cliente' ? 'clienteId' : 'cerrajeroAsignadoId', '==', user.uid),
      where('estado', '==', 'aceptado')
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0].data() as Solicitud;
        setSolicitud({ ...d, id: snap.docs[0].id });
      } else {
        setSolicitud(null);
      }
      setLoading(false);
    }, (err) => {
      setError("Error al cargar la solicitud: " + err.message);
      setLoading(false);
    });

    return () => unsub();
  }, [user, role, navigate]);

  // ── 2. Escuchar mensajes en tiempo real ────────────────────────────────────
  useEffect(() => {
    if (!solicitud || !user) return;

    const q = query(
      collection(db, 'mensajes'),
      where('solicitudId', '==', solicitud.id)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const msgs: Mensaje[] = [];
      snap.forEach(d => msgs.push({ ...d.data(), id: d.id } as Mensaje));

      // Ordenar por timestamp en cliente (evita índice compuesto en Firestore)
      msgs.sort((a, b) => {
        const ta = a.timestamp?.toMillis?.() ?? Date.now();
        const tb = b.timestamp?.toMillis?.() ?? Date.now();
        return ta - tb;
      });

      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // ── 3. Marcar como "recibido" y luego "leido" los mensajes del otro ──
      const ajenos = msgs.filter(m => m.remitenteId !== user.uid);

      const porRecibir = ajenos.filter(m => m.status === 'enviado' || !m.status);
      const porLeer    = ajenos.filter(m => m.status !== 'leido');

      if (porRecibir.length > 0 || porLeer.length > 0) {
        try {
          const batch = writeBatch(db);
          porRecibir.forEach(m => {
            batch.update(doc(db, 'mensajes', m.id), { status: 'recibido' });
          });
          porLeer.forEach(m => {
            batch.update(doc(db, 'mensajes', m.id), { status: 'leido' });
          });
          await batch.commit();
        } catch (e) {
          // silencioso: no bloquea el chat si falla el update de status
        }
      }
    }, (err) => {
      setError("Error al cargar mensajes: " + err.message);
    });

    return () => unsub();
  }, [solicitud, user]);

  // ── 4. Enviar mensaje con senderRole y status ──────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !solicitud || !user) return;

    const text = newMessage;
    setNewMessage('');
    setError(null);

    try {
      await addDoc(collection(db, 'mensajes'), {
        solicitudId: solicitud.id,
        remitenteId: user.uid,
        senderRole: role,           // "Cliente" o "Cerrajero"
        texto: text,
        timestamp: serverTimestamp(),
        status: 'enviado',          // estado inicial
      });
    } catch (err: any) {
      setError("Error al enviar: " + err.message);
    }
  };

  // ── 5. Helper: icono de checks ─────────────────────────────────────────────
  const renderStatus = (msg: Mensaje) => {
    if (msg.remitenteId !== user?.uid) return null; // solo en mis mensajes
    if (msg.status === 'leido')    return <span className="text-[#D4AF37] text-xs ml-1">✓✓</span>;
    if (msg.status === 'recibido') return <span className="text-zinc-400 text-xs ml-1">✓✓</span>;
    return <span className="text-zinc-400 text-xs ml-1">✓</span>;
  };

  // ── Renders ────────────────────────────────────────────────────────────────
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
        <button
          onClick={() => navigate(role === 'Cerrajero' ? 'PortalCerrajero' : 'CerrajeroYa')}
          className="mt-4 text-[#D4AF37] underline"
        >
          Volver
        </button>
      </div>
    );
  }

  const otherName = role === 'Cliente'
    ? (solicitud.cerrajeroNombre || (solicitud as any).cerrajeroAsignadoNombre || 'Cerrajero')
    : (solicitud.clienteNombre || 'Cliente');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-950">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate(role === 'Cerrajero' ? 'PortalCerrajero' : 'CerrajeroYa')}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-full flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="font-bold text-white">{otherName}</h3>
          {/* Etiqueta de rol del otro usuario */}
          <p className="text-xs text-[#D4AF37]">
            {role === 'Cliente' ? '🔧 Cerrajero · En camino' : '👤 Cliente'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 mx-4 mt-4 rounded-lg text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Mensajes */}
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
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? 'bg-[#D4AF37] text-black rounded-br-sm'
                    : 'bg-zinc-800 text-white rounded-bl-sm'
                }`}>
                  {/* Etiqueta de rol — solo visible para el cerrajero para saber quién escribió */}
                  {!isMe && (
                    <p className="text-[10px] font-semibold mb-1 opacity-60">
                      {msg.senderRole === 'Cliente' ? '👤 Cliente' : '🔧 Cerrajero'}
                    </p>
                  )}
                  <p className="text-sm">{msg.texto}</p>
                  {/* Checks de estado */}
                  <div className="flex justify-end mt-1">
                    {renderStatus(msg)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
