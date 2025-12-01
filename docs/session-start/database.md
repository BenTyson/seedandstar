# Database Quick Reference

For full schema documentation, see [../schema/database.md](../schema/database.md).

## Quick Overview

### Core Models

| Model | Purpose |
|-------|---------|
| `Product` | Dip mix products |
| `ProductVariant` | Sizes/packs (Single, 3-Pack, Party Size) |
| `Category` | Product categories |
| `Order` | Customer orders |
| `OrderItem` | Line items in orders |
| `Customer` | Registered customers |
| `Cart` / `CartItem` | Shopping cart |
| `DiscountCode` | Promo codes |
| `AdminUser` | Admin dashboard users |

### Key Relationships

```
Category 1:N Product 1:N ProductVariant
Customer 1:N Order 1:N OrderItem
Customer 1:1 Cart 1:N CartItem
ProductVariant <-> CartItem
ProductVariant <-> OrderItem
```

### Money Handling

All monetary values stored as **integers in cents**:
- `price: 1299` = $12.99
- `total: 5499` = $54.99

### Order Statuses

```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
                    ↓
               CANCELLED / REFUNDED
```

## Common Queries

```typescript
// Get product with variants
const product = await db.product.findUnique({
  where: { slug: "ranch-dip" },
  include: { variants: true, category: true }
});

// Get orders for customer
const orders = await db.order.findMany({
  where: { customerId: "..." },
  include: { items: true },
  orderBy: { createdAt: "desc" }
});
```

## Related Docs

- [Full Schema Documentation](../schema/database.md)
