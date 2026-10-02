"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Gallery({
  images,
  title,
  fullBleed,
}: {
  images: string[];
  title: string;
  fullBleed?: boolean;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className={fullBleed ? "" : "bg-white rounded-2xl p-3 border border-gray-100"}>
        <div
          className={`w-full h-[350px] md:h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 grid place-items-center text-gray-300 text-6xl ${
            fullBleed ? "" : "rounded-xl"
          }`}
        >
          📦
        </div>
      </div>
    );
  }

  return (
    <div className={fullBleed ? "" : "bg-white rounded-2xl p-3 border border-gray-100"}>
      <div
        className={`w-full h-[350px] md:h-[500px] bg-gray-50 overflow-hidden relative ${
          fullBleed ? "" : "rounded-xl"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg grid place-items-center hover:bg-white transition-colors text-xl font-bold text-gray-700"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg grid place-items-center hover:bg-white transition-colors text-xl font-bold text-gray-700"
            >
              ›
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className={`flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1 ${
            fullBleed ? "px-4" : ""
          }`}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === active ? "border-orange-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}