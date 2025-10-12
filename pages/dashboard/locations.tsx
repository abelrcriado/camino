import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react";

interface Location {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
  is_active: boolean;
  service_points_count?: number;
  camino_id?: string | null;
  camino_nombre?: string | null;
  created_at: string;
}

interface CaminoMinimal {
  id: string;
  nombre: string;
  codigo: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [caminos, setCaminos] = useState<CaminoMinimal[]>([]);
  const [formData, setFormData] = useState({
    city: "",
    province: "",
    postal_code: "",
    country: "España",
    is_active: true,
    camino_id: undefined as string | undefined,
  });

  useEffect(() => {
    fetchLocations();
    fetchCaminos();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      // Standard pattern: GET returns array directly
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaminos = async () => {
    try {
      const res = await fetch("/api/caminos");
      const data = await res.json();
      // Expect API to return an array of caminos
      setCaminos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching caminos:", error);
    }
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({
      city: "",
      province: "",
      postal_code: "",
      country: "España",
      is_active: true,
      camino_id: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      city: location.city,
      province: location.province,
      postal_code: location.postal_code || "",
      country: location.country,
      is_active: location.is_active,
      camino_id: location.camino_id ?? undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta ubicación?"))
      return;

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Ubicación eliminada exitosamente");
        fetchLocations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Error al eliminar la ubicación");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingLocation
      ? `/api/locations/${editingLocation.id}`
      : "/api/locations";
    const method = editingLocation ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(
          editingLocation
            ? "Ubicación actualizada exitosamente"
            : "Ubicación creada exitosamente"
        );
        setIsDialogOpen(false);
        fetchLocations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error al guardar la ubicación");
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Ubicaciones</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona las ciudades y zonas donde opera Camino
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Ubicación
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">
                  ¿Qué son las ubicaciones?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Las ubicaciones son las ciudades o zonas geográficas donde
                  Camino tiene presencia. Primero debes crear las ubicaciones,
                  luego podrás dar de alta Puntos de Servicio (talleres o
                  lugares con vending machines) en cada ubicación.
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
                placeholder="Buscar por ciudad o provincia..."
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
            <CardTitle>Ubicaciones ({filteredLocations.length})</CardTitle>
            <CardDescription>
              Lista de ciudades y zonas donde Camino ofrece sus servicios
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
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>Camino</TableHead>
                    <TableHead>Código Postal</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Puntos de Servicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {location.city}
                          </div>
                        </TableCell>
                        <TableCell>{location.province}</TableCell>
                        <TableCell className="text-sm">
                          {location.camino_nombre || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {location.postal_code || "-"}
                        </TableCell>
                        <TableCell>{location.country}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {location.service_points_count || 0} puntos
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {location.is_active ? (
                            <Badge className="bg-green-500">Activa</Badge>
                          ) : (
                            <Badge variant="secondary">Inactiva</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                              disabled={
                                (location.service_points_count || 0) > 0
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <MapPin className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground">
                            No hay ubicaciones registradas
                          </p>
                          <Button
                            onClick={handleCreate}
                            variant="outline"
                            size="sm"
                          >
                            Crear primera ubicación
                          </Button>
                        </div>
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
                {editingLocation ? "Editar Ubicación" : "Nueva Ubicación"}
              </DialogTitle>
              <DialogDescription>
                Define la ciudad o zona geográfica donde Camino operará
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Madrid, Barcelona, Valencia..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      placeholder="Madrid, Barcelona, Valencia..."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">
                      Código Postal (opcional)
                    </Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      placeholder="28001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Ubicación activa (permite crear puntos de servicio)
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="camino_id">Camino asociado (opcional)</Label>
                  <select
                    id="camino_id"
                    value={formData.camino_id ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        camino_id: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded border p-2"
                  >
                    <option value="">-- Ninguno --</option>
                    {caminos.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.codigo} — {cam.nombre}
                      </option>
                    ))}
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
                  {editingLocation ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
