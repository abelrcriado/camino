import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiArrowRight,
  FiBox,
  FiMapPin,
  FiFilter,
  FiRefreshCw,
  FiPlus,
} from "react-icons/fi";

// ==================== INTERFACES ====================
interface StockSummary {
  product_id: string;
  sku: string;
  product_name: string;
  warehouse_total: number;
  warehouse_available: number;
  warehouse_reserved: number;
  services_total: number;
  total_stock: number;
  warehouse_value_cents: number;
  services_value_cents: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

interface StockByLocation {
  location_type: "warehouse" | "service";
  location_id: string;
  location_name: string;
  location_code: string;
  service_point_id?: string;
  product_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  available_stock: number;
  reserved_stock: number;
  min_stock_alert: number;
  position?: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

interface Movement {
  id: string;
  movement_type: string;
  movement_date: string;
  sku: string;
  product_name: string;
  category_name: string;
  from_location: string;
  from_location_type: string;
  to_location: string;
  to_location_type: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reference_number?: string;
  movement_reason?: string;
  notes?: string;
  created_at: string;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function WarehouseInventoryPage() {
  const [activeTab, setActiveTab] = useState<
    | "summary"
    | "locations"
    | "movements"
    | "add-stock"
    | "transfer"
    | "low-stock"
  >("summary");

  // Estados para resumen
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Estados para ubicaciones
  const [locations, setLocations] = useState<StockByLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationFilter, setLocationFilter] = useState<
    "all" | "warehouse" | "service"
  >("all");

  // Estados para movimientos
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>("all");

  // Estados para añadir stock (nuevo)
  const [addStockType, setAddStockType] = useState<"purchase" | "adjustment">(
    "purchase"
  );
  const [purchaseForm, setPurchaseForm] = useState({
    warehouse_id: "",
    product_id: "",
    quantity: "",
    unit_cost: "",
    reference_number: "",
    notes: "",
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    warehouse_id: "",
    product_id: "",
    actual_quantity: "",
    reason: "",
    notes: "",
  });

  // Estados para transferencias
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [transferForm, setTransferForm] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    to_service_id: "",
    quantity: "",
    notes: "",
  });

