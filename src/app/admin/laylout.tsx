import { requireAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="animate-in">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-5 mb-6">
        <h1 className="text-2xl font-black">⚙️ Admin Panel</h1>
        <p className="text-sm text-gray-300 mt-1">Saytı idarə et</p>
      </div>

      <nav className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        <Link href="/admin" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium whitespace-nowrap">
          📊 Statistika
        </Link>
        <Link href="/admin/elanlar" className="px-4 py-2 rounded-xl bg-white border hover:border-orange-500 text-sm font-medium whitespace-nowrap">
          📦 Elanlar
        </Link>
        <Link href="/admin/istifadeciler" className="px-4 py-2 rounded-xl bg-white border hover:border-orange-500 text-sm font-medium whitespace-nowrap">
          👥 İstifadəçilər
        </Link>
      </nav>

      {children}
    </div>
  );
}