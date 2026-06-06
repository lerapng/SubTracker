"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { BILLING_LABELS, STATUS_LABELS, type Subscription } from "@/lib/types";
import { CreditCard } from "lucide-react";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency }).format(n);
}

const statusColor: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-700",
  Paused: "bg-amber-500/15 text-amber-700",
  Cancelled: "bg-ink/10 text-muted",
};

export default function SubscriptionRow({ s }: { s: Subscription }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function remove() {
    if (!confirm(`Видалити «${s.name}»?`)) return;
    setBusy(true);
    try {
      await api.remove(s.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-ink/10 hover:bg-ink/[0.03]">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          {s.website && !imgError ? (
            <img
              src={`https://logo.clearbit.com/${s.website}`}
              onError={() => setImgError(true)}
              alt=""
              className="h-9 w-9 rounded-lg border border-ink/10 bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-ink/[0.03] text-muted">
              <CreditCard className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="font-medium text-ink">{s.name}</div>
            <div className="text-xs text-muted">{s.category}</div>
          </div>
        </div>
      </td>
      <td className="py-3 text-sm">{money(s.price, s.currency)}</td>
      <td className="py-3 text-sm text-muted">{BILLING_LABELS[s.billingCycle as keyof typeof BILLING_LABELS]}</td>
      <td className="py-3 text-sm">{new Date(s.nextPaymentDate).toLocaleDateString("uk-UA")}</td>
      <td className="py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[s.status]}`}>
          {STATUS_LABELS[s.status]}
        </span>
      </td>
      <td className="py-3 pr-4 text-right">
        <Link href={`/subscriptions/${s.id}/edit`} className="text-sm text-accent hover:underline">Змінити</Link>
        <button onClick={remove} disabled={busy} className="ml-3 text-sm text-muted hover:text-accent">
          {busy ? "…" : "Видалити"}
        </button>
      </td>
    </tr>
  );
}
