import { useState, useEffect } from "react";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

type WarehouseType = "physical_warehouse" | "service_point";

interface Location {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouse_type?: WarehouseType;
  location_id?: string;
  description?: string;
  address?: string;
  specific_address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  max_stock_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Stats cuando se consulta con with_stats=true
  products_count?: number;
  total_stock?: number;
  stock_value_cents?: number;
  // Datos de location (cuando se usa v_warehouse_full)
  location_name?: string;
  province?: string;
  type_label?: string;
}

interface WarehouseFormData {
  code: string;
  name: string;
  warehouse_type: WarehouseType;
  location_id: string;
  description: string;
  address: string;
  specific_address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  max_stock_capacity: string;
  is_active: boolean;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Locations disponibles
  const [locations, setLocations] = useState<Location[]>([]);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );

  // Formulario
  const [formData, setFormData] = useState<WarehouseFormData>({
    code: "",
    name: "",
    warehouse_type: "physical_warehouse",
    location_id: "",
    description: "",
    address: "",
    specific_address: "",
    city: "",
    postal_code: "",
    country: "España",
    latitude: "",
    longitude: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    max_stock_capacity: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar ubicaciones
  useEffect(() => {
    fetchLocations();
  }, []);

  // Cargar almacenes
  useEffect(() => {
    fetchWarehouses();
  }, [filterActive]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations?is_active=true");
      const data = await response.json();
      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== "all") {
        params.append(
          "is_active",
          filterActive === "active" ? "true" : "false"
        );
      }
      params.append("with_stats", "true");

      const response = await fetch(`/api/warehouses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setWarehouses(data.data || []);
      } else {
        console.error("Error loading warehouses:", data.error);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof WarehouseFormData, string>> = {};

    if (!formData.code.trim()) {
      errors.code = "El código es obligatorio";
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      errors.code = "Solo letras mayúsculas, números y guiones";
    }

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.length < 3) {
      errors.name = "Mínimo 3 caracteres";
    }

    if (
      formData.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)
    ) {
      errors.contact_email = "Email inválido";
    }

    if (formData.latitude) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "Latitud debe estar entre -90 y 90";
      }
    }

    if (formData.longitude) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "Longitud debe estar entre -180 y 180";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear almacén
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        warehouse_type: formData.warehouse_type,
        is_active: formData.is_active,
      };

      // Campos opcionales
      if (formData.location_id) payload.location_id = formData.location_id;
      if (formData.description) payload.description = formData.description;
      if (formData.address) payload.address = formData.address;
      if (formData.specific_address)
        payload.specific_address = formData.specific_address;
      if (formData.city) payload.city = formData.city;
      if (formData.postal_code) payload.postal_code = formData.postal_code;
      if (formData.country) payload.country = formData.country;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude)
        payload.longitude = parseFloat(formData.longitude);
      if (formData.contact_person)
        payload.contact_person = formData.contact_person;
      if (formData.contact_phone)
        payload.contact_phone = formData.contact_phone;
      if (formData.contact_email)
        payload.contact_email = formData.contact_email;
      if (formData.max_stock_capacity)
        payload.max_stock_capacity = parseInt(formData.max_stock_capacity);

      const response = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchWarehouses();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating warehouse:", error);
      alert("Error al crear almacén");
    }
  };

  // Editar almacén
  const handleEdit = async () => {
    if (!selectedWarehouse || !validateForm()) return;

    try {
      const payload: any = {
        name: formData.name,
        warehouse_type: formData.warehouse_type,
        is_active: formData.is_active,
      };

      // Campos opcionales
      if (formData.location_id !== selectedWarehouse.location_id)
        payload.location_id = formData.location_id || null;
      if (formData.description !== selectedWarehouse.description)
        payload.description = formData.description;
      if (formData.address !== selectedWarehouse.address)
        payload.address = formData.address;
      if (formData.specific_address !== selectedWarehouse.specific_address)
        payload.specific_address = formData.specific_address;
      if (formData.city !== selectedWarehouse.city)
        payload.city = formData.city;
      if (formData.postal_code !== selectedWarehouse.postal_code)
        payload.postal_code = formData.postal_code;
      if (formData.country !== selectedWarehouse.country)
        payload.country = formData.country;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude)
        payload.longitude = parseFloat(formData.longitude);
      if (formData.contact_person !== selectedWarehouse.contact_person)
        payload.contact_person = formData.contact_person;
      if (formData.contact_phone !== selectedWarehouse.contact_phone)
        payload.contact_phone = formData.contact_phone;
      if (formData.contact_email !== selectedWarehouse.contact_email)
        payload.contact_email = formData.contact_email;
      if (formData.max_stock_capacity)
        payload.max_stock_capacity = parseInt(formData.max_stock_capacity);

      const response = await fetch(`/api/warehouses/${selectedWarehouse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        resetForm();
        fetchWarehouses();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating warehouse:", error);
      alert("Error al actualizar almacén");
    }
  };

  // Eliminar almacén
  const handleDelete = async () => {
    if (!selectedWarehouse) return;

    try {
      const response = await fetch(`/api/warehouses/${selectedWarehouse.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setShowDeleteModal(false);
        setSelectedWarehouse(null);
        fetchWarehouses();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      alert("Error al eliminar almacén");
    }
  };

  // Toggle estado
  const handleToggleStatus = async (warehouse: Warehouse) => {
    try {
      const response = await fetch(`/api/warehouses/${warehouse.id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        fetchWarehouses();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Error al cambiar estado");
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      warehouse_type: "physical_warehouse",
      location_id: "",
      description: "",
      address: "",
      specific_address: "",
      city: "",
      postal_code: "",
      country: "ES",
      latitude: "",
      longitude: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      max_stock_capacity: "",
      is_active: true,
    });
    setFormErrors({});
    setSelectedWarehouse(null);
  };

  // Abrir modal de edición
  const openEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      warehouse_type: warehouse.warehouse_type || "physical_warehouse",
      location_id: warehouse.location_id || "",
      description: warehouse.description || "",
      address: warehouse.address || "",
      specific_address: warehouse.specific_address || "",
      city: warehouse.city || "",
      postal_code: warehouse.postal_code || "",
      country: warehouse.country,
      latitude: warehouse.latitude?.toString() || "",
      longitude: warehouse.longitude?.toString() || "",
      contact_person: warehouse.contact_person || "",
      contact_phone: warehouse.contact_phone || "",
      contact_email: warehouse.contact_email || "",
      max_stock_capacity: warehouse.max_stock_capacity?.toString() || "",
      is_active: warehouse.is_active,
    });
    setShowEditModal(true);
  };

  // Filtrar almacenes
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: warehouses.length,
    active: warehouses.filter((w) => w.is_active).length,
    inactive: warehouses.filter((w) => !w.is_active).length,
    totalStock: warehouses.reduce((sum, w) => sum + (w.total_stock || 0), 0),
    totalValue:
      warehouses.reduce((sum, w) => sum + (w.stock_value_cents || 0), 0) / 100,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Puntos de Stock
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de almacenes, vendings, talleres y puntos de servicio
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus />
            <span>Nuevo Punto de Stock</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Puntos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <FiPackage className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <FiCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </p>
              </div>
              <FiXCircle className="text-3xl text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalStock}
                </p>
              </div>
              <FiPackage className="text-3xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-indigo-600">
                  €{stats.totalValue.toFixed(2)}
                </p>
              </div>
              <FiAlertCircle className="text-3xl text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, código o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterActive("all")}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterActive("active")}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterActive("inactive")}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === "inactive"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay almacenes disponibles
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {warehouse.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {warehouse.name}
                      </div>
                      {warehouse.description && (
                        <div className="text-sm text-gray-500">
                          {warehouse.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {warehouse.city ? (
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <FiMapPin className="text-gray-400" />
                          <span>{warehouse.city}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {warehouse.contact_person ? (
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {warehouse.contact_person}
                          </div>
                          {warehouse.contact_phone && (
                            <div className="text-gray-500">
                              {warehouse.contact_phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {warehouse.products_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {warehouse.total_stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        €{((warehouse.stock_value_cents || 0) / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(warehouse)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          warehouse.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {warehouse.is_active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(warehouse)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Nuevo Punto de Stock</h2>

              <div className="space-y-4">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código * (ej: WH-MADRID, VM-VIGO-01)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.code ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="WH-CENTRAL"
                  />
                  {formErrors.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Almacén Central Madrid"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Tipo y Ubicación */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Punto *
                    </label>
                    <select
                      value={formData.warehouse_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warehouse_type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="physical_warehouse">
                        Almacén / Depósito
                      </option>
                      <option value="service_point">Punto de Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación (Opcional)
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
                    >
                      <option value="">Seleccionar ubicación...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city}, {loc.province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Capacidad Máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad Máxima (unidades)
                  </label>
                  <input
                    type="number"
                    value={formData.max_stock_capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_stock_capacity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="1000"
                    min="0"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Descripción del almacén"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Calle Principal 123"
                  />
                </div>

                {/* Dirección Específica (para máquinas, talleres) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Específica (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.specific_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific_address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Dentro del edificio A, planta 2"
                  />
                </div>

                {/* Ciudad y Código Postal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Madrid"
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
                      placeholder="28001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Calle Principal 123"
                  />
                </div>

                {/* Coordenadas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.latitude
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="40.4168"
                    />
                    {formErrors.latitude && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.longitude
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="-3.7038"
                    />
                    {formErrors.longitude && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_person: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_email: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.contact_email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="almacen@ejemplo.com"
                    />
                    {formErrors.contact_email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.contact_email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Almacén activo
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Almacén
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar (similar al de crear pero con lógica de edición) */}
      {showEditModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Editar Punto de Stock</h2>

              <div className="space-y-4">
                {/* Código (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código (no editable)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                {/* Resto de campos igual que crear */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>

                {/* Tipo y Ubicación */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Punto *
                    </label>
                    <select
                      value={formData.warehouse_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warehouse_type: e.target.value as WarehouseType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="physical_warehouse">
                        Almacén / Depósito
                      </option>
                      <option value="service_point">Punto de Servicio</option>
                    </select>
                  </div>

                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                </div>

                {/* Capacidad Máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad Máxima de Stock
                  </label>
                  <input
                    type="number"
                    value={formData.max_stock_capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_stock_capacity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                    min="0"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle Principal 123"
                  />
                </div>

                {/* Dirección Específica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Específica
                  </label>
                  <input
                    type="text"
                    value={formData.specific_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific_address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Dentro del edificio A, planta 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.latitude
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.latitude && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.longitude
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.longitude && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_person: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_email: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors.contact_email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.contact_email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.contact_email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Almacén activo
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el almacén{" "}
              <strong>{selectedWarehouse.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWarehouse(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
