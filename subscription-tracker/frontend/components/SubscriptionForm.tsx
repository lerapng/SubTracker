"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import {
  BILLING_LABELS,
  STATUS_LABELS,
  type BillingCycle,
  type SubscriptionInput,
  type SubscriptionStatus,
} from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

interface PopularService {
  name: string;
  category: string;
  price: number;
  currency: string;
  website: string;
}

const POPULAR_SERVICES: PopularService[] = [
  { name: "Netflix", category: "Стрімінг", price: 9.99, currency: "EUR", website: "netflix.com" },
  { name: "Spotify", category: "Музика", price: 4.99, currency: "USD", website: "spotify.com" },
  { name: "YouTube Premium", category: "Стрімінг", price: 149.00, currency: "UAH", website: "youtube.com" },
  { name: "GitHub Pro", category: "Інструменти", price: 4.00, currency: "USD", website: "github.com" },
  { name: "iCloud+", category: "Хмара", price: 0.99, currency: "USD", website: "apple.com" },
  { name: "ChatGPT Plus", category: "Інструменти", price: 20.00, currency: "USD", website: "openai.com" },
  { name: "Zoom", category: "Робота", price: 14.99, currency: "USD", website: "zoom.us" },
  { name: "Adobe Creative Cloud", category: "Дизайн", price: 54.99, currency: "USD", website: "adobe.com" },
  { name: "PlayStation Plus", category: "Ігри", price: 229.00, currency: "UAH", website: "playstation.com" },
  { name: "Xbox Game Pass", category: "Ігри", price: 190.00, currency: "UAH", website: "xbox.com" },
];

export default function SubscriptionForm({
  id,
  initial,
}: {
  id?: number;
  initial?: SubscriptionInput;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SubscriptionInput>(
    initial ?? {
      name: "",
      category: "Інше",
      price: 0,
      currency: "UAH",
      billingCycle: "Monthly",
      status: "Active",
      nextPaymentDate: todayISO(),
      notes: "",
      website: "",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<PopularService[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function set<K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(val: string) {
    set("name", val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = POPULAR_SERVICES.filter((s) =>
      s.name.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }

  function selectSuggestion(service: PopularService) {
    setForm((f) => ({
      ...f,
      name: service.name,
      category: service.category,
      price: service.price,
      currency: service.currency,
      website: service.website,
    }));
    setShowSuggestions(false);
  }

  async function handleSubmit() {
    setError(null);
    if (!form.name.trim()) return setError("Вкажіть назву підписки.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        website: form.website?.trim() || null,
      };
      if (id) await api.update(id, payload);
      else await api.create(payload);
      router.push("/subscriptions");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка збереження");
      setSaving(false);
    }
  }

  return (
    <div className="card max-w-xl p-6">
      <h1 className="font-display text-2xl font-bold">
        {id ? "Редагувати підписку" : "Нова підписка"}
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Name input with Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="label">Назва</label>
          <input
            className="field"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Netflix, Spotify..."
            autoComplete="off"
          />

          {showSuggestions && (
            <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-ink/10 bg-white shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-ink/[0.04] transition"
                >
                  <img
                    src={`https://logo.clearbit.com/${s.website}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    alt=""
                    className="h-5 w-5 rounded object-contain"
                  />
                  <div>
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="ml-2 text-xs text-muted">
                      ({s.category} · {s.price} {s.currency})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Website Domain input */}
        <div>
          <label className="label">Сайт (домен для логотипа)</label>
          <input
            className="field"
            value={form.website ?? ""}
            onChange={(e) => set("website", e.target.value)}
            placeholder="netflix.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Категорія</label>
            <input className="field" value={form.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div>
            <label className="label">Статус</label>
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value as SubscriptionStatus)}>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="label">Ціна</label>
            <input type="number" min={0} step="0.01" className="field" value={form.price}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Валюта</label>
            <select className="field" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {["UAH", "USD", "EUR"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Цикл оплати</label>
            <select className="field" value={form.billingCycle} onChange={(e) => set("billingCycle", e.target.value as BillingCycle)}>
              {Object.entries(BILLING_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Наступне списання</label>
            <input type="date" className="field" value={form.nextPaymentDate}
              onChange={(e) => set("nextPaymentDate", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Нотатки</label>
          <textarea className="field" rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? "Збереження…" : id ? "Зберегти" : "Створити"}
        </button>
        <button className="btn-ghost" onClick={() => router.back()}>Скасувати</button>
      </div>
    </div>
  );
}
