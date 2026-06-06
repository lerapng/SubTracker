"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import SubscriptionRow from "@/components/SubscriptionRow";
import type { Subscription } from "@/lib/types";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!api.isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.list();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, mounted]);

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted">Завантаження...</p>
      </div>
    );
  }

  if (!api.isAuthenticated()) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted">Перевірка авторизації...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold">Backend недоступний</h1>
        <p className="mt-2 text-sm text-muted">
          Переконайтесь, що API запущено на <code className="text-accent">http://localhost:5080</code>.
          <br />
          Оригінальна помилка: <code className="text-rose-600">{error}</code>
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Спробувати знову
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent align-[-0.125em]" />
          <p className="mt-2 text-sm text-muted">Завантаження підписок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black tracking-tight">Підписки</h1>
        <Link href="/subscriptions/new" className="btn-primary">+ Додати</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">Ще немає підписок.</p>
          <Link href="/subscriptions/new" className="btn-primary mt-4">Додати першу</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-3 pl-4 font-semibold">Сервіс</th>
                  <th className="py-3 font-semibold">Ціна</th>
                  <th className="py-3 font-semibold">Цикл</th>
                  <th className="py-3 font-semibold">Списання</th>
                  <th className="py-3 font-semibold">Статус</th>
                  <th className="py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {items.map((s) => <SubscriptionRow key={s.id} s={s} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
