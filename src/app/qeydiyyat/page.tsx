"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"), email: fd.get("email"),
        phone: fd.get("phone"), password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.push("/kabinet"); r.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white max-w-sm mx-auto p-6 rounded-lg border space-y-4">
      <h1 className="text-xl font-bold">Qeydiyyat</h1>
      <input name="name" required placeholder="Ad Soyad" className="w-full border p-2 rounded" />
      <input name="email" type="email" required placeholder="Email" className="w-full border p-2 rounded" />
      <input name="phone" placeholder="Telefon (opsional)" className="w-full border p-2 rounded" />
      <input name="password" type="password" required minLength={6} placeholder="Sifre (min 6)" className="w-full border p-2 rounded" />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded disabled:opacity-50">
        {loading ? "..." : "Qeydiyyatdan kec"}
      </button>
      <p className="text-sm text-center text-gray-500">
        Hesabin var? <Link href="/giris" className="text-orange-600">Giris</Link>
      </p>
    </form>
  );
}