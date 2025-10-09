"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  apiGetSystemSettings, 
  apiUpdateSystemSettings, 
  apiGetAnalytics, 
  apiCreateBackup, 
  apiGetAuditLogs,
  apiGetAllUsers,
  apiUpdateUserRole
} from "@/lib/api";

export default function AdminPage() {
  const { isAdmin, loading, token } = useAuth();
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [backupStatus, setBackupStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && token) {
      loadAdminData();
    }
  }, [isAdmin, token]);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settings, analyticsData, logs, usersData] = await Promise.all([
        apiGetSystemSettings(token || undefined).catch(() => null),
        apiGetAnalytics(token || undefined).catch(() => null),
        apiGetAuditLogs(token || undefined).catch(() => []),
        apiGetAllUsers(token || undefined).catch(() => [])
      ]);
      
      setSystemSettings(settings);
      setAnalytics(analyticsData);
      setAuditLogs(logs);
      setUsers(usersData);
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemSettingsUpdate = async () => {
    if (!systemSettings) return;
    
    setIsLoading(true);
    try {
      await apiUpdateSystemSettings(systemSettings, token || undefined);
      setError(null);
    } catch (err) {
      setError("Failed to update system settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    setBackupStatus("Creating backup...");
    try {
      const result = await apiCreateBackup(token || undefined);
      setBackupStatus(`Backup created successfully: ${result.backupId}`);
      setError(null);
    } catch (err) {
      setError("Failed to create backup");
      setBackupStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      await apiUpdateUserRole(userId, newRole, token || undefined);
      // Refresh users list
      const updatedUsers = await apiGetAllUsers(token || undefined);
      setUsers(updatedUsers);
      setError(null);
    } catch (err) {
      setError("Failed to update user role");
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

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-red-600 mb-4">You do not have permission to access this page.</p>
          <Button asChild>
            <Link href="/home">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage your inventory system</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
              Manage user accounts, roles, and permissions
            </p>
            <Button asChild>
              <Link href="/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
              Monitor and control inventory levels
            </p>
            <Button asChild>
              <Link href="/inventory">View Inventory</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={systemSettings?.maxUsers || ""}
                  onChange={(e) => setSystemSettings({...systemSettings, maxUsers: parseInt(e.target.value)})}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={systemSettings?.sessionTimeout || ""}
                  onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                  placeholder="30"
                />
              </div>
              <Button 
                onClick={handleSystemSettingsUpdate} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Updating..." : "Update Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Users:</span>
                  <Badge>{analytics.totalUsers || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Sessions:</span>
                  <Badge>{analytics.activeSessions || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">System Uptime:</span>
                  <Badge>{analytics.uptime || "N/A"}</Badge>
                </div>
                <Button 
                  onClick={loadAdminData} 
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">No analytics data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Create system backups for data safety
              </p>
              <Button 
                onClick={handleCreateBackup} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Backup"}
              </Button>
              {backupStatus && (
                <p className="text-sm text-green-600">{backupStatus}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Recent system activity
              </p>
              {auditLogs.length > 0 ? (
                <div className="max-h-32 overflow-y-auto">
                  {auditLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-muted-foreground">{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
              <Button 
                onClick={loadAdminData} 
                disabled={isLoading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                View All Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Username</TH>
                    <TH>Email</TH>
                    <TH>Role</TH>
                    <TH>Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {users.map((user) => (
                    <TR key={user.id}>
                      <TD>{user.username}</TD>
                      <TD>{user.email}</TD>
                      <TD>
                        <Badge>
                          {user.role}
                        </Badge>
                      </TD>
                      <TD>
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                          disabled={isLoading}
                        >
                          <option value="ROLE_USER">User</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
