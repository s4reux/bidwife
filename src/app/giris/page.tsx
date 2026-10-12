"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.push("/kabinet");
    r.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white max-w-sm mx-auto p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-10"
    >
      <h1 className="text-2xl font-black text-center">Giriş</h1>

      {/* Google Login — ən üstdə */}
      <a
        href="/api/auth/signin/google"
        className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ilə davam et
      </a>

      {/* Ayırıcı */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">və ya email ilə</span>
        </div>
      </div>

      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Şifrə"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      />

      <div className="text-right -mt-2">
        <Link href="/sifre-sifirla" className="text-xs text-orange-600 hover:underline">
          Şifrəni unutdum?
        </Link>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "..." : "Daxil ol"}
      </button>

      <p className="text-sm text-center text-gray-500">
        Hesabın yoxdur?{" "}
        <Link href="/qeydiyyat" className="text-orange-600 font-medium">
          Qeydiyyat
        </Link>
      </p>
    </form>
  );
}