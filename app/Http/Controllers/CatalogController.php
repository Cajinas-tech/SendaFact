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
        $categories = Category::withCount('products')->get();
        $totalFinishedGoods = Product::where('is_finished_good', true)->count();
        $immediateStockCount = Product::where('stock', '>', 0)->count();

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
        $products = Product::with('category')->where('status', 'active')->get();
        $categories = Category::withCount('products')->get();
        return view('catalog.pdf', compact('products', 'categories'));
    }
}