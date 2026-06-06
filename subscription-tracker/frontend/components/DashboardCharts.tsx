"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Subscription } from "@/lib/types";

interface DashboardChartsProps {
  byCategory: Record<string, number>;
  subscriptions: Subscription[];
  baseCurrency: string;
  rates: Record<string, number>;
}

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#f43f5e", // Rose
];

export default function DashboardCharts({
  byCategory,
  subscriptions,
  baseCurrency,
  rates,
}: DashboardChartsProps) {
  // 1. Prepare Pie Chart Data
  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 2. Prepare 6-Month Projection Data
  const ukrMonths = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
  const now = new Date();
  const projectionData = [];

  for (let i = 0; i < 6; i++) {
    const mDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthIndex = mDate.getMonth();
    const year = mDate.getFullYear();
    const label = `${ukrMonths[monthIndex]} ${year.toString().slice(-2)}`;

    let total = 0;

    subscriptions.forEach((s) => {
      if (s.status !== "Active") return;

      // Convert price from s.currency to baseCurrency
      const safeRates = rates || {};
      const rateFrom = safeRates[s.currency] || 1;
      const rateTo = safeRates[baseCurrency] || 1;
      const priceInBase = s.price / rateFrom * rateTo;

      const payDate = new Date(s.nextPaymentDate);

      // Check how many payments occur in this specific month
      let count = 0;
      if (s.billingCycle === "Weekly") {
        count = 4.33; // Approximation
      } else if (s.billingCycle === "Monthly") {
        count = 1;
      } else if (s.billingCycle === "Quarterly") {
        const diffMonths = (year - payDate.getFullYear()) * 12 + (monthIndex - payDate.getMonth());
        if (diffMonths >= 0 && diffMonths % 3 === 0) {
          count = 1;
        }
      } else if (s.billingCycle === "Yearly") {
        const diffMonths = (year - payDate.getFullYear()) * 12 + (monthIndex - payDate.getMonth());
        if (diffMonths >= 0 && diffMonths % 12 === 0) {
          count = 1;
        }
      }

      total += priceInBase * count;
    });

    projectionData.push({
      name: label,
      "Витрати": Math.round(total),
    });
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: baseCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category Pie Chart */}
      <div className="card p-5 flex flex-col justify-between min-h-[350px]">
        <h3 className="font-display text-lg font-bold text-ink">Розподіл за категоріями</h3>
        {pieData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted">
            Немає даних для побудови графіка
          </div>
        ) : (
          <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatValue(Number(value)), "Витрати"]}
                    contentStyle={{
                      backgroundColor: "#1a1a17",
                      borderRadius: "8px",
                      color: "#f4f1ea",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <ul className="text-xs space-y-2 flex-1 max-w-[200px]">
              {pieData.slice(0, 5).map((entry, index) => (
                <li key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate flex-1 font-medium" title={entry.name}>
                    {entry.name}
                  </span>
                  <span className="text-muted font-mono">{formatValue(entry.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 6-Month Projection Bar Chart */}
      <div className="card p-5 flex flex-col justify-between min-h-[350px]">
        <h3 className="font-display text-lg font-bold text-ink">Прогноз витрат (на 6 міс.)</h3>
        <div className="h-[230px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a17" strokeOpacity={0.06} />
              <XAxis
                dataKey="name"
                stroke="#8a857a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8a857a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                formatter={(value: any) => [formatValue(Number(value)), "Прогноз"]}
                contentStyle={{
                  backgroundColor: "#1a1a17",
                  borderRadius: "8px",
                  color: "#f4f1ea",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              <Bar dataKey="Витрати" fill="#c2410c" radius={[4, 4, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
