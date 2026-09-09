<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index()
    {
        $setting = CompanySetting::firstOrCreate(['id' => 1], [
            'name' => 'SENDA SISTEMAS',
            'tagline' => 'SISTEMA V3.0 (LARAVEL)',
            'ruc' => 'J0310000012345',
            'phone' => '+505 8888 8888',
            'email' => 'admin@sendasistemas.com',
            'address' => 'Managua, Nicaragua',
            'exchange_rate' => 36.8000,
            'main_currency' => 'C$',
            'secondary_currency' => 'USD',
            'tax_rate' => 15.00
        ]);

        $dbConnection = config('database.default');
        $dbStatus = 'Conectado (' . $dbConnection . ')';

        return view('settings.index', compact('setting', 'dbConnection', 'dbStatus'));
    }

    public function update(Request $request)
    {
        $setting = CompanySetting::first();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string',
            'ruc' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'exchange_rate' => 'required|numeric|min:0.01',
            'tax_rate' => 'required|numeric|min:0',
        ]);

        $setting->update($validated);

        return redirect()->route('settings.index')->with('success', 'Configuración actualizada correctamente.');
    }

    public function testSupabase(Request $request)
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'success' => true,
                'message' => '¡Conexión exitosa a la base de datos! Driver: ' . config('database.default')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de conexión: ' . $e->getMessage()
            ], 500);
        }
    }
}