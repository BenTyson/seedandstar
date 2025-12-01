"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { formatCents } from "@/lib/shipping";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAt: number | null;
  inventory: number;
}

interface ProductVariantSelectorProps {
  productId: string;
  productName: string;
  productSlug: string;
  variants: Variant[];
  image?: string;
}

export function ProductVariantSelector({
  productId,
  productName,
  productSlug,
  variants,
  image,
}: ProductVariantSelectorProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = selectedVariant.inventory === 0;
  const isOnSale =
    selectedVariant.compareAt && selectedVariant.compareAt > selectedVariant.price;

  function decrementQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function incrementQuantity() {
    if (quantity < selectedVariant.inventory) {
      setQuantity(quantity + 1);
    }
  }

  async function handleAddToCart() {
    setIsAdding(true);

    // Small delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem({
      id: selectedVariant.id,
      productId,
      productName,
      productSlug,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      image,
    });

    toast.success(`Added to cart`, {
      description: `${quantity}x ${productName} - ${selectedVariant.name}`,
    });

    setQuantity(1);
    setIsAdding(false);
  }

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {variants.length > 1 && (
        <div>
          <label className="mb-3 block text-sm font-medium">Select Size</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const variantOutOfStock = variant.inventory === 0;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  disabled={variantOutOfStock}
                  className={cn(
                    "relative rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                    variantOutOfStock && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="block">{variant.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatCents(variant.price)}
                  </span>
                  {isSelected && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-retro-lavender">
          {formatCents(selectedVariant.price)}
        </span>
        {isOnSale && selectedVariant.compareAt && (
          <span className="text-lg text-muted-foreground line-through">
            {formatCents(selectedVariant.compareAt)}
          </span>
        )}
        {isOnSale && selectedVariant.compareAt && (
          <span className="text-sm font-medium text-destructive">
            Save {formatCents(selectedVariant.compareAt - selectedVariant.price)}
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="mb-3 block text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={incrementQuantity}
              disabled={quantity >= selectedVariant.inventory}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {selectedVariant.inventory <= 10 && selectedVariant.inventory > 0 && (
            <span className="text-sm text-muted-foreground">
              Only {selectedVariant.inventory} left in stock
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full gap-2 text-lg"
        disabled={isOutOfStock || isAdding}
        onClick={handleAddToCart}
      >
        {isAdding ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </>
        )}
      </Button>

      {/* Total */}
      {!isOutOfStock && (
        <p className="text-center text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{formatCents(selectedVariant.price * quantity)}</span>
        </p>
      )}
    </div>
  );
}
