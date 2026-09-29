import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CreditCard, Search, 
  Clock, CheckCircle2, AlertTriangle, 
  Receipt, RefreshCw, UserCheck, Calendar, Phone,
  Ban, XCircle, AlertCircle, Trash2, History,
  Eye, Printer, MessageCircle, FileText, X, ArrowUpDown, Building2
} from 'lucide-react';
import { storage } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CreditAccount, Customer, Sale, CompanySetting } from '../types';
import { useToast } from '../components/UI/Toast';

type FilterStatus = 'all' | 'pending' | 'overdue' | 'paid' | 'cancelled';

export const CreditsPage: React.FC = () => {
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const { success, warning, error, info } = useToast();
  
  // Abono Modal
  const [selectedCredit, setSelectedCredit] = useState<CreditAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Cancel / Void Credit Modal
  const [creditToCancel, setCreditToCancel] = useState<CreditAccount | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Invoice Detail Modal
  const [viewingInvoiceCredit, setViewingInvoiceCredit] = useState<CreditAccount | null>(null);

  const loadData = () => {
    const loadedCredits = storage.getCredits() || [];
    const loadedCustomers = storage.getCustomers() || [];
    const loadedSales = storage.getSales() || [];
    setCredits(loadedCredits);
    setCustomers(loadedCustomers);
    setSales(loadedSales);
    setCompany(storage.getCompanySettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const isCreditOverdue = (credit: CreditAccount): boolean => {
    if (credit.status === 'cancelled' || credit.status === 'paid') return false;
    const remaining = credit.remaining_debt ?? credit.total_debt ?? 0;
    if (remaining <= 0.01) return false;
    if (credit.status === 'overdue') return true;
    if (!credit.due_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(credit.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getEffectiveStatus = (credit: CreditAccount): 'pending' | 'overdue' | 'paid' | 'cancelled' => {
    if (credit.status === 'cancelled') return 'cancelled';
    const remaining = credit.remaining_debt ?? credit.total_debt ?? 0;
    if (remaining <= 0.01 || credit.status === 'paid') return 'paid';
    if (isCreditOverdue(credit)) return 'overdue';
    return 'pending';
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'Efectivo (CONTADO)';
    const m = method.toLowerCase().trim();
    if (m === 'efectivo' || m === 'cash') return 'Efectivo (CONTADO)';
    if (m === 'credito' || m === 'crédito' || m === 'credit') return 'Crédito (Abonos / Plazo)';
    if (m === 'transferencia' || m === 'transfer') return 'Transferencia Bancaria';
    if (m === 'tarjeta' || m === 'card') return 'Tarjeta Débito / Crédito';
    return method;
  };

  const renderPaymentBadge = (method?: string) => {
    const m = (method || 'efectivo').toLowerCase().trim();
    if (m === 'transferencia' || m === 'transfer') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 uppercase tracking-wider">
          <ArrowUpDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Transferencia
        </span>
      );
    }
    if (m === 'credito' || m === 'crédito' || m === 'credit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 uppercase tracking-wider">
          <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Crédito
        </span>
      );
    }
    if (m === 'tarjeta' || m === 'card') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 uppercase tracking-wider">
          <CreditCard className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          Tarjeta
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        Efectivo
      </span>
    );
  };

  const getInvoiceForCredit = (credit: CreditAccount): Sale => {
    const cleanTicket = (credit.ticket_number || '').trim().toLowerCase();
    const found = sales.find(s => {
      const sTicket = (s.ticket_number || '').trim().toLowerCase();
      if (sTicket && cleanTicket) {
        if (sTicket === cleanTicket) return true;
        if (sTicket.replace('#', '') === cleanTicket.replace('#', '')) return true;
      }
      if (credit.sale_id && s.id === credit.sale_id) return true;
      return false;
    });

    if (found) return found;

    // Fallback: Si no se encuentra en memoria, construir representación limpia de la factura
    return {
      id: credit.sale_id || credit.id,
      ticket_number: credit.ticket_number || `#CR-${credit.id}`,
      customer_id: credit.customer_id,
      customer: {
        id: credit.customer_id,
        name: credit.customer_name,
        phone: credit.customer_phone || '50588888888',
        address: 'Venta a Crédito'
      },
      user_name: 'Cajero Principal',
      user_role: 'cajero',
      payment_method: 'credito',
      total_cordobas: credit.total_debt,
      total_usd: credit.total_debt / (company?.exchange_rate || 36.80),
      status: credit.status === 'cancelled' ? 'cancelled' : 'completed',
      created_at: credit.created_at || new Date().toISOString(),
      items: [
        {
          product_name: 'Venta de Mercadería al Crédito',
          quantity: 1,
          unit_price_cordobas: credit.total_debt,
          total_cordobas: credit.total_debt
        }
      ]
    };
  };

  const handleSendInvoiceWhatsApp = (sale: Sale, credit: CreditAccount) => {
    const rawPhone = credit.customer_phone || sale.customer?.phone || (sale as any).customer_phone || '50588888888';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('505') ? cleanPhone : `505${cleanPhone}`;

    const remaining = credit.remaining_debt ?? credit.total_debt ?? 0;
    const isCredit = (sale.payment_method || '').toLowerCase().includes('cred');

    let msg = `🧾 *COMPROBANTE DE FACTURA - SENDA SISTEMAS*\n\n` +
      `*Factura:* ${sale.ticket_number}\n` +
      `*Cliente:* ${credit.customer_name}\n` +
      `*Fecha:* ${formatDateTime(sale.created_at)}\n` +
      `*Método:* ${formatPaymentMethod(sale.payment_method)}\n` +
      `*Total Factura:* C$ ${sale.total_cordobas.toFixed(2)}\n`;

    if (isCredit) {
      msg += `*Saldo Pendiente:* C$ ${remaining.toFixed(2)}\n` +
        `*Fecha Límite:* ${credit.due_date ? new Date(credit.due_date).toLocaleDateString('es-NI') : '30 días'}\n`;
      if (credit.payments && credit.payments.length > 0) {
        msg += `\n*Abonos Registrados:*\n` +
          credit.payments.map(p => `• ${p.created_at?.split('T')[0] || ''} (${p.receipt_number}): C$ ${p.amount_cordobas.toFixed(2)} [${p.payment_method}]`).join('\n') + `\n`;
      }
    }

    msg += `\n¡Muchas gracias por su preferencia!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit || isProcessing) return;

    // Control de inputs: conversión numérica estricta para evitar concatenaciones ("100" + "50" = "10050")
    const rawNum = parseFloat(paymentAmount);
    if (isNaN(rawNum) || rawNum <= 0) {
      warning('Monto Inválido', 'El abono debe ser mayor a C$ 0.00');
      return;
    }
    const amount = Number(rawNum.toFixed(2));

    const remaining = Number((selectedCredit.remaining_debt ?? selectedCredit.total_debt ?? 0).toFixed(2));
    if (amount > remaining + 0.01) {
      warning('Monto Excede la Deuda', `El saldo pendiente es de C$ ${remaining.toFixed(2)}`);
      return;
    }

    // Prevenir doble clic: bloquear peticiones simultáneas
    setIsProcessing(true);

    try {
      const activeReg = storage.getActiveCashRegister();
      const currentUser = storage.getCurrentUser();

      // 1. Si Supabase está conectado, invocar la función RPC atómica
      if (isSupabaseConfigured()) {
        try {
          const { error: rpcError } = await supabase.rpc('registrar_abono_credito', {
            p_credito_id: selectedCredit.id,
            p_monto_abono: amount,
            p_caja_id: activeReg?.id || 1,
            p_usuario_id: currentUser?.id || 1
          });

          if (rpcError) {
            console.warn('Supabase RPC registrar_abono_credito devolvió aviso:', rpcError.message);
          }
        } catch (sbErr) {
          console.warn('Error de conexión con Supabase RPC:', sbErr);
        }
      }

      // 2. Operación atómica en el estado local de la aplicación
      const newRemaining = Math.max(0, Number((remaining - amount).toFixed(2)));
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
            customer_name: selectedCredit.customer_name,
            caja_id: activeReg?.id || 1,
            amount_cordobas: amount,
            payment_method: paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia',
            receipt_number: notes.trim() ? notes.trim() : `ABO-${Math.floor(1000 + Math.random() * 9000)}`,
            created_at: new Date().toISOString()
          }
        ]
      };

      storage.saveCredit(updatedCredit);

      // Actualizar deuda del cliente (resta atómica)
      const customer = customers.find(c => String(c.id) === String(selectedCredit.customer_id));
      if (customer) {
        storage.saveCustomer({
          ...customer,
          current_debt: Math.max(0, Number(((customer.current_debt || 0) - amount).toFixed(2)))
        });
      }

      // Si es en efectivo, sumar inmediatamente al saldo de caja activa
      if (paymentMethod === 'cash' && activeReg) {
        storage.saveCashRegister({
          ...activeReg,
          cash_sales: Number(((activeReg.cash_sales || 0) + amount).toFixed(2)),
          total_sales_cordobas: Number(((activeReg.total_sales_cordobas || 0) + amount).toFixed(2)),
          current_cash: typeof activeReg.current_cash === 'number' 
            ? Number((activeReg.current_cash + amount).toFixed(2)) 
            : undefined
        });

        // Registrar movimiento de ingreso en el kardex
        storage.saveMovement({
          id: 'mov-' + Date.now(),
          product_id: 0,
          product_name: `Abono a Crédito - ${selectedCredit.customer_name}`,
          type: 'in',
          quantity: 1,
          reason: `Abono factura #${selectedCredit.ticket_number || selectedCredit.id} (${paymentMethod === 'cash' ? 'Efectivo' : paymentMethod})`,
          user_name: currentUser?.name || 'Cajero',
          user: currentUser?.name || 'Cajero',
          created_at: new Date().toISOString()
        });
      }

      setSelectedCredit(null);
      setPaymentAmount('');
      setNotes('');
      loadData();

      success(
        isFullPayment ? '¡Deuda Cancelada Totalmente!' : '¡Abono Aplicado con Éxito!',
        `C$ ${amount.toFixed(2)} procesados correctamente. Saldo descontado y caja actualizada.`
      );
    } catch (err: any) {
      console.error("Error al procesar el abono:", err);
      error('Error al Procesar Abono', err?.message || 'No se pudo completar la transacción.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCredit = () => {
    if (!creditToCancel) return;

    const remaining = creditToCancel.remaining_debt ?? creditToCancel.total_debt ?? 0;

    const updatedCredit: CreditAccount = {
      ...creditToCancel,
      status: 'cancelled'
    };

    storage.saveCredit(updatedCredit);

    // Reducir la deuda del cliente si tenía saldo pendiente
    const customer = customers.find(c => String(c.id) === String(creditToCancel.customer_id));
    if (customer && remaining > 0) {
      storage.saveCustomer({
        ...customer,
        current_debt: Math.max(0, (customer.current_debt || 0) - remaining)
      });
    }

    setCreditToCancel(null);
    setCancelReason('');
    loadData();

    info('Crédito Anulado / Cancelado', `La cuenta ${creditToCancel.ticket_number || creditToCancel.id} ha sido marcada como cancelada`);
  };

  const filteredCredits = credits.filter(c => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s ||
      (c.customer_name && c.customer_name.toLowerCase().includes(s)) ||
      (c.ticket_number && c.ticket_number.toLowerCase().includes(s)) ||
      String(c.id).toLowerCase().includes(s) ||
      (c.customer_phone && c.customer_phone.includes(s));

    const effStatus = getEffectiveStatus(c);
    const matchesStatus = statusFilter === 'all' || effStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalOutstanding = credits
    .filter(c => {
      const eff = getEffectiveStatus(c);
      return eff === 'pending' || eff === 'overdue';
    })
    .reduce((sum, c) => sum + (c.remaining_debt ?? c.total_debt ?? 0), 0);

  const totalOverdue = credits
    .filter(c => getEffectiveStatus(c) === 'overdue')
    .reduce((sum, c) => sum + (c.remaining_debt ?? c.total_debt ?? 0), 0);

  const totalRecovered = credits
    .filter(c => c.status !== 'cancelled')
    .reduce((sum, c) => {
      const total = c.total_debt || 0;
      const remaining = c.remaining_debt ?? total;
      return sum + Math.max(0, total - remaining);
    }, 0);

  // Status counts
  const countAll = credits.length;
  const countPending = credits.filter(c => getEffectiveStatus(c) === 'pending').length;
  const countOverdue = credits.filter(c => getEffectiveStatus(c) === 'overdue').length;
  const countPaid = credits.filter(c => getEffectiveStatus(c) === 'paid').length;
  const countCancelled = credits.filter(c => getEffectiveStatus(c) === 'cancelled').length;

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
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control de saldos pendientes, vencimientos, abonos y créditos cancelados</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendiente */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total por Cobrar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            C$ {totalOutstanding.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saldos vigentes y en mora</p>
        </div>

        {/* Total Vencido */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cartera Vencida (Mora)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            C$ {totalOverdue.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-rose-500/80 mt-1">{countOverdue} cuenta(s) fuera de fecha límite</p>
        </div>

        {/* Total Recuperado */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recuperado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            C$ {totalRecovered.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Abonos recibidos satisfactoriamente</p>
        </div>

        {/* Cuentas Activas */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cuentas con Saldo</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {countPending + countOverdue} <span className="text-sm font-normal text-slate-400">cuentas</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{countPaid} saldadas • {countCancelled} canceladas</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
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

        {/* Tab Filters: Todos, Pendientes, Vencidos, Pagados, Cancelados */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl gap-1 w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'pending' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pendientes
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'pending' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {countPending}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'overdue' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Vencidos
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'overdue' ? 'bg-white/25 text-white' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {countOverdue}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'paid' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Pagados
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'paid' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {countPaid}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'cancelled' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ban className="w-3 h-3" />
            Cancelados
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'cancelled' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {countCancelled}
            </span>
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
                    No se encontraron cuentas de crédito con el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit) => {
                  const total = credit.total_debt || 0;
                  const remaining = credit.remaining_debt ?? total;
                  const paid = Math.max(0, total - remaining);
                  const effStatus = getEffectiveStatus(credit);

                  return (
                    <tr key={credit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-300 text-xs">
                        <button
                          type="button"
                          onClick={() => setViewingInvoiceCredit(credit)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left group inline-flex items-center gap-1.5"
                          title="Ver detalle completo de esta factura"
                        >
                          <span className="group-hover:underline">{credit.ticket_number || `CR-${credit.id}`}</span>
                          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-blue-500" />
                        </button>
                        <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
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
                        <div className={`flex items-center gap-1.5 font-medium ${effStatus === 'overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                          <Calendar className={`w-3.5 h-3.5 ${effStatus === 'overdue' ? 'text-rose-500' : 'text-amber-500'}`} />
                          {credit.due_date ? new Date(credit.due_date).toLocaleDateString('es-NI') : '30 días'}
                          {effStatus === 'overdue' && (
                            <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-sm ml-1 font-bold">
                              Expirado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        C$ {total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        C$ {paid.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-base">
                        {effStatus === 'cancelled' ? (
                          <span className="text-slate-400 line-through">
                            C$ {remaining.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                          </span>
                        ) : effStatus === 'paid' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            C$ 0.00
                          </span>
                        ) : (
                          <span className={effStatus === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                            C$ {remaining.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {effStatus === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                        {effStatus === 'overdue' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            Vencido
                          </span>
                        )}
                        {effStatus === 'paid' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pagado
                          </span>
                        )}
                        {effStatus === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30 inline-flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Cancelado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* BOTÓN: VER DETALLE DE FACTURAS */}
                          <button
                            type="button"
                            onClick={() => setViewingInvoiceCredit(credit)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Ver Detalle de Factura, Saldo y Abonos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Factura</span>
                          </button>

                          {(effStatus === 'pending' || effStatus === 'overdue') ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCredit(credit);
                                  setPaymentAmount(remaining.toString());
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                                title="Registrar Abono"
                              >
                                <span className="font-black text-xs leading-none">C$</span>
                                Abonar
                              </button>
                              <button
                                type="button"
                                onClick={() => setCreditToCancel(credit)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                title="Anular o Cancelar Crédito"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Anular
                              </button>
                            </>
                          ) : effStatus === 'paid' ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Saldado
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                              <Ban className="w-3.5 h-3.5" />
                              Anulado
                            </span>
                          )}
                        </div>
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
      {selectedCredit && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 my-auto">
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
                    disabled={isProcessing}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
                      disabled={isProcessing}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
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
                  disabled={isProcessing}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Recibo manual #0942..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setSelectedCredit(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer ${
                    isProcessing ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Aplicar Abono</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Anular / Cancelar Crédito */}
      {creditToCancel && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anular / Cancelar Cuenta de Crédito</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Esta acción marcará el crédito como cancelado</p>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Confirmación de Cancelación
              </div>
              <p>
                Cliente: <span className="font-bold text-slate-900 dark:text-white">{creditToCancel.customer_name}</span>
              </p>
              <p>
                Factura / Ticket: <span className="font-mono font-bold text-slate-900 dark:text-white">{creditToCancel.ticket_number || creditToCancel.id}</span>
              </p>
              <p>
                Saldo a anular: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">C$ {(creditToCancel.remaining_debt ?? creditToCancel.total_debt ?? 0).toFixed(2)}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreditToCancel(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelCredit}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: VER DETALLE DE FACTURA, SALDOS Y ABONOS */}
      {viewingInvoiceCredit && createPortal((() => {
        const credit = viewingInvoiceCredit;
        const sale = getInvoiceForCredit(credit);
        const totalDebt = credit.total_debt || sale.total_cordobas || 0;
        const remaining = credit.remaining_debt ?? totalDebt;
        const totalPaid = Math.max(0, Number((totalDebt - remaining).toFixed(2)));
        const methodLower = (sale.payment_method || 'credito').toLowerCase().trim();
        const isCredit = methodLower.includes('cred') || methodLower === 'credito' || methodLower === 'crédito';
        const isTransfer = methodLower === 'transferencia' || methodLower === 'transfer';
        const isCard = methodLower === 'tarjeta' || methodLower === 'card';
        const isCash = methodLower === 'efectivo' || methodLower === 'cash';
        const isCancelled = credit.status === 'cancelled' || sale.status === 'cancelled';
        const isFullyPaid = remaining <= 0.01 || credit.status === 'paid';
        const payments = credit.payments || [];
        const items = sale.items && sale.items.length > 0 ? sale.items : [
          {
            product_name: 'Venta de Productos al Crédito',
            quantity: 1,
            unit_price_cordobas: totalDebt,
            total_cordobas: totalDebt
          }
        ];

        return (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewingInvoiceCredit(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
              
              {/* 1. Encabezado Fijo Superior */}
              <div className="shrink-0 flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/70 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Factura {sale.ticket_number ? (sale.ticket_number.startsWith('#') ? sale.ticket_number : '#' + sale.ticket_number) : `#CR-${credit.id}`}
                      </h3>
                      {isCancelled ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 tracking-wider">
                          ANULADA
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#def7ec] text-[#03543f] dark:bg-emerald-950/60 dark:text-emerald-300 tracking-wider">
                          COMPLETADA
                        </span>
                      )}
                      {renderPaymentBadge(sale.payment_method)}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                      Fecha de Emisión: {formatDateTime(sale.created_at || credit.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingInvoiceCredit(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Cuerpo Scrollable Independiente */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 my-2.5 [scrollbar-width:thin]">
                
                {/* Info Grid (Cliente y Emisor / Cajero) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card Cliente */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      CLIENTE
                    </span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {credit.customer_name || sale.customer?.name || 'Cliente'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Tel: {credit.customer_phone || sale.customer?.phone || '50588888888'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Dir: {sale.customer?.address || 'Venta Registrada'}
                    </p>
                  </div>

                  {/* Card Emisor / Cajero */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      EMISOR / CAJERO
                    </span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {sale.user_name || 'Cajero Principal'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Método Facturado: <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatPaymentMethod(sale.payment_method)}</span>
                    </p>
                    {isCredit && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                        Plazo Otorgado: {credit.dias_plazo || (sale as any).credit_term_days || 30} días
                      </p>
                    )}
                  </div>
                </div>

                {/* --- SECCIÓN SI ES VENTA AL CRÉDITO: SALDO, DEUDA Y ABONOS --- */}
                {isCredit && (
                  <div className="space-y-3">
                    {/* Tarjetas de Métricas de Crédito */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Monto Total */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                          Total Factura
                        </span>
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          C$ {totalDebt.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] text-slate-400">Deuda original</span>
                      </div>

                      {/* Total Abonado */}
                      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                          Total Abonado
                        </span>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          C$ {totalPaid.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">
                          {payments.length} abono(s) recibido(s)
                        </span>
                      </div>

                      {/* Saldo Pendiente Actual */}
                      <div className={`p-3 rounded-2xl border text-center sm:text-left ${
                        isFullyPaid 
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                          : isCreditOverdue(credit)
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                      }`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          isFullyPaid 
                            ? 'text-slate-500' 
                            : isCreditOverdue(credit) 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          Saldo Pendiente
                        </span>
                        <p className={`text-lg font-black font-mono mt-0.5 ${
                          isFullyPaid 
                            ? 'text-slate-400 line-through' 
                            : isCreditOverdue(credit) 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          C$ {remaining.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {isFullyPaid ? 'Factura saldada' : credit.due_date ? `Vence: ${new Date(credit.due_date).toLocaleDateString('es-NI')}` : 'Plazo 30 días'}
                        </span>
                      </div>
                    </div>

                    {/* Historial de Abonos de Esta Factura */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Historial de Abonos ({payments.length})
                          </h4>
                        </div>
                        {isFullyPaid ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            100% Saldado
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Resta C$ {remaining.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {payments && payments.length > 0 ? (
                        <div className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                <th className="py-2 px-3">Fecha / Hora</th>
                                <th className="py-2 px-3">Nº Recibo</th>
                                <th className="py-2 px-3">Método</th>
                                <th className="py-2 px-3 text-right">Monto Abonado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                              {payments.map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap text-[11px]">
                                    {formatDateTime(p.created_at)}
                                  </td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                    {p.receipt_number || `ABO-${idx + 1}`}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {p.payment_method || 'Efectivo'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                    +C$ {(p.amount_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700/80 text-xs text-slate-400">
                          <p className="font-semibold text-slate-600 dark:text-slate-300">No se registran abonos aún para esta factura.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">El saldo completo de C$ {totalDebt.toFixed(2)} se encuentra pendiente de cobro.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- SECCIÓN SI ES VENTA DE CONTADO: EFECTIVO, TARJETA O TRANSFERENCIA --- */}
                {!isCredit && (
                  <div className="space-y-3">
                    {isCash && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                              Factura Pagada de Contado (Efectivo)
                            </p>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                              Monto total recaudado en caja al momento de emisión • Saldo deudor: <strong>C$ 0.00</strong>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block uppercase font-bold">Total Cobrado</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            C$ {sale.total_cordobas.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {isCard && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm">
                              Factura Pagada con Tarjeta Débito / Crédito
                            </p>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                              Transacción electrónica POS aprobada • Saldo deudor: <strong>C$ 0.00</strong>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block uppercase font-bold">Total Cobrado</span>
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            C$ {sale.total_cordobas.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {isTransfer && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-blue-950 dark:text-blue-200 text-sm">
                              Factura Pagada por Transferencia Bancaria
                            </p>
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                              Operación bancaria electrónica conciliada • Saldo deudor: <strong>C$ 0.00</strong>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 block uppercase font-bold">Total Recibido</span>
                          <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                            C$ {sale.total_cordobas.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DETALLE DE PRODUCTOS */}
                <div className="space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    DETALLE DE PRODUCTOS ({items.length} {items.length === 1 ? 'ÍTEM' : 'ÍTEMS'})
                  </span>

                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="max-h-[160px] sm:max-h-[190px] overflow-y-auto [scrollbar-width:thin]">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-10 bg-[#f8fafc] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 text-left w-12 font-bold">Cant</th>
                            <th className="py-2.5 px-3 text-left font-bold">Descripción</th>
                            <th className="py-2.5 px-3 text-right font-bold">P. Unitario</th>
                            <th className="py-2.5 px-3 text-right font-bold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                          {items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition">
                              <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white text-xs align-middle">
                                {it.quantity}
                              </td>
                              <td className="py-2.5 px-3 align-middle">
                                <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                                  {it.product_name}
                                </p>
                                {((it as any).brand || (it as any).category) ? (
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                    {[(it as any).brand, (it as any).category].filter(Boolean).join(' • ')}
                                  </p>
                                ) : null}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200 text-xs align-middle font-mono">
                                C$ {(it.unit_price_cordobas || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white text-xs align-middle font-mono">
                                C$ {(it.total_cordobas || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Desglose de Totales */}
                  <div className="flex justify-end pt-2 pr-1">
                    <div className="w-56 sm:w-64 space-y-1 text-right text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          C$ {(sale.subtotal_cordobas || sale.total_cordobas || totalDebt).toFixed(2)}
                        </span>
                      </div>

                      {sale.discount_amount && sale.discount_amount > 0 ? (
                        <div className="flex justify-between text-rose-500">
                          <span>Descuento:</span>
                          <span className="font-bold font-mono">-C$ {sale.discount_amount.toFixed(2)}</span>
                        </div>
                      ) : null}

                      <div className="pt-1.5 flex justify-between items-baseline border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          TOTAL FACTURA:
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#2563eb] tracking-tight font-mono">
                          C$ {(sale.total_cordobas || totalDebt).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Footer Fijo */}
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 pt-4 sm:pt-5 border-t border-slate-100/90 dark:border-slate-800">
                {/* Left: Botón Abonar (si es crédito y debe aún) */}
                <div>
                  {isCredit && !isFullyPaid && !isCancelled && (
                    <button
                      type="button"
                      onClick={() => {
                        const cr = viewingInvoiceCredit;
                        setViewingInvoiceCredit(null);
                        setSelectedCredit(cr);
                        setPaymentAmount((cr.remaining_debt ?? cr.total_debt ?? 0).toString());
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Registrar Abono</span>
                    </button>
                  )}
                  {isFullyPaid && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-4 h-4" />
                      Cuenta Saldada al 100%
                    </span>
                  )}
                </div>

                {/* Right: WhatsApp, Imprimir y Cerrar */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSendInvoiceWhatsApp(sale, credit)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Comprobante</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingInvoiceCredit(null)}
                    className="px-4 sm:px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })(), document.body)}
    </div>
  );
};
