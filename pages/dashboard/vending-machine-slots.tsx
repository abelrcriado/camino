/**
 * Dashboard de Vending Machine Slots
 * Gestión completa de slots con operaciones de stock y asignación de productos
 * Sprint 3.2 - Clean Architecture Dashboard
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
  Package,
  AlertTriangle,
  Grid3x3,
  ShoppingCart,
  Archive,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Boxes,
  TrendingDown,
} from "lucide-react";

// Types
interface VendingMachineSlot {
  id: string;
  machine_id: string;
  slot_number: number;
  producto_id?: string;
  producto_nombre?: string;
  capacidad_maxima: number;
  stock_disponible: number;
  stock_reservado: number;
  stock_total: number;
  precio_override?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface VendingMachine {
  id: string;
  name: string;
  location?: string;
}

interface Producto {
  id: string;
  nombre: string;
  sku: string;
  precio_venta: number;
}

interface Filters {
  machine_id?: string;
  producto_id?: string;
  slot_number?: string;
  stock_bajo?: string;
  is_active?: string;
  search?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface StockSummary {
  total_slots: number;
  slots_activos: number;
  slots_con_producto: number;
  stock_total: number;
  stock_disponible: number;
  stock_reservado: number;
  slots_stock_bajo: number;
  porcentaje_ocupacion: number;
}

export default function VendingMachineSlotsPage() {
  // State
  const [slots, setSlots] = useState<VendingMachineSlot[]>([]);
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [sortBy, setSortBy] = useState("slot_number");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [summary, setSummary] = useState<StockSummary | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<VendingMachineSlot | null>(
    null
  );
  const [stockOperation, setStockOperation] = useState<
    "reserve" | "release" | "consume"
  >("reserve");

  // Form state
  const [formData, setFormData] = useState({
    machine_id: "",
    slot_number: "",
    producto_id: "",
    capacidad_maxima: "10",
    stock_inicial: "",
    precio_override: "",
    is_active: true,
  });

  // Bulk create form
  const [bulkFormData, setBulkFormData] = useState({
    machine_id: "",
    num_slots: "10",
    capacidad_maxima: "10",
  });

  // Assign product form
  const [assignFormData, setAssignFormData] = useState({
    slot_id: "",
    producto_id: "",
    stock_inicial: "0",
  });

  // Stock operation form
  const [stockFormData, setStockFormData] = useState({
    slot_id: "",
    cantidad: "1",
  });

  const { toast } = useToast();

  // Fetch slots
  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
        ),
      });

      const response = await fetch(`/api/vending-machine-slots?${params}`);
      if (!response.ok) throw new Error("Error fetching slots");

      const data = await response.json();
      setSlots(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los slots",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, toast]);

  // Fetch machines
  const fetchMachines = useCallback(async () => {
    try {
      const response = await fetch("/api/vending-machines?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  }, []);

  // Fetch productos
  const fetchProductos = useCallback(async () => {
    try {
      const response = await fetch("/api/productos?limit=1000&is_active=true");
      if (response.ok) {
        const data = await response.json();
        setProductos(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  }, []);

  // Fetch stock summary
  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.machine_id) params.append("machine_id", filters.machine_id);

      const response = await fetch(
        `/api/vending-machine-slots/stock-summary?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setSummary(data.data || null);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [filters.machine_id]);

  // Initial load
  useEffect(() => {
    fetchSlots();
    fetchMachines();
    fetchProductos();
    fetchSummary();
  }, [fetchSlots, fetchMachines, fetchProductos, fetchSummary]);

  // Reset form
  const resetForm = () => {
    setFormData({
      machine_id: "",
      slot_number: "",
      producto_id: "",
      capacidad_maxima: "10",
      stock_inicial: "",
      precio_override: "",
      is_active: true,
    });
  };

  // Handle create single slot
  const handleCreate = async () => {
    try {
      const payload = {
        machine_id: formData.machine_id,
        slot_number: parseInt(formData.slot_number),
        capacidad_maxima: parseInt(formData.capacidad_maxima) || 10,
        producto_id: formData.producto_id || undefined,
        stock_inicial: formData.stock_inicial
          ? parseInt(formData.stock_inicial)
          : 0,
        precio_override: formData.precio_override
          ? parseInt(formData.precio_override)
          : undefined,
        is_active: formData.is_active,
      };

      const response = await fetch("/api/vending-machine-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error creating slot");
      }

      toast({
        title: "Éxito",
        description: "Slot creado correctamente",
      });

      setShowCreateModal(false);
      resetForm();
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error creando slot",
        variant: "destructive",
      });
    }
  };

  // Handle bulk create
  const handleBulkCreate = async () => {
    try {
      const payload = {
        machine_id: bulkFormData.machine_id,
        num_slots: parseInt(bulkFormData.num_slots),
        capacidad_maxima: parseInt(bulkFormData.capacidad_maxima) || 10,
      };

      const response = await fetch(
        "/api/vending-machine-slots/create-for-machine",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error creating slots");
      }

      const data = await response.json();

      toast({
        title: "Éxito",
        description: `${
          data.data?.slots_created || 0
        } slots creados correctamente`,
      });

      setShowBulkCreateModal(false);
      setBulkFormData({
        machine_id: "",
        num_slots: "10",
        capacidad_maxima: "10",
      });
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error creando slots",
        variant: "destructive",
      });
    }
  };

  // Handle assign product
  const handleAssignProduct = async () => {
    try {
      const payload = {
        slot_id: assignFormData.slot_id,
        producto_id: assignFormData.producto_id,
        stock_inicial: parseInt(assignFormData.stock_inicial) || 0,
      };

      const response = await fetch(
        "/api/vending-machine-slots/assign-product",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error assigning product");
      }

      toast({
        title: "Éxito",
        description: "Producto asignado correctamente",
      });

      setShowAssignProductModal(false);
      setAssignFormData({
        slot_id: "",
        producto_id: "",
        stock_inicial: "0",
      });
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error asignando producto",
        variant: "destructive",
      });
    }
  };

  // Handle stock operation
  const handleStockOperation = async () => {
    try {
      const payload = {
        slot_id: stockFormData.slot_id,
        cantidad: parseInt(stockFormData.cantidad),
      };

      const endpoint =
        stockOperation === "reserve"
          ? "reserve-stock"
          : stockOperation === "release"
          ? "release-stock"
          : "consume-stock";

      const response = await fetch(
        `/api/vending-machine-slots/stock-operations/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Error en operación ${stockOperation}`
        );
      }

      const operationLabel =
        stockOperation === "reserve"
          ? "reservado"
          : stockOperation === "release"
          ? "liberado"
          : "consumido";

      toast({
        title: "Éxito",
        description: `Stock ${operationLabel} correctamente`,
      });

      setShowStockModal(false);
      setStockFormData({
        slot_id: "",
        cantidad: "1",
      });
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error en operación de stock",
        variant: "destructive",
      });
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedSlot) return;

    try {
      const payload = {
        id: selectedSlot.id,
        capacidad_maxima: formData.capacidad_maxima
          ? parseInt(formData.capacidad_maxima)
          : undefined,
        precio_override: formData.precio_override
          ? parseInt(formData.precio_override)
          : null,
        is_active: formData.is_active,
      };

      const response = await fetch("/api/vending-machine-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error updating slot");
      }

      toast({
        title: "Éxito",
        description: "Slot actualizado correctamente",
      });

      setShowEditModal(false);
      setSelectedSlot(null);
      resetForm();
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error actualizando slot",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch(
        `/api/vending-machine-slots?id=${selectedSlot.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error deleting slot");
      }

      toast({
        title: "Éxito",
        description: "Slot eliminado correctamente",
      });

      setShowDeleteModal(false);
      setSelectedSlot(null);
      fetchSlots();
      fetchSummary();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error eliminando slot",
        variant: "destructive",
      });
    }
  };

  // Open edit modal
  const openEditModal = (slot: VendingMachineSlot) => {
    setSelectedSlot(slot);
    setFormData({
      machine_id: slot.machine_id,
      slot_number: slot.slot_number.toString(),
      producto_id: slot.producto_id || "",
      capacidad_maxima: slot.capacidad_maxima.toString(),
      stock_inicial: "",
      precio_override: slot.precio_override?.toString() || "",
      is_active: slot.is_active,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (slot: VendingMachineSlot) => {
    setSelectedSlot(slot);
    setShowDeleteModal(true);
  };

  // Open assign product modal
  const openAssignProductModal = (slot: VendingMachineSlot) => {
    setAssignFormData({
      slot_id: slot.id,
      producto_id: slot.producto_id || "",
      stock_inicial: "0",
    });
    setShowAssignProductModal(true);
  };

  // Open stock operation modal
  const openStockModal = (
    slot: VendingMachineSlot,
    operation: "reserve" | "release" | "consume"
  ) => {
    setStockOperation(operation);
    setStockFormData({
      slot_id: slot.id,
      cantidad: "1",
    });
    setShowStockModal(true);
  };

  // Get stock level badge
  const getStockBadge = (slot: VendingMachineSlot) => {
    const percentage = (slot.stock_disponible / slot.capacidad_maxima) * 100;
    if (percentage === 0) return <Badge variant="destructive">Vacío</Badge>;
    if (percentage < 30) return <Badge variant="destructive">Bajo</Badge>;
    if (percentage < 70) return <Badge variant="default">Medio</Badge>;
    return <Badge className="bg-green-500">Alto</Badge>;
  };

  // Calculate price
  const getPrice = (slot: VendingMachineSlot) => {
    if (slot.precio_override) {
      return (slot.precio_override / 100).toFixed(2);
    }
    const producto = productos.find((p) => p.id === slot.producto_id);
    return producto ? (producto.precio_venta / 100).toFixed(2) : "N/A";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Slots</h1>
          <p className="text-muted-foreground">
            Administra los slots de las máquinas vending
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkCreateModal(true)}
            variant="outline"
          >
            <Grid3x3 className="mr-2 h-4 w-4" />
            Crear Múltiples
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Slot
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_slots}</div>
              <p className="text-xs text-muted-foreground">
                {summary.slots_activos} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Disponible
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.stock_disponible}
              </div>
              <p className="text-xs text-muted-foreground">
                de {summary.stock_total} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Reservado
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.stock_reservado}
              </div>
              <p className="text-xs text-muted-foreground">
                {(
                  (summary.stock_reservado / summary.stock_total) *
                  100
                ).toFixed(1)}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {summary.slots_stock_bajo}
              </div>
              <p className="text-xs text-muted-foreground">
                requieren reposición
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Máquina</Label>
              <Select
                value={filters.machine_id || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, machine_id: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Producto</Label>
              <Select
                value={filters.producto_id || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, producto_id: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Bajo</Label>
              <Select
                value={filters.stock_bajo || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, stock_bajo: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Solo stock bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select
                value={filters.is_active || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, is_active: value || undefined })
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
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setPagination({ ...pagination, page: 1 });
              }}
            >
              Limpiar Filtros
            </Button>
            <Button onClick={() => fetchSlots()}>Aplicar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Slots ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron slots
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot #</TableHead>
                    <TableHead>Máquina</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Stock Disp.</TableHead>
                    <TableHead>Stock Res.</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Precio €</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => {
                    const machine = machines.find(
                      (m) => m.id === slot.machine_id
                    );
                    return (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          #{slot.slot_number}
                        </TableCell>
                        <TableCell>{machine?.name || "N/A"}</TableCell>
                        <TableCell>
                          {slot.producto_nombre || (
                            <span className="text-muted-foreground italic">
                              Sin asignar
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{slot.capacidad_maxima}</TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {slot.stock_disponible}
                          </span>
                        </TableCell>
                        <TableCell>
                          {slot.stock_reservado > 0 ? (
                            <Badge variant="outline">
                              {slot.stock_reservado}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>{getStockBadge(slot)}</TableCell>
                        <TableCell>{getPrice(slot)}</TableCell>
                        <TableCell>
                          {slot.is_active ? (
                            <Badge className="bg-green-500">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssignProductModal(slot)}
                              title="Asignar producto"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openStockModal(slot, "reserve")}
                              title="Reservar stock"
                              disabled={slot.stock_disponible === 0}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openStockModal(slot, "consume")}
                              title="Consumir stock"
                              disabled={slot.stock_disponible === 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(slot)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={!pagination.hasMore}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Slot</DialogTitle>
            <DialogDescription>
              Crea un nuevo slot para una máquina vending
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Máquina *</Label>
              <Select
                value={formData.machine_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, machine_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona máquina" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número de Slot *</Label>
              <Input
                type="number"
                min="1"
                value={formData.slot_number}
                onChange={(e) =>
                  setFormData({ ...formData, slot_number: e.target.value })
                }
                placeholder="Ej: 1"
              />
            </div>

            <div>
              <Label>Capacidad Máxima</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={formData.capacidad_maxima}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad_maxima: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Producto (Opcional)</Label>
              <Select
                value={formData.producto_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, producto_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} ({producto.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.producto_id && (
              <div>
                <Label>Stock Inicial</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock_inicial}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_inicial: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            )}

            <div>
              <Label>Precio Override (céntimos)</Label>
              <Input
                type="number"
                min="0"
                value={formData.precio_override}
                onChange={(e) =>
                  setFormData({ ...formData, precio_override: e.target.value })
                }
                placeholder="Dejar vacío para usar precio del producto"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.machine_id || !formData.slot_number}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Modal */}
      <Dialog open={showBulkCreateModal} onOpenChange={setShowBulkCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Múltiples Slots</DialogTitle>
            <DialogDescription>
              Crea varios slots vacíos para una máquina
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Máquina *</Label>
              <Select
                value={bulkFormData.machine_id}
                onValueChange={(value) =>
                  setBulkFormData({ ...bulkFormData, machine_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona máquina" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cantidad de Slots *</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={bulkFormData.num_slots}
                onChange={(e) =>
                  setBulkFormData({
                    ...bulkFormData,
                    num_slots: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se crearán slots numerados consecutivamente
              </p>
            </div>

            <div>
              <Label>Capacidad Máxima por Slot</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={bulkFormData.capacidad_maxima}
                onChange={(e) =>
                  setBulkFormData({
                    ...bulkFormData,
                    capacidad_maxima: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkCreateModal(false);
                setBulkFormData({
                  machine_id: "",
                  num_slots: "10",
                  capacidad_maxima: "10",
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkCreate}
              disabled={!bulkFormData.machine_id || !bulkFormData.num_slots}
            >
              Crear {bulkFormData.num_slots} Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Slot</DialogTitle>
            <DialogDescription>
              Modifica la configuración del slot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Capacidad Máxima</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={formData.capacidad_maxima}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad_maxima: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Precio Override (céntimos)</Label>
              <Input
                type="number"
                min="0"
                value={formData.precio_override}
                onChange={(e) =>
                  setFormData({ ...formData, precio_override: e.target.value })
                }
                placeholder="Dejar vacío para eliminar override"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="edit_is_active">Activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedSlot(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Product Modal */}
      <Dialog
        open={showAssignProductModal}
        onOpenChange={setShowAssignProductModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Producto</DialogTitle>
            <DialogDescription>
              Asigna o cambia el producto de este slot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Producto *</Label>
              <Select
                value={assignFormData.producto_id}
                onValueChange={(value) =>
                  setAssignFormData({ ...assignFormData, producto_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} - €
                      {(producto.precio_venta / 100).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Inicial</Label>
              <Input
                type="number"
                min="0"
                value={assignFormData.stock_inicial}
                onChange={(e) =>
                  setAssignFormData({
                    ...assignFormData,
                    stock_inicial: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dejar en 0 si solo quieres asignar el producto sin agregar stock
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignProductModal(false);
                setAssignFormData({
                  slot_id: "",
                  producto_id: "",
                  stock_inicial: "0",
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssignProduct}
              disabled={!assignFormData.producto_id}
            >
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Operation Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stockOperation === "reserve"
                ? "Reservar Stock"
                : stockOperation === "release"
                ? "Liberar Stock"
                : "Consumir Stock"}
            </DialogTitle>
            <DialogDescription>
              {stockOperation === "reserve"
                ? "Reserva unidades para una venta pendiente"
                : stockOperation === "release"
                ? "Libera unidades reservadas (venta cancelada)"
                : "Consume unidades disponibles (venta confirmada)"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Cantidad *</Label>
              <Input
                type="number"
                min="1"
                value={stockFormData.cantidad}
                onChange={(e) =>
                  setStockFormData({
                    ...stockFormData,
                    cantidad: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStockModal(false);
                setStockFormData({
                  slot_id: "",
                  cantidad: "1",
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStockOperation}
              disabled={!stockFormData.cantidad}
            >
              {stockOperation === "reserve"
                ? "Reservar"
                : stockOperation === "release"
                ? "Liberar"
                : "Consumir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Slot</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar este slot? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="bg-muted p-4 rounded-lg">
              <p>
                <strong>Slot:</strong> #{selectedSlot.slot_number}
              </p>
              <p>
                <strong>Producto:</strong>{" "}
                {selectedSlot.producto_nombre || "Sin asignar"}
              </p>
              <p>
                <strong>Stock:</strong> {selectedSlot.stock_total} unidades
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSlot(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
