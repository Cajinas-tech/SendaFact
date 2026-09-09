<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Credit;
use App\Models\CreditPayment;
use App\Models\Quote;
use App\Models\Movement;
use App\Models\CompanySetting;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Usuarios con diferentes Roles
        $admin = User::firstOrCreate(
            ['email' => 'admin@sendasistemas.com'],
            [
                'name' => 'Jairo',
                'password' => Hash::make('admin123'),
                'role' => 'administrador',
                'phone' => '+505 8888 1111',
            ]
        );

        $cashier = User::firstOrCreate(
            ['email' => 'cajero@sendasistemas.com'],
            [
                'name' => 'María Cajera',
                'password' => Hash::make('cajero123'),
                'role' => 'cajero',
                'phone' => '+505 8888 2222',
            ]
        );

        $seller = User::firstOrCreate(
            ['email' => 'vendedor@sendasistemas.com'],
            [
                'name' => 'Carlos Vendedor',
                'password' => Hash::make('vendedor123'),
                'role' => 'vendedor',
                'phone' => '+505 8888 3333',
            ]
        );

        // 2. Configuración del Sistema
        CompanySetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'SENDA SISTEMAS',
                'tagline' => 'SISTEMA V3.0 (LARAVEL)',
                'ruc' => 'J0310000012345',
                'phone' => '+505 8888 8888',
                'email' => 'admin@sendasistemas.com',
                'address' => 'Managua, Nicaragua',
                'exchange_rate' => 36.8000,
                'main_currency' => 'C$',
                'secondary_currency' => 'USD',
                'tax_rate' => 15.00
            ]
        );

        // 3. Categorías
        $catPuertas = Category::firstOrCreate(['slug' => 'puertas'], ['name' => 'PUERTAS', 'icon' => 'door-closed', 'description' => 'Puertas de aluminio y vidrio']);
        $catVentanas = Category::firstOrCreate(['slug' => 'ventanas'], ['name' => 'VENTANAS', 'icon' => 'app-window', 'description' => 'Ventanas panorámicas y corredizas']);
        $catLacteos = Category::firstOrCreate(['slug' => 'lacteos'], ['name' => 'Lácteos', 'icon' => 'milk', 'description' => 'Productos lácteos y derivados']);
        $catBebidas = Category::firstOrCreate(['slug' => 'bebidas'], ['name' => 'Bebidas', 'icon' => 'cup-soda', 'description' => 'Refrescos y bebidas']);
        $catFerreteria = Category::firstOrCreate(['slug' => 'ferreteria'], ['name' => 'Ferretería', 'icon' => 'wrench', 'description' => 'Materiales de construcción y herramientas']);

        // 4. Clientes
        $c1 = Customer::firstOrCreate(['name' => 'Eduardo Lopez'], ['phone' => '444334405', 'credit_limit' => 500.00, 'current_debt' => 39.38, 'address' => 'Colonia Centro, Calle 4']);
        $c2 = Customer::firstOrCreate(['name' => 'Residencial Las Colinas - Casa #42'], ['phone' => '88776655', 'credit_limit' => 2000.00, 'current_debt' => 0, 'address' => 'Las Colinas']);
        $c3 = Customer::firstOrCreate(['name' => 'Constructora El Progreso S.A.'], ['phone' => '22554433', 'credit_limit' => 10000.00, 'current_debt' => 0, 'address' => 'Km 9 Carretera a Masaya']);
        $c4 = Customer::firstOrCreate(['name' => 'Miguel Ángel Torres'], ['phone' => '89901122', 'credit_limit' => 300.00, 'current_debt' => 0, 'address' => 'Bello Horizonte']);

        // 5. Proveedores
        Supplier::firstOrCreate(['name' => 'Aluminios de Nicaragua S.A.'], ['contact_person' => 'Carlos Mendoza', 'phone' => '22441100', 'email' => 'ventas@alumnic.com', 'ruc' => 'J0310000099999']);
        Supplier::firstOrCreate(['name' => 'Distribuidora Láctea Central'], ['contact_person' => 'María Gutiérrez', 'phone' => '22668899', 'email' => 'pedidos@dlactea.com', 'ruc' => 'J0310000088888']);

        // 6. Productos
        $p1 = Product::firstOrCreate(
            ['sku' => '#SKU-9859'],
            [
                'category_id' => $catPuertas->id,
                'barcode' => '740100019859',
                'name' => 'PUERTA DE ALUMINIO-VIDRIO',
                'subtitle' => 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44',
                'description' => 'Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes.',
                'dimensions' => '2.10 m',
                'measurements_spec' => '210X80X4.44 CM',
                'cost_price' => 2200.00,
                'price_cordobas' => 3500.00,
                'price_usd' => 95.11,
                'stock' => 10,
                'min_stock' => 2,
                'image_url' => '/images/products/puerta-aluminio.svg',
                'is_finished_good' => true,
            ]
        );

        $p2 = Product::firstOrCreate(
            ['sku' => '#SKU-5640'],
            [
                'category_id' => $catVentanas->id,
                'barcode' => '740100015640',
                'name' => 'VENTANA ALUMINIO-VIDRIO',
                'subtitle' => 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM',
                'description' => 'Ficha técnica de ventana corrediza de doble hoja con perfiles de alta resistencia.',
                'dimensions' => '1.80 m',
                'measurements_spec' => '1.80 LARGO X 1.20 ALTO X 5.71 CM',
                'cost_price' => 5000.00,
                'price_cordobas' => 8000.00,
                'price_usd' => 217.39,
                'stock' => 10,
                'min_stock' => 2,
                'image_url' => '/images/products/ventana-aluminio.svg',
                'is_finished_good' => true,
            ]
        );

        $p3 = Product::firstOrCreate(
            ['sku' => 'YOG001'],
            [
                'category_id' => $catLacteos->id,
                'barcode' => '740100020001',
                'name' => 'Yogurt Natural',
                'subtitle' => 'Lácteos • SKU: YOG001',
                'description' => 'Yogurt probiótico sin azúcar añadida 500ml',
                'dimensions' => '500 ml',
                'cost_price' => 25.00,
                'price_cordobas' => 40.00,
                'price_usd' => 1.09,
                'stock' => 4, // Stock bajo
                'min_stock' => 8,
                'expiry_date' => Carbon::now()->addDays(40),
                'is_finished_good' => true,
            ]
        );

        $p4 = Product::firstOrCreate(
            ['sku' => 'ESK002'],
            [
                'category_id' => $catLacteos->id,
                'barcode' => '740100020002',
                'name' => 'LECHE ESKIMO',
                'subtitle' => 'Lácteos • Tetrapack 1L',
                'description' => 'Leche entera pasteurizada 1 Litro',
                'cost_price' => 30.00,
                'price_cordobas' => 45.00,
                'price_usd' => 1.22,
                'stock' => 18,
                'min_stock' => 5,
                'is_finished_good' => true,
            ]
        );

        $p5 = Product::firstOrCreate(
            ['sku' => 'SAB-001'],
            [
                'category_id' => $catBebidas->id,
                'barcode' => '740100030001',
                'name' => 'Papas Picantes Sabritas 45 g',
                'subtitle' => 'Snacks & Botanas 45g',
                'description' => 'Papas fritas con chile y limón',
                'cost_price' => 12.00,
                'price_cordobas' => 20.00,
                'price_usd' => 0.54,
                'stock' => 50,
                'min_stock' => 10,
                'is_finished_good' => true,
            ]
        );

        $p6 = Product::firstOrCreate(
            ['sku' => 'FOC-001'],
            [
                'category_id' => $catFerreteria->id,
                'barcode' => '740100040001',
                'name' => 'Detergente Líquido FOCA 1 L',
                'subtitle' => 'Limpieza & Hogar',
                'cost_price' => 30.00,
                'price_cordobas' => 45.00,
                'price_usd' => 1.22,
                'stock' => 25,
                'min_stock' => 5,
                'is_finished_good' => true,
            ]
        );

        // Productos de ferretería para crédito fiado
        $pF1 = Product::firstOrCreate(['sku' => 'RON-001'], ['category_id' => $catFerreteria->id, 'name' => 'Rondana plana 1/4 pulg', 'cost_price' => 0.40, 'price_cordobas' => 27.60, 'price_usd' => 0.75, 'stock' => 100]);
        $pF2 = Product::firstOrCreate(['sku' => 'TOR-001'], ['category_id' => $catFerreteria->id, 'name' => 'Tornillo pija punta broca 1 pulg', 'cost_price' => 1.00, 'price_cordobas' => 66.24, 'price_usd' => 1.80, 'stock' => 150]);
        $pF3 = Product::firstOrCreate(['sku' => 'CAB-001'], ['category_id' => $catFerreteria->id, 'name' => 'Cable THW calibre 12', 'cost_price' => 10.00, 'price_cordobas' => 662.40, 'price_usd' => 18.00, 'stock' => 80]);
        $pF4 = Product::firstOrCreate(['sku' => 'ARE-001'], ['category_id' => $catFerreteria->id, 'name' => 'Arena cribada en bolsa', 'cost_price' => 30.00, 'price_cordobas' => 1766.40, 'price_usd' => 48.00, 'stock' => 40]);

        // 7. Caja Registradora abierta
        $cash = CashRegister::firstOrCreate(
            ['status' => 'open'],
            [
                'user_id' => $admin->id,
                'opening_amount' => 1000.00,
                'opened_at' => Carbon::now()->startOfDay(),
                'notes' => 'Apertura de turno matutino'
            ]
        );

        // 8. Cotizaciones
        Quote::firstOrCreate(
            ['quote_code' => 'COT-2026-0002'],
            [
                'customer_name' => 'Residencial Las Colinas - Casa #42',
                'customer_id' => $c2->id,
                'items_count' => 1,
                'total_cordobas' => 3910.00,
                'total_usd' => 106.25,
                'status' => 'aprobada',
                'created_at' => Carbon::parse('2026-09-01 16:30:00'),
            ]
        );

        Quote::firstOrCreate(
            ['quote_code' => 'COT-2026-0003'],
            [
                'customer_name' => 'Constructora El Progreso S.A.',
                'customer_id' => $c3->id,
                'items_count' => 4,
                'total_cordobas' => 24500.00,
                'total_usd' => 665.76,
                'status' => 'aprobada',
                'created_at' => Carbon::parse('2026-09-05 10:15:00'),
            ]
        );

        // 9. Crédito / Cuentas por cobrar estilo Ontaz (Eduardo Lopez)
        $credit = Credit::firstOrCreate(
            ['credit_code' => 'FERR-V-0028'],
            [
                'customer_id' => $c1->id,
                'total_amount' => 139.37, // USD
                'paid_amount' => 99.99,
                'remaining_amount' => 39.38,
                'interest_rate_annual' => 3.00,
                'fio_date' => Carbon::parse('2026-08-28'),
                'due_date' => Carbon::parse('2026-09-11'),
                'status' => 'activo',
                'notes' => 'Vence en 14 días. Si no abona nada, el 11 de sep, 2026 deberá $39.43'
            ]
        );

        // Abonos anteriores
        CreditPayment::firstOrCreate(
            ['credit_id' => $credit->id, 'amount' => 99.99],
            [
                'user_id' => $admin->id,
                'payment_method' => 'efectivo',
                'payment_date' => Carbon::parse('2026-09-02 14:00:00'),
                'notes' => 'Abono parcial en efectivo'
            ]
        );

        // 10. Movimientos y Ventas (Imagen 5)
        $movementsData = [
            ['type' => 'venta', 'product_name' => 'Papas Picantes Sabritas 45 g', 'ticket' => 'NOVA-V-0005', 'method' => 'EFECTIVO', 'qty' => 1, 'amount' => 20.00, 'cost' => 12.00, 'margin' => 8.00, 'pct' => 40.0, 'time' => '19:27:00'],
            ['type' => 'venta', 'product_name' => 'Papas Picantes Sabritas 45 g', 'ticket' => 'NOVA-V-0004', 'method' => 'EFECTIVO', 'qty' => 1, 'amount' => 20.00, 'cost' => 12.00, 'margin' => 8.00, 'pct' => 40.0, 'time' => '15:29:00'],
            ['type' => 'venta', 'product_name' => '2 productos (Snacks y Bebida)', 'ticket' => 'NOVA-V-0003', 'method' => 'EFECTIVO', 'qty' => 2, 'amount' => 35.00, 'cost' => 20.00, 'margin' => 15.00, 'pct' => 42.9, 'time' => '15:29:00'],
            ['type' => 'venta', 'product_name' => '2 productos (Aluminio y Accesorios)', 'ticket' => 'NOVA-V-0002', 'method' => 'EFECTIVO', 'qty' => 2, 'amount' => 60.00, 'cost' => 38.00, 'margin' => 22.00, 'pct' => 36.7, 'time' => '15:18:00'],
            ['type' => 'venta', 'product_name' => 'Detergente Líquido FOCA 1 L', 'ticket' => 'NOVA-V-0001', 'method' => 'EFECTIVO', 'qty' => 1, 'amount' => 45.00, 'cost' => 30.00, 'margin' => 15.00, 'pct' => 33.3, 'time' => '15:17:00'],
        ];

        foreach ($movementsData as $m) {
            Movement::firstOrCreate(
                ['ticket_number' => $m['ticket']],
                [
                    'type' => $m['type'],
                    'product_name' => $m['product_name'],
                    'payment_method' => $m['method'],
                    'quantity' => $m['qty'],
                    'amount' => $m['amount'],
                    'cost' => $m['cost'],
                    'margin_amount' => $m['margin'],
                    'margin_percentage' => $m['pct'],
                    'user_id' => $admin->id,
                    'customer_id' => $c4->id,
                    'movement_date' => Carbon::createFromTimeString($m['time']),
                ]
            );
        }
    }
}