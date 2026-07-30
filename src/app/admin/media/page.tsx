import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Quản lý Media Blob - Aurora Hotel" };

export default async function AdminMediaPage() {
  await requireAdmin(await auth());

  let files: Array<{ id: string; filename: string; sizeBytes: number; visibility: string; createdAt: Date }> = [];
  try {
    files = await db.mediaFile.findMany({ take: 20, orderBy: { createdAt: "desc" } });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">VERCEL BLOB MEDIA MANAGER</span>
          <h1 className="font-serif-display text-2xl font-light">Quản Lý Tệp Media & Hình Ảnh Cloud</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard Quản Trị
        </Link>
      </div>

      <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] space-y-4">
        <h2 className="font-serif-display text-xl text-[#17211D]">Danh Sách Tệp Media Đã Tải Lên</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DADDD8] text-[#17211D] font-bold">
                <th className="p-3">Tên Tệp</th>
                <th className="p-3">Kích Thước</th>
                <th className="p-3">Quyền Truy Cập</th>
                <th className="p-3">Thời Gian Tải Lên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADDD8]/60">
              {files.map((f) => (
                <tr key={f.id}>
                  <td className="p-3 font-mono font-bold text-[#17211D]">{f.filename}</td>
                  <td className="p-3">{(f.sizeBytes / 1024).toFixed(1)} KB</td>
                  <td className="p-3 font-bold text-[#C5A46D]">{f.visibility}</td>
                  <td className="p-3 text-[#242826]/70">{new Date(f.createdAt).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
