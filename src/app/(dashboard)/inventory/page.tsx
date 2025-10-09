"use client";

import { useEffect, useState } from "react";
import { apiGetInventory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  apiBulkUpdateInventory, 
  apiExportInventory, 
  apiImportInventory, 
  apiGetStockAlerts, 
  apiUpdateStockAlerts,
  // apiGenerateInventoryReport
} from "@/lib/api";

export default function InventoryPage() {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bulkUpdates, setBulkUpdates] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<string>("low-stock");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetInventory(token ?? undefined);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Could not load inventory. Check API config and token.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (isAdmin && token) {
      loadStockAlerts();
    }
  }, [isAdmin, token]);

  const loadStockAlerts = async () => {
    try {
      const alerts = await apiGetStockAlerts(token || undefined);
      setStockAlerts(alerts);
    } catch (err) {
      console.error("Failed to load stock alerts:", err);
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkUpdates.length === 0) return;
    
    setIsLoading(true);
    try {
      await apiBulkUpdateInventory(bulkUpdates, token || undefined);
      // Refresh inventory
      const data = await apiGetInventory(token || undefined);
      setItems(Array.isArray(data) ? data : []);
      setBulkUpdates([]);
      setError(null);
    } catch (err) {
      setError("Failed to bulk update inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const blob = await apiExportInventory(token || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setError(null);
    } catch (err) {
      setError("Failed to export inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      await apiImportInventory(selectedFile, token || undefined);
      // Refresh inventory
      const data = await apiGetInventory(token || undefined);
      setItems(Array.isArray(data) ? data : []);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      setError("Failed to import inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const filters = { reportType, dateRange: "last30days" };
      const blob = await apiGenerateInventoryReport(reportType, filters, token || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setError(null);
    } catch (err) {
      setError("Failed to generate inventory report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAlertUpdate = async () => {
    setIsLoading(true);
    try {
      await apiUpdateStockAlerts(stockAlerts, token || undefined);
      setError(null);
    } catch (err) {
      setError("Failed to update stock alerts");
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Monitor and manage inventory levels</p>
      </div>
      
      {error ? <p className="text-red-600 mb-4">{error}</p> : null}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Name</TH>
                  <TH>Stock</TH>
                  <TH>Reorder level</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((it: any) => (
                  <TR key={it.id}>
                    <TD>{it.sku}</TD>
                    <TD>{it.name}</TD>
                    <TD>{it.stockQuantity ?? "-"}</TD>
                    <TD>{it.reorderLevel ?? "-"}</TD>
                    <TD>
                      {it.lowStock ? (
                        <Badge tone="danger">Low</Badge>
                      ) : (
                        <Badge tone="success">OK</Badge>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bulkUpdates">Bulk Updates (JSON)</Label>
                  <Input
                    id="bulkUpdates"
                    placeholder='[{"id": "1", "stockQuantity": 100}]'
                    onChange={(e) => {
                      try {
                        const updates = JSON.parse(e.target.value);
                        setBulkUpdates(updates);
                      } catch {
                        setBulkUpdates([]);
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleBulkUpdate} 
                  disabled={isLoading || bulkUpdates.length === 0}
                  variant="secondary" 
                  className="w-full"
                >
                  {isLoading ? "Updating..." : "Bulk Update"}
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={isLoading}
                  variant="secondary" 
                  className="w-full"
                >
                  {isLoading ? "Exporting..." : "Export Data"}
                </Button>
                <div>
                  <Label htmlFor="fileImport">Import File</Label>
                  <Input
                    id="fileImport"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button 
                  onClick={handleImport} 
                  disabled={isLoading || !selectedFile}
                  variant="secondary" 
                  className="w-full"
                >
                  {isLoading ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Configure stock level alerts and notifications
                </p>
                {stockAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {stockAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={alert.threshold || ""}
                          onChange={(e) => {
                            const newAlerts = [...stockAlerts];
                            newAlerts[index].threshold = parseInt(e.target.value);
                            setStockAlerts(newAlerts);
                          }}
                          placeholder="Threshold"
                          className="w-20"
                        />
                        <span className="text-sm">{alert.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No alerts configured</p>
                )}
                <Button 
                  onClick={handleStockAlertUpdate} 
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? "Updating..." : "Update Alerts"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low-stock">Low Stock Report</option>
                    <option value="inventory-summary">Inventory Summary</option>
                    <option value="stock-movement">Stock Movement</option>
                    <option value="reorder-suggestions">Reorder Suggestions</option>
                  </select>
                </div>
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


