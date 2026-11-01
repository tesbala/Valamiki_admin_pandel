export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  images: string[];
  unit: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isFlashDeal: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
  isActive: boolean;
  sortOrder?: number;
}

export type CancelRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CancelRequest {
  reason: string;
  status: CancelRequestStatus;
  requestedAt: Date;
  reviewedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalPrice: number;
  deliveryAddress: Address;
  paymentMethod: string;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
  cancelRequest?: CancelRequest;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  unit: string;
  quantity: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkType?: string;
  linkValue?: string;
  isActive: boolean;
  sortOrder?: number;
  bannerType?: 'main' | 'sub' | 'print';
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  type: 'percentage' | 'flat' | 'bogo' | 'free_delivery';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  code: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usageCount?: number;
  applicableCategories?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: Date;
  addresses?: Address[];
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
}
