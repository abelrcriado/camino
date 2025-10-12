import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [filters, setFilters] = useState({
    category_id: "",
    subcategory_id: "",
    brand: "",
    is_active: "all",
    search: "",
  });

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    brand: "",
    model: "",
    base_cost: "",
    retail_price: "",
    vat_rate: "21",
    partner_commission_rate: "10",
    weight_grams: "",
    barcode: "",
    is_active: true,
    requires_refrigeration: false,
    expiration_months: "",
    supplier_name: "",
    tags: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    filters.category_id,
    filters.subcategory_id,
    filters.brand,
    filters.is_active,
  ]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/categories?is_active=true"),
        fetch("/api/products/brands"),
      ]);

      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      if (categoriesData.success) setCategories(categoriesData.data);
      if (brandsData.success) setBrands(brandsData.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ with_details: "true" });

      if (filters.category_id)
        params.append("category_id", filters.category_id);
      if (filters.subcategory_id)
        params.append("subcategory_id", filters.subcategory_id);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.is_active !== "all")
        params.append("is_active", filters.is_active);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/subcategories?category_id=${categoryId}&is_active=true`
      );
      const data = await response.json();

      if (data.success) {
        setSubcategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        base_cost: parseFloat(formData.base_cost),
        retail_price: parseFloat(formData.retail_price),
        vat_rate: parseFloat(formData.vat_rate),
        partner_commission_rate: parseFloat(formData.partner_commission_rate),
        weight_grams: formData.weight_grams
          ? parseInt(formData.weight_grams)
          : null,
        expiration_months: formData.expiration_months
          ? parseInt(formData.expiration_months)
          : null,
        subcategory_id: formData.subcategory_id || null,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : null,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchProducts();
        alert("Producto creado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error al crear el producto");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      const payload = {
        ...formData,
        base_cost: parseFloat(formData.base_cost),
        retail_price: parseFloat(formData.retail_price),
        vat_rate: parseFloat(formData.vat_rate),
        partner_commission_rate: parseFloat(formData.partner_commission_rate),
        weight_grams: formData.weight_grams
          ? parseInt(formData.weight_grams)
          : null,
        expiration_months: formData.expiration_months
          ? parseInt(formData.expiration_months)
          : null,
        subcategory_id: formData.subcategory_id || null,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : null,
      };

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
        alert("Producto actualizado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto");
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error toggling product:", error);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name || product.product_name,
      description: product.description || product.product_description || "",
      category_id: product.category_id,
      subcategory_id: product.subcategory_id || "",
      brand: product.brand || "",
      model: product.model || "",
      base_cost: product.base_cost?.toString() || "",
      retail_price: product.retail_price?.toString() || "",
      vat_rate: product.vat_rate?.toString() || "21",
      partner_commission_rate:
        product.partner_commission_rate?.toString() || "10",
      weight_grams: product.weight_grams?.toString() || "",
      barcode: product.barcode || "",
      is_active: product.is_active,
      requires_refrigeration: product.requires_refrigeration,
      expiration_months: product.expiration_months?.toString() || "",
      supplier_name: product.supplier_name || "",
      tags: product.tags ? product.tags.join(", ") : "",
    });

    if (product.category_id) {
      fetchSubcategories(product.category_id);
    }

    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      category_id: "",
      subcategory_id: "",
      brand: "",
      model: "",
      base_cost: "",
      retail_price: "",
      vat_rate: "21",
      partner_commission_rate: "10",
      weight_grams: "",
      barcode: "",
      is_active: true,
      requires_refrigeration: false,
      expiration_months: "",
      supplier_name: "",
      tags: "",
    });
    setSubcategories([]);
  };

  const calculateMargin = () => {
    const cost = parseFloat(formData.base_cost);
    const price = parseFloat(formData.retail_price);

    if (cost && price && cost > 0) {
      return (((price - cost) / cost) * 100).toFixed(2);
    }

    return "0.00";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona el catálogo de productos del sistema
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filters.category_id}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  category_id: e.target.value,
                  subcategory_id: "",
                });
                fetchSubcategories(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={filters.subcategory_id}
              onChange={(e) =>
                setFilters({ ...filters, subcategory_id: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!filters.category_id}
            >
              <option value="">Todas las subcategorías</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Producto
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Margen
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900">
                          {product.sku}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.product_name || product.name}
                        </div>
                        {product.brand && (
                          <div className="text-xs text-gray-500">
                            {product.model || ""}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category_name}
                        </div>
                        {product.subcategory_name && (
                          <div className="text-xs text-gray-500">
                            {product.subcategory_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.brand || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{product.base_cost?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{product.retail_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            product.profit_margin > 20
                              ? "text-green-600"
                              : product.profit_margin > 10
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.profit_margin?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {showAddModal ? "Nuevo Producto" : "Editar Producto"}
            </h2>
            <form onSubmit={showAddModal ? handleCreate : handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Información Básica */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Información Básica
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

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
                    Categoría *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        category_id: e.target.value,
                        subcategory_id: "",
                      });
                      fetchSubcategories(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategoría
                  </label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subcategory_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.category_id}
                  >
                    <option value="">Ninguna</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    list="brands-list"
                  />
                  <datalist id="brands-list">
                    {brands.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Precios */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-700">
                    Precios
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo Base *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_cost}
                    onChange={(e) =>
                      setFormData({ ...formData, base_cost: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Venta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.retail_price}
                    onChange={(e) =>
                      setFormData({ ...formData, retail_price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IVA (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vat_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, vat_rate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margen Calculado:{" "}
                    <span className="text-green-600 font-bold">
                      {calculateMargin()}%
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.partner_commission_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        partner_commission_rate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Comisión Partner (%)"
                  />
                </div>

                {/* Otros */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-700">
                    Información Adicional
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (gramos)
                  </label>
                  <input
                    type="number"
                    value={formData.weight_grams}
                    onChange={(e) =>
                      setFormData({ ...formData, weight_grams: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meses Caducidad
                  </label>
                  <input
                    type="number"
                    value={formData.expiration_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiration_months: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplier_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separados por comas)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ej: vegano, sin gluten, bio"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_refrigeration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requires_refrigeration: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Requiere Refrigeración
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedProduct(null);
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
                  {showAddModal ? "Crear" : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
