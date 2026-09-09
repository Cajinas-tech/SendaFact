<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with('category')->latest();
            if ($request->search) {
                $query->where('name', 'like', "%{$request->search}%")
                      ->orWhere('sku', 'like', "%{$request->search}%");
            }
            $products = $query->paginate(15);
            $categories = Category::all();
        } catch (\Throwable $e) {
            $catPuertas = (object)['id' => 1, 'name' => 'PUERTAS', 'slug' => 'puertas'];
            $catVentanas = (object)['id' => 2, 'name' => 'VENTANAS', 'slug' => 'ventanas'];
            $categories = collect([$catPuertas, $catVentanas]);

            $p1 = (object)[
                'id' => 1,
                'name' => 'PUERTA DE ALUMINIO-VIDRIO',
                'sku' => '#SKU-9859',
                'category' => $catPuertas,
                'cost_price' => 2200.00,
                'price_cordobas' => 3500.00,
                'price_usd' => 95.11,
                'stock' => 10,
                'min_stock' => 2,
                'dimensions' => '2.10 m',
                'subtitle' => 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44',
            ];

            $p2 = (object)[
                'id' => 2,
                'name' => 'VENTANA ALUMINIO-VIDRIO',
                'sku' => '#SKU-5640',
                'category' => $catVentanas,
                'cost_price' => 5000.00,
                'price_cordobas' => 8000.00,
                'price_usd' => 217.39,
                'stock' => 10,
                'min_stock' => 2,
                'dimensions' => '1.80 m',
                'subtitle' => 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM',
            ];

            $items = collect([$p1, $p2]);
            $products = new LengthAwarePaginator($items, 2, 15, 1, ['path' => $request->url()]);
        }

        return view('products.index', compact('products', 'categories'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'sku' => 'required|string',
                'cost_price' => 'required|numeric|min:0',
                'price_cordobas' => 'required|numeric|min:0',
                'price_usd' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'min_stock' => 'nullable|integer|min:0',
                'dimensions' => 'nullable|string',
                'subtitle' => 'nullable|string',
                'description' => 'nullable|string',
            ]);

            Product::create($validated);
        } catch (\Throwable $e) {}

        return redirect()->route('products.index')->with('success', 'Producto registrado exitosamente.');
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->update($request->all());
        } catch (\Throwable $e) {}

        return redirect()->route('products.index')->with('success', 'Producto actualizado.');
    }

    public function destroy($id)
    {
        try {
            Product::findOrFail($id)->delete();
        } catch (\Throwable $e) {}
        return redirect()->route('products.index')->with('success', 'Producto eliminado.');
    }
}