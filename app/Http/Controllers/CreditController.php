<?php

namespace App\Http\Controllers;

use App\Models\Credit;
use App\Models\CreditPayment;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CreditController extends Controller
{
    public function index()
    {
        $credits = Credit::with(['customer', 'payments'])->latest()->get();
        $totalOwed = Credit::where('status', 'activo')->sum('remaining_amount');
        $totalLent = Credit::sum('total_amount');
        $totalPaid = Credit::sum('paid_amount');

        return view('credits.index', compact('credits', 'totalOwed', 'totalLent', 'totalPaid'));
    }

    public function show($id)
    {
        $credit = Credit::with(['customer', 'payments.user'])->findOrFail($id);
        
        // Simular o cargar productos vendidos a crédito
        $ferreteriaProducts = Product::where('sku', 'like', 'RON%')
            ->orWhere('sku', 'like', 'TOR%')
            ->orWhere('sku', 'like', 'CAB%')
            ->orWhere('sku', 'like', 'ARE%')
            ->get();

        $sampleItems = [
            ['name' => 'Rondana plana 1/4 pulg', 'qty' => 1, 'price' => 0.75, 'total' => 0.75],
            ['name' => 'Tornillo pija punta broca 1 pulg', 'qty' => 3, 'price' => 1.80, 'total' => 5.40],
            ['name' => 'Cable THW calibre 12', 'qty' => 1, 'price' => 18.00, 'total' => 18.00],
            ['name' => 'Arena cribada en bolsa', 'qty' => 2, 'price' => 48.00, 'total' => 96.00],
        ];

        // Porcentaje pagado
        $paidPercentage = $credit->total_amount > 0 ? round(($credit->paid_amount / $credit->total_amount) * 100, 1) : 0;
        
        // Días restantes para vencer
        $now = Carbon::now();
        $dueDate = Carbon::parse($credit->due_date);
        $daysLeft = $now->diffInDays($dueDate, false);
        $daysLeftText = $daysLeft > 0 ? "en {$daysLeft} días" : "Vencido";

        // Mensaje formateado para WhatsApp
        $whatsappMessage = urlencode("Hola {$credit->customer->name}, le saludamos de SENDA SISTEMAS para recordarle su saldo pendiente de \${$credit->remaining_amount} correspondiente al crédito {$credit->credit_code} que vence el {$dueDate->format('d/m/Y')}. Quedamos a su orden para recibir su abono. ¡Gracias!");

        return view('credits.show', compact('credit', 'sampleItems', 'paidPercentage', 'daysLeftText', 'whatsappMessage'));
    }

    public function pay(Request $request, $id)
    {
        $credit = Credit::findOrFail($id);
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $amount = floatval($request->amount);
        $newPaid = $credit->paid_amount + $amount;
        $newRemaining = max(0, $credit->total_amount - $newPaid);

        $user = auth()->user() ?? \App\Models\User::first();

        CreditPayment::create([
            'credit_id' => $credit->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
            'payment_date' => Carbon::now(),
        ]);

        $credit->update([
            'paid_amount' => $newPaid,
            'remaining_amount' => $newRemaining,
            'status' => $newRemaining <= 0 ? 'pagado' : 'activo',
        ]);

        return redirect()->route('credits.show', $id)->with('success', 'Abono de $' . number_format($amount, 2) . ' registrado con éxito.');
    }
}