@extends('layouts.app')

@section('title_badge', 'GESTIÓN DE PRODUCTOS')

@section('content')
<div class="space-y-6" x-data="{ 
    createModal: false, 
    editModal: false, 
    currentProduct: {},
    searchTerm: '' 
}">

    <!-- TARJETA SUPERIOR: CABECERA Y BARRA DE ACCIONES -->
    <div class="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Título e Ícono -->
        <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
                <i data-lucide="package" class="w-5 h-5"></i>
            </div>
            <div>
                <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    GESTIÓN DE PRODUCTOS
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Gestione el catálogo de ventas y precios de sus artículos
                </p>
            </div>
        </div>

        <!-- Barra de Herramientas y Acciones -->
        <div class="flex flex-wrap items-center gap-2.5">
            <!-- Buscador -->
            <div class="relative w-full sm:w-64">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input type="text" 
                       x-model="searchTerm"
                       placeholder="Buscar productos..." 
                       class="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition">
            </div>

            <!-- Botón Exportar CSV -->
            <a href="{{ route('backup.export-csv') }}" 
               class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs">
                <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i>
                <span>CSV</span>
            </a>

            <!-- Botón Exportar PDF -->
            <a href="{{ route('catalog.pdf') }}" target="_blank"
               class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs">
                <i data-lucide="file-text" class="w-4 h-4 text-rose-500"></i>
                <span>PDF</span>
            </a>

            <!-- Botón Ver Catálogo -->
            <a href="{{ route('catalog.index') }}" 
               class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition shadow-2xs">
                <i data-lucide="book-open" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i>
                <span>Ver Catálogo</span>
            </a>

            <!-- Botón Nuevo Producto -->
            <button @click="createModal = true" 
                    class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold tracking-wide uppercase shadow-md shadow-blue-500/25 transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>+ Nuevo Producto</span>
            </button>
        </div>
    </div>

    <!-- TABLA DE PRODUCTOS -->
    <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a]">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                    <tr>
                        <th class="p-4 w-20">IMAGEN</th>
                        <th class="p-4 w-28">CÓDIGO</th>
                        <th class="p-4 min-w-[220px]">NOMBRE</th>
                        <th class="p-4 text-center">CATEGORÍA</th>
                        <th class="p-4 font-black">PRECIO</th>
                        <th class="p-4 text-center">STOCK</th>
                        <th class="p-4 text-center">FECHA VENC.</th>
                        <th class="p-4 text-center">ACT. PRECIO</th>
                        <th class="p-4 text-center">ACCIONES</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @forelse($products as $p)
                        @php
                            $imgSrc = '/images/products/puerta-aluminio.svg';
                            if (!empty($p->image_url)) {
                                $imgSrc = $p->image_url;
                            } elseif (stripos($p->name, 'ventana') !== false) {
                                $imgSrc = '/images/products/ventana-aluminio.svg';
                            }
                            $catName = $p->category->name ?? ($p->category_name ?? 'GENERAL');
                            $subtitle = $p->subtitle ?? 'UNIDAD • TERMINADO';
                            if (empty($subtitle) && !empty($p->dimensions)) {
                                $subtitle = $p->dimensions . ' • TERMINADO';
                            }
                            $expiryDate = !empty($p->expiry_date) ? $p->expiry_date : '2026-09-05';
                            $actDate = !empty($p->updated_at) ? (\Carbon\Carbon::parse($p->updated_at)->format('Y-m-d')) : '2026-09-05';
                        @endphp
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition" 
                            x-show="!searchTerm || '{{ strtolower($p->name . ' ' . $p->sku . ' ' . $catName) }}'.includes(searchTerm.toLowerCase())">
                            
                            <!-- IMAGEN -->
                            <td class="p-4">
                                <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shadow-2xs">
                                    <img src="{{ $imgSrc }}" alt="{{ $p->name }}" class="w-full h-full object-contain">
                                </div>
                            </td>

                            <!-- CÓDIGO -->
                            <td class="p-4 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {{ $p->sku ?? '#SKU-' . $p->id }}
                            </td>

                            <!-- NOMBRE -->
                            <td class="p-4">
                                <h3 class="font-extrabold text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight">
                                    {{ $p->name }}
                                </h3>
                                <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
                                    {{ $subtitle }}
                                </p>
                            </td>

                            <!-- CATEGORÍA -->
                            <td class="p-4 text-center">
                                <span class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 tracking-wider">
                                    {{ strtoupper($catName) }}
                                </span>
                            </td>

                            <!-- PRECIO -->
                            <td class="p-4 font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                                C${{ number_format($p->price_cordobas ?? 0, 2) }}
                            </td>

                            <!-- STOCK -->
                            <td class="p-4 text-center">
                                <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {{ $p->stock ?? 0 }}
                                </span>
                            </td>

                            <!-- FECHA VENC. -->
                            <td class="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                                {{ $expiryDate }}
                            </td>

                            <!-- ACT. PRECIO -->
                            <td class="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                                {{ $actDate }}
                            </td>

                            <!-- ACCIONES -->
                            <td class="p-4 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <!-- Botón Editar -->
                                    <button type="button" 
                                            @click="currentProduct = {{ json_encode($p) }}; editModal = true" 
                                            class="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs"
                                            title="Editar producto">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </button>

                                    <!-- Botón Eliminar -->
                                    <form action="{{ route('products.destroy', $p->id) }}" method="POST" onsubmit="return confirm('¿Eliminar producto {{ $p->name }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" 
                                                class="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-2xs"
                                                title="Eliminar producto">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="p-8 text-center text-slate-400">
                                No se encontraron productos registrados en el sistema.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(method_exists($products, 'links'))
            <div class="p-4 border-t border-slate-100 dark:border-slate-800">
                {{ $products->links() }}
            </div>
        @endif
    </div>

    <!-- MODAL REGISTRAR NUEVO PRODUCTO -->
    <div x-show="createModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="createModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>
                    </div>
                    <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Registrar Nuevo Producto</h3>
                </div>
                <button @click="createModal = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('products.store') }}" method="POST" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre del Producto</label>
                        <input type="text" name="name" required placeholder="Ej. PUERTA DE ALUMINIO-VIDRIO" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Categoría</label>
                        <select name="category_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}">{{ strtoupper($cat->name) }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">SKU / Código</label>
                        <input type="text" name="sku" required placeholder="#SKU-9859" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta (C$ Córdobas)</label>
                        <input type="number" step="0.01" name="price_cordobas" required placeholder="3500.00" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-blue-600">
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
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Subtítulo / Unidad / Medidas</label>
                        <input type="text" name="subtitle" placeholder="Ej. UNIDAD • TERMINADO" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" @click="createModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25">Guardar Producto</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL EDITAR PRODUCTO -->
    <div x-show="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div @click.away="editModal = false" class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </div>
                    <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Editar Producto</h3>
                </div>
                <button @click="editModal = false" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form :action="'/productos/' + currentProduct.id" method="POST" class="space-y-4">
                @csrf
                @method('PUT')
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre del Producto</label>
                        <input type="text" name="name" :value="currentProduct.name" required
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">SKU / Código</label>
                        <input type="text" name="sku" :value="currentProduct.sku" required 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta (C$ Córdobas)</label>
                        <input type="number" step="0.01" name="price_cordobas" :value="currentProduct.price_cordobas" required 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-blue-600">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Stock</label>
                        <input type="number" name="stock" :value="currentProduct.stock" required 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold">
                    </div>

                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Subtítulo / Unidad / Medidas</label>
                        <input type="text" name="subtitle" :value="currentProduct.subtitle" 
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" @click="editModal = false" class="px-4 py-2.5 rounded-xl border text-xs font-bold">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25">Actualizar Producto</button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection