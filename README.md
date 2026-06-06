# Облік підписок та сервісів — MVP

Веб-застосунок для відстеження ваших підписок: скільки коштують, коли наступне списання, скільки виходить на місяць і рік.

- **Backend:** ASP.NET Core 8 Web API (C#) · EF Core · SQLite · Swagger
- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS

---

## Можливості MVP

- CRUD підписок: назва, категорія, ціна, валюта, цикл оплати, статус, дата наступного списання, нотатки.
- Дашборд: кількість активних, сумарна вартість на місяць/рік, розподіл за категоріями, найближчі списання.
- Нормалізація вартості до «на місяць» для будь-якого циклу (тиждень/місяць/квартал/рік).
- Демо-дані при першому запуску.

---

## Швидкий старт

### Вимоги
- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)

### 1. Backend
```bash
cd backend
dotnet run
```
- API: `http://localhost:5080`
- Swagger UI: `http://localhost:5080/swagger`
- БД `subscriptions.db` (SQLite) створюється автоматично.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # за потреби змініть NEXT_PUBLIC_API_URL
npm run dev
```
- Застосунок: `http://localhost:3000`

> Спочатку запускайте backend, потім frontend.

---

## API

| Метод | Шлях | Опис |
|-------|------|------|
| GET    | `/api/subscriptions`      | Список підписок |
| GET    | `/api/subscriptions/{id}` | Одна підписка |
| POST   | `/api/subscriptions`      | Створити |
| PUT    | `/api/subscriptions/{id}` | Оновити |
| DELETE | `/api/subscriptions/{id}` | Видалити |
| GET    | `/api/summary`            | Зведена статистика |

Приклад тіла для POST/PUT:
```json
{
  "name": "Netflix",
  "category": "Стрімінг",
  "price": 9.99,
  "currency": "USD",
  "billingCycle": "Monthly",
  "status": "Active",
  "nextPaymentDate": "2026-06-15",
  "notes": "Сімейний план"
}
```

`billingCycle`: `Monthly` | `Yearly` | `Weekly` | `Quarterly`
`status`: `Active` | `Paused` | `Cancelled`

---

## Структура

```
subscription-tracker/
├── SKILL.md            # Skill для роботи з цим проєктом
├── README.md
├── backend/            # ASP.NET Core Web API
└── frontend/           # Next.js + TypeScript
```

---

## Що далі (поза MVP)

- Автентифікація користувачів (підписки в розрізі акаунта).
- Нагадування про списання (email / пуш).
- Конвертація валют за курсом.
- EF Core міграції + PostgreSQL замість SQLite для production.
- Графіки динаміки витрат у часі.
