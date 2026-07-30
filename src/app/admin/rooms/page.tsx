import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Quản lý Hạng phòng & Giá - Aurora Hotel" };

export default async function AdminRoomsPage() {
  await requireAdmin(await auth());

  let categories: Array<{ id: string; name: string; slug: string; basePrice: number; totalRooms: number }> = [];
  try {
    categories = await db.roomCategory.findMany({ orderBy: { basePrice: "asc" } });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">ROOM CATEGORIES & RATES</span>
          <h1 className="font-serif-display text-2xl font-light">Quản Lý Hạng Phòng & Bảng Giá</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard Quản Trị
        </Link>
      </div>

      <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] space-y-4">
        <h2 className="font-serif-display text-xl text-[#17211D]">Danh Sách Hạng Phòng Khách Sạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-4 border border-[#DADDD8] rounded-xl flex justify-between items-center bg-white">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#17211D]">{c.name}</h3>
                <span className="text-xs text-[#242826]/70">Tổng số phòng: {c.totalRooms} | Slug: {c.slug}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#C5A46D] block">{c.basePrice.toLocaleString("vi-VN")} VND / đêm</span>
                <span className="text-[10px] text-[#2E7D5A] font-bold">HOẠT ĐỘNG</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
