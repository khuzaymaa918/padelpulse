"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Upload, Trash2 } from "lucide-react";

interface Props {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  product?: any;
}

interface Variant {
  id?: string;
  color: string;
  gripSize: string;
  sku: string;
  price: string;
  comparePrice: string;
  stock: string;
}

interface ImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  file?: File;
  preview?: string;
}

export default function ProductForm({ categories, brands, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    shape: product?.shape ?? "",
    level: product?.level ?? "",
    material: product?.material ?? "",
    weight: product?.weight ?? "",
    balance: product?.balance ?? "",
    core: product?.core ?? "",
  });

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.map((v: any) => ({
      id: v.id,
      color: v.color ?? "",
      gripSize: v.gripSize ?? "",
      sku: v.sku,
      price: v.price.toString(),
      comparePrice: v.comparePrice?.toString() ?? "",
      stock: v.stock.toString(),
    })) ?? [{ color: "", gripSize: "", sku: "", price: "", comparePrice: "", stock: "" }]
  );

  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
    })) ?? []
  );

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isEdit ? f.slug : generateSlug(name),
    }));
  };

  const addVariant = () => {
    setVariants((v) => [...v, { color: "", gripSize: "", sku: "", price: "", comparePrice: "", stock: "" }]);
  };

  const removeVariant = (i: number) => {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof Variant, value: string) => {
    setVariants((v) => v.map((variant, idx) => idx === i ? { ...variant, [field]: value } : variant));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { url: "", isPrimary: prev.length === 0, file, preview },
      ]);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "padelpulse");
    formData.append("folder", "padelpulse");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error("Cloudinary upload failed");
    return data.secure_url;
  };

  const removeImage = (i: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (i: number) => {
    setImages((prev) => prev.map((img, idx) => ({ ...img, isPrimary: idx === i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.categoryId || !form.brandId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (variants.some((v) => !v.sku || !v.price || !v.stock)) {
      toast.error("Please complete all variant fields");
      return;
    }

    setLoading(true);

    try {
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const url = await uploadToCloudinary(img.file);
            return { url, isPrimary: img.isPrimary };
          }
          return { id: img.id, url: img.url, isPrimary: img.isPrimary };
        })
      );

      const payload = {
        ...form,
        variants: variants.map((v) => ({
          ...v,
          price: parseInt(v.price),
          comparePrice: v.comparePrice ? parseInt(v.comparePrice) : null,
          stock: parseInt(v.stock),
        })),
        images: uploadedImages,
      };

      const res = await fetch(
        isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, name, placeholder, required = false, textarea = false
  }: {
    label: string; name: keyof typeof form; placeholder?: string; required?: boolean; textarea?: boolean;
  }) => (
    <div>
      <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
        {label} {required && <span className="text-red">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={form[name] as string}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20 resize-none"
        />
      ) : (
        <input
          value={form[name] as string}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">

          {/* Basic info */}
          <div className="bg-[#0d0d0d] border border-white/8 p-6">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-5 pb-2 border-b border-white/8">
              Basic Information
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                  Product Name <span className="text-red">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Vertex 04 Pro"
                  className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                />
              </div>
              <Field label="Slug" name="slug" placeholder="auto-generated from name" />
              <Field label="Description" name="description" textarea placeholder="Describe the product..." />
            </div>
          </div>

          {/* Specs */}
          <div className="bg-[#0d0d0d] border border-white/8 p-6">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-5 pb-2 border-b border-white/8">
              Padel Specs
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Shape", name: "shape" as const, placeholder: "Diamond / Round / Teardrop" },
                { label: "Level", name: "level" as const, placeholder: "Beginner / Intermediate / Advanced / Pro" },
                { label: "Material", name: "material" as const, placeholder: "Carbon Fiber / Fiberglass" },
                { label: "Weight", name: "weight" as const, placeholder: "365-375g" },
                { label: "Balance", name: "balance" as const, placeholder: "High / Medium / Low" },
                { label: "Core", name: "core" as const, placeholder: "38mm Multiglass" },
              ].map((f) => (
                <Field key={f.name} label={f.label} name={f.name} placeholder={f.placeholder} />
              ))}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[#0d0d0d] border border-white/8 p-6">
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-white/8">
              <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30">
                Variants
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 text-[0.62rem] tracking-[0.1em] uppercase text-white/40 hover:text-white border border-white/15 px-3 py-1.5 hover:border-white/30 transition-all"
              >
                <Plus size={11} /> Add Variant
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_1fr_100px_100px_80px_32px] gap-3">
                {["Color", "Grip", "SKU", "Price (Rs.)", "Compare", "Stock", ""].map((h) => (
                  <div key={h} className="text-[0.55rem] tracking-[0.15em] uppercase text-white/20">{h}</div>
                ))}
              </div>

              {variants.map((variant, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_1fr_100px_100px_80px_32px] gap-3 items-center">
                  <input
                    value={variant.color}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                    placeholder="Black"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <input
                    value={variant.gripSize}
                    onChange={(e) => updateVariant(i, "gripSize", e.target.value)}
                    placeholder="L2"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <input
                    value={variant.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    placeholder="BP-V04-BLK-L2"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    placeholder="28500"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <input
                    type="number"
                    value={variant.comparePrice}
                    onChange={(e) => updateVariant(i, "comparePrice", e.target.value)}
                    placeholder="33000"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                    placeholder="10"
                    className="bg-transparent border border-white/12 text-white text-[0.75rem] px-3 py-2 outline-none focus:border-white/30 placeholder:text-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={variants.length === 1}
                    className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red transition-colors disabled:opacity-20"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#0d0d0d] border border-white/8 p-6">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-5 pb-2 border-b border-white/8">
              Product Images
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-[#111] group">
                  {(img.preview || img.url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.preview || img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1 text-[0.5rem] tracking-[0.1em] uppercase bg-white text-black px-1.5 py-0.5">
                      Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(i)}
                        className="text-[0.55rem] tracking-[0.1em] uppercase text-white border border-white/40 px-2 py-1"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-7 h-7 bg-red/80 flex items-center justify-center"
                    >
                      <Trash2 size={11} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload button */}
              <label className="aspect-square border border-dashed border-white/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white/30 transition-colors">
                <Upload size={18} className="text-white/25" />
                <span className="text-[0.6rem] tracking-[0.1em] uppercase text-white/25">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-[0.62rem] text-white/20">
              Upload product images. First image is primary. Hover to set primary or remove.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Publish */}
          <div className="bg-[#0d0d0d] border border-white/8 p-5">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4 pb-2 border-b border-white/8">
              Publish
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "Active (visible in store)", key: "isActive" as const },
                { label: "Featured (show on homepage)", key: "isFeatured" as const },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-[0.75rem] text-white/55">{toggle.label}</span>
                  <div
                    onClick={() => setForm((f) => ({ ...f, [toggle.key]: !f[toggle.key] }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form[toggle.key] ? "bg-green" : "bg-gray"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[toggle.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase py-3 hover:opacity-88 transition-opacity disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full mt-2 border border-white/15 text-white/40 text-[0.72rem] tracking-[0.12em] uppercase py-2.5 hover:text-white hover:border-white/30 transition-all"
            >
              Cancel
            </button>
          </div>

          {/* Category + Brand */}
          <div className="bg-[#0d0d0d] border border-white/8 p-5">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4 pb-2 border-b border-white/8">
              Organisation
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                  Category <span className="text-red">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full bg-gray border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                  Brand <span className="text-red">*</span>
                </label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                  className="w-full bg-gray border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}