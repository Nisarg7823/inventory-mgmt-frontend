"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { useState, useEffect } from "react";
import { apiGetAllUsers, apiUpdateUserRole } from "@/lib/api";

export default function UsersPage() {
  const { isAdmin,roleLoading, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    console.log("useEffect triggered with isAdmin:", isAdmin, "and token:", token);
    if (isAdmin && token) {
      loadUsers();
    }
  }, [isAdmin, token]);

  const loadUsers = async () => {
    setLoading(true);
    console.log("Loading users with token:", token);
    try {
      const usersData = await apiGetAllUsers(token || undefined);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      await apiUpdateUserRole(userId, newRole, token || undefined);
      // Refresh users list
      await loadUsers();
      setError(null);
    } catch (err) {
      setError("Failed to update user role");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-[color:var(--muted-foreground)]">Manage user accounts and permissions</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {isAdmin ? (
        <>
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search Users</Label>
                  <Input
                    id="search"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="roleFilter">Filter by Role</Label>
                  <select
                    id="roleFilter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Roles</option>
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Username</TH>
                      <TH>Email</TH>
                      <TH>First Name</TH>
                      <TH>Last Name</TH>
                      <TH>Role</TH>
                      <TH>Status</TH>
                      <TH>Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filteredUsers.map((user) => (
                      <TR key={user.id}>
                        <TD>{user.username}</TD>
                        <TD>{user.email}</TD>
                        <TD>{user.firstName || "-"}</TD>
                        <TD>{user.lastName || "-"}</TD>
                        <TD>
                          <Badge>
                            {user.role}
                          </Badge>
                        </TD>
                        <TD>
                          <Badge tone={user.active ? "success" : "danger"}>
                            {user.active ? "Active" : "Inactive"}
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
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No users found matching your criteria
                </p>
              )}
            </CardContent>
          </Card>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {users.filter(u => u.role === "ROLE_ADMIN").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {users.filter(u => u.active).length}
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
                  onClick={loadUsers} 
                  disabled={isLoading}
                  variant="secondary"
                >
                  Refresh Users
                </Button>
                <Button 
                  variant="secondary"
                  disabled
                >
                  Export User List
                </Button>
                <Button 
                  variant="secondary"
                  disabled
                >
                  Bulk Role Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">You do not have permission to access user management features.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


