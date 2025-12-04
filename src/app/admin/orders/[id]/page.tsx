export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  Mail,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  User,
  ShoppingBag,
} from "lucide-react";
import { formatCents } from "@/lib/shipping";
import { getOrder } from "@/lib/actions/orders";
import { OrderStatus } from "@prisma/client";
import { OrderStatusUpdate } from "./order-status-update";

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
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  // Parse shipping address from JSON
  const shippingAddress = order.shippingAddress as {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold font-mono">
              {order.orderNumber}
            </h1>
            <Badge variant="secondary" className={`${status.color} gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.variant.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant.name} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCents(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCents(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-retro-sage">
                    <span>Discount{order.discountCode ? ` (${order.discountCode.code})` : ""}</span>
                    <span>-{formatCents(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping === 0 ? <span className="text-retro-sage">Free</span> : formatCents(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCents(order.tax)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCents(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono">{order.trackingNumber}</p>
                {order.shippedAt && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shipped on {formatDate(order.shippedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.customer ? (
                <>
                  <p className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  {order.customer.phone && (
                    <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium">Guest Checkout</p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                </>
              )}
            </CardContent>
          </Card>

          {shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {shippingAddress.name && <p>{shippingAddress.name}</p>}
                {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                {(shippingAddress.city || shippingAddress.state || shippingAddress.postalCode) && (
                  <p>
                    {shippingAddress.city}{shippingAddress.city && shippingAddress.state ? ", " : ""}
                    {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                )}
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-retro-sage/20 text-retro-sage">
                  {order.status === "PENDING" ? "Awaiting Payment" : "Paid"}
                </Badge>
              </div>
              {order.stripePaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe Payment</span>
                  <span className="font-mono text-xs truncate max-w-[120px]">
                    {order.stripePaymentId.slice(-12)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
