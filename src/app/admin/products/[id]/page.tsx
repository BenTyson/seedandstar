import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct, getCategories } from "@/lib/actions/products";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  // Transform to form format
  const formProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    categoryId: product.categoryId || "",
    featured: product.featured,
    active: product.active,
    images: product.images,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      compareAt: v.compareAt,
      inventory: v.inventory,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Edit Product</h1>
        <p className="mt-1 text-muted-foreground">
          Update {product.name}
        </p>
      </div>

      <ProductForm product={formProduct} categories={categories} />
    </div>
  );
}
