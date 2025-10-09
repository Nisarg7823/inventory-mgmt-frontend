"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { 
  apiGetAllProducts, 
  apiCreateProduct, 
  apiUpdateProduct, 
  apiDeleteProduct 
} from "@/lib/api";

export default function ProductsPage() {
  const { isAdmin, token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    stockQuantity: "",
    warehouseLocation: "",
    reorderLevel: ""
  });

  useEffect(() => {
    loadProducts();
  }, [token]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiGetAllProducts(token || undefined);
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    setIsLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0
      };
      
      await apiCreateProduct(productData, token || undefined);
      await loadProducts();
      setShowCreateForm(false);
      setFormData({
        name: "", sku: "", description: "", price: "", 
        stockQuantity: "", warehouseLocation: "", reorderLevel: ""
      });
      setError(null);
    } catch (err) {
      setError("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    setIsLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0
      };
      
      await apiUpdateProduct(editingProduct.id, productData, token || undefined);
      await loadProducts();
      setEditingProduct(null);
      setFormData({
        name: "", sku: "", description: "", price: "", 
        stockQuantity: "", warehouseLocation: "", reorderLevel: ""
      });
      setError(null);
    } catch (err) {
      setError("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setIsLoading(true);
    try {
      await apiDeleteProduct(id, token || undefined);
      await loadProducts();
      setError(null);
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      warehouseLocation: product.warehouseLocation || "",
      reorderLevel: product.reorderLevel?.toString() || ""
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "", sku: "", description: "", price: "", 
      stockQuantity: "", warehouseLocation: "", reorderLevel: ""
    });
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage your product catalog</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <Input
                id="search"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdmin && (
              <div className="flex items-end">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  disabled={isLoading}
                >
                  Add Product
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProduct) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="Stock keeping unit"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="warehouseLocation">Warehouse Location</Label>
                <Input
                  id="warehouseLocation"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({...formData, warehouseLocation: e.target.value})}
                  placeholder="A1-B2-C3"
                />
              </div>
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (editingProduct ? "Update Product" : "Create Product")}
              </Button>
              <Button 
                variant="secondary" 
                onClick={editingProduct ? cancelEdit : () => setShowCreateForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>SKU</TH>
                  <TH>Price</TH>
                  <TH>Stock</TH>
                  <TH>Location</TH>
                  <TH>Status</TH>
                  {isAdmin && <TH>Actions</TH>}
                </TR>
              </THead>
              <TBody>
                {filteredProducts.map((product) => (
                  <TR key={product.id}>
                    <TD>{product.name}</TD>
                    <TD>{product.sku}</TD>
                    <TD>${product.price?.toFixed(2) || "0.00"}</TD>
                    <TD>{product.stockQuantity || 0}</TD>
                    <TD>{product.warehouseLocation || "-"}</TD>
                    <TD>
                      {product.stockQuantity === 0 ? (
                        <Badge tone="danger">Out of Stock</Badge>
                      ) : product.stockQuantity <= (product.reorderLevel || 0) ? (
                        <Badge tone="warning">Low Stock</Badge>
                      ) : (
                        <Badge tone="success">In Stock</Badge>
                      )}
                    </TD>
                    {isAdmin && (
                      <TD>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => startEdit(product)}
                            disabled={isLoading}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isLoading}
                          >
                            Delete
                          </Button>
                        </div>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No products found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-red-600">
              {products.filter(p => p.stockQuantity === 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-yellow-600">
              {products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.reorderLevel || 0)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              ${products.reduce((sum, p) => sum + ((p.price || 0) * (p.stockQuantity || 0)), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


