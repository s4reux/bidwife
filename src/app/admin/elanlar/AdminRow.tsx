"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminListingRow({ listing }: { listing: any }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();
  const isVip = listing.vipUntil && new Date(listing.vipUntil) > new Date();

  async function del() {
    if (!confirm(`"${listing.title}" silinsin?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Silinmədi"); return; }
    toast.success("Silindi");
    r.refresh();
  }

  async function vipToggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${listing.id}/vip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: isVip ? 0 : 30 }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Alınmadı"); return; }
    toast.success(isVip ? "VIP silindi" : "VIP verildi");
    r.refresh();
  }

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <Link href={`/elan/${listing.id}`} className="font-medium hover:text-orange-600">
          {isVip && "👑 "}{listing.title}
        </Link>
        <div className="text-xs text-gray-400 md:hidden">
          {listing.sellerName} • {listing.price.toFixed(2)} ₼
        </div>
      </td>
      <td className="p-3 hidden md:table-cell">
        <div className="text-sm">{listing.sellerName}</div>
        <div className="text-xs text-gray-400">{listing.sellerEmail}</div>
      </td>
      <td className="p-3 hidden md:table-cell font-medium">{listing.price.toFixed(2)} ₼</td>
      <td className="p-3 hidden lg:table-cell">
        <span className={`text-xs px-2 py-1 rounded-full ${
          listing.status === "ACTIVE" ? "bg-green-100 text-green-700" :
          listing.status === "SOLD" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {listing.status}
        </span>
      </td>
      <td className="p-3 text-right space-x-1 whitespace-nowrap">
        <button onClick={vipToggle} disabled={loading}
          className={`text-xs px-2 py-1.5 rounded-lg font-medium ${
            isVip ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>
          {isVip ? "👑 VIP↓" : "👑 VIP↑"}
        </button>
        <button onClick={del} disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
          🗑️
        </button>
      </td>
    </tr>
  );
}