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
import { Input } from "@/dashboard/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";

interface Booking {
  id: string;
  user_id: string;
  user_name?: string;
  service_point_id: string;
  service_point_name?: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service_type?: string;
  notes?: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Reserva aprobada exitosamente");
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Error al aprobar la reserva");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return;

    try {
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Reserva cancelada exitosamente");
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Error al cancelar la reserva");
    }
  };

  const handleReschedule = async (id: string) => {
    const newDate = prompt("Ingrese la nueva fecha (YYYY-MM-DD):");
    const newTime = prompt("Ingrese la nueva hora (HH:MM):");

    if (!newDate || !newTime) return;

    try {
      const response = await fetch(`/api/bookings/${id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_date: newDate, booking_time: newTime }),
      });

      if (response.ok) {
        alert("Reserva reprogramada exitosamente");
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      alert("Error al reprogramar la reserva");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmada</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "completed":
        return <Badge variant="secondary">Completada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_point_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Reservas</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona y monitorea todas las reservas
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por usuario o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-[300px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <div className="flex gap-1">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pendientes
                  </Button>
                  <Button
                    variant={
                      filterStatus === "confirmed" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterStatus("confirmed")}
                  >
                    Confirmadas
                  </Button>
                  <Button
                    variant={
                      filterStatus === "completed" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterStatus("completed")}
                  >
                    Completadas
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Lista de todas las reservas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Tipo de Servicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.user_name || "Usuario desconocido"}
                        </TableCell>
                        <TableCell>
                          {booking.service_point_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(booking.booking_date)} -{" "}
                            {booking.booking_time}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.service_type || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(booking.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprobar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReschedule(booking.id)}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Reprogramar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron reservas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
