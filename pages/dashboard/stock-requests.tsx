import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FiPlus,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";

type StockRequestStatus =
  | "pending"
  | "preparing"
  | "in_transit"
  | "delivered"
  | "consolidated"
  | "cancelled";
type StockRequestPriority = "low" | "normal" | "high" | "urgent";
type WarehouseType = "physical_warehouse" | "service_point";

interface StockRequest {
  id: string;
  request_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity: number;
  status: StockRequestStatus;
  priority: StockRequestPriority;
  reason?: string;
  notes?: string;
  prepared_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  consolidated_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Datos de las vistas
  from_warehouse_name?: string;
  from_warehouse_type?: WarehouseType;
  from_location_name?: string;
  to_warehouse_name?: string;
  to_warehouse_type?: WarehouseType;
  to_location_name?: string;
  product_name?: string;
  product_sku?: string;
  available_stock?: number;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouse_type?: WarehouseType;
  location_name?: string;
  is_active: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface CreateRequestForm {
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity: string;
  priority: StockRequestPriority;
  reason: string;
  notes: string;
}

interface Stats {
  pending: number;
  preparing: number;
  in_transit: number;
  delivered: number;
  consolidated: number;
  total: number;
}

const statusLabels: Record<StockRequestStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  in_transit: "En Tránsito",
  delivered: "Entregado",
  consolidated: "Consolidado",
  cancelled: "Cancelado",
};

const statusColors: Record<StockRequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  preparing: "bg-blue-100 text-blue-800 border-blue-300",
  in_transit: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  consolidated: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const priorityLabels: Record<StockRequestPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

const warehouseTypeLabels: Record<WarehouseType, string> = {
  physical_warehouse: "Almacén / Depósito",
  service_point: "Punto de Servicio",
};

