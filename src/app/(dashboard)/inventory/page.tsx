"use client";

import { useEffect, useState } from "react";
import { apiGetInventory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function InventoryPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-4">Inventory</h1>
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
    </div>
  );
}


