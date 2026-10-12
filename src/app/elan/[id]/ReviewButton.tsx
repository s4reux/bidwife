"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReviewButton({
  listingId,
  loggedIn,
}: {
  listingId: string;
  loggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error || "Xəta");
      return;
    }
    toast.success("Rəyiniz üçün təşəkkür!");
    setOpen(false);
    setRating(5);
    setComment("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!loggedIn) {
            toast.error("Rəy vermək üçün daxil ol");
            return;
          }
          setOpen(true);
        }}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors py-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Rəy ver
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ zIndex: 9999 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Satıcıya rəy</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <span className={n <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Rəyinizi yazın (opsional)"
                rows={4}
                className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium"
                >
                  Bağla
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? "..." : "Göndər"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}