"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles } from "lucide-react";
import { formatCents } from "@/lib/shipping";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

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
  // Simple hash of name to pick consistent gradient
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    images: string[];
    featured: boolean;
    variants: {
      id: string;
      name: string;
      price: number;
      compareAt?: number | null;
      inventory: number;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const primaryVariant = product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;
  const isOnSale = primaryVariant?.compareAt && primaryVariant.compareAt > primaryVariant.price;
  const isOutOfStock = product.variants.every((v) => v.inventory === 0);

  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const highestCompareAt = Math.max(
    ...product.variants.map((v) => v.compareAt || 0)
  );

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleVariants) {
      // Navigate to product page for variant selection
      window.location.href = `/products/${product.slug}`;
      return;
    }

    addItem({
      id: primaryVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: primaryVariant.name,
      price: primaryVariant.price,
      image: product.images[0],
    });

    toast.success("Added to cart", {
      description: `${product.name} - ${primaryVariant.name}`,
    });
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:border-primary/50">
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getProductGradient(product.name)}`}>
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-10 w-10 text-foreground/40" />
                <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  {product.name.split(" ")[0]}
                </span>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.featured && (
              <Badge className="bg-retro-lavender text-white">Featured</Badge>
            )}
            {isOnSale && (
              <Badge variant="destructive">Sale</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-retro-lavender">
            {hasMultipleVariants ? "From " : ""}
            {formatCents(lowestPrice)}
          </span>
          {isOnSale && highestCompareAt > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCents(highestCompareAt)}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <Button
          className="mt-3 w-full"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleQuickAdd}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isOutOfStock
            ? "Out of Stock"
            : hasMultipleVariants
              ? "Select Options"
              : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
