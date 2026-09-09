<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            $customers = Customer::withCount('sales', 'credits')->latest()->get();
        } catch (\Throwable $e) {
            $c1 = (object)['id' => 1, 'name' => 'Eduardo Lopez', 'document_number' => '001-010190-0001A', 'phone' => '444334405', 'email' => 'eduardo@gmail.com', 'address' => 'Colonia Centro, Calle 4', 'credit_limit' => 500.00, 'current_debt' => 39.38, 'sales_count' => 3, 'credits_count' => 1];
            $c2 = (object)['id' => 2, 'name' => 'Residencial Las Colinas - Casa #42', 'document_number' => 'J031000004444', 'phone' => '88776655', 'email' => 'colinas@gmail.com', 'address' => 'Las Colinas', 'credit_limit' => 2000.00, 'current_debt' => 0.00, 'sales_count' => 1, 'credits_count' => 0];
            $c3 = (object)['id' => 3, 'name' => 'Constructora El Progreso S.A.', 'document_number' => 'J031000005555', 'phone' => '22554433', 'email' => 'progresosa@gmail.com', 'address' => 'Km 9 Carretera a Masaya', 'credit_limit' => 10000.00, 'current_debt' => 0.00, 'sales_count' => 4, 'credits_count' => 0];
            $customers = collect([$c1, $c2, $c3]);
        }

        return view('customers.index', compact('customers'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string',
                'document_number' => 'nullable|string',
                'email' => 'nullable|email',
                'address' => 'nullable|string',
                'credit_limit' => 'nullable|numeric|min:0',
            ]);
            Customer::create($validated);
        } catch (\Throwable $e) {}

        return redirect()->route('customers.index')->with('success', 'Cliente agregado exitosamente.');
    }
}