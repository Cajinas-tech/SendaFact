import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ShoppingBag, Trash2, CheckCircle, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import ProductCard from '../../Components/POS/ProductCard';
import CartItem from '../../Components/POS/CartItem';
import TicketModal from '../../Components/POS/TicketModal';

export default function POSApp({ initialProducts = [], initialCategories = [], initialCustomers = [], setting = {} }) {
    const [products, setProducts] = useState(initialProducts);
    const [categories, setCategories] = useState(initialCategories);
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal de Ticket
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [lastSaleData, setLastSaleData] = useState({ ticketNumber: '', saleId: null, totalCordobas: 0 });

    const searchInputRef = useRef(null);
    const exchangeRate = parseFloat(setting.exchange_rate || 36.80);

    // Sonido Beep para el lector de código de barras
    const playBeep = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1046; // Nota C6
            gain.gain.value = 0.15;
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {}
    }, []);

    // Agregar producto al carrito
    const addToCart = useCallback((product) => {
        setCart((currentCart) => {
            const existing = currentCart.find((item) => item.id === product.id);
            if (existing) {
                return currentCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [
                ...currentCart,
                {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    price_cordobas: parseFloat(product.price_cordobas || 0),
                    price_usd: parseFloat(product.price_usd || (product.price_cordobas / exchangeRate)),
                    quantity: 1,
                },
            ];
        });
    }, [exchangeRate]);

    // Modificadores de cantidad
    const incrementQuantity = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decrementQuantity = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) => {
                    if (item.id === id) {
                        const nextQty = item.quantity - 1;
                        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (id) => {
        setCart((currentCart) => currentCart.filter((item) => item.id !== id));
    };

    const clearCart = () => setCart([]);

    // Buscar y agregar por código de barras
    const findAndAddByBarcode = useCallback((barcode) => {
        const cleanCode = barcode.trim().toLowerCase();
        const found = products.find((p) => {
            const b = (p.barcode || '').trim().toLowerCase();
            const s = (p.sku || '').trim().toLowerCase();
            const sRaw = (p.sku || '').replace('#', '').trim().toLowerCase();
            return b === cleanCode || s === cleanCode || sRaw === cleanCode;
        });

        if (found) {
            addToCart(found);
            playBeep();
        }
    }, [products, addToCart, playBeep]);

    // Procesar Cobro
    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;
        setIsProcessing(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/pos/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    payment_method: paymentMethod,
                    customer_id: selectedCustomerId || null,
                    items: cart,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setLastSaleData({
                    ticketNumber: data.ticket_number,
                    saleId: data.sale_id,
                    totalCordobas: data.total_cordobas,
                });
                setTicketModalOpen(true);
                setCart([]);
                setSelectedCustomerId('');
                setPaymentMethod('efectivo');

                // Actualizar stock localmente
                setProducts((prev) =>
                    prev.map((p) => {
                        const itemSold = cart.find((c) => c.id === p.id);
                        if (itemSold && p.stock !== undefined) {
                            return { ...p, stock: Math.max(0, p.stock - itemSold.quantity) };
                        }
                        return p;
                    })
                );
            } else {
                alert('Error al procesar la venta: ' + (data.message || 'Error desconocido'));
            }
        } catch (e) {
            alert('Error de comunicación al procesar la venta.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Escuchador global de teclado: Lector de Código de Barras (<40ms) + Atajos F12, F2, F4
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e) => {
            // Atajo F12: Cobrar
            if (e.key === 'F12') {
                e.preventDefault();
                handleCheckout();
                return;
            }

            // Atajo F2: Buscar
            if (e.key === 'F2') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
                return;
            }

            // Atajo F4: Limpiar carrito
            if (e.key === 'F4') {
                e.preventDefault();
                clearCart();
                return;
            }

            const isInputFocused =
                document.activeElement &&
                (document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'SELECT' ||
                    document.activeElement.tagName === 'TEXTAREA');

            const currentTime = Date.now();
            if (currentTime - lastKeyTime > 40) {
                buffer = '';
            }
            lastKeyTime = currentTime;

            if (e.key === 'Enter') {
                if (buffer.length >= 2) {
                    findAndAddByBarcode(buffer);
                    buffer = '';
                }
                return;
            }

            if (e.key.length === 1 && !isInputFocused) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCheckout, findAndAddByBarcode]);

    // Filtrado de productos en memoria
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchCategory =
                selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
            const term = search.toLowerCase().trim();
            const matchSearch =
                !term ||
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.sku && p.sku.toLowerCase().includes(term)) ||
                (p.barcode && String(p.barcode).toLowerCase().includes(term));
            return matchCategory && matchSearch;
        });
    }, [products, selectedCategory, search]);

    // Cálculos financieros
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (parseFloat(item.price_cordobas) * item.quantity), 0);
    }, [cart]);

    const totalUsd = useMemo(() => {
        return subtotal / exchangeRate;
    }, [subtotal, exchangeRate]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* PANEL IZQUIERDO: CATÁLOGO Y BUSCADOR (8 Cols) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    
                    {/* Buscador & Filtro de Categorías */}
                    <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Escanear código de barra o buscar por nombre/SKU..."
                                className="w-full pl-11 pr-14 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 transition outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500">
                                F2
                            </span>
                        </div>

                        {/* Botones de Categoría */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
                                    selectedCategory === 'all'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Todos
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
                                        selectedCategory === cat.id
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cuadrícula de Productos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full py-16 text-center glass-card rounded-2xl border border-slate-200 dark:border-slate-800">
                                <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No se encontraron productos</p>
                                <p className="text-xs text-slate-400 mt-0.5">Intenta con otro término o código de barra</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAdd={addToCart} 
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* PANEL DERECHO: CARRITO Y COBRO (4 Cols) */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5 bg-white dark:bg-slate-900">
                        
                        {/* Cabecera del Carrito */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                                    Orden Actual
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                className="text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Limpiar</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                                    F4
                                </span>
                            </button>
                        </div>

                        {/* Selección de Cliente */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Cliente
                            </label>
                            <select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                            >
                                <option value="">Cliente Ocasional / Público General</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.phone ? `(Tel: ${c.phone})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lista de Items en Carrito */}
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                                    <p className="font-bold">El carrito está vacío</p>
                                    <p className="text-[10px]">Haz clic en un producto o escanéalo con el lector</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onIncrement={incrementQuantity}
                                        onDecrement={decrementQuantity}
                                        onRemove={removeFromCart}
                                    />
                                ))
                            )}
                        </div>

                        {/* Método de Pago */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Método de Pago
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('efectivo')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                                        paymentMethod === 'efectivo'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <Banknote className="w-4 h-4" />
                                    <span>Efectivo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('tarjeta')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                                        paymentMethod === 'tarjeta'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-2xs'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Tarjeta / Transf.</span>
                                </button>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                            <div className="flex justify-between font-medium text-slate-500">
                                <span>Subtotal:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">
                                    C${subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-medium text-slate-500">
                                <span>Equivalente USD (T.C. {exchangeRate.toFixed(2)}):</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">
                                    ≈ ${totalUsd.toFixed(2)} USD
                                </span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                                <span className="font-black text-sm text-slate-900 dark:text-white uppercase">
                                    TOTAL A COBRAR:
                                </span>
                                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                                    C${subtotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Botón de Cobro con Hotkey F12 */}
                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>PROCESANDO VENTA...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>COBRAR / EMITIR TICKET</span>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-emerald-800/60 text-emerald-100 border border-emerald-400/40">
                                        F12
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>

            {/* Modal de Ticket Exitoso */}
            <TicketModal
                isOpen={ticketModalOpen}
                onClose={() => setTicketModalOpen(false)}
                ticketNumber={lastSaleData.ticketNumber}
                saleId={lastSaleData.saleId}
                totalCordobas={lastSaleData.totalCordobas}
            />
        </div>
    );
}
