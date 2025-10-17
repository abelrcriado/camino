/**
 * Dashboard de Productos
 * Gestión completa de productos con filtros dinámicos, paginación y CRUD
 * Sprint 3.1 - Clean Architecture Dashboard
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/dashboard/components/ui/card";
import { Button } from "@/dashboard/components/ui/button";
import { Input } from "@/dashboard/components/ui/input";
import { Label } from "@/dashboard/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/dashboard/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/dashboard/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/dashboard/components/ui/dialog";
import { Badge } from "@/dashboard/components/ui/badge";
import { useToast } from "@/dashboard/components/ui/use-toast";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

// Types
interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string;
  category_id?: string;
  category_name?: string;
  subcategory_id?: string;
  marca?: string;
  modelo?: string;
  costo_base: number;
  precio_venta: number;
  tasa_iva: number;
  margen_beneficio?: number;
  peso_gramos?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
    unidad?: string;
  };
  unidad_medida: string;
  codigo_barras?: string;
  requiere_refrigeracion: boolean;
  meses_caducidad?: number;
  dias_caducidad?: number;
  perecedero: boolean;
  proveedor_nombre?: string;
  imagenes?: string[];
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface Categoria {
  category_id: string;
  category_name: string;
}

interface Filters {
  sku?: string;
  nombre?: string;
  category_id?: string;
  marca?: string;
  is_active?: string;
  perecedero?: string;
  precio_min?: string;
  precio_max?: string;
  search?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const UNIDADES_MEDIDA = [
  "unidad",
  "paquete",
  "caja",
  "litro",
  "mililitro",
  "kilogramo",
  "gramo",
  "metro",
  "centimetro",
  "pieza",
  "set",
  "par",
];

export default function ProductosPage() {
  // State
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    descripcion: "",
    category_id: "",
    marca: "",
    modelo: "",
    costo_base: "",
    precio_venta: "",
    tasa_iva: "21",
    peso_gramos: "",
    unidad_medida: "unidad",
    codigo_barras: "",
    requiere_refrigeracion: false,
    meses_caducidad: "",
    dias_caducidad: "",
    perecedero: false,
    proveedor_nombre: "",
    is_active: true,
  });

  const { toast } = useToast();

  // Fetch productos
  const fetchProductos = useCallback(async () => {
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

      const response = await fetch(`/api/productos?${params}`);
      if (!response.ok) throw new Error("Error fetching productos");

      const data = await response.json();
      setProductos(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, toast]);

  // Fetch categorias
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch("/api/productos/categorias");
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  }, []);

  // Fetch marcas
  const fetchMarcas = useCallback(async () => {
    try {
      const response = await fetch("/api/productos/marcas");
      if (response.ok) {
        const data = await response.json();
        setMarcas(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching marcas:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchMarcas();
  }, [fetchProductos, fetchCategorias, fetchMarcas]);

  // Handle create
  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        costo_base: parseInt(formData.costo_base) || 0,
        precio_venta: parseInt(formData.precio_venta) || 0,
        tasa_iva: parseFloat(formData.tasa_iva) || 21,
        peso_gramos: formData.peso_gramos
          ? parseInt(formData.peso_gramos)
          : undefined,
        meses_caducidad: formData.meses_caducidad
          ? parseInt(formData.meses_caducidad)
          : undefined,
        dias_caducidad: formData.dias_caducidad
          ? parseInt(formData.dias_caducidad)
          : undefined,
      };

      const response = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error creating producto");
      }

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      });

      setShowCreateModal(false);
      resetForm();
      fetchProductos();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error creando producto",
        variant: "destructive",
      });
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedProducto) return;

    try {
      const payload = {
        id: selectedProducto.id,
        ...formData,
        costo_base: formData.costo_base
          ? parseInt(formData.costo_base)
          : undefined,
        precio_venta: formData.precio_venta
          ? parseInt(formData.precio_venta)
          : undefined,
        tasa_iva: formData.tasa_iva ? parseFloat(formData.tasa_iva) : undefined,
        peso_gramos: formData.peso_gramos
          ? parseInt(formData.peso_gramos)
          : undefined,
        meses_caducidad: formData.meses_caducidad
          ? parseInt(formData.meses_caducidad)
          : undefined,
        dias_caducidad: formData.dias_caducidad
          ? parseInt(formData.dias_caducidad)
          : undefined,
      };

      const response = await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error updating producto");
      }

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });

      setShowEditModal(false);
      setSelectedProducto(null);
      resetForm();
      fetchProductos();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error actualizando producto",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProducto) return;

    try {
      const response = await fetch(`/api/productos?id=${selectedProducto.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error deleting producto");
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });

      setShowDeleteModal(false);
      setSelectedProducto(null);
      fetchProductos();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error eliminando producto",
        variant: "destructive",
      });
    }
  };

  // Open edit modal
  const openEditModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      category_id: producto.category_id || "",
      marca: producto.marca || "",
      modelo: producto.modelo || "",
      costo_base: producto.costo_base.toString(),
      precio_venta: producto.precio_venta.toString(),
      tasa_iva: producto.tasa_iva.toString(),
      peso_gramos: producto.peso_gramos?.toString() || "",
      unidad_medida: producto.unidad_medida,
      codigo_barras: producto.codigo_barras || "",
      requiere_refrigeracion: producto.requiere_refrigeracion,
      meses_caducidad: producto.meses_caducidad?.toString() || "",
      dias_caducidad: producto.dias_caducidad?.toString() || "",
      perecedero: producto.perecedero,
      proveedor_nombre: producto.proveedor_nombre || "",
      is_active: producto.is_active,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      sku: "",
      nombre: "",
      descripcion: "",
      category_id: "",
      marca: "",
      modelo: "",
      costo_base: "",
      precio_venta: "",
      tasa_iva: "21",
      peso_gramos: "",
      unidad_medida: "unidad",
      codigo_barras: "",
      requiere_refrigeracion: false,
      meses_caducidad: "",
      dias_caducidad: "",
      perecedero: false,
      proveedor_nombre: "",
      is_active: true,
    });
  };

  // Format price in euros
  const formatPrice = (centavos: number) => {
    return `€${(centavos / 100).toFixed(2)}`;
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    activos: productos.filter((p) => p.is_active).length,
    inactivos: productos.filter((p) => !p.is_active).length,
    perecederos: productos.filter((p) => p.perecedero).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestión de catálogo de productos
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perecederos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.perecederos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="SKU, nombre, marca..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Categoría</Label>
              <Select
                value={filters.category_id || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    category_id: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Marca</Label>
              <Select
                value={filters.marca || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    marca: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {marcas.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select
                value={filters.is_active || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    is_active: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Precio mínimo (€)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.precio_min || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? (parseFloat(e.target.value) * 100).toString()
                    : undefined;
                  setFilters({ ...filters, precio_min: value });
                }}
              />
            </div>

            <div>
              <Label>Precio máximo (€)</Label>
              <Input
                type="number"
                placeholder="999.99"
                value={filters.precio_max || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? (parseFloat(e.target.value) * 100).toString()
                    : undefined;
                  setFilters({ ...filters, precio_max: value });
                }}
              />
            </div>

            <div>
              <Label>Perecedero</Label>
              <Select
                value={filters.perecedero || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    perecedero: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  setPagination({ ...pagination, page: 1 });
                  fetchProductos();
                }}
                className="flex-1"
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Listado de Productos</CardTitle>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="sku">SKU</SelectItem>
                  <SelectItem value="precio_venta">Precio</SelectItem>
                  <SelectItem value="created_at">Fecha creación</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron productos
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Perecedero</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">
                      {producto.sku}
                    </TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.marca || "-"}</TableCell>
                    <TableCell>{producto.category_name || "-"}</TableCell>
                    <TableCell>{formatPrice(producto.precio_venta)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{producto.unidad_medida}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={producto.is_active ? "default" : "secondary"}
                      >
                        {producto.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {producto.perecedero ? (
                        <Badge variant="destructive">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(producto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(producto)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} (
                {pagination.total} productos)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={!pagination.hasMore}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Producto</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo producto
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sku: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="PROD-001"
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Nombre del producto"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Descripción del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  placeholder="Marca"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="costo_base">Costo Base (€) *</Label>
                <Input
                  id="costo_base"
                  type="number"
                  step="0.01"
                  value={
                    formData.costo_base
                      ? (parseInt(formData.costo_base) / 100).toFixed(2)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? (parseFloat(e.target.value) * 100).toString()
                      : "";
                    setFormData({ ...formData, costo_base: value });
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="precio_venta">Precio Venta (€) *</Label>
                <Input
                  id="precio_venta"
                  type="number"
                  step="0.01"
                  value={
                    formData.precio_venta
                      ? (parseInt(formData.precio_venta) / 100).toFixed(2)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? (parseFloat(e.target.value) * 100).toString()
                      : "";
                    setFormData({ ...formData, precio_venta: value });
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="tasa_iva">IVA (%)</Label>
                <Input
                  id="tasa_iva"
                  type="number"
                  step="0.1"
                  value={formData.tasa_iva}
                  onChange={(e) =>
                    setFormData({ ...formData, tasa_iva: e.target.value })
                  }
                  placeholder="21"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unidad_medida">Unidad de Medida</Label>
                <Select
                  value={formData.unidad_medida}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidad_medida: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="peso_gramos">Peso (gramos)</Label>
                <Input
                  id="peso_gramos"
                  type="number"
                  value={formData.peso_gramos}
                  onChange={(e) =>
                    setFormData({ ...formData, peso_gramos: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="perecedero"
                  checked={formData.perecedero}
                  onChange={(e) =>
                    setFormData({ ...formData, perecedero: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="perecedero">Perecedero</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiere_refrigeracion"
                  checked={formData.requiere_refrigeracion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiere_refrigeracion: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requiere_refrigeracion">Refrigeración</Label>
              </div>
            </div>

            {formData.perecedero && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meses_caducidad">Meses Caducidad</Label>
                  <Input
                    id="meses_caducidad"
                    type="number"
                    value={formData.meses_caducidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meses_caducidad: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="dias_caducidad">Días Caducidad</Label>
                  <Input
                    id="dias_caducidad"
                    type="number"
                    value={formData.dias_caducidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dias_caducidad: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="proveedor_nombre">Proveedor</Label>
              <Input
                id="proveedor_nombre"
                value={formData.proveedor_nombre}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor_nombre: e.target.value })
                }
                placeholder="Nombre del proveedor"
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
                className="rounded"
              />
              <Label htmlFor="is_active">Producto Activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifique los datos del producto
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Same form as Create Modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sku: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="PROD-001"
                />
              </div>
              <div>
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Nombre del producto"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Input
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Descripción del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category_id">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-marca">Marca</Label>
                <Input
                  id="edit-marca"
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  placeholder="Marca"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-costo_base">Costo Base (€) *</Label>
                <Input
                  id="edit-costo_base"
                  type="number"
                  step="0.01"
                  value={
                    formData.costo_base
                      ? (parseInt(formData.costo_base) / 100).toFixed(2)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? (parseFloat(e.target.value) * 100).toString()
                      : "";
                    setFormData({ ...formData, costo_base: value });
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-precio_venta">Precio Venta (€) *</Label>
                <Input
                  id="edit-precio_venta"
                  type="number"
                  step="0.01"
                  value={
                    formData.precio_venta
                      ? (parseInt(formData.precio_venta) / 100).toFixed(2)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? (parseFloat(e.target.value) * 100).toString()
                      : "";
                    setFormData({ ...formData, precio_venta: value });
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-tasa_iva">IVA (%)</Label>
                <Input
                  id="edit-tasa_iva"
                  type="number"
                  step="0.1"
                  value={formData.tasa_iva}
                  onChange={(e) =>
                    setFormData({ ...formData, tasa_iva: e.target.value })
                  }
                  placeholder="21"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unidad_medida">Unidad de Medida</Label>
                <Select
                  value={formData.unidad_medida}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidad_medida: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-peso_gramos">Peso (gramos)</Label>
                <Input
                  id="edit-peso_gramos"
                  type="number"
                  value={formData.peso_gramos}
                  onChange={(e) =>
                    setFormData({ ...formData, peso_gramos: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-perecedero"
                  checked={formData.perecedero}
                  onChange={(e) =>
                    setFormData({ ...formData, perecedero: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-perecedero">Perecedero</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-requiere_refrigeracion"
                  checked={formData.requiere_refrigeracion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiere_refrigeracion: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-requiere_refrigeracion">
                  Refrigeración
                </Label>
              </div>
            </div>

            {formData.perecedero && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-meses_caducidad">Meses Caducidad</Label>
                  <Input
                    id="edit-meses_caducidad"
                    type="number"
                    value={formData.meses_caducidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meses_caducidad: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dias_caducidad">Días Caducidad</Label>
                  <Input
                    id="edit-dias_caducidad"
                    type="number"
                    value={formData.dias_caducidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dias_caducidad: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="edit-proveedor_nombre">Proveedor</Label>
              <Input
                id="edit-proveedor_nombre"
                value={formData.proveedor_nombre}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor_nombre: e.target.value })
                }
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="edit-is_active">Producto Activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedProducto(null);
                resetForm();
              }}
            >
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
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el producto &quot;
              {selectedProducto?.nombre}&quot;? Esta acción desactivará el
              producto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProducto(null);
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
