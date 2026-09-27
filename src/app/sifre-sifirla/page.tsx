"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Xəta"); return; }
    setSent(true);
    toast.success("Email göndərildi!");
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md mx-auto p-8 rounded-2xl border shadow-sm space-y-4 mt-10 text-center"
      >
        <div className="text-6xl">📧</div>
        <h1 className="text-xl font-bold">Email göndərildi</h1>
        <p className="text-sm text-gray-500">
          <b>{email}</b> ünvanına şifrə sıfırlama linki göndərdik.
          <br />
          Gələn qutusunu (və spam qovluğunu) yoxlayın.
        </p>
        <Link href="/giris" className="inline-block mt-4 text-orange-600 font-medium">
          ← Girişə qayıt
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white max-w-sm mx-auto p-6 rounded-2xl border shadow-sm space-y-4 mt-10"
    >
      <h1 className="text-xl font-bold">Şifrəni sıfırla</h1>
      <p className="text-sm text-gray-500">Email-inizi yazın, sıfırlama linki göndərək</p>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <button disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50">
          {loading ? "Göndərilir..." : "Link göndər"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500">
        <Link href="/giris" className="text-orange-600 font-medium">← Girişə qayıt</Link>
      </p>
    </motion.div>
  );
}