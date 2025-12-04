export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Placeholder stats - will be replaced with real data
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-retro-gold",
    },
    {
      title: "Orders",
      value: "156",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-retro-teal",
    },
    {
      title: "Products",
      value: "24",
      change: "+2",
      icon: Package,
      color: "text-retro-lavender",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.4%",
      icon: TrendingUp,
      color: "text-retro-rose",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {session.user.name || "Admin"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-retro-sage">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            <p>Connect database to view recent orders</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:border-retro-lavender/50">
          <CardContent className="flex items-center gap-4 p-6">
            <Package className="h-8 w-8 text-retro-lavender" />
            <div>
              <h3 className="font-semibold">Add Product</h3>
              <p className="text-sm text-muted-foreground">Create a new dip mix</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:border-retro-teal/50">
          <CardContent className="flex items-center gap-4 p-6">
            <ShoppingCart className="h-8 w-8 text-retro-teal" />
            <div>
              <h3 className="font-semibold">Process Orders</h3>
              <p className="text-sm text-muted-foreground">Manage pending orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:border-retro-gold/50">
          <CardContent className="flex items-center gap-4 p-6">
            <TrendingUp className="h-8 w-8 text-retro-gold" />
            <div>
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Sales & performance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
