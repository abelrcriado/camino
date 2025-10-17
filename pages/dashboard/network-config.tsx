import { useState, useEffect } from "react";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";
import {
  FiMapPin,
  FiPackage,
  FiTrendingUp,
  FiEdit2,
  FiPlus,
  FiDollarSign,
  FiPercent,
  FiCheck,
  FiX,
} from "react-icons/fi";

interface Location {
  location_id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
  location_active: boolean;
  service_points?: ServicePoint[];
  stock_points?: StockPoint[];
  active_service_points: number;
  active_stock_points: number;
}

interface ServicePoint {
  id: string;
  code: string;
  name: string;
  warehouse_type: string;
  is_active: boolean;
  general_margin: number;
  has_specific_margins: boolean;
  stock_points_count: number;
}

interface StockPoint {
  id: string;
  code: string;
  name: string;
  warehouse_type: string;
  max_stock_capacity?: number;
  is_active: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price_cents: number;
}

interface MarginConfig {
  service_point_id: string;
  general_margin_percentage: number;
  product_specific_margins: Record<string, number>;
}

export default function NetworkConfigurationPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServicePoint, setSelectedServicePoint] =
    useState<ServicePoint | null>(null);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showProductMarginsModal, setShowProductMarginsModal] = useState(false);

  const [generalMargin, setGeneralMargin] = useState("0");
  const [productMargins, setProductMargins] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    Promise.all([fetchNetworkConfiguration(), fetchProducts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchNetworkConfiguration = async () => {
    try {
      const response = await fetch("/api/network/configuration");
      const data = await response.json();

      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching network configuration:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?is_active=true&limit=1000");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const openMarginModal = async (servicePoint: ServicePoint) => {
    setSelectedServicePoint(servicePoint);
    setGeneralMargin(servicePoint.general_margin.toString());

    // Cargar márgenes específicos si existen
    try {
      const response = await fetch(`/api/margins/${servicePoint.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const margins: Record<string, string> = {};
        Object.entries(data.data.product_specific_margins || {}).forEach(
          ([productId, margin]) => {
            margins[productId] = (margin as number).toString();
          }
        );
        setProductMargins(margins);
      }
    } catch (error) {
      console.error("Error fetching margins:", error);
    }

    setShowMarginModal(true);
  };

  const handleSaveGeneralMargin = async () => {
    if (!selectedServicePoint) return;

    try {
      const response = await fetch(`/api/margins/${selectedServicePoint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general_margin_percentage: parseFloat(generalMargin),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchNetworkConfiguration();
        setShowMarginModal(false);
        alert("✅ Margen general actualizado");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving margin:", error);
      alert("❌ Error al guardar margen");
    }
  };

  const handleSaveProductMargins = async () => {
    if (!selectedServicePoint) return;

    const marginsToSave: Record<string, number> = {};
    Object.entries(productMargins).forEach(([productId, margin]) => {
      if (margin && parseFloat(margin) > 0) {
        marginsToSave[productId] = parseFloat(margin);
      }
    });

    try {
      const response = await fetch(
        `/api/margins/${selectedServicePoint.id}/products`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_specific_margins: marginsToSave,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchNetworkConfiguration();
        setShowProductMarginsModal(false);
        alert("✅ Márgenes por producto actualizados");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving product margins:", error);
      alert("❌ Error al guardar márgenes");
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando configuración de red...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Configuración de Red
        </h1>
        <p className="text-gray-600 mt-1">
          Gestiona ubicaciones, puntos de servicio, stock y márgenes
        </p>
      </div>

      <div className="space-y-6">
        {/* Estadísticas Globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Ubicaciones Activas
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {locations.length}
                </p>
              </div>
              <FiMapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Puntos de Servicio
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {locations.reduce(
                    (sum, loc) => sum + (loc.active_service_points || 0),
                    0
                  )}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Puntos de Stock
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {locations.reduce(
                    (sum, loc) => sum + (loc.active_stock_points || 0),
                    0
                  )}
                </p>
              </div>
              <FiPackage className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ubicaciones */}
        <div className="space-y-4">
          {locations.map((location) => (
            <div
              key={location.location_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Header de Ubicación */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {location.city}, {location.province}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.postal_code && `${location.postal_code} · `}
                        {location.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500">Servicios</p>
                      <p className="text-lg font-bold text-green-600">
                        {location.active_service_points}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Stock</p>
                      <p className="text-lg font-bold text-purple-600">
                        {location.active_stock_points}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Puntos de Servicio */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Puntos de Servicio
                    </h4>
                    {location.service_points &&
                    location.service_points.length > 0 ? (
                      <div className="space-y-2">
                        {location.service_points.map((sp) => (
                          <div
                            key={sp.id}
                            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {sp.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {sp.code}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                    <FiPercent className="w-3 h-3" />
                                    Margen: {sp.general_margin}%
                                  </span>
                                  {sp.has_specific_margins && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                      <FiTrendingUp className="w-3 h-3" />
                                      Márgenes específicos
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openMarginModal(sp)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Configurar márgenes"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No hay puntos de servicio
                      </p>
                    )}
                  </div>

                  {/* Puntos de Stock */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiPackage className="w-4 h-4" />
                      Puntos de Stock
                    </h4>
                    {location.stock_points &&
                    location.stock_points.length > 0 ? (
                      <div className="space-y-2">
                        {location.stock_points.map((stock) => (
                          <div
                            key={stock.id}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <p className="font-medium text-gray-900">
                              {stock.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {stock.code}
                            </p>
                            {stock.max_stock_capacity && (
                              <p className="text-xs text-gray-600 mt-1">
                                Capacidad:{" "}
                                {stock.max_stock_capacity.toLocaleString()}{" "}
                                unidades
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No hay puntos de stock
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Configurar Margen General */}
      {showMarginModal && selectedServicePoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Configurar Márgenes
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedServicePoint.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Margen General */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margen General (%)
                </label>
                <input
                  type="number"
                  value={generalMargin}
                  onChange={(e) => setGeneralMargin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este margen se aplicará a todos los productos por defecto
                </p>
              </div>

              {/* Botón para configurar márgenes específicos */}
              <button
                onClick={() => {
                  setShowMarginModal(false);
                  setShowProductMarginsModal(true);
                }}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <FiTrendingUp className="w-4 h-4" />
                Configurar Márgenes por Producto
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMarginModal(false);
                  setSelectedServicePoint(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGeneralMargin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Margen General
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configurar Márgenes por Producto */}
      {showProductMarginsModal && selectedServicePoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">
                Márgenes Específicos por Producto
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedServicePoint.name} · Margen general: {generalMargin}%
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Los márgenes específicos sobrescriben el margen general. Deja en
                blanco para usar el margen general.
              </p>

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku} · Precio base:{" "}
                          {formatPrice(product.price_cents)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32">
                          <input
                            type="number"
                            value={productMargins[product.id] || ""}
                            onChange={(e) =>
                              setProductMargins({
                                ...productMargins,
                                [product.id]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={`${generalMargin}%`}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>

                        {productMargins[product.id] &&
                          parseFloat(productMargins[product.id]) > 0 && (
                            <div className="text-right min-w-[100px]">
                              <p className="text-sm font-medium text-green-600">
                                {formatPrice(
                                  product.price_cents +
                                    (product.price_cents *
                                      parseFloat(productMargins[product.id])) /
                                      100
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                Precio final
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowProductMarginsModal(false);
                  setShowMarginModal(true);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Volver
              </button>
              <button
                onClick={handleSaveProductMargins}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Márgenes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
