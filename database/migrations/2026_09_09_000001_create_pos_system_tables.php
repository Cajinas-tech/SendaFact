<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Categorías
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable()->default('folder');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Clientes
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->decimal('current_debt', 12, 2)->default(0);
            $table->timestamps();
        });

        // 3. Proveedores
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('ruc')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });

        // 4. Productos
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->index();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('dimensions')->nullable();
            $table->string('measurements_spec')->nullable();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('price_cordobas', 12, 2)->default(0);
            $table->decimal('price_usd', 12, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->string('image_url')->nullable();
            $table->boolean('is_finished_good')->default(true);
            $table->date('expiry_date')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 5. Cajas Registradoras
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('opening_amount', 12, 2)->default(0);
            $table->decimal('closing_amount', 12, 2)->nullable();
            $table->string('status')->default('open');
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Ventas
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('cash_register_id')->nullable()->constrained('cash_registers')->nullOnDelete();
            $table->string('payment_method')->default('efectivo');
            $table->decimal('subtotal_cordobas', 12, 2)->default(0);
            $table->decimal('tax_cordobas', 12, 2)->default(0);
            $table->decimal('total_cordobas', 12, 2)->default(0);
            $table->decimal('total_usd', 12, 2)->default(0);
            $table->decimal('margin_amount', 12, 2)->default(0);
            $table->decimal('margin_percentage', 5, 2)->default(0);
            $table->string('status')->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Items de Venta
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price_cordobas', 12, 2)->default(0);
            $table->decimal('unit_price_usd', 12, 2)->default(0);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('total_cordobas', 12, 2)->default(0);
            $table->decimal('total_usd', 12, 2)->default(0);
            $table->timestamps();
        });

        // 8. Créditos
        Schema::create('credits', function (Blueprint $table) {
            $table->id();
            $table->string('credit_code')->unique();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2)->default(0);
            $table->decimal('interest_rate_annual', 5, 2)->default(3.00);
            $table->date('fio_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status')->default('activo');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 9. Pagos/Abonos de Crédito
        Schema::create('credit_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_id')->constrained('credits')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('efectivo');
            $table->text('notes')->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->timestamps();
        });

        // 10. Cotizaciones y Proformas
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_code')->unique();
            $table->string('customer_name');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->integer('items_count')->default(1);
            $table->decimal('total_cordobas', 12, 2)->default(0);
            $table->decimal('total_usd', 12, 2)->default(0);
            $table->string('status')->default('aprobada');
            $table->text('description')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamps();
        });

        // 11. Movimientos Financieros & Kardex
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('ticket_number')->nullable();
            $table->string('payment_method')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('cost', 12, 2)->default(0);
            $table->decimal('margin_amount', 12, 2)->default(0);
            $table->decimal('margin_percentage', 5, 2)->default(0);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('movement_date')->useCurrent();
            $table->timestamps();
        });

        // 12. Configuración Global de Empresa
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('SENDA SISTEMAS');
            $table->string('tagline')->default('SISTEMA V3.0');
            $table->string('ruc')->default('J0310000012345');
            $table->string('phone')->default('+505 8888 8888');
            $table->string('email')->default('contacto@sendasistemas.com');
            $table->string('address')->default('Managua, Nicaragua');
            $table->decimal('exchange_rate', 10, 4)->default(36.8000);
            $table->string('main_currency')->default('NIO');
            $table->string('secondary_currency')->default('USD');
            $table->decimal('tax_rate', 5, 2)->default(15.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
        Schema::dropIfExists('movements');
        Schema::dropIfExists('quotes');
        Schema::dropIfExists('credit_payments');
        Schema::dropIfExists('credits');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('cash_registers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('categories');
    }
};