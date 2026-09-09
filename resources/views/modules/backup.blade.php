@extends('layouts.app')
@section('title_badge', 'BACKUP Y SEGURIDAD')
@section('content')
<div class="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
    <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
        <i data-lucide="shield-check" class="w-8 h-8"></i>
    </div>
    <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase">Respaldo y Seguridad</h2>
    <p class="text-xs text-slate-400">Tus datos estÃ¡n sincronizados en la nube con Supabase (PostgreSQL) con backups automÃ¡ticos y cifrado SSL.</p>
</div>
@endsection