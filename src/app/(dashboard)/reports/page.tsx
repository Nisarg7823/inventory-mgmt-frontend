"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
// import { 
//   apiGenerateInventoryReport, 
//   apiGenerateOrderReport, 
//   apiGenerateCustomerReport 
// } from "@/lib/api";

export default function ReportsPage() {
  const { isAdmin, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState({
    inventory: {
      reportType: "low-stock",
      dateRange: "last30days",
      includeOutOfStock: true
    },
    orders: {
      reportType: "summary",
      dateRange: "last30days",
      status: "all"
    },
    customers: {
      reportType: "summary",
      dateRange: "last30days",
      customerType: "all"
    }
  });

  const handleGenerateReport = async (reportType: 'inventory' | 'orders' | 'customers') => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let reportBlob: Blob;
      const filters = reportConfig[reportType];
      
      switch (reportType) {
        case 'inventory':
          reportBlob = await apiGenerateInventoryReport(filters.reportType, filters, token || undefined);
          break;
        case 'orders':
          reportBlob = await apiGenerateOrderReport(filters.reportType, filters, token || undefined);
          break;
        case 'customers':
          reportBlob = await apiGenerateCustomerReport(filters.reportType, filters, token || undefined);
          break;
        default:
          throw new Error("Invalid report type");
      }
      
      // Download the report
      const url = window.URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(`Failed to generate ${reportType} report`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportConfig = (reportType: string, field: string, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      [reportType]: {
        ...prev[reportType as keyof typeof prev],
        [field]: value
      }
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-red-600 mb-4">You do not have permission to access reporting features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Generate comprehensive reports for your inventory system</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Inventory Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="inventoryReportType">Report Type</Label>
              <select
                id="inventoryReportType"
                value={reportConfig.inventory.reportType}
                onChange={(e) => updateReportConfig('inventory', 'reportType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="low-stock">Low Stock Report</option>
                <option value="inventory-summary">Inventory Summary</option>
                <option value="stock-movement">Stock Movement</option>
                <option value="reorder-suggestions">Reorder Suggestions</option>
                <option value="value-analysis">Value Analysis</option>
              </select>
            </div>
            <div>
              <Label htmlFor="inventoryDateRange">Date Range</Label>
              <select
                id="inventoryDateRange"
                value={reportConfig.inventory.dateRange}
                onChange={(e) => updateReportConfig('inventory', 'dateRange', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportConfig.inventory.includeOutOfStock}
                  onChange={(e) => updateReportConfig('inventory', 'includeOutOfStock', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include Out of Stock</span>
              </label>
            </div>
          </div>
          <Button 
            onClick={() => handleGenerateReport('inventory')}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Generating..." : "Generate Inventory Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Order Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="orderReportType">Report Type</Label>
              <select
                id="orderReportType"
                value={reportConfig.orders.reportType}
                onChange={(e) => updateReportConfig('orders', 'reportType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="summary">Order Summary</option>
                <option value="by-status">By Status</option>
                <option value="by-customer">By Customer</option>
                <option value="revenue-analysis">Revenue Analysis</option>
                <option value="trends">Order Trends</option>
              </select>
            </div>
            <div>
              <Label htmlFor="orderDateRange">Date Range</Label>
              <select
                id="orderDateRange"
                value={reportConfig.orders.dateRange}
                onChange={(e) => updateReportConfig('orders', 'dateRange', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <Label htmlFor="orderStatus">Order Status</Label>
              <select
                id="orderStatus"
                value={reportConfig.orders.status}
                onChange={(e) => updateReportConfig('orders', 'status', e.target.value)}
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
          </div>
          <Button 
            onClick={() => handleGenerateReport('orders')}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Generating..." : "Generate Order Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Customer Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="customerReportType">Report Type</Label>
              <select
                id="customerReportType"
                value={reportConfig.customers.reportType}
                onChange={(e) => updateReportConfig('customers', 'reportType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="summary">Customer Summary</option>
                <option value="by-type">By Customer Type</option>
                <option value="top-customers">Top Customers</option>
                <option value="customer-activity">Customer Activity</option>
                <option value="loyalty-analysis">Loyalty Analysis</option>
              </select>
            </div>
            <div>
              <Label htmlFor="customerDateRange">Date Range</Label>
              <select
                id="customerDateRange"
                value={reportConfig.customers.dateRange}
                onChange={(e) => updateReportConfig('customers', 'dateRange', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <Label htmlFor="customerType">Customer Type</Label>
              <select
                id="customerType"
                value={reportConfig.customers.customerType}
                onChange={(e) => updateReportConfig('customers', 'customerType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Types</option>
                <option value="REGULAR">Regular</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={() => handleGenerateReport('customers')}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Generating..." : "Generate Customer Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Executive Summary</h3>
              <p className="text-sm text-muted-foreground mb-3">
                High-level overview of key metrics and performance indicators
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                disabled
              >
                Generate Template
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Monthly Review</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive monthly analysis of all business operations
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                disabled
              >
                Generate Template
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Inventory Alert</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Focused report on stock levels and reorder requirements
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                disabled
              >
                Generate Template
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Customer Insights</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed analysis of customer behavior and preferences
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                disabled
              >
                Generate Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary"
              disabled
            >
              Schedule Reports
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Export All Reports
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Configure Auto-Export
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Report History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



