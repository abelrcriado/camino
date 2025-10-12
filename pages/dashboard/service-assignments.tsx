/**
 * Dashboard de Service Assignments
 * Gestión de asignaciones N:M entre Services y Service Points
 * Arquitectura modular con filtros, paginación y componentes reutilizables
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Types
interface ServiceAssignment {
  id: string;
  service_id: string;
  service_point_id: string;
  is_active: boolean;
  priority: number;
  configuracion: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  code?: string;
}

interface ServicePoint {
  id: string;
  name: string;
  city?: string;
}

interface Filters {
  service_id?: string;
  service_point_id?: string;
  is_active?: string;
  priority_min?: string;
  priority_max?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function ServiceAssignmentsPage() {
  // State
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [sortBy, setSortBy] = useState<
    "priority" | "created_at" | "updated_at"
  >("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<ServiceAssignment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    service_id: "",
    service_point_id: "",
    is_active: true,
    priority: 0,
    configuracion: "{}",
  });

  const { toast } = useToast();

  // Fetch assignments with filters and pagination
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters,
      });

      const response = await fetch(`/api/service-assignments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAssignments(data.data || []);
        setPagination(data.pagination || pagination);
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al cargar asignaciones",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder, toast]);

  // Fetch services for dropdown
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (response.ok) {
        setServices(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  // Fetch service points for dropdown
  const fetchServicePoints = useCallback(async () => {
    try {
      const response = await fetch("/api/service-points");
      const data = await response.json();
      if (response.ok) {
        setServicePoints(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAssignments();
    fetchServices();
    fetchServicePoints();
  }, [fetchAssignments, fetchServices, fetchServicePoints]);

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Toggle sort
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Create assignment
  const handleCreate = async () => {
    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(formData.configuracion);
      } catch {
        toast({
          title: "Error",
          description: "Configuración JSON inválida",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/service-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: formData.service_id,
          service_point_id: formData.service_point_id,
          is_active: formData.is_active,
          priority: formData.priority,
          configuracion: parsedConfig,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Asignación creada exitosamente",
        });
        setShowCreateModal(false);
        fetchAssignments();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al crear asignación",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    }
  };

  // Update assignment
  const handleUpdate = async () => {
    if (!selectedAssignment) return;

    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(formData.configuracion);
      } catch {
        toast({
          title: "Error",
          description: "Configuración JSON inválida",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/service-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAssignment.id,
          service_id: formData.service_id || undefined,
          service_point_id: formData.service_point_id || undefined,
          is_active: formData.is_active,
          priority: formData.priority,
          configuracion: parsedConfig,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Asignación actualizada exitosamente",
        });
        setShowEditModal(false);
        fetchAssignments();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar asignación",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    }
  };

  // Delete assignment (soft delete)
  const handleDelete = async () => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(
        `/api/service-assignments?id=${selectedAssignment.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Asignación marcada como inactiva",
        });
        setShowDeleteModal(false);
        fetchAssignments();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al eliminar asignación",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    }
  };

  // Open edit modal
  const openEditModal = (assignment: ServiceAssignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      service_id: assignment.service_id,
      service_point_id: assignment.service_point_id,
      is_active: assignment.is_active,
      priority: assignment.priority,
      configuracion: JSON.stringify(assignment.configuracion, null, 2),
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (assignment: ServiceAssignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      service_id: "",
      service_point_id: "",
      is_active: true,
      priority: 0,
      configuracion: "{}",
    });
    setSelectedAssignment(null);
  };

  // Get service name by ID
  const getServiceName = (id: string) => {
    const service = services.find((s) => s.id === id);
    return service?.name || service?.code || id.substring(0, 8);
  };

  // Get service point name by ID
  const getServicePointName = (id: string) => {
    const sp = servicePoints.find((s) => s.id === id);
    return sp?.name || id.substring(0, 8);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Assignments</h1>
          <p className="text-gray-500 mt-1">
            Gestión de asignaciones servicio-service_point (N:M)
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Asignaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter((a) => a.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Inactivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter((a) => !a.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Prioridad Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.length > 0
                ? Math.round(
                    assignments.reduce((sum, a) => sum + a.priority, 0) /
                      assignments.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Ocultar" : "Mostrar"} Filtros
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Servicio</Label>
                <Select
                  value={filters.service_id || ""}
                  onValueChange={(value) =>
                    handleFilterChange("service_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Point</Label>
                <Select
                  value={filters.service_point_id || ""}
                  onValueChange={(value) =>
                    handleFilterChange("service_point_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los service points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {servicePoints.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={filters.is_active || ""}
                  onValueChange={(value) =>
                    handleFilterChange("is_active", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="true">Activos</SelectItem>
                    <SelectItem value="false">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridad Mínima</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.priority_min || ""}
                  onChange={(e) =>
                    handleFilterChange("priority_min", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Prioridad Máxima</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.priority_max || ""}
                  onChange={(e) =>
                    handleFilterChange("priority_max", e.target.value)
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron asignaciones
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Service Point</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort("priority")}
                      >
                        Prioridad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort("created_at")}
                      >
                        Creado
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {getServiceName(assignment.service_id)}
                      </TableCell>
                      <TableCell>
                        {getServicePointName(assignment.service_point_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(assignment)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  de {pagination.total}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Asignación</DialogTitle>
            <DialogDescription>
              Asignar un servicio a un service point
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Servicio *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service_point">Service Point *</Label>
              <Select
                value={formData.service_point_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_point_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar service point" />
                </SelectTrigger>
                <SelectContent>
                  {servicePoints.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name} {sp.city && `- ${sp.city}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridad (0-100)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="is_active">Estado</Label>
              <Select
                value={formData.is_active.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="configuracion">Configuración (JSON)</Label>
              <textarea
                id="configuracion"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.configuracion}
                onChange={(e) =>
                  setFormData({ ...formData, configuracion: e.target.value })
                }
                placeholder='{"key": "value"}'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Asignación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Asignación</DialogTitle>
            <DialogDescription>
              Modificar asignación servicio-service_point
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_service">Servicio</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_service_point">Service Point</Label>
              <Select
                value={formData.service_point_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_point_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {servicePoints.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_priority">Prioridad (0-100)</Label>
              <Input
                id="edit_priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_is_active">Estado</Label>
              <Select
                value={formData.is_active.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_configuracion">Configuración (JSON)</Label>
              <textarea
                id="edit_configuracion"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.configuracion}
                onChange={(e) =>
                  setFormData({ ...formData, configuracion: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas marcar esta asignación como inactiva?
              Esta acción se puede revertir editando la asignación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Marcar como Inactiva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
