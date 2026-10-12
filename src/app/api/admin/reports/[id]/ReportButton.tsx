use client;
import { useState } from react;
import { motion, AnimatePresence } from framer-motion;
import toast from react-hot-toast;

export default function ReportButton({
  listingId, loggedIn,
} { listingId string; loggedIn boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState();
  const [comment, setComment] = useState();
  const [loading, setLoading] = useState(false);

  const reasons = [
    Saxta elan,
    Qadağan olunmuş mal,
    Yanlış məlumat,
    Təkrar elan,
    Spam,
    Digər,
  ];

  async function submit() {
    if (!reason) {
      toast.error(Səbəb seç);
      return;
    }
    setLoading(true);
    const res = await fetch(apireports, {
      method POST,
      headers { Content-Type applicationjson },
      body JSON.stringify({ listingId, reason, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error  Xəta);
      return;
    }
    toast.success(Şikayətin göndərildi. Təşəkkür!);
    setOpen(false);
    setReason();
    setComment();
  }

  return (
    
      button
        onClick={() = {
          if (!loggedIn) {
            toast.error(Şikayət etmək üçün daxil ol);
            return;
          }
          setOpen(true);
        }}
        className=flex items-center gap-2 text-sm text-gray-500 hovertext-red-600 transition-colors
      
        svg width=16 height=16 viewBox=0 0 24 24 fill=none stroke=currentColor strokeWidth=2
          path d=M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z
          line x1=4 y1=22 x2=4 y2=15
        svg
        Şikayət et
      button

      AnimatePresence
        {open && (
          motion.div
            initial={{ opacity 0 }}
            animate={{ opacity 1 }}
            exit={{ opacity 0 }}
            onClick={() = setOpen(false)}
            className=fixed inset-0 bg-black60 z-[100] flex items-center justify-center p-4
          
            motion.div
              initial={{ scale 0.95, y 20 }}
              animate={{ scale 1, y 0 }}
              exit={{ scale 0.95, y 20 }}
              onClick={(e) = e.stopPropagation()}
              className=bg-white rounded-2xl max-w-md w-full p-6 space-y-4
            
              div className=flex items-center justify-between
                h3 className=font-bold text-lgŞikayət eth3
                button
                  onClick={() = setOpen(false)}
                  className=text-gray-400 hovertext-gray-700 text-xl
                
                  ✕
                button
              div

              p className=text-sm text-gray-500
                Bu elanla bağlı problemin səbəbini seç
              p

              div className=space-y-1.5
                {reasons.map((r) = (
                  button
                    key={r}
                    type=button
                    onClick={() = setReason(r)}
                    className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${
                      reason === r
                         bg-red-50 border-red-300 text-red-700 font-medium
                         bg-white border-gray-200 hoverborder-red-300
                    }`}
                  
                    {r}
                  button
                ))}
              div

              textarea
                value={comment}
                onChange={(e) = setComment(e.target.value)}
                placeholder=Əlavə qeyd (opsional)
                rows={3}
                className=w-full border border-gray-200 p-3 rounded-lg text-sm focusring-2 focusring-red-500 outline-none resize-none
              

              div className=flex gap-2
                button
                  onClick={() = setOpen(false)}
                  className=flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hoverbg-gray-200
                
                  Bağla
                button
                button
                  onClick={submit}
                  disabled={loading  !reason}
                  className=flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hoverbg-red-700 disabledopacity-50
                
                  {loading  ...  Göndər}
                button
              div
            motion.div
          motion.div
        )}
      AnimatePresence
    
  );
}
