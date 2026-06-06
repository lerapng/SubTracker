"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import SubscriptionForm from "@/components/SubscriptionForm";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!api.isAuthenticated()) {
      router.push("/login");
    }
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

  return <SubscriptionForm />;
}
