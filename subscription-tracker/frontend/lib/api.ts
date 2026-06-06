import type { Subscription, SubscriptionInput, Summary } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    cache: "no-store",
    ...init,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      // Only redirect if we are not already on the login or register page
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.location.href = "/login";
      }
    }
    throw new Error("Неавторизовано");
  }

  if (!res.ok) {
    let errMsg = "";
    try {
      const data = await res.json();
      // Handle identity errors
      if (data.errors) {
        errMsg = Object.values(data.errors).flat().join(" ");
      } else if (data.detail) {
        errMsg = data.detail;
      }
    } catch {
      errMsg = await res.text().catch(() => "");
    }
    throw new Error(errMsg || `Помилка API ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  login: async (email: string, password: string) => {
    const data = await request<{ accessToken: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("userEmail", email);
    }
    return data;
  },
  register: (email: string, password: string) =>
    request<void>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    }
  },
  getUserEmail: () => {
    return typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  },
  isAuthenticated: () => {
    return typeof window !== "undefined" ? !!localStorage.getItem("token") : false;
  },
  list: () => request<Subscription[]>("/api/subscriptions"),
  get: (id: number) => request<Subscription>(`/api/subscriptions/${id}`),
  create: (data: SubscriptionInput) =>
    request<Subscription>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: SubscriptionInput) =>
    request<Subscription>(`/api/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/api/subscriptions/${id}`, { method: "DELETE" }),
  summary: (baseCurrency = "UAH") => request<Summary>(`/api/summary?baseCurrency=${baseCurrency}`),
};
