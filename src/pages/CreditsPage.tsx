import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, DollarSign, 
  Clock, CheckCircle2, AlertTriangle, 
  Receipt, RefreshCw, UserCheck, Calendar, Phone, ArrowUpRight
} from 'lucide-react';
import { storage } from '../lib/storage';
import { CreditAccount, Customer } from '../types';
import { useToast } from '../components/UI/Toast';

export const CreditsPage: React.FC = () => {
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const { success, warning, error, info } = useToast();
  
  // Abono Modal
  const [selectedCredit, setSelectedCredit] = useState<CreditAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    const loadedCredits = storage.getCredits() || [];
    const loadedCustomers = storage.getCustomers() || [];
    setCredits(loadedCredits);
    setCustomers(loadedCustomers);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;

    const remaining = selectedCredit.remaining_debt ?? selectedCredit.total_debt ?? 0;
    const amount = parseFloat(paymentAmount) || 0;

    if (amount <= 0) {
      warning('Monto Inválido', 'El abono debe ser mayor a C$ 0.00');
      return;
    }

    if (amount > remaining + 0.01) {
      warning('Monto Excede la Deuda', `El saldo pendiente es de C$ ${remaining.toFixed(2)}`);
      return;
    }

    const newRemaining = Math.max(0, remaining - amount);
    const isFullPayment = newRemaining <= 0.01;

    const updatedCredit: CreditAccount = {
      ...selectedCredit,
      remaining_debt: newRemaining,
      status: isFullPayment ? 'paid' : 'pending',
      payments: [
        ...(selectedCredit.payments || []),
        {
          id: Date.now(),
          credit_id: selectedCredit.id,
          amount_cordobas: amount,
          payment_method: paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia',
          receipt_number: `ABO-${Math.floor(1000 + Math.random() * 9000)}`,
          created_at: new Date().toISOString()
        }
      ]
    };

    storage.saveCredit(updatedCredit);

    // Actualizar deuda del cliente
    const customer = customers.find(c => String(c.id) === String(selectedCredit.customer_id));
    if (customer) {
      storage.saveCustomer({
        ...customer,
        current_debt: Math.max(0, (customer.current_debt || 0) - amount)
      });
    }

    // Si es en efectivo, reflejar en caja activa
    if (paymentMethod === 'cash') {
      const activeReg = storage.getActiveCashRegister();
      if (activeReg) {
        storage.saveCashRegister({
          ...activeReg,
          cash_sales: (activeReg.cash_sales || 0) + amount,
          total_sales_cordobas: (activeReg.total_sales_cordobas || 0) + amount
        });
      }
    }

    setSelectedCredit(null);
    setPaymentAmount('');
    setNotes('');
    loadData();

    success(
      isFullPayment ? '¡Deuda Cancelada Totalmente!' : '¡Abono Aplicado con Éxito!',
      `C$ ${amount.toFixed(2)} aplicados a la cuenta de ${selectedCredit.customer_name}`
    );
  };

  const filteredCredits = credits.filter(c => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s ||
      (c.customer_name && c.customer_name.toLowerCase().includes(s)) ||
      (c.ticket_number && c.ticket_number.toLowerCase().includes(s)) ||
      String(c.id).toLowerCase().includes(s) ||
      (c.customer_phone && c.customer_phone.includes(s));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = credits
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.remaining_debt ?? c.total_debt ?? 0), 0);

  const totalRecovered = credits.reduce((sum, c) => {
    const total = c.total_debt || 0;
    const remaining = c.remaining_debt ?? total;
    return sum + Math.max(0, total - remaining);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cuentas por Cobrar y Créditos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control de saldos pendientes, límites de crédito y abonos parciales/totales</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          Actualizar Saldos
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total por Cobrar (Pendiente)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            C$ {totalOutstanding.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Capital pendiente de cobro en clientes</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recuperado / Cobrado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            C$ {totalRecovered.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Abonos recibidos satisfactoriamente</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cuentas Activas con Saldo</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {credits.filter(c => c.status === 'pending').length} cuentas
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Facturas con saldo deudor pendiente</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o número de factura de crédito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Credits Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Factura / Ticket</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
                <th className="px-6 py-4 text-right">Abonado</th>
                <th className="px-6 py-4 text-right">Saldo Deudor</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron cuentas de crédito registradas.
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit) => {
                  const total = credit.total_debt || 0;
                  const remaining = credit.remaining_debt ?? total;
                  const paid = Math.max(0, total - remaining);

                  return (
                    <tr key={credit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-300 text-xs">
                        {credit.ticket_number || `CR-${credit.id}`}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          Emisión: {credit.created_at || 'Reciente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {credit.customer_name}
                        </div>
                        {credit.customer_phone && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {credit.customer_phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          {credit.due_date ? new Date(credit.due_date).toLocaleDateString('es-NI') : '30 días'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        C$ {total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        C$ {paid.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-rose-600 dark:text-rose-400 text-base">
                        C$ {remaining.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          credit.status === 'paid' || remaining <= 0.01
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}>
                          {credit.status === 'paid' || remaining <= 0.01 ? 'Saldado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {remaining > 0.01 ? (
                          <button
                            onClick={() => {
                              setSelectedCredit(credit);
                              setPaymentAmount(remaining.toString());
                            }}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Abonar
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pagado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Realizar Abono */}
      {selectedCredit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registrar Abono a Crédito</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cliente: {selectedCredit.customer_name}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Deuda Total:</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">
                  C$ {(selectedCredit.total_debt || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Saldo Pendiente:</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                  C$ {(selectedCredit.remaining_debt ?? selectedCredit.total_debt ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Monto del Abono (C$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">C$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedCredit.remaining_debt ?? selectedCredit.total_debt}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'transfer'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Observación / Recibo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Recibo manual #0942..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCredit(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/30 transition cursor-pointer"
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
