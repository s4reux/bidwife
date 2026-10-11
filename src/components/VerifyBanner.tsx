"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyBanner({ emailVerified }: { emailVerified: boolean }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const d = localStorage.getItem("verify_banner_dismissed");
    if (d === "1") setDismissed(true);
    else setDismissed(false);
  }, []);

  function dismiss() {
    localStorage.setItem("verify_banner_dismissed", "1");
    setDismissed(true);
  }

  if (emailVerified || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
        <span className="text-lg">⚠️</span>
        <span className="text-amber-800 flex-1">
          Emailinizi təsdiqləyin — bəzi funksiyalar məhduddur
        </span>
        <Link
          href="/tesdiqle"
          className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-700 whitespace-nowrap"
        >
          Təsdiqlə
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-amber-700 hover:text-amber-900 text-lg leading-none p-1"
          aria-label="Bağla"
        >
          ✕
        </button>
      </div>
    </div>
  );
}