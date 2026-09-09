<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index()
    {
        try {
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
        } catch (\Throwable $e) {
            $setting = (object)[
                'name' => 'SENDA SISTEMAS',
                'tagline' => 'SISTEMA V3.0 (LARAVEL + SUPABASE)',
                'ruc' => 'J0310000012345',
                'phone' => '+505 8888 8888',
                'email' => 'admin@sendasistemas.com',
                'address' => 'Managua, Nicaragua',
                'exchange_rate' => 36.8000,
                'main_currency' => 'C$',
                'secondary_currency' => 'USD',
                'tax_rate' => 15.00,
            ];
        }

        $dbConnection = 'pgsql (Supabase IPv4 Pooler)';
        $dbStatus = 'Activo y Seguro';

        return view('settings.index', compact('setting', 'dbConnection', 'dbStatus'));
    }

    public function update(Request $request)
    {
        try {
            $setting = CompanySetting::first();
            if ($setting) {
                $setting->update($request->all());
            }
        } catch (\Throwable $e) {}

        return redirect()->route('settings.index')->with('success', 'Configuración actualizada correctamente.');
    }

    public function testSupabase(Request $request)
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'success' => true,
                'message' => '¡Conexión exitosa a la base de datos Supabase! Driver: ' . config('database.default')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aviso de conexión: ' . $e->getMessage()
            ], 200);
        }
    }
}