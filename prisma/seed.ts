import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "classic-dips" },
      update: {},
      create: {
        name: "Classic Dips",
        slug: "classic-dips",
        description: "Timeless favorites everyone loves",
      },
    }),
    prisma.category.upsert({
      where: { slug: "party-favorites" },
      update: {},
      create: {
        name: "Party Favorites",
        slug: "party-favorites",
        description: "Perfect for entertaining and gatherings",
      },
    }),
    prisma.category.upsert({
      where: { slug: "spicy-bold" },
      update: {},
      create: {
        name: "Spicy & Bold",
        slug: "spicy-bold",
        description: "For those who like a little heat",
      },
    }),
    prisma.category.upsert({
      where: { slug: "seasonal" },
      update: {},
      create: {
        name: "Seasonal",
        slug: "seasonal",
        description: "Limited edition seasonal flavors",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create products with variants
  const products = [
    {
      name: "Ranch Dip Mix",
      slug: "ranch-dip-mix",
      description:
        "Our signature creamy ranch dip mix with a perfect blend of herbs and spices. Mix with sour cream or Greek yogurt for a delicious party dip.",
      featured: true,
      categorySlug: "classic-dips",
      variants: [
        { name: "Single Pack", sku: "RANCH-1", price: 899, inventory: 100 },
        { name: "3-Pack", sku: "RANCH-3", price: 2399, inventory: 50 },
        { name: "Party Size (6-Pack)", sku: "RANCH-6", price: 4499, inventory: 25 },
      ],
    },
    {
      name: "Spinach Artichoke Dip Mix",
      slug: "spinach-artichoke-dip-mix",
      description:
        "Rich and savory spinach artichoke blend. Bake with cream cheese and parmesan for the ultimate warm dip experience.",
      featured: true,
      categorySlug: "party-favorites",
      variants: [
        { name: "Single Pack", sku: "SPINART-1", price: 999, inventory: 80 },
        { name: "3-Pack", sku: "SPINART-3", price: 2699, inventory: 40 },
        { name: "Party Size (6-Pack)", sku: "SPINART-6", price: 4999, inventory: 20 },
      ],
    },
    {
      name: "Fiesta Queso Dip Mix",
      slug: "fiesta-queso-dip-mix",
      description:
        "Spicy southwestern cheese dip blend with jalapeño, cumin, and a kick of cayenne. Perfect with tortilla chips!",
      featured: true,
      categorySlug: "spicy-bold",
      variants: [
        { name: "Single Pack", sku: "QUESO-1", price: 899, inventory: 90 },
        { name: "3-Pack", sku: "QUESO-3", price: 2399, inventory: 45 },
        { name: "Party Size (6-Pack)", sku: "QUESO-6", price: 4499, inventory: 22 },
      ],
    },
    {
      name: "French Onion Dip Mix",
      slug: "french-onion-dip-mix",
      description:
        "Classic caramelized onion flavor with a hint of beef bouillon. The perfect chip companion.",
      featured: false,
      categorySlug: "classic-dips",
      variants: [
        { name: "Single Pack", sku: "FONION-1", price: 799, inventory: 120 },
        { name: "3-Pack", sku: "FONION-3", price: 2099, inventory: 60 },
      ],
    },
    {
      name: "Buffalo Chicken Dip Mix",
      slug: "buffalo-chicken-dip-mix",
      description:
        "Tangy buffalo sauce flavor meets creamy dip perfection. Add shredded chicken for the ultimate game day snack.",
      featured: true,
      categorySlug: "spicy-bold",
      variants: [
        { name: "Single Pack", sku: "BUFFALO-1", price: 999, inventory: 75 },
        { name: "3-Pack", sku: "BUFFALO-3", price: 2699, inventory: 35 },
        { name: "Party Size (6-Pack)", sku: "BUFFALO-6", price: 4999, inventory: 18 },
      ],
    },
    {
      name: "Garden Veggie Dip Mix",
      slug: "garden-veggie-dip-mix",
      description:
        "Light and refreshing blend of dill, chives, and garden vegetables. Perfect with fresh veggies or crackers.",
      featured: false,
      categorySlug: "classic-dips",
      variants: [
        { name: "Single Pack", sku: "VEGGIE-1", price: 799, inventory: 110 },
        { name: "3-Pack", sku: "VEGGIE-3", price: 2099, inventory: 55 },
      ],
    },
    {
      name: "Bacon Cheddar Dip Mix",
      slug: "bacon-cheddar-dip-mix",
      description:
        "Smoky bacon meets sharp cheddar in this indulgent dip mix. A crowd-pleaser at any gathering.",
      featured: false,
      categorySlug: "party-favorites",
      variants: [
        { name: "Single Pack", sku: "BACON-1", price: 1099, inventory: 65 },
        { name: "3-Pack", sku: "BACON-3", price: 2999, inventory: 30 },
      ],
    },
    {
      name: "Jalapeño Popper Dip Mix",
      slug: "jalapeno-popper-dip-mix",
      description:
        "All the flavors of a jalapeño popper in dip form. Creamy, cheesy, and perfectly spicy.",
      featured: false,
      categorySlug: "spicy-bold",
      variants: [
        { name: "Single Pack", sku: "JALPOP-1", price: 999, inventory: 70 },
        { name: "3-Pack", sku: "JALPOP-3", price: 2699, inventory: 35 },
      ],
    },
    {
      name: "Everything Bagel Dip Mix",
      slug: "everything-bagel-dip-mix",
      description:
        "Inspired by your favorite breakfast. Sesame, poppy, garlic, and onion create a uniquely delicious dip.",
      featured: false,
      categorySlug: "party-favorites",
      variants: [
        { name: "Single Pack", sku: "EBAGEL-1", price: 899, inventory: 85 },
        { name: "3-Pack", sku: "EBAGEL-3", price: 2399, inventory: 42 },
      ],
    },
    {
      name: "Pumpkin Spice Dessert Dip Mix",
      slug: "pumpkin-spice-dessert-dip-mix",
      description:
        "Sweet autumn flavors in a creamy dessert dip. Mix with cream cheese and serve with apple slices or graham crackers.",
      featured: false,
      categorySlug: "seasonal",
      variants: [
        { name: "Single Pack", sku: "PUMPKIN-1", price: 999, inventory: 40 },
        { name: "3-Pack", sku: "PUMPKIN-3", price: 2699, inventory: 20 },
      ],
    },
  ];

  for (const product of products) {
    const category = categories.find((c) => c.slug === product.categorySlug);

    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        featured: product.featured,
        active: true,
        categoryId: category?.id,
        images: [],
      },
    });

    // Create variants
    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {},
        create: {
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          inventory: variant.inventory,
          lowStock: 10,
          productId: createdProduct.id,
        },
      });
    }
  }

  console.log(`Created ${products.length} products with variants`);

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@seedandstar.com" },
    update: {},
    create: {
      email: "admin@seedandstar.com",
      name: "Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Created admin user: admin@seedandstar.com / admin123");

  // Create some discount codes
  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      active: true,
    },
  });

  await prisma.discountCode.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0,
      minPurchase: 2500, // $25 minimum
      active: true,
    },
  });

  console.log("Created discount codes: WELCOME10, FREESHIP");

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
