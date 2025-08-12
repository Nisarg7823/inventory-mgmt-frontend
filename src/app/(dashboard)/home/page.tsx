"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetInventory, apiGetProfile } from "@/lib/api";
import type { InventoryItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [me, items] = await Promise.all([
          apiGetProfile(token ?? undefined).catch(() => null),
          apiGetInventory(token ?? undefined).catch(() => [] as InventoryItem[]),
        ]);
        setProfile(me);
        setInventory(items || []);
      } catch (err) {
        setError("Some dashboard data failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const totalItems = inventory.length;
  const lowStockCount = useMemo(
    () => inventory.filter((it) => Boolean(it.lowStock)).length,
    [inventory]
  );
  const topLowStock = useMemo(
    () => inventory.filter((it) => it.lowStock).slice(0, 5),
    [inventory]
  );
  const displayName = useMemo(() => {
    if (!profile) return "";
    return (
      (profile.name as string) ||
      (profile.username as string) ||
      (profile.email as string) ||
      ""
    );
  }, [profile]);

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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {displayName ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">Welcome back{", " + displayName}.</p>
        ) : null}
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Low stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <p className="text-3xl font-semibold">{lowStockCount}</p>
            <Badge tone={lowStockCount > 0 ? "danger" : "success"}>
              {lowStockCount > 0 ? "Attention" : "All good"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href="/products">Products</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/orders">Orders</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/inventory">Inventory</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/users">Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            {topLowStock.length === 0 ? (
              <p className="text-sm text-[color:var(--muted-foreground)]">No low-stock items right now.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>SKU</TH>
                      <TH>Name</TH>
                      <TH>Stock</TH>
                      <TH>Reorder</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {topLowStock.map((it) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


