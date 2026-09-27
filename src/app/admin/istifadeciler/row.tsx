"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminUserRow({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function toggleAdmin() {
    if (!confirm(`${user.name} admin ${user.isAdmin ? "olsun deyil" : "olsun"}?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Alınmadı"); return; }
    toast.success("Yeniləndi");
    r.refresh();
  }

  async function del() {
    if (!confirm(`${user.name} silinsin? BÜTÜN elanları da silinəcək!`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Silinmədi"); return; }
    toast.success("Silindi");
    r.refresh();
  }

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white grid place-items-center text-xs font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium">
              {user.name} {user.isAdmin && "🔑"}
            </div>
            <div className="text-xs text-gray-400 md:hidden">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="p-3 hidden md:table-cell">{user.email}</td>
      <td className="p-3 hidden md:table-cell">{user.phone || "—"}</td>
      <td className="p-3 hidden lg:table-cell text-xs">
        📦 {user.listingCount} • 🔨 {user.bidCount}
      </td>
      <td className="p-3 text-right space-x-1 whitespace-nowrap">
        <button onClick={toggleAdmin} disabled={loading}
          className={`text-xs px-2 py-1.5 rounded-lg font-medium ${
            user.isAdmin ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          }`}>
          {user.isAdmin ? "🔑 Admin↓" : "🔑 Admin↑"}
        </button>
        <button onClick={del} disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
          🗑️
        </button>
      </td>
    </tr>
  );
}