"use client";

import { notFound, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import SubscriptionForm from "@/components/SubscriptionForm";
import type { Subscription } from "@/lib/types";

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [mounted, setMounted] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (Number.isNaN(id)) {
      notFound();
    }

    if (!api.isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function loadSub() {
      setLoading(true);
      setError(null);
      try {
        const s = await api.get(id);
        setSub(s);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка завантаження підписки");
      } finally {
        setLoading(false);
      }
    }

    loadSub();
  }, [id, router, mounted]);

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
        <h1 className="font-display text-2xl font-bold">Підписку не знайдено</h1>
        <p className="mt-2 text-sm text-muted">
          Помилка: <code className="text-rose-600">{error}</code>
        </p>
        <button onClick={() => router.back()} className="btn-ghost mt-4">
          Назад
        </button>
      </div>
    );
  }

  if (loading || !sub) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent align-[-0.125em]" />
          <p className="mt-2 text-sm text-muted">Завантаження підписки...</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionForm
      id={sub.id}
      initial={{
        name: sub.name,
        category: sub.category,
        price: sub.price,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        status: sub.status,
        nextPaymentDate: sub.nextPaymentDate.slice(0, 10),
        notes: sub.notes ?? "",
        website: sub.website ?? "",
      }}
    />
  );
}
