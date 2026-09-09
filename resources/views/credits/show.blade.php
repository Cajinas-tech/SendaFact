@extends('layouts.app')

@section('title_badge', 'DETALLE DE CRÉDITO DE CLIENTE')

@section('content')
<div class="max-w-5xl mx-auto space-y-6" x-data="{ showPaymentModal: false }">

    <!-- Top Navigation & Actions -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="{{ route('credits.index') }}" 
               class="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </a>
            <div>
                <div class="flex items-center gap-2">
                    <h2 class="text-lg font-black text-slate-900 dark:text-white">
                        Crédito de {{ $credit->customer->name }}
                    </h2>
                    <span class="text-xs font-mono font-bold text-slate-400">#{{ $credit->credit_code }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        {{ strtoupper($credit->status) }}
                    </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">Cobra fácil y revisa el historial de pagos.</p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <button @click="showPaymentModal = true" 
                    class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-emerald-500/25 transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                REGISTRAR PAGO
            </button>
        </div>
    </div>

    <!-- MAIN CREDIT CARD (EXACTLY AS SCREENSHOT 4) -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        
        <!-- TE DEBE AHORA HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">TE DEBE AHORA</span>
                <div class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans mt-1">
                    ${{ number_format($credit->remaining_amount, 2) }}
                </div>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Prestaste ${{ number_format($credit->total_amount, 2) }}
                </p>
            </div>

            <!-- Due date pill -->
            <div class="self-start sm:self-center">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 text-xs font-bold">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                    <span>Vence {{ \Carbon\Carbon::parse($credit->due_date)->format('d \d\e F') }} • {{ $daysLeftText }}</span>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-2">
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: {{ $paidPercentage }}%"></div>
            </div>
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Ha pagado ${{ number_format($credit->paid_amount, 2) }} de ${{ number_format($credit->total_amount, 2) }}</span>
                <span class="text-emerald-600 dark:text-emerald-400">{{ $paidPercentage }}%</span>
            </div>
        </div>

        <!-- Quick Action Buttons: WhatsApp & Call -->
        <div class="flex flex-wrap items-center gap-3 pt-2">
            @php
                $cleanPhone = preg_replace('/[^0-9]/', '', $credit->customer->phone ?? '444334405');
            @endphp
            <a href="https://wa.me/{{ $cleanPhone }}?text={{ $whatsappMessage }}" target="_blank"
               class="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60 transition shadow-2xs">
                <i data-lucide="message-circle" class="w-4 h-4 text-emerald-600"></i>
                WhatsApp
            </a>

            <a href="tel:{{ $cleanPhone }}"
               class="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition">
                <i data-lucide="phone" class="w-4 h-4 text-slate-500"></i>
                Llamar
            </a>

            <span class="text-xs font-mono font-semibold text-slate-400 ml-auto hidden sm:inline-block">
                Tel: {{ $credit->customer->phone ?? '444334405' }}
            </span>
        </div>

        <!-- Metadata Summary Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
                <span class="text-[10px] uppercase font-bold text-slate-400">Interés</span>
                <p class="font-extrabold text-slate-800 dark:text-white">{{ $credit->interest_rate_annual }}% Anual</p>
            </div>
            <div>
                <span class="text-[10px] uppercase font-bold text-slate-400">Prestado</span>
                <p class="font-extrabold text-slate-800 dark:text-white">${{ number_format($credit->total_amount, 2) }}</p>
            </div>
            <div>
                <span class="text-[10px] uppercase font-bold text-slate-400">Se fio el</span>
                <p class="font-extrabold text-slate-800 dark:text-white">{{ !empty($credit->fio_date) ? \Carbon\Carbon::parse($credit->fio_date)->format('d/m/Y') : '---' }}</p>
            </div>
            <div>
                <span class="text-[10px] uppercase font-bold text-slate-400">Vence</span>
                <p class="font-extrabold text-slate-800 dark:text-white">{{ !empty($credit->due_date) ? \Carbon\Carbon::parse($credit->due_date)->format('d/m/Y') : '---' }}</p>
            </div>
        </div>

        <!-- Tip Notice -->
        <div class="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <i data-lucide="trending-up" class="w-4 h-4 shrink-0"></i>
            <span>Si no abona nada, el {{ !empty($credit->due_date) ? \Carbon\Carbon::parse($credit->due_date)->format('d \d\e M, Y') : 'vencimiento' }} deberá ${{ number_format(($credit->remaining_amount ?? 0) * 1.0012, 2) }} {{ $daysLeftText ?? '' }}</span>
        </div>

    </div>

    <!-- TABLE: PRODUCTOS VENDIDOS (FIADOS) -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Productos Vendidos</h3>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">PRODUCTO</th>
                        <th class="p-4 text-center">CANTIDAD</th>
                        <th class="p-4 text-right">PRECIO</th>
                        <th class="p-4 text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($sampleItems as $item)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4 font-bold text-slate-900 dark:text-white">{{ $item['name'] }}</td>
                            <td class="p-4 text-center font-mono font-semibold">{{ $item['qty'] }}</td>
                            <td class="p-4 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">${{ number_format($item['price'], 2) }}</td>
                            <td class="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">${{ number_format($item['total'], 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- PAYMENT MODAL -->
    <div x-show="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="showPaymentModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Registrar Abono a Crédito</h3>
                <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('credits.pay', $credit->id) }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Monto del Abono ($ USD)</label>
                    <input type="number" step="0.01" name="amount" max="{{ $credit->remaining_amount }}" required
                           value="{{ $credit->remaining_amount }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold focus:ring-2 focus:ring-emerald-500">
                    <p class="text-[11px] text-slate-400 mt-1">Saldo pendiente: ${{ number_format($credit->remaining_amount, 2) }}</p>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Método de Pago</label>
                    <select name="payment_method" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="tarjeta">Tarjeta Débito/Crédito</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Notas / Referencia</label>
                    <input type="text" name="notes" placeholder="Ej. Abono en efectivo en caja" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" @click="showPaymentModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase shadow-md shadow-emerald-500/20">Confirmar Abono</button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection