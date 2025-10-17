import { useEffect, useState } from "react";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/dashboard/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/dashboard/components/ui/table";
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
} from "recharts";
import {
  DollarSign,
  CreditCard,
  Activity,
  Users,
  Store,
  Wrench,
  MapPin,
  TrendingUp,
} from "lucide-react";

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

interface DashboardData {
  networkStats: NetworkStats;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch network stats from new endpoint
      const statsResponse = await fetch("/api/service-points/stats");
      const networkStats = await statsResponse.json();

      setData({
        networkStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  const COLORS = {
    CSP: "#3b82f6",
    CSS: "#10b981",
    CSH: "#a855f7",
  };

  const servicePointsData = [
    {
      name: "CSP - Partner",
      value: data?.networkStats.total_csp || 0,
      color: COLORS.CSP,
    },
    {
      name: "CSS - Propio",
      value: data?.networkStats.total_css || 0,
      color: COLORS.CSS,
    },
    {
      name: "CSH - Taller Aliado",
      value: data?.networkStats.total_csh || 0,
      color: COLORS.CSH,
    },
  ];

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

  const topRevenueStreams = data?.networkStats.revenue_by_stream
    ? Object.entries(data.networkStats.revenue_by_stream)
        .map(([key, value]) => ({
          name: revenueStreamLabels[key] || key,
          revenue: value.network_revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6)
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-muted-foreground">Cargando...</div>
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
            Dashboard de Red Camino
          </h3>
          <p className="text-muted-foreground">
            Resumen de la red de Service Points y revenue streams
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Service Points
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.networkStats.total_service_points || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                CSP: {data?.networkStats.total_csp || 0} | CSS:{" "}
                {data?.networkStats.total_css || 0} | CSH:{" "}
                {data?.networkStats.total_csh || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Bruto
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data?.networkStats.total_gross_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total generado en la red
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Camino
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data?.networkStats.total_network_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.networkStats.total_gross_revenue
                  ? `${Math.round(
                      (data.networkStats.total_network_revenue /
                        data.networkStats.total_gross_revenue) *
                        100
                    )}%`
                  : "0%"}{" "}
                del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comisiones Partners
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  data?.networkStats.total_partner_commission || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.networkStats.total_gross_revenue
                  ? `${Math.round(
                      (data.networkStats.total_partner_commission /
                        data.networkStats.total_gross_revenue) *
                        100
                    )}%`
                  : "0%"}{" "}
                del total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Service Points Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Service Points</CardTitle>
              <CardDescription>Por tipo de punto</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={servicePointsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {servicePointsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Revenue Streams */}
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Streams</CardTitle>
              <CardDescription>Por revenue de Camino</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRevenueStreams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Points by Type */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                CSP - Partner
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {data?.networkStats.total_csp || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                En albergues, hoteles, gasolineras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                CSS - Propio
              </CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data?.networkStats.total_css || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                100% Camino - Máxima rentabilidad
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                CSH - Taller Aliado
              </CardTitle>
              <Wrench className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {data?.networkStats.total_csh || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Talleres integrados con comisión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Revenue por Stream</CardTitle>
            <CardDescription>Ingresos por tipo de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Revenue Stream</TableHead>
                  <TableHead className="text-right">Revenue Bruto</TableHead>
                  <TableHead className="text-right">
                    Comisión Partners
                  </TableHead>
                  <TableHead className="text-right">Revenue Camino</TableHead>
                  <TableHead className="text-right">Transacciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.networkStats.revenue_by_stream &&
                  Object.entries(data.networkStats.revenue_by_stream).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {revenueStreamLabels[key] || key}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(value.gross_amount)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(value.partner_commission)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(value.network_revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {value.count}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                {(!data?.networkStats.revenue_by_stream ||
                  Object.keys(data.networkStats.revenue_by_stream).length ===
                    0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay datos de revenue aún
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
