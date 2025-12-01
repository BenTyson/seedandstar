export const SHIPPING_CONFIG = {
  flatRate: 599, // $5.99 in cents
  freeThreshold: 5000, // Free shipping over $50
  freeShippingMessage: "Free shipping on orders over $50!",
} as const;

export function calculateShipping(subtotalCents: number): number {
  if (subtotalCents >= SHIPPING_CONFIG.freeThreshold) {
    return 0;
  }
  return SHIPPING_CONFIG.flatRate;
}

export function getAmountUntilFreeShipping(subtotalCents: number): number {
  if (subtotalCents >= SHIPPING_CONFIG.freeThreshold) {
    return 0;
  }
  return SHIPPING_CONFIG.freeThreshold - subtotalCents;
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
