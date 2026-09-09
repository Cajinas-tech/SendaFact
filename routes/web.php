<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SettingController;
use App\Http\Middleware\SendaAuth;

// Autenticación (Login & Logout)
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/logout', [AuthController::class, 'logout']);

// Rutas protegidas del Sistema SendaFact con Middleware de Sesión Dedicado
Route::middleware([SendaAuth::class])->group(function () {
    
    // Panel Central / Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Catálogo Digital de Productos (Fichas)
    Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('/catalogo/pdf', [CatalogController::class, 'pdf'])->name('catalog.pdf');

    // Ventas (POS)
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/store', [PosController::class, 'store'])->name('pos.store');
    Route::get('/pos/ticket/{id}', [PosController::class, 'ticket'])->name('pos.ticket');

    // Gestión de Productos e Inventario
    Route::resource('productos', ProductController::class)->names('products');

    // Movimientos / Ganancias & Pérdidas
    Route::get('/movimientos', [MovementController::class, 'index'])->name('movements.index');
    Route::get('/movimientos/export-csv', [MovementController::class, 'exportCsv'])->name('movements.export');

    // Créditos y Cuentas por Cobrar
    Route::get('/creditos', [CreditController::class, 'index'])->name('credits.index');
    Route::get('/creditos/{id}', [CreditController::class, 'show'])->name('credits.show');
    Route::post('/creditos/{id}/abono', [CreditController::class, 'pay'])->name('credits.pay');

    // Control de Caja
    Route::get('/caja', [CashRegisterController::class, 'index'])->name('cash.index');
    Route::post('/caja/abrir', [CashRegisterController::class, 'open'])->name('cash.open');
    Route::post('/caja/{id}/cerrar', [CashRegisterController::class, 'close'])->name('cash.close');

    // Clientes
    Route::get('/clientes', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/clientes', [CustomerController::class, 'store'])->name('customers.store');

    // Gestión de Usuarios y Roles (Administrador, Cajero, Vendedor)
    Route::resource('usuarios', UserController::class)->names('users');

    // Ajustes del Sistema y Conexión Supabase
    Route::get('/ajustes', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/ajustes', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/ajustes/test-supabase', [SettingController::class, 'testSupabase'])->name('settings.test-supabase');

    // Módulos Complementarios del Menú Senda
    Route::get('/backup', function() { return view('modules.backup'); })->name('backup.index');
    Route::get('/categorias', function() { return redirect()->route('products.index'); })->name('categories.index');
});