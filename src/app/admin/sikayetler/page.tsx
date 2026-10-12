import { prisma } from "@/lib/prisma";
import ReportRow from "./Row";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      listing: { select: { id: true, title: true } },
      reporter: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="text-left p-3">Elan</th>
            <th className="text-left p-3 hidden md:table-cell">Şikayətçi</th>
            <th className="text-left p-3">Səbəb</th>
            <th className="text-left p-3 hidden lg:table-cell">Status</th>
            <th className="text-right p-3">Əməliyyat</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <ReportRow key={r.id} report={{
              id: r.id,
              listingId: r.listing.id,
              listingTitle: r.listing.title,
              reporterName: r.reporter.name,
              reporterEmail: r.reporter.email,
              reason: r.reason,
              comment: r.comment,
              status: r.status,
              createdAt: r.createdAt.toISOString(),
            }} />
          ))}
        </tbody>
      </table>
      {reports.length === 0 && (
        <div className="p-10 text-center text-gray-500">Şikayət yoxdur</div>
      )}
    </div>
  );
}