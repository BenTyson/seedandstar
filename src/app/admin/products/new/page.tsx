import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/actions/products";

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">New Product</h1>
        <p className="mt-1 text-muted-foreground">
          Create a new dip mix product
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
