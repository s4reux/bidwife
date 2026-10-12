"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReportRow({ report }: { report: any }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function changeStatus(status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Alınmadı"); return; }
    toast.success("Yeniləndi");
    r.refresh();
  }

  async function del() {
    if (!confirm("Silinsin?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/reports/${report.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Silinmədi"); return; }
    toast.success("Silindi");
    r.refresh();
  }

  async function deleteListing() {
    if (!confirm(`Elanı sil? "${report.listingTitle}"`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${report.listingId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Alınmadı"); return; }
    toast.success("Elan silindi");
    r.refresh();
  }

  const statusColor: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
    REJECTED: "bg-gray-100 text-gray-600",
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <Link href={`/elan/${report.listingId}`} className="font-medium hover:text-orange-600">
          {report.listingTitle}
        </Link>
        {report.comment && (
          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{report.comment}</div>
        )}
      </td>
      <td className="p-3 hidden md:table-cell">
        <div className="text-sm">{report.reporterName}</div>
        <div className="text-xs text-gray-400">{report.reporterEmail}</div>
      </td>
      <td className="p-3 text-sm">{report.reason}</td>
      <td className="p-3 hidden lg:table-cell">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[report.status]}`}>
          {report.status}
        </span>
      </td>
      <td className="p-3 text-right space-x-1 whitespace-nowrap">
        {report.status === "PENDING" && (
          <>
            <button onClick={() => changeStatus("RESOLVED")} disabled={loading}
              className="text-xs px-2 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium">
              ✓ Həll
            </button>
            <button onClick={() => changeStatus("REJECTED")} disabled={loading}
              className="text-xs px-2 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium">
              ✕ Rədd
            </button>
          </>
        )}
        <button onClick={deleteListing} disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium">
          Elanı sil
        </button>
        <button onClick={del} disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
          🗑️
        </button>
      </td>
    </tr>
  );
}