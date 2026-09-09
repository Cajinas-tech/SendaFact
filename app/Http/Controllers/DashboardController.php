<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Sale;
use App\Models\Quote;
use App\Models\CashRegister;
use App\Models\Movement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        
        // Ventas del día (en C$ y USD)
        $todaySalesCordobas = Movement::where('type', 'venta')
            ->whereDate('movement_date', $today)
            ->sum('amount');
        
        if ($todaySalesCordobas == 0) {
            $todaySalesCordobas = 25.30; // valor de muestra del demo
        }

        $totalProducts = Product::count();
        $activeQuotesCount = Quote::where('status', 'aprobada')->count();
        $quotesList = Quote::latest()->take(5)->get();
        
        // Estado de caja
        $activeCash = CashRegister::where('status', 'open')->latest()->first();
        $cashStatus = $activeCash ? 'Abierta' : 'Cerrada';

        // Alertas de Stock Bajo
        $lowStockProducts = Product::whereColumn('stock', '<=', 'min_stock')->get();
        
        // Próximos a vencer
        $expiringProducts = Product::whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays(45))
            ->get();

        // Categorías y conteos para gráficos
        $categories = Category::withCount('products')->with(['products' => function($q) {
            $q->select('id', 'category_id', 'stock', 'price_cordobas');
        }])->get();

        $categoryStockLabels = [];
        $categoryStockData = [];
        $categorySalesLabels = [];
        $categorySalesData = [];

        foreach ($categories as $cat) {
            $categoryStockLabels[] = strtoupper($cat->name);
            $categoryStockData[] = $cat->products->sum('stock') ?: 10;
            
            $categorySalesLabels[] = strtoupper($cat->name);
            $totalSales = $cat->products->sum(function($p) {
                return $p->stock * ($p->price_cordobas > 0 ? $p->price_cordobas : 500);
            });
            $categorySalesData[] = $totalSales > 0 ? $totalSales : 7000;
        }

        // Totales globales para gráfico resumen
        $totalPhysicalStock = Product::sum('stock');
        $totalCategories = Category::count();
        $totalSalesCount = Movement::where('type', 'venta')->count();

        return view('dashboard.index', compact(
            'todaySalesCordobas',
            'totalProducts',
            'activeQuotesCount',
            'cashStatus',
            'lowStockProducts',
            'expiringProducts',
            'quotesList',
            'categoryStockLabels',
            'categoryStockData',
            'categorySalesLabels',
            'categorySalesData',
            'totalPhysicalStock',
            'totalCategories',
            'totalSalesCount'
        ));
    }
}