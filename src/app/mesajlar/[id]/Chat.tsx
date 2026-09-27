"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  isMine: boolean;   // 🔑 server-dən gəlir
};

export default function Chat({
  conversationId, meId, otherName, listing,
}: {
  conversationId: string;
  meId: string;
  otherName: string;
  listing: { id: string; title: string } | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const body = text;
    setText("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body }),
    });
    setSending(false);
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    }
  }

  return (
    <div className="animate-in max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-white border rounded-t-2xl p-3 flex items-center gap-3">
        <Link href="/mesajlar" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div className="w-10 h-10 rounded-full bg-orange-600 text-white grid place-items-center font-bold">
          {otherName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{otherName}</div>
          {listing && (
            <Link href={`/elan/${listing.id}`} className="text-xs text-orange-600 hover:underline truncate block">
              📦 {listing.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Mesaj yoxdur. Ilk mesaji yaz!</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.isMine ? "items-end" : "items-start"}`}
            >
              {/* Adı göstər - qarşı tərəf üçün */}
              {!m.isMine && (
                <span className="text-[10px] text-gray-400 mb-0.5 px-2">{m.senderName}</span>
              )}
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                m.isMine
                  ? "bg-orange-600 text-white rounded-br-sm"
                  : "bg-white border rounded-bl-sm"
              }`}>
                <div>{m.body}</div>
                <div className={`text-[10px] mt-0.5 ${m.isMine ? "text-orange-100" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="bg-white border border-t-0 rounded-b-2xl p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 border rounded-full px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={sending || !text.trim()}
          className="bg-orange-600 text-white px-5 rounded-full disabled:opacity-50 font-medium"
        >
          ➤
        </motion.button>
      </form>
    </div>
  );
}