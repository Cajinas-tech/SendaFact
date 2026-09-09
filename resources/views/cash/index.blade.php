@extends('layouts.app')

@section('title_badge', 'CONTROL DE CAJA Y ARQUEOS')

@section('content')
<div class="space-y-6" x-data="{ openModal: false, closeModal: false }">

    <!-- Active Box Status Header -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl {{ $current ? 'bg-emerald-500' : 'bg-rose-500' }} text-white flex items-center justify-center shadow-lg shrink-0">
                <i data-lucide="banknote" class="w-7 h-7"></i>
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase">
                        {{ $current ? 'Caja Principal - ABIERTA' : 'Caja Principal - CERRADA' }}
                    </h2>
                </div>
                @if($current)
                    <p class="text-xs text-slate-400 mt-1">
                        Abierta por <strong>{{ $current->user->name ?? 'Jairo' }}</strong> el {{ $current->opened_at->format('d/m/Y h:i A') }} con un fondo inicial de <strong>C${{ number_format($current->opening_amount, 2) }}</strong>
                    </p>
                @else
                    <p class="text-xs text-rose-500 font-semibold mt-1">No hay una sesiÃ³n de caja activa. Debes abrir caja para facturar en efectivo.</p>
                @endif
            </div>
        </div>

        <div class="flex items-center gap-3">
            @if($current)
                <button @click="closeModal = true" 
                        class="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 transition">
                    Cerrar y Arqueo de Caja
                </button>
            @else
                <button @click="openModal = true" 
                        class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 transition">
                    Abrir Nueva Caja
                </button>
            @endif
        </div>
    </div>

    <!-- History of Cash Registers -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Historial de Turnos y Cierres</h3>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">Cajero / Usuario</th>
                        <th class="p-4">Apertura</th>
                        <th class="p-4">Cierre</th>
                        <th class="p-4 text-right">Monto Inicial</th>
                        <th class="p-4 text-right">Monto Cierre</th>
                        <th class="p-4 text-center">Estado</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($registers as $reg)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4 font-bold text-slate-900 dark:text-white">{{ $reg->user->name ?? 'Jairo' }}</td>
                            <td class="p-4 font-mono text-slate-600 dark:text-slate-300">{{ $reg->opened_at->format('d/m/Y h:i A') }}</td>
                            <td class="p-4 font-mono text-slate-600 dark:text-slate-300">{{ $reg->closed_at ? $reg->closed_at->format('d/m/Y h:i A') : 'En curso' }}</td>
                            <td class="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">C${{ number_format($reg->opening_amount, 2) }}</td>
                            <td class="p-4 text-right font-mono font-bold text-emerald-600">{{ $reg->closing_amount ? 'C$' . number_format($reg->closing_amount, 2) : '---' }}</td>
                            <td class="p-4 text-center">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase {{ $reg->status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600' }}">
                                    {{ $reg->status === 'open' ? 'Abierta' : 'Cerrada' }}
                                </span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- Open Modal -->
    <div x-show="openModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="openModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Apertura de Caja</h3>
            <form action="{{ route('cash.open') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Monto Inicial en Efectivo (C$)</label>
                    <input type="number" step="0.01" name="opening_amount" required value="1000.00" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Notas</label>
                    <input type="text" name="notes" placeholder="Turno Matutino" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" @click="openModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase">Abrir Caja</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Close Modal -->
    @if($current)
    <div x-show="closeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="closeModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Cierre y Arqueo de Caja</h3>
            <form action="{{ route('cash.close', $current->id) }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Monto Total Contado al Cierre (C$)</label>
                    <input type="number" step="0.01" name="closing_amount" required value="1025.30" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Observaciones</label>
                    <input type="text" name="notes" placeholder="Cierre conforme sin diferencias" class="w-full px-4 py-2.5 rounded-xl border text-xs">
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" @click="closeModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase">Confirmar Cierre</button>
                </div>
            </form>
        </div>
    </div>
    @endif
</div>
@endsection