/**
 * TopProducts Component
 * Displays top selling products
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  revenue: number;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay datos de productos disponibles
            </p>
          ) : (
            products.map((product, index) => (
              <div
                key={product.producto_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {product.producto_nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.cantidad} unidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
