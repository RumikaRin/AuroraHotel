import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Nhật ký Kiểm toán Audit Logs - Aurora Hotel" };

export default async function AdminAuditPage() {
  await requireAdmin(await auth());

  let logs: Array<{ id: string; action: string; entityType: string; entityId: string; createdAt: Date }> = [];
  try {
    logs = await db.auditLog.findMany({ take: 20, orderBy: { createdAt: "desc" } });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">IMMUTABLE AUDIT TRAIL</span>
          <h1 className="font-serif-display text-2xl font-light">Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard Quản Trị
        </Link>
      </div>

      <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] space-y-4">
        <h2 className="font-serif-display text-xl text-[#17211D]">Lịch Sử Thao Tác Hệ Thống</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DADDD8] text-[#17211D] font-bold">
                <th className="p-3">Hành Động (Action)</th>
                <th className="p-3">Loại Thực Thể</th>
                <th className="p-3">Mã Thực Thể</th>
                <th className="p-3">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADDD8]/60">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="p-3 font-mono font-bold text-[#17211D]">{l.action}</td>
                  <td className="p-3 font-semibold">{l.entityType}</td>
                  <td className="p-3 font-mono text-xs">{l.entityId}</td>
                  <td className="p-3 text-[#242826]/70">{new Date(l.createdAt).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
