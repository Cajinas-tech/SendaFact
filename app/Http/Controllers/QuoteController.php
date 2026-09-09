<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Customer;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function index()
    {
        $quotes = Quote::with('customer')->latest()->get();
        $customers = Customer::all();
        return view('quotes.index', compact('quotes', 'customers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'items_count' => 'required|integer|min:1',
            'total_cordobas' => 'required|numeric|min:0',
            'total_usd' => 'required|numeric|min:0',
            'status' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $nextId = Quote::count() + 1;
        $validated['quote_code'] = 'COT-2026-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        Quote::create($validated);

        return redirect()->route('quotes.index')->with('success', 'Cotización registrada correctamente.');
    }
}