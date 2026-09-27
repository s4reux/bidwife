"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function ImageUploader({
  value, onChange,
}: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange([...value, ...data.urls]);
      toast.success(data.urls.length + " sekil yuklendi");
    } catch (e: any) {
      toast.error(e.message || "Yuklenmedi");
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-orange-600">Yuklenir...</p>
        ) : (
          <>
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm text-gray-600">
              <span className="text-orange-600 font-medium">Sekil sec</span> ve ya buraya at
            </p>
            <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG/WebP</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Əsas
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}