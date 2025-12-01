"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAt: string;
  inventory: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    featured: boolean;
    active: boolean;
    images: string[];
    variants: {
      id: string;
      name: string;
      sku: string;
      price: number;
      compareAt: number | null;
      inventory: number;
    }[];
  };
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images || []);

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: (v.price / 100).toFixed(2),
      compareAt: v.compareAt ? (v.compareAt / 100).toFixed(2) : "",
      inventory: v.inventory.toString(),
    })) || [
      {
        id: crypto.randomUUID(),
        name: "Single Pack",
        sku: "",
        price: "",
        compareAt: "",
        inventory: "100",
      },
    ]
  );

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value);
    if (!product) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }

  function addVariant() {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: "",
        sku: "",
        price: "",
        compareAt: "",
        inventory: "100",
      },
    ]);
  }

  function removeVariant(id: string) {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== id));
    }
  }

  function updateVariant(id: string, field: keyof Variant, value: string) {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate
      if (!name || !slug) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (variants.some((v) => !v.name || !v.price)) {
        toast.error("Please fill in all variant details");
        setIsSubmitting(false);
        return;
      }

      // Prepare data
      const productData = {
        name,
        slug,
        description,
        categoryId: categoryId || undefined,
        featured,
        active,
        images,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Math.round(parseFloat(v.price) * 100),
          compareAt: v.compareAt ? Math.round(parseFloat(v.compareAt) * 100) : null,
          inventory: parseInt(v.inventory) || 0,
        })),
      };

      // Import and call server actions
      const { createProduct, updateProduct } = await import("@/lib/actions/products");

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {product ? "Update Product" : "Create Product"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ranch Dip Mix"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ranch-dip-mix"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description for product cards..."
                  rows={2}
                />
              </div>

            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={images}
                onChange={setImages}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variants & Pricing</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="rounded-lg border p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Variant {index + 1}
                    </span>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(variant.id, "name", e.target.value)
                        }
                        placeholder="Single Pack"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, "sku", e.target.value)
                        }
                        placeholder="RANCH-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(variant.id, "price", e.target.value)
                        }
                        placeholder="8.99"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Compare at ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.compareAt}
                        onChange={(e) =>
                          updateVariant(variant.id, "compareAt", e.target.value)
                        }
                        placeholder="10.99"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-32 space-y-2">
                    <Label>Inventory</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.inventory}
                      onChange={(e) =>
                        updateVariant(variant.id, "inventory", e.target.value)
                      }
                      placeholder="100"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Product is visible in store
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}
