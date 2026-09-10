import { Product, Category, Customer, Sale, CashRegister, Movement, CreditAccount, User, CompanySetting } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'sendafact_products_v3',
  CATEGORIES: 'sendafact_categories_v3',
  CUSTOMERS: 'sendafact_customers_v3',
  SALES: 'sendafact_sales_v3',
  CASH_REGISTER: 'sendafact_cash_v3',
  CASH_REGISTERS: 'sendafact_cash_registers_list_v3',
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
    status: 'active',
    expiry_date: '2026-09-05',
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
    status: 'active',
    expiry_date: '2026-09-05',
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
    dimensions: '1 Litro',
    cost_price: 25.00,
    price_cordobas: 40.00,
    price_usd: 1.09,
    stock: 24,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    status: 'active',
    expiry_date: '2026-10-15',
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
    dimensions: '1 Litro',
    cost_price: 30.00,
    price_cordobas: 45.00,
    price_usd: 1.22,
    stock: 18,
    min_stock: 5,
    image_url: null,
    is_finished_good: true,
    status: 'active',
    expiry_date: '2026-10-20',
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
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Eduardo López', document_number: '001-010190-0001A', phone: '444334405', email: 'eduardo@gmail.com', address: 'Colonia Centro, Calle 4', credit_limit: 5000.00, current_debt: 1450.00, sales_count: 3, credits_count: 1 },
  { id: 2, name: 'Residencial Las Colinas - Casa #42', document_number: 'J031000004444', phone: '88776655', email: 'colinas@gmail.com', address: 'Las Colinas, Managua', credit_limit: 20000.00, current_debt: 0.00, sales_count: 1, credits_count: 0 },
  { id: 3, name: 'Constructora El Progreso S.A.', document_number: 'J031000005555', phone: '22554433', email: 'progresosa@gmail.com', address: 'Km 9 Carretera a Masaya', credit_limit: 50000.00, current_debt: 0.00, sales_count: 4, credits_count: 0 },
  { id: 4, name: 'Cliente Ocasional / General', document_number: '000-000000-0000X', phone: '+505 8888 8888', email: 'cliente@general.com', address: 'Managua', credit_limit: 0.00, current_debt: 0.00, sales_count: 12, credits_count: 0 },
];

const DEFAULT_SETTINGS: CompanySetting = {
  id: 1,
  name: 'SENDA SISTEMAS',
  logo: '',
  ruc: 'J0310000012345',
  phone: '+505 8888 8888',
  email: 'contacto@sendasistemas.com',
  address: 'Managua, Nicaragua',
  exchange_rate: 36.80,
  main_currency: 'C$',
  secondary_currency: 'USD'
};

const DEFAULT_USERS: User[] = [
  { id: 1, name: 'Jairo Cajina (Admin)', email: 'jairotten84@gmail.com', role: 'admin', phone: '+505 8888 0001', status: 'active', created_at: '2026-09-01' },
  { id: 2, name: 'Administrador Senda', email: 'admin@sendasistemas.com', role: 'admin', phone: '+505 8888 0001', status: 'active', created_at: '2026-09-01' },
  { id: 3, name: 'Cajero Principal', email: 'caja@sendasistemas.com', role: 'cajero', phone: '+505 8888 0002', status: 'active', created_at: '2026-09-02' },
  { id: 4, name: 'Vendedor Sala de Ventas', email: 'ventas@sendasistemas.com', role: 'vendedor', phone: '+505 8888 0003', status: 'active', created_at: '2026-09-03' },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 1,
    ticket_number: 'NOVA-V-1001',
    customer_id: 1,
    customer: DEFAULT_CUSTOMERS[0],
    user_name: 'Jairo Cajina',
    payment_method: 'efectivo',
    total_cordobas: 3500.00,
    total_usd: 95.11,
    status: 'completed',
    items: [
      { product_name: 'PUERTA DE ALUMINIO-VIDRIO', quantity: 1, unit_price_cordobas: 3500.00, total_cordobas: 3500.00 }
    ],
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    ticket_number: 'NOVA-V-1002',
    customer_id: 4,
    customer: DEFAULT_CUSTOMERS[3],
    user_name: 'Cajero Principal',
    payment_method: 'tarjeta',
    total_cordobas: 8000.00,
    total_usd: 217.39,
    status: 'completed',
    items: [
      { product_name: 'VENTANA ALUMINIO-VIDRIO', quantity: 1, unit_price_cordobas: 8000.00, total_cordobas: 8000.00 }
    ],
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const DEFAULT_CASH: CashRegister = {
  id: 1,
  user_id: 1,
  user_name: 'Jairo Cajina',
  status: 'open',
  opening_amount: 1000.00,
  total_sales_cordobas: 11500.00,
  cash_sales: 3500.00,
  card_sales: 8000.00,
  opened_at: new Date(Date.now() - 28800000).toISOString(),
  notes: 'Turno matutino aperturado correctamente'
};

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
  }
];

