export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Eye,
  Printer,
  Mail,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  CreditCard,
} from "lucide-react";
import { formatCents } from "@/lib/shipping";
import { getOrders, getOrderStats } from "@/lib/actions/orders";
import { OrderStatus } from "@prisma/client";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-600", icon: Clock },
  PAID: { label: "Paid", color: "bg-blue-500/20 text-blue-600", icon: CreditCard },
  PROCESSING: { label: "Processing", color: "bg-purple-500/20 text-purple-600", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-teal-500/20 text-teal-600", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-500/20 text-green-600", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-600", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-gray-500/20 text-gray-600", icon: XCircle },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [dbOrders, stats] = await Promise.all([
    getOrders(),
    getOrderStats(),
  ]);

  // Transform orders for display
  const orders = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    customer: o.customer
      ? { name: `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() || "Guest", email: o.email }
      : { name: "Guest", email: o.email },
    status: o.status,
    total: o.total,
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: o.createdAt,
  }));

  const { total: totalOrders, pending: pendingOrders, processing: processingOrders, revenue: totalRevenue } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customer orders and fulfillment
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-retro-gold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-retro-lavender">{processingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-retro-sage">{formatCents(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="w-full pl-9 sm:w-64" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-medium hover:text-retro-lavender"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${status.color} gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.itemCount}</TableCell>
                      <TableCell className="font-medium">
                        {formatCents(order.total)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Package className="mr-2 h-4 w-4" />
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {orders.length === 0 && (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <p>No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
