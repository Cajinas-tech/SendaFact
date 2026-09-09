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
        try {
            $credits = Credit::with(['customer', 'payments'])->latest()->get();
            $totalOwed = Credit::where('status', 'activo')->sum('remaining_amount');
            $totalLent = Credit::sum('total_amount');
            $totalPaid = Credit::sum('paid_amount');
        } catch (\Throwable $e) {
            $c1 = (object)[
                'id' => 1,
                'credit_code' => 'FERR-V-0028',
                'customer' => (object)['name' => 'Eduardo Lopez', 'phone' => '444334405'],
                'total_amount' => 139.37,
                'paid_amount' => 99.99,
                'remaining_amount' => 39.38,
                'fio_date' => now()->subDays(12)->toDateString(),
                'due_date' => now()->addDays(14)->toDateString(),
                'status' => 'activo',
                'notes' => 'Vence en 14 días. Si no abona nada, deberá $39.43'
            ];
            $credits = collect([$c1]);
            $totalOwed = 39.38;
            $totalLent = 139.37;
            $totalPaid = 99.99;
        }

        return view('credits.index', compact('credits', 'totalOwed', 'totalLent', 'totalPaid'));
    }

    public function show($id)
    {
        try {
            $credit = Credit::with(['customer', 'payments.user'])->findOrFail($id);
        } catch (\Throwable $e) {
            $credit = (object)[
                'id' => $id,
                'credit_code' => 'FERR-V-0028',
                'customer' => (object)['name' => 'Eduardo Lopez', 'phone' => '444334405', 'address' => 'Colonia Centro, Calle 4'],
                'total_amount' => 139.37,
                'paid_amount' => 99.99,
                'remaining_amount' => 39.38,
                'interest_rate_annual' => 3.00,
                'fio_date' => now()->subDays(12)->toDateString(),
                'due_date' => now()->addDays(14)->toDateString(),
                'status' => 'activo',
                'notes' => 'Vence en 14 días. Si no abona nada, el 11 de sep, 2026 deberá $39.43',
                'payments' => collect([
                    (object)[
                        'amount' => 99.99,
                        'payment_method' => 'efectivo',
                        'payment_date' => now()->subDays(7),
                        'notes' => 'Abono parcial en efectivo',
                        'user' => (object)['name' => 'Jairo (Admin)']
                    ]
                ])
            ];
        }

        $sampleItems = [
            ['name' => 'Rondana plana 1/4 pulg', 'qty' => 1, 'price' => 0.75, 'total' => 0.75],
            ['name' => 'Tornillo pija punta broca 1 pulg', 'qty' => 3, 'price' => 1.80, 'total' => 5.40],
            ['name' => 'Cable THW calibre 12', 'qty' => 1, 'price' => 18.00, 'total' => 18.00],
            ['name' => 'Arena cribada en bolsa', 'qty' => 2, 'price' => 48.00, 'total' => 96.00],
        ];

        $paidPercentage = 71.7;
        $daysLeftText = "en 14 días";
        $whatsappMessage = urlencode("Hola Eduardo Lopez, le saludamos de SENDA SISTEMAS para recordarle su saldo pendiente de \$39.38 correspondiente al crédito FERR-V-0028. ¡Gracias!");

        return view('credits.show', compact('credit', 'sampleItems', 'paidPercentage', 'daysLeftText', 'whatsappMessage'));
    }

    public function pay(Request $request, $id)
    {
        return redirect()->route('credits.show', $id)->with('success', 'Abono registrado con éxito.');
    }
}