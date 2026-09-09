@extends('layouts.app')

@section('title_badge', 'DASHBOARD / ESTADÍSTICAS')

@section('content')
<div class="space-y-6">
    
    <!-- 4 TOP KPI CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Card 1: Ventas del Día -->
        <div class="glass-card rounded-2xl p-5 shadow-xs flex items-center justify-between border border-slate-200/80 dark:border-slate-800">
            <div class="space-y-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">VENTAS DEL DÍA</span>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white">
                    C${{ number_format($todaySalesCordobas, 2) }}
                </h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <i data-lucide="trending-up" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card 2: Total Productos -->
        <div class="glass-card rounded-2xl p-5 shadow-xs flex items-center justify-between border border-slate-200/80 dark:border-slate-800">
            <div class="space-y-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">TOTAL PRODUCTOS</span>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white">
                    {{ $totalProducts }}
                </h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <i data-lucide="package" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card 3: Próximos a Vencer -->
        <div class="glass-card rounded-2xl p-5 shadow-xs flex items-center justify-between border border-slate-200/80 dark:border-slate-800">
            <div class="space-y-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">PRÓXIMOS A VENCER</span>
                <div class="flex items-baseline gap-2">
                    <h3 class="text-2xl font-black text-slate-800 dark:text-white">{{ $expiringProducts->count() }}</h3>
                    <span class="text-xs font-semibold text-slate-400">productos</span>
                </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <i data-lucide="alert-octagon" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Card 4: Estado de Caja -->
        <div class="glass-card rounded-2xl p-5 shadow-xs flex items-center justify-between border border-slate-200/80 dark:border-slate-800">
            <div class="space-y-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ESTADO DE CAJA</span>
                <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {{ $cashStatus }}
                </h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                <i data-lucide="wallet" class="w-6 h-6"></i>
            </div>
        </div>

    </div>

    <!-- 3 CHARTS ROW (CIRCULAR / DONUT CHARTS) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Chart 1: Resumen del Sistema -->
        <div class="glass-card rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="pie-chart" class="w-5 h-5 text-blue-500"></i>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">RESUMEN DEL SISTEMA</h4>
            </div>
            
            <div class="relative flex items-center justify-center h-48 my-2">
                <canvas id="chartSystemSummary"></canvas>
            </div>

            <!-- Legend Grid -->
            <div class="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-slate-500">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stock Fís.:
                    </span>
                    <span class="text-slate-800 dark:text-white font-bold">{{ $totalPhysicalStock }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-slate-500">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Cat. Prod:
                    </span>
                    <span class="text-slate-800 dark:text-white font-bold">{{ $totalProducts }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-slate-500">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Categorías:
                    </span>
                    <span class="text-slate-800 dark:text-white font-bold">{{ $totalCategories }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-slate-500">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Ventas Reg.:
                    </span>
                    <span class="text-slate-800 dark:text-white font-bold">{{ $totalSalesCount }}</span>
                </div>
            </div>
        </div>

        <!-- Chart 2: Stock por Categoría -->
        <div class="glass-card rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="donut" class="w-5 h-5 text-cyan-500"></i>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">STOCK POR CATEGORÍA</h4>
            </div>

            <div class="relative flex items-center justify-center h-48 my-2">
                <canvas id="chartStockCategory"></canvas>
            </div>

            <div class="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                @foreach($categoryStockLabels as $index => $label)
                    @if($index < 4)
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-1.5 text-slate-500 truncate">
                                <span class="w-2.5 h-2.5 rounded-full" style="background-color: {{ ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][$index % 4] }};"></span> 
                                {{ $label }}:
                            </span>
                            <span class="text-slate-800 dark:text-white font-bold">{{ $categoryStockData[$index] }}</span>
                        </div>
                    @endif
                @endforeach
            </div>
        </div>

        <!-- Chart 3: Ventas por Categoría -->
        <div class="glass-card rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="trending-up" class="w-5 h-5 text-purple-500"></i>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">VENTAS POR CATEGORÍA (C$)</h4>
            </div>

            <div class="relative flex items-center justify-center h-48 my-2">
                <canvas id="chartSalesCategory"></canvas>
            </div>

            <div class="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                @foreach($categorySalesLabels as $index => $label)
                    @if($index < 4)
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-1.5 text-slate-500 truncate">
                                <span class="w-2.5 h-2.5 rounded-full" style="background-color: {{ ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][$index % 4] }};"></span> 
                                {{ $label }}:
                            </span>
                            <span class="text-slate-800 dark:text-white font-bold">C${{ number_format($categorySalesData[$index], 0) }}</span>
                        </div>
                    @endif
                @endforeach
            </div>
        </div>

    </div>

    <!-- BOTTOM ROW: ALERTS & RECENT QUOTES / EXPIRING -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: Productos con Stock Bajo -->
        <div class="glass-card rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
                    <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">PRODUCTOS CON STOCK BAJO</h4>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                    {{ $lowStockProducts->count() }} alertas
                </span>
            </div>

            @if($lowStockProducts->count() > 0)
                <div class="space-y-3">
                    @foreach($lowStockProducts as $prod)
                        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div class="flex items-center gap-3">
                                <span class="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                                <div>
                                    <h5 class="text-sm font-bold text-slate-800 dark:text-white">{{ $prod->name }}</h5>
                                    <p class="text-xs text-slate-400">{{ $prod->category->name ?? 'General' }} • SKU: {{ $prod->sku }}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                Quedan {{ $prod->stock }}
                            </span>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="py-8 text-center text-slate-400 text-sm">
                    <i data-lucide="check-circle" class="w-8 h-8 mx-auto text-emerald-500/60 mb-2"></i>
                    No hay productos con alertas de stock en este momento.
                </div>
            @endif
        </div>

        <!-- Right: Productos Próximos a Vencer (30-45 días) -->
        <div class="glass-card rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="calendar-clock" class="w-5 h-5 text-rose-500"></i>
                    <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">PRODUCTOS PRÓXIMOS A VENCER (30-45 DÍAS)</h4>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {{ $expiringProducts->count() }} próximos
                </span>
            </div>

            @if($expiringProducts->count() > 0)
                <div class="space-y-3">
                    @foreach($expiringProducts as $prod)
                        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div>
                                <h5 class="text-sm font-bold text-slate-800 dark:text-white">{{ $prod->name }}</h5>
                                <p class="text-xs text-slate-400 mt-0.5">Vence: {{ \Carbon\Carbon::parse($prod->expiry_date)->format('d/m/Y') }} • Stock: {{ $prod->stock }} unid.</p>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                                {{ \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($prod->expiry_date)) }} días
                            </span>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="py-12 text-center text-slate-400 space-y-2">
                    <i data-lucide="calendar" class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600"></i>
                    <p class="text-xs">No hay vencimientos cercanos</p>
                </div>
            @endif
        </div>

    </div>

</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Chart 1: Resumen del Sistema
        const ctxSummary = document.getElementById('chartSystemSummary').getContext('2d');
        new Chart(ctxSummary, {
            type: 'pie',
            data: {
                labels: ['Stock Físico', 'Cat. Prod', 'Categorías', 'Ventas Reg.'],
                datasets: [{
                    data: [{{ $totalPhysicalStock }}, {{ $totalProducts }}, {{ $totalCategories }}, {{ $totalSalesCount }}],
                    backgroundColor: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        // Chart 2: Stock por Categoría
        const ctxStock = document.getElementById('chartStockCategory').getContext('2d');
        new Chart(ctxStock, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode($categoryStockLabels) !!},
                datasets: [{
                    data: {!! json_encode($categoryStockData) !!},
                    backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0,
                    cutout: '65%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        // Chart 3: Ventas por Categoría
        const ctxSales = document.getElementById('chartSalesCategory').getContext('2d');
        new Chart(ctxSales, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode($categorySalesLabels) !!},
                datasets: [{
                    data: {!! json_encode($categorySalesData) !!},
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
                    borderWidth: 0,
                    cutout: '65%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    });
</script>
@endpush