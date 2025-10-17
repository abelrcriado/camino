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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/dashboard/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  TrendingUp,
  Building2,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// Tipos
interface Precio {
  id: string;
  nivel: "BASE" | "UBICACION" | "SERVICE_POINT";
  entidad_tipo: "SERVICIO" | "PRODUCTO";
  entidad_id: string;
  entidad_nombre?: string;
  ubicacion_id?: string;
  ubicacion_nombre?: string;
  service_point_id?: string;
  service_point_nombre?: string;
  precio: number;
  fecha_inicio: string;
  fecha_fin?: string;
  notas?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface PrecioStats {
  total_precios: number;
  precios_vigentes: number;
  precios_vencidos: number;
  precio_promedio: number;
  precios_por_nivel: {
    BASE: number;
    UBICACION: number;
    SERVICE_POINT: number;
  };
  precios_por_entidad: {
    SERVICIO: number;
    PRODUCTO: number;
  };
}

interface PrecioAplicable {
  id: string;
  precio: number;
  nivel: string;
  entidad_id: string;
  ubicacion_id?: string;
  service_point_id?: string;
}

interface Servicio {
  id: string;
  name: string;
  service_type_id: string;
}

interface Producto {
  id: string;
  name: string;
  category_id: string;
}

interface Ubicacion {
  id: string;
  city: string;
  province: string;
  address?: string;
}

interface ServicePoint {
  id: string;
  name: string;
  type: string;
  location_id?: string;
}

export default function PreciosPage() {
  // Estados principales
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [stats, setStats] = useState<PrecioStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [filters, setFilters] = useState({
    nivel: "all",
    entidad_tipo: "all",
    vigentes: "all",
    search: "",
  });

  // Estados para modales
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState<Precio | null>(null);

  // Estados para datos relacionados
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);

  // Estado para preview de precio aplicable
  const [precioPreview, setPrecioPreview] = useState<PrecioAplicable | null>(
    null
  );
  const [previewParams, setPreviewParams] = useState({
    entidad_tipo: "SERVICIO" as "SERVICIO" | "PRODUCTO",
    entidad_id: "",
    ubicacion_id: "",
    service_point_id: "",
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    nivel: "BASE" as "BASE" | "UBICACION" | "SERVICE_POINT",
    entidad_tipo: "SERVICIO" as "SERVICIO" | "PRODUCTO",
    entidad_id: "",
    ubicacion_id: "",
    service_point_id: "",
    precio: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    notas: "",
  });

  // Efectos
  useEffect(() => {
    fetchPrecios();
    fetchStats();
    fetchServicios();
    fetchProductos();
    fetchUbicaciones();
    fetchServicePoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.nivel, filters.entidad_tipo, filters.vigentes]);

  // Fetch functions
  const fetchPrecios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.nivel !== "all") {
        params.append("nivel", filters.nivel);
      }
      if (filters.entidad_tipo !== "all") {
        params.append("entidad_tipo", filters.entidad_tipo);
      }
      if (filters.vigentes === "vigentes") {
        params.append("action", "vigentes");
      }
      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await fetch(`/api/precios?${params}`);
      const data = await response.json();

      if (data.data) {
        setPrecios(data.data);
      }
    } catch (error) {
      console.error("Error fetching precios:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/precios?action=stats");
      const data = await response.json();

      if (data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data.success) {
        setServicios(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching servicios:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos");
      const data = await response.json();
      if (data.success || Array.isArray(data)) {
        setProductos(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setUbicaciones(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching ubicaciones:", error);
    }
  };

  const fetchServicePoints = async () => {
    try {
      const response = await fetch("/api/service-points");
      const data = await response.json();
      if (data.success || Array.isArray(data)) {
        setServicePoints(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  };

  const fetchPrecioAplicable = async () => {
    if (!previewParams.entidad_id) {
      setPrecioPreview(null);
      return;
    }

    try {
      const params = new URLSearchParams({
        action: "aplicable",
        entidad_tipo: previewParams.entidad_tipo,
        entidad_id: previewParams.entidad_id,
      });

      if (previewParams.ubicacion_id) {
        params.append("ubicacion_id", previewParams.ubicacion_id);
      }
      if (previewParams.service_point_id) {
        params.append("service_point_id", previewParams.service_point_id);
      }

      const response = await fetch(`/api/precios?${params}`);
      const data = await response.json();

      if (data.data) {
        setPrecioPreview(data.data);
      } else {
        setPrecioPreview(null);
      }
    } catch (error) {
      console.error("Error fetching precio aplicable:", error);
      setPrecioPreview(null);
    }
  };

  // Handlers
  const handleCreate = () => {
    setEditingPrecio(null);
    setFormData({
      nivel: "BASE",
      entidad_tipo: "SERVICIO",
      entidad_id: "",
      ubicacion_id: "",
      service_point_id: "",
      precio: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: "",
      notas: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (precio: Precio) => {
    setEditingPrecio(precio);
    setFormData({
      nivel: precio.nivel,
      entidad_tipo: precio.entidad_tipo,
      entidad_id: precio.entidad_id,
      ubicacion_id: precio.ubicacion_id || "",
      service_point_id: precio.service_point_id || "",
      precio: precio.precio.toString(),
      fecha_inicio: precio.fecha_inicio.split("T")[0],
      fecha_fin: precio.fecha_fin ? precio.fecha_fin.split("T")[0] : "",
      notas: precio.notas || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, soft = true) => {
    const confirmMessage = soft
      ? "¿Desactivar este precio (soft delete)? Se establecerá fecha_fin a hoy."
      : "¿Eliminar permanentemente este precio? Esta acción no se puede deshacer.";

    if (!confirm(confirmMessage)) return;

    try {
      const params = new URLSearchParams({ id });
      if (!soft) {
        params.append("soft", "false");
      }

      const response = await fetch(`/api/precios?${params}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.message) {
        alert(
          soft
            ? "Precio desactivado exitosamente"
            : "Precio eliminado exitosamente"
        );
        fetchPrecios();
        fetchStats();
      } else {
        alert(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error deleting precio:", error);
      alert("Error al eliminar el precio");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.entidad_id) {
      alert("Debe seleccionar una entidad (servicio o producto)");
      return;
    }

    if (formData.nivel === "UBICACION" && !formData.ubicacion_id) {
      alert("Debe seleccionar una ubicación para precio de nivel UBICACION");
      return;
    }

    if (formData.nivel === "SERVICE_POINT" && !formData.service_point_id) {
      alert(
        "Debe seleccionar un service point para precio de nivel SERVICE_POINT"
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      nivel: formData.nivel,
      entidad_tipo: formData.entidad_tipo,
      entidad_id: formData.entidad_id,
      precio: parseFloat(formData.precio),
      fecha_inicio: formData.fecha_inicio,
    };

    if (formData.ubicacion_id) {
      payload.ubicacion_id = formData.ubicacion_id;
    }
    if (formData.service_point_id) {
      payload.service_point_id = formData.service_point_id;
    }
    if (formData.fecha_fin) {
      payload.fecha_fin = formData.fecha_fin;
    }
    if (formData.notas) {
      payload.notas = formData.notas;
    }

    try {
      let response;
      if (editingPrecio) {
        // UPDATE
        response = await fetch("/api/precios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPrecio.id, ...payload }),
        });
      } else {
        // CREATE
        response = await fetch("/api/precios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (data.data) {
        alert(
          editingPrecio
            ? "Precio actualizado exitosamente"
            : "Precio creado exitosamente"
        );
        setIsDialogOpen(false);
        fetchPrecios();
        fetchStats();
      } else {
        alert(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error saving precio:", error);
      alert("Error al guardar el precio");
    }
  };

  const handleNivelChange = (nivel: "BASE" | "UBICACION" | "SERVICE_POINT") => {
    setFormData({
      ...formData,
      nivel,
      // Limpiar campos no aplicables según jerarquía
      ubicacion_id: nivel === "BASE" ? "" : formData.ubicacion_id,
      service_point_id:
        nivel === "BASE" || nivel === "UBICACION"
          ? ""
          : formData.service_point_id,
    });
  };

  // Utilidades
  const getEntidadNombre = (precio: Precio): string => {
    if (precio.entidad_nombre) return precio.entidad_nombre;

    if (precio.entidad_tipo === "SERVICIO") {
      const servicio = servicios.find((s) => s.id === precio.entidad_id);
      return servicio?.name || "Servicio desconocido";
    } else {
      const producto = productos.find((p) => p.id === precio.entidad_id);
      return producto?.name || "Producto desconocido";
    }
  };

  const getUbicacionNombre = (precio: Precio): string => {
    if (precio.ubicacion_nombre) return precio.ubicacion_nombre;
    if (!precio.ubicacion_id) return "-";

    const ubicacion = ubicaciones.find((u) => u.id === precio.ubicacion_id);
    return ubicacion
      ? `${ubicacion.city}, ${ubicacion.province}`
      : "Ubicación desconocida";
  };

  const getServicePointNombre = (precio: Precio): string => {
    if (precio.service_point_nombre) return precio.service_point_nombre;
    if (!precio.service_point_id) return "-";

    const sp = servicePoints.find((s) => s.id === precio.service_point_id);
    return sp?.name || "Service Point desconocido";
  };

  const getNivelBadgeColor = (
    nivel: string
  ): "default" | "secondary" | "destructive" => {
    switch (nivel) {
      case "BASE":
        return "default";
      case "UBICACION":
        return "secondary";
      case "SERVICE_POINT":
        return "destructive";
      default:
        return "default";
    }
  };

  const getVigenciaBadge = (precio: Precio) => {
    const now = new Date();
    const inicio = new Date(precio.fecha_inicio);
    const fin = precio.fecha_fin ? new Date(precio.fecha_fin) : null;

    if (now < inicio) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Futuro
        </Badge>
      );
    }

    if (fin && now > fin) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Vencido
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Vigente
      </Badge>
    );
  };

  const filteredPrecios = precios.filter((precio) => {
    const matchesSearch =
      !filters.search ||
      getEntidadNombre(precio)
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      (precio.notas &&
        precio.notas.toLowerCase().includes(filters.search.toLowerCase()));

    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Sistema de Precios Jerárquico
          </h1>
          <p className="text-muted-foreground">
            Gestiona precios por nivel: BASE, UBICACIÓN y SERVICE POINT
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Precios
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_precios}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Precios Vigentes
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.precios_vigentes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Precio Promedio
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.precio_promedio.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Nivel</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>BASE:</span>
                    <span className="font-medium">
                      {stats.precios_por_nivel.BASE}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>UBICACION:</span>
                    <span className="font-medium">
                      {stats.precios_por_nivel.UBICACION}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SERVICE_POINT:</span>
                    <span className="font-medium">
                      {stats.precios_por_nivel.SERVICE_POINT}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y Acciones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <Label>Nivel</Label>
                <Select
                  value={filters.nivel}
                  onValueChange={(value) =>
                    setFilters({ ...filters, nivel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="BASE">BASE</SelectItem>
                    <SelectItem value="UBICACION">UBICACION</SelectItem>
                    <SelectItem value="SERVICE_POINT">SERVICE_POINT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo Entidad</Label>
                <Select
                  value={filters.entidad_tipo}
                  onValueChange={(value) =>
                    setFilters({ ...filters, entidad_tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="SERVICIO">SERVICIO</SelectItem>
                    <SelectItem value="PRODUCTO">PRODUCTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vigencia</Label>
                <Select
                  value={filters.vigentes}
                  onValueChange={(value) =>
                    setFilters({ ...filters, vigentes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="vigentes">Solo Vigentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Búsqueda</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleCreate} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Precio
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="gap-2"
              >
                <Info className="h-4 w-4" />
                Preview Precio Aplicable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview de Precio Aplicable */}
        {isPreviewOpen && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Preview: Precio Aplicable
              </CardTitle>
              <CardDescription>
                Simula qué precio se aplicaría según la jerarquía
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div>
                  <Label>Tipo Entidad</Label>
                  <Select
                    value={previewParams.entidad_tipo}
                    onValueChange={(value: "SERVICIO" | "PRODUCTO") =>
                      setPreviewParams({
                        ...previewParams,
                        entidad_tipo: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICIO">SERVICIO</SelectItem>
                      <SelectItem value="PRODUCTO">PRODUCTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Entidad</Label>
                  <Select
                    value={previewParams.entidad_id}
                    onValueChange={(value) =>
                      setPreviewParams({ ...previewParams, entidad_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {previewParams.entidad_tipo === "SERVICIO"
                        ? servicios.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        : productos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ubicación (opcional)</Label>
                  <Select
                    value={previewParams.ubicacion_id}
                    onValueChange={(value) =>
                      setPreviewParams({
                        ...previewParams,
                        ubicacion_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguna</SelectItem>
                      {ubicaciones.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.city}, {u.province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Service Point (opcional)</Label>
                  <Select
                    value={previewParams.service_point_id}
                    onValueChange={(value) =>
                      setPreviewParams({
                        ...previewParams,
                        service_point_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {servicePoints.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={fetchPrecioAplicable} className="mb-4">
                Calcular Precio Aplicable
              </Button>

              {precioPreview && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio Aplicable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-900">
                        €{precioPreview.precio.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        Nivel: <Badge>{precioPreview.nivel}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!precioPreview && previewParams.entidad_id && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-900 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Sin precio configurado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-800">
                      No hay precio aplicable para esta combinación
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabla de Precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios Configurados</CardTitle>
            <CardDescription>
              {filteredPrecios.length} precio(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando precios...
              </div>
            ) : filteredPrecios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron precios
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Service Point</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrecios.map((precio) => (
                    <TableRow key={precio.id}>
                      <TableCell>
                        <Badge variant={getNivelBadgeColor(precio.nivel)}>
                          {precio.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{precio.entidad_tipo}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getEntidadNombre(precio)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getUbicacionNombre(precio)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getServicePointNombre(precio)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        €{precio.precio.toFixed(2)}
                      </TableCell>
                      <TableCell>{getVigenciaBadge(precio)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(precio.fecha_inicio).toLocaleDateString(
                          "es-ES"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {precio.fecha_fin
                          ? new Date(precio.fecha_fin).toLocaleDateString(
                              "es-ES"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {precio.is_active ? (
                          <Badge variant="default" className="bg-green-600">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(precio)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(precio.id, true)}
                          >
                            <XCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(precio.id, false)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal Crear/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrecio ? "Editar Precio" : "Crear Nuevo Precio"}
              </DialogTitle>
              <DialogDescription>
                Configure el precio según la jerarquía: BASE → UBICACION →
                SERVICE_POINT
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Nivel - Solo editable en creación */}
                <div className="grid gap-2">
                  <Label htmlFor="nivel">Nivel *</Label>
                  <Select
                    value={formData.nivel}
                    onValueChange={handleNivelChange}
                    disabled={!!editingPrecio}
                  >
                    <SelectTrigger id="nivel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASE">BASE (Global)</SelectItem>
                      <SelectItem value="UBICACION">
                        UBICACION (Por ciudad)
                      </SelectItem>
                      <SelectItem value="SERVICE_POINT">
                        SERVICE_POINT (Específico)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {editingPrecio && (
                    <p className="text-xs text-muted-foreground">
                      El nivel no se puede modificar después de crear el precio
                    </p>
                  )}
                </div>

                {/* Tipo Entidad - Solo editable en creación */}
                <div className="grid gap-2">
                  <Label htmlFor="entidad_tipo">Tipo de Entidad *</Label>
                  <Select
                    value={formData.entidad_tipo}
                    onValueChange={(value: "SERVICIO" | "PRODUCTO") =>
                      setFormData({
                        ...formData,
                        entidad_tipo: value,
                        entidad_id: "",
                      })
                    }
                    disabled={!!editingPrecio}
                  >
                    <SelectTrigger id="entidad_tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICIO">SERVICIO</SelectItem>
                      <SelectItem value="PRODUCTO">PRODUCTO</SelectItem>
                    </SelectContent>
                  </Select>
                  {editingPrecio && (
                    <p className="text-xs text-muted-foreground">
                      El tipo de entidad no se puede modificar
                    </p>
                  )}
                </div>

                {/* Entidad - Solo editable en creación */}
                <div className="grid gap-2">
                  <Label htmlFor="entidad_id">
                    {formData.entidad_tipo === "SERVICIO"
                      ? "Servicio"
                      : "Producto"}{" "}
                    *
                  </Label>
                  <Select
                    value={formData.entidad_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, entidad_id: value })
                    }
                    disabled={!!editingPrecio}
                  >
                    <SelectTrigger id="entidad_id">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.entidad_tipo === "SERVICIO"
                        ? servicios.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        : productos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  {editingPrecio && (
                    <p className="text-xs text-muted-foreground">
                      La entidad no se puede modificar
                    </p>
                  )}
                </div>

                {/* Ubicación - Requerida para UBICACION y SERVICE_POINT, no editable */}
                {(formData.nivel === "UBICACION" ||
                  formData.nivel === "SERVICE_POINT") && (
                  <div className="grid gap-2">
                    <Label htmlFor="ubicacion_id">Ubicación *</Label>
                    <Select
                      value={formData.ubicacion_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, ubicacion_id: value })
                      }
                      disabled={!!editingPrecio}
                    >
                      <SelectTrigger id="ubicacion_id">
                        <SelectValue placeholder="Seleccionar ubicación..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ubicaciones.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.city}, {u.province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editingPrecio && (
                      <p className="text-xs text-muted-foreground">
                        La ubicación no se puede modificar
                      </p>
                    )}
                  </div>
                )}

                {/* Service Point - Requerido solo para SERVICE_POINT, no editable */}
                {formData.nivel === "SERVICE_POINT" && (
                  <div className="grid gap-2">
                    <Label htmlFor="service_point_id">Service Point *</Label>
                    <Select
                      value={formData.service_point_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, service_point_id: value })
                      }
                      disabled={!!editingPrecio}
                    >
                      <SelectTrigger id="service_point_id">
                        <SelectValue placeholder="Seleccionar service point..." />
                      </SelectTrigger>
                      <SelectContent>
                        {servicePoints
                          .filter(
                            (sp) =>
                              !formData.ubicacion_id ||
                              sp.location_id === formData.ubicacion_id
                          )
                          .map((sp) => (
                            <SelectItem key={sp.id} value={sp.id}>
                              {sp.name} ({sp.type})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {editingPrecio && (
                      <p className="text-xs text-muted-foreground">
                        El service point no se puede modificar
                      </p>
                    )}
                  </div>
                )}

                {/* Precio - Siempre editable */}
                <div className="grid gap-2">
                  <Label htmlFor="precio">Precio (€) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Fechas - Siempre editables */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fecha_inicio: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fecha_fin">Fecha Fin (opcional)</Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_fin: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Notas - Siempre editable */}
                <div className="grid gap-2">
                  <Label htmlFor="notas">Notas (opcional)</Label>
                  <Textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) =>
                      setFormData({ ...formData, notas: e.target.value })
                    }
                    placeholder="Notas adicionales sobre este precio..."
                    rows={3}
                  />
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
                  {editingPrecio ? "Actualizar" : "Crear"} Precio
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
