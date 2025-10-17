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
import { Button } from "@/dashboard/components/ui/button";
import { RefreshCw, Download, Search } from "lucide-react";

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments");
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentIntentId: string) => {
    if (!confirm("¿Estás seguro de que quieres reembolsar este pago?")) return;

    try {
      const response = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (response.ok) {
        alert("Reembolso procesado exitosamente");
        fetchPayments();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Error al procesar el reembolso");
    }
  };

  const handleCancel = async (paymentIntentId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar este pago?")) return;

    try {
      const response = await fetch("/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (response.ok) {
        alert("Pago cancelado exitosamente");
        fetchPayments();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error canceling payment:", error);
      alert("Error al cancelar el pago");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Completado</Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Procesando</Badge>
        );
      case "requires_payment_method":
        return <Badge variant="secondary">Requiere Pago</Badge>;
      case "requires_confirmation":
        return <Badge variant="secondary">Requiere Confirmación</Badge>;
      case "requires_action":
        return <Badge variant="secondary">Requiere Acción</Badge>;
      case "canceled":
        return <Badge variant="outline">Cancelado</Badge>;
      case "failed":
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesFilter = filter === "all" || payment.status === filter;
    const matchesSearch =
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["ID", "Cliente", "Monto", "Estado", "Fecha"];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.customerName || p.customerId,
      formatCurrency(p.amount, p.currency),
      p.status,
      formatDate(p.created),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pagos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Gestión de Pagos</h3>
            <p className="text-sm text-muted-foreground">
              Administra y monitorea todas las transacciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={fetchPayments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-[300px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar:</span>
                <div className="flex gap-1">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filter === "succeeded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("succeeded")}
                  >
                    Completados
                  </Button>
                  <Button
                    variant={filter === "processing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("processing")}
                  >
                    Procesando
                  </Button>
                  <Button
                    variant={filter === "failed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("failed")}
                  >
                    Fallidos
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones ({filteredPayments.length})</CardTitle>
            <CardDescription>
              Lista completa de pagos procesados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando pagos...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID de Pago</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.id.substring(0, 20)}...
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.customerName || payment.customerId}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.description || "-"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(payment.created)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {payment.status === "succeeded" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRefund(payment.id)}
                                >
                                  Reembolsar
                                </Button>
                              )}
                              {(payment.status === "requires_payment_method" ||
                                payment.status === "requires_confirmation") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(payment.id)}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No se encontraron pagos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
