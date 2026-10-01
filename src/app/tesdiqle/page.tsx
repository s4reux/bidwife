"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyPage() {
  const r = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function handleChange(idx: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value.slice(-1);
    setCode(newCode);
    if (value && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
    setCode(newCode);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) { toast.error("Kodu tam daxil edin"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: fullCode }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error((await res.json()).error || "Xəta");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      return;
    }

    toast.success("✅ Email təsdiqləndi!");
    r.push("/kabinet");
    r.refresh();
  }

  async function resend() {
    if (cooldown > 0) return;
    setLoading(true);
    const res = await fetch("/api/auth/resend-code", { method: "POST" });
    setLoading(false);
    if (!res.ok) { toast.error("Göndərilə bilmədi"); return; }
    toast.success("Yeni kod göndərildi");
    setCooldown(60);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white max-w-md mx-auto p-8 rounded-2xl border shadow-sm space-y-6 mt-10"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">📧</div>
        <h1 className="text-2xl font-black">Email-i təsdiqlə</h1>
        <p className="text-sm text-gray-500 mt-2">
          Emailinizə <b>6 rəqəmli kod</b> göndərdik. Kodu aşağıda daxil edin.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg transition-all"
        >
          {loading ? "Yoxlanılır..." : "Təsdiq et"}
        </button>
      </form>

      <div className="text-center space-y-2">
        <button
          onClick={resend}
          disabled={cooldown > 0 || loading}
          className="text-sm text-orange-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Yenidən göndər (${cooldown}s)` : "Kodu yenidən göndər"}
        </button>
        <p className="text-xs text-gray-400">Email gəlmədisə spam qovluğunu yoxlayın</p>
      </div>

      <div className="text-center pt-3 border-t">
        <Link href="/kabinet" className="text-xs text-gray-400 hover:text-gray-600">
          Sonra təsdiqlə →
        </Link>
      </div>
    </motion.div>
  );
}