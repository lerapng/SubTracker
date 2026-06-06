"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(api.getUserEmail());
  }, [pathname]);

  function handleLogout() {
    api.logout();
    setEmail(null);
    router.push("/login");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl font-black tracking-tight">
          Підписки<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {email ? (
            <>
              <Link href="/" className={`btn-ghost ${pathname === "/" ? "bg-ink/5" : ""}`}>
                Дашборд
              </Link>
              <Link
                href="/subscriptions"
                className={`btn-ghost ${pathname.startsWith("/subscriptions") && pathname !== "/subscriptions/new" ? "bg-ink/5" : ""}`}
              >
                Список
              </Link>
              <Link href="/subscriptions/new" className="btn-primary">
                + Додати
              </Link>
              <div className="h-4 w-px bg-ink/15" />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted max-w-[120px] truncate" title={email}>
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-muted hover:text-accent transition"
                >
                  Вихід
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <>
                <Link href="/login" className="btn-ghost">
                  Увійти
                </Link>
                <Link href="/register" className="btn-primary">
                  Реєстрація
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