  // Estados para stock bajo
  const [lowStock, setLowStock] = useState<StockByLocation[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (activeTab === "summary") {
      fetchSummary();
    } else if (activeTab === "locations") {
      fetchLocations();
    } else if (activeTab === "movements") {
      fetchMovements();
    } else if (activeTab === "add-stock") {
      fetchWarehouses();
      fetchProducts();
    } else if (activeTab === "transfer") {
      fetchWarehouses();
      fetchProducts();
      fetchServices();
    } else if (activeTab === "low-stock") {
      fetchLowStock();
    }
  }, [activeTab]);

  // ==================== API CALLS ====================
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await fetch("/api/warehouse-inventory/summary");
      const data = await response.json();
      if (data.success) {
        setSummary(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const params = new URLSearchParams();
      if (locationFilter !== "all") {
        params.append("location_type", locationFilter);
      }

      const response = await fetch(
        `/api/warehouse-inventory/locations?${params.toString()}`
      );
      const data = await response.json();
      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoadingMovements(true);
      const params = new URLSearchParams();
      if (movementTypeFilter !== "all") {
        params.append("movement_type", movementTypeFilter);
      }
      params.append("limit", "50");

      const response = await fetch(
        `/api/warehouse-inventory/movements?${params.toString()}`
      );
      const data = await response.json();
      if (data.success) {
        setMovements(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoadingMovements(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses?is_active=true");
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?with_details=true");
      const data = await response.json();
      if (data.success) {
        setServices(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchLowStock = async () => {
    try {
      setLoadingLowStock(true);
      const response = await fetch("/api/warehouse-inventory/low-stock");
      const data = await response.json();
      if (data.success) {
        setLowStock(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching low stock:", error);
    } finally {
      setLoadingLowStock(false);
    }
  };

  const handleTransfer = async () => {
    try {
      if (
        !transferForm.product_id ||
        !transferForm.from_warehouse_id ||
        !transferForm.quantity
      ) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      const payload: any = {
        product_id: transferForm.product_id,
        from_warehouse_id: transferForm.from_warehouse_id,
        quantity: parseInt(transferForm.quantity),
      };

      if (transferForm.to_warehouse_id) {
        payload.to_warehouse_id = transferForm.to_warehouse_id;
      }
      if (transferForm.to_service_id) {
        payload.to_service_id = transferForm.to_service_id;
      }
      if (transferForm.notes) {
        payload.notes = transferForm.notes;
      }

      const response = await fetch("/api/warehouse-inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("Transferencia realizada con éxito");
        setTransferForm({
          product_id: "",
          from_warehouse_id: "",
          to_warehouse_id: "",
          to_service_id: "",
          quantity: "",
          notes: "",
        });
        fetchSummary();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error transferring stock:", error);
      alert("Error al realizar transferencia");
    }
  };

  const handlePurchase = async () => {
    try {
      if (
        !purchaseForm.warehouse_id ||
        !purchaseForm.product_id ||
        !purchaseForm.quantity ||
        !purchaseForm.unit_cost
      ) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      const payload = {
        warehouse_id: purchaseForm.warehouse_id,
        product_id: purchaseForm.product_id,
        quantity: parseInt(purchaseForm.quantity),
        unit_cost: parseInt(purchaseForm.unit_cost),
        reference_number: purchaseForm.reference_number || undefined,
        notes: purchaseForm.notes || undefined,
      };

      const response = await fetch("/api/warehouse-inventory/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("Compra registrada con éxito");
        setPurchaseForm({
          warehouse_id: "",
          product_id: "",
          quantity: "",
          unit_cost: "",
          reference_number: "",
          notes: "",
        });
        fetchSummary();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error registering purchase:", error);
      alert("Error al registrar compra");
    }
  };

  const handleAdjustment = async () => {
    try {
      if (
        !adjustmentForm.warehouse_id ||
        !adjustmentForm.product_id ||
        !adjustmentForm.actual_quantity
      ) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      const payload = {
        warehouse_id: adjustmentForm.warehouse_id,
        product_id: adjustmentForm.product_id,
        actual_quantity: parseInt(adjustmentForm.actual_quantity),
        reason: adjustmentForm.reason || "manual_adjustment",
        notes: adjustmentForm.notes || undefined,
      };

      const response = await fetch("/api/warehouse-inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Ajuste realizado con éxito. ${data.message || ""}`);
        setAdjustmentForm({
          warehouse_id: "",
          product_id: "",
          actual_quantity: "",
          reason: "",
          notes: "",
        });
        fetchSummary();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Error al ajustar stock");
    }
  };

  // ==================== HELPERS ====================
  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            En Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Stock Bajo
          </span>
        );
      case "out_of_stock":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Sin Stock
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            -
          </span>
        );
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      purchase: "Compra",
      warehouse_to_point: "Almacén → Punto",
      point_to_service: "Punto → Servicio",
      service_sale: "Venta",
      service_to_point: "Servicio → Punto",
      point_to_warehouse: "Punto → Almacén",
      adjustment: "Ajuste",
      transfer: "Transferencia",
      return: "Devolución",
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Estadísticas del resumen
  const summaryStats = {
    totalProducts: summary.length,
    totalStock: summary.reduce((sum, item) => sum + item.total_stock, 0),
    totalValue:
      summary.reduce(
        (sum, item) =>
          sum + item.warehouse_value_cents + item.services_value_cents,
        0
      ) / 100,
    lowStockCount: summary.filter((item) => item.stock_status === "low_stock")
      .length,
    outOfStockCount: summary.filter(
      (item) => item.stock_status === "out_of_stock"
    ).length,
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema multinivel de control de stock
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("summary")}
              className={`${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiPackage />
              <span>Resumen Global</span>
            </button>

            <button
              onClick={() => setActiveTab("locations")}
              className={`${
                activeTab === "locations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiMapPin />
              <span>Por Ubicación</span>
            </button>

            <button
              onClick={() => setActiveTab("movements")}
              className={`${
                activeTab === "movements"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiRefreshCw />
              <span>Movimientos</span>
            </button>

            <button
              onClick={() => setActiveTab("add-stock")}
              className={`${
                activeTab === "add-stock"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiPlus />
              <span>Añadir Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("transfer")}
              className={`${
                activeTab === "transfer"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiArrowRight />
              <span>Transferir</span>
            </button>

            <button
              onClick={() => setActiveTab("low-stock")}
              className={`${
                activeTab === "low-stock"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FiAlertCircle />
              <span>Stock Bajo</span>
            </button>
          </nav>
        </div>

        {/* ==================== TAB: RESUMEN GLOBAL ==================== */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats.totalProducts}
                    </p>
                  </div>
                  <FiBox className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats.totalStock}
                    </p>
                  </div>
                  <FiPackage className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      €{summaryStats.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <FiTrendingUp className="text-3xl text-indigo-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {summaryStats.lowStockCount}
                    </p>
                  </div>
                  <FiAlertCircle className="text-3xl text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sin Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {summaryStats.outOfStockCount}
                    </p>
                  </div>
                  <FiTrendingDown className="text-3xl text-red-500" />
                </div>
              </div>
            </div>

            {/* Tabla resumen */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Stock Consolidado por Producto
                </h3>
                <button
                  onClick={fetchSummary}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiRefreshCw />
                  <span>Actualizar</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Almacén
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Disponible
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Reservado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Servicios
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingSummary ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Cargando...
                        </td>
                      </tr>
                    ) : summary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      summary.map((item) => (
                        <tr key={item.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.sku}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {item.warehouse_total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {item.warehouse_available}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-yellow-600">
                            {item.warehouse_reserved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                            {item.services_total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {item.total_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            €
                            {(
                              (item.warehouse_value_cents +
                                item.services_value_cents) /
                              100
                            ).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStockStatusBadge(item.stock_status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: POR UBICACIÓN ==================== */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <FiFilter className="text-gray-500" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setLocationFilter("all")}
                    className={`px-4 py-2 rounded-lg ${
                      locationFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setLocationFilter("warehouse")}
                    className={`px-4 py-2 rounded-lg ${
                      locationFilter === "warehouse"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Almacenes
                  </button>
                  <button
                    onClick={() => setLocationFilter("service")}
                    className={`px-4 py-2 rounded-lg ${
                      locationFilter === "service"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Servicios
                  </button>
                </div>
                <button
                  onClick={fetchLocations}
                  className="ml-auto flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiRefreshCw />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Disponible
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Alerta Min
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Posición
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingLocations ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Cargando...
                        </td>
                      </tr>
                    ) : locations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      locations.map((item, index) => (
                        <tr
                          key={`${item.location_id}-${item.product_id}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.location_type === "warehouse"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.location_type === "warehouse"
                                ? "Almacén"
                                : "Servicio"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.location_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.location_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.sku}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {item.available_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                            {item.min_stock_alert || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.position || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStockStatusBadge(item.stock_status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: MOVIMIENTOS ==================== */}
        {activeTab === "movements" && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <FiFilter className="text-gray-500" />
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="purchase">Compra</option>
                  <option value="warehouse_to_point">Almacén → Punto</option>
                  <option value="service_sale">Venta</option>
                  <option value="adjustment">Ajuste</option>
                  <option value="transfer">Transferencia</option>
                  <option value="return">Devolución</option>
                </select>
                <button
                  onClick={fetchMovements}
                  className="ml-auto flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiRefreshCw />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Origen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Destino
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Costo Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Referencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingMovements ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Cargando...
                        </td>
                      </tr>
                    ) : movements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay movimientos disponibles
                        </td>
                      </tr>
                    ) : (
                      movements.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.movement_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                              {getMovementTypeLabel(item.movement_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.sku}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.from_location || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.to_location || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            €{(item.total_cost / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.reference_number || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: AÑADIR STOCK ==================== */}
        {activeTab === "add-stock" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Selector de tipo */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex space-x-4">
                <button
                  onClick={() => setAddStockType("purchase")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                    addStockType === "purchase"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  📦 Compra a Proveedor
                </button>
                <button
                  onClick={() => setAddStockType("adjustment")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                    addStockType === "adjustment"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ⚙️ Ajuste Manual
                </button>
              </div>
            </div>

            {/* Formulario de Compra */}
            {addStockType === "purchase" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Registrar Compra a Proveedor
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ingresa productos al almacén desde una compra a proveedor
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Almacén Destino *
                    </label>
                    <select
                      value={purchaseForm.warehouse_id}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          warehouse_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar almacén</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto *
                    </label>
                    <select
                      value={purchaseForm.product_id}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          product_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        value={purchaseForm.quantity}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coste Unitario (céntimos) *
                      </label>
                      <input
                        type="number"
                        value={purchaseForm.unit_cost}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            unit_cost: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="250 (= €2.50)"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Referencia (Albarán/Pedido)
                    </label>
                    <input
                      type="text"
                      value={purchaseForm.reference_number}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          reference_number: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="PO-2025-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={purchaseForm.notes}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Información adicional sobre la compra"
                    />
                  </div>

                  <button
                    onClick={handlePurchase}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✅ Registrar Compra
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de Ajuste */}
            {addStockType === "adjustment" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Ajuste Manual de Inventario
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Corrige el stock físico tras un conteo o detectar
                  mermas/roturas
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Almacén *
                    </label>
                    <select
                      value={adjustmentForm.warehouse_id}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          warehouse_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar almacén</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto *
                    </label>
                    <select
                      value={adjustmentForm.product_id}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          product_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Real Contada *
                    </label>
                    <input
                      type="number"
                      value={adjustmentForm.actual_quantity}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          actual_quantity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Cantidad física real en almacén"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se ajustará el stock del sistema a esta cantidad
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo del Ajuste
                    </label>
                    <select
                      value={adjustmentForm.reason}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar motivo</option>
                      <option value="physical_count">Conteo físico</option>
                      <option value="damaged">Producto dañado</option>
                      <option value="expired">Producto caducado</option>
                      <option value="lost">Producto perdido</option>
                      <option value="found">Producto encontrado</option>
                      <option value="correction">Corrección de error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={adjustmentForm.notes}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Detalles sobre el ajuste realizado"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Atención:</strong> Este ajuste modificará
                      directamente el stock en el sistema. Asegúrate de que la
                      cantidad ingresada sea la correcta.
                    </p>
                  </div>

                  <button
                    onClick={handleAdjustment}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold"
                  >
                    ⚙️ Realizar Ajuste
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: TRANSFERIR STOCK ==================== */}
        {activeTab === "transfer" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Transferir Stock</h3>
              <p className="text-sm text-gray-600 mb-4">
                Mueve stock entre almacenes o desde almacén hacia servicios
                (máquinas/talleres)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    value={transferForm.product_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        product_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde Almacén *
                  </label>
                  <select
                    value={transferForm.from_warehouse_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        from_warehouse_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar almacén origen</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Selecciona UN destino:
                  </p>
                  <p className="text-xs text-blue-700">
                    • <strong>Hacia otro Almacén:</strong> Transferencia entre
                    almacenes centrales
                    <br />• <strong>Hacia Servicio:</strong> Abastecer máquina
                    vending o taller
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hacia Almacén (opcional)
                  </label>
                  <select
                    value={transferForm.to_warehouse_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        to_warehouse_id: e.target.value,
                        to_service_id: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!transferForm.to_service_id}
                  >
                    <option value="">Ninguno</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center text-gray-400">
                  <span>O</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hacia Servicio (opcional)
                  </label>
                  <select
                    value={transferForm.to_service_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        to_service_id: e.target.value,
                        to_warehouse_id: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!transferForm.to_warehouse_id}
                  >
                    <option value="">Ninguno</option>
                    {services.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.service_type_name}
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
                    value={transferForm.quantity}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={transferForm.notes}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Información adicional sobre la transferencia"
                  />
                </div>

                <button
                  onClick={handleTransfer}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  🚀 Realizar Transferencia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: STOCK BAJO ==================== */}
        {activeTab === "low-stock" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FiAlertCircle className="text-yellow-500" />
                  <span>Productos con Stock Bajo</span>
                </h3>
                <button
                  onClick={fetchLowStock}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiRefreshCw />
                  <span>Actualizar</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stock Actual
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Alerta Mínima
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingLowStock ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Cargando...
                        </td>
                      </tr>
                    ) : lowStock.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay productos con stock bajo
                        </td>
                      </tr>
                    ) : (
                      lowStock.map((item, index) => (
                        <tr
                          key={`${item.location_id}-${item.product_id}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.location_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.location_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.sku}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                            {item.min_stock_alert}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStockStatusBadge(item.stock_status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
