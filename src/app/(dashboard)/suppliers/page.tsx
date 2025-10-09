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
  apiGetAllSuppliers, 
  apiCreateSupplier, 
  apiUpdateSupplier, 
  apiDeleteSupplier 
} from "@/lib/api";

export default function SuppliersPage() {
  const { isAdmin, token } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    if (isAdmin) {
      loadSuppliers();
    }
  }, [isAdmin, token]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await apiGetAllSuppliers(token || undefined);
      setSuppliers(data.suppliers || []);
      setError(null);
    } catch (err) {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    setIsLoading(true);
    try {
      await apiCreateSupplier(formData, token || undefined);
      await loadSuppliers();
      setShowCreateForm(false);
      setFormData({
        name: "", contactPerson: "", email: "", phone: "", 
        address: "", status: "ACTIVE"
      });
      setError(null);
    } catch (err) {
      setError("Failed to create supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!editingSupplier) return;
    
    setIsLoading(true);
    try {
      await apiUpdateSupplier(editingSupplier.id, formData, token || undefined);
      await loadSuppliers();
      setEditingSupplier(null);
      setFormData({
        name: "", contactPerson: "", email: "", phone: "", 
        address: "", status: "ACTIVE"
      });
      setError(null);
    } catch (err) {
      setError("Failed to update supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    
    setIsLoading(true);
    try {
      await apiDeleteSupplier(id, token || undefined);
      await loadSuppliers();
      setError(null);
    } catch (err) {
      setError("Failed to delete supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      status: supplier.status || "ACTIVE"
    });
  };

  const cancelEdit = () => {
    setEditingSupplier(null);
    setFormData({
      name: "", contactPerson: "", email: "", phone: "", 
      address: "", status: "ACTIVE"
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-red-600 mb-4">You do not have permission to access supplier management features.</p>
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
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage supplier relationships and information</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={isLoading}
          >
            Add Supplier
          </Button>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingSupplier) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingSupplier ? "Edit Supplier" : "Create New Supplier"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1-555-0123"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Company address"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (editingSupplier ? "Update Supplier" : "Create Supplier")}
              </Button>
              <Button 
                variant="secondary" 
                onClick={editingSupplier ? cancelEdit : () => setShowCreateForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplier List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Company Name</TH>
                  <TH>Contact Person</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Status</TH>
                  <TH>Rating</TH>
                  <TH>Total Orders</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {suppliers.map((supplier) => (
                  <TR key={supplier.id}>
                    <TD>{supplier.name}</TD>
                    <TD>{supplier.contactPerson}</TD>
                    <TD>{supplier.email}</TD>
                    <TD>{supplier.phone}</TD>
                    <TD>
                      <Badge tone={supplier.status === "ACTIVE" ? "success" : "danger"}>
                        {supplier.status}
                      </Badge>
                    </TD>
                    <TD>
                      {supplier.rating ? (
                        <div className="flex items-center gap-1">
                          <span>{supplier.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TD>
                    <TD>{supplier.totalOrders || 0}</TD>
                    <TD>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => startEdit(supplier)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          {suppliers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No suppliers found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supplier Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{suppliers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {suppliers.filter(s => s.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600">
              {suppliers.filter(s => s.rating).length > 0 
                ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.filter(s => s.rating).length).toFixed(1)
                : "N/A"
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {suppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



