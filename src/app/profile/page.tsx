import { auth } from "@/auth";
import { requireUser } from "@/server/auth/guards";

export const metadata = { title: "Tài khoản" };
export const dynamic = "force-dynamic";

// Route is guarded by src/middleware.ts (redirects anonymous users to
// /login). The auth() call here is defense in depth, not the primary gate.
export default async function ProfilePage() {
  const user = await requireUser(await auth());

  return (
    <div>
      <h1 className="text-2xl font-semibold">Tài khoản</h1>
      <dl className="mt-6 grid max-w-md gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Email</dt>
          <dd>{user.email ?? "(không có)"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Tên</dt>
          <dd>{user.name ?? "(không có)"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Vai trò</dt>
          <dd className="font-mono">{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}
