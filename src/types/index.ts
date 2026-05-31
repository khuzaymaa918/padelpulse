export type { User, Product, ProductVariant, ProductImage,
  Category, Brand, Order, OrderItem, CartItem as CartItemDB,
  Review, WishlistItem, Address, PromoCode
} from "@prisma/client";

// ─── Extended types with relations ───────────────────

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;
  isActive: boolean;
  shape: string | null;
  level: string | null;
  material: string | null;
  weight: string | null;
  balance: string | null;
  core: string | null;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string; logoUrl: string | null };
  variants: VariantWithPrice[];
  images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
  reviews: { rating: number }[];
  _count?: { reviews: number };
}

export interface VariantWithPrice {
  id: string;
  color: string | null;
  gripSize: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productName: string;
    productBrand: string;
    variantColor: string | null;
    variantGrip: string | null;
  }[];
}

// ─── API Response types ───────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Filter types ─────────────────────────────────────

export interface ProductFilters {
  category?: string;
  brand?: string[];
  level?: string[];
  shape?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  pageSize?: number;
}

// ─── Checkout types ───────────────────────────────────

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  deliveryMethod: "STANDARD" | "EXPRESS" | "CASH_ON_DELIVERY";
  paymentMethod: "CARD" | "EASYPAISA" | "JAZZCASH" | "BANK_TRANSFER" | "CASH_ON_DELIVERY";
  promoCode?: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promoCode?: string;
  promoDiscount?: number;
}
