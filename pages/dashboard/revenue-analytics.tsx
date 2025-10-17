import { useEffect, useState } from "react";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/dashboard/components/ui/card";
import { Badge } from "@/dashboard/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, DollarSign, Percent, Users } from "lucide-react";

interface NetworkStats {
  total_service_points: number;
  total_csp: number;
  total_css: number;
  total_csh: number;
  total_gross_revenue: number;
  total_partner_commission: number;
  total_network_revenue: number;
  revenue_by_stream: {
    [key: string]: {
      gross_amount: number;
      partner_commission: number;
      network_revenue: number;
      count: number;
    };
  };
}

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/service-points/stats");
      const stats = await response.json();
      setData(stats);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const revenueStreamLabels: { [key: string]: string } = {
    vending: "Vending",
    workshop_rental: "Taller Self-Service",
    bike_wash: "Lavado Bicis",
    ebike_charging: "Carga e-Bikes",
    workshop_commission: "Servicios Profesionales",
    advertising: "Publicidad",
    subscriptions: "Subscripciones",
    luggage_transport: "Transporte Equipaje",
    accommodation_commission: "Comisión Alojamiento",
    spare_parts: "Repuestos",
    licensing: "Licencias",
  };

  const revenueStreamColors: { [key: string]: string } = {
    vending: "#3b82f6",
    workshop_rental: "#10b981",
    bike_wash: "#f59e0b",
    ebike_charging: "#8b5cf6",
    workshop_commission: "#ec4899",
    advertising: "#06b6d4",
    subscriptions: "#f97316",
    luggage_transport: "#84cc16",
    accommodation_commission: "#14b8a6",
    spare_parts: "#6366f1",
    licensing: "#a855f7",
  };

  // Prepare data for charts
  const revenueByStreamData = data?.revenue_by_stream
    ? Object.entries(data.revenue_by_stream).map(([key, value]) => ({
        name: revenueStreamLabels[key] || key,
        gross: value.gross_amount,
        partner: value.partner_commission,
        network: value.network_revenue,
        count: value.count,
        color: revenueStreamColors[key] || "#666",
      }))
    : [];

  const topStreamsData = [...revenueByStreamData]
    .sort((a, b) => b.network - a.network)
    .slice(0, 5);

  const revenueDistribution = revenueByStreamData.map((item) => ({
    name: item.name,
    value: item.network,
  }));

  const commissionBreakdown = [
    {
      name: "Revenue Camino",
      value: data?.total_network_revenue || 0,
      color: "#10b981",
    },
    {
      name: "Comisiones Partners",
      value: data?.total_partner_commission || 0,
      color: "#3b82f6",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-muted-foreground">
            Cargando analytics...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Revenue Analytics
          </h3>
          <p className="text-muted-foreground">
            Análisis detallado de los 11 flujos de ingresos de la red Camino
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Bruto Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data?.total_gross_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                De {Object.keys(data?.revenue_by_stream || {}).length} streams
                activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Camino
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data?.total_network_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.total_gross_revenue
                  ? `${Math.round(
                      (data.total_network_revenue / data.total_gross_revenue) *
                        100
                    )}%`
                  : "0%"}{" "}
                del bruto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comisiones Partners
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data?.total_partner_commission || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.total_gross_revenue
                  ? `${Math.round(
                      (data.total_partner_commission /
                        data.total_gross_revenue) *
                        100
                    )}%`
                  : "0%"}{" "}
                del bruto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Margen Promedio
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.total_gross_revenue
                  ? `${Math.round(
                      (data.total_network_revenue / data.total_gross_revenue) *
                        100
                    )}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Después de comisiones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Distribution Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Revenue por Stream</CardTitle>
              <CardDescription>
                Revenue neto para Camino por tipo de servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          revenueStreamColors[
                            Object.keys(revenueStreamLabels).find(
                              (k) => revenueStreamLabels[k] === entry.name
                            ) || ""
                          ] || "#666"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Bruto vs Neto</CardTitle>
              <CardDescription>
                Comparación de ingresos antes y después de comisiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={commissionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) =>
                      `${name}: ${formatCurrency(Number(value))}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {commissionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Revenue Streams */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Revenue Streams</CardTitle>
            <CardDescription>
              Principales fuentes de ingresos netos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStreamsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="gross" fill="#94a3b8" name="Bruto" />
                <Bar dataKey="partner" fill="#3b82f6" name="Comisión Partner" />
                <Bar dataKey="network" fill="#10b981" name="Revenue Camino" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* All Revenue Streams Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Todos los Revenue Streams</CardTitle>
            <CardDescription>
              Bruto, comisiones y revenue neto por servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueByStreamData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="gross" fill="#94a3b8" name="Bruto" />
                <Bar dataKey="partner" fill="#3b82f6" name="Comisión Partner" />
                <Bar dataKey="network" fill="#10b981" name="Revenue Camino" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Streams Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Revenue Streams</CardTitle>
            <CardDescription>
              Breakdown completo por tipo de servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByStreamData.map((stream, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: stream.color }}
                      />
                      <h4 className="font-medium">{stream.name}</h4>
                      <Badge variant="outline">
                        {stream.count} transacciones
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(stream.network)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Revenue Camino
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Bruto</div>
                      <div className="font-medium">
                        {formatCurrency(stream.gross)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Comisión Partner
                      </div>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(stream.partner)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Margen</div>
                      <div className="font-medium">
                        {stream.gross > 0
                          ? `${Math.round(
                              (stream.network / stream.gross) * 100
                            )}%`
                          : "0%"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {revenueByStreamData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de revenue disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
