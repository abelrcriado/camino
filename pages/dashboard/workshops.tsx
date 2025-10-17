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
import { Label } from "@/dashboard/components/ui/label";
import { Textarea } from "@/dashboard/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/dashboard/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  Wrench,
  Users,
  Building2,
  Info,
} from "lucide-react";

interface ServicePoint {
  id: string;
  name: string;
  type: "CSP" | "CSS" | "CSH";
  workshop_name?: string;
  has_professional_service?: boolean;
  city?: string;
  province?: string;
}

interface Workshop {
  id: string;
  name: string;
  service_point_id: string;
  service_point?: ServicePoint;
  service_point_name?: string;
  description?: string;
  services_offered: string[];
  operating_hours: string;
  status: string;
  created_at: string;
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    service_point_id: "",
    description: "",
    services_offered: "",
    operating_hours: "9:00-18:00",
    status: "active",
  });

  useEffect(() => {
    fetchWorkshops();
    fetchServicePoints();
  }, []);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workshops");
      const data = await response.json();
      setWorkshops(data.workshops || []);
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePoints = async () => {
    try {
      // Fetch all service points and filter for those with professional service
      const response = await fetch("/api/service-points");
      const data = await response.json();
      // Filter to show only CSH or points with professional service
      const filtered = (data || []).filter(
        (sp: ServicePoint) => sp.type === "CSH" || sp.has_professional_service
      );
      setServicePoints(filtered);
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  };

  const handleCreate = () => {
    setEditingWorkshop(null);
    setFormData({
      name: "",
      service_point_id: "",
      description: "",
      services_offered: "",
      operating_hours: "9:00-18:00",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      name: workshop.name,
      service_point_id: workshop.service_point_id,
      description: workshop.description || "",
      services_offered: workshop.services_offered?.join(", ") || "",
      operating_hours: workshop.operating_hours,
      status: workshop.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este taller?")) return;

    try {
      const response = await fetch(`/api/workshops/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Taller eliminado exitosamente");
        fetchWorkshops();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting workshop:", error);
      alert("Error al eliminar el taller");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      services_offered: formData.services_offered
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    const url = editingWorkshop
      ? `/api/workshops/${editingWorkshop.id}`
      : "/api/workshops";
    const method = editingWorkshop ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(
          editingWorkshop
            ? "Taller actualizado exitosamente"
            : "Taller creado exitosamente"
        );
        setIsDialogOpen(false);
        fetchWorkshops();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving workshop:", error);
      alert("Error al guardar el taller");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "full":
        return <Badge className="bg-yellow-500">Completo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServicePointTypeBadge = (type: string) => {
    switch (type) {
      case "CSH":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-700 border-purple-300"
          >
            <Wrench className="h-3 w-3 mr-1" />
            CSH - Taller Aliado
          </Badge>
        );
      case "CSS":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 border-green-300"
          >
            <Building2 className="h-3 w-3 mr-1" />
            CSS - Propio
          </Badge>
        );
      case "CSP":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-300"
          >
            <Users className="h-3 w-3 mr-1" />
            CSP - Partner
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredWorkshops = workshops.filter(
    (workshop) =>
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.service_point_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Talleres Profesionales</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona talleres con servicios profesionales (CSH y puntos con
              mecánicos)
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Taller
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50/50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-purple-900">
                  Talleres Profesionales
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Solo se muestran Service Points tipo{" "}
                  <strong>CSH (Taller Aliado)</strong> con comisión del 17.5-20%
                  o puntos que tengan servicio profesional habilitado. Los
                  talleres CSH generan revenue stream "workshop_commission"
                  cuando completan servicios profesionales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Talleres ({filteredWorkshops.length})</CardTitle>
            <CardDescription>
              Lista de todos los talleres registrados
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
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo Service Point</TableHead>
                    <TableHead>Punto de Servicio</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkshops.length > 0 ? (
                    filteredWorkshops.map((workshop) => (
                      <TableRow key={workshop.id}>
                        <TableCell className="font-medium">
                          {workshop.name}
                        </TableCell>
                        <TableCell>
                          {workshop.service_point?.type &&
                            getServicePointTypeBadge(
                              workshop.service_point.type
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {workshop.service_point_name || "N/A"}
                            </span>
                            {workshop.service_point?.workshop_name && (
                              <span className="text-xs text-purple-600">
                                {workshop.service_point.workshop_name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {workshop.service_point?.city || "N/A"}
                          {workshop.service_point?.province &&
                            `, ${workshop.service_point.province}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {workshop.services_offered?.slice(0, 2).join(", ") ||
                            "N/A"}
                          {workshop.services_offered?.length > 2 && "..."}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {workshop.operating_hours}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(workshop.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(workshop)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(workshop.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron talleres
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWorkshop ? "Editar Taller" : "Nuevo Taller"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del taller
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_point_id">
                      Service Point (CSH o con servicio profesional) *
                    </Label>
                    <select
                      id="service_point_id"
                      value={formData.service_point_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_point_id: e.target.value,
                        })
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {servicePoints.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} ({sp.type})
                          {sp.type === "CSH" &&
                            sp.workshop_name &&
                            ` - ${sp.workshop_name}`}
                        </option>
                      ))}
                    </select>
                    {servicePoints.length === 0 && (
                      <p className="text-xs text-amber-600">
                        ⚠️ No hay Service Points con servicio profesional. Crea
                        primero un CSH en "Puntos de Servicio"
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services_offered">
                    Servicios Ofrecidos (separados por coma)
                  </Label>
                  <Input
                    id="services_offered"
                    value={formData.services_offered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        services_offered: e.target.value,
                      })
                    }
                    placeholder="Reparación, Mantenimiento, Diagnóstico..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operating_hours">Horario *</Label>
                    <Input
                      id="operating_hours"
                      value={formData.operating_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operating_hours: e.target.value,
                        })
                      }
                      placeholder="9:00-18:00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      required
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="full">Completo</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingWorkshop ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
