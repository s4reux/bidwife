"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false);

  function share(platform: string) {
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(url);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${link}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${link}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("✅ Link kopyalandı");
        setOpen(false);
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=500");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-orange-600 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span>📤</span>
        <span className="hidden sm:inline">Paylaş</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden min-w-[180px]">
            <button
              onClick={() => share("whatsapp")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-950/30 text-sm text-left"
            >
              <span className="text-xl">💬</span> WhatsApp
            </button>
            <button
              onClick={() => share("telegram")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm text-left"
            >
              <span className="text-xl">✈️</span> Telegram
            </button>
            <button
              onClick={() => share("facebook")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm text-left"
            >
              <span className="text-xl">📘</span> Facebook
            </button>
            <button
              onClick={() => share("copy")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-left border-t border-gray-100 dark:border-gray-800"
            >
              <span className="text-xl">🔗</span> Linki kopyala
            </button>
          </div>
        </>
      )}
    </div>
  );
}