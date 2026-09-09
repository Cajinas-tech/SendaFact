<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Sale;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CashRegisterController extends Controller
{
    public function index()
    {
        $registers = CashRegister::with('user')->latest()->get();
        $current = CashRegister::where('status', 'open')->latest()->first();
        
        $todaySales = Sale::whereDate('created_at', Carbon::today())->sum('total_cordobas');

        return view('cash.index', compact('registers', 'current', 'todaySales'));
    }

    public function open(Request $request)
    {
        $request->validate(['opening_amount' => 'required|numeric|min:0']);
        $user = auth()->user() ?? \App\Models\User::first();

        // Cerrar anteriores si estuvieran abiertos
        CashRegister::where('status', 'open')->update(['status' => 'closed', 'closed_at' => Carbon::now()]);

        CashRegister::create([
            'user_id' => $user->id,
            'opening_amount' => $request->opening_amount,
            'status' => 'open',
            'opened_at' => Carbon::now(),
            'notes' => $request->notes,
        ]);

        return redirect()->route('cash.index')->with('success', 'Caja abierta correctamente.');
    }

    public function close(Request $request, $id)
    {
        $register = CashRegister::findOrFail($id);
        $request->validate(['closing_amount' => 'required|numeric|min:0']);

        $register->update([
            'closing_amount' => $request->closing_amount,
            'status' => 'closed',
            'closed_at' => Carbon::now(),
            'notes' => $request->notes,
        ]);

        return redirect()->route('cash.index')->with('success', 'Caja cerrada y arqueo registrado.');
    }
}