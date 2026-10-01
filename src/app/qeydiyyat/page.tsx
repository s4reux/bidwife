"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const r = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accepted) {
      setErr("İstifadə Şərtlərini qəbul etməlisiniz");
      return;
    }
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.push("/tesdiqle");
    r.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white max-w-sm mx-auto p-6 rounded-2xl border shadow-sm space-y-4 mt-10">
      <h1 className="text-2xl font-black text-center">Qeydiyyat</h1>

      <input
        name="name"
        required
        placeholder="Ad Soyad"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <input
        name="phone"
        placeholder="Telefon (opsional)"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Şifrə (min 6)"
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />

      <label className="flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 accent-orange-600 cursor-pointer"
        />
        <span className="text-xs text-gray-600 leading-relaxed">
          Mən{" "}
          <Link href="/terms" target="_blank" className="text-orange-600 hover:underline font-medium">
            İstifadə Şərtlərini
          </Link>{" "}
          və{" "}
          <Link href="/privacy" target="_blank" className="text-orange-600 hover:underline font-medium">
            Məxfilik Siyasətini
          </Link>{" "}
          oxudum və qəbul edirəm
        </span>
      </label>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button
        disabled={loading || !accepted}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
      >
        {loading ? "Göndərilir..." : "Qeydiyyatdan keç"}
      </button>

      <p className="text-sm text-center text-gray-500">
        Hesabın var?{" "}
        <Link href="/giris" className="text-orange-600 font-medium">
          Giriş
        </Link>
      </p>
    </form>
  );
}