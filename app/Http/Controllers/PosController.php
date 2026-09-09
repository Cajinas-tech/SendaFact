<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Movement;
use App\Models\CashRegister;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PosController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->where('status', 'active')->where('stock', '>', 0)->get();
        $categories = Category::all();
        $customers = Customer::orderBy('name')->get();
        $setting = CompanySetting::first();
        $activeCash = CashRegister::where('status', 'open')->latest()->first();

        return view('pos.index', compact('products', 'categories', 'customers', 'setting', 'activeCash'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'customer_id' => 'nullable|exists:customers,id',
            'amount_received' => 'nullable|numeric',
        ]);

        $setting = CompanySetting::first();
        $exchangeRate = $setting ? $setting->exchange_rate : 36.80;

        return DB::transaction(function () use ($request, $exchangeRate) {
            $user = auth()->user() ?? \App\Models\User::first();
            $cash = CashRegister::where('status', 'open')->latest()->first();
            
            // Generar número de ticket
            $nextId = Sale::count() + 1;
            $ticketNumber = 'NOVA-V-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

            $subtotalCordobas = 0;
            $totalCostCordobas = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                if ($product) {
                    $qty = intval($item['quantity']);
                    $unitPriceC = floatval($product->price_cordobas);
                    $unitPriceUsd = floatval($product->price_usd);
                    $costC = floatval($product->cost_price);
                    
                    $totalLineC = $unitPriceC * $qty;
                    $totalLineUsd = $unitPriceUsd * $qty;
                    
                    $subtotalCordobas += $totalLineC;
                    $totalCostCordobas += ($costC * $qty);

                    // Reducir stock
                    $product->decrement('stock', $qty);

                    $itemsData[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $qty,
                        'unit_price_cordobas' => $unitPriceC,
                        'unit_price_usd' => $unitPriceUsd,
                        'cost_price' => $costC,
                        'total_cordobas' => $totalLineC,
                        'total_usd' => $totalLineUsd,
                    ];
                }
            }

            $totalCordobas = $subtotalCordobas;
            $totalUsd = $totalCordobas / $exchangeRate;
            $marginAmount = $totalCordobas - $totalCostCordobas;
            $marginPct = $totalCordobas > 0 ? ($marginAmount / $totalCordobas) * 100 : 0;

            $sale = Sale::create([
                'ticket_number' => $ticketNumber,
                'customer_id' => $request->customer_id,
                'user_id' => $user->id,
                'cash_register_id' => $cash ? $cash->id : null,
                'payment_method' => $request->payment_method,
                'subtotal_cordobas' => $subtotalCordobas,
                'total_cordobas' => $totalCordobas,
                'total_usd' => round($totalUsd, 2),
                'margin_amount' => round($marginAmount, 2),
                'margin_percentage' => round($marginPct, 2),
                'status' => 'completed',
            ]);

            foreach ($itemsData as $item) {
                $sale->items()->create($item);
            }

            // Registrar en Movimientos
            Movement::create([
                'type' => 'venta',
                'product_name' => count($itemsData) === 1 ? $itemsData[0]['product_name'] : count($itemsData) . ' productos',
                'ticket_number' => $ticketNumber,
                'payment_method' => strtoupper($request->payment_method),
                'quantity' => array_sum(array_column($itemsData, 'quantity')),
                'amount' => $totalCordobas,
                'cost' => $totalCostCordobas,
                'margin_amount' => round($marginAmount, 2),
                'margin_percentage' => round($marginPct, 2),
                'user_id' => $user->id,
                'customer_id' => $request->customer_id,
                'movement_date' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Venta procesada con éxito',
                'ticket_number' => $ticketNumber,
                'sale_id' => $sale->id,
                'total_cordobas' => $totalCordobas,
                'total_usd' => round($totalUsd, 2),
            ]);
        });
    }

    public function ticket($id)
    {
        $sale = Sale::with(['items', 'customer', 'user'])->findOrFail($id);
        $setting = CompanySetting::first();
        return view('pos.ticket', compact('sale', 'setting'));
    }
}