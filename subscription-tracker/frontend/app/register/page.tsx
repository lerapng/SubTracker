"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (api.isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      return setError("Будь ласка, заповніть усі поля.");
    }

    if (password !== confirmPassword) {
      return setError("Паролі не співпадають.");
    }

    if (password.length < 6) {
      return setError("Пароль повинен бути не менше 6 символів.");
    }

    setLoading(true);
    try {
      await api.register(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка при реєстрації");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-8 shadow-xl">
        <div className="text-center">
          <h1 className="font-display text-3xl font-black tracking-tight">
            Реєстрація акаунту<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Створіть власний профіль для обліку підписок
          </p>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-center text-sm text-emerald-700 font-semibold">
            Реєстрація успішна! Перенаправлення на вхід…
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-6 rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-accent">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <label className="label">Електронна пошта (Email)</label>
                <input
                  type="email"
                  className="field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Пароль</label>
                <input
                  type="password"
                  className="field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Підтвердження паролю</label>
                <input
                  type="password"
                  className="field"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-6 w-full py-2.5 text-sm font-semibold"
              >
                {loading ? "Реєстрація…" : "Зареєструватися"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted">
              Вже є акаунт?{" "}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Увійти
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
