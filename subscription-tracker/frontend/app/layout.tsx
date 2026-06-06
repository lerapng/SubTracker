import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Облік підписок",
  description: "Веб-застосунок для обліку підписок та сервісів",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-5 py-10 text-xs text-muted">
          MVP — облік підписок та сервісів · Next.js + ASP.NET Core
        </footer>
      </body>
    </html>
  );
}