export default function StockRequestsPage() {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    preparing: 0,
    in_transit: 0,
    delivered: 0,
    consolidated: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(
    null
  );
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Filtros
  const [filterStatus, setFilterStatus] = useState<StockRequestStatus | "all">(
    "all"
  );
  const [filterPriority, setFilterPriority] = useState<
    StockRequestPriority | "all"
  >("all");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario
  const [formData, setFormData] = useState<CreateRequestForm>({
    from_warehouse_id: "",
    to_warehouse_id: "",
    product_id: "",
    quantity: "",
    priority: "normal",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetchRequests(),
      fetchWarehouses(),
      fetchProducts(),
      fetchStats(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPriority !== "all") params.append("priority", filterPriority);
      if (filterWarehouse !== "all")
        params.append("warehouse_id", filterWarehouse);

      const response = await fetch(`/api/stock-requests?${params}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses?is_active=true");
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?is_active=true&limit=1000");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stock-requests/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterPriority, filterWarehouse]);

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/stock-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_warehouse_id: formData.from_warehouse_id,
          to_warehouse_id: formData.to_warehouse_id,
          product_id: formData.product_id,
          quantity: parseInt(formData.quantity),
          priority: formData.priority,
          reason: formData.reason || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        resetForm();
        setShowCreateModal(false);
        alert("✅ Pedido creado exitosamente");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating request:", error);
      alert("❌ Error al crear el pedido");
    }
  };

  const handlePrepare = async (id: string) => {
    if (!confirm("¿Marcar como preparando?")) return;

    try {
      const response = await fetch(`/api/stock-requests/${id}/prepare`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        alert("✅ Pedido marcado como preparando");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error preparing request:", error);
      alert("❌ Error al marcar como preparando");
    }
  };

  const handleShip = async (id: string) => {
    if (!confirm("¿Marcar como enviado?")) return;

    try {
      const response = await fetch(`/api/stock-requests/${id}/ship`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        alert("✅ Pedido enviado");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error shipping request:", error);
      alert("❌ Error al enviar el pedido");
    }
  };

  const handleDeliver = async (id: string) => {
    if (!confirm("¿Marcar como entregado?")) return;

    try {
      const response = await fetch(`/api/stock-requests/${id}/deliver`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        alert("✅ Pedido entregado");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error delivering request:", error);
      alert("❌ Error al marcar como entregado");
    }
  };

  const handleConsolidate = async (id: string) => {
    if (
      !confirm(
        "¿Consolidar stock? Esto actualizará el stock del almacén destino."
      )
    )
      return;

    try {
      const response = await fetch(`/api/stock-requests/${id}/consolidate`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        alert("✅ Stock consolidado exitosamente");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error consolidating request:", error);
      alert("❌ Error al consolidar");
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest || !cancellationReason.trim()) {
      alert("Debe proporcionar un motivo de cancelación");
      return;
    }

    try {
      const response = await fetch(
        `/api/stock-requests/${selectedRequest.id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancellationReason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await Promise.all([fetchRequests(), fetchStats()]);
        setCancellationReason("");
        setShowCancelModal(false);
        setSelectedRequest(null);
        alert("✅ Pedido cancelado");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("❌ Error al cancelar");
    }
  };

  const resetForm = () => {
    setFormData({
      from_warehouse_id: "",
      to_warehouse_id: "",
      product_id: "",
      quantity: "",
      priority: "normal",
      reason: "",
      notes: "",
    });
  };

  const openCancelModal = (request: StockRequest) => {
    setSelectedRequest(request);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const openTimelineModal = (request: StockRequest) => {
    setSelectedRequest(request);
    setShowTimelineModal(true);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.from_warehouse_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      req.to_warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getActionButton = (request: StockRequest) => {
    if (request.status === "cancelled" || request.status === "consolidated")
      return null;

    switch (request.status) {
      case "pending":
        return (
          <button
            onClick={() => handlePrepare(request.id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <FiPackage className="w-4 h-4" />
            Preparar
          </button>
        );
      case "preparing":
        return (
          <button
            onClick={() => handleShip(request.id)}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center gap-1"
          >
            <FiTruck className="w-4 h-4" />
            Enviar
          </button>
        );
      case "in_transit":
        return (
          <button
            onClick={() => handleDeliver(request.id)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
          >
            <FiCheckCircle className="w-4 h-4" />
            Entregar
          </button>
        );
      case "delivered":
        return (
          <button
            onClick={() => handleConsolidate(request.id)}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-1"
          >
            <FiCheckCircle className="w-4 h-4" />
            Consolidar
          </button>
        );
      default:
        return null;
    }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos de Stock</h1>
        <p className="text-gray-600 mt-1">Gestión de pedidos entre almacenes</p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-yellow-800">
                  {stats.pending}
                </p>
              </div>
              <FiClock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Preparando</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.preparing}
                </p>
              </div>
              <FiPackage className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  En Tránsito
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.in_transit}
                </p>
              </div>
              <FiTruck className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Entregados</p>
                <p className="text-2xl font-bold text-green-800">
                  {stats.delivered}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Consolidados
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.consolidated}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {stats.total}
                </p>
              </div>
              <FiPackage className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número, almacén, producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as StockRequestStatus | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="preparing">Preparando</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregados</option>
              <option value="consolidated">Consolidados</option>
              <option value="cancelled">Cancelados</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(
                  e.target.value as StockRequestPriority | "all"
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>

            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los almacenes</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (
                  {w.warehouse_type
                    ? warehouseTypeLabels[w.warehouse_type]
                    : "Sin tipo"}
                  )
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
            >
              <FiPlus className="w-5 h-5" />
              Nuevo Pedido
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No se encontraron pedidos
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {request.request_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            statusColors[request.status]
                          }`}
                        >
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {priorityLabels[request.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {request.from_warehouse_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {request.from_warehouse_type &&
                              warehouseTypeLabels[request.from_warehouse_type]}
                            {request.from_location_name &&
                              ` · ${request.from_location_name}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {request.to_warehouse_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {request.to_warehouse_type &&
                              warehouseTypeLabels[request.to_warehouse_type]}
                            {request.to_location_name &&
                              ` · ${request.to_location_name}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {request.product_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            SKU: {request.product_sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {request.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openTimelineModal(request)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Ver timeline"
                          >
                            <FiClock className="w-4 h-4" />
                          </button>

                          {getActionButton(request)}

                          {request.status !== "cancelled" &&
                            request.status !== "consolidated" && (
                              <button
                                onClick={() => openCancelModal(request)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancelar"
                              >
                                <FiXCircle className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Nuevo Pedido de Stock
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Almacenes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Almacén Origen *
                  </label>
                  <select
                    value={formData.from_warehouse_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        from_warehouse_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (
                        {w.warehouse_type
                          ? warehouseTypeLabels[w.warehouse_type]
                          : "Sin tipo"}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Almacén Destino *
                  </label>
                  <select
                    value={formData.to_warehouse_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        to_warehouse_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (
                        {w.warehouse_type
                          ? warehouseTypeLabels[w.warehouse_type]
                          : "Sin tipo"}
                        )
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Producto y Cantidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as StockRequestPriority,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Reposición de stock en vending"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Timeline - {selectedRequest.request_number}
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Creado */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    {(selectedRequest.prepared_at ||
                      selectedRequest.shipped_at ||
                      selectedRequest.delivered_at ||
                      selectedRequest.consolidated_at ||
                      selectedRequest.cancelled_at) && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-medium text-gray-900">Creado</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                    {selectedRequest.reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Motivo: {selectedRequest.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preparado */}
                {selectedRequest.prepared_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiPackage className="w-4 h-4 text-blue-600" />
                      </div>
                      {(selectedRequest.shipped_at ||
                        selectedRequest.delivered_at ||
                        selectedRequest.consolidated_at ||
                        selectedRequest.cancelled_at) && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-gray-900">Preparado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedRequest.prepared_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Enviado */}
                {selectedRequest.shipped_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiTruck className="w-4 h-4 text-purple-600" />
                      </div>
                      {(selectedRequest.delivered_at ||
                        selectedRequest.consolidated_at ||
                        selectedRequest.cancelled_at) && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-gray-900">Enviado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedRequest.shipped_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Entregado */}
                {selectedRequest.delivered_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      {(selectedRequest.consolidated_at ||
                        selectedRequest.cancelled_at) && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-gray-900">Entregado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          selectedRequest.delivered_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Consolidado */}
                {selectedRequest.consolidated_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Consolidado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          selectedRequest.consolidated_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancelado */}
                {selectedRequest.cancelled_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <FiXCircle className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Cancelado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          selectedRequest.cancelled_at
                        ).toLocaleString()}
                      </p>
                      {selectedRequest.cancellation_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Motivo: {selectedRequest.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Notas:</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowTimelineModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Cancelar Pedido
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Está seguro de cancelar el pedido{" "}
                <strong>{selectedRequest.request_number}</strong>?
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de cancelación *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Explique el motivo de la cancelación..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedRequest(null);
                  setCancellationReason("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
