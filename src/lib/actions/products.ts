"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  featured: boolean;
  active: boolean;
  images: string[];
  variants: {
    id?: string;
    name: string;
    sku: string;
    price: number;
    compareAt: number | null;
    inventory: number;
  }[];
}

export async function getProducts() {
  return db.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: {
      featured: true,
      active: true,
    },
    include: {
      category: true,
      variants: true,
    },
    take: 4,
  });
}

export async function getActiveProducts() {
  return db.product.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
    },
  });
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createProduct(data: ProductInput) {
  const product = await db.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId || null,
      featured: data.featured,
      active: data.active,
      images: data.images,
      variants: {
        create: data.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          compareAt: v.compareAt,
          inventory: v.inventory,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, product };
}

export async function updateProduct(id: string, data: ProductInput) {
  // Delete existing variants and recreate
  await db.productVariant.deleteMany({ where: { productId: id } });

  const product = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId || null,
      featured: data.featured,
      active: data.active,
      images: data.images,
      variants: {
        create: data.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          compareAt: v.compareAt,
          inventory: v.inventory,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);

  return { success: true, product };
}

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true };
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await db.product.update({
    where: { id },
    data: { featured },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean) {
  await db.product.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true };
}

export async function updateInventory(variantId: string, inventory: number) {
  await db.productVariant.update({
    where: { id: variantId },
    data: { inventory },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");

  return { success: true };
}
