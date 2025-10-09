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
  apiGetAllCustomers, 
  apiCreateCustomer, 
  apiUpdateCustomer, 
  apiDeleteCustomer 
} from "@/lib/api";

export default function CustomersPage() {
  const { isAdmin, token } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    customerType: "REGULAR"
  });

  useEffect(() => {
    if (isAdmin) {
      loadCustomers();
    }
  }, [isAdmin, token, currentPage]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiGetAllCustomers(token || undefined, currentPage, pageSize, searchTerm);
      setCustomers(data.customers || []);
      setError(null);
    } catch (err) {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setIsLoading(true);
    try {
      await apiCreateCustomer(formData, token || undefined);
      await loadCustomers();
      setShowCreateForm(false);
      setFormData({
        firstName: "", lastName: "", email: "", phone: "", 
        address: "", customerType: "REGULAR"
      });
      setError(null);
    } catch (err) {
      setError("Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    
    setIsLoading(true);
    try {
      await apiUpdateCustomer(editingCustomer.id, formData, token || undefined);
      await loadCustomers();
      setEditingCustomer(null);
      setFormData({
        firstName: "", lastName: "", email: "", phone: "", 
        address: "", customerType: "REGULAR"
      });
      setError(null);
    } catch (err) {
      setError("Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    setIsLoading(true);
    try {
      await apiDeleteCustomer(id, token || undefined);
      await loadCustomers();
      setError(null);
    } catch (err) {
      setError("Failed to delete customer");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      customerType: customer.customerType || "REGULAR"
    });
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
    setFormData({
      firstName: "", lastName: "", email: "", phone: "", 
      address: "", customerType: "REGULAR"
    });
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadCustomers();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-red-600 mb-4">You do not have permission to access customer management features.</p>
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
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage customer accounts and information</p>
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
              <Label htmlFor="search">Search Customers</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                variant="secondary"
              >
                Search
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
              >
                Add Customer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingCustomer) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingCustomer ? "Edit Customer" : "Create New Customer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
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
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>
              <div>
                <Label htmlFor="customerType">Customer Type</Label>
                <select
                  id="customerType"
                  value={formData.customerType}
                  onChange={(e) => setFormData({...formData, customerType: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="REGULAR">Regular</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (editingCustomer ? "Update Customer" : "Create Customer")}
              </Button>
              <Button 
                variant="secondary" 
                onClick={editingCustomer ? cancelEdit : () => setShowCreateForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH>Total Orders</TH>
                  <TH>Total Spent</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {customers.map((customer) => (
                  <TR key={customer.id}>
                    <TD>{customer.firstName} {customer.lastName}</TD>
                    <TD>{customer.email}</TD>
                    <TD>{customer.phone}</TD>
                    <TD>
                      <Badge>
                        {customer.customerType}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone={customer.status === "ACTIVE" ? "success" : "danger"}>
                        {customer.status}
                      </Badge>
                    </TD>
                    <TD>{customer.totalOrders || 0}</TD>
                    <TD>${customer.totalSpent?.toFixed(2) || "0.00"}</TD>
                    <TD>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => startEdit(customer)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDeleteCustomer(customer.id)}
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
          {customers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No customers found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {customers.filter(c => c.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Premium Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600">
              {customers.filter(c => c.customerType === "PREMIUM").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              ${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



