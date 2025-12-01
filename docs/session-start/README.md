# Seed and Star - Session Start Guide

Welcome! This guide helps you quickly understand the project and what to work on.

## Quick Links

- [Database Schema](../schema/database.md) - Full Prisma schema documentation
- [Storefront Guide](./storefront.md) - Customer-facing store components
- [Admin Guide](./admin.md) - Admin dashboard documentation

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Database**: PostgreSQL + Prisma ORM (Railway hosted)
- **Payments**: Stripe (+ Apple Pay / Google Pay)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: NextAuth.js v5 (Auth.js)
- **Images**: uploadthing (not yet configured)
- **Hosting**: Railway

## Project Structure

```
src/
├── app/
│   ├── (storefront)/     # Public shopping pages
│   ├── admin/            # Protected admin dashboard
│   └── api/              # API routes (webhooks, auth)
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── storefront/       # Store-specific components
│   └── admin/            # Admin-specific components
├── lib/
│   ├── db.ts             # Prisma client (with pg adapter)
│   ├── stripe.ts         # Stripe client
│   ├── shipping.ts       # Shipping config & helpers
│   ├── utils.ts          # General utilities
│   ├── cart-context.tsx  # Cart state (localStorage)
│   └── actions/          # Server Actions (products.ts, orders.ts)
└── prisma/
    ├── schema.prisma     # Database schema
    ├── prisma.config.ts  # Prisma 7 config (loads .env.local)
    └── seed.ts           # Database seeding script
```

## Design System

**Theme**: 70's Cosmic Retro - Dark gradient theme with rainbow accent palette

- **Primary**: Lavender (#a78bfa)
- **Secondary**: Navy (#1e3a5f)
- **Accents**: Teal, Sage, Gold, Orange, Rose
- **Background**: Gradient from warm charcoal (#1C1C1C) to purple-tinted dark (#1a1625)
- **Cards**: Elevated purple-tinted (#252328)
- **Text**: Cream (#faf6f0)

See `src/app/globals.css` for full color tokens.

**Hero Image**: `/public/images/cosmic70s.jpg` - parallax background on homepage

**Product Placeholders**: Gradient backgrounds using retro colors until product photography is added.

## Running Locally

```bash
# Must set DATABASE_URL for Prisma (public Railway URL for local dev)
DATABASE_URL="postgresql://postgres:jZhHxsDpetzfkSnLujBRbRsbfVHKbbwT@metro.proxy.rlwy.net:56710/railway" npm run dev
```

Dev server runs on port 4444.

**Database Commands:**
```bash
# Push schema changes
DATABASE_URL="..." npx prisma db push --config prisma/prisma.config.ts

# Generate client
DATABASE_URL="..." npm run db:generate

# Seed database
DATABASE_URL="..." npm run db:seed
```

## Current Status (Dec 1, 2024)

**COMPLETED:**
- ✅ Database connected (Railway PostgreSQL)
- ✅ All storefront pages connected to real data
- ✅ All admin pages connected to real data (including product edit)
- ✅ Stripe webhook implemented for order creation
- ✅ Theme: warm charcoal → purple gradient background
- ✅ Homepage parallax hero with cosmic70s.jpg
- ✅ Product placeholder gradients (retro colors)
- ✅ Server actions: products CRUD, orders management

**NEXT SESSION TODO:**
1. Set up Stripe test keys in `.env.local`:
   - `STRIPE_SECRET_KEY` (sk_test_...)
   - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
   - `STRIPE_WEBHOOK_SECRET` (whsec_...)
2. Test end-to-end checkout flow
3. Deploy to Railway
4. (Optional) Set up uploadthing for product images

**Admin Access:**
- URL: http://localhost:4444/admin
- Email: admin@seedandstar.com
- Password: admin123

**Seeded Data:**
- 4 categories (Classic Dips, Party Favorites, Spicy & Bold, Seasonal)
- 10 products with variants
- Discount codes: WELCOME10 (10% off), FREESHIP (free shipping $25+)

## Important Notes

**Prisma 7**: Uses `prisma.config.ts` instead of URL in schema. The config loads `.env.local` manually.

**Internal vs Public DB URL**:
- Local dev: Use public URL (`metro.proxy.rlwy.net:56710`)
- Railway deployment: Use internal URL (`postgres.railway.internal:5432`)

## Session Log Location

Document your work in: `docs/sessions/YYYY-MM-DD-topic.md`
