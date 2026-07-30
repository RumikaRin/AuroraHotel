import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";

export const metadata = { title: "Quản trị" };
export const dynamic = "force-dynamic";

// Dashboard stub. Access is guarded twice:
//   1. src/middleware.ts + the "authorized" callback in src/auth.config.ts
//      (anonymous -> /login, CUSTOMER -> redirected home),
//   2. the auth() check below (defense in depth for direct hits).
// Section list mirrors the admin spec at ../docs/40-admin/admin-spec.md
// (relative to the starter folder). Each entry is a placeholder to fill in.
const SECTIONS = [
  { title: "Tổng quan", note: "Số liệu đơn hàng, doanh thu, tồn kho thấp" },
  { title: "Quản lý sản phẩm", note: "CRUD sản phẩm, giá, tồn kho" },
  { title: "Quản lý đơn hàng", note: "Duyệt trạng thái theo state machine" },
  { title: "Quản lý người dùng", note: "Phân quyền ADMIN / STAFF / CUSTOMER" },
  { title: "Mã giảm giá", note: "Coupon, giới hạn lượt dùng" },
  { title: "Nhật ký hệ thống", note: "AuditLog + EmailOutbox đang chờ gửi" },
];

export default async function AdminPage() {
  const user = await requireAdmin(await auth());

  return (
    <div>
      <h1 className="text-2xl font-semibold">Bảng điều khiển quản trị</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Đăng nhập với vai trò{" "}
        <span className="font-mono font-semibold">{user.role}</span> (
        {user.email})
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <li
            key={section.title}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <h2 className="font-medium">{section.title}</h2>
            <p className="mt-1 text-sm text-neutral-600">{section.note}</p>
            <p className="mt-2 text-xs text-neutral-400">
              Stub - xem docs/40-admin/admin-spec.md
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
