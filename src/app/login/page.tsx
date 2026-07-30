import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Đăng nhập</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Tài khoản seed: <code>admin@example.com / admin123</code> hoặc{" "}
        <code>customer@example.com / customer123</code>
      </p>
      <LoginForm />
    </div>
  );
}
