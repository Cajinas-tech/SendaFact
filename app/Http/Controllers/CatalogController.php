<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $selectedCategory = $request->query('category', 'all');
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'name_asc');

        try {
            $query = Product::with('category')->where('status', 'active');

            if ($selectedCategory !== 'all') {
                $query->whereHas('category', function ($q) use ($selectedCategory) {
                    $q->where('slug', $selectedCategory);
                });
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('dimensions', 'like', "%{$search}%")
                      ->orWhere('subtitle', 'like', "%{$search}%");
                });
            }

            if ($sort === 'name_asc') {
                $query->orderBy('name', 'asc');
            } elseif ($sort === 'name_desc') {
                $query->orderBy('name', 'desc');
            } elseif ($sort === 'price_asc') {
                $query->orderBy('price_cordobas', 'asc');
            } elseif ($sort === 'price_desc') {
                $query->orderBy('price_cordobas', 'desc');
            }

            $products = $query->get();
            $sessionProducts = collect(session('custom_products', []))->values();
            if ($products->count() > 0) {
                foreach ($sessionProducts as $sp) {
                    if (!$products->contains('id', $sp->id) && !$products->contains('sku', $sp->sku)) {
                        $products->prepend($sp);
                    }
                }
            }
            $categories = Category::withCount('products')->get();
            $totalFinishedGoods = Product::where('is_finished_good', true)->count() + $sessionProducts->count();
            $immediateStockCount = Product::where('stock', '>', 0)->count() + $sessionProducts->count();

        } catch (\Throwable $e) {
            // Fallback de catálogo digital
            $catPuertas = (object)['id' => 1, 'name' => 'PUERTAS', 'slug' => 'puertas', 'icon' => 'door-closed', 'products_count' => 1];
            $catVentanas = (object)['id' => 2, 'name' => 'VENTANAS', 'slug' => 'ventanas', 'icon' => 'app-window', 'products_count' => 1];
            $catLacteos = (object)['id' => 3, 'name' => 'Lácteos', 'slug' => 'lacteos', 'icon' => 'milk', 'products_count' => 2];
            $catBebidas = (object)['id' => 4, 'name' => 'Bebidas', 'slug' => 'bebidas', 'icon' => 'cup-soda', 'products_count' => 1];
            $catFerreteria = (object)['id' => 5, 'name' => 'Ferretería', 'slug' => 'ferreteria', 'icon' => 'wrench', 'products_count' => 1];

            $categories = collect([$catPuertas, $catVentanas, $catLacteos, $catBebidas, $catFerreteria]);

            $p1 = (object)[
                'id' => 1,
                'name' => 'PUERTA DE ALUMINIO-VIDRIO',
                'sku' => '#SKU-9859',
                'barcode' => '740100019859',
                'subtitle' => 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44',
                'description' => 'Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes.',
                'dimensions' => '2.10 m',
                'measurements_spec' => '210X80X4.44 CM',
                'price_cordobas' => 3500.00,
                'price_usd' => 95.11,
                'cost_price' => 2200.00,
                'stock' => 10,
                'min_stock' => 2,
                'image_url' => '/images/products/puerta-aluminio.svg',
                'is_finished_good' => true,
                'category' => $catPuertas,
            ];

            $p2 = (object)[
                'id' => 2,
                'name' => 'VENTANA ALUMINIO-VIDRIO',
                'sku' => '#SKU-5640',
                'barcode' => '740100015640',
                'subtitle' => 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM',
                'description' => 'Ficha técnica de ventana corrediza de doble hoja con perfiles de alta resistencia.',
                'dimensions' => '1.80 m',
                'measurements_spec' => '1.80 LARGO X 1.20 ALTO X 5.71 CM',
                'price_cordobas' => 8000.00,
                'price_usd' => 217.39,
                'cost_price' => 5000.00,
                'stock' => 10,
                'min_stock' => 2,
                'image_url' => '/images/products/ventana-aluminio.svg',
                'is_finished_good' => true,
                'category' => $catVentanas,
            ];

            $p3 = (object)[
                'id' => 3,
                'name' => 'Yogurt Natural',
                'sku' => 'YOG001',
                'barcode' => '740100020001',
                'subtitle' => 'Lácteos • SKU: YOG001',
                'description' => 'Yogurt probiótico sin azúcar 500ml',
                'dimensions' => '500 ml',
                'measurements_spec' => '500ml',
                'price_cordobas' => 40.00,
                'price_usd' => 1.09,
                'cost_price' => 25.00,
                'stock' => 4,
                'min_stock' => 8,
                'image_url' => null,
                'is_finished_good' => true,
                'category' => $catLacteos,
            ];

            $p4 = (object)[
                'id' => 4,
                'name' => 'LECHE ESKIMO',
                'sku' => 'ESK002',
                'barcode' => '740100020002',
                'subtitle' => 'Lácteos • Tetrapack 1L',
                'description' => 'Leche entera pasteurizada 1 Litro',
                'dimensions' => '1 L',
                'measurements_spec' => '1000ml',
                'price_cordobas' => 45.00,
                'price_usd' => 1.22,
                'cost_price' => 30.00,
                'stock' => 18,
                'min_stock' => 5,
                'image_url' => null,
                'is_finished_good' => true,
                'category' => $catLacteos,
            ];

            $products = collect([$p1, $p2, $p3, $p4]);
            $sessionProducts = collect(session('custom_products', []))->values();
            foreach ($sessionProducts as $sp) {
                if (!$products->contains('id', $sp->id) && !$products->contains('sku', $sp->sku)) {
                    $products->prepend($sp);
                }
            }
            $totalFinishedGoods = $products->count();
            $immediateStockCount = $products->count();
        }

        return view('catalog.index', compact(
            'products',
            'categories',
            'selectedCategory',
            'search',
            'sort',
            'totalFinishedGoods',
            'immediateStockCount'
        ));
    }

    public function pdf()
    {
        try {
            $products = Product::with('category')->where('status', 'active')->get();
            $categories = Category::withCount('products')->get();
            if ($products->isEmpty()) {
                throw new \Exception("Empty catalog");
            }
        } catch (\Throwable $e) {
            $catPuertas = (object)['id' => 1, 'name' => 'PUERTAS', 'slug' => 'puertas'];
            $catVentanas = (object)['id' => 2, 'name' => 'VENTANAS', 'slug' => 'ventanas'];
            $p1 = (object)[
                'id' => 1,
                'name' => 'PUERTA DE ALUMINIO-VIDRIO',
                'sku' => '#SKU-9859',
                'subtitle' => 'PUERTAS DE ALUMINIO Y VIDRIO 210X80X4.44',
                'price_cordobas' => 3500.00,
                'price_usd' => 95.11,
                'stock' => 10,
                'image_url' => '/images/products/puerta-aluminio.svg',
                'category' => $catPuertas,
            ];
            $p2 = (object)[
                'id' => 2,
                'name' => 'VENTANA ALUMINIO-VIDRIO',
                'sku' => '#SKU-5640',
                'subtitle' => 'VENTANA DE VIDRIO Y ALUMINIO 1.80 LARGO X 1.20 ALTO X 5.71 CM',
                'price_cordobas' => 8000.00,
                'price_usd' => 217.39,
                'stock' => 10,
                'image_url' => '/images/products/ventana-aluminio.svg',
                'category' => $catVentanas,
            ];
            $products = collect([$p1, $p2]);
            $categories = collect([$catPuertas, $catVentanas]);
        }
        return view('catalog.pdf', compact('products', 'categories'));
    }
}