export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'staff';
  is_approved: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: string;
  sku?: string;
  image_url?: string;
  created_at: string;
  category?: Category;
}

export interface Order {
  id: string;
  user_id: string;
  customer_id?: string;
  customer_name?: string;
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled' | 'voided' | 'refunded';
  payment_method?: string;
  void_reason?: string;
  voided_at?: string;
  refund_amount?: number;
  refunded_at?: string;
  created_at: string;
  profiles?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface HeldOrder {
  id: string;
  user_id: string;
  cart: CartItem[];
  discount: number;
  order_note: string | null;
  customer_name: string | null;
  customer_id: string | null;
  total: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled' | 'voided' | 'refunded';
  created_at: string;
  created_by: string;
  supplier?: Supplier;
  profiles?: Profile;
}

export interface SupplierOrderItem {
  id: string;
  supplier_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  product?: Product;
}