import Link from "next/link";

export const metadata = { title: "Không tìm thấy trang" };

// Renders inside the root layout, so it inherits header/nav and the CSP
// setup. Keep it a server component: no state or effects are needed here.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-sm py-12 text-center">
      <p className="text-sm font-semibold text-neutral-500">Lỗi 404</p>
      <h1 className="mt-2 text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển đi nơi khác.
        Kiểm tra lại địa chỉ hoặc quay về trang chủ.
      </p>
      {/* min-h-11 keeps the 44px tap-target floor from e2e/layout-safety.spec.ts */}
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
