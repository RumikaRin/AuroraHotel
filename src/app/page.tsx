import { db } from "@/lib/db";

// The page reads the live DB; skip build-time prerendering so "next build"
// does not require a seeded database.
export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Sản phẩm</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Danh sách đọc trực tiếp từ database (Prisma + SQLite). API tương ứng:{" "}
        <code className="rounded bg-neutral-100 px-1">GET /api/products</code>
      </p>

      {products.length === 0 ? (
        <p className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm">
          Chưa có dữ liệu. Chạy <code>npx prisma migrate dev</code> (seed chạy
          tự động) hoặc <code>npm run db:seed</code>.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">{product.name}</h2>
                <span className="text-xs text-neutral-500">{product.sku}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {product.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold">{formatPrice(product.price)}</span>
                <span
                  className={
                    product.stock > 0 ? "text-emerald-700" : "text-red-600"
                  }
                >
                  {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
