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