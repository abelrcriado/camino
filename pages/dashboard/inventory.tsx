import { useState, useEffect } from "react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [filters, setFilters] = useState({
    service_id: "",
    stock_status: "all",
    search: "",
  });

  const [restockData, setRestockData] = useState({
    quantity: "",
    restock_date: new Date().toISOString().split("T")[0],
  });

  const [priceData, setPriceData] = useState({
    custom_price: "",
    reason: "",
  });

  useEffect(() => {
    fetchServices();
    fetchInventory();
  }, [filters.service_id, filters.stock_status]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?is_active=true");
      const data = await response.json();

      if (data.success) {
        setServices(data.data.filter((s: any) => s.requires_inventory));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Simulated - would need to create the actual inventory API endpoint
      // For now, we'll simulate the data structure based on v_service_inventory view

      const mockInventory = [
        {
          id: "1",
          service_id: "service-1",
          service_name: "Máquina Expendedora Principal",
          product_id: "prod-1",
          product_name: "Coca-Cola 330ml",
          sku: "BEB-001",
          category_name: "Bebidas",
          current_stock: 5,
          min_stock_alert: 10,
          max_stock: 50,
          channel_position: "A1",
          selling_price: 1.5,
          base_cost: 0.8,
          is_available: true,
          last_restock_date: "2025-10-05",
        },
        {
          id: "2",
          service_id: "service-1",
          product_id: "prod-2",
          product_name: "Agua Mineral 500ml",
          sku: "BEB-002",
          category_name: "Bebidas",
          current_stock: 0,
          min_stock_alert: 15,
          max_stock: 60,
          channel_position: "A2",
          selling_price: 1.0,
          base_cost: 0.4,
          is_available: false,
          last_restock_date: "2025-10-01",
        },
        {
          id: "3",
          service_id: "service-1",
          product_id: "prod-3",
          product_name: "Snickers",
          sku: "SNK-001",
          category_name: "Snacks",
          current_stock: 8,
          min_stock_alert: 10,
          max_stock: 40,
          channel_position: "B1",
          selling_price: 1.2,
          base_cost: 0.6,
          is_available: true,
          last_restock_date: "2025-10-06",
        },
      ];

      // Filter mock data
      let filtered = mockInventory;

      if (filters.service_id) {
        filtered = filtered.filter(
          (item) => item.service_id === filters.service_id
        );
      }

      if (filters.stock_status === "low_stock") {
        filtered = filtered.filter(
          (item) =>
            item.current_stock <= item.min_stock_alert && item.current_stock > 0
        );
      } else if (filters.stock_status === "out_of_stock") {
        filtered = filtered.filter((item) => item.current_stock === 0);
      }

      if (filters.search) {
        filtered = filtered.filter(
          (item) =>
            item.product_name
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            item.sku.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setInventory(filtered);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      // Simulated API call - would need actual endpoint
      alert(`Producto reabastecido: +${restockData.quantity} unidades`);
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockData({
        quantity: "",
        restock_date: new Date().toISOString().split("T")[0],
      });
      fetchInventory();
    } catch (error) {
      console.error("Error restocking:", error);
      alert("Error al reabastecer");
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      // Simulated API call
      alert(`Precio actualizado a €${priceData.custom_price}`);
      setShowPriceModal(false);
      setSelectedItem(null);
      setPriceData({ custom_price: "", reason: "" });
      fetchInventory();
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Error al actualizar precio");
    }
  };

  const openRestockModal = (item: any) => {
    setSelectedItem(item);
    setRestockData({
      quantity: (item.max_stock - item.current_stock).toString(),
      restock_date: new Date().toISOString().split("T")[0],
    });
    setShowRestockModal(true);
  };

  const openPriceModal = (item: any) => {
    setSelectedItem(item);
    setPriceData({
      custom_price: item.selling_price.toString(),
      reason: "",
    });
    setShowPriceModal(true);
  };

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) {
      return { color: "text-red-600", bg: "bg-red-50", label: "Sin Stock" };
    } else if (current <= min) {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        label: "Stock Bajo",
      };
    }
    return { color: "text-green-600", bg: "bg-green-50", label: "Stock OK" };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-2">
            Gestiona el stock de productos en los servicios
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && fetchInventory()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filters.service_id}
              onChange={(e) =>
                setFilters({ ...filters, service_id: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los servicios</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <select
              value={filters.stock_status}
              onChange={(e) =>
                setFilters({ ...filters, stock_status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>

            <button
              onClick={fetchInventory}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando inventario...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Último Restock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => {
                    const status = getStockStatus(
                      item.current_stock,
                      item.min_stock_alert
                    );

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.service_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.category_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono text-gray-900">
                            {item.sku}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                            {item.channel_position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className={`font-bold ${status.color}`}>
                              {item.current_stock} / {item.max_stock}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.min_stock_alert}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              €{item.selling_price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Costo: €{item.base_cost.toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.last_restock_date
                            ? new Date(
                                item.last_restock_date
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openRestockModal(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              title="Reabastecer"
                            >
                              📦 Restock
                            </button>
                            <button
                              onClick={() => openPriceModal(item)}
                              className="text-green-600 hover:text-green-900 font-medium"
                              title="Ajustar precio"
                            >
                              💰 Precio
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && inventory.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                No se encontraron items de inventario
              </p>
            </div>
          )}
        </div>

        {/* Stock Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {inventory.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {
                    inventory.filter(
                      (i) =>
                        i.current_stock <= i.min_stock_alert &&
                        i.current_stock > 0
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-3xl font-bold text-red-600">
                  {inventory.filter((i) => i.current_stock === 0).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">🚫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Reabastecer Producto</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Producto</p>
              <p className="font-medium text-gray-900">
                {selectedItem.product_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Stock actual: {selectedItem.current_stock} /{" "}
                {selectedItem.max_stock}
              </p>
            </div>

            <form onSubmit={handleRestock}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad a agregar *
                  </label>
                  <input
                    type="number"
                    value={restockData.quantity}
                    onChange={(e) =>
                      setRestockData({
                        ...restockData,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    max={selectedItem.max_stock - selectedItem.current_stock}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo recomendado:{" "}
                    {selectedItem.max_stock - selectedItem.current_stock}{" "}
                    unidades
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Reabastecimiento
                  </label>
                  <input
                    type="date"
                    value={restockData.restock_date}
                    onChange={(e) =>
                      setRestockData({
                        ...restockData,
                        restock_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirmar Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Adjustment Modal */}
      {showPriceModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Ajustar Precio</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Producto</p>
              <p className="font-medium text-gray-900">
                {selectedItem.product_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Precio actual: €{selectedItem.selling_price.toFixed(2)} | Costo:
                €{selectedItem.base_cost.toFixed(2)}
              </p>
            </div>

            <form onSubmit={handleUpdatePrice}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo Precio de Venta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceData.custom_price}
                    onChange={(e) =>
                      setPriceData({
                        ...priceData,
                        custom_price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min={selectedItem.base_cost}
                  />
                  {priceData.custom_price && (
                    <p className="text-xs text-gray-500 mt-1">
                      Margen:{" "}
                      {(
                        ((parseFloat(priceData.custom_price) -
                          selectedItem.base_cost) /
                          selectedItem.base_cost) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón del Cambio
                  </label>
                  <textarea
                    value={priceData.reason}
                    onChange={(e) =>
                      setPriceData({ ...priceData, reason: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ej: Promoción especial, ajuste de mercado..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Actualizar Precio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
