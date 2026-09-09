@extends('layouts.app')

@section('title_badge', 'AJUSTE DEL SISTEMA Y CONEXIÃ“N SUPABASE')

@section('content')
<div class="max-w-4xl space-y-6">

    <!-- Supabase Card -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <i data-lucide="database" class="w-6 h-6"></i>
            </div>
            <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">ConexiÃ³n a Base de Datos Supabase (PostgreSQL)</h3>
                <p class="text-xs text-slate-400">Driver activo: <strong class="text-slate-800 dark:text-white font-mono">{{ $dbConnection }}</strong></p>
            </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1.5 overflow-x-auto">
            <p class="text-emerald-400 font-bold"># Para conectar con tu proyecto Supabase, agrega tus credenciales en el archivo .env:</p>
            <p>DB_CONNECTION=pgsql</p>
            <p>DB_HOST=db.xxxxxxxxxxxx.supabase.co</p>
            <p>DB_PORT=5432</p>
            <p>DB_DATABASE=postgres</p>
            <p>DB_USERNAME=postgres</p>
            <p>DB_PASSWORD=tu_contraseÃ±a_supabase</p>
            <p>DB_SSLMODE=require</p>
        </div>

        <div class="flex items-center gap-3">
            <button onclick="testDatabase()" 
                    class="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition flex items-center gap-2">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                <span>PROBAR CONEXIÃ“N DE BASE DE DATOS</span>
            </button>
        </div>
    </div>

    <!-- Company Settings Form -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Datos de la Empresa & Moneda</h3>

        <form action="{{ route('settings.update') }}" method="POST" class="space-y-4">
            @csrf
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre Comercial</label>
                    <input type="text" name="name" value="{{ $setting->name }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tagline / SubtÃ­tulo</label>
                    <input type="text" name="tagline" value="{{ $setting->tagline }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">NÃºmero RUC / CÃ©dula</label>
                    <input type="text" name="ruc" value="{{ $setting->ruc }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">TelÃ©fono / WhatsApp</label>
                    <input type="text" name="phone" value="{{ $setting->phone }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tasa de Cambio (1 USD = C$ NIO)</label>
                    <input type="number" step="0.0001" name="exchange_rate" value="{{ $setting->exchange_rate }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold text-blue-600">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Impuesto IVA (%)</label>
                    <input type="number" step="0.01" name="tax_rate" value="{{ $setting->tax_rate }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">DirecciÃ³n FÃ­sica</label>
                    <input type="text" name="address" value="{{ $setting->address }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25">
                    Guardar Cambios
                </button>
            </div>
        </form>
    </div>

</div>

@push('scripts')
<script>
    async function testDatabase() {
        try {
            const res = await fetch('{{ route("settings.test-supabase") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            const data = await res.json();
            alert(data.message);
        } catch (e) {
            alert('Error de conexiÃ³n a la base de datos');
        }
    }
</script>
@endpush
@endsection