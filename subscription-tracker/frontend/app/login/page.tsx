"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to home page
    if (api.isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      return setError("Будь ласка, заповніть усі поля.");
    }

    setLoading(true);
    try {
      await api.login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неправильний email або пароль");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-8 shadow-xl">
        <div className="text-center">
          <h1 className="font-display text-3xl font-black tracking-tight">
            Вхід у кабінет<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Введіть ваші дані для перегляду підписок
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full py-2.5 text-sm font-semibold"
          >
            {loading ? "Вхід…" : "Увійти"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Немає акаунту?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Зареєструватися
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-ink/10 bg-ink/[0.02] p-4 text-xs text-muted">
          <span className="font-bold text-ink">Демо-акаунт для тестування:</span>
          <div className="mt-1">
            <strong>Email:</strong> <code className="text-accent">demo@example.com</code>
          </div>
          <div>
            <strong>Пароль:</strong> <code className="text-accent">Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
}
