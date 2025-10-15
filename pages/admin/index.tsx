/**
 * Admin Dashboard Home
 * Main dashboard with business KPIs
 */
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LineChart } from "@/components/dashboard/LineChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { AlertsList } from "@/components/dashboard/AlertsList";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";

interface DashboardStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    trend: Array<{ date: string; amount: number }>;
  };
  transactions: {
    today: number;
    week: number;
    month: number;
    trend: Array<{ date: string; count: number }>;
  };
  users: {
    active: number;
    newThisWeek: number;
    total: number;
  };
  alerts: {
    count: number;
    items: Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      created_at: string;
    }>;
  };
  topProducts: Array<{
    producto_id: string;
    producto_nombre: string;
    cantidad: number;
    revenue: number;
  }>;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [revenue, transactions, users, alerts, topProducts] =
        await Promise.all([
          fetch("/api/stats/revenue").then((r) => r.json()),
          fetch("/api/stats/transactions").then((r) => r.json()),
          fetch("/api/stats/users").then((r) => r.json()),
          fetch("/api/stats/alerts?limit=5").then((r) => r.json()),
          fetch("/api/stats/top-products?period=today&limit=5").then((r) =>
            r.json()
          ),
        ]);

      setStats({
        revenue,
        transactions,
        users,
        alerts,
        topProducts,
      });
    } catch (error) {
      // Error loading stats - silently fail
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-lg text-muted-foreground">
            Cargando estadísticas...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Dashboard - Resumen General
          </h3>
          <p className="text-muted-foreground">
            Visión general de los KPIs críticos del negocio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Revenue Hoy"
            value={formatCurrency(stats?.revenue.today || 0)}
            trend={calculateTrend(
              stats?.revenue.today || 0,
              stats?.revenue.week && stats?.revenue.today
                ? (stats.revenue.week - stats.revenue.today) / 6
                : 0
            )}
            icon={DollarSign}
          />
          <StatsCard
            title="Ventas Hoy"
            value={stats?.transactions.today || 0}
            trend={calculateTrend(
              stats?.transactions.today || 0,
              stats?.transactions.week && stats?.transactions.today
                ? (stats.transactions.week - stats.transactions.today) / 6
                : 0
            )}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Usuarios Activos"
            value={stats?.users.active || 0}
            trend={`${stats?.users.newThisWeek || 0} nuevos esta semana`}
            icon={Users}
          />
          <StatsCard
            title="Alertas"
            value={stats?.alerts.count || 0}
            variant={stats?.alerts.count && stats.alerts.count > 0 ? "destructive" : "default"}
            icon={AlertTriangle}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <LineChart
            title="Revenue - Últimos 7 días"
            data={stats?.revenue.trend || []}
            dataKey="amount"
            valueFormatter={formatCurrency}
          />
          <TopProducts products={stats?.topProducts || []} />
        </div>

        {/* Alerts */}
        <AlertsList alerts={stats?.alerts.items || []} />
      </div>
    </DashboardLayout>
  );
}
