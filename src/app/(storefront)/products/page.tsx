import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveProducts, getCategories } from "@/lib/actions/products";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categoryFilter = params.category || "";
  const sortBy = params.sort || "featured";

  const [allProducts, dbCategories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);

  // Build categories list with "All Products" first
  const categories = [
    { name: "All Products", slug: "" },
    ...dbCategories.map(c => ({ name: c.name, slug: c.slug })),
  ];

  // Filter products by category
  let filteredProducts = categoryFilter
    ? allProducts.filter((p) => p.category?.slug === categoryFilter)
    : allProducts;

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price));
      case "price-desc":
        return Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price));
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const currentCategory = categories.find((c) => c.slug === categoryFilter);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {currentCategory?.name || "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductFilters
              categories={categories}
              currentCategory={categoryFilter}
              currentSort={sortBy}
            />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
