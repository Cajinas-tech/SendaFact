@extends('layouts.app')

@section('title_badge', 'GESTIÃ“N DE PRODUCTOS E INVENTARIO')

@section('content')
<div class="space-y-6" x-data="{ createModal: false }">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Inventario de Productos</h2>
            <p class="text-xs text-slate-400 mt-0.5">Administra tu catÃ¡logo de productos, precios y existencias.</p>
        </div>
        <button @click="createModal = true" 
                class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-blue-500/25 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Nuevo Producto
        </button>
    </div>

    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">Producto</th>
                        <th class="p-4">SKU / Medidas</th>
                        <th class="p-4">CategorÃ­a</th>
                        <th class="p-4 text-right">Costo</th>
                        <th class="p-4 text-right">Precio Venta (C$)</th>
                        <th class="p-4 text-right">Precio Venta ($)</th>
                        <th class="p-4 text-center">Stock</th>
                        <th class="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($products as $p)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <img src="{{ $p->image_url ?? '/images/products/puerta-aluminio.svg' }}" class="w-10 h-10 object-contain rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <p class="font-black text-xs uppercase">{{ $p->name }}</p>
                                    <span class="text-[11px] text-slate-400 font-normal">{{ $p->subtitle }}</span>
                                </div>
                            </td>
                            <td class="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {{ $p->sku }}
                                @if($p->dimensions)
                                    <span class="block text-[10px] text-slate-400 font-normal">{{ $p->dimensions }}</span>
                                @endif
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {{ $p->category->name ?? 'General' }}
                                </span>
                            </td>
                            <td class="p-4 text-right font-mono font-semibold text-slate-500">
                                C${{ number_format($p->cost_price, 2) }}
                            </td>
                            <td class="p-4 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                                C${{ number_format($p->price_cordobas, 2) }}
                            </td>
                            <td class="p-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                ${{ number_format($p->price_usd, 2) }}
                            </td>
                            <td class="p-4 text-center">
                                <span class="px-2.5 py-1 rounded-full text-[11px] font-black {{ $p->stock <= $p->min_stock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700' }}">
                                    {{ $p->stock }} unid.
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <form action="{{ route('products.destroy', $p->id) }}" method="POST" onsubmit="return confirm('Â¿Eliminar producto?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                        <i data-lucide="trash" class="w-4 h-4"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- Modal Create Product -->
    <div x-show="createModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="createModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Registrar Nuevo Producto</h3>
                <button @click="createModal = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('products.store') }}" method="POST" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre del Producto</label>
                        <input type="text" name="name" required placeholder="Ej. Puerta de Aluminio y Vidrio 2x1m" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">CategorÃ­a</label>
                        <select name="category_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">SKU / CÃ³digo</label>
                        <input type="text" name="sku" required placeholder="Ej. #SKU-9901" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta (C$)</label>
                        <input type="number" step="0.01" name="price_cordobas" required placeholder="3500.00" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta ($ USD)</label>
                        <input type="number" step="0.01" name="price_usd" required placeholder="95.11" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Costo Unitario (C$)</label>
                        <input type="number" step="0.01" name="cost_price" required placeholder="2000.00" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Stock Inicial</label>
                        <input type="number" name="stock" required value="10" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Medidas / Especificaciones</label>
                        <input type="text" name="dimensions" placeholder="Ej. 2.10m alto x 0.80m ancho x 4.44cm espesor" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3">
                    <button type="button" @click="createModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25">Guardar Producto</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection