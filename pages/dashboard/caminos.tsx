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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/dashboard/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/dashboard/components/ui/dialog";
import { Textarea } from "@/dashboard/components/ui/textarea";
import { Plus, Edit, Trash2, Search, MapPin, Activity } from "lucide-react";

interface Camino {
  id: string;
  nombre: string;
  codigo: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo: "activo" | "inactivo" | "mantenimiento" | "planificado";
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

const ESTADOS_OPERATIVOS = [
  { value: "activo", label: "Activo", color: "bg-green-500" },
  { value: "inactivo", label: "Inactivo", color: "bg-gray-500" },
  { value: "mantenimiento", label: "Mantenimiento", color: "bg-yellow-500" },
  { value: "planificado", label: "Planificado", color: "bg-blue-500" },
];

export default function CaminosPage() {
  const [caminos, setCaminos] = useState<Camino[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCamino, setEditingCamino] = useState<Camino | null>(null);
  const [formData, setFormData] = useState<{
    nombre: string;
    codigo: string;
    zona_operativa: string;
    region: string;
    estado_operativo: "activo" | "inactivo" | "mantenimiento" | "planificado";
    descripcion: string;
  }>({
    nombre: "",
    codigo: "",
    zona_operativa: "",
    region: "",
    estado_operativo: "activo",
    descripcion: "",
  });

  useEffect(() => {
    fetchCaminos();
  }, []);

  const fetchCaminos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/caminos");
      const data = await response.json();
      setCaminos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching caminos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCamino(null);
    setFormData({
      nombre: "",
      codigo: "",
      zona_operativa: "",
      region: "",
      estado_operativo: "activo",
      descripcion: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (camino: Camino) => {
    setEditingCamino(camino);
    setFormData({
      nombre: camino.nombre,
      codigo: camino.codigo,
      zona_operativa: camino.zona_operativa || "",
      region: camino.region || "",
      estado_operativo: camino.estado_operativo,
      descripcion: camino.descripcion || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este camino?")) return;

    try {
      const response = await fetch("/api/caminos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert("Camino eliminado exitosamente");
        fetchCaminos();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Error al eliminar"}`);
      }
    } catch (error) {
      console.error("Error deleting camino:", error);
      alert("Error al eliminar el camino");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingCamino ? "PUT" : "POST";
    const body = editingCamino
      ? { id: editingCamino.id, ...formData }
      : formData;

    try {
      const response = await fetch("/api/caminos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(
          editingCamino
            ? "Camino actualizado exitosamente"
            : "Camino creado exitosamente"
        );
        setIsDialogOpen(false);
        fetchCaminos();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Error al guardar"}`);
      }
    } catch (error) {
      console.error("Error saving camino:", error);
      alert("Error al guardar el camino");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = ESTADOS_OPERATIVOS.find((e) => e.value === estado);
    return (
      <Badge className={estadoConfig?.color || "bg-gray-500"}>
        {estadoConfig?.label || estado}
      </Badge>
    );
  };

  const filteredCaminos = caminos.filter((camino) => {
    const matchesSearch =
      camino.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camino.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (camino.region?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesEstado =
      filterEstado === "todos" || camino.estado_operativo === filterEstado;

    return matchesSearch && matchesEstado;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caminos</h1>
            <p className="text-muted-foreground">
              Gestiona los caminos del sistema (CSF, CN, CP, etc.)
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Camino
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Caminos
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caminos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {caminos.filter((c) => c.estado_operativo === "activo").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Mantenimiento
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  caminos.filter((c) => c.estado_operativo === "mantenimiento")
                    .length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planificados
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  caminos.filter((c) => c.estado_operativo === "planificado")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código o región..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {ESTADOS_OPERATIVOS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Caminos</CardTitle>
            <CardDescription>
              {filteredCaminos.length} camino(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Zona Operativa</TableHead>
                    <TableHead>Región</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaminos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No se encontraron caminos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCaminos.map((camino) => (
                      <TableRow key={camino.id}>
                        <TableCell className="font-mono font-bold">
                          {camino.codigo}
                        </TableCell>
                        <TableCell className="font-medium">
                          {camino.nombre}
                        </TableCell>
                        <TableCell>{camino.zona_operativa || "-"}</TableCell>
                        <TableCell>{camino.region || "-"}</TableCell>
                        <TableCell>
                          {getEstadoBadge(camino.estado_operativo)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(camino)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(camino.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCamino ? "Editar Camino" : "Nuevo Camino"}
            </DialogTitle>
            <DialogDescription>
              {editingCamino
                ? "Actualiza la información del camino"
                : "Crea un nuevo camino en el sistema"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Camino de Santiago Francés"
                    required
                    minLength={3}
                    maxLength={150}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="CSF"
                    required
                    minLength={2}
                    maxLength={10}
                    pattern="[A-Z0-9_-]+"
                    disabled={!!editingCamino}
                  />
                  {editingCamino && (
                    <p className="text-xs text-muted-foreground">
                      El código no puede modificarse
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zona_operativa">Zona Operativa</Label>
                  <Input
                    id="zona_operativa"
                    value={formData.zona_operativa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zona_operativa: e.target.value,
                      })
                    }
                    placeholder="Norte de España"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    placeholder="Galicia, Castilla y León"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_operativo">Estado Operativo</Label>
                <Select
                  value={formData.estado_operativo}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, estado_operativo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_OPERATIVOS.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Descripción detallada del camino..."
                  rows={4}
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
                {editingCamino ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
