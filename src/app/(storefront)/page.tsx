import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/storefront/product-card";
import {
  ShoppingBag,
  Truck,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/actions/products";

const categoryColors: Record<string, string> = {
  "classic-dips": "bg-retro-teal",
  "party-favorites": "bg-retro-rose",
  "spicy-bold": "bg-retro-orange",
  "seasonal": "bg-retro-lavender",
};

const trustBadges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    icon: Shield,
    title: "Satisfaction Guaranteed",
    description: "Love it or your money back",
  },
  {
    icon: Star,
    title: "Premium Ingredients",
    description: "No artificial flavors",
  },
];

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section with Parallax */}
      <section className="relative min-h-[80vh] overflow-hidden flex items-center">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 bg-cover bg-fixed"
          style={{
            backgroundImage: "url('/images/cosmic70s.jpg')",
            backgroundPosition: "center bottom",
          }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />

        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center">
            <Badge
              variant="outline"
              className="mb-6 border-retro-lavender/50 bg-background/50 backdrop-blur-sm px-4 py-1"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              Handcrafted with love
            </Badge>

            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl drop-shadow-lg">
              Dip Into
              <span className="block text-retro-lavender">Something Delicious</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-foreground/90 md:text-xl drop-shadow-md">
              Premium dip mixes made with real ingredients. Just add sour cream,
              cream cheese, or Greek yogurt for instant party-ready dips.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 text-lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="h-5 w-5" />
                  Shop All Dips
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg bg-background/50 backdrop-blur-sm" asChild>
                <Link href="/products?category=party-favorites">
                  Party Favorites
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-foreground/80">
              Free shipping on orders over $50
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-center justify-center gap-4 text-center md:text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <badge.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Bestsellers
              </h2>
              <p className="mt-2 text-muted-foreground">
                Our most-loved dip mixes
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect dip for any occasion
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const color = categoryColors[category.slug] || "bg-retro-lavender";
              return (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                >
                  <Card className="group h-full overflow-hidden transition-all hover:border-primary/50">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div
                        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${color}/20`}
                      >
                        <ShoppingBag className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
                      </div>
                      <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <div className="retro-stripe h-1" />
            <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Ready to Dip?
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Join thousands of happy customers who have discovered the joy of
                homemade dips. Use code <span className="font-semibold text-foreground">WELCOME10</span> for
                10% off your first order.
              </p>
              <Button size="lg" className="mt-8 gap-2" asChild>
                <Link href="/products">
                  <ShoppingBag className="h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
