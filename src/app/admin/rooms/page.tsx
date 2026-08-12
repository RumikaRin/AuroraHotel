import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Quản lý Hạng phòng & Giá - Aurora Hotel" };
export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  await requireAdmin(await auth());

  let categories: Array<{ id: string; name: string; slug: string; basePrice: number; sizeSqm?: number; maxOccupancy?: number; bedConfiguration?: string }> = [];
  try {
    categories = await db.roomCategory.findMany({ orderBy: { basePrice: "asc" } });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">ROOM CATEGORIES & RATES</span>
          <h1 className="font-serif-luxury text-2xl font-bold">Quản Lý Hạng Phòng & Bảng Giá Theo Ngày</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-aurora-line shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-aurora-line pb-4">
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-aurora-midnight">
              Danh Sách Các Hạng Phòng Nghỉ Dưỡng
            </h2>
            <p className="text-xs text-aurora-muted">
              Cấu hình giá cơ bản, diện tích phòng và sức chứa cho mỗi loại phòng.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            {categories.length} Hạng Phòng Đang Khai Thác
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="p-5 border border-aurora-line rounded-2xl bg-[#FFFDF8] hover:border-aurora-gold transition-all flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-aurora-gold font-bold uppercase block mb-1">
                    SLUG: {c.slug}
                  </span>
                  <h3 className="font-serif-luxury text-xl font-bold text-aurora-midnight">{c.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  HOẠT ĐỘNG
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-aurora-ink border-t border-b border-aurora-line/60 py-3">
                <div>
                  <span className="text-aurora-muted block text-[11px]">Diện tích phòng:</span>
                  <span className="font-semibold">{c.sizeSqm || 35} m²</span>
                </div>
                <div>
                  <span className="text-aurora-muted block text-[11px]">Loại giường:</span>
                  <span className="font-semibold">{c.bedConfiguration || "King Bed"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-[11px] text-aurora-muted block">Giá cơ sở niêm yết:</span>
                  <span className="text-base font-bold text-aurora-gold">
                    {c.basePrice.toLocaleString("vi-VN")} VND <span className="text-xs font-normal text-aurora-muted">/ đêm</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

