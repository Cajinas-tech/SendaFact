import React, { useState, useEffect } from 'react';
import { 
  Vault, DollarSign, ArrowUpRight, ArrowDownRight, 
  Lock, Unlock, CheckCircle2, PlusCircle, CreditCard, Banknote, RefreshCw
} from 'lucide-react';
import { storage } from '../lib/storage';
import { CashRegister, Movement, Sale } from '../types';
import { useToast } from '../components/UI/Toast';

export const CashPage: React.FC = () => {
  const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null);
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const { success, warning, info } = useToast();
  
  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  
  // Forms
  const [initialCash, setInitialCash] = useState('1000');
  const [notes, setNotes] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const loadData = () => {
    const reg = storage.getActiveCashRegister();
    setActiveRegister(reg);
    setRegisters(storage.getCashRegisters());
    
    // Calculate today's sales
    const sales = storage.getSales();
    const today = new Date().toISOString().split('T')[0];
    const filteredSales = sales.filter(s => s.created_at.startsWith(today) && s.status === 'completed');
    setTodaySales(filteredSales);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialCash) || 0;
    const newReg = storage.openCashRegister(amount, notes || 'Apertura de turno estándar');
    setActiveRegister(newReg);
    setShowOpenModal(false);
    setNotes('');
    loadData();
    success('¡Turno de Caja Aperturado!', `Fondo inicial: C$ ${amount.toFixed(2)}`);
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister) return;
    storage.closeCashRegister(activeRegister.id);
    setShowCloseModal(false);
    loadData();
    warning('¡Turno de Caja Cerrado!', 'Arqueo completado y guardado');
  };

  const handleCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister) return;
    const amount = parseFloat(movementAmount);
    if (!amount || amount <= 0) return;

    const diff = movementType === 'in' ? amount : -amount;
    const updated = {
      ...activeRegister,
      current_cash: Math.max(0, activeRegister.current_cash + diff),
      total_expenses: movementType === 'out' ? (activeRegister.total_expenses || 0) + amount : activeRegister.total_expenses
    };

    storage.saveCashRegister(updated);
    
    // Add transaction log
    const mov: Movement = {
      id: 'mov-' + Date.now(),
      product_id: '',
      product_name: `Movimiento de Efectivo (${movementType === 'in' ? 'Ingreso' : 'Egreso'})`,
      type: movementType === 'in' ? 'in' : 'out',
      quantity: 1,
      reason: movementReason || 'Ajuste manual de efectivo',
      user: 'Jairo Cajina',
      created_at: new Date().toISOString()
    };
    storage.saveMovement(mov);

    setShowMovementModal(false);
    setMovementAmount('');
    setMovementReason('');
    loadData();
    info(
      movementType === 'in' ? 'Ingreso Registrado' : 'Egreso Registrado',
      `C$ ${amount.toFixed(2)} - ${movementReason || 'Ajuste de caja'}`
    );
  };

  // Calculations
  const cashSales = todaySales.filter(s => s.payment_method === 'cash' || s.payment_method === 'efectivo').reduce((sum, s) => sum + s.total, 0);
  const cardSales = todaySales.filter(s => s.payment_method === 'card' || s.payment_method === 'tarjeta').reduce((sum, s) => sum + s.total, 0);
  const transferSales = todaySales.filter(s => s.payment_method === 'transfer' || s.payment_method === 'transferencia').reduce((sum, s) => sum + s.total, 0);
  const creditSales = todaySales.filter(s => s.payment_method === 'credit' || s.payment_method === 'credito').reduce((sum, s) => sum + s.total, 0);
  const totalSales = cashSales + cardSales + transferSales + creditSales;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Vault className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Control y Arqueo de Caja</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                activeRegister 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}>
                {activeRegister ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {activeRegister ? 'Caja Abierta' : 'Caja Cerrada'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestión de turnos, fondos de apertura, entradas/salidas y cuadre diario</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {activeRegister ? (
            <>
              <button
                onClick={() => setShowMovementModal(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-500" />
                Ingreso / Retiro
              </button>
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
              >
                <Lock className="w-4 h-4" />
                Cerrar Caja
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <Unlock className="w-5 h-5" />
              Abrir Turno de Caja
            </button>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Fondo en Efectivo */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Efectivo en Caja</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            C$ {(activeRegister?.current_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Apertura: C$ {(activeRegister?.initial_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{todaySales.length} ventas</span>
          </div>
        </div>

        {/* Ventas en Efectivo */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas Efectivo</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            C$ {cashSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Tarjetas: C$ {cardSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-slate-400">Transf: C$ {transferSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Crédito Otorgado */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas a Crédito</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            C$ {creditSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Total Facturado</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">C$ {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Estado y Cajero */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Cajero en Turno</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white truncate">
            {activeRegister?.user || 'Sin Cajero Activo'}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Inicio de turno:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {activeRegister ? new Date(activeRegister.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de Turnos y Cierres */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Vault className="w-4 h-4 text-amber-500" />
            Historial de Aperturas y Cierres
          </h2>
          <button 
            onClick={loadData}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">ID / Turno</th>
                <th className="px-6 py-4">Cajero</th>
                <th className="px-6 py-4">Apertura</th>
                <th className="px-6 py-4">Cierre</th>
                <th className="px-6 py-4 text-right">Fondo Inicial</th>
                <th className="px-6 py-4 text-right">Ventas Efectivo</th>
                <th className="px-6 py-4 text-right">Monto Final</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {registers.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">{reg.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{reg.user}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(reg.opened_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {reg.closed_at ? new Date(reg.closed_at).toLocaleString() : 'En curso...'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    C$ {reg.initial_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    C$ {reg.total_sales_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                    C$ {(reg.closed_at ? (reg.final_cash || 0) : reg.current_cash).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      reg.status === 'open' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600/30'
                    }`}>
                      {reg.status === 'open' ? 'Activo' : 'Cerrado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Abrir Caja */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apertura de Turno de Caja</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Establece el monto de fondo inicial en efectivo</p>
              </div>
            </div>

            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Monto Inicial (C$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">C$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={initialCash}
                    onChange={(e) => setInitialCash(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500"
                    placeholder="1000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Observaciones</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Fondo de cambio inicial en billetes de 50, 100 y 500..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cerrar Caja */}
      {showCloseModal && activeRegister && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Arqueo y Cierre de Caja</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Turno: {activeRegister.id} • Cajero: {activeRegister.user}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Fondo Inicial:</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">C$ {activeRegister.initial_cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ventas en Efectivo:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+ C$ {cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ventas Tarjeta / Transf:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">C$ {(cardSales + transferSales).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-base">
                <span className="text-slate-900 dark:text-white">Total Efectivo a Entregar:</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">C$ {activeRegister.current_cash.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseRegister} className="space-y-4">
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                >
                  Continuar Turno
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 transition"
                >
                  Confirmar y Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ingreso / Egreso */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Movimiento Manual de Efectivo
            </h3>

            <form onSubmit={handleCashMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                    movementType === 'in'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Ingreso Extra
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('out')}
                  className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                    movementType === 'out'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Retiro / Gasto
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Monto (C$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Motivo / Justificación</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Ej. Pago de flete, compra de papel térmico..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/30 transition"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
