@extends('layouts.app')

@section('title_badge', 'MOVIMIENTOS / GANANCIAS & PÉRDIDAS')

@section('content')
<div class="space-y-6" x-data="{ aiModalOpen: false }">

    <!-- Top Header & Filter Controls (As in Screenshot 5) -->
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Movimientos</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consulta y analiza los movimientos de inventario por periodo</p>
        </div>

        <form method="GET" action="{{ route('movements.index') }}" class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
                
                <div class="flex flex-wrap items-center gap-2">
                    <!-- Period Select -->
                    <select name="period" onchange="this.form.submit()" 
                            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <option value="diario" {{ $period == 'diario' ? 'selected' : '' }}>Diario</option>
                        <option value="mensual" {{ $period == 'mensual' ? 'selected' : '' }}>Mensual</option>
                        <option value="rango" {{ $period == 'rango' ? 'selected' : '' }}>Rango personalizado</option>
                    </select>

                    <!-- Date input -->
                    <div class="relative">
                        <input type="date" name="date" value="{{ $dateFilter }}" onchange="this.form.submit()"
                               class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    </div>

                    <!-- Search Input -->
                    <div class="relative w-64">
                        <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                        <input type="text" name="search" value="{{ $search }}" placeholder="Buscar producto, tipo, ticket..."
                               class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500">
                    </div>

                    <!-- Type Filter -->
                    <select name="type" onchange="this.form.submit()" 
                            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <option value="all" {{ $typeFilter == 'all' ? 'selected' : '' }}>Todos</option>
                        <option value="venta" {{ $typeFilter == 'venta' ? 'selected' : '' }}>Ventas</option>
                        <option value="gasto" {{ $typeFilter == 'gasto' ? 'selected' : '' }}>Gastos</option>
                        <option value="merma" {{ $typeFilter == 'merma' ? 'selected' : '' }}>Pérdidas / Merma</option>
                    </select>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <button type="button" @click="aiModalOpen = true" 
                            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-blue-500/25 transition">
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                        Analizar con IA
                    </button>

                    <a href="{{ route('movements.export') }}"
                       class="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        Descargar Excel
                    </a>

                    <button type="button" title="Ver semáforo de rentabilidad"
                            class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition">
                        <i data-lucide="traffic-cone" class="w-4 h-4 text-emerald-500"></i>
                    </button>
                </div>

            </div>
        </form>
    </div>

    <!-- 3 KPI BALANCE CARDS (EXACTLY AS SCREENSHOT 5) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- 1. Ganancias -->
        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <i data-lucide="trending-up" class="w-4 h-4"></i>
                <span class="text-xs font-black uppercase tracking-wider">Ganancias</span>
            </div>
            <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
                ${{ number_format($totalEarnings, 2) }}
            </div>
            <p class="text-[11px] font-semibold text-slate-400">{{ $salesCount }} ventas registradas</p>
        </div>

        <!-- 2. Pérdidas -->
        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div class="flex items-center gap-2 text-rose-500">
                <i data-lucide="trending-down" class="w-4 h-4"></i>
                <span class="text-xs font-black uppercase tracking-wider">Pérdidas</span>
            </div>
            <div class="text-3xl font-black text-rose-500 font-sans tracking-tight">
                ${{ number_format($totalLosses, 2) }}
            </div>
            <p class="text-[11px] font-semibold text-slate-400">0 registros (merma/robo)</p>
        </div>

        <!-- 3. Balance Neto -->
        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <i data-lucide="scale" class="w-4 h-4"></i>
                <span class="text-xs font-black uppercase tracking-wider">Balance Neto</span>
            </div>
            <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
                ${{ number_format($netBalance, 2) }}
            </div>
            <p class="text-[11px] font-semibold text-slate-400">{{ !empty($dateFilter) ? \Carbon\Carbon::parse($dateFilter)->format('d \d\e F Y') : 'Hoy' }}</p>
        </div>

    </div>

    <!-- MOVEMENTS TABLE (MATCHING SCREENSHOT 5) -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                        <th class="p-4">TIPO</th>
                        <th class="p-4">PRODUCTO</th>
                        <th class="p-4"># TICKET</th>
                        <th class="p-4">MÉTODO PAGO</th>
                        <th class="p-4 text-center">CANTIDAD</th>
                        <th class="p-4 text-right">TOTAL</th>
                        <th class="p-4 text-right">MARGEN ($)</th>
                        <th class="p-4 text-right">MARGEN (%)</th>
                        <th class="p-4">HORA</th>
                        <th class="p-4 text-center">USUARIO</th>
                        <th class="p-4 text-center">CLIENTE</th>
                        <th class="p-4 text-center">ACCIÓN</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($movements as $m)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase {{ $m->type === 'venta' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : ($m->type === 'compra' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700') }}">
                                    {{ $m->type }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="font-extrabold text-slate-900 dark:text-white uppercase">{{ $m->product_name }}</div>
                                <div class="text-[11px] text-slate-400 font-mono">{{ $m->sku }}</div>
                            </td>
                            <td class="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {{ $m->ticket_number }}
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                    {{ $m->payment_method ?? 'EFECTIVO' }}
                                </span>
                            </td>
                            <td class="p-4 text-center font-mono font-bold">{{ $m->quantity }}</td>
                            <td class="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                                ${{ number_format($m->amount, 2) }}
                            </td>
                            <td class="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ${{ number_format($m->margin_amount, 2) }}
                            </td>
                            <td class="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {{ number_format($m->margin_percentage, 1) }}%
                            </td>
                            <td class="p-4 font-mono text-slate-500">
                                {{ !empty($m->movement_date) ? \Carbon\Carbon::parse($m->movement_date)->format('h:i A') : '---' }}
                            </td>
                            <td class="p-4 text-center">
                                <span title="Usuario: Jairo (Admin)" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    <i data-lucide="user" class="w-3.5 h-3.5"></i>
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <span title="Cliente: Público General" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <button class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Mostrando 1-{{ $movements->count() }} de {{ $movements->count() }} movimientos</span>
            <div class="flex items-center gap-2">
                <span>Filas por página:</span>
                <select class="px-2 py-1 rounded-md border text-xs bg-white dark:bg-slate-800 font-bold">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                </select>
            </div>
        </div>
    </div>

    <!-- AI ANALYSIS MODAL (BOTÓN "ANALIZAR CON IA") -->
    <div x-show="aiModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="aiModalOpen = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <i data-lucide="sparkles" class="w-5 h-5"></i>
                    <h3 class="text-base font-black uppercase text-slate-900 dark:text-white">Análisis Financiero con IA</h3>
                </div>
                <button @click="aiModalOpen = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                    <p class="font-bold text-blue-900 dark:text-blue-300 mb-1">📊 Diagnóstico del Día:</p>
                    <p>El margen promedio de utilidad se sitúa en un saludable <strong>38.6%</strong>. Las ventas de snacks y botanas generan un retorno rápido con un margen del 40%, mientras que los productos de limpieza mantienen un flujo constante del 33.3%.</p>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                    <p class="font-bold text-emerald-900 dark:text-emerald-300 mb-1">💡 Recomendación Inteligente:</p>
                    <p>Incrementar el stock de <em>Yogurt Natural</em> para evitar quiebre de inventario y ofrecer promociones cruzadas con las botanas en caja para elevar el ticket promedio.</p>
                </div>
            </div>

            <div class="flex justify-end">
                <button @click="aiModalOpen = false" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase shadow-md shadow-blue-500/20">
                    Entendido
                </button>
            </div>
        </div>
    </div>

</div>
@endsection