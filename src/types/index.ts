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
  unit?: string;
  expiry_date?: string;
  brand?: string;
  lotes?: {
    idLote: string;
    cantidad: number;
    fechaVencimiento: string;
    costoCompra?: number;
  }[];
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  contact_name?: string;
  document_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  credit_limit: number;
  current_debt: number;
  dias_plazo?: number;
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
  user_role?: 'admin' | 'cajero' | 'vendedor' | string;
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  subtotal_cordobas?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
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
  user?: string;
  initial_cash?: number;
  current_cash?: number;
  total_expenses?: number;
  total_sales_cash?: number;
  final_cash?: number;
}

export interface DenominationCount {
  b1000: number;
  b500: number;
  b200: number;
  b100: number;
  b50: number;
  b20: number;
  b10: number;
  coins: number;
}

export interface CashClosingRecord {
  id: string | number;
  folio: string;
  cajero_nombre: string;
  opened_at: string;
  closed_at: string;
  fondo_apertura: number;
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia?: number;
  ventas_credito?: number;
  cobranza_abonos: number;
  egresos_gastos?: number;
  total_esperado: number;
  total_fisico_contado: number;
  diferencia: number;
  estado_cuadre: 'cuadrado' | 'faltante' | 'sobrante';
  denominaciones: DenominationCount;
  total_billetes_count: number;
  observaciones?: string;
}

export interface Movement {
  id: number | string;
  product_id: number;
  product_name: string;
  sku?: string;
  type: 'in' | 'out' | 'adjust' | 'adjustment';
  sub_type?: 'VENTA' | 'ENTRADA' | 'MERMA' | 'AJUSTE';
  quantity: number;
  unit_cost?: number;
  lot_number?: string;
  previous_stock?: number;
  new_stock?: number;
  reason: string;
  user_name?: string;
  user?: string;
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
  dias_plazo?: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  payments?: CreditPayment[];
}

export interface CreditPayment {
  id: number;
  credit_id: number;
  customer_name?: string;
  caja_id?: number | string;
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
  razon_social?: string;
  logo?: string;
  ruc?: string;
  phone?: string;
  email?: string;
  address?: string;
  exchange_rate: number;
  main_currency: string;
  secondary_currency: string;
  iva_rate?: number;
  ticket_footer?: string;
}
