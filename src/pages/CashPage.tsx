import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Vault, DollarSign, ArrowUpRight, ArrowDownRight, 
  Lock, Unlock, CheckCircle2, PlusCircle, CreditCard, Banknote, RefreshCw,
  Receipt, Clock, UserCheck, Eye, Printer, MessageCircle, FileSpreadsheet,
  Calendar, User, X, Check, ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import { storage } from '../lib/storage';
import { CashRegister, Movement, Sale, CreditAccount, CashClosingRecord, DenominationCount } from '../types';
import { useToast } from '../components/UI/Toast';

export const CashPage: React.FC = () => {
  // Tabs: 'current' (Arqueo de Turno Actual) | 'history' (Historial de Cierres)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Core data
  const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null);
  const [registers, setRegisters] = useState<any[]>([]);
  const [closings, setClosings] = useState<CashClosingRecord[]>([]);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const { success, warning, info } = useToast();

  // History filters
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'yesterday'>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // Modals state
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedDetailClosing, setSelectedDetailClosing] = useState<CashClosingRecord | null>(null);
  const [selectedVoucherClosing, setSelectedVoucherClosing] = useState<CashClosingRecord | null>(null);

  // Forms: Apertura & Movimiento
  const [initialCash, setInitialCash] = useState('2000');
  const [notes, setNotes] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Closing cash denominations form
  const [closingDenominations, setClosingDenominations] = useState<DenominationCount>({
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    b10: 0,
    coins: 0
  });
  const [closingNotes, setClosingNotes] = useState('');

  const loadData = () => {
    const reg = storage.getActiveCashRegister();
    setActiveRegister(reg);
    setRegisters(storage.getCashRegisters());
    setClosings(storage.getCashClosings());
    setCredits(storage.getCredits() || []);
    
    // Calculate today's sales
    const sales = storage.getSales();
    const today = new Date().toISOString().split('T')[0];
    const filteredSales = sales.filter(s => s.created_at.startsWith(today) && s.status === 'completed');
    setTodaySales(filteredSales);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper date formatter
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-NI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  // Calculations for current active register
  const shiftPayments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return credits.flatMap(cr => 
      (cr.payments || []).map(p => ({
        id: p.id,
        credito_id: cr.id,
        ticket_number: cr.ticket_number,
        cliente_nombre: p.customer_name || cr.customer_name,
        credito_original: cr.total_debt,
        monto_abonado_hoy: p.amount_cordobas,
        saldo_restante_actual: cr.remaining_debt,
        payment_method: p.payment_method,
        hora_pago: p.created_at,
        caja_id: p.caja_id
      }))
    ).filter(p => {
      if (activeRegister && p.caja_id) {
        return String(p.caja_id) === String(activeRegister.id);
      }
      return p.hora_pago && p.hora_pago.startsWith(today);
    });
  }, [credits, activeRegister]);

  const cashSales = todaySales
    .filter(s => s.payment_method === 'cash' || s.payment_method === 'efectivo')
    .reduce((sum, s) => sum + (s.total_cordobas ?? (s as any).total ?? 0), 0);

  const cardSales = todaySales
    .filter(s => s.payment_method === 'card' || s.payment_method === 'tarjeta')
    .reduce((sum, s) => sum + (s.total_cordobas ?? (s as any).total ?? 0), 0);

  const transferSales = todaySales
    .filter(s => s.payment_method === 'transfer' || s.payment_method === 'transferencia')
    .reduce((sum, s) => sum + (s.total_cordobas ?? (s as any).total ?? 0), 0);

  const creditSales = todaySales
    .filter(s => s.payment_method === 'credit' || s.payment_method === 'credito')
    .reduce((sum, s) => sum + (s.total_cordobas ?? (s as any).total ?? 0), 0);

  const cashAbonosShift = shiftPayments
    .filter(p => p.payment_method === 'Efectivo' || p.payment_method === 'efectivo' || p.payment_method === 'cash')
    .reduce((sum, p) => sum + (p.monto_abonado_hoy || 0), 0);

  const initialAmount = activeRegister?.opening_amount || activeRegister?.initial_cash || 0;
  const currentCashInDrawer = initialAmount + cashSales + cashAbonosShift - (activeRegister?.total_expenses || 0);

  // Real-time calculation for closing modal cash count
  const countedPhysicalTotal = useMemo(() => {
    return (
      (closingDenominations.b1000 * 1000) +
      (closingDenominations.b500 * 500) +
      (closingDenominations.b200 * 200) +
      (closingDenominations.b100 * 100) +
      (closingDenominations.b50 * 50) +
      (closingDenominations.b20 * 20) +
      (closingDenominations.b10 * 10) +
      (Number(closingDenominations.coins) || 0)
    );
  }, [closingDenominations]);

  const countedBillsQuantity = useMemo(() => {
    return (
      (closingDenominations.b1000 || 0) +
      (closingDenominations.b500 || 0) +
      (closingDenominations.b200 || 0) +
      (closingDenominations.b100 || 0) +
      (closingDenominations.b50 || 0) +
      (closingDenominations.b20 || 0) +
      (closingDenominations.b10 || 0)
    );
  }, [closingDenominations]);

  const closingDifference = countedPhysicalTotal - currentCashInDrawer;

  // Filtered closings for Historial tab
  const filteredClosings = useMemo(() => {
    let list = [...closings];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (customDate) {
      list = list.filter(c => c.closed_at.slice(0, 10) === customDate);
    } else if (dateFilterMode === 'today') {
      list = list.filter(c => c.closed_at.slice(0, 10) === todayStr);
    } else if (dateFilterMode === 'yesterday') {
      list = list.filter(c => c.closed_at.slice(0, 10) === yesterdayStr);
    }

    return list;
  }, [closings, dateFilterMode, customDate]);

  // Aggregate sums for dark banner in Historial tab
  const totalEsperadoGlobal = useMemo(() => {
    return filteredClosings.reduce((sum, c) => sum + (c.total_esperado || 0), 0);
  }, [filteredClosings]);

  const totalFisicoGlobal = useMemo(() => {
    return filteredClosings.reduce((sum, c) => sum + (c.total_fisico_contado || 0), 0);
  }, [filteredClosings]);

  const balanceGlobal = totalFisicoGlobal - totalEsperadoGlobal;

  // Action Handlers
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

  const handleOpenCloseModal = () => {
    // Initialize counting with expected bills or 0
    setClosingDenominations({
      b1000: 0,
      b500: 0,
      b200: 0,
      b100: 0,
      b50: 0,
      b20: 0,
      b10: 0,
      coins: 0
    });
    setClosingNotes('');
    setShowCloseModal(true);
  };

  const handleConfirmCloseRegister = () => {
    if (!activeRegister) return;
    const closedAt = new Date().toISOString();
    const diff = countedPhysicalTotal - currentCashInDrawer;
    const estadoCuadre = Math.abs(diff) < 0.01 ? 'cuadrado' : diff < 0 ? 'faltante' : 'sobrante';
    const folio = `CAJA-${new Date().toISOString().slice(0, 10)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClosing: CashClosingRecord = {
      id: folio,
      folio: folio,
      cajero_nombre: activeRegister.user_name || activeRegister.user || 'Jairo',
      opened_at: activeRegister.opened_at,
      closed_at: closedAt,
      fondo_apertura: initialAmount,
      ventas_efectivo: cashSales,
      ventas_tarjeta: cardSales,
      ventas_transferencia: transferSales,
      ventas_credito: creditSales,
      cobranza_abonos: cashAbonosShift,
      egresos_gastos: activeRegister.total_expenses || 0,
      total_esperado: currentCashInDrawer,
      total_fisico_contado: countedPhysicalTotal,
      diferencia: diff,
      estado_cuadre: estadoCuadre,
      denominaciones: { ...closingDenominations },
      total_billetes_count: countedBillsQuantity,
      observaciones: closingNotes
    };

    storage.saveCashClosing(newClosing);
    storage.closeCashRegister(activeRegister.id, { total_fisico_contado: countedPhysicalTotal });
    
    setShowCloseModal(false);
    loadData();
    warning('¡Turno de Caja Cerrado!', `Arqueo ${folio} registrado con éxito`);
    setSelectedVoucherClosing(newClosing);
  };

  const handleCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister) return;
    const amount = parseFloat(movementAmount);
    if (!amount || amount <= 0) return;

    const diff = movementType === 'in' ? amount : -amount;
    const updated = {
      ...activeRegister,
      current_cash: Math.max(0, (activeRegister.current_cash || currentCashInDrawer) + diff),
      total_expenses: movementType === 'out' ? (activeRegister.total_expenses || 0) + amount : activeRegister.total_expenses
    };

    storage.saveCashRegister(updated);
    
    const mov: Movement = {
      id: 'mov-' + Date.now(),
      product_id: '',
      product_name: `Movimiento de Efectivo (${movementType === 'in' ? 'Ingreso' : 'Egreso'})`,
      type: movementType === 'in' ? 'in' : 'out',
      quantity: 1,
      reason: movementReason || 'Ajuste manual de efectivo',
      user: activeRegister.user_name || 'Jairo',
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

  // CSV Export
  const handleExportAllCSV = () => {
    const headers = ['Folio', 'Cajero', 'Fecha Cierre', 'Fondo Apertura (C$)', 'Ventas Efectivo (C$)', 'Total Esperado (C$)', 'Total Contado (C$)', 'Diferencia (C$)', 'Estado Cuadre'];
    const rows = filteredClosings.map(c => [
      `"${c.folio}"`,
      `"${c.cajero_nombre}"`,
      `"${formatDateTime(c.closed_at)}"`,
      c.fondo_apertura.toFixed(2),
      c.ventas_efectivo.toFixed(2),
      c.total_esperado.toFixed(2),
      c.total_fisico_contado.toFixed(2),
      c.diferencia.toFixed(2),
      `"${c.estado_cuadre.toUpperCase()}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_cierres_caja_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSingleCSV = (c: CashClosingRecord) => {
    const headers = ['Concepto / Denominación', 'Cantidad', 'Subtotal (C$)'];
    const rows = [
      ['Folio', c.folio, ''],
      ['Cajero Responsable', c.cajero_nombre, ''],
      ['Fecha y Hora Cierre', formatDateTime(c.closed_at), ''],
      ['Fondo de Apertura', '', c.fondo_apertura.toFixed(2)],
      ['Ventas en Efectivo', '', c.ventas_efectivo.toFixed(2)],
      ['Cobranza de Abonos', '', c.cobranza_abonos.toFixed(2)],
      ['Total Esperado', '', c.total_esperado.toFixed(2)],
      ['Total Físico Contado', '', c.total_fisico_contado.toFixed(2)],
      ['Diferencia de Cuadre', '', c.diferencia.toFixed(2)],
      ['Estado Final', c.estado_cuadre.toUpperCase(), ''],
      ['--- DESGLOSE DE BILLETES ---', '', ''],
      ['Billetes de C$ 1,000', c.denominaciones?.b1000 || 0, ((c.denominaciones?.b1000 || 0) * 1000).toFixed(2)],
      ['Billetes de C$ 500', c.denominaciones?.b500 || 0, ((c.denominaciones?.b500 || 0) * 500).toFixed(2)],
      ['Billetes de C$ 200', c.denominaciones?.b200 || 0, ((c.denominaciones?.b200 || 0) * 200).toFixed(2)],
      ['Billetes de C$ 100', c.denominaciones?.b100 || 0, ((c.denominaciones?.b100 || 0) * 100).toFixed(2)],
      ['Billetes de C$ 50', c.denominaciones?.b50 || 0, ((c.denominaciones?.b50 || 0) * 50).toFixed(2)],
      ['Billetes de C$ 20', c.denominaciones?.b20 || 0, ((c.denominaciones?.b20 || 0) * 20).toFixed(2)],
      ['Billetes de C$ 10', c.denominaciones?.b10 || 0, ((c.denominaciones?.b10 || 0) * 10).toFixed(2)],
      ['Monedas Nacionales', '-', (c.denominaciones?.coins || 0).toFixed(2)]
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `arqueo_${c.folio}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Share
  const handleShareWhatsApp = (c: CashClosingRecord) => {
    const text = `*COMPROBANTE OFICIAL DE ARQUEO DIARIO*\n` +
      `*SENDA SISTEMAS • CONTROL DE CAJA*\n` +
      `Folio: ${c.folio}\n` +
      `Fecha: ${formatDateTime(c.closed_at)}\n` +
      `Responsable: ${c.cajero_nombre}\n\n` +
      `*RESUMEN DE CUADRE:*\n` +
      `• Fondo Apertura: C$ ${c.fondo_apertura.toFixed(2)}\n` +
      `• Ventas Efectivo: C$ ${c.ventas_efectivo.toFixed(2)}\n` +
      `• Cobranza Abonos: C$ ${c.cobranza_abonos.toFixed(2)}\n` +
      `• Total Esperado: C$ ${c.total_esperado.toFixed(2)}\n` +
      `• Total Físico Contado: C$ ${c.total_fisico_contado.toFixed(2)}\n` +
      `• Diferencia: C$ ${c.diferencia.toFixed(2)} (${c.estado_cuadre.toUpperCase()})\n\n` +
      `*DESGLOSE FÍSICO:*\n` +
      `• Billetes C$ 1000: ${c.denominaciones?.b1000 || 0}\n` +
      `• Billetes C$ 500: ${c.denominaciones?.b500 || 0}\n` +
      `• Billetes C$ 200: ${c.denominaciones?.b200 || 0}\n` +
      `• Billetes C$ 100: ${c.denominaciones?.b100 || 0}\n` +
      `• Billetes C$ 50: ${c.denominaciones?.b50 || 0}\n` +
      `• Billetes C$ 20: ${c.denominaciones?.b20 || 0}\n` +
      `• Billetes C$ 10: ${c.denominaciones?.b10 || 0}\n` +
      `• Monedas: C$ ${(c.denominaciones?.coins || 0).toFixed(2)}\n\n` +
      `Sistema SendaFact`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. TOP TABS BAR (Arqueo de Turno Actual / Historial de Cierres) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'current'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Arqueo de Turno Actual
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Historial de Cierres ({closings.length})
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {activeTab === 'history' && (
            <button
              type="button"
              onClick={handleExportAllCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel ({filteredClosings.length})</span>
            </button>
          )}

          {/* Status badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-xs ${
            activeRegister 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${activeRegister ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{activeRegister ? 'CAJA ABIERTA' : 'CAJA CERRADA'}</span>
          </div>
        </div>

      </div>

      {/* 2. VIEW 1: ARQUEO DE TURNO ACTUAL */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          
          {/* Main Title Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0b1329] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Vault className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Control y Arqueo de Caja
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                    activeRegister 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {activeRegister ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {activeRegister ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Gestión de turnos, fondos de apertura, entradas/salidas y cuadre diario
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {activeRegister ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMovementModal(true)}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-500" />
                    <span>Ingreso / Retiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCloseModal}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs sm:text-sm font-black tracking-wide shadow-md shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Cerrar Caja</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowOpenModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Abrir Turno de Caja</span>
                </button>
              )}
            </div>
          </div>

          {/* 5 Main Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* 1. Efectivo en Caja */}
            <div className="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">EFECTIVO EN CAJA</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                C$ {currentCashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Apertura: C$ {initialAmount.toFixed(2)}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Total Arqueo</span>
              </div>
            </div>

            {/* 2. Ventas Contado */}
            <div className="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">VENTAS CONTADO</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                C$ {cashSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Tarjetas: C$ {cardSales.toFixed(2)}</span>
                <span className="text-slate-400">{todaySales.length} ventas</span>
              </div>
            </div>

            {/* 3. Cobranza Abonos */}
            <div className="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">COBRANZA ABONOS</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                C$ {cashAbonosShift.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>{shiftPayments.length} abonos cobrados</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">+ Efectivo</span>
              </div>
            </div>

            {/* 4. Ventas Crédito */}
            <div className="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">VENTAS CRÉDITO</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                C$ {creditSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>No entra a caja</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Por cobrar</span>
              </div>
            </div>

            {/* 5. Cajero en Turno */}
            <div className="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">CAJERO EN TURNO</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white truncate">
                {activeRegister?.user || activeRegister?.user_name || 'Jairo'}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Apertura:</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono">
                  {activeRegister ? formatTime(activeRegister.opened_at) : '--:--'}
                </span>
              </div>
            </div>

          </div>

          {/* Historial de Aperturas y Cierres (Table) */}
          <div className="bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Historial de Aperturas y Cierres
              </h2>
              <button 
                type="button"
                onClick={loadData}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition cursor-pointer"
                title="Actualizar tabla"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-[10.5px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
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
                    <tr key={reg.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {reg.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {reg.user || reg.user_name || 'Jairo'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {reg.opened_at ? new Date(reg.opened_at).toLocaleString() : '--'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs italic">
                        {reg.closed_at ? new Date(reg.closed_at).toLocaleString() : 'En curso...'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        C$ {(reg.initial_cash || reg.opening_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        C$ {(reg.total_sales_cash || reg.cash_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                        C$ {(reg.status === 'open' ? (reg.current_cash || currentCashInDrawer) : (reg.final_cash || reg.closing_amount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          reg.status === 'open' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
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

        </div>
      )}

      {/* 3. VIEW 2: HISTORIAL DE CIERRES Y ARQUEOS */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          
          {/* Header Blue Card */}
          <div className="bg-white dark:bg-[#0b1329] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                HISTORIAL DE CIERRES Y ARQUEOS (C$)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Registro de auditoría y reportes pasados de caja
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0b1329] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Filtrar por Día:</span>
              </div>

              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilterMode('all');
                }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => {
                  setDateFilterMode('all');
                  setCustomDate('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateFilterMode === 'all' && !customDate
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos los Días
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterMode('today');
                  setCustomDate('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateFilterMode === 'today' && !customDate
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterMode('yesterday');
                  setCustomDate('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateFilterMode === 'yesterday' && !customDate
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Ayer
              </button>
            </div>

            <div className="text-xs font-bold text-slate-400">
              Mostrando <span className="text-slate-800 dark:text-slate-200 font-black">{filteredClosings.length}</span> arqueo(s)
            </div>
          </div>

          {/* Dark Summary Banner */}
          <div className="bg-[#0b1329] text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                TOTAL ESPERADO
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                C$ {totalEsperadoGlobal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                TOTAL FÍSICO CONTADO
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                C$ {totalFisicoGlobal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BALANCE GLOBAL
              </span>
              <span className={`text-xl sm:text-2xl font-black font-mono ${
                balanceGlobal < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {balanceGlobal < 0 ? '-' : '+'}C$ {Math.abs(balanceGlobal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* List of Closed Shift Cards */}
          <div className="space-y-4">
            {filteredClosings.map((c) => {
              const totalBills = (c.denominaciones?.b1000 || 0) +
                (c.denominaciones?.b500 || 0) +
                (c.denominaciones?.b200 || 0) +
                (c.denominaciones?.b100 || 0) +
                (c.denominaciones?.b50 || 0) +
                (c.denominaciones?.b20 || 0) +
                (c.denominaciones?.b10 || 0);

              return (
                <div 
                  key={c.id}
                  className="bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition"
                >
                  {/* Top Line: Folio, User, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {c.folio}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {c.cajero_nombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDateTime(c.closed_at)}
                      </span>

                      {/* Status badge */}
                      {c.estado_cuadre === 'cuadrado' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          CUADRADO
                        </span>
                      ) : c.estado_cuadre === 'faltante' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          FALTANTE: -C$ {Math.abs(c.diferencia).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          SOBRANTE: +C$ {c.diferencia.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10.5px]">Fondo Apertura</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                        C${c.fondo_apertura.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10.5px]">Ventas Efectivo</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        +C${c.ventas_efectivo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10.5px]">Total Esperado</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        C${c.total_esperado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10.5px]">Físico Contado</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        C${c.total_fisico_contado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Sub-line with counts & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-slate-400" />
                      <span>Conteo: {totalBills} billetes • Monedas: C${(c.denominaciones?.coins || 0).toFixed(2)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailClosing(c)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Arqueo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportSingleCSV(c)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel (CSV)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedVoucherClosing(c)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(c)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL 1: DETALLE COMPLETO DEL ARQUEO DIARIO (Image 6) */}
      {selectedDetailClosing && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDetailClosing(null);
          }}
          className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    DETALLE COMPLETO DEL ARQUEO DIARIO
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Folio: {selectedDetailClosing.folio} • {formatDateTime(selectedDetailClosing.closed_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailClosing(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto modal-scroll">
              
              {/* 4 Summary Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">RESPONSABLE</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {selectedDetailClosing.cajero_nombre}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">FONDO INICIAL</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                    C${selectedDetailClosing.fondo_apertura.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">TOTAL ESPERADO</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                    C${selectedDetailClosing.total_esperado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">FÍSICO CONTADO</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    C${selectedDetailClosing.total_fisico_contado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Denominations Table */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <span>💵</span>
                  <span>DESGLOSE FÍSICO POR DENOMINACIÓN (CÓRDOBAS):</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 dark:bg-slate-900 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">DENOMINACIÓN</th>
                        <th className="py-2.5 px-4 text-center">CANTIDAD CONTADA</th>
                        <th className="py-2.5 px-4 text-right">SUBTOTAL (C$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 1,000</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b1000 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b1000 || 0) * 1000)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 500</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b500 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b500 || 0) * 500)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 200</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b200 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b200 || 0) * 200)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 100</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b100 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b100 || 0) * 100)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 50</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b50 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b50 || 0) * 50)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 20</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b20 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b20 || 0) * 20)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Billetes de C$ 10</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedDetailClosing.denominaciones?.b10 || 0}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(((selectedDetailClosing.denominaciones?.b10 || 0) * 10)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">Monedas Nacionales (Total)</td>
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400">-</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          C${(Number(selectedDetailClosing.denominaciones?.coins) || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 font-black">
                        <td className="py-3 px-4 uppercase text-slate-900 dark:text-white">TOTAL FÍSICO CONTADO</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400"></td>
                        <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400 text-sm">
                          C${selectedDetailClosing.total_fisico_contado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resultado de Cuadre Final */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Resultado de Cuadre Final:</span>
                {selectedDetailClosing.estado_cuadre === 'cuadrado' ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    CAJA CUADRADA EXACTA (C$ 0.00)
                  </span>
                ) : selectedDetailClosing.estado_cuadre === 'faltante' ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    FALTANTE: -C$ {Math.abs(selectedDetailClosing.diferencia).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    SOBRANTE: +C$ {selectedDetailClosing.diferencia.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailClosing(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cerrar Detalle
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportSingleCSV(selectedDetailClosing)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Guardar Excel (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const c = selectedDetailClosing;
                    setSelectedDetailClosing(null);
                    setSelectedVoucherClosing(c);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(selectedDetailClosing)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: COMPROBANTE OFICIAL DE ARQUEO DIARIO (Images 7 & 8) */}
      {selectedVoucherClosing && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedVoucherClosing(null);
          }}
          className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 no-print">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  SENDA SISTEMAS • CONTROL DE CAJA
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  COMPROBANTE OFICIAL DE ARQUEO DIARIO
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Folio: {selectedVoucherClosing.folio} • Fecha: {formatDateTime(selectedVoucherClosing.closed_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir o Guardar en PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVoucherClosing(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Comprobante Body */}
            <div 
              id="printable-arqueo"
              className="p-6 sm:p-8 space-y-6 overflow-y-auto modal-scroll bg-white text-slate-900"
            >
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-4">
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  SENDA SISTEMAS • CONTROL DE CAJA
                </p>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  COMPROBANTE OFICIAL DE ARQUEO DIARIO
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Folio: {selectedVoucherClosing.folio} • Fecha: {formatDateTime(selectedVoucherClosing.closed_at)}
                </p>
              </div>

              {/* 4 Strip Info */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">RESPONSABLE</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedVoucherClosing.cajero_nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">FONDO APERTURA</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    C${selectedVoucherClosing.fondo_apertura.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">TOTAL ESPERADO</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    C${selectedVoucherClosing.total_esperado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">TOTAL CONTADO</span>
                  <span className="font-mono font-bold text-blue-600 text-xs">
                    C${selectedVoucherClosing.total_fisico_contado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Denominations Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-[10px] uppercase font-black text-slate-600 tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-4">DENOMINACIÓN</th>
                      <th className="py-2 px-4 text-center">CANTIDAD</th>
                      <th className="py-2 px-4 text-right">SUBTOTAL (C$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 1,000</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b1000 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b1000 || 0) * 1000)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 500</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b500 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b500 || 0) * 500)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 200</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b200 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b200 || 0) * 200)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 100</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b100 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b100 || 0) * 100)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 50</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b50 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b50 || 0) * 50)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 20</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b20 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b20 || 0) * 20)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Billetes de C$ 10</td>
                      <td className="py-2 px-4 text-center font-mono font-bold">{selectedVoucherClosing.denominaciones?.b10 || 0}</td>
                      <td className="py-2 px-4 text-right font-mono">C${(((selectedVoucherClosing.denominaciones?.b10 || 0) * 10)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-semibold">Monedas Nacionales (Total)</td>
                      <td className="py-2 px-4 text-center font-mono text-slate-400">-</td>
                      <td className="py-2 px-4 text-right font-mono">C${(Number(selectedVoucherClosing.denominaciones?.coins) || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-black border-t-2 border-slate-900">
                      <td className="py-2.5 px-4 uppercase">TOTAL FÍSICO CONTADO EN CAJA</td>
                      <td className="py-2.5 px-4 text-center font-mono"></td>
                      <td className="py-2.5 px-4 text-right font-mono text-blue-600 text-sm">
                        C${selectedVoucherClosing.total_fisico_contado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Difference Row */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Diferencia Final de Caja:</span>
                <span className={`font-mono font-black text-sm ${
                  selectedVoucherClosing.estado_cuadre === 'cuadrado'
                    ? 'text-emerald-700'
                    : selectedVoucherClosing.estado_cuadre === 'faltante'
                    ? 'text-rose-700'
                    : 'text-blue-700'
                }`}>
                  C$ {selectedVoucherClosing.diferencia.toFixed(2)} ({selectedVoucherClosing.estado_cuadre.toUpperCase()})
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-800">
                    Firma Cajero / Responsable
                  </div>
                  <span className="text-slate-500 text-[11px]">{selectedVoucherClosing.cajero_nombre}</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-800">
                    Firma Supervisión / Gerencia
                  </div>
                  <span className="text-slate-500 text-[11px]">SendaDistribución</span>
                </div>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: CERRAR CAJA / ARQUEO FINAL CON DESGLOSE */}
      {showCloseModal && activeRegister && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCloseModal(false);
          }}
          className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Informe de Cierre y Arqueo de Caja
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      ARQUEO FINAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Turno #{activeRegister.id} • {activeRegister.user_name || activeRegister.user || 'Jairo'} • Apertura: {formatTime(activeRegister.opened_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto modal-scroll">
              
              {/* Top 4 Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">FONDO APERTURA</span>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    C$ {initialAmount.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">VENTAS CONTADO</span>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    + C$ {cashSales.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">COBRANZA ABONOS</span>
                  <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
                    + C$ {cashAbonosShift.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">VENTAS A CRÉDITO</span>
                  <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                    C$ {creditSales.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">No entra a caja</span>
                </div>
              </div>

              {/* Total Calculation Strip */}
              <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Fondo Inicial de Apertura:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">C$ {initialAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>(+) Entradas por Ventas de Contado (Efectivo):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+ C$ {cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>(+) Entradas por Abonos de Clientes a Crédito:</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+ C$ {cashAbonosShift.toFixed(2)}</span>
                </div>
                {activeRegister.total_expenses ? (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>(-) Salidas / Retiros registrados:</span>
                    <span className="font-mono font-bold text-rose-600">- C$ {activeRegister.total_expenses.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-black text-sm text-slate-900 dark:text-white block">
                      Total Efectivo Físico a Entregar:
                    </span>
                    <span className="text-[10px] text-slate-400">Monto que debe estar físicamente en la gaveta</span>
                  </div>
                  <span className="font-mono font-black text-xl text-amber-600 dark:text-amber-400">
                    C$ {currentCashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Denomination Counting Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5 tracking-wide">
                    <span>💵</span>
                    <span>Conteo Físico de Billetes y Monedas (Arqueo)</span>
                  </label>
                  <span className="text-xs text-slate-400 font-semibold font-mono">
                    Total Contado: <strong className="text-blue-600 dark:text-blue-400">C$ {countedPhysicalTotal.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 1,000</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b1000 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b1000: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 500</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b500 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b500: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 200</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b200 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b200: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 100</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b100 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b100: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 50</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b50 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b50: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 20</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b20 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b20: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">C$ 10</span>
                    <input
                      type="number"
                      min="0"
                      value={closingDenominations.b10 || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, b10: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Monedas (C$)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={closingDenominations.coins || ''}
                      onChange={(e) => setClosingDenominations(d => ({ ...d, coins: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold mt-1"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Real-time comparison badge */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Diferencia de Cuadre:
                  </span>
                  <span className={`font-mono font-black ${
                    Math.abs(closingDifference) < 0.01 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : closingDifference < 0 
                      ? 'text-rose-600' 
                      : 'text-blue-600'
                  }`}>
                    {Math.abs(closingDifference) < 0.01 ? 'C$ 0.00 (CUADRADA)' : `${closingDifference < 0 ? '-' : '+'}C$ ${Math.abs(closingDifference).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Clientes que abonaron */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-teal-500" />
                    CLIENTES QUE ABONARON DURANTE ESTE TURNO ({shiftPayments.length})
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-600">
                    Total Cobranza: C$ {cashAbonosShift.toFixed(2)}
                  </span>
                </div>

                {shiftPayments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 italic">
                    No se registraron abonos a cuentas de crédito durante este turno.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto modal-scroll pr-1">
                    {shiftPayments.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{p.cliente_nombre}</span>
                          <span className="text-[10px] text-slate-400">{p.ticket_number} • {formatTime(p.hora_pago)}</span>
                        </div>
                        <span className="font-mono font-bold text-teal-600">+ C$ {p.monto_abonado_hoy.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Volver a Turno
              </button>

              <button
                type="button"
                onClick={handleConfirmCloseRegister}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmar y Cerrar Turno</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: ABRIR TURNO DE CAJA */}
      {showOpenModal && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOpenModal(false);
          }}
          className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Apertura de Turno de Caja</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Establece el monto de fondo inicial en efectivo</p>
              </div>
            </div>

            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                  Monto Inicial en Efectivo (C$)
                </label>
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
                    placeholder="2000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                  Observaciones / Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Fondo de cambio inicial en billetes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: MOVIMIENTO MANUAL DE EFECTIVO */}
      {showMovementModal && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMovementModal(false);
          }}
          className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Movimiento Manual de Efectivo
            </h3>

            <form onSubmit={handleCashMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
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
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Ej. Pago de flete, compra de papel térmico..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition cursor-pointer"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CashPage;
