"use client";

import React, { useEffect, useState } from "react";
import { apiGetUserByUsername, UserDetails, apiGetInventory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import dynamic from "next/dynamic";

// Use any type to avoid complex typing conflicts with recharts
const PieChart = dynamic(() => import("recharts").then(mod => ({ default: mod.PieChart as any })), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => ({ default: mod.Pie as any })), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => ({ default: mod.Cell as any })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => ({ default: mod.Tooltip as any })), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => ({ default: mod.Legend as any })), { ssr: false });

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { token, isAdmin } = useAuth();
  const { username } = params;
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetUserByUsername(params.username, token ?? undefined);
        setUserData(data);
      } catch (err) {
        setError("Could not load User Details. Check API config and token.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const items = await apiGetInventory(token ?? undefined);
        // Example: Pie chart for in-stock vs low-stock
        const inStock = items.filter((it: any) => !it.lowStock).length;
        const lowStock = items.filter((it: any) => it.lowStock).length;
        setInventoryStats([
          { name: "In Stock", value: inStock },
          { name: "Low Stock", value: lowStock },
        ]);
      } catch {
        setInventoryStats([]);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 mb-4">{error}</p>;
  }

  if (!userData) {
    return <p>User not found or an error occurred.</p>;
  }

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Email</TH>
                  <TH>Username</TH>
                  <TH>First Name</TH>
                  <TH>Last Name</TH>
                  <TH>Address</TH>
                  <TH>Created At</TH>
                  <TH>Updated At</TH>
                </TR>
              </THead>
              <TBody>
                <TR key={username}>
                  <TD>{userData.email}</TD>
                  <TD>{userData.firstName}</TD>
                  <TD>{userData.lastName}</TD>
                  <TD>{userData.address}</TD>
                  <TD>{new Date(userData.createdAt).toLocaleString()}</TD>
                  <TD>{new Date(userData.updatedAt).toLocaleString()}</TD>
                </TR>
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryStats.length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={inventoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <p>No inventory data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {isAdmin && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This section is only visible to admins.</p>
              {/* Add more admin controls here */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


