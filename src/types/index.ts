export interface Category {
  id: number | string;
  code?: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  products_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  sku: string;
  barcode?: string;
  name: string;
  subtitle?: string;
  description?: string;
  dimensions?: string;
  measurements_spec?: string;
  cost_price: number;
  price_cordobas: number;
  price_usd: number;
  stock: number;
  min_stock?: number;
  image_url?: string | null;
  is_finished_good?: boolean;
  expiry_date?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  document_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  credit_limit: number;
  current_debt: number;
  sales_count?: number;
  credits_count?: number;
  created_at?: string;
}

export interface SaleItem {
  id?: number;
  sale_id?: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price_cordobas: number;
  total_cordobas: number;
}

export interface Sale {
  id: number;
  ticket_number: string;
  customer_id?: number | null;
  customer?: Customer;
  user_id?: number;
  user_name?: string;
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  total_cordobas: number;
  total_usd: number;
  status: 'completed' | 'cancelled' | 'pending';
  items?: SaleItem[];
  created_at: string;
}

export interface CashRegister {
  id: number;
  user_id: number;
  user_name: string;
  status: 'open' | 'closed';
  opening_amount: number;
  closing_amount?: number;
  total_sales_cordobas: number;
  cash_sales: number;
  card_sales: number;
  opened_at: string;
  closed_at?: string;
  notes?: string;
}

export interface Movement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  user_name: string;
  created_at: string;
}

export interface CreditAccount {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  sale_id?: number;
  ticket_number: string;
  total_debt: number;
  remaining_debt: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  payments?: CreditPayment[];
}

export interface CreditPayment {
  id: number;
  credit_id: number;
  amount_cordobas: number;
  payment_method: string;
  receipt_number: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cajero' | 'vendedor';
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface CompanySetting {
  id?: number;
  name: string;
  logo?: string;
  ruc?: string;
  phone?: string;
  email?: string;
  address?: string;
  exchange_rate: number;
  main_currency: string;
  secondary_currency: string;
}
