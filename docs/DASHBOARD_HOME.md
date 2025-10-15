# Dashboard Home - Implementation Guide

## Overview

The Dashboard Home page (`/admin`) displays critical business KPIs at a glance, following the design specification in issue #5.

## Structure

### 1. Stats Cards (4-column grid)

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Revenue Hoy │ Ventas Hoy  │ Usuarios    │  Alertas    │
│   €1,234    │     89      │    234      │     5       │
│   +12% ↑    │   +5% ↑     │   +8% ↑     │    🔴       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 2. Charts Section (2-column grid)

```
┌────────────────────────────┬──────────────────────┐
│ Revenue - Últimos 7 días   │  Top 5 Productos     │
│                            │                      │
│  [Line Chart with Recharts]│  1. Coca Cola (45)   │
│                            │  2. Snickers (32)    │
│                            │  3. Agua (28)        │
│                            │  4. KitKat (22)      │
│                            │  5. Doritos (18)     │
└────────────────────────────┴──────────────────────┘
```

### 3. Alerts Section (full width)

```
┌────────────────────────────────────────────────────┐
│ 🚨 Alertas Críticas (5)                            │
├────────────────────────────────────────────────────┤
│ 🔴 Stock bajo en Slot #12 - Solo 2 unidades       │
│ 🟡 Warehouse bajo mínimo: Coca Cola (10/50)       │
│ 🟡 5 Stock Requests pendientes de aprobar         │
│ 🟡 Pago fallido - Booking #234                    │
└────────────────────────────────────────────────────┘
```

## Components

### StatsCard

**Props:**

- `title: string` - Card title
- `value: string | number` - Main value to display
- `trend?: string` - Trend indicator (e.g., "+12%")
- `icon: LucideIcon` - Icon component
- `variant?: "default" | "destructive"` - Card style variant

**Features:**

- Automatic trend coloring (green for +, red for -)
- Destructive variant for alerts
- Responsive text sizing

### LineChart

**Props:**

- `title: string` - Chart title
- `data: Array<{ date: string; amount: number }>` - Data points
- `dataKey?: string` - Key for value field (default: "amount")
- `valueFormatter?: (value: number) => string` - Custom value formatter

**Features:**

- Built with Recharts
- Automatic date formatting (es-ES locale)
- Responsive container
- Tooltip with formatted values

### TopProducts

**Props:**

- `products: Array<{ producto_id, producto_nombre, cantidad, revenue }>` - Product list

**Features:**

- Numbered ranking (1-5)
- Shows quantity and revenue
- Currency formatting (EUR)
- Empty state handling

### AlertsList

**Props:**

- `alerts: Array<{ id, type, severity, message, created_at }>` - Alert list

**Features:**

- Color-coded severity (🔴 critical, 🟡 warning)
- Badge indicators
- Timestamp formatting
- Empty state with success message

## API Endpoints

### GET /api/stats/revenue

Returns revenue statistics for different periods.

**Response:**

```json
{
  "today": 123400,
  "week": 567800,
  "month": 2345600,
  "trend": [
    { "date": "2025-10-08", "amount": 100000 },
    { "date": "2025-10-09", "amount": 125000 },
    ...
  ]
}
```

### GET /api/stats/transactions

Returns transaction counts for different periods.

**Response:**

```json
{
  "today": 45,
  "week": 234,
  "month": 1089,
  "trend": [
    { "date": "2025-10-08", "count": 30 },
    { "date": "2025-10-09", "count": 45 },
    ...
  ]
}
```

### GET /api/stats/users

Returns user statistics.

**Response:**

```json
{
  "active": 234,
  "newThisWeek": 12,
  "total": 1567
}
```

### GET /api/stats/top-products?period=today&limit=5

Returns top selling products.

**Query Parameters:**

- `period` - "today" | "week" | "month" (default: "today")
- `limit` - Number of products (default: 5, max: 20)

**Response:**

```json
[
  {
    "producto_id": "uuid",
    "producto_nombre": "Coca Cola",
    "cantidad": 45,
    "revenue": 4500
  },
  ...
]
```

### GET /api/stats/alerts?limit=5

Returns critical business alerts.

**Query Parameters:**

- `limit` - Number of alerts (default: 5, max: 50)

**Response:**

```json
{
  "count": 5,
  "items": [
    {
      "id": "stock-slot-uuid",
      "type": "stock",
      "severity": "critical",
      "message": "Stock bajo en Slot #12 - Solo 2 unidades",
      "created_at": "2025-10-15T12:00:00Z"
    },
    ...
  ]
}
```

## Data Sources

The dashboard aggregates data from multiple tables:

- **Revenue**: `ventas_app` (completed) + `payments` (succeeded)
- **Transactions**: Count of completed ventas + succeeded payments
- **Users**: `users` table with last_login tracking
- **Products**: `ventas_app` aggregated by producto_id
- **Alerts**:
  - Low stock: `vending_machine_slots` (stock_actual <= 2)
  - Warehouse: `warehouse_inventory` (cantidad < stock_minimo)
  - Failed payments: `payments` (status = failed, last 24h)
  - Stock requests: `stock_requests` (estado = pendiente)

## Usage

Navigate to `/admin` to access the dashboard home page.

The page automatically loads all stats on mount and displays:

1. Current KPIs with trends
2. 7-day revenue chart
3. Top 5 products
4. Up to 5 critical alerts

## Responsive Design

The dashboard uses Tailwind CSS grid utilities:

- **Mobile**: Single column layout
- **Tablet (md)**: 2-column grid for charts
- **Desktop (lg)**: 4-column grid for stats cards

## Future Enhancements

Potential improvements for future sprints:

- [ ] Real-time updates with WebSocket
- [ ] Configurable date ranges
- [ ] Export to CSV/PDF
- [ ] Custom KPI configuration
- [ ] Machine offline detection
- [ ] Performance optimization with caching
