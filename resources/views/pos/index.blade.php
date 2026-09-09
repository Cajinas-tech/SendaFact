@extends('layouts.app')

@section('title_badge', 'VENTAS / PUNTO DE VENTA (POS)')

@section('content')
@php
    $posProps = [
        'initialProducts' => $products,
        'initialCategories' => $categories,
        'initialCustomers' => $customers,
        'setting' => $setting ?? ['exchange_rate' => 36.80],
    ];
@endphp

<!-- REACT POS MOUNT CONTAINER -->
<div id="pos-root" data-props="{{ json_encode($posProps) }}">
    <div class="py-20 flex flex-col items-center justify-center space-y-4">
        <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargando Módulo POS en React...</p>
    </div>
</div>
@endsection

@push('scripts')
@vite(['resources/js/pos.jsx'])
@endpush