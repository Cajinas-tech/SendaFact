@extends('layouts.app')

@section('title_badge', 'CATÁLOGO DE PRODUCTOS (FICHAS)')

@section('content')
<div class="space-y-6" x-data="{ 
    viewMode: 'grid',
    selectedProduct: null,
    copied: false,
    openModal(p) {
        this.selectedProduct = p;
    },
    closeModal() {
        this.selectedProduct = null;
    },
    copyFicha() {
        if (!this.selectedProduct) return;
        const p = this.selectedProduct;
        const text = `📋 *FICHA TÉCNICA Y COMERCIAL*\n` +
          `*Producto:* ${p.name}\n` +
          `*SKU:* ${p.sku}\n` +
          (p.unit ? `*Unidad:* ${p.unit}\n` : '') +
          (p.dimensions ? `*Medidas:* ${p.dimensions}\n` : '') +
          `*Precio:* C$ ${parseFloat(p.price_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })} (≈ $${parseFloat(p.price_usd || 0).toFixed(2)} USD)\n` +
          `*Disponibilidad:* ${p.stock} unidades en stock\n` +
          (p.description ? `*Detalle:* ${p.description}\n` : '');
        navigator.clipboard.writeText(text);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
    },
    shareWhatsApp() {
        if (!this.selectedProduct) return;
        const p = this.selectedProduct;
        const text = `Hola! Me gustaría cotizar este producto:\n` +
          `*${p.name}* (SKU: ${p.sku})\n` +
          (p.dimensions ? `Medidas: ${p.dimensions}\n` : '') +
          `Precio: C$ ${parseFloat(p.price_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })} (≈ $${parseFloat(p.price_usd || 0).toFixed(2)} USD)`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}">

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
            @php
                $pImg = $product->image_url ?? null;
                $fallbackSvg = (stripos($product->name ?? '', 'ventana') !== false) ? '/images/products/ventana-aluminio.svg' : '/images/products/puerta-aluminio.svg';
                
                if (empty($pImg) || $pImg === 'null' || (!str_starts_with($pImg, 'data:image') && !str_starts_with($pImg, 'http') && !str_starts_with($pImg, '/'))) {
                    if (stripos($product->name ?? '', 'puerta') !== false) {
                        $pImg = '/images/products/puerta-aluminio.svg';
                    } elseif (stripos($product->name ?? '', 'ventana') !== false) {
                        $pImg = '/images/products/ventana-aluminio.svg';
                    } else {
                        $pImg = null;
                    }
                }
                $jsProduct = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'subtitle' => $product->subtitle,
                    'description' => $product->description,
                    'unit' => $product->unit ?? 'UNIDAD',
                    'dimensions' => $product->dimensions,
                    'stock' => $product->stock,
                    'price_cordobas' => $product->price_cordobas,
                    'price_usd' => $product->price_usd,
                    'category_name' => $product->category->name ?? 'GENERAL',
                    'image_url' => $pImg ?: $fallbackSvg,
                    'fallback_svg' => $fallbackSvg,
                ];
            @endphp
            <div @click="openModal({{ json_encode($jsProduct) }})"
                 class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer">
                
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

                    <div class="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white shadow-sm">
                            <i data-lucide="eye" class="w-3 h-3"></i> Ver Ficha
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
                        @php
                            $listFallback = (stripos($product->name, 'ventana') !== false) ? '/images/products/ventana-aluminio.svg' : '/images/products/puerta-aluminio.svg';
                            $listImg = $product->image_url ?: $listFallback;
                            $jsProductList = [
                                'id' => $product->id,
                                'name' => $product->name,
                                'sku' => $product->sku,
                                'subtitle' => $product->subtitle,
                                'description' => $product->description,
                                'unit' => $product->unit ?? 'UNIDAD',
                                'dimensions' => $product->dimensions,
                                'stock' => $product->stock,
                                'price_cordobas' => $product->price_cordobas,
                                'price_usd' => $product->price_usd,
                                'category_name' => $product->category->name ?? 'GENERAL',
                                'image_url' => $listImg,
                                'fallback_svg' => $listFallback,
                            ];
                        @endphp
                        <tr @click="openModal({{ json_encode($jsProductList) }})"
                            class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer">
                            <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <img src="{{ $listImg }}" 
                                     alt="{{ $product->name }}" 
                                     onerror="this.onerror=null; this.src='{{ $listFallback }}';"
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

    <!-- FICHA TECNICA Y COMERCIAL MODAL -->
    <div x-show="selectedProduct" 
         x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
         @keydown.escape.window="closeModal()">
        <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto"
             @click.away="closeModal()">
            
            <!-- MODAL HEADER -->
            <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                        <i data-lucide="sparkles" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Ficha Técnica y Comercial
                            </h3>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  x-text="selectedProduct?.category_name || 'GENERAL'">
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            SKU: <span class="font-bold text-slate-700 dark:text-slate-300" x-text="selectedProduct?.sku"></span>
                        </p>
                    </div>
                </div>

                <button @click="closeModal()" 
                        class="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                        title="Cerrar">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- MODAL BODY -->
            <div class="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-h-[75vh] overflow-y-auto" x-if="selectedProduct">
                <!-- LEFT: IMAGE & PRICE -->
                <div class="flex flex-col gap-4">
                    <!-- Image container maintaining original structure -->
                    <div class="relative rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 p-4 flex items-center justify-center min-h-[260px] sm:min-h-[320px]">
                        <div class="absolute top-3 left-3 z-10">
                            <span class="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                                <i data-lucide="check" class="w-3.5 h-3.5"></i> 
                                <span x-text="(selectedProduct?.stock || 0) + ' disponibles'"></span>
                            </span>
                        </div>

                        <img :src="selectedProduct?.image_url" 
                             :alt="selectedProduct?.name"
                             class="max-h-[280px] max-w-full w-auto h-auto object-contain drop-shadow-md rounded-xl"
                             style="aspect-ratio: auto;" />
                    </div>

                    <!-- Price Banner -->
                    <div class="rounded-2xl p-4 sm:p-5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-center">
                        <span class="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                            PRECIO DE VENTA AL CLIENTE
                        </span>
                        <div class="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 font-mono">
                            C$ <span x-text="Number(selectedProduct?.price_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })"></span>
                        </div>
                        <div class="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono mt-1">
                            Equivalente a ≈ $<span x-text="Number(selectedProduct?.price_usd || 0).toFixed(2)"></span> USD <span class="text-[10px] font-normal text-slate-400">(Sujeto a tipo de cambio)</span>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: SPECIFICATIONS & DETAILS -->
                <div class="flex flex-col justify-between space-y-5">
                    <div class="space-y-4">
                        <div>
                            <h4 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase leading-snug"
                                x-text="selectedProduct?.name"></h4>
                            <p class="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1"
                               x-show="selectedProduct?.subtitle"
                               x-text="selectedProduct?.subtitle"></p>
                        </div>

                        <!-- Metadata Badges -->
                        <div class="grid grid-cols-2 gap-2.5">
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                                <span class="text-[10px] font-black uppercase text-slate-400 block">SKU / CÓDIGO</span>
                                <span class="text-xs font-mono font-black text-slate-800 dark:text-slate-200" x-text="selectedProduct?.sku"></span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                                <span class="text-[10px] font-black uppercase text-slate-400 block">UNIDAD DE MEDIDA</span>
                                <span class="text-xs font-black text-slate-800 dark:text-slate-200" x-text="selectedProduct?.unit || 'UNIDAD'"></span>
                            </div>
                        </div>

                        <!-- Medidas y Dimensiones -->
                        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                            <div class="flex items-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                                <i data-lucide="ruler" class="w-4 h-4 text-blue-500"></i>
                                <span>MEDIDAS Y ESPECIFICACIONES</span>
                            </div>
                            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-6"
                               x-text="selectedProduct?.dimensions || 'No especificadas'"></p>
                        </div>

                        <!-- Description -->
                        <div class="space-y-1.5">
                            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                DETALLE O DESCRIPCIÓN DEL PRODUCTO
                            </span>
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto"
                                 x-text="selectedProduct?.description || selectedProduct?.subtitle || 'Sin descripción adicional registrada.'">
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        <button @click="shareWhatsApp()"
                                class="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-sm">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                            <span>WhatsApp</span>
                        </button>

                        <button @click="copyFicha()"
                                class="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition border border-slate-200 dark:border-slate-700">
                            <i data-lucide="copy" class="w-4 h-4" x-show="!copied"></i>
                            <i data-lucide="check" class="w-4 h-4 text-emerald-500" x-show="copied"></i>
                            <span x-text="copied ? '¡Copiado!' : 'Copiar Ficha'"></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL FOOTER -->
            <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button @click="closeModal()"
                        class="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold transition">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

</div>
@endsection