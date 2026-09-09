@extends('layouts.app')

@section('title_badge', 'CATÁLOGO DE PRODUCTOS (FICHAS)')

@section('content')
<div class="space-y-6" x-data="{ viewMode: 'grid' }">

    <!-- TOP BANNER CARD -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <i data-lucide="book-open" class="w-7 h-7"></i>
            </div>
            <div>
                <h2 class="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    CATÁLOGO DIGITAL DE PRODUCTOS
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes
                </p>

                <!-- Status Badges -->
                <div class="flex flex-wrap items-center gap-2.5 mt-4">
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 shadow-2xs">
                        {{ $totalFinishedGoods }} Productos Terminados
                    </span>
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {{ $categories->count() }} Categorías
                    </span>
                    <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
                        {{ $immediateStockCount }} en Existencia Inmediata
                    </span>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-start md:self-center">
            <a href="{{ route('catalog.pdf') }}" target="_blank" 
               class="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-blue-500/25 transition">
                <i data-lucide="download" class="w-4 h-4"></i>
                CATÁLOGO EN PDF
            </a>
            <button onclick="document.documentElement.requestFullscreen?.()" title="Pantalla Completa"
                    class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">
                <i data-lucide="maximize-2" class="w-4 h-4"></i>
            </button>
        </div>
    </div>

    <!-- FILTER & SEARCH BAR -->
    <div class="glass-card rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <form method="GET" action="{{ route('catalog.index') }}" class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            <!-- Search Input -->
            <div class="relative flex-1">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                <input type="text" name="search" value="{{ $search }}"
                       placeholder="Buscar por nombre, SKU, medidas (ej. 1.20m) o características..."
                       class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Filter Inventory -->
            <div class="flex items-center gap-2">
                <select name="sort" onchange="this.form.submit()" 
                        class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="name_asc" {{ $sort == 'name_asc' ? 'selected' : '' }}>Nombre (A - Z)</option>
                    <option value="name_desc" {{ $sort == 'name_desc' ? 'selected' : '' }}>Nombre (Z - A)</option>
                    <option value="price_asc" {{ $sort == 'price_asc' ? 'selected' : '' }}>Precio (Menor a Mayor)</option>
                    <option value="price_desc" {{ $sort == 'price_desc' ? 'selected' : '' }}>Precio (Mayor a Menor)</option>
                </select>

                <!-- Grid/List Switch -->
                <div class="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <button type="button" @click="viewMode = 'grid'" :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-400'" class="p-1.5 rounded-lg transition">
                        <i data-lucide="grid" class="w-4 h-4"></i>
                    </button>
                    <button type="button" @click="viewMode = 'list'" :class="viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-400'" class="p-1.5 rounded-lg transition">
                        <i data-lucide="list" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </form>

        <!-- Category Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <a href="{{ route('catalog.index', ['category' => 'all', 'search' => $search]) }}"
               class="px-4 py-1.5 rounded-full text-xs font-black uppercase transition shrink-0 {{ $selectedCategory == 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200' }}">
                Todas ({{ $products->count() }})
            </a>
            @foreach($categories as $cat)
                <a href="{{ route('catalog.index', ['category' => $cat->slug, 'search' => $search]) }}"
                   class="px-4 py-1.5 rounded-full text-xs font-black uppercase transition shrink-0 {{ $selectedCategory == $cat->slug ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200' }}">
                    {{ $cat->name }} {{ $cat->products_count }}
                </a>
            @endforeach
        </div>
    </div>

    <!-- PRODUCT CARDS GRID (AS IN IMAGE 1) -->
    <div x-show="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @forelse($products as $product)
            <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
                
                <!-- Product Image & Top Tags -->
                <div class="relative bg-slate-50 dark:bg-slate-900/50 p-6 flex items-center justify-center min-h-[260px] border-b border-slate-100 dark:border-slate-800">
                    
                    <!-- Top Category & Stock Badges -->
                    <div class="absolute top-4 left-4 z-10">
                        <span class="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-slate-800 text-white shadow-xs">
                            {{ $product->category->name ?? 'GENERAL' }}
                        </span>
                    </div>
                    <div class="absolute top-4 right-4 z-10">
                        <span class="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                            <i data-lucide="check" class="w-3 h-3"></i> {{ $product->stock }} en Stock
                        </span>
                    </div>

                    <!-- Visual Illustration / Photo -->
                    <div class="w-full h-48 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                        @php
                            $pImg = $product->image_url;
                            $fallbackSvg = (stripos($product->name, 'ventana') !== false) ? '/images/products/ventana-aluminio.svg' : '/images/products/puerta-aluminio.svg';
                            
                            if (empty($pImg) || $pImg === 'null' || (!str_starts_with($pImg, 'data:image') && !str_starts_with($pImg, 'http') && !str_starts_with($pImg, '/'))) {
                                if (stripos($product->name, 'puerta') !== false) {
                                    $pImg = '/images/products/puerta-aluminio.svg';
                                } elseif (stripos($product->name, 'ventana') !== false) {
                                    $pImg = '/images/products/ventana-aluminio.svg';
                                } else {
                                    $pImg = null;
                                }
                            }
                        @endphp
                        @if(!empty($pImg))
                            <img src="{{ $pImg }}" 
                                 alt="{{ $product->name }}" 
                                 onerror="this.onerror=null; this.src='{{ $fallbackSvg }}';"
                                 class="max-h-full max-w-full object-contain drop-shadow-md">
                        @else
                            <div class="w-32 h-32 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500">
                                <i data-lucide="package" class="w-16 h-16"></i>
                            </div>
                        @endif
                    </div>

                    <!-- SKU Tag Bottom Left -->
                    <div class="absolute bottom-3 left-4">
                        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-900/80 text-blue-200 border border-blue-700/50">
                            {{ $product->sku }}
                        </span>
                    </div>
                </div>

                <!-- Card Details Body -->
                <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-2.5">
                        <h3 class="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase leading-snug">
                            {{ $product->name }}
                        </h3>

                        <!-- Pill Specs -->
                        @if($product->subtitle)
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                <i data-lucide="paperclip" class="w-3.5 h-3.5 text-slate-400"></i>
                                <span class="truncate">{{ $product->subtitle }}</span>
                            </div>
                        @endif

                        @if($product->description)
                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {{ $product->description }}
                            </p>
                        @endif
                    </div>

                    <!-- Pricing Footer (Dual Currency C$ & USD) -->
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                        <div>
                            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">PRECIO VENTA</span>
                            <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                                C$ {{ number_format($product->price_cordobas, 2) }}
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                                ≈ ${{ number_format($product->price_usd, 2) }} USD
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        @empty
            <div class="col-span-full py-16 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800">
                <i data-lucide="search-x" class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"></i>
                <h4 class="text-base font-bold text-slate-700 dark:text-slate-300">No se encontraron productos</h4>
                <p class="text-xs text-slate-400 mt-1">Intenta con otros términos de búsqueda o selecciona otra categoría.</p>
            </div>
        @endforelse
    </div>

    <!-- LIST VIEW MODE -->
    <div x-show="viewMode === 'list'" class="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs" x-cloak>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <tr>
                        <th class="p-4">Producto</th>
                        <th class="p-4">SKU / Medidas</th>
                        <th class="p-4">Categoría</th>
                        <th class="p-4">Stock</th>
                        <th class="p-4 text-right">Precio (C$)</th>
                        <th class="p-4 text-right">Precio (USD)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @foreach($products as $product)
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                @php
                                    $listImg = $product->image_url ?? ((stripos($product->name, 'ventana') !== false) ? '/images/products/ventana-aluminio.svg' : '/images/products/puerta-aluminio.svg');
                                @endphp
                                <img src="{{ $listImg }}" 
                                     alt="{{ $product->name }}" 
                                     onerror="this.onerror=null; this.src='/images/products/puerta-aluminio.svg';"
                                     class="w-9 h-9 object-contain rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                <div>
                                    <p>{{ $product->name }}</p>
                                    <span class="text-[11px] text-slate-400">{{ $product->subtitle }}</span>
                                </div>
                            </td>
                            <td class="p-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                                {{ $product->sku }} • {{ $product->dimensions }}
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {{ $product->category->name ?? 'N/A' }}
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    {{ $product->stock }} unid.
                                </span>
                            </td>
                            <td class="p-4 text-right font-bold text-blue-600 dark:text-blue-400 font-mono">
                                C$ {{ number_format($product->price_cordobas, 2) }}
                            </td>
                            <td class="p-4 text-right font-bold text-slate-600 dark:text-slate-300 font-mono">
                                ${{ number_format($product->price_usd, 2) }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection