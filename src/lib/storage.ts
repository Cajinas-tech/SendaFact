import { Product, Category, Customer, Supplier, Purchase, PurchaseItem, Sale, CashRegister, Movement, CreditAccount, User, CompanySetting, CashClosingRecord, DenominationCount } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'sendafact_products_v3',
  CATEGORIES: 'sendafact_categories_v3',
  CUSTOMERS: 'sendafact_customers_v3',
  SUPPLIERS: 'sendafact_suppliers_v3',
  PURCHASES: 'sendafact_purchases_v3',
  SALES: 'sendafact_sales_v3',
  CASH_REGISTER: 'sendafact_cash_v3',
  CASH_REGISTERS: 'sendafact_cash_registers_list_v3',
  CASH_CLOSINGS: 'sendafact_cash_closings_v3',
  MOVEMENTS: 'sendafact_movements_v3',
  CREDITS: 'sendafact_credits_v3',
  USERS: 'sendafact_users_v3',
  SETTINGS: 'sendafact_settings_v3',
  CURRENT_USER: 'sendafact_auth_user_v3',
  THEME: 'sendafact_theme_v3'
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, code: 'udqq3jv1', name: 'PUERTAS', slug: 'puertas', icon: 'door-closed', description: 'PUERTAS DE ALUMINIO Y VIDRIO', products_count: 1 },
  { id: 2, code: 'ivc3n67a', name: 'VENTANAS', slug: 'ventanas', icon: 'app-window', description: 'VENTANAS DE ALUMINIO Y VIDRIO', products_count: 1 },
  { id: 3, code: 'lac78x2', name: 'LÁCTEOS', slug: 'lacteos', icon: 'milk', description: 'PRODUCTOS LÁCTEOS Y DERIVADOS', products_count: 2 },
  { id: 4, code: 'beb99w1', name: 'BEBIDAS', slug: 'bebidas', icon: 'cup-soda', description: 'BEBIDAS, JUGOS Y REFRESCOS', products_count: 1 },
  { id: 5, code: 'fer55k8', name: 'FERRETERÍA', slug: 'ferreteria', icon: 'wrench', description: 'HERRAMIENTAS Y ACCESORIOS DE FERRETERÍA', products_count: 1 },
  { id: 6, code: 'gen00a1', name: 'GENERAL', slug: 'general', icon: 'folder', description: 'CATEGORÍA GENERAL SIN CLASIFICAR', products_count: 0 },
  { id: 7, code: 'gas11g1', name: 'GASEOSAS', slug: 'gaseosas', icon: 'cup-soda', description: 'BEBIDAS GASEOSAS Y CARBONATADAS', products_count: 4 },
  { id: 8, code: 'cer22c1', name: 'CERVEZAS', slug: 'cervezas', icon: 'beer', description: 'CERVEZAS Y BEBIDAS DE MALTA', products_count: 2 },
  { id: 9, code: 'agu33a1', name: 'AGUAS', slug: 'aguas', icon: 'droplet', description: 'AGUAS PURIFICADAS Y MINERALES', products_count: 2 },
  { id: 10, code: 'jug44j1', name: 'JUGOS', slug: 'jugos', icon: 'citrus', description: 'JUGOS Y NÉCTARES NATURALES', products_count: 2 },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    category_id: 1,
    sku: '#SKU-9859',
    barcode: '740100019859',
    name: 'PUERTA DE ALUMINIO-VIDRIO',
    subtitle: 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44',
    description: 'Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes.',
    dimensions: '2.10 m',
    measurements_spec: '210X80X4.44 CM',
    cost_price: 2200.00,
    price_cordobas: 3500.00,
    price_usd: 95.11,
    stock: 10,
    min_stock: 2,
    image_url: '/images/products/puerta-aluminio.svg',
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 2,
    category_id: 2,
    sku: '#SKU-5640',
    barcode: '740100015640',
    name: 'VENTANA ALUMINIO-VIDRIO',
    subtitle: 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM',
    description: 'Ficha técnica de ventana corrediza de doble hoja con perfiles de alta resistencia.',
    dimensions: '1.80 m',
    measurements_spec: '1.80 LARGO X 1.20 ALTO X 5.71 CM',
    cost_price: 5000.00,
    price_cordobas: 8000.00,
    price_usd: 217.39,
    stock: 10,
    min_stock: 2,
    image_url: '/images/products/ventana-aluminio.svg',
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 3,
    category_id: 3,
    sku: 'LAC001',
    barcode: '740100010001',
    name: 'Leche Entera Pasteurizada 1L',
    subtitle: 'Lácteos • SKU: LAC001',
    description: 'Leche entera fresca enriquecida con vitaminas A y D 1 Litro',
    brand: 'DOS PINOS',
    dimensions: '1 Litro',
    cost_price: 25.00,
    price_cordobas: 40.00,
    price_usd: 1.09,
    stock: 24,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UN LITRO',
    status: 'active',
    expiry_date: '2026-11-15',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 4,
    category_id: 4,
    sku: 'BEB002',
    barcode: '740100020002',
    name: 'Jugo de Naranja Natural 1L',
    subtitle: 'Bebidas • SKU: BEB002',
    description: 'Jugo pasteurizado 100% puro 1 Litro',
    brand: 'DOS PINOS',
    dimensions: '1 Litro',
    cost_price: 33.00,
    price_cordobas: 48.00,
    price_usd: 1.22,
    stock: 18,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UN LITRO',
    status: 'active',
    expiry_date: '2026-11-20',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 5,
    category_id: 5,
    sku: 'FER001',
    barcode: '740100030003',
    name: 'Tornillos Galvanizados 2"',
    subtitle: 'Ferretería • SKU: FER001',
    description: 'Caja de 100 unidades de tornillos para ensamble',
    dimensions: '2 pulgadas',
    brand: 'GENERAL',
    cost_price: 80.00,
    price_cordobas: 130.00,
    price_usd: 3.53,
    stock: 55,
    min_stock: 10,
    image_url: null,
    is_finished_good: true,
    status: 'active',
    expiry_date: '2028-12-31',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 6,
    category_id: 4,
    sku: 'SKU-3291',
    barcode: '74010003291',
    name: 'BIG COLA 500ML',
    subtitle: 'General • Gaseosas • BIG COLA 500ML',
    description: 'Bebida gaseosa Big Cola 500ml',
    brand: 'AJE',
    dimensions: '500ml',
    cost_price: 15.00,
    price_cordobas: 25.00,
    price_usd: 0.68,
    stock: 10,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-10-11',
    lotes: [
      { idLote: 'LOT-2026-170', cantidad: 10, fechaVencimiento: '2026-10-11', costoCompra: 15.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 7,
    category_id: 7,
    sku: 'SKU-8589',
    barcode: '74010008589',
    name: 'COCA COLA 500ML',
    subtitle: 'Gaseosas • COCA COLA 500ML',
    description: 'Bebida gaseosa Coca Cola 500ml',
    brand: 'COCA-COLA',
    dimensions: '500ml',
    cost_price: 52.00,
    price_cordobas: 73.33,
    price_usd: 2.00,
    stock: 150,
    min_stock: 10,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-10-11',
    lotes: [
      { idLote: 'LOT-2026-171', cantidad: 150, fechaVencimiento: '2026-10-11', costoCompra: 52.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 8,
    category_id: 9,
    sku: 'SKU-3914',
    barcode: '74010003914',
    name: 'AGUA FUENTE PURA 600ML',
    subtitle: 'Aguas • AGUA FUENTE PURA 600ML',
    description: 'Agua purificada Fuente Pura 600ml',
    brand: 'FUENTE PURA',
    dimensions: '600ml',
    cost_price: 12.00,
    price_cordobas: 20.00,
    price_usd: 0.55,
    stock: 80,
    min_stock: 10,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-10-11',
    lotes: [
      { idLote: 'LOT-2026-172', cantidad: 80, fechaVencimiento: '2026-10-11', costoCompra: 12.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 9,
    category_id: 8,
    sku: 'SKU-7721',
    barcode: '74010007721',
    name: 'Cerveza Toña 350ml',
    subtitle: 'Cervezas • Cerveza Toña 350ml',
    description: 'Cerveza nacional de Nicaragua 350ml',
    brand: 'COMPAÑÍA CERVECERA',
    dimensions: '350ml',
    cost_price: 185.00,
    price_cordobas: 233.33,
    price_usd: 6.37,
    stock: 50,
    min_stock: 10,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-12-31',
    lotes: [
      { idLote: 'LOT-2026-210', cantidad: 50, fechaVencimiento: '2026-12-31', costoCompra: 185.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 10,
    category_id: 7,
    sku: 'SKU-4412',
    barcode: '74010004412',
    name: 'PEPSI COLA 500ML',
    subtitle: 'Gaseosas • PEPSI COLA 500ML',
    description: 'Bebida gaseosa Pepsi Cola 500ml',
    brand: 'PEPSI',
    dimensions: '500ml',
    cost_price: 45.00,
    price_cordobas: 68.00,
    price_usd: 1.86,
    stock: 25,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-11-30',
    lotes: [
      { idLote: 'LOT-2026-301', cantidad: 25, fechaVencimiento: '2026-11-30', costoCompra: 45.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 11,
    category_id: 10,
    sku: 'SKU-5520',
    barcode: '74010005520',
    name: 'Jugo Melocotón Dos Pinos 1L',
    subtitle: 'Jugos • Jugo Dos Pinos 1L',
    description: 'Jugo néctar sabor melocotón Dos Pinos 1L',
    brand: 'DOS PINOS',
    dimensions: '1 Litro',
    cost_price: 33.00,
    price_cordobas: 48.00,
    price_usd: 1.31,
    stock: 30,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UN LITRO',
    status: 'active',
    expiry_date: '2026-11-25',
    lotes: [
      { idLote: 'LOT-2026-402', cantidad: 30, fechaVencimiento: '2026-11-25', costoCompra: 33.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 12,
    category_id: 9,
    sku: 'SKU-3915',
    barcode: '74010003915',
    name: 'Agua Purificada Galón',
    subtitle: 'Aguas • Agua Purificada Galón',
    description: 'Agua purificada Fuente Pura presentación 1 galón',
    brand: 'FUENTE PURA',
    dimensions: '1 Galón',
    cost_price: 18.00,
    price_cordobas: 28.00,
    price_usd: 0.76,
    stock: 40,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2026-12-15',
    lotes: [
      { idLote: 'LOT-2026-505', cantidad: 40, fechaVencimiento: '2026-12-15', costoCompra: 18.00 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 13,
    category_id: 6,
    sku: 'SKU-9901',
    barcode: '74010009901',
    name: 'Empaque y Varios General',
    subtitle: 'General • Insumos de empaque y ferretería',
    description: 'Accesorios y empaques generales para despacho',
    brand: 'GENERAL',
    dimensions: 'Estándar',
    cost_price: 21.82,
    price_cordobas: 24.55,
    price_usd: 0.67,
    stock: 120,
    min_stock: 20,
    image_url: null,
    is_finished_good: true,
    unit: 'UNIDAD',
    status: 'active',
    expiry_date: '2028-12-31',
    lotes: [
      { idLote: 'LOT-2026-601', cantidad: 120, fechaVencimiento: '2028-12-31', costoCompra: 21.82 }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z'
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { 
    id: 1, 
    name: 'Abarrotería San José', 
    contact_name: 'Don José Martínez',
    document_number: '#LI-001', 
    phone: '+50588881234', 
    email: 'sanjose@abarroteria.ni', 
    address: 'Barrio Altagracia, del Pali 2c al lago, Managua', 
    credit_limit: 10000.00, 
    dias_plazo: 15,
    current_debt: 3502.90, 
    sales_count: 5, 
    credits_count: 2 
  },
  { 
    id: 2, 
    name: 'Pulpería La Bendición', 
    contact_name: 'Doña María López',
    document_number: '#LI-002', 
    phone: '+50587654321', 
    email: 'labendicion@gmail.com', 
    address: 'Mercado Roberto Huembes, Entrada Principal Managua', 
    credit_limit: 7000.00, 
    dias_plazo: 8,
    current_debt: 6800.00, 
    sales_count: 3, 
    credits_count: 1 
  },
  { 
    id: 3, 
    name: 'Comidería y Pulpería Doña Chepita', 
    contact_name: 'Josefa Ramos',
    document_number: '#LI-003', 
    phone: '+50589123456', 
    email: 'donachepita@hotmail.com', 
    address: 'Colonia Centroamérica, Semáforos 1c arriba', 
    credit_limit: 8000.00, 
    dias_plazo: 30,
    current_debt: 8900.00, 
    sales_count: 4, 
    credits_count: 2 
  },
  { 
    id: 4, 
    name: 'Minisúper El Éxito', 
    contact_name: 'Carlos Chamorro',
    document_number: '#LI-004', 
    phone: '+50583456789', 
    email: 'elexito@gmail.com', 
    address: 'Carretera Masaya km 12.5, Residencial San José', 
    credit_limit: 15000.00, 
    dias_plazo: 15,
    current_debt: 0.00, 
    sales_count: 8, 
    credits_count: 0 
  },
  { 
    id: 5, 
    name: 'Cliente Mostrador / Venta Rápida', 
    contact_name: 'Público General',
    document_number: '#LI-005', 
    phone: '+50588888888', 
    email: 'mostrador@sendafact.ni', 
    address: 'Venta Directa en Almacén', 
    credit_limit: 0.00, 
    dias_plazo: 0,
    current_debt: 0.00, 
    sales_count: 25, 
    credits_count: 0 
  },
  { 
    id: 6, 
    name: 'Eduardo López', 
    contact_name: 'Eduardo López',
    document_number: '#DUARDO', 
    phone: '+444334405', 
    email: 'eduardo@gmail.com', 
    address: 'Colonia Centro, Calle 4', 
    credit_limit: 10000.00, 
    dias_plazo: 15,
    current_debt: 0.00, 
    sales_count: 3, 
    credits_count: 0 
  }
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    company_name: 'Distribuidora Láctea del Norte S.A.',
    name: 'Distribuidora Láctea del Norte S.A.',
    contact_name: 'Carlos Martínez',
    ruc: 'J0310000001234',
    phone: '8888-8888',
    address: 'Carretera Norte Km 12, Managua',
    email: 'ventas@lacteosnorte.com',
    status: 'active',
    purchases_count: 12,
    created_at: '2026-08-15T09:00:00Z'
  },
  {
    id: 2,
    company_name: 'Vidriería y Perfiles de Aluminio S.A.',
    name: 'Vidriería y Perfiles de Aluminio S.A.',
    contact_name: 'Ing. Roberto Silva',
    ruc: 'J0310000005678',
    phone: '2244-1234',
    address: 'Pista Suburbana, Rotonda Universitaria 200m abajo, Managua',
    email: 'pedidos@vidrioperfiles.ni',
    status: 'active',
    purchases_count: 18,
    created_at: '2026-08-20T11:30:00Z'
  },
  {
    id: 3,
    company_name: 'Comercializadora Industrial El Trébol',
    name: 'Comercializadora Industrial El Trébol',
    contact_name: 'Lic. Claudia Morales',
    ruc: 'J0310000009988',
    phone: '8765-4321',
    address: 'Zona Industrial Portezuelo, Nave #4, Managua',
    email: 'contacto@eltrebol.com.ni',
    status: 'active',
    purchases_count: 6,
    created_at: '2026-09-02T14:15:00Z'
  }
];

const DEFAULT_PURCHASES: Purchase[] = [
  {
    id: 1,
    invoice_number: 'FAC-001-4500',
    supplier_id: 1,
    supplier_name: 'Distribuidora Láctea del Norte S.A.',
    supplier_ruc: 'J0310000001234',
    purchase_date: '2026-11-15',
    payment_condition: 'contado',
    payment_source: 'efectivo',
    subtotal: 1250.00,
    discount: 0,
    tax_iva: 187.50,
    total_neto: 1437.50,
    observations: 'Mercadería recibida conforme en bodega central, lote sellado y verificado.',
    status: 'completed',
    items: [
      {
        id: 1,
        product_id: 3,
        product_name: 'Leche Entera Pasteurizada 1L',
        sku: 'LAC001',
        category_name: 'LÁCTEOS',
        current_stock: 24,
        unit_cost: 25.00,
        quantity: 50,
        apply_iva: true,
        sale_price: 40.00,
        subtotal: 1250.00,
        lot_number: 'LOT-202611-01',
        expiry_date: '2027-02-15'
      }
    ],
    user_name: 'Administrador',
    created_at: '2026-11-15T10:30:00Z'
  }
];

const DEFAULT_SETTINGS: CompanySetting = {
  id: 1,
  name: 'Senda Sistemas',
  razon_social: 'Comercial Nicaragua S.A.',
  logo: '',
  ruc: 'J0310000001234',
  phone: '+505 8505-9284',
  email: 'contacto@sendasistemas.com',
  address: 'Villa Sol Casa E8-23 Calle 21',
  exchange_rate: 36.63,
  main_currency: 'C$',
  secondary_currency: 'USD',
  iva_rate: 15,
  ticket_footer: '¡Gracias por su compra! Factura Simplificada en Córdobas (C$)'
};

const DEFAULT_USERS: User[] = [
  { id: 1, name: 'jairotten84 (ADMINISTRADOR)', email: 'jairotten84@gmail.com', role: 'admin', phone: '+505 8888 0001', status: 'active', created_at: '2026-01-01' },
  { id: 2, name: 'admin', email: 'admin@sendasistemas.com', role: 'admin', phone: '+505 8888 0002', status: 'active', created_at: '2026-01-01' },
  { id: 3, name: 'Loira', email: 'loira@sendasistemas.com', role: 'cajero', phone: '+505 8888 0003', status: 'active', created_at: '2026-01-15' },
  { id: 4, name: 'Dylan', email: 'dylan@sendasistemas.com', role: 'vendedor', phone: '+505 8888 0004', status: 'active', created_at: '2026-02-01' },
  { id: 5, name: 'Cajero Principal', email: 'caja@sendasistemas.com', role: 'cajero', phone: '+505 8888 0005', status: 'active', created_at: '2026-02-10' },
  { id: 6, name: 'Vendedor Sala de Ventas', email: 'ventas@sendasistemas.com', role: 'vendedor', phone: '+505 8888 0006', status: 'active', created_at: '2026-02-15' },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 101,
    ticket_number: '#FACT-20261019-000001',
    customer_id: 1,
    customer: { id: 1, name: 'Abarrotería San José', phone: '+50588881234', credit_limit: 10000, current_debt: 3502.90 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'efectivo',
    subtotal_cordobas: 4200.00,
    total_cordobas: 4200.00,
    total_usd: 114.66,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 58, unit_price_cordobas: 72.41, total_cordobas: 4200.00 }
    ],
    created_at: '2026-10-19T14:22:10'
  },
  {
    id: 102,
    ticket_number: '#FACT-20261019-000002',
    customer_id: 2,
    customer: { id: 2, name: 'Pulpería La Bendición', phone: '+50587654321', credit_limit: 5000, current_debt: 1250.00 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'transferencia',
    subtotal_cordobas: 3500.00,
    total_cordobas: 3500.00,
    total_usd: 95.55,
    status: 'completed',
    items: [
      { product_id: 9, product_name: 'Cerveza Toña 350ml', quantity: 15, unit_price_cordobas: 233.33, total_cordobas: 3500.00 }
    ],
    created_at: '2026-10-19T11:45:00'
  },
  {
    id: 103,
    ticket_number: '#FACT-20261018-000003',
    customer_id: 3,
    customer: { id: 3, name: 'Comidería Doña Chepita', phone: '+50581239876', credit_limit: 3000, current_debt: 800.00 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'credito',
    subtotal_cordobas: 2800.00,
    total_cordobas: 2800.00,
    total_usd: 76.44,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 38, unit_price_cordobas: 73.68, total_cordobas: 2800.00 }
    ],
    created_at: '2026-10-18T16:30:15'
  },
  {
    id: 104,
    ticket_number: '#FACT-20261018-000004',
    customer_id: 4,
    customer: { id: 4, name: 'Minisúper El Éxito', phone: '+50584561230', credit_limit: 8000, current_debt: 2200.00 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'credito',
    subtotal_cordobas: 1465.90,
    total_cordobas: 1465.90,
    total_usd: 40.02,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 18, unit_price_cordobas: 73.33, total_cordobas: 1320.00 },
      { product_id: 13, product_name: 'Empaque y Varios General', quantity: 6, unit_price_cordobas: 24.32, total_cordobas: 145.90 }
    ],
    created_at: '2026-10-18T10:15:30'
  },
  {
    id: 105,
    ticket_number: '#FACT-20261017-000005',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Loira',
    user_role: 'cajero',
    payment_method: 'efectivo',
    subtotal_cordobas: 1500.00,
    total_cordobas: 1500.00,
    total_usd: 40.95,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 20, unit_price_cordobas: 75.00, total_cordobas: 1500.00 }
    ],
    created_at: '2026-10-17T18:40:00'
  },
  {
    id: 106,
    ticket_number: '#FACT-20261017-000006',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Loira',
    user_role: 'cajero',
    payment_method: 'efectivo',
    subtotal_cordobas: 960.00,
    total_cordobas: 960.00,
    total_usd: 26.21,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 12, unit_price_cordobas: 75.00, total_cordobas: 900.00 },
      { product_id: 8, product_name: 'AGUA FUENTE PURA 600ML', quantity: 3, unit_price_cordobas: 20.00, total_cordobas: 60.00 }
    ],
    created_at: '2026-10-17T14:10:20'
  },
  {
    id: 107,
    ticket_number: '#FACT-20261016-000007',
    customer_id: 6,
    customer: { id: 6, name: 'Eduardo López', credit_limit: 0, current_debt: 0 },
    user_name: 'Dylan',
    user_role: 'vendedor',
    payment_method: 'efectivo',
    subtotal_cordobas: 650.00,
    total_cordobas: 650.00,
    total_usd: 17.74,
    status: 'completed',
    items: [
      { product_id: 8, product_name: 'AGUA FUENTE PURA 600ML', quantity: 18, unit_price_cordobas: 20.00, total_cordobas: 360.00 },
      { product_id: 12, product_name: 'Agua Purificada Galón', quantity: 10, unit_price_cordobas: 29.00, total_cordobas: 290.00 }
    ],
    created_at: '2026-10-16T17:25:40'
  },
  {
    id: 108,
    ticket_number: '#FACT-20261016-000008',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Dylan',
    user_role: 'vendedor',
    payment_method: 'efectivo',
    subtotal_cordobas: 416.20,
    total_cordobas: 416.20,
    total_usd: 11.36,
    status: 'completed',
    items: [
      { product_id: 13, product_name: 'Empaque y Varios General', quantity: 17, unit_price_cordobas: 24.48, total_cordobas: 416.20 }
    ],
    created_at: '2026-10-16T12:05:10'
  },
  {
    id: 109,
    ticket_number: '#FACT-20261015-000009',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'efectivo',
    subtotal_cordobas: 280.00,
    total_cordobas: 280.00,
    total_usd: 7.64,
    status: 'completed',
    items: [
      { product_id: 13, product_name: 'Empaque y Varios General', quantity: 10, unit_price_cordobas: 28.00, total_cordobas: 280.00 }
    ],
    created_at: '2026-10-15T16:50:00'
  },
  {
    id: 110,
    ticket_number: '#FACT-20261015-000010',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Loira',
    user_role: 'cajero',
    payment_method: 'efectivo',
    subtotal_cordobas: 158.00,
    total_cordobas: 158.00,
    total_usd: 4.31,
    status: 'completed',
    items: [
      { product_id: 8, product_name: 'AGUA FUENTE PURA 600ML', quantity: 4, unit_price_cordobas: 22.50, total_cordobas: 90.00 },
      { product_id: 10, product_name: 'PEPSI COLA 500ML', quantity: 1, unit_price_cordobas: 68.00, total_cordobas: 68.00 }
    ],
    created_at: '2026-10-15T11:20:15'
  },
  {
    id: 111,
    ticket_number: '#FACT-20261014-000011',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Loira',
    user_role: 'cajero',
    payment_method: 'efectivo',
    subtotal_cordobas: 74.00,
    total_cordobas: 74.00,
    total_usd: 2.02,
    status: 'completed',
    items: [
      { product_id: 11, product_name: 'Jugo Melocotón Dos Pinos 1L', quantity: 1, unit_price_cordobas: 48.00, total_cordobas: 48.00 },
      { product_id: 5, product_name: 'Tornillos Galvanizados 2"', quantity: 1, unit_price_cordobas: 26.00, total_cordobas: 26.00 }
    ],
    created_at: '2026-10-14T15:10:00'
  },
  {
    id: 112,
    ticket_number: '#FACT-20261014-000012',
    customer_id: 5,
    customer: { id: 5, name: 'Cliente Mostrador / Venta Rápida', credit_limit: 0, current_debt: 0 },
    user_name: 'Jairo (ADMINISTRADOR)',
    user_role: 'admin',
    payment_method: 'efectivo',
    subtotal_cordobas: 48.00,
    total_cordobas: 48.00,
    total_usd: 1.31,
    status: 'completed',
    items: [
      { product_id: 7, product_name: 'COCA COLA 500ML', quantity: 4, unit_price_cordobas: 12.00, total_cordobas: 48.00 }
    ],
    created_at: '2026-10-14T09:30:00'
  }
];

const DEFAULT_CASH: CashRegister = {
  id: 202610047611,
  user_id: 1,
  user_name: 'Jairo',
  status: 'open',
  opening_amount: 2000.00,
  total_sales_cordobas: 52.90,
  cash_sales: 0.00,
  card_sales: 52.90,
  opened_at: '2026-10-03T22:47:17',
  notes: 'Turno aperturado'
};

const DEFAULT_CASH_REGISTERS_LIST = [
  {
    id: 202610047611,
    user: 'Jairo',
    user_name: 'Jairo',
    opened_at: '2026-10-03T22:47:17',
    closed_at: null,
    initial_cash: 2000.00,
    opening_amount: 2000.00,
    total_sales_cash: 0.00,
    current_cash: 2000.00,
    final_cash: 2000.00,
    status: 'open'
  },
  {
    id: 202610049723,
    user: 'Jairo',
    user_name: 'Jairo',
    opened_at: '2026-10-03T22:46:59',
    closed_at: '2026-10-03T22:47:08',
    initial_cash: 1000.00,
    opening_amount: 1000.00,
    total_sales_cash: 0.00,
    current_cash: 1000.00,
    final_cash: 1000.00,
    status: 'closed'
  },
  {
    id: 202610049521,
    user: 'Jairo',
    user_name: 'Jairo',
    opened_at: '2026-10-03T22:38:29',
    closed_at: '2026-10-03T22:39:05',
    initial_cash: 1000.00,
    opening_amount: 1000.00,
    total_sales_cash: 0.00,
    current_cash: 1000.00,
    final_cash: 1000.00,
    status: 'closed'
  },
  {
    id: 202610045624,
    user: 'Jairo',
    user_name: 'Jairo',
    opened_at: '2026-10-03T22:23:15',
    closed_at: '2026-10-03T22:23:19',
    initial_cash: 2000.00,
    opening_amount: 2000.00,
    total_sales_cash: 0.00,
    current_cash: 0.00,
    final_cash: 0.00,
    status: 'closed'
  }
];

const DEFAULT_CASH_CLOSINGS: CashClosingRecord[] = [
  {
    id: 'CAJA-2026-10-04-9723',
    folio: 'CAJA-2026-10-04-9723',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T22:46:59',
    closed_at: '2026-10-03T22:47:08',
    fondo_apertura: 1000.00,
    ventas_efectivo: 0.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1000.00,
    total_fisico_contado: 1000.00,
    diferencia: 0.00,
    estado_cuadre: 'cuadrado',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-04-9521',
    folio: 'CAJA-2026-10-04-9521',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T22:38:29',
    closed_at: '2026-10-03T22:39:05',
    fondo_apertura: 1000.00,
    ventas_efectivo: 0.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1000.00,
    total_fisico_contado: 1000.00,
    diferencia: 0.00,
    estado_cuadre: 'cuadrado',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-04-5624',
    folio: 'CAJA-2026-10-04-5624',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T22:23:15',
    closed_at: '2026-10-03T22:23:19',
    fondo_apertura: 2000.00,
    ventas_efectivo: 0.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2000.00,
    total_fisico_contado: 0.00,
    diferencia: -2000.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-03-7841',
    folio: 'CAJA-2026-10-03-7841',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T18:00:00',
    closed_at: '2026-10-03T21:45:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 1500.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2500.00,
    total_fisico_contado: 0.00,
    diferencia: -2500.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-03-6520',
    folio: 'CAJA-2026-10-03-6520',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T14:00:00',
    closed_at: '2026-10-03T17:50:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 800.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1800.00,
    total_fisico_contado: 0.00,
    diferencia: -1800.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-03-4912',
    folio: 'CAJA-2026-10-03-4912',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-03T09:00:00',
    closed_at: '2026-10-03T13:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 2250.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 3250.00,
    total_fisico_contado: 0.00,
    diferencia: -3250.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-02-9118',
    folio: 'CAJA-2026-10-02-9118',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-02T19:00:00',
    closed_at: '2026-10-02T22:15:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 450.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1450.00,
    total_fisico_contado: 0.00,
    diferencia: -1450.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-02-8034',
    folio: 'CAJA-2026-10-02-8034',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-02T14:30:00',
    closed_at: '2026-10-02T18:45:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 1100.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2100.00,
    total_fisico_contado: 0.00,
    diferencia: -2100.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-02-7105',
    folio: 'CAJA-2026-10-02-7105',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-02T09:15:00',
    closed_at: '2026-10-02T14:00:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 3120.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 4120.00,
    total_fisico_contado: 0.00,
    diferencia: -4120.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-01-6401',
    folio: 'CAJA-2026-10-01-6401',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-01T18:00:00',
    closed_at: '2026-10-01T21:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 950.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1950.00,
    total_fisico_contado: 0.00,
    diferencia: -1950.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-01-5230',
    folio: 'CAJA-2026-10-01-5230',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-01T13:00:00',
    closed_at: '2026-10-01T17:45:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 1800.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2800.00,
    total_fisico_contado: 0.00,
    diferencia: -2800.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-10-01-4112',
    folio: 'CAJA-2026-10-01-4112',
    cajero_nombre: 'Jairo',
    opened_at: '2026-10-01T08:30:00',
    closed_at: '2026-10-01T12:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 600.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1600.00,
    total_fisico_contado: 0.00,
    diferencia: -1600.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-30-9850',
    folio: 'CAJA-2026-09-30-9850',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-30T17:00:00',
    closed_at: '2026-09-30T21:00:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 2400.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 3400.00,
    total_fisico_contado: 0.00,
    diferencia: -3400.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-30-8521',
    folio: 'CAJA-2026-09-30-8521',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-30T12:00:00',
    closed_at: '2026-09-30T16:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 1050.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2050.00,
    total_fisico_contado: 0.00,
    diferencia: -2050.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-30-7410',
    folio: 'CAJA-2026-09-30-7410',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-30T08:00:00',
    closed_at: '2026-09-30T11:45:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 750.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1750.00,
    total_fisico_contado: 0.00,
    diferencia: -1750.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-29-6320',
    folio: 'CAJA-2026-09-29-6320',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-29T16:00:00',
    closed_at: '2026-09-29T20:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 1300.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 2300.00,
    total_fisico_contado: 0.00,
    diferencia: -2300.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-29-5100',
    folio: 'CAJA-2026-09-29-5100',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-29T11:00:00',
    closed_at: '2026-09-29T15:30:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 920.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1920.00,
    total_fisico_contado: 0.00,
    diferencia: -1920.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-29-3890',
    folio: 'CAJA-2026-09-29-3890',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-29T08:00:00',
    closed_at: '2026-09-29T10:45:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 893.20,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1893.20,
    total_fisico_contado: 0.00,
    diferencia: -1893.20,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  },
  {
    id: 'CAJA-2026-09-28-2104',
    folio: 'CAJA-2026-09-28-2104',
    cajero_nombre: 'Jairo',
    opened_at: '2026-09-28T09:00:00',
    closed_at: '2026-09-28T14:00:00',
    fondo_apertura: 1000.00,
    ventas_efectivo: 500.00,
    ventas_tarjeta: 0.00,
    cobranza_abonos: 0.00,
    total_esperado: 1500.00,
    total_fisico_contado: 0.00,
    diferencia: -1500.00,
    estado_cuadre: 'faltante',
    denominaciones: { b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, coins: 0 },
    total_billetes_count: 0
  }
];

const DEFAULT_CREDITS: CreditAccount[] = [
  {
    id: 1,
    customer_id: 1,
    customer_name: 'Eduardo López',
    customer_phone: '444334405',
    ticket_number: 'NOVA-V-0988',
    total_debt: 3500.00,
    remaining_debt: 1450.00,
    status: 'pending',
    due_date: '2026-09-30',
    created_at: '2026-09-02',
    payments: [
      { id: 1, credit_id: 1, amount_cordobas: 2050.00, payment_method: 'Efectivo', receipt_number: 'REC-001', created_at: '2026-09-05' }
    ]
  },
  {
    id: 2,
    customer_id: 2,
    customer_name: 'María González',
    customer_phone: '88776655',
    ticket_number: 'NOVA-V-0940',
    total_debt: 4200.00,
    remaining_debt: 4200.00,
    status: 'overdue',
    due_date: '2026-08-15',
    created_at: '2026-08-01',
    payments: []
  },
  {
    id: 3,
    customer_id: 3,
    customer_name: 'Carlos Mendoza',
    customer_phone: '89991122',
    ticket_number: 'NOVA-V-0890',
    total_debt: 2800.00,
    remaining_debt: 0.00,
    status: 'paid',
    due_date: '2026-08-20',
    created_at: '2026-08-10',
    payments: [
      { id: 2, credit_id: 3, amount_cordobas: 2800.00, payment_method: 'Transferencia', receipt_number: 'REC-002', created_at: '2026-08-18' }
    ]
  },
  {
    id: 4,
    customer_id: 4,
    customer_name: 'Distribuidora Central S.A.',
    customer_phone: '22774411',
    ticket_number: 'NOVA-V-0750',
    total_debt: 6500.00,
    remaining_debt: 6500.00,
    status: 'cancelled',
    due_date: '2026-07-30',
    created_at: '2026-07-15',
    payments: []
  }
];

const DEFAULT_MOVEMENTS: Movement[] = [
  { id: 'MOV-1010', product_id: 4, product_name: 'Jugo de Naranja Natural 1L', sku: 'BEB002', type: 'out', sub_type: 'MERMA', quantity: 1, lot_number: 'LOT-2026-095', unit_cost: 41.00, reason: 'Merma por daño y derrame accidental en estante', user_name: 'Jairo Cajina (Admin)', user: 'Jairo Cajina (Admin)', created_at: '2026-10-18T16:00:00Z' },
  { id: 'MOV-1009', product_id: 3, product_name: 'Leche Entera Pasteurizada 1L', sku: 'LAC001', type: 'out', sub_type: 'MERMA', quantity: 1, lot_number: 'LOT-2026-092', unit_cost: 25.00, reason: 'Merma por fecha de vencimiento alcanzada', user_name: 'Jairo Cajina (Admin)', user: 'Jairo Cajina (Admin)', created_at: '2026-10-17T11:30:00Z' },
  { id: 'MOV-1008', product_id: 3, product_name: 'AGUA FUENTE PURA 600ML', sku: '#SKU-6208', type: 'out', sub_type: 'VENTA', quantity: 1, lot_number: 'LOT-2026-277', unit_cost: 20.00, reason: 'Venta FACT-20261019-461704 (Abarrotería San José)', user_name: 'Jairo Cajina (Admin)', user: 'Jairo Cajina (Admin)', created_at: '2026-10-19T11:05:00Z' },
  { id: 'MOV-1007', product_id: 1, product_name: 'BIG COLA 500ML', sku: '#SKU-3291', type: 'out', sub_type: 'VENTA', quantity: 1, lot_number: 'LOT-2026-834', unit_cost: 20.00, reason: 'Venta FACT-20261019-461704 (Abarrotería San José)', user_name: 'Jairo Cajina (Admin)', user: 'Jairo Cajina (Admin)', created_at: '2026-10-19T11:05:00Z' },
  { id: 'MOV-1006', product_id: 2, product_name: 'COCA COLA 500ML', sku: '#SKU-8589', type: 'out', sub_type: 'VENTA', quantity: 1, lot_number: 'LOT-2026-894', unit_cost: 24.00, reason: 'Venta NOVA-V-6985 (Cliente Ocasional / Público General)', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:25:00Z' },
  { id: 'MOV-1005', product_id: 1, product_name: 'BIG COLA 500ML', sku: '#SKU-3291', type: 'out', sub_type: 'VENTA', quantity: 1, lot_number: 'LOT-SKU-3291', unit_cost: 16.00, reason: 'Venta NOVA-V-6985 (Cliente Ocasional / Público General)', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:25:00Z' },
  { id: 'MOV-1004', product_id: 3, product_name: 'AGUA FUENTE PURA 600ML', sku: '#SKU-6208', type: 'out', sub_type: 'VENTA', quantity: 1, lot_number: 'LOT-SKU-3914', unit_cost: 25.00, reason: 'Venta NOVA-V-6985 (Cliente Ocasional / Público General)', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:25:00Z' },
  { id: 'MOV-1003', product_id: 2, product_name: 'COCA COLA 500ML', sku: '#SKU-8589', type: 'in', sub_type: 'ENTRADA', quantity: 24, lot_number: 'LOT-2026-108', unit_cost: 20.00, reason: 'Ingreso nuevo lote LOT-2026-108', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:25:00Z' },
  { id: 'MOV-1002', product_id: 3, product_name: 'AGUA FUENTE PURA 600ML', sku: '#SKU-6208', type: 'in', sub_type: 'ENTRADA', quantity: 24, lot_number: 'LOT-2026-277', unit_cost: 20.00, reason: 'Ingreso nuevo lote LOT-2026-277', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:24:00Z' },
  { id: 'MOV-1001', product_id: 1, product_name: 'BIG COLA 500ML', sku: '#SKU-3291', type: 'in', sub_type: 'ENTRADA', quantity: 24, lot_number: 'LOT-2026-627', unit_cost: 20.00, reason: 'Ingreso nuevo lote LOT-2026-627', user_name: 'Jairo', user: 'Jairo', created_at: '2026-10-03T20:24:00Z' },
];

export const storage = {
  // PRODUCTS
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.setProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    try {
      const prods: Product[] = JSON.parse(raw) || DEFAULT_PRODUCTS;
      let changed = false;
      for (const p of prods) {
        const dp = DEFAULT_PRODUCTS.find(d => d.sku === p.sku);
        if (dp) {
          if (!p.brand && dp.brand) { p.brand = dp.brand; changed = true; }
          if ((!p.lotes || p.lotes.length === 0) && dp.lotes) { p.lotes = dp.lotes; changed = true; }
        }
        if (!p.lotes || p.lotes.length === 0) {
          p.lotes = [{
            idLote: p.sku.startsWith('#') ? 'LOT-' + p.sku.replace('#', '') : (p.sku.startsWith('LOT-') ? p.sku : 'LOT-' + p.sku),
            cantidad: p.stock,
            fechaVencimiento: p.expiry_date || '2026-10-11',
            costoCompra: p.cost_price
          }];
          changed = true;
        }
      }
      if (changed) {
        this.setProducts(prods);
      }
      return prods;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  },
  setProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  saveProduct(product: Product) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => String(p.id) === String(product.id));
    if (idx >= 0) {
      prods[idx] = product;
    } else {
      prods.unshift(product);
    }
    this.setProducts(prods);
  },
  deleteProduct(id: number | string): Product[] {
    const prods = this.getProducts().filter(p => String(p.id) !== String(id));
    this.setProducts(prods);
    return prods;
  },

  // CATEGORIES
  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.setCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    try {
      const parsed: Category[] = JSON.parse(raw) || DEFAULT_CATEGORIES;
      // Auto-migrate missing codes / descriptions if needed
      let changed = false;
      const migrated = parsed.map((cat, i) => {
        let updatedCat = { ...cat };
        if (!updatedCat.code) {
          const defaultMatch = DEFAULT_CATEGORIES.find(d => String(d.id) === String(cat.id) || d.name.toUpperCase() === cat.name.toUpperCase());
          updatedCat.code = defaultMatch?.code || Math.random().toString(36).substring(2, 10);
          changed = true;
        }
        if (!updatedCat.description) {
          const defaultMatch = DEFAULT_CATEGORIES.find(d => String(d.id) === String(cat.id) || d.name.toUpperCase() === cat.name.toUpperCase());
          updatedCat.description = defaultMatch?.description || `${cat.name} GENERAL`;
          changed = true;
        }
        return updatedCat;
      });
      if (changed) {
        this.setCategories(migrated);
        return migrated;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  },
  setCategories(categories: Category[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  saveCategory(category: Category) {
    const list = this.getCategories();
    const idx = list.findIndex(c => String(c.id) === String(category.id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...category };
    } else {
      list.unshift(category);
    }
    this.setCategories(list);
  },
  deleteCategory(id: number | string) {
    const list = this.getCategories().filter(c => String(c.id) !== String(id));
    this.setCategories(list);
  },

  // CUSTOMERS
  getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      this.setCustomers(DEFAULT_CUSTOMERS);
      return DEFAULT_CUSTOMERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const hasAbarroteria = parsed.some((c: any) => c.name?.includes('Abarrotería San José'));
        if (!hasAbarroteria && parsed.length <= 4) {
          this.setCustomers(DEFAULT_CUSTOMERS);
          return DEFAULT_CUSTOMERS;
        }
        return parsed;
      }
      return DEFAULT_CUSTOMERS;
    } catch (e) {
      return DEFAULT_CUSTOMERS;
    }
  },
  setCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  saveCustomer(customer: any) {
    const list = this.getCustomers();
    const idx = list.findIndex(c => String(c.id) === String(customer.id));
    if (idx >= 0) list[idx] = customer;
    else list.unshift(customer);
    this.setCustomers(list);
  },
  deleteCustomer(id: number | string): Customer[] {
    const list = this.getCustomers().filter(c => String(c.id) !== String(id));
    this.setCustomers(list);
    return list;
  },

  // SUPPLIERS (PROVEEDORES)
  getSuppliers(): Supplier[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      this.setSuppliers(DEFAULT_SUPPLIERS);
      return DEFAULT_SUPPLIERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      this.setSuppliers(DEFAULT_SUPPLIERS);
      return DEFAULT_SUPPLIERS;
    } catch (e) {
      return DEFAULT_SUPPLIERS;
    }
  },
  setSuppliers(suppliers: Supplier[]) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },
  saveSupplier(supplier: Supplier): Supplier {
    const list = this.getSuppliers();
    const idx = list.findIndex(s => String(s.id) === String(supplier.id));
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...supplier,
        name: supplier.company_name || supplier.name,
        updated_at: new Date().toISOString()
      };
    } else {
      const newSupplier: Supplier = {
        ...supplier,
        name: supplier.company_name || supplier.name,
        id: supplier.id || Date.now(),
        status: supplier.status || 'active',
        created_at: supplier.created_at || new Date().toISOString()
      };
      list.unshift(newSupplier);
    }
    this.setSuppliers(list);
    return supplier;
  },
  deleteSupplier(id: number | string): Supplier[] {
    const list = this.getSuppliers().filter(s => String(s.id) !== String(id));
    this.setSuppliers(list);
    return list;
  },

  // PURCHASES (COMPRAS E INSUMOS)
  getPurchases(): Purchase[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (!raw) {
      this.setPurchases(DEFAULT_PURCHASES);
      return DEFAULT_PURCHASES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_PURCHASES;
    } catch (e) {
      return DEFAULT_PURCHASES;
    }
  },
  setPurchases(purchases: Purchase[]) {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },
  savePurchase(purchase: Purchase): Purchase {
    const list = this.getPurchases();
    const idx = list.findIndex(p => String(p.id) === String(purchase.id));
    const isNew = idx < 0;

    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...purchase,
        updated_at: new Date().toISOString()
      };
    } else {
      const newPurchase: Purchase = {
        ...purchase,
        id: purchase.id || Date.now(),
        created_at: purchase.created_at || new Date().toISOString()
      };
      list.unshift(newPurchase);
    }
    this.setPurchases(list);

    // Si la compra está completada y es nueva, abastecer inventario y generar movimientos
    if (isNew && purchase.status === 'completed') {
      const products = this.getProducts();
      const movements = this.getMovements();

      purchase.items.forEach(item => {
        const prodIdx = products.findIndex(p => p.id === item.product_id);
        if (prodIdx >= 0) {
          const prevStock = products[prodIdx].stock || 0;
          const newStock = prevStock + Number(item.quantity);
          products[prodIdx].stock = newStock;
          if (item.unit_cost > 0) {
            products[prodIdx].cost_price = Number(item.unit_cost);
          }
          if (item.sale_price && item.sale_price > 0) {
            products[prodIdx].price_cordobas = Number(item.sale_price);
          }

          // Registrar movimiento en Kardex
          movements.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000),
            product_id: item.product_id,
            product_name: item.product_name,
            sku: item.sku || products[prodIdx].sku,
            type: 'in',
            sub_type: 'ENTRADA',
            quantity: Number(item.quantity),
            unit_cost: Number(item.unit_cost),
            previous_stock: prevStock,
            new_stock: newStock,
            reason: `Compra Factura ${purchase.invoice_number || 'S/N'} (${purchase.supplier_name})`,
            user_name: purchase.user_name || 'Administrador',
            created_at: new Date().toISOString()
          });
        }
      });

      this.setProducts(products);
      this.setMovements(movements);

      // Actualizar contador de compras del proveedor
      if (purchase.supplier_id) {
        const suppliers = this.getSuppliers();
        const supIdx = suppliers.findIndex(s => s.id === purchase.supplier_id);
        if (supIdx >= 0) {
          suppliers[supIdx].purchases_count = (suppliers[supIdx].purchases_count || 0) + 1;
          this.setSuppliers(suppliers);
        }
      }

      // Si es al contado y con efectivo de caja, reflejar en egreso de caja si está abierta
      if (purchase.payment_condition === 'contado' && purchase.payment_source === 'efectivo') {
        const cash = this.getCashRegister();
        if (cash && cash.status === 'open') {
          cash.total_expenses = (cash.total_expenses || 0) + Number(purchase.total_neto);
          cash.current_cash = Math.max(0, (cash.current_cash || cash.opening_amount) - Number(purchase.total_neto));
          this.setCashRegister(cash);
        }
      }
    }

    return purchase;
  },
  deletePurchase(id: number | string): Purchase[] {
    const list = this.getPurchases().filter(p => String(p.id) !== String(id));
    this.setPurchases(list);
    return list;
  },

  // SALES
  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      this.setSales(DEFAULT_SALES);
      return DEFAULT_SALES;
    }
    try {
      const parsed: Sale[] = JSON.parse(raw) || DEFAULT_SALES;
      const hasFact = parsed.some(s => s.ticket_number && s.ticket_number.includes('FACT'));
      if (!hasFact && parsed.length < 5) {
        const merged = [...parsed, ...DEFAULT_SALES];
        this.setSales(merged);
        return merged;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_SALES;
    }
  },
  setSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },
  saveSale(sale: Sale) {
    const sales = this.getSales();
    const idx = sales.findIndex(s => s.id === sale.id);
    if (idx >= 0) {
      sales[idx] = sale;
    } else {
      sales.unshift(sale);
    }
    this.setSales(sales);
  },
  cancelSale(id: number): boolean {
    const sales = this.getSales();
    const sale = sales.find(s => s.id === id);
    if (!sale) return false;
    sale.status = 'cancelled';
    this.setSales(sales);
    return true;
  },

  // CASH REGISTER
  getCashRegister(): CashRegister {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_REGISTER);
    if (!raw) {
      this.setCashRegister(DEFAULT_CASH);
      return DEFAULT_CASH;
    }
    try { return JSON.parse(raw) || DEFAULT_CASH; } catch (e) { return DEFAULT_CASH; }
  },
  getActiveCashRegister(): any {
    const cash = this.getCashRegister();
    if (cash && cash.status === 'open') {
      return {
        ...cash,
        user: cash.user_name || 'Jairo Cajina',
        current_cash: cash.opening_amount + (cash.cash_sales || 0),
        initial_cash: cash.opening_amount || 1000
      };
    }
    return null;
  },
  getCashRegisters(): any[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_REGISTERS);
    if (!raw) {
      this.setCashRegisters(DEFAULT_CASH_REGISTERS_LIST);
      return DEFAULT_CASH_REGISTERS_LIST;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return DEFAULT_CASH_REGISTERS_LIST;
    } catch (e) {
      return DEFAULT_CASH_REGISTERS_LIST;
    }
  },
  setCashRegisters(list: any[]) {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTERS, JSON.stringify(list));
  },
  getCashClosings(): CashClosingRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_CLOSINGS);
    if (!raw) {
      this.setCashClosings(DEFAULT_CASH_CLOSINGS);
      return DEFAULT_CASH_CLOSINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return DEFAULT_CASH_CLOSINGS;
    } catch (e) {
      return DEFAULT_CASH_CLOSINGS;
    }
  },
  setCashClosings(closings: CashClosingRecord[]) {
    localStorage.setItem(STORAGE_KEYS.CASH_CLOSINGS, JSON.stringify(closings));
  },
  saveCashClosing(closing: CashClosingRecord) {
    const closings = this.getCashClosings();
    closings.unshift(closing);
    this.setCashClosings(closings);
  },
  openCashRegister(amount: number, notes?: string): any {
    const u = this.getCurrentUser();
    const newRegId = Date.now();
    const newReg: CashRegister = {
      id: newRegId,
      user_id: u.id,
      user_name: u.name,
      status: 'open',
      opening_amount: amount,
      total_sales_cordobas: 0,
      cash_sales: 0,
      card_sales: 0,
      opened_at: new Date().toISOString(),
      notes: notes || 'Turno aperturado'
    };
    this.setCashRegister(newReg);

    const list = this.getCashRegisters();
    list.unshift({
      id: newRegId,
      user: u.name || 'Jairo',
      user_name: u.name || 'Jairo',
      opened_at: newReg.opened_at,
      closed_at: null,
      initial_cash: amount,
      opening_amount: amount,
      total_sales_cash: 0,
      current_cash: amount,
      final_cash: amount,
      status: 'open'
    });
    this.setCashRegisters(list);

    return this.getActiveCashRegister();
  },
  closeCashRegister(id: any, closingData?: any) {
    const current = this.getCashRegister();
    const closedTime = new Date().toISOString();
    const updated = {
      ...current,
      status: 'closed' as const,
      closed_at: closedTime,
      final_cash: closingData?.total_fisico_contado ?? current.opening_amount
    };
    this.setCashRegister(updated);

    const list = this.getCashRegisters();
    const idx = list.findIndex(r => String(r.id) === String(id) || String(r.id) === String(current.id));
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        status: 'closed',
        closed_at: closedTime,
        final_cash: closingData?.total_fisico_contado ?? list[idx].current_cash
      };
      this.setCashRegisters(list);
    }
  },
  saveCashRegister(cash: any) {
    this.setCashRegister(cash);
  },
  setCashRegister(cash: CashRegister) {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(cash));
  },

  // MOVEMENTS
  getMovements(): Movement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      this.setMovements(DEFAULT_MOVEMENTS);
      return DEFAULT_MOVEMENTS;
    }
    try { return JSON.parse(raw) || DEFAULT_MOVEMENTS; } catch (e) { return DEFAULT_MOVEMENTS; }
  },
  setMovements(movements: Movement[]) {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  },
  saveMovement(movement: any) {
    const movs = this.getMovements();
    movs.unshift(movement);
    this.setMovements(movs);
  },

  // CREDITS
  getCredits(): CreditAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDITS);
    if (!raw) {
      this.setCredits(DEFAULT_CREDITS);
      return DEFAULT_CREDITS;
    }
    try { return JSON.parse(raw) || DEFAULT_CREDITS; } catch (e) { return DEFAULT_CREDITS; }
  },
  setCredits(credits: CreditAccount[]) {
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));
  },
  saveCredit(credit: any) {
    const credits = this.getCredits();
    const idx = credits.findIndex(c => String(c.id) === String(credit.id));
    if (idx >= 0) credits[idx] = credit;
    else credits.unshift(credit);
    this.setCredits(credits);
  },

  // USERS
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.setUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    try { return JSON.parse(raw) || DEFAULT_USERS; } catch (e) { return DEFAULT_USERS; }
  },
  setUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  saveUser(user: any) {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(user.id));
    if (idx >= 0) users[idx] = user;
    else users.unshift(user);
    this.setUsers(users);
  },
  deleteUser(id: any) {
    const users = this.getUsers().filter(u => String(u.id) !== String(id));
    this.setUsers(users);
  },

  // SETTINGS
  getSettings(): CompanySetting {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.setSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },
  getCompanySettings(): any {
    return this.getSettings();
  },
  saveCompanySettings(settings: any) {
    this.setSettings(settings);
  },
  setSettings(settings: CompanySetting) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // AUTH
  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      const u = DEFAULT_USERS[0];
      this.setCurrentUser(u);
      return u;
    }
    try { return JSON.parse(raw) || DEFAULT_USERS[0]; } catch (e) { return DEFAULT_USERS[0]; }
  },
  setCurrentUser(user: User | null) {
    if (!user) localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    else localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // BACKUP EXPORT & IMPORT
  exportAllDataJSON(): string {
    return this.exportFullBackupJSON();
  },
  importAllDataJSON(jsonStr: string): boolean {
    return this.importFullBackupJSON(jsonStr);
  },
  resetMetricsDemo() {
    this.setProducts(DEFAULT_PRODUCTS);
    this.setCategories(DEFAULT_CATEGORIES);
    this.setSales(DEFAULT_SALES);
    this.setMovements(DEFAULT_MOVEMENTS);
  },
  resetAllData() {
    this.setProducts(DEFAULT_PRODUCTS);
    this.setCategories(DEFAULT_CATEGORIES);
    this.setCustomers(DEFAULT_CUSTOMERS);
    this.setSuppliers(DEFAULT_SUPPLIERS);
    this.setPurchases(DEFAULT_PURCHASES);
    this.setSales(DEFAULT_SALES);
    this.setCashRegister(DEFAULT_CASH);
    this.setMovements(DEFAULT_MOVEMENTS);
    this.setCredits(DEFAULT_CREDITS);
    this.setSettings(DEFAULT_SETTINGS);
    this.setUsers(DEFAULT_USERS);
  },

  exportFullBackupJSON(): string {
    const data = {
      version: '3.0',
      exported_at: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      purchases: this.getPurchases(),
      sales: this.getSales(),
      credits: this.getCredits(),
      movements: this.getMovements(),
      cash: this.getCashRegister(),
      settings: this.getSettings(),
      users: this.getUsers()
    };
    return JSON.stringify(data, null, 2);
  },

  importFullBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products) this.setProducts(data.products);
      if (data.categories) this.setCategories(data.categories);
      if (data.customers) this.setCustomers(data.customers);
      if (data.suppliers) this.setSuppliers(data.suppliers);
      if (data.purchases) this.setPurchases(data.purchases);
      if (data.sales) this.setSales(data.sales);
      if (data.credits) this.setCredits(data.credits);
      if (data.movements) this.setMovements(data.movements);
      if (data.cash) this.setCashRegister(data.cash);
      if (data.settings) this.setSettings(data.settings);
      if (data.users) this.setUsers(data.users);
      return true;
    } catch (e) {
      return false;
    }
  }
};

export function compressImageFile(file: File, maxWidth = 600, callback: (dataUrl: string) => void) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      const max = maxWidth;
      if (w > max || h > max) {
        if (w > h) {
          h = Math.round((h * max) / w);
          w = max;
        } else {
          w = Math.round((w * max) / h);
          h = max;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        callback(dataUrl);
      }
    };
    if (e.target?.result) {
      img.src = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}
