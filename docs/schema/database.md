# Seed and Star Database Schema

## Overview

PostgreSQL database managed via Prisma ORM. All monetary values stored as integers in cents.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Category   │────<│   Product   │────<│ ProductVariant  │
└─────────────┘     └─────────────┘     └─────────────────┘
                           │                    │  │
                           │                    │  │
                    ┌──────┴──────┐            │  │
                    │  OrderItem  │<───────────┘  │
                    └──────┬──────┘               │
                           │                      │
                    ┌──────┴──────┐        ┌─────┴─────┐
                    │    Order    │        │  CartItem │
                    └──────┬──────┘        └─────┬─────┘
                           │                     │
                    ┌──────┴──────┐        ┌─────┴─────┐
                    │  Customer   │────────│   Cart    │
                    └──────┬──────┘        └───────────┘
                           │
                    ┌──────┴──────┐
                    │   Address   │
                    └─────────────┘
```

---

## Models

### Category

Groups products into browsable categories.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| name | String | Display name |
| slug | String | URL-safe identifier (unique) |
| description | String? | Optional description |
| image | String? | Category image URL |
| products | Product[] | Related products |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Product

Individual dip mix products.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| name | String | Product name |
| slug | String | URL-safe identifier (unique) |
| description | String? | Product description |
| images | String[] | Array of image URLs |
| featured | Boolean | Show on homepage (default: false) |
| active | Boolean | Available for purchase (default: true) |
| categoryId | String? | Foreign key to Category |
| variants | ProductVariant[] | Size/pack variants |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### ProductVariant

Size/quantity variants for products (Single Pack, 3-Pack, Party Size, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| name | String | Variant name (e.g., "3-Pack") |
| sku | String | Stock keeping unit (unique) |
| price | Int | Price in **cents** |
| compareAt | Int? | Original price for sale display |
| weight | Int? | Weight in grams (for shipping) |
| inventory | Int | Current stock count (default: 0) |
| lowStock | Int | Low stock alert threshold (default: 5) |
| productId | String | Foreign key to Product |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Example pricing:**
- `price: 899` = $8.99
- `compareAt: 1199` = Was $11.99

---

### Order

Customer orders with full purchase history.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| orderNumber | String | Human-readable (SS-10001) |
| status | OrderStatus | Current order status |
| email | String | Customer email |
| phone | String? | Customer phone |
| shippingAddress | Json | Shipping address object |
| billingAddress | Json? | Billing address (if different) |
| subtotal | Int | Subtotal in cents |
| shipping | Int | Shipping cost in cents |
| tax | Int | Tax amount in cents |
| discount | Int | Discount amount in cents |
| total | Int | Final total in cents |
| stripePaymentId | String? | Stripe Payment Intent ID |
| discountCodeId | String? | Applied discount code |
| customerId | String? | Registered customer (null for guests) |
| items | OrderItem[] | Line items |
| trackingNumber | String? | Shipping tracking |
| shippedAt | DateTime? | Ship date |
| deliveredAt | DateTime? | Delivery date |
| notes | String? | Internal admin notes |
| createdAt | DateTime | Order creation time |
| updatedAt | DateTime | Last update time |

**Order Status Flow:**
```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
                     ↓
                CANCELLED / REFUNDED
```

---

### OrderItem

Individual line items within an order.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| quantity | Int | Number of items |
| price | Int | Price at purchase time (cents) |
| orderId | String | Foreign key to Order |
| productId | String | Foreign key to Product |
| variantId | String | Foreign key to ProductVariant |
| productName | String | Snapshot of product name |
| variantName | String | Snapshot of variant name |

**Note:** productName and variantName are snapshots to preserve order history even if product is later modified/deleted.

---

### Customer

Registered customer accounts (optional - guest checkout supported).

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| email | String | Email address (unique) |
| firstName | String? | First name |
| lastName | String? | Last name |
| phone | String? | Phone number |
| stripeId | String? | Stripe Customer ID |
| orders | Order[] | Order history |
| addresses | Address[] | Saved addresses |
| cart | Cart? | Shopping cart |
| createdAt | DateTime | Registration time |
| updatedAt | DateTime | Last update time |

---

### Address

Saved customer addresses for faster checkout.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| name | String | Label ("Home", "Work") |
| firstName | String | First name |
| lastName | String | Last name |
| line1 | String | Street address |
| line2 | String? | Apt/Suite/etc. |
| city | String | City |
| state | String | State/Province |
| postalCode | String | ZIP/Postal code |
| country | String | Country (default: "US") |
| isDefault | Boolean | Default address flag |
| customerId | String | Foreign key to Customer |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |

---

### Cart

Shopping cart (one per customer or session).

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| customerId | String? | For logged-in customers |
| sessionId | String? | For guest carts |
| items | CartItem[] | Cart items |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |

**Note:** Either customerId OR sessionId will be set, not both.

---

### CartItem

Individual items in a cart.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| quantity | Int | Number of items |
| cartId | String | Foreign key to Cart |
| variantId | String | Foreign key to ProductVariant |

**Unique constraint:** `[cartId, variantId]` - one entry per variant per cart.

---

### DiscountCode

Promotional discount codes.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| code | String | Discount code (unique) |
| type | DiscountType | Type of discount |
| value | Int | Amount (% or cents) |
| minPurchase | Int? | Minimum order total |
| maxUses | Int? | Usage limit |
| usedCount | Int | Times used |
| active | Boolean | Currently active |
| startsAt | DateTime | Start date |
| expiresAt | DateTime? | Expiration date |
| orders | Order[] | Orders using this code |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |

**Discount Types:**
- `PERCENTAGE` - value is percentage (e.g., 20 = 20% off)
- `FIXED_AMOUNT` - value is cents (e.g., 1000 = $10 off)
- `FREE_SHIPPING` - value is ignored

---

### AdminUser

Admin dashboard users.

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| email | String | Email (unique) |
| name | String? | Display name |
| passwordHash | String | Hashed password |
| role | Role | Permission level |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |

**Roles:**
- `SUPER_ADMIN` - Full access, can manage other admins
- `ADMIN` - Standard admin access

---

## Enums

### OrderStatus
```
PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
```

### DiscountType
```
PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
```

### Role
```
SUPER_ADMIN | ADMIN
```

---

## Indexes

Prisma automatically creates indexes for:
- All `@id` fields
- All `@unique` fields
- All foreign key fields

Additional recommended indexes for production:
- `Order.createdAt` (for date range queries)
- `Order.status` (for filtering)
- `Product.featured` (for homepage query)
- `Product.active` (for storefront filtering)
