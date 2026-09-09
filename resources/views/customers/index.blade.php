@extends('layouts.app')

@section('title_badge', 'GESTIÓN DE CLIENTES')

@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Directorio de Clientes</h2>
            <p class="text-xs text-slate-400 mt-0.5">Control de cartera de clientes, límites de crédito y contacto (Nicaragua)</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @foreach($customers as $c)
            <div class="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                        {{ substr($c->name, 0, 2) }}
                    </div>
                    <div>
                        <h4 class="font-black text-sm text-slate-900 dark:text-white">{{ $c->name }}</h4>
                        <p class="text-xs text-slate-400">Tel: {{ $c->phone ?? 'Sin teléfono' }}</p>
                    </div>
                </div>

                <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-400">Deuda Actual:</span>
                        <span class="font-mono font-bold text-rose-600">C${{ number_format(($c->current_debt ?? 0) * 36.8, 2) }} <span class="text-[10px] text-slate-400 font-normal">(${{ number_format($c->current_debt ?? 0, 2) }})</span></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Límite Crédito:</span>
                        <span class="font-mono font-bold text-slate-700 dark:text-slate-300">C${{ number_format(($c->credit_limit ?? 0) * 36.8, 2) }}</span>
                    </div>
                </div>

                @if(!empty($c->phone))
                    <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $c->phone) }}" target="_blank"
                       class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition">
                        <i data-lucide="message-circle" class="w-4 h-4 text-emerald-600"></i>
                        Contactar por WhatsApp
                    </a>
                @endif
            </div>
        @endforeach
    </div>
</div>
@endsection