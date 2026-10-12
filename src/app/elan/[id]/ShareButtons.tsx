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
        toast.success("Link kopyalandı");
        setOpen(false);
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=500");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-600 font-medium transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Paylaş
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden min-w-[170px]">
            <button
              type="button"
              onClick={() => share("whatsapp")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-sm text-left"
            >
              <span className="text-lg">💬</span> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => share("telegram")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm text-left"
            >
              <span className="text-lg">✈️</span> Telegram
            </button>
            <button
              type="button"
              onClick={() => share("facebook")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm text-left"
            >
              <span className="text-lg">📘</span> Facebook
            </button>
            <button
              type="button"
              onClick={() => share("copy")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-left border-t border-gray-100"
            >
              <span className="text-lg">🔗</span> Linki kopyala
            </button>
          </div>
        </>
      )}
    </div>
  );
}