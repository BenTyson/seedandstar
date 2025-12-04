export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, AlertTriangle, Package, TrendingDown, Archive } from "lucide-react";
import { db } from "@/lib/db";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Fetch all variants with their products
  const variants = await db.productVariant.findMany({
    include: {
      product: true,
    },
    orderBy: [
      { inventory: "asc" },
      { product: { name: "asc" } },
    ],
  });

  // Transform to inventory display format
  const inventory = variants.map((v) => ({
    id: v.id,
    product: v.product.name,
    variant: v.name,
    sku: v.sku,
    stock: v.inventory,
    lowThreshold: v.lowStock,
  }));

  const totalItems = inventory.reduce((sum, i) => sum + i.stock, 0);
  const lowStock = inventory.filter((i) => i.stock > 0 && i.stock <= i.lowThreshold);
  const outOfStock = inventory.filter((i) => i.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Inventory</h1>
        <p className="mt-1 text-muted-foreground">Track and manage stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-retro-lavender" />
              <span className="text-2xl font-bold">{totalItems}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SKUs Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-retro-teal" />
              <span className="text-2xl font-bold">{inventory.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-retro-gold" />
              <span className="text-2xl font-bold text-retro-gold">{lowStock.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{outOfStock.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <Card className="border-retro-gold/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-retro-gold">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2">
                  <span><strong>{item.product}</strong> - {item.variant}</span>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              ))}
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md bg-retro-gold/10 px-3 py-2">
                  <span><strong>{item.product}</strong> - {item.variant}</span>
                  <Badge className="bg-retro-gold/20 text-retro-gold">Low: {item.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Inventory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by SKU or product..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>{item.variant}</TableCell>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell>
                    <span className={item.stock === 0 ? "text-destructive" : item.stock <= item.lowThreshold ? "text-retro-gold" : ""}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.stock === 0 ? (
                      <Badge variant="destructive">Out</Badge>
                    ) : item.stock <= item.lowThreshold ? (
                      <Badge className="bg-retro-gold/20 text-retro-gold">Low</Badge>
                    ) : (
                      <Badge className="bg-retro-sage/20 text-retro-sage">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input type="number" defaultValue={item.stock} className="h-8 w-20" min="0" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
