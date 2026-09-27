"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ResetPage({ params }: { params: { token: string } }) {
  const r = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Şifrələr uyğun deyil"); return; }
    if (password.length < 6) { toast.error("Min 6 simvol"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token, password }),
    });
    setLoading(false);
    if (!res.ok) { toast.error((await res.json()).error); return; }
    toast.success("Şifrə dəyişdirildi!");
    r.push("/giris");
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="bg-white max-w-sm mx-auto p-6 rounded-2xl border shadow-sm space-y-4 mt-10"
    >
      <h1 className="text-xl font-bold">Yeni şifrə</h1>
      <input
        type="password" required value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Yeni şifrə (min 6)"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <input
        type="password" required value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Yeni şifrə (təkrar)"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <button disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50">
        {loading ? "..." : "Şifrəni dəyiş"}
      </button>
    </motion.form>
  );
}