const DEFAULT_MOVEMENTS: Movement[] = [
  { id: 1, product_id: 1, product_name: 'PUERTA DE ALUMINIO-VIDRIO', sku: '#SKU-9859', type: 'in', quantity: 10, previous_stock: 0, new_stock: 10, reason: 'Inventario Inicial', user_name: 'Admin', created_at: '2026-09-01' },
  { id: 2, product_id: 2, product_name: 'VENTANA ALUMINIO-VIDRIO', sku: '#SKU-5640', type: 'in', quantity: 10, previous_stock: 0, new_stock: 10, reason: 'Inventario Inicial', user_name: 'Admin', created_at: '2026-09-01' },
  { id: 3, product_id: 1, product_name: 'PUERTA DE ALUMINIO-VIDRIO', sku: '#SKU-9859', type: 'out', quantity: 1, previous_stock: 11, new_stock: 10, reason: 'Venta #NOVA-V-1001', user_name: 'Jairo Cajina', created_at: '2026-09-09' },
];

export const storage = {
  // PRODUCTS
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.setProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    try { return JSON.parse(raw) || DEFAULT_PRODUCTS; } catch (e) { return DEFAULT_PRODUCTS; }
  },
  setProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  saveProduct(product: Product) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      prods[idx] = product;
    } else {
      prods.unshift(product);
    }
    this.setProducts(prods);
  },
  deleteProduct(id: number) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.setProducts(prods);
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
    try { return JSON.parse(raw) || DEFAULT_CUSTOMERS; } catch (e) { return DEFAULT_CUSTOMERS; }
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

  // SALES
  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      this.setSales(DEFAULT_SALES);
      return DEFAULT_SALES;
    }
    try { return JSON.parse(raw) || DEFAULT_SALES; } catch (e) { return DEFAULT_SALES; }
  },
  setSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
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
    const current = this.getCashRegister();
    return [
      {
        ...current,
        user: current.user_name || 'Jairo Cajina',
        current_cash: current.opening_amount + (current.cash_sales || 0),
        initial_cash: current.opening_amount || 1000,
        total_sales_cash: current.cash_sales || 0
      }
    ];
  },
  openCashRegister(amount: number, notes?: string): any {
    const u = this.getCurrentUser();
    const newReg: CashRegister = {
      id: Date.now(),
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
    return this.getActiveCashRegister();
  },
  closeCashRegister(id: any) {
    const current = this.getCashRegister();
    const updated = {
      ...current,
      status: 'closed' as const,
      closed_at: new Date().toISOString()
    };
    this.setCashRegister(updated);
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
    try { return JSON.parse(raw) || DEFAULT_SETTINGS; } catch (e) { return DEFAULT_SETTINGS; }
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
  resetAllData() {
    this.setProducts(DEFAULT_PRODUCTS);
    this.setCategories(DEFAULT_CATEGORIES);
    this.setCustomers(DEFAULT_CUSTOMERS);
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
