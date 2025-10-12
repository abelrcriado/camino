import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, MapPin } from "lucide-react";

interface Location {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
}

interface ServicePoint {
  id: string;
  name: string;
  code?: string;
  type: "CSP" | "CSS" | "CSH";
  location_id: string;
  address: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  province?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  service_type_id: string;
  status: "active" | "inactive" | "maintenance" | "out_of_service";
}

interface Warehouse {
  id: string;
  name: string;
  warehouse_type: "physical_warehouse" | "service_point";
  location_id: string;
}

interface ServiceAssignment {
  id: string;
  service_id: string;
  service_name: string;
  service_type_name: string;
  warehouse_id?: string | null;
  warehouse_name?: string | null;
  status: "active" | "inactive" | "maintenance" | "removed";
  assigned_at: string;
}

export default function ServicePointsPage() {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] =
    useState<ServicePoint | null>(null);
  const [assignedServices, setAssignedServices] = useState<ServiceAssignment[]>(
    []
  );

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "CSP" as "CSP" | "CSS" | "CSH",
    location_id: "",
    address: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    partner_name: "",
    workshop_name: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    service_id: "",
    warehouse_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("📍 Locations state updated:", locations.length, locations);
  }, [locations]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchServicePoints(),
      fetchLocations(),
      fetchServices(),
      fetchWarehouses(),
    ]);
    setLoading(false);
  };

  const fetchServicePoints = async () => {
    try {
      const response = await fetch("/api/service-points");
      const data = await response.json();
      // service-points devuelve el array directamente
      if (Array.isArray(data)) {
        setServicePoints(data);
      } else if (data.success && data.data) {
        setServicePoints(data.data);
      }
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      console.log("Locations response:", data);
      // locations devuelve { locations }
      if (data.locations) {
        setLocations(data.locations);
        console.log("Locations loaded:", data.locations.length);
      } else if (data.success && data.data) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      // services devuelve el array directamente
      if (Array.isArray(data)) {
        setServices(data);
      } else if (data.success && data.data) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses");
      const data = await response.json();
      // warehouses devuelve el array directamente
      if (Array.isArray(data)) {
        setWarehouses(data);
      } else if (data.success && data.data) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchServiceAssignments = async (servicePointId: string) => {
    try {
      const response = await fetch(
        `/api/service-assignments?service_point_id=${servicePointId}&status=active`
      );
      const data = await response.json();
      if (data.success) {
        setAssignedServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching service assignments:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/service-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchServicePoints();
      } else {
        alert(data.error || "Error creating service point");
      }
    } catch (error) {
      console.error("Error creating service point:", error);
      alert("Error creating service point");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicePoint) return;

    try {
      const response = await fetch(
        `/api/service-points/${selectedServicePoint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude
              ? parseFloat(formData.longitude)
              : null,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedServicePoint(null);
        resetForm();
        fetchServicePoints();
      } else {
        alert(data.error || "Error updating service point");
      }
    } catch (error) {
      console.error("Error updating service point:", error);
      alert("Error updating service point");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("¿Estás seguro de que deseas eliminar este punto de servicio?")
    )
      return;

    try {
      const response = await fetch(`/api/service-points/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchServicePoints();
      } else {
        alert(data.error || "Error deleting service point");
      }
    } catch (error) {
      console.error("Error deleting service point:", error);
      alert("Error deleting service point");
    }
  };

  const handleAssignService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicePoint) return;

    try {
      const response = await fetch("/api/service-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: assignmentData.service_id,
          location_id: selectedServicePoint.location_id,
          service_point_id: selectedServicePoint.id,
          warehouse_id: assignmentData.warehouse_id || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssignmentData({ service_id: "", warehouse_id: "" });
        fetchServiceAssignments(selectedServicePoint.id);
        alert("Servicio asignado correctamente");
      } else {
        alert(data.error || "Error asignando servicio");
      }
    } catch (error) {
      console.error("Error assigning service:", error);
      alert("Error asignando servicio");
    }
  };

  const handleUnassignService = async (assignmentId: string) => {
    if (!confirm("¿Desasignar este servicio?")) return;

    try {
      const response = await fetch(`/api/service-assignments/${assignmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success && selectedServicePoint) {
        fetchServiceAssignments(selectedServicePoint.id);
      }
    } catch (error) {
      console.error("Error unassigning service:", error);
    }
  };

  const openEditModal = (servicePoint: ServicePoint) => {
    setSelectedServicePoint(servicePoint);
    setFormData({
      name: servicePoint.name,
      code: servicePoint.code || "",
      type: servicePoint.type,
      location_id: servicePoint.location_id,
      address: servicePoint.address,
      postal_code: servicePoint.postal_code || "",
      latitude: servicePoint.latitude?.toString() || "",
      longitude: servicePoint.longitude?.toString() || "",
      partner_name: (servicePoint as any).partner_name || "",
      workshop_name: (servicePoint as any).workshop_name || "",
    });
    setShowEditModal(true);
  };

  const openAssignModal = async (servicePoint: ServicePoint) => {
    setSelectedServicePoint(servicePoint);
    await fetchServiceAssignments(servicePoint.id);
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "CSP",
      location_id: "",
      address: "",
      postal_code: "",
      latitude: "",
      longitude: "",
      partner_name: "",
      workshop_name: "",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CSP":
        return "Partner";
      case "CSS":
        return "Propio";
      case "CSH":
        return "Taller Aliado";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CSP":
        return "bg-blue-100 text-blue-800";
      case "CSS":
        return "bg-green-100 text-green-800";
      case "CSH":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationWarehouses = (locationId: string) => {
    return warehouses.filter((w) => w.location_id === locationId);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Puntos de Servicio</h1>
            <p className="text-gray-500 mt-1">
              Gestiona los puntos de servicio y sus servicios asignados
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Punto de Servicio
          </button>
        </div>

        {/* Service Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicePoints.map((sp) => (
            <div
              key={sp.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{sp.name}</h3>
                  <p className="text-sm text-gray-500">{sp.code}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                    sp.type
                  )}`}
                >
                  {getTypeLabel(sp.type)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {sp.city}, {sp.province}
                  </span>
                </div>
                <div className="pl-6">{sp.address}</div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => openAssignModal(sp)}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors"
                >
                  🔧 Servicios
                </button>
                <button
                  onClick={() => openEditModal(sp)}
                  className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(sp.id)}
                  className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {servicePoints.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay puntos de servicio creados</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Crear el primero
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Crear Punto de Servicio
              </h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="CSP-MAD-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="CSP">CSP - Partner</option>
                      <option value="CSS">CSS - Propio</option>
                      <option value="CSH">CSH - Taller Aliado</option>
                    </select>
                  </div>

                  {formData.type === "CSP" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Partner *
                      </label>
                      <input
                        type="text"
                        value={formData.partner_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partner_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Biketown Shop"
                        required
                      />
                    </div>
                  )}

                  {formData.type === "CSH" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Taller *
                      </label>
                      <input
                        type="text"
                        value={formData.workshop_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workshop_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Taller Mecánica Pro"
                        required
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación *
                    </label>
                    <select
                      value={formData.location_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Seleccionar ubicación...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city}, {loc.province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal - Similar structure to Create */}
        {showEditModal && selectedServicePoint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Editar Punto de Servicio
              </h2>
              <form onSubmit={handleEdit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="CSP">CSP - Partner</option>
                      <option value="CSS">CSS - Propio</option>
                      <option value="CSH">CSH - Taller Aliado</option>
                    </select>
                  </div>

                  {formData.type === "CSP" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Partner *
                      </label>
                      <input
                        type="text"
                        value={formData.partner_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partner_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Biketown Shop"
                        required
                      />
                    </div>
                  )}

                  {formData.type === "CSH" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Taller *
                      </label>
                      <input
                        type="text"
                        value={formData.workshop_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workshop_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Taller Mecánica Pro"
                        required
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación *
                    </label>
                    <select
                      value={formData.location_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Seleccionar ubicación...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city}, {loc.province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedServicePoint(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Services Modal */}
        {showAssignModal && selectedServicePoint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2">Servicios Asignados</h2>
              <p className="text-gray-600 mb-6">{selectedServicePoint.name}</p>

              {/* Assigned Services List */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Servicios Activos</h3>
                {assignedServices.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay servicios asignados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedServices.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {assignment.service_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Tipo: {assignment.service_type_name}
                            {assignment.warehouse_name && (
                              <> • Almacén: {assignment.warehouse_name}</>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignService(assignment.id)}
                          className="text-red-600 hover:text-red-700 px-3 py-1 text-sm"
                        >
                          Desasignar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign New Service Form */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Asignar Nuevo Servicio</h3>
                <form onSubmit={handleAssignService}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Servicio *
                      </label>
                      <select
                        value={assignmentData.service_id}
                        onChange={(e) =>
                          setAssignmentData({
                            ...assignmentData,
                            service_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Seleccionar servicio...</option>
                        {services
                          .filter((s) => s.status === "active")
                          .map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Almacén (opcional)
                      </label>
                      <select
                        value={assignmentData.warehouse_id}
                        onChange={(e) =>
                          setAssignmentData({
                            ...assignmentData,
                            warehouse_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Sin almacén</option>
                        {getLocationWarehouses(
                          selectedServicePoint.location_id
                        ).map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} (
                            {warehouse.warehouse_type === "physical_warehouse"
                              ? "Stock"
                              : "Punto de Servicio"}
                            )
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Solo servicios con productos físicos necesitan un
                        almacén
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Asignar Servicio
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedServicePoint(null);
                    setAssignedServices([]);
                    setAssignmentData({ service_id: "", warehouse_id: "" });
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
