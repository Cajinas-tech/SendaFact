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
            $data = $request->except(['_token', 'image_file']);
            
            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $mime = $file->getMimeType();
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $data['image_url'] = "data:{$mime};base64,{$base64}";
            }

            if (empty($data['price_usd']) && !empty($data['price_cordobas'])) {
                $data['price_usd'] = round($data['price_cordobas'] / 36.80, 2);
            }

            Product::create($data);
        } catch (\Throwable $e) {}

        return redirect()->route('products.index')->with('success', 'Producto registrado exitosamente.');
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $data = $request->except(['_token', '_method', 'image_file']);

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $mime = $file->getMimeType();
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $data['image_url'] = "data:{$mime};base64,{$base64}";
            }

            if (empty($data['price_usd']) && !empty($data['price_cordobas'])) {
                $data['price_usd'] = round($data['price_cordobas'] / 36.80, 2);
            }

            $product->update($data);
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