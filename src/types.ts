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
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled';
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
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
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
