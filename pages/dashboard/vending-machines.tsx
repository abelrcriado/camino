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
  Package,
  Users,
  Store,
  Wrench,
  Percent,
  Info,
} from "lucide-react";

interface ServicePoint {
  id: string;
  name: string;
  type: "CSP" | "CSS" | "CSH";
  partner_name?: string;
  has_vending?: boolean;
  city?: string;
  province?: string;
  commission_model?: {
    vending?: number;
  };
}

interface VendingMachine {
  id: string;
  name: string;
  machine_code: string;
  service_point_id: string;
  service_point?: ServicePoint;
  service_point_name?: string;
  location_description?: string;
  status: string;
  inventory_count: number;
  last_maintenance?: string;
  created_at: string;
}

export default function VendingMachinesPage() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<VendingMachine | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    machine_code: "",
    service_point_id: "",
    location_description: "",
    status: "active",
  });

  useEffect(() => {
    fetchMachines();
    fetchServicePoints();
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/vending-machines");
      const data = await response.json();
      setMachines(data.machines || []);
    } catch (error) {
      console.error("Error fetching vending machines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePoints = async () => {
    try {
      const response = await fetch("/api/service-points");
      const data = await response.json();
      // Filter to show only points with vending enabled
      const filtered = (data || []).filter(
        (sp: ServicePoint) => sp.has_vending
      );
      setServicePoints(filtered);
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  };

  const handleCreate = () => {
    setEditingMachine(null);
    setFormData({
      name: "",
      machine_code: "",
      service_point_id: "",
      location_description: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (machine: VendingMachine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      machine_code: machine.machine_code,
      service_point_id: machine.service_point_id,
      location_description: machine.location_description || "",
      status: machine.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta máquina?")) return;

    try {
      const response = await fetch(`/api/vending-machines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Máquina eliminada exitosamente");
        fetchMachines();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting machine:", error);
      alert("Error al eliminar la máquina");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingMachine
      ? `/api/vending-machines/${editingMachine.id}`
      : "/api/vending-machines";
    const method = editingMachine ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(
          editingMachine
            ? "Máquina actualizada exitosamente"
            : "Máquina creada exitosamente"
        );
        setIsDialogOpen(false);
        fetchMachines();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving machine:", error);
      alert("Error al guardar la máquina");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactiva</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">Mantenimiento</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Sin Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServicePointTypeBadge = (type: string) => {
    switch (type) {
      case "CSP":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-300"
          >
            <Users className="h-3 w-3 mr-1" />
            CSP
          </Badge>
        );
      case "CSS":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 border-green-300"
          >
            <Store className="h-3 w-3 mr-1" />
            CSS
          </Badge>
        );
      case "CSH":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-700 border-purple-300"
          >
            <Wrench className="h-3 w-3 mr-1" />
            CSH
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getCommissionRate = (servicePoint?: ServicePoint): number => {
    if (!servicePoint) return 0;

    switch (servicePoint.type) {
      case "CSP":
        return servicePoint.commission_model?.vending || 0.1; // 10% default
      case "CSS":
        return 0; // 100% Camino
      case "CSH":
        return 0; // Vending en CSH es 100% Camino (solo servicios profesionales tienen comisión)
      default:
        return 0;
    }
  };

  const calculateRevenueSplit = (
    amount: number,
    servicePoint?: ServicePoint
  ) => {
    const commissionRate = getCommissionRate(servicePoint);
    const partnerCommission = amount * commissionRate;
    const networkRevenue = amount - partnerCommission;

    return {
      partnerCommission: Number(partnerCommission.toFixed(2)),
      networkRevenue: Number(networkRevenue.toFixed(2)),
      commissionPercent: Math.round(commissionRate * 100),
    };
  };

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.service_point_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Máquinas de Vending</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona máquinas expendedoras con comisiones por tipo de Service
              Point
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Máquina
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-amber-900">
                  Comisiones de Vending por Tipo
                </h4>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-sm">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-700 border-blue-300 mb-1"
                    >
                      CSP - Partner
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <strong>5-10% para partner</strong>, 90-95% para Camino.
                      Revenue stream: "vending"
                    </p>
                  </div>
                  <div className="text-sm">
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-300 mb-1"
                    >
                      CSS - Propio
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <strong>100% para Camino</strong>. Máxima rentabilidad.
                    </p>
                  </div>
                  <div className="text-sm">
                    <Badge
                      variant="outline"
                      className="bg-purple-500/10 text-purple-700 border-purple-300 mb-1"
                    >
                      CSH - Taller
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <strong>100% para Camino</strong>. Vending no paga
                      comisión al taller.
                    </p>
                  </div>
                </div>
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
                placeholder="Buscar por nombre, código o ubicación..."
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
            <CardTitle>Máquinas ({filteredMachines.length})</CardTitle>
            <CardDescription>
              Lista de todas las máquinas de vending
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
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo SP</TableHead>
                    <TableHead>Punto de Servicio</TableHead>
                    <TableHead>Comisión Partner</TableHead>
                    <TableHead>Inventario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.length > 0 ? (
                    filteredMachines.map((machine) => {
                      const commissionRate = getCommissionRate(
                        machine.service_point
                      );
                      return (
                        <TableRow key={machine.id}>
                          <TableCell className="font-mono text-sm">
                            {machine.machine_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {machine.name}
                          </TableCell>
                          <TableCell>
                            {machine.service_point?.type &&
                              getServicePointTypeBadge(
                                machine.service_point.type
                              )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {machine.service_point_name || "N/A"}
                              </span>
                              {machine.service_point?.partner_name && (
                                <span className="text-xs text-blue-600">
                                  {machine.service_point.partner_name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-muted-foreground" />
                              <span
                                className={
                                  commissionRate > 0
                                    ? "text-blue-600 font-medium"
                                    : "text-green-600 font-medium"
                                }
                              >
                                {Math.round(commissionRate * 100)}%
                              </span>
                              {machine.service_point?.type === "CSS" && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (100% Camino)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {machine.inventory_count || 0} items
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(machine.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(machine)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(machine.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron máquinas
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
                {editingMachine ? "Editar Máquina" : "Nueva Máquina de Vending"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos de la máquina
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
                    <Label htmlFor="machine_code">Código de Máquina *</Label>
                    <Input
                      id="machine_code"
                      value={formData.machine_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          machine_code: e.target.value,
                        })
                      }
                      placeholder="VM-001"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_point_id">Punto de Servicio *</Label>
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
                        {sp.name}
                      </option>
                    ))}
                  </select>
                  {formData.service_point_id &&
                    (() => {
                      const selectedSP = servicePoints.find(
                        (sp) => sp.id === formData.service_point_id
                      );
                      if (!selectedSP) return null;
                      const commissionRate = getCommissionRate(selectedSP);
                      const {
                        partnerCommission,
                        networkRevenue,
                        commissionPercent,
                      } = calculateRevenueSplit(100, selectedSP);

                      return (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            {getServicePointTypeBadge(selectedSP.type)}
                            {selectedSP.partner_name && (
                              <span className="text-xs text-muted-foreground">
                                {selectedSP.partner_name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">
                              Comisión Vending:
                            </span>
                            {commissionRate > 0 ? (
                              <div className="mt-1 space-y-0.5">
                                <div className="text-xs text-blue-600">
                                  • Partner: {commissionPercent}% (€
                                  {partnerCommission.toFixed(2)} por cada €100)
                                </div>
                                <div className="text-xs text-green-600">
                                  • Camino: {100 - commissionPercent}% (€
                                  {networkRevenue.toFixed(2)} por cada €100)
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-green-600 font-medium">
                                100% para Camino
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_description">
                    Descripción de Ubicación
                  </Label>
                  <Input
                    id="location_description"
                    value={formData.location_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_description: e.target.value,
                      })
                    }
                    placeholder="Ej: Entrada principal, junto a recepción"
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
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="out_of_stock">Sin Stock</option>
                  </select>
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
                  {editingMachine ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
