import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  BookOpen, 
  Banknote,
  Printer
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Sale, Product, Customer } from '../types';

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const settings = storage.getSettings();

  useEffect(() => {
    setSales(storage.getSales());
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
  }, []);

  const totalSalesCordobas = sales.reduce((sum, s) => sum + s.total_cordobas, 0);
  const totalSalesUsd = totalSalesCordobas / settings.exchange_rate;
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const activeDebtorsCount = customers.filter(c => c.current_debt > 0).length;

  return (
    <div className="space-y-6">
      
      {/* KPI TOP METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ventas Totales C$ */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between bg-white dark:bg-[#0f172a]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas Acumuladas</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              C${totalSalesCordobas.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </p>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% vs período anterior
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Equivalente USD */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between bg-white dark:bg-[#0f172a]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Equivalente USD</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalSalesUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] font-bold text-slate-400">
              Tasa: C${settings.exchange_rate.toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Stock Disponible */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between bg-white dark:bg-[#0f172a]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unidades en Stock</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {totalStockItems} Unid.
            </p>
            <span className="text-[10px] font-bold text-slate-400">
              {products.length} productos registrados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Cuentas por Cobrar */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between bg-white dark:bg-[#0f172a]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clientes con Deuda</span>
            <p className="text-2xl font-black text-amber-500 font-mono">
              {activeDebtorsCount} Clientes
            </p>
            <span className="text-[10px] font-bold text-slate-400">
              {customers.length} clientes totales
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link 
          to="/pos" 
          className="glass-card rounded-2xl p-4 border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 hover:scale-[1.02] transition flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Nueva Venta</h4>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">Abrir POS <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </Link>

        <Link 
          to="/catalogo" 
          className="glass-card rounded-2xl p-4 border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/30 hover:scale-[1.02] transition flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Ver Catálogo</h4>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">Fichas técnicas <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </Link>

        <Link 
          to="/productos" 
          className="glass-card rounded-2xl p-4 border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 hover:scale-[1.02] transition flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Productos</h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">Gestionar stock <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </Link>

        <Link 
          to="/caja" 
          className="glass-card rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 hover:scale-[1.02] transition flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Control de Caja</h4>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">Arqueo y turnos <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </Link>
      </div>

      {/* RECENT SALES TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Últimas Ventas Realizadas
            </h3>
            <p className="text-xs text-slate-400">Transacciones y tickets emitidos recientemente en el punto de venta</p>
          </div>
          <Link to="/pos" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Ir a Ventas →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Método</th>
                <th className="p-4 text-right">Total (C$)</th>
                <th className="p-4 text-right">Total (USD)</th>
                <th className="p-4 text-center">Fecha / Hora</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.slice(0, 8).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    #{s.ticket_number}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {s.customer?.name || 'Cliente Ocasional'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {s.payment_method}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                    C${s.total_cordobas.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-400">
                    ${s.total_usd.toFixed(2)}
                  </td>
                  <td className="p-4 text-center text-slate-400 font-mono text-[11px]">
                    {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => alert(`Detalle Ticket #${s.ticket_number}\nTotal: C$${s.total_cordobas.toFixed(2)}\nMétodo: ${s.payment_method}`)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                      title="Ver ticket"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
