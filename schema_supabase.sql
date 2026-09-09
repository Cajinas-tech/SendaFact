-- ==============================================================================
-- BASE DE DATOS COMPLETA PARA SENDAFACT POS EN SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. TABLA DE USUARIOS Y ROLES (admin, cajero, vendedor)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'cajero',
    phone VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE SESIONES Y CACHÉ
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- 3. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100) DEFAULT 'folder',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    current_debt DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE PROVEEDORES
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    ruc VARCHAR(100) NULL,
    address TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) NULL,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NULL,
    description TEXT NULL,
    dimensions VARCHAR(100) NULL,
    measurements_spec VARCHAR(255) NULL,
    cost_price DECIMAL(12, 2) DEFAULT 0.00,
    price_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    price_usd DECIMAL(12, 2) DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    image_url VARCHAR(500) NULL,
    is_finished_good BOOLEAN DEFAULT TRUE,
    expiry_date DATE NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA DE CAJAS REGISTRADORAS
CREATE TABLE IF NOT EXISTS cash_registers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    opening_amount DECIMAL(12, 2) DEFAULT 0.00,
    closing_amount DECIMAL(12, 2) NULL,
    status VARCHAR(50) DEFAULT 'open',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id BIGINT NULL REFERENCES customers(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    cash_register_id BIGINT NULL REFERENCES cash_registers(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) DEFAULT 'efectivo',
    subtotal_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    tax_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    total_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    total_usd DECIMAL(12, 2) DEFAULT 0.00,
    margin_amount DECIMAL(12, 2) DEFAULT 0.00,
    margin_percentage DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA DE ITEMS DE VENTA
CREATE TABLE IF NOT EXISTS sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id BIGINT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    unit_price_usd DECIMAL(12, 2) DEFAULT 0.00,
    cost_price DECIMAL(12, 2) DEFAULT 0.00,
    total_cordobas DECIMAL(12, 2) DEFAULT 0.00,
    total_usd DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA DE CRÉDITOS Y CUENTAS POR COBRAR
CREATE TABLE IF NOT EXISTS credits (
    id BIGSERIAL PRIMARY KEY,
    credit_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sale_id BIGINT NULL REFERENCES sales(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(12, 2) DEFAULT 0.00,
    interest_rate_annual DECIMAL(5, 2) DEFAULT 3.00,
    fio_date DATE NULL,
    due_date DATE NULL,
    status VARCHAR(50) DEFAULT 'activo',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABLA DE ABONOS / PAGOS DE CRÉDITO
CREATE TABLE IF NOT EXISTS credit_payments (
    id BIGSERIAL PRIMARY KEY,
    credit_id BIGINT NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'efectivo',
    notes TEXT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABLA DE MOVIMIENTOS Y KARDEX
CREATE TABLE IF NOT EXISTS movements (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    product_id BIGINT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NULL,
    ticket_number VARCHAR(100) NULL,
    payment_method VARCHAR(50) NULL,
    quantity INTEGER DEFAULT 1,
    amount DECIMAL(12, 2) DEFAULT 0.00,
    cost DECIMAL(12, 2) DEFAULT 0.00,
    margin_amount DECIMAL(12, 2) DEFAULT 0.00,
    margin_percentage DECIMAL(5, 2) DEFAULT 0.00,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    customer_id BIGINT NULL REFERENCES customers(id) ON DELETE SET NULL,
    notes TEXT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. TABLA DE CONFIGURACIÓN GLOBAL
CREATE TABLE IF NOT EXISTS company_settings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'SENDA SISTEMAS',
    tagline VARCHAR(255) DEFAULT 'SISTEMA V3.0 (LARAVEL)',
    ruc VARCHAR(100) DEFAULT 'J0310000012345',
    phone VARCHAR(50) DEFAULT '+505 8888 8888',
    email VARCHAR(255) DEFAULT 'admin@sendasistemas.com',
    address TEXT DEFAULT 'Managua, Nicaragua',
    exchange_rate DECIMAL(10, 4) DEFAULT 36.8000,
    main_currency VARCHAR(10) DEFAULT 'C$',
    secondary_currency VARCHAR(10) DEFAULT 'USD',
    tax_rate DECIMAL(5, 2) DEFAULT 15.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- DATOS INICIALES (SEEDERS)
-- ==============================================================================

-- 1. Usuarios con sus 3 Roles
-- Administrador: admin@sendasistemas.com / admin123
-- Cajero: cajero@sendasistemas.com / cajero123
-- Vendedor: vendedor@sendasistemas.com / vendedor123

INSERT INTO users (id, name, email, role, phone, password, created_at, updated_at)
VALUES 
(1, 'Jairo', 'admin@sendasistemas.com', 'administrador', '+505 8888 1111', '$2y$12$e4dZJ0P0zU3k2k6fW0vQ3O8FmQ8y9jT4qA7B3X9kP0r1s2t3u4v5w', NOW(), NOW()),
(2, 'María Cajera', 'cajero@sendasistemas.com', 'cajero', '+505 8888 2222', '$2y$12$e4dZJ0P0zU3k2k6fW0vQ3O8FmQ8y9jT4qA7B3X9kP0r1s2t3u4v5w', NOW(), NOW()),
(3, 'Carlos Vendedor', 'vendedor@sendasistemas.com', 'vendedor', '+505 8888 3333', '$2y$12$e4dZJ0P0zU3k2k6fW0vQ3O8FmQ8y9jT4qA7B3X9kP0r1s2t3u4v5w', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 2. Configuración de Empresa
INSERT INTO company_settings (id, name, tagline, ruc, phone, email, address, exchange_rate, main_currency, secondary_currency, tax_rate)
VALUES (1, 'SENDA SISTEMAS', 'SISTEMA V3.0 (LARAVEL)', 'J0310000012345', '+505 8888 8888', 'admin@sendasistemas.com', 'Managua, Nicaragua', 36.8000, 'C$', 'USD', 15.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Categorías
INSERT INTO categories (id, name, slug, icon, description)
VALUES 
(1, 'PUERTAS', 'puertas', 'door-closed', 'Puertas de aluminio y vidrio'),
(2, 'VENTANAS', 'ventanas', 'app-window', 'Ventanas corredizas y panorámicas'),
(3, 'Lácteos', 'lacteos', 'milk', 'Productos lácteos y derivados'),
(4, 'Bebidas', 'bebidas', 'cup-soda', 'Refrescos y bebidas'),
(5, 'Ferretería', 'ferreteria', 'wrench', 'Materiales de construcción y herramientas')
ON CONFLICT (id) DO NOTHING;

-- 4. Clientes
INSERT INTO customers (id, name, phone, credit_limit, current_debt, address)
VALUES
(1, 'Eduardo Lopez', '444334405', 500.00, 39.38, 'Colonia Centro, Calle 4'),
(2, 'Residencial Las Colinas - Casa #42', '88776655', 2000.00, 0.00, 'Las Colinas'),
(3, 'Constructora El Progreso S.A.', '22554433', 10000.00, 0.00, 'Km 9 Carretera a Masaya'),
(4, 'Miguel Ángel Torres', '89901122', 300.00, 0.00, 'Bello Horizonte')
ON CONFLICT (id) DO NOTHING;

-- 5. Productos con Medidas y Moneda Dual
INSERT INTO products (id, category_id, sku, barcode, name, subtitle, description, dimensions, measurements_spec, cost_price, price_cordobas, price_usd, stock, min_stock, image_url, is_finished_good)
VALUES
(1, 1, '#SKU-9859', '740100019859', 'PUERTA DE ALUMINIO-VIDRIO', 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44', 'Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes.', '2.10 m', '210X80X4.44 CM', 2200.00, 3500.00, 95.11, 10, 2, '/images/products/puerta-aluminio.svg', true),
(2, 2, '#SKU-5640', '740100015640', 'VENTANA ALUMINIO-VIDRIO', 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM', 'Ficha técnica de ventana corrediza de doble hoja con perfiles de alta resistencia.', '1.80 m', '1.80 LARGO X 1.20 ALTO X 5.71 CM', 5000.00, 8000.00, 217.39, 10, 2, '/images/products/ventana-aluminio.svg', true),
(3, 3, 'YOG001', '740100020001', 'Yogurt Natural', 'Lácteos • SKU: YOG001', 'Yogurt probiótico sin azúcar 500ml', '500 ml', '500ml', 25.00, 40.00, 1.09, 4, 8, NULL, true),
(4, 3, 'ESK002', '740100020002', 'LECHE ESKIMO', 'Lácteos • Tetrapack 1L', 'Leche entera pasteurizada 1 Litro', '1 L', '1000ml', 30.00, 45.00, 1.22, 18, 5, NULL, true),
(5, 4, 'SAB-001', '740100030001', 'Papas Picantes Sabritas 45 g', 'Snacks & Botanas 45g', 'Papas fritas con chile y limón', '45 g', '45g', 12.00, 20.00, 0.54, 50, 10, NULL, true),
(6, 5, 'FOC-001', '740100040001', 'Detergente Líquido FOCA 1 L', 'Limpieza & Hogar', 'Detergente concentrado 1L', '1 L', '1000ml', 30.00, 45.00, 1.22, 25, 5, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Caja Abierta
INSERT INTO cash_registers (id, user_id, opening_amount, status, opened_at, notes)
VALUES (1, 1, 1000.00, 'open', NOW(), 'Apertura de turno matutino')
ON CONFLICT (id) DO NOTHING;

-- 7. Crédito Activo (#FERR-V-0028 para Eduardo Lopez)
INSERT INTO credits (id, credit_code, customer_id, total_amount, paid_amount, remaining_amount, interest_rate_annual, fio_date, due_date, status, notes)
VALUES (1, 'FERR-V-0028', 1, 139.37, 99.99, 39.38, 3.00, CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '14 days', 'activo', 'Vence en 14 días. Si no abona nada, deberá $39.43')
ON CONFLICT (id) DO NOTHING;

-- 8. Movimientos Iniciales
INSERT INTO movements (id, type, product_name, ticket_number, payment_method, quantity, amount, cost, margin_amount, margin_percentage, user_id, customer_id, movement_date)
VALUES 
(1, 'venta', 'Papas Picantes Sabritas 45 g', 'NOVA-V-0005', 'EFECTIVO', 1, 20.00, 12.00, 8.00, 40.00, 1, 4, NOW() - INTERVAL '1 hour'),
(2, 'venta', 'Papas Picantes Sabritas 45 g', 'NOVA-V-0004', 'EFECTIVO', 1, 20.00, 12.00, 8.00, 40.00, 1, 4, NOW() - INTERVAL '3 hours'),
(3, 'venta', '2 productos (Snacks y Bebida)', 'NOVA-V-0003', 'EFECTIVO', 2, 35.00, 20.00, 15.00, 42.90, 1, 4, NOW() - INTERVAL '4 hours'),
(4, 'venta', '2 productos (Aluminio y Accesorios)', 'NOVA-V-0002', 'EFECTIVO', 2, 60.00, 38.00, 22.00, 36.70, 1, 4, NOW() - INTERVAL '5 hours'),
(5, 'venta', 'Detergente Líquido FOCA 1 L', 'NOVA-V-0001', 'EFECTIVO', 1, 45.00, 30.00, 15.00, 33.30, 1, 4, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Reiniciar secuencias de auto-incremento para evitar conflictos
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('cash_registers_id_seq', (SELECT MAX(id) FROM cash_registers));
SELECT setval('credits_id_seq', (SELECT MAX(id) FROM credits));
SELECT setval('movements_id_seq', (SELECT MAX(id) FROM movements));