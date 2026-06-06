"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BILLING_LABELS, type Subscription, type Summary } from "@/lib/types";
import DashboardCharts from "@/components/DashboardCharts";

function money(n: number, currency = "UAH") {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [baseCurrency, setBaseCurrency] = useState("UAH");
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
        const [sumData, subsData] = await Promise.all([
          api.summary(baseCurrency),
          api.list(),
        ]);
        setSummary(sumData);
        setSubscriptions(subsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Помилка завантаження даних",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [baseCurrency, router, mounted]);

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
          Переконайтесь, що API запущено на{" "}
          <code className="text-accent">http://localhost:5080</code>.
          <br />
          Оригінальна помилка: <code className="text-rose-600">{error}</code>
        </p>
        <button onClick={() => router.refresh()} className="btn-primary mt-4">
          Спробувати знову
        </button>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent align-[-0.125em]" />
          <p className="mt-2 text-sm text-muted">Завантаження аналітики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title + Currency Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">
            Огляд витрат
          </h1>
          <p className="mt-1 text-sm text-muted">
            Конвертована та детальна аналітика ваших підписок.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Валюта підсумків:
          </label>
          <select
            className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-accent"
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
          >
            {["UAH", "USD", "EUR"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Aggregates Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="label">Активних</div>
          <div className="font-display text-4xl font-black">
            {summary.totalActive}
          </div>
        </div>
        <div className="card p-5">
          <div className="label">На місяць</div>
          <div className="font-display text-4xl font-black text-accent">
            {money(summary.monthlyTotal, summary.baseCurrency)}
          </div>
        </div>
        <div className="card p-5">
          <div className="label">На рік</div>
          <div className="font-display text-4xl font-black">
            {money(summary.yearlyTotal, summary.baseCurrency)}
          </div>
        </div>
      </div>

      {/* Recharts Graphs Section */}
      <DashboardCharts
        byCategory={summary.byCategory}
        subscriptions={subscriptions}
        baseCurrency={summary.baseCurrency}
        rates={summary.rates}
      />

      {/* Upcoming Payments Section */}
      <div className="grid gap-6">
        <section className="card p-5">
          <h2 className="font-display text-lg font-bold">Найближчі списання</h2>
          {summary.upcomingPayments.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Нічого не заплановано.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {summary.upcomingPayments.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {s.website ? (
                      <img
                        src={`https://logo.clearbit.com/${s.website}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        alt=""
                        className="h-8 w-8 rounded-lg border border-ink/10 bg-white object-contain p-1"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-ink/5" />
                    )}
                    <div>
                      <div className="font-medium text-ink">{s.name}</div>
                      <div className="text-xs text-muted">
                        {new Date(s.nextPaymentDate).toLocaleDateString(
                          "uk-UA",
                        )}{" "}
                        ·{" "}
                        {
                          BILLING_LABELS[
                            s.billingCycle as keyof typeof BILLING_LABELS
                          ]
                        }
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {money(s.price, s.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/subscriptions"
            className="btn-ghost mt-4 w-full justify-center"
          >
            Усі підписки →
          </Link>
        </section>
      </div>
    </div>
  );
}
