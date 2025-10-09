"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { 
  apiGetWarehouseOverview, 
  apiGetProductsByLocation 
} from "@/lib/api";

export default function WarehousePage() {
  const { isAdmin, token } = useAuth();
  const [warehouseOverview, setWarehouseOverview] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationProducts, setLocationProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadWarehouseOverview();
    }
  }, [isAdmin, token]);

  useEffect(() => {
    if (selectedLocation) {
      loadProductsByLocation(selectedLocation);
    }
  }, [selectedLocation, token]);

  const loadWarehouseOverview = async () => {
    setLoading(true);
    try {
      const data = await apiGetWarehouseOverview(token || undefined);
      setWarehouseOverview(data);
      setError(null);
    } catch (err) {
      setError("Failed to load warehouse overview");
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByLocation = async (location: string) => {
    setIsLoading(true);
    try {
      const data = await apiGetProductsByLocation(location, token || undefined);
      setLocationProducts(data.products || []);
      setError(null);
    } catch (err) {
      setError("Failed to load products for location");
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (product: any) => {
    if (product.stockQuantity === 0) return { status: "Out of Stock", tone: "danger" };
    if (product.stockQuantity <= (product.reorderLevel || 0)) return { status: "Low Stock", tone: "warning" };
    return { status: "In Stock", tone: "success" };
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-red-600 mb-4">You do not have permission to access warehouse management features.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Warehouse Management</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Monitor warehouse locations and inventory distribution</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Warehouse Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Warehouse Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-semibold">{warehouseOverview?.totalLocations || 0}</p>
              <p className="text-sm text-muted-foreground">Total Locations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{warehouseOverview?.totalProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                {warehouseOverview?.generatedAt ? new Date(warehouseOverview.generatedAt).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Last Updated</p>
            </div>
          </div>

          {warehouseOverview?.warehouseMetrics && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(warehouseOverview.warehouseMetrics).map(([location, metrics]: [string, any]) => (
                  <Card key={location} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedLocation(location)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{location}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Products:</span>
                          <span className="font-medium">{metrics.totalProducts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Out of Stock:</span>
                          <span className="font-medium text-red-600">{metrics.outOfStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Low Stock:</span>
                          <span className="font-medium text-yellow-600">{metrics.lowStock}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Products */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Products in {selectedLocation}</CardTitle>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedLocation(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Product Name</TH>
                      <TH>SKU</TH>
                      <TH>Stock Quantity</TH>
                      <TH>Reorder Level</TH>
                      <TH>Status</TH>
                      <TH>Price</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {locationProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <TR key={product.id}>
                          <TD>{product.name}</TD>
                          <TD className="font-mono text-sm">{product.sku}</TD>
                          <TD>{product.stockQuantity || 0}</TD>
                          <TD>{product.reorderLevel || "-"}</TD>
                          <TD>
                            <Badge tone={stockStatus.tone}>
                              {stockStatus.status}
                            </Badge>
                          </TD>
                          <TD>${product.price?.toFixed(2) || "0.00"}</TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
            )}
            {locationProducts.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground py-4">
                No products found in this location
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={loadWarehouseOverview}
              disabled={isLoading}
              variant="secondary"
            >
              Refresh Overview
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Export Location Report
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Optimize Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{warehouseOverview?.totalLocations || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{warehouseOverview?.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-red-600">
              {warehouseOverview?.warehouseMetrics ? 
                Object.values(warehouseOverview.warehouseMetrics).reduce((sum: number, metrics: any) => sum + (metrics.outOfStock || 0), 0) : 0
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-yellow-600">
              {warehouseOverview?.warehouseMetrics ? 
                Object.values(warehouseOverview.warehouseMetrics).reduce((sum: number, metrics: any) => sum + (metrics.lowStock || 0), 0) : 0
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



