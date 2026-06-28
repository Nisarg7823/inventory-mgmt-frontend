"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { 
  apiGetAllNotifications, 
  apiGetLowStockNotifications, 
  apiGetOutOfStockNotifications 
} from "@/lib/api";

export default function NotificationsPage() {
  const { isAdmin, roleLoading, token } = useAuth();
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [lowStockNotifications, setLowStockNotifications] = useState<any[]>([]);
  const [outOfStockNotifications, setOutOfStockNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
    }
  }, [isAdmin, token]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [all, lowStock, outOfStock] = await Promise.all([
        apiGetAllNotifications(token || undefined).catch(() => ({ notifications: [] })),
        apiGetLowStockNotifications(token || undefined).catch(() => ({ notifications: [] })),
        apiGetOutOfStockNotifications(token || undefined).catch(() => ({ notifications: [] }))
      ]);
      
      setAllNotifications(all.notifications || []);
      setLowStockNotifications(lowStock.notifications || []);
      setOutOfStockNotifications(outOfStock.notifications || []);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return <Badge tone="danger">Critical</Badge>;
      case "HIGH":
        return <Badge tone="warning">High</Badge>;
      case "MEDIUM":
        return <Badge>Medium</Badge>;
      case "LOW":
        return <Badge tone="success">Low</Badge>;
      default:
        return <Badge>{severity || "Unknown"}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "LOW_STOCK":
        return "📉";
      case "OUT_OF_STOCK":
        return "🚨";
      case "SYSTEM_ALERT":
        return "⚠️";
      case "MAINTENANCE":
        return "🔧";
      default:
        return "📢";
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-red-600 mb-4">You do not have permission to access notification features.</p>
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
    if (roleLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-[color:var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  const getCurrentNotifications = () => {
    switch (activeTab) {
      case 'low-stock':
        return lowStockNotifications;
      case 'out-of-stock':
        return outOfStockNotifications;
      default:
        return allNotifications;
    }
  };

  const getCurrentCount = () => {
    switch (activeTab) {
      case 'low-stock':
        return lowStockNotifications.length;
      case 'out-of-stock':
        return outOfStockNotifications.length;
      default:
        return allNotifications.length;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Monitor system alerts and inventory notifications</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Notification Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'secondary'}
              onClick={() => setActiveTab('all')}
            >
              All Notifications ({allNotifications.length})
            </Button>
            <Button
              variant={activeTab === 'low-stock' ? 'default' : 'secondary'}
              onClick={() => setActiveTab('low-stock')}
            >
              Low Stock ({lowStockNotifications.length})
            </Button>
            <Button
              variant={activeTab === 'out-of-stock' ? 'default' : 'secondary'}
              onClick={() => setActiveTab('out-of-stock')}
            >
              Out of Stock ({outOfStockNotifications.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {activeTab === 'all' && 'All Notifications'}
              {activeTab === 'low-stock' && 'Low Stock Alerts'}
              {activeTab === 'out-of-stock' && 'Out of Stock Alerts'}
            </CardTitle>
            <Button 
              onClick={loadNotifications}
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {getCurrentNotifications().length > 0 ? (
            <div className="space-y-4">
              {getCurrentNotifications().map((notification, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{notification.message}</h3>
                        {getSeverityBadge(notification.severity)}
                      </div>
                      
                      {notification.productName && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Product:</strong> {notification.productName}
                        </div>
                      )}
                      
                      {notification.currentStock !== undefined && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Current Stock:</strong> {notification.currentStock}
                        </div>
                      )}
                      
                      {notification.reorderLevel && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Reorder Level:</strong> {notification.reorderLevel}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Unknown time'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {activeTab === 'all' && 'No notifications at this time'}
                {activeTab === 'low-stock' && 'No low stock alerts'}
                {activeTab === 'out-of-stock' && 'No out of stock alerts'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{allNotifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-yellow-600">
              {lowStockNotifications.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-red-600">
              {outOfStockNotifications.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-red-600">
              {allNotifications.filter(n => n.severity === 'CRITICAL').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={loadNotifications}
              disabled={isLoading}
              variant="secondary"
            >
              Refresh All
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Mark All as Read
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Export Notifications
            </Button>
            <Button 
              variant="secondary"
              disabled
            >
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



