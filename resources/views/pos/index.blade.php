@extends('layouts.app')

@section('title_badge', 'VENTAS / PUNTO DE VENTA (POS)')

@section('content')
<div x-data="posApp()" class="space-y-6">

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- LEFT PANEL: PRODUCT SEARCH & GRID (8 Cols) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-4">
            
            <!-- Search & Barcode Header -->
            <div class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                    <input type="text" x-model="search" placeholder="Escanear código de barra o buscar por nombre/SKU..."
                           class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500">
                </div>

                <!-- Category filter buttons -->
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button @click="selectedCategory = 'all'" 
                            :class="selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                            class="px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0">
                        Todos
                    </button>
                    <template x-for="cat in categories" :key="cat.id">
                        <button @click="selectedCategory = cat.id" 
                                :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                                class="px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0" x-text="cat.name">
                        </button>
                    </template>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                <template x-for="prod in filteredProducts" :key="prod.id">
                    <div @click="addToCart(prod)" 
                         class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group">
                        
                        <div class="space-y-2">
                            <div class="h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2">
                                <img :src="prod.image_url || ((prod.name && prod.name.toLowerCase().includes('ventana')) ? '/images/products/ventana-aluminio.svg' : '/images/products/puerta-aluminio.svg')" 
                                     onerror="this.onerror=null; this.src='/images/products/puerta-aluminio.svg';"
                                     class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200">
                            </div>
                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" x-text="prod.sku"></span>
                            <h4 class="font-black text-xs text-slate-900 dark:text-white uppercase line-clamp-2 leading-tight" x-text="prod.name"></h4>
                        </div>

                        <div class="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                            <span class="font-black text-blue-600 dark:text-blue-400 font-mono text-sm" x-text="'C$' + Number(prod.price_cordobas).toFixed(2)"></span>
                            <span class="text-[10px] font-bold text-slate-400 font-mono" x-text="'$' + Number(prod.price_usd).toFixed(2)"></span>
                        </div>
                    </div>
                </template>
            </div>

        </div>

        <!-- RIGHT PANEL: CART & CHECKOUT (4-5 Cols) -->
        <div class="lg:col-span-5 xl:col-span-4">
            <div class="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5">
                
                <!-- Order Header -->
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div class="flex items-center gap-2">
                        <i data-lucide="shopping-bag" class="w-5 h-5 text-blue-600"></i>
                        <h3 class="text-base font-black text-slate-900 dark:text-white uppercase">Orden Actual</h3>
                    </div>
                    <button @click="clearCart()" class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Limpiar
                    </button>
                </div>

                <!-- Customer Selection -->
                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cliente</label>
                    <select x-model="selectedCustomerId" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <option value="">Cliente Ocasional / Público General</option>
                        @foreach($customers as $c)
                            <option value="{{ $c->id }}">{{ $c->name }} (Tel: {{ $c->phone }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Cart Items List -->
                <div class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    <template x-if="cart.length === 0">
                        <div class="py-8 text-center text-slate-400 text-xs space-y-1">
                            <i data-lucide="shopping-cart" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600"></i>
                            <p>El carrito está vacío</p>
                            <p class="text-[10px]">Haz clic en un producto para agregarlo</p>
                        </div>
                    </template>

                    <template x-for="(item, idx) in cart" :key="item.id">
                        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                            <div class="flex-1 min-w-0">
                                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate" x-text="item.name"></h5>
                                <p class="text-[10px] font-mono text-slate-400" x-text="'C$' + Number(item.price_cordobas).toFixed(2) + ' c/u'"></p>
                            </div>

                            <!-- Qty Buttons -->
                            <div class="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                                <button @click="decrementQty(idx)" class="text-slate-500 font-bold px-1 hover:text-rose-500">-</button>
                                <span class="text-xs font-mono font-bold w-5 text-center" x-text="item.quantity"></span>
                                <button @click="incrementQty(idx)" class="text-slate-500 font-bold px-1 hover:text-blue-500">+</button>
                            </div>

                            <div class="text-right min-w-[65px]">
                                <span class="text-xs font-black text-slate-900 dark:text-white font-mono" x-text="'C$' + (item.price_cordobas * item.quantity).toFixed(2)"></span>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Payment Method Selector -->
                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Método de Pago</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" @click="paymentMethod = 'efectivo'" 
                                :class="paymentMethod === 'efectivo' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                                class="py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="banknote" class="w-3.5 h-3.5"></i> Efectivo
                        </button>
                        <button type="button" @click="paymentMethod = 'tarjeta'" 
                                :class="paymentMethod === 'tarjeta' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                                class="py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="credit-card" class="w-3.5 h-3.5"></i> Tarjeta
                        </button>
                        <button type="button" @click="paymentMethod = 'transferencia'" 
                                :class="paymentMethod === 'transferencia' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                                class="py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i> Transferencia
                        </button>
                        <button type="button" @click="paymentMethod = 'credito'" 
                                :class="paymentMethod === 'credito' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                                class="py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i> A Crédito (Fiado)
                        </button>
                    </div>
                </div>

                <!-- Totals Breakdown -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                    <div class="flex justify-between font-medium text-slate-500">
                        <span>Subtotal:</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-white" x-text="'C$ ' + totalCordobas.toFixed(2)"></span>
                    </div>
                    <div class="flex justify-between font-medium text-slate-500">
                        <span>Equivalente USD (T.C. {{ $setting->exchange_rate ?? 36.80 }}):</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-white" x-text="'$ ' + totalUsd.toFixed(2)"></span>
                    </div>
                    <div class="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                        <span class="font-black text-sm text-slate-900 dark:text-white uppercase">TOTAL A COBRAR:</span>
                        <span class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono" x-text="'C$ ' + totalCordobas.toFixed(2)"></span>
                    </div>
                </div>

                <!-- Checkout Button -->
                <button @click="processCheckout()" :disabled="cart.length === 0 || processing"
                        class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2">
                    <i data-lucide="check-circle" class="w-5 h-5"></i>
                    <span x-text="processing ? 'PROCESANDO...' : 'COBRAR / EMITIR TICKET'"></span>
                </button>

            </div>
        </div>

    </div>

    <!-- TICKET SUCCESS MODAL -->
    <div x-show="ticketModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" x-cloak>
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <i data-lucide="check" class="w-8 h-8"></i>
            </div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">¡Venta Exitosa!</h3>
            <p class="text-xs text-slate-500 font-mono" x-text="'Ticket: #' + lastTicketNumber"></p>
            <p class="text-2xl font-black text-blue-600 font-mono" x-text="'C$ ' + lastTotalCordobas.toFixed(2)"></p>

            <div class="flex items-center gap-2 pt-2">
                <a :href="'/pos/ticket/' + lastSaleId" target="_blank" 
                   class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase shadow-md shadow-blue-500/20">
                    Imprimir Ticket
                </a>
                <button @click="ticketModal = false; resetCart();" class="px-4 py-2.5 rounded-xl border text-xs font-bold">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

</div>
@endsection

@push('scripts')
<script>
    function posApp() {
        return {
            products: {!! json_encode($products) !!},
            categories: {!! json_encode($categories) !!},
            exchangeRate: {{ $setting->exchange_rate ?? 36.80 }},
            search: '',
            selectedCategory: 'all',
            selectedCustomerId: '',
            paymentMethod: 'efectivo',
            cart: [],
            processing: false,
            ticketModal: false,
            lastTicketNumber: '',
            lastSaleId: null,
            lastTotalCordobas: 0,

            get filteredProducts() {
                return this.products.filter(p => {
                    const matchCategory = this.selectedCategory === 'all' || p.category_id == this.selectedCategory;
                    const matchSearch = !this.search || 
                        p.name.toLowerCase().includes(this.search.toLowerCase()) || 
                        p.sku.toLowerCase().includes(this.search.toLowerCase()) ||
                        (p.barcode && p.barcode.includes(this.search));
                    return matchCategory && matchSearch;
                });
            },

            get totalCordobas() {
                return this.cart.reduce((sum, item) => sum + (item.price_cordobas * item.quantity), 0);
            },

            get totalUsd() {
                return this.totalCordobas / this.exchangeRate;
            },

            addToCart(prod) {
                const existing = this.cart.find(i => i.id === prod.id);
                if (existing) {
                    existing.quantity++;
                } else {
                    this.cart.push({
                        id: prod.id,
                        name: prod.name,
                        sku: prod.sku,
                        price_cordobas: parseFloat(prod.price_cordobas),
                        price_usd: parseFloat(prod.price_usd),
                        quantity: 1
                    });
                }
                lucide.createIcons();
            },

            incrementQty(idx) {
                this.cart[idx].quantity++;
            },

            decrementQty(idx) {
                if (this.cart[idx].quantity > 1) {
                    this.cart[idx].quantity--;
                } else {
                    this.cart.splice(idx, 1);
                }
            },

            clearCart() {
                this.cart = [];
            },

            resetCart() {
                this.cart = [];
                this.selectedCustomerId = '';
                this.paymentMethod = 'efectivo';
            },

            async processCheckout() {
                if (this.cart.length === 0) return;
                this.processing = true;

                try {
                    const res = await fetch('{{ route("pos.store") }}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            payment_method: this.paymentMethod,
                            customer_id: this.selectedCustomerId || null,
                            items: this.cart
                        })
                    });

                    const data = await res.json();
                    if (data.success) {
                        this.lastTicketNumber = data.ticket_number;
                        this.lastSaleId = data.sale_id;
                        this.lastTotalCordobas = data.total_cordobas;
                        this.ticketModal = true;
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (e) {
                    alert('Error de comunicación con el servidor');
                } finally {
                    this.processing = false;
                }
            }
        };
    }
</script>
@endpush