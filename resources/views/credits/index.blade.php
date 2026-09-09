@extends('layouts.app')

@section('title_badge', 'GESTIÓN DE CRÉDITOS Y CUENTAS POR COBRAR')

@section('content')
<div class="space-y-6">

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-rose-500">TOTAL POR COBRAR</span>
                <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${{ number_format($totalOwed, 2) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <i data-lucide="alert-circle" class="w-6 h-6"></i>
            </div>
        </div>

        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">TOTAL PRESTADO (FIADO)</span>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mt-1">${{ number_format($totalLent, 2) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <i data-lucide="hand-coins" class="w-6 h-6"></i>
            </div>
        </div>

        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-500">TOTAL RECUPERADO</span>
                <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${{ number_format($totalPaid, 2) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <i data-lucide="check-check" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <!-- Credits List Table -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Cuentas por Cobrar Activas</h3>
                <p class="text-xs text-slate-400 mt-0.5">Control de créditos a clientes y seguimiento de cobranza</p>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">Código / Cliente</th>
                        <th class="p-4">Prestado</th>
                        <th class="p-4">Pagado</th>
                        <th class="p-4">Saldo Pendiente</th>
                        <th class="p-4">Progreso</th>
                        <th class="p-4">Vencimiento</th>
                        <th class="p-4">Estado</th>
                        <th class="p-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($credits as $credit)
                        @php
                            $pct = $credit->total_amount > 0 ? round(($credit->paid_amount / $credit->total_amount) * 100, 0) : 0;
                        @endphp
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                        {{ substr($credit->customer->name ?? 'C', 0, 2) }}
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ $credit->customer->name ?? 'Cliente Desconocido' }}</h4>
                                        <span class="text-[11px] font-mono text-slate-400">#{{ $credit->credit_code }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">${{ number_format($credit->total_amount, 2) }}</td>
                            <td class="p-4 font-mono font-bold text-emerald-600">${{ number_format($credit->paid_amount, 2) }}</td>
                            <td class="p-4 font-mono font-black text-rose-600 dark:text-rose-400 text-sm">${{ number_format($credit->remaining_amount, 2) }}</td>
                            <td class="p-4 w-36">
                                <div class="flex items-center gap-2">
                                    <div class="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div class="bg-emerald-500 h-full rounded-full" style="width: {{ $pct }}%"></div>
                                    </div>
                                    <span class="text-[11px] font-bold text-slate-500">{{ $pct }}%</span>
                                </div>
                            </td>
                            <td class="p-4 font-medium text-slate-600 dark:text-slate-400">
                                {{ !empty($credit->due_date) ? \Carbon\Carbon::parse($credit->due_date)->format('d/m/Y') : '---' }}
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase {{ $credit->status === 'activo' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700' }}">
                                    {{ $credit->status }}
                                </span>
                            </td>
                            <td class="p-4 text-right">
                                <a href="{{ route('credits.show', $credit->id) }}" 
                                   class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs">
                                    Ver Detalle <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection