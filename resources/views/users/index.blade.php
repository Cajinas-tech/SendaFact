@extends('layouts.app')

@section('title_badge', 'GESTIÓN DE USUARIOS Y ROLES')

@section('content')
<div class="space-y-6" x-data="{ createModal: false }">

    <!-- Header & Actions -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Usuarios del Sistema</h2>
            <p class="text-xs text-slate-400 mt-0.5">Control de cuentas de acceso y roles (Administrador, Cajero, Vendedor)</p>
        </div>
        
        <button @click="createModal = true" 
                class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-blue-500/25 transition">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            Nuevo Usuario
        </button>
    </div>

    <!-- Users Table -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">Usuario</th>
                        <th class="p-4">Correo Electrónico</th>
                        <th class="p-4">Teléfono</th>
                        <th class="p-4 text-center">Rol de Acceso</th>
                        <th class="p-4 text-center">Estado</th>
                        <th class="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($users as $user)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs {{ $user->role === 'administrador' ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600' : ($user->role === 'cajero' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600') }}">
                                    {{ substr($user->name, 0, 2) }}
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ $user->name }}</h4>
                                    <span class="text-[11px] text-slate-400">ID: #{{ $user->id }}</span>
                                </div>
                            </td>
                            <td class="p-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                                {{ $user->email }}
                            </td>
                            <td class="p-4 font-mono text-slate-500">
                                {{ $user->phone ?? 'Sin registrar' }}
                            </td>
                            <td class="p-4 text-center">
                                @if($user->role === 'administrador')
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80">
                                        👑 ADMINISTRADOR
                                    </span>
                                @elseif($user->role === 'cajero')
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80">
                                        💵 CAJERO
                                    </span>
                                @else
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80">
                                        🏷️ VENDEDOR
                                    </span>
                                @endif
                            </td>
                            <td class="p-4 text-center">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                                    Activo
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                @if($user->id !== auth()->id())
                                    <form action="{{ route('users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('¿Eliminar usuario?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                            <i data-lucide="trash" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                @else
                                    <span class="text-[10px] font-bold text-slate-400">En sesión</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- CREATE USER MODAL -->
    <div x-show="createModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="createModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Registrar Nuevo Usuario</h3>
                <button @click="createModal = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('users.store') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre Completo</label>
                    <input type="text" name="name" required placeholder="Ej. Roberto Gómez" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Correo Electrónico</label>
                    <input type="email" name="email" required placeholder="roberto@sendasistemas.com" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Rol en el Sistema</label>
                    <select name="role" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                        <option value="administrador">👑 Administrador (Acceso total)</option>
                        <option value="cajero" selected>💵 Cajero (POS, Caja y Cobros)</option>
                        <option value="vendedor">🏷️ Vendedor (POS y Catálogo)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Teléfono</label>
                    <input type="text" name="phone" placeholder="+505 8888 9999" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Contraseña</label>
                    <input type="password" name="password" required placeholder="••••••••" 
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                </div>

                <div class="flex justify-end gap-2 pt-3">
                    <button type="button" @click="createModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25">Guardar Usuario</button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection