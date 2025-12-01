# Admin Dashboard Guide

## Status: Products & Orders Complete

Dashboard, products CRUD, and orders management built with placeholder data.

## Routes

```
admin/
├── login/page.tsx        # Login form (credentials)
├── page.tsx              # Dashboard (stats, quick actions)
├── layout.tsx            # Sidebar wrapper
├── products/
│   ├── page.tsx          # Product list + stats
│   ├── new/page.tsx      # Create product
│   └── [id]/page.tsx     # Edit product
├── orders/
│   ├── page.tsx          # Orders list + filters
│   └── [id]/page.tsx     # Order detail + status update
├── inventory/page.tsx    # Stock levels + alerts
├── discounts/page.tsx    # Promo codes CRUD
├── analytics/            # TODO
└── settings/             # TODO
```

## Authentication

- NextAuth.js v5 with credentials provider
- Admin-only (checks `AdminUser` model)
- JWT session strategy
- Protected in `layout.tsx`

**Default credentials**: admin@seedandstar.com / admin123

## Components (`src/components/admin/`)

| Component | Status | Description |
|-----------|--------|-------------|
| `sidebar.tsx` | Done | Nav with logo, links, logout |
| `product-form.tsx` | Done | Create/edit with variants |

## Implemented Features

### Dashboard (`/admin`)
- Stats cards: revenue, orders, products, conversion
- Recent orders placeholder
- Quick action cards linking to products/orders

### Products (`/admin/products`)
- List with search
- Stats: total, active, low stock, out of stock
- Actions: view, edit, duplicate, delete
- Form with variants, pricing, status toggles

### Orders (`/admin/orders`)
- List with status badges
- Filter by status dropdown
- Stats: total, awaiting, in fulfillment, revenue
- Detail page with items, totals, customer info
- Status update dropdown

### Inventory (`/admin/inventory`)
- Stats: total units, SKUs, low stock, out of stock
- Alert cards for low/out of stock items
- Editable stock levels table

### Discounts (`/admin/discounts`)
- Create dialog for new codes
- Types: percentage, fixed, free shipping
- Usage tracking, limits, expiration

## Server Actions (`src/lib/actions/`)

- `products.ts` - CRUD + toggle featured/active
- `orders.ts` - status updates, tracking, cancellation

## TODO

- Analytics with charts
- Settings page
- Connect to real DB (Railway PostgreSQL)
- Image upload (uploadthing)
