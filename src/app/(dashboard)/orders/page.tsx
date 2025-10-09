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
  apiGetAllOrders, 
  apiCreateOrder, 
  apiUpdateOrder 
} from "@/lib/api";

export default function OrdersPage() {
  const { isAdmin, token, username } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    items: [{ productId: "", quantity: 1 }]
  });

  useEffect(() => {
    loadOrders();
  }, [token]);

  useEffect(() => {
    if (username) {
      setFormData(prev => ({ ...prev, username }));
    }
  }, [username]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (!isAdmin) filters.username = username;
      
      const data = await apiGetAllOrders(token || undefined, filters);
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        ...formData,
        items: formData.items.filter(item => item.productId && item.quantity > 0)
      };
      
      if (orderData.items.length === 0) {
        setError("Order must contain at least one item");
        setIsLoading(false);
        return;
      }
      
      await apiCreateOrder(orderData, token || undefined);
      await loadOrders();
      setShowCreateForm(false);
      setFormData({
        username: username || "",
        items: [{ productId: "", quantity: 1 }]
      });
      setError(null);
    } catch (err) {
      setError("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    
    setIsLoading(true);
    try {
      await apiUpdateOrder(editingOrder.id, formData, token || undefined);
      await loadOrders();
      setEditingOrder(null);
      setFormData({
        username: username || "",
        items: [{ productId: "", quantity: 1 }]
      });
      setError(null);
    } catch (err) {
      setError("Failed to update order");
    } finally {
      setIsLoading(false);
    }
  };

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const startEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      username: order.username || "",
      items: order.items?.map((item: any) => ({
        productId: item.productId || "",
        quantity: item.quantity || 1
      })) || [{ productId: "", quantity: 1 }]
    });
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setFormData({
      username: username || "",
      items: [{ productId: "", quantity: 1 }]
    });
  };

  const filteredOrders = orders.filter(order =>
    order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Badge>Pending</Badge>;
      case "PROCESSING":
        return <Badge>Processing</Badge>;
      case "SHIPPED":
        return <Badge>Shipped</Badge>;
      case "DELIVERED":
        return <Badge tone="success">Delivered</Badge>;
      case "CANCELLED":
        return <Badge tone="danger">Cancelled</Badge>;
      default:
        return <Badge>{status || "Unknown"}</Badge>;
    }
  };

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
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage customer orders</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <Input
                id="search"
                placeholder="Search by username or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="statusFilter">Status Filter</Label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
              >
                Create Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingOrder) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingOrder ? "Edit Order" : "Create New Order"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Customer username"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Order Items</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary"
                    onClick={addOrderItem}
                  >
                    Add Item
                  </Button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Product ID"
                      value={item.productId}
                      onChange={(e) => updateOrderItem(index, "productId", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-24"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary"
                      onClick={() => removeOrderItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingOrder ? handleUpdateOrder : handleCreateOrder}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (editingOrder ? "Update Order" : "Create Order")}
              </Button>
              <Button 
                variant="secondary" 
                onClick={editingOrder ? cancelEdit : () => setShowCreateForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Order ID</TH>
                  <TH>Username</TH>
                  <TH>Status</TH>
                  <TH>Total Amount</TH>
                  <TH>Items</TH>
                  <TH>Created</TH>
                  {isAdmin && <TH>Actions</TH>}
                </TR>
              </THead>
              <TBody>
                {filteredOrders.map((order) => (
                  <TR key={order.id}>
                    <TD className="font-mono text-sm">{order.id?.slice(0, 8)}...</TD>
                    <TD>{order.username}</TD>
                    <TD>{getStatusBadge(order.status)}</TD>
                    <TD>${order.totalAmount?.toFixed(2) || "0.00"}</TD>
                    <TD>{order.items?.length || 0} items</TD>
                    <TD>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TD>
                    {isAdmin && (
                      <TD>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => startEdit(order)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          {filteredOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No orders found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-yellow-600">
              {orders.filter(o => o.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {orders.filter(o => o.status === "DELIVERED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              ${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


