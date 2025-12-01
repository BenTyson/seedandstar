# Storefront Development Guide

## Status: Core Complete

All major storefront pages and components are built with placeholder data.

## Routes

```
(storefront)/
├── page.tsx              # Homepage (hero, featured, categories)
├── layout.tsx            # CartProvider wrapper
├── products/
│   ├── page.tsx          # Product listing with filters
│   └── [slug]/page.tsx   # Product detail with variants
└── checkout/
    ├── page.tsx          # Checkout form → Stripe
    └── success/page.tsx  # Order confirmation + confetti
```

## Components (`src/components/storefront/`)

| Component | Status | Description |
|-----------|--------|-------------|
| `navbar.tsx` | Done | Logo, nav links, cart button |
| `mobile-nav.tsx` | Done | Bottom sheet navigation |
| `footer.tsx` | Done | Links, newsletter signup |
| `product-card.tsx` | Done | Grid item with quick-add |
| `product-filters.tsx` | Done | Category/sort filters |
| `product-variant-selector.tsx` | Done | Size picker + add to cart |
| `cart-sheet.tsx` | Done | Slide-out cart drawer |

## Cart System (`src/lib/cart-context.tsx`)

- React Context + useReducer
- Persisted to localStorage
- Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART
- Auto-opens on add, tracks subtotal

## Checkout Flow

1. User fills contact + shipping info
2. Applies optional discount code (WELCOME10, FREESHIP)
3. Clicks "Proceed to Payment" → creates Stripe session
4. Redirects to Stripe Checkout
5. Webhook creates order in DB
6. Success page with confetti

## Key Files

- `src/lib/shipping.ts` - $5.99 flat rate, free over $50
- `src/lib/cart-context.tsx` - Cart state management
- `src/app/api/checkout/route.ts` - Creates Stripe session
- `src/app/api/webhooks/stripe/route.ts` - Handles payment events

## TODO

- Connect to real DB (currently placeholder data)
- Set up uploadthing for product images
- Add customer account pages (optional)
