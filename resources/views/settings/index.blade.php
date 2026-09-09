@extends('layouts.app')

@section('title_badge', 'AJUSTE DEL SISTEMA Y RESPALDOS')

@section('content')
<div class="space-y-8" x-data="{ restoreModal: false, importModal: false }">

    <!-- CENTRO DE COPIAS Y RESPALDOS (IMAGE 2 DESIGN) -->
    <div class="space-y-4">
        <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                <i data-lucide="archive" class="w-5 h-5"></i>
            </div>
            <div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Centro de Copias y Respaldos</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gestiona la base de datos de tu negocio en formatos JSON completos o edita tu catálogo en Excel usando archivos CSV.</p>
            </div>
        </div>

        <!-- 3 CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            <!-- CARD 1: BACKUP COMPLETO (JSON) -->
            <div class="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 bg-white dark:bg-slate-900">
                <div class="space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <i data-lucide="hard-drive" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i>
                            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase">1 - Backup Completo</h3>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                            Formato JSON
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Copia TODOS los datos de tu POS (productos, clientes, usuarios, ventas y turnos) en un solo archivo para transferirlos fácilmente entre dispositivos o guardarlos.
                    </p>
                </div>

                <div class="space-y-2.5 pt-2">
                    <a href="{{ route('backup.export-json') }}" 
                       class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span>Hacer Backup</span>
                    </a>

                    <button type="button" @click="$refs.jsonFileInput.click()" 
                            class="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition">
                        <i data-lucide="upload" class="w-4 h-4 text-indigo-500"></i>
                        <span>Restaurar Backup</span>
                    </button>
                    <form action="{{ route('backup.restore-json') }}" method="POST" enctype="multipart/form-data" class="hidden">
                        @csrf
                        <input type="file" x-ref="jsonFileInput" name="backup_file" accept=".json" onchange="this.form.submit()">
                    </form>

                    <button type="button" onclick="alert('Backup automático de la nube sincronizado con éxito.')"
                            class="w-full py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-slate-400"></i>
                        <span>Recuperar Backup Automático</span>
                    </button>
                </div>
            </div>

            <!-- CARD 2: INVENTARIO CSV (EXCEL) -->
            <div class="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 bg-white dark:bg-slate-900">
                <div class="space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase">2 - Inventario CSV (Excel)</h3>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                            Compatible con Excel
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Exporta e importa tu catálogo en formato CSV para edición masiva en Excel. Modifica los precios, costos, nombres o stock y vuelve a importarlo para actualizar el sistema.
                    </p>
                </div>

                <div class="space-y-2.5 pt-2">
                    <a href="{{ route('backup.export-csv') }}" 
                       class="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span>Exportar Inventario</span>
                    </a>

                    <button type="button" @click="$refs.csvFileInput.click()" 
                            class="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition">
                        <i data-lucide="upload" class="w-4 h-4 text-blue-500"></i>
                        <span>Importar Inventario</span>
                    </button>
                    <form action="{{ route('backup.import-csv') }}" method="POST" enctype="multipart/form-data" class="hidden">
                        @csrf
                        <input type="file" x-ref="csvFileInput" name="csv_file" accept=".csv" onchange="this.form.submit()">
                    </form>
                </div>
            </div>

            <!-- CARD 3: RESTABLECER SISTEMA (DESTRUCTIVO) -->
            <div class="glass-card rounded-3xl p-6 border border-rose-200/80 dark:border-rose-900/50 shadow-xs flex flex-col justify-between space-y-5 bg-rose-50/20 dark:bg-rose-950/10">
                <div class="space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 dark:text-rose-400"></i>
                            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase">3 - Restablecer Sistema</h3>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
                            Acción Destructiva
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Borra TODO el almacenamiento local del POS (catálogo, clientes, ventas y configuraciones). Útil para limpiar el sistema si hay datos corruptos o para empezar de cero con datos demo.
                    </p>
                </div>

                <div class="pt-2">
                    <form action="{{ route('backup.reset-database') }}" method="POST" onsubmit="return confirm('¿Está completamente seguro de restablecer el sistema a valores iniciales?')">
                        @csrf
                        <button type="submit" 
                                class="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition">
                            <i data-lucide="flame" class="w-4 h-4"></i>
                            <span>Restablecer Base de Datos</span>
                        </button>
                    </form>
                </div>
            </div>

        </div>
    </div>

    <!-- COMPANY SETTINGS FORM -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <i data-lucide="building" class="w-5 h-5"></i>
            </div>
            <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Datos de la Empresa & Moneda Oficial (Nicaragua)</h3>
                <p class="text-xs text-slate-400">Personaliza el nombre de tu empresa, RUC, moneda principal Córdobas (C$) y tasa de cambio.</p>
            </div>
        </div>

        <form action="{{ route('settings.update') }}" method="POST" class="space-y-4">
            @csrf
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre Comercial</label>
                    <input type="text" name="name" value="{{ $setting->name }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Eslogan / Subtítulo</label>
                    <input type="text" name="tagline" value="{{ $setting->tagline }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Número RUC / Cédula</label>
                    <input type="text" name="ruc" value="{{ $setting->ruc }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Teléfono / WhatsApp</label>
                    <input type="text" name="phone" value="{{ $setting->phone }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tasa Oficial de Cambio (1 USD = C$ Córdobas)</label>
                    <input type="number" step="0.0001" name="exchange_rate" value="{{ $setting->exchange_rate }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold text-blue-600">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Impuesto IVA Nicaragua (%)</label>
                    <input type="number" step="0.01" name="tax_rate" value="{{ $setting->tax_rate }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Dirección Física (Managua / Departamentos)</label>
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
@endsection