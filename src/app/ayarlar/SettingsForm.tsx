"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

type UserData = {
  name: string;
  email: string;
  phone: string | null;
};

export default function SettingsForm({ user }: { user: UserData }) {
  const r = useRouter();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setProfileLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error || "Xəta");
      return;
    }
    toast.success("✅ Profil yeniləndi");
    r.refresh();
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("Yeni şifrələr uyğun deyil");
      return;
    }
    if (newPass.length < 6) {
      toast.error("Min 6 simvol");
      return;
    }
    setPassLoading(true);
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
    });
    setPassLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error || "Xəta");
      return;
    }
    toast.success("✅ Şifrə dəyişdirildi");
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
  }

  return (
    <div className="space-y-6">
      {/* PROFİL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100"
      >
        <h2 className="font-bold text-lg mb-1">Profil məlumatları</h2>
        <p className="text-sm text-gray-500 mb-4">
          Adınızı və telefon nömrənizi dəyişin
        </p>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Ad Soyad</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email dəyişdirilə bilməz</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Telefon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994 XX XXX XX XX"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <button
            disabled={profileLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {profileLoading ? "..." : "Yadda saxla"}
          </button>
        </form>
      </motion.div>

      {/* ŞİFRƏ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-6 border border-gray-100"
      >
        <h2 className="font-bold text-lg mb-1">Şifrə dəyişdir</h2>
        <p className="text-sm text-gray-500 mb-4">
          Təhlükəsizlik üçün güclü şifrə seçin
        </p>

        <form onSubmit={updatePassword} className="space-y-4">
          <input
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required
            placeholder="Cari şifrə"
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            placeholder="Yeni şifrə (min 6)"
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
            placeholder="Yeni şifrə (təkrar)"
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />

          <button
            disabled={passLoading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {passLoading ? "..." : "Şifrəni dəyiş"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}