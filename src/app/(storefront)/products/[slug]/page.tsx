export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductVariantSelector } from "@/components/storefront/product-variant-selector";
import { ProductCard } from "@/components/storefront/product-card";
import {
  ShoppingBag,
  Truck,
  Shield,
  Clock,
  ChevronLeft,
  Star,
  Sparkles,
} from "lucide-react";

// Generate consistent gradient based on product name
function getProductGradient(name: string): string {
  const gradients = [
    "from-retro-lavender/40 via-retro-rose/30 to-retro-orange/40",
    "from-retro-teal/40 via-retro-sage/30 to-retro-gold/40",
    "from-retro-rose/40 via-retro-lavender/30 to-retro-teal/40",
    "from-retro-orange/40 via-retro-gold/30 to-retro-sage/40",
    "from-retro-sage/40 via-retro-teal/30 to-retro-lavender/40",
    "from-retro-gold/40 via-retro-orange/30 to-retro-rose/40",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}
import { getProductBySlug, getActiveProducts } from "@/lib/actions/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products (other active products, excluding current)
  const allProducts = await getActiveProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const isOnSale = product.variants.some((v) => v.compareAt && v.compareAt > v.price);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
      </nav>

      {/* Product Section */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getProductGradient(product.name)}`}>
                <div className="flex flex-col items-center gap-3">
                  <Sparkles className="h-16 w-16 text-foreground/40" />
                  <span className="text-sm font-medium text-foreground/50 uppercase tracking-wider">
                    {product.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
              </div>
            )}
            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.featured && (
                <Badge className="bg-retro-lavender text-white">Featured</Badge>
              )}
              {isOnSale && <Badge variant="destructive">Sale</Badge>}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {product.description}
          </p>

          {/* Rating placeholder */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-retro-gold text-retro-gold"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.9 (128 reviews)
            </span>
          </div>

          <Separator className="my-6" />

          {/* Variant Selector & Add to Cart */}
          <ProductVariantSelector
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            variants={product.variants}
            image={product.images[0]}
          />

          {/* Trust badges */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-retro-teal" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-retro-sage" />
              <span>Satisfaction guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-5 w-5 text-retro-lavender" />
              <span>Ships within 24 hours</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Product Details Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {product.description && (
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="how-to-make">
              <AccordionTrigger>How to Make</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ol className="list-inside list-decimal space-y-2">
                  <li>Mix one packet with 1 cup sour cream or Greek yogurt</li>
                  <li>Refrigerate for at least 30 minutes to let flavors develop</li>
                  <li>Stir before serving</li>
                  <li>Keeps refrigerated for up to 1 week</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Free shipping on orders over $50</li>
                  <li>Standard shipping: 3-5 business days</li>
                  <li>Express shipping available at checkout</li>
                  <li>30-day satisfaction guarantee</li>
                  <li>Contact us for any issues with your order</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold">
          You Might Also Like
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
