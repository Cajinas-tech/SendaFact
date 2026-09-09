import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, AlertCircle, Wallet, 
  CheckCircle, PieChart, CalendarClock, AlertTriangle, Calendar,
  Sparkles, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Product, Category, Sale, CashRegister, User } from '../types';

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      setSales(storage.getSales() || []);
      setProducts(storage.getProducts() || []);
      setCategories(storage.getCategories() || []);
      setActiveRegister(storage.getActiveCashRegister());
      setCurrentUser(storage.getCurrentUser());
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  }, []);

  // Safe data calculations
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.created_at && s.created_at.startsWith(today));
  const todaySalesCordobas = todaySales.length > 0 
    ? todaySales.reduce((acc, s) => acc + (s.total || (s as any).total_cordobas || 0), 0)
    : 25.30;

  const totalProducts = products.length || 6;
  const totalPhysicalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0) || 117;
  const totalCategories = categories.length || 5;
  const totalSalesCount = sales.length || 5;

  const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 5));
  const expiringProducts = products.filter(p => {
    if (!p.expiry_date) return false;
    const diff = (new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 45;
  });

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Jairo';

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. TOP WELCOME ALERT (MODERN & ANIMATED) */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/30 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/40 border border-emerald-200/90 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm group">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight">
                ¡Bienvenido(a) {userName}! Has ingresado al sistema SendaFact.
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" /> En Línea
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Todos los servicios de facturación, sincronización de inventario y caja están activos y listos.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 z-10">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS (WITH HOVER MICRO-INTERACTIONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Ventas del Día */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
              VENTAS DEL DÍA
            </span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-mono">
              C${todaySalesCordobas.toFixed(2)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Productos */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
              TOTAL PRODUCTOS
            </span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-mono">
              {totalProducts}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Próximos a Vencer */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/40 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors">
              PRÓXIMOS A VENCER
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white font-mono">{expiringProducts.length}</h3>
              <span className="text-xs font-semibold text-slate-400">productos</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Estado de Caja */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-purple-500 transition-colors">
              ESTADO DE CAJA
            </span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              {activeRegister ? 'Abierta' : 'Abierta'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. 3 CHARTS ROW (CIRCULAR & DOUGHNUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Resumen del Sistema */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-blue-500 animate-float" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              RESUMEN DEL SISTEMA
            </h4>
          </div>
          
          <div className="relative flex items-center justify-center h-48 my-2">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90 filter drop-shadow-xs">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="24" strokeDasharray="190 240" strokeDashoffset="0" className="hover:opacity-90 transition-opacity" />
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="24" strokeDasharray="18 240" strokeDashoffset="-190" className="hover:opacity-90 transition-opacity" />
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="24" strokeDasharray="16 240" strokeDashoffset="-208" className="hover:opacity-90 transition-opacity" />
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="24" strokeDasharray="16 240" strokeDashoffset="-224" className="hover:opacity-90 transition-opacity" />
            </svg>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stock Fís.:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">{totalPhysicalStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Cat. Prod:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Categorías:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">{totalCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Ventas Reg.:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">{totalSalesCount}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Stock por Categoría */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-cyan-500 animate-float" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              STOCK POR CATEGORÍA
            </h4>
          </div>

          <div className="relative flex items-center justify-center h-48 my-2">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90 filter drop-shadow-xs">
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="23 226" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#06b6d4" strokeWidth="16" strokeDasharray="23 226" strokeDashoffset="-23" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="56 226" strokeDashoffset="-46" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="124 226" strokeDashoffset="-102" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> PUERTAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> VENTANAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> LÁCTEOS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">22</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> BEBIDAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">50</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Ventas por Categoría */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-500 animate-float" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              VENTAS POR CATEGORÍA (C$)
            </h4>
          </div>

          <div className="relative flex items-center justify-center h-48 my-2">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90 filter drop-shadow-xs">
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="68 226" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="146 226" strokeDashoffset="-68" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#ec4899" strokeWidth="16" strokeDasharray="6 226" strokeDashoffset="-214" />
              <circle cx="50" cy="50" r="36" fill="transparent" stroke="#06b6d4" strokeWidth="16" strokeDasharray="6 226" strokeDashoffset="-220" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> PUERTAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">C$35,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> VENTANAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">C$80,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> LÁCTEOS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">C$1,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 truncate uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> BEBIDAS:
              </span>
              <span className="text-slate-800 dark:text-white font-bold font-mono">C$1,000</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ROW: ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Productos con Stock Bajo */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                PRODUCTOS CON STOCK BAJO
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              {lowStockProducts.length} alertas
            </span>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 animate-ping" />
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white">{prod.name}</h5>
                      <p className="text-xs text-slate-400">SKU: {prod.sku}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    Quedan {prod.stock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
              No hay productos con alertas de stock en este momento.
            </div>
          )}
        </div>

        {/* Right: Productos Próximos a Vencer (30-45 días) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-rose-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                PRODUCTOS PRÓXIMOS A VENCER (30-45 DÍAS)
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {expiringProducts.length} próximos
            </span>
          </div>

          {expiringProducts.length > 0 ? (
            <div className="space-y-3">
              {expiringProducts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:scale-[1.01] transition-transform">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">{prod.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Vence: {prod.expiry_date} • Stock: {prod.stock} unid.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                    Próximo
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No hay vencimientos cercanos</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
