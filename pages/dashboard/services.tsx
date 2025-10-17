import { useState, useEffect } from "react";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [servicePoints, setServicePoints] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [filters, setFilters] = useState({
    status: "all",
    location_id: "all",
    search: "",
  });

  const [formData, setFormData] = useState({
    service_point_id: "",
    service_type_id: "",
    name: "",
    description: "",
    status: "inactive" as
      | "active"
      | "inactive"
      | "maintenance"
      | "out_of_service",
    capacity: "",
    current_usage: "",
    location_details: "",
    installation_date: "",
    is_active: true,
  });

  const [maintenanceDate, setMaintenanceDate] = useState("");

  useEffect(() => {
    fetchServices();
    fetchServicePoints();
    fetchServiceTypes();
    fetchLocations();
  }, [filters.status, filters.location_id]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchServicePoints = async () => {
    try {
      const response = await fetch("/api/service-points");
      const data = await response.json();
      if (data.success) {
        setServicePoints(data.data);
      }
    } catch (error) {
      console.error("Error fetching service points:", error);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch("/api/service-types");
      const data = await response.json();
      if (data.success) {
        setServiceTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching service types:", error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ with_details: "true" });

      if (filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.location_id !== "all") {
        params.append("location_id", filters.location_id);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Si no hay service_type_id, obtener el primero disponible automáticamente
      let serviceTypeId = formData.service_type_id;

      if (!serviceTypeId && serviceTypes.length > 0) {
        serviceTypeId = serviceTypes[0].id;
        console.log("Auto-asignando tipo de servicio:", serviceTypes[0].name);
      }

      // Solo enviamos los campos que EXISTEN en la tabla services
      const payload = {
        name: formData.name,
        service_type_id: serviceTypeId,
        description: formData.description || null,
        status: formData.status,
      };

      console.log("Payload a enviar:", payload);

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchServices();
        alert("Servicio creado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating service:", error);
      alert("Error al crear el servicio");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) return;

    try {
      // Solo enviamos los campos que EXISTEN en la tabla services
      const payload = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
      };

      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setSelectedService(null);
        resetForm();
        fetchServices();
        alert("Servicio actualizado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Error al actualizar el servicio");
    }
  };

  const handleUpdateStatus = async (serviceId: string, status: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        fetchServices();
        alert(`Estado actualizado a: ${status}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado");
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !maintenanceDate) return;

    try {
      const response = await fetch(
        `/api/services/${selectedService.id}/schedule-maintenance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ next_maintenance_date: maintenanceDate }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setShowMaintenanceModal(false);
        setSelectedService(null);
        setMaintenanceDate("");
        fetchServices();
        alert("Mantenimiento programado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      alert("Error al programar el mantenimiento");
    }
  };

  const handleCompleteMaintenance = async (serviceId: string) => {
    if (!confirm("¿Confirmar que se completó el mantenimiento?")) return;

    try {
      const response = await fetch(
        `/api/services/${serviceId}/complete-maintenance`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchServices();
        alert("Mantenimiento completado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error completing maintenance:", error);
      alert("Error al completar el mantenimiento");
    }
  };

  const openEditModal = (service: any) => {
    setSelectedService(service);
    setFormData({
      service_point_id: service.service_point_id,
      service_type_id: service.service_type_id,
      name: service.service_name || service.name,
      description: service.service_description || service.description || "",
      status: service.status,
      capacity: service.capacity?.toString() || "",
      current_usage: service.current_usage?.toString() || "",
      location_details: service.location_details || "",
      installation_date: service.installation_date || "",
      is_active: service.is_active,
    });
    setShowEditModal(true);
  };

  const openMaintenanceModal = (service: any) => {
    setSelectedService(service);
    setMaintenanceDate("");
    setShowMaintenanceModal(true);
  };

  const resetForm = () => {
    setFormData({
      service_point_id: "",
      service_type_id: "",
      name: "",
      description: "",
      status: "inactive",
      capacity: "",
      current_usage: "",
      location_details: "",
      installation_date: "",
      is_active: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      out_of_service: "bg-red-100 text-red-800",
    };

    const labels = {
      active: "Activo",
      inactive: "Inactivo",
      maintenance: "Mantenimiento",
      out_of_service: "Fuera de Servicio",
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getUsagePercentage = (current: number, capacity: number) => {
    if (!capacity) return 0;
    return Math.round((current / capacity) * 100);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los servicios instalados en puntos de servicio
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4 flex-1 flex-wrap">
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && fetchServices()}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filters.location_id}
                onChange={(e) =>
                  setFilters({ ...filters, location_id: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las ubicaciones</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city} - {loc.province}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="maintenance">En Mantenimiento</option>
                <option value="out_of_service">Fuera de Servicio</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              + Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando servicios...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-3 p-12 text-center">
              <p className="text-gray-500">No se encontraron servicios</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {service.service_name || service.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {service.service_type_name}
                    </p>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                {service.service_description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {service.service_description}
                  </p>
                )}

                {/* Capacity Bar */}
                {service.capacity && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Capacidad</span>
                      <span className="font-medium">
                        {service.current_usage || 0} / {service.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getUsagePercentage(
                            service.current_usage || 0,
                            service.capacity
                          ) > 80
                            ? "bg-red-600"
                            : getUsagePercentage(
                                service.current_usage || 0,
                                service.capacity
                              ) > 50
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{
                          width: `${getUsagePercentage(
                            service.current_usage || 0,
                            service.capacity
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Service Point Info */}
                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Punto:</strong> {service.service_point_name}
                  </p>
                  {service.location_details && (
                    <p className="text-sm text-gray-600">
                      <strong>Ubicación:</strong> {service.location_details}
                    </p>
                  )}
                </div>

                {/* Maintenance Info */}
                {service.next_maintenance_date && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Próximo mantenimiento:</strong>{" "}
                      {new Date(
                        service.next_maintenance_date
                      ).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Editar
                  </button>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateStatus(service.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Cambiar estado
                    </option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="out_of_service">Fuera de Servicio</option>
                  </select>

                  <button
                    onClick={() => openMaintenanceModal(service)}
                    className="px-3 py-1 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                  >
                    Programar
                  </button>

                  {service.status === "maintenance" && (
                    <button
                      onClick={() => handleCompleteMaintenance(service.id)}
                      className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nuevo Servicio</h2>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="inactive">Inactivo</option>
                    <option value="active">Activo</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="out_of_service">Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure to Add Modal */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Editar Servicio</h2>
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedService(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Programar Mantenimiento</h2>
            <p className="text-gray-600 mb-4">
              Servicio:{" "}
              <strong>
                {selectedService.service_name || selectedService.name}
              </strong>
            </p>
            <form onSubmit={handleScheduleMaintenance}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Próximo Mantenimiento *
                </label>
                <input
                  type="date"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setSelectedService(null);
                    setMaintenanceDate("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
