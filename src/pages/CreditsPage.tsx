import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, DollarSign, UserCheck, 
  Calendar, Clock, CheckCircle2, AlertTriangle, 
  Receipt, Plus, RefreshCw
} from 'lucide-react';
import { storage } from '../lib/storage';
import { CreditAccount, Customer } from '../types';

export const CreditsPage: React.FC = () => {
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  
  // Abono Modal
  const [selectedCredit, setSelectedCredit] = useState<CreditAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setCredits(storage.getCredits());
    setCustomers(storage.getCustomers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;

    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0 || amount > selectedCredit.remaining_amount) return;

    const updatedRemaining = selectedCredit.remaining_amount - amount;
    const isFullPayment = updatedRemaining <= 0.01;

    const updatedCredit: CreditAccount = {
      ...selectedCredit,
      paid_amount: selectedCredit.paid_amount + amount,
      remaining_amount: Math.max(0, updatedRemaining),
      status: isFullPayment ? 'paid' : 'pending',
      payments: [
        ...(selectedCredit.payments || []),
        {
          id: 'pay-' + Date.now(),
          amount: amount,
          payment_method: paymentMethod,
          date: new Date().toISOString(),
          notes: notes || 'Abono a cuenta'
        }
      ]
    };

    // Update credit
    storage.saveCredit(updatedCredit);

    // Update customer total debt
    const customer = customers.find(c => c.id === selectedCredit.customer_id);
    if (customer) {
      storage.saveCustomer({
        ...customer,
        current_debt: Math.max(0, (customer.current_debt || 0) - amount)
      });
    }

    // Also register cash sale/income in cash register if paid in cash
    if (paymentMethod === 'cash') {
      const activeReg = storage.getActiveCashRegister();
      if (activeReg) {
        storage.saveCashRegister({
          ...activeReg,
          current_cash: activeReg.current_cash + amount,
          total_sales_cash: activeReg.total_sales_cash + amount
        });
      }
    }

    setSelectedCredit(null);
    setPaymentAmount('');
    setNotes('');
    loadData();
  };

  const filteredCredits = credits.filter(c => {
    const matchesSearch = c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.sale_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = credits.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.remaining_amount, 0);
  const totalRecovered = credits.reduce((sum, c) => sum + c.paid_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Cuentas por Cobrar y Créditos</h1>
            <p className="text-sm text-slate-400 mt-1">Control de saldos pendientes, límites de crédito y abonos parciales/totales</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          Actualizar Saldos
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total por Cobrar (Pendiente)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">
            C$ {totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Capital pendiente de cobro en la calle</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recuperado / Cobrado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            C$ {totalRecovered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Abonos recibidos satisfactoriamente</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Clientes con Crédito Activo</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {credits.filter(c => c.status === 'pending').length} cuentas
          </div>
          <p className="text-xs text-slate-500 mt-1">Facturas con saldo mayor a C$ 0.00</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, cédula o número de factura de crédito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Credits Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Crédito ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
                <th className="px-6 py-4 text-right">Abonado</th>
                <th className="px-6 py-4 text-right">Saldo Deudor</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron cuentas de crédito registradas.
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-300 text-xs">
                      {credit.id}
                      <span className="block text-[10px] text-slate-500">Ref: {credit.sale_id}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{credit.customer_name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {new Date(credit.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-300">
                      C$ {credit.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
                      C$ {credit.paid_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-rose-400 text-base">
                      C$ {credit.remaining_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        credit.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {credit.status === 'paid' ? 'Saldado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {credit.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedCredit(credit);
                            setPaymentAmount(credit.remaining_amount.toString());
                          }}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Abonar
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Completado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Realizar Abono */}
      {selectedCredit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Registrar Abono a Crédito</h3>
                <p className="text-xs text-slate-400">Cliente: {selectedCredit.customer_name}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Deuda Total:</span>
                <span className="text-white font-mono">C$ {selectedCredit.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Saldo Pendiente:</span>
                <span className="text-rose-400 font-mono font-bold">C$ {selectedCredit.remaining_amount.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Monto del Abono (C$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">C$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedCredit.remaining_amount}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'transfer'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition ${
                        paymentMethod === method
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Observación / Recibo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Recibo manual #0942..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCredit(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/30 transition"
                >
                  Aplicar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
