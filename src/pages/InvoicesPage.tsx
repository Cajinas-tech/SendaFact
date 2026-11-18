import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Search,
  Eye,
  Printer,
  Download,
  Filter,
  UserCheck,
  Calendar,
  CreditCard,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Ban,
  ArrowUpDown,
  MessageCircle,
  Check,
  ShieldAlert,
  Lock,
  Undo2
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Sale, CompanySetting, User, CreditAccount } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';
import { ModalAnulacionSupabase } from '../components/ModalAnulacionSupabase';

export const InvoicesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'cajero' | 'vendedor'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected sale for detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Selected sale for print modal
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'80mm' | '58mm' | 'letter'>('80mm');

  const handleShareWhatsApp = () => {
    if (!printSale) return;
    const itemsText = printSale.items?.map(i => `• ${i.quantity}x ${i.product_name} - C$${i.total_cordobas.toFixed(2)}`).join('\n') || '';
    const text = `*TICKET / FACTURA DE VENTA*\n` +
      `*${company?.name || 'SENDA SISTEMAS'}*\n` +
      `Documento: ${printSale.ticket_number || '#' + printSale.id}\n` +
      `Fecha: ${formatDateTime(printSale.created_at)}\n` +
      `Cliente: ${printSale.customer?.name || (printSale as any).customer_name || 'Consumidor Final'}\n\n` +
      `*DETALLE DE PRODUCTOS:*\n${itemsText}\n\n` +
      `*TOTAL A PAGAR: C$ ${(printSale.total_cordobas || 0).toFixed(2)}*\n\n` +
      `${company?.ticket_footer || '¡Gracias por su compra!'}`;
    
    const phone = printSale.customer?.phone?.replace(/\D/g, '') || '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Void/Cancel sale modal
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Active main tab & Supabase Anulación
  const [activeMainTab, setActiveMainTab] = useState<'historial' | 'anulaciones'>('historial');
  const [anulacionSubFilter, setAnulacionSubFilter] = useState<'activas' | 'anuladas'>('activas');
  const [anulacionSearch, setAnulacionSearch] = useState('');
  const [saleToAnulate, setSaleToAnulate] = useState<Sale | null>(null);
  const [showSupabaseAnulacionModal, setShowSupabaseAnulacionModal] = useState(false);

  const { success, warning, info } = useToast();

  const loadData = () => {
    const loadedSales = storage.getSales();
    setSales(loadedSales);
    setUsers(storage.getUsers());
    setCompany(storage.getCompanySettings());
    setCredits(storage.getCredits() || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format date helper
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      // If it looks like a clean formatted date, return or parse
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
    } catch {
      return dateStr;
    }
  };

  // Helper to detect role from sale user
  const getUserRole = (sale: Sale): 'admin' | 'cajero' | 'vendedor' => {
    if (sale.user_role) {
      const r = sale.user_role.toLowerCase();
      if (r.includes('admin')) return 'admin';
      if (r.includes('cajer') || r.includes('caja')) return 'cajero';
      if (r.includes('vend')) return 'vendedor';
    }
    
    // Check sale user_name
    const nameLower = (sale.user_name || '').toLowerCase();
    if (nameLower.includes('admin') || nameLower.includes('jairotten') || nameLower.includes('jairo')) {
      return 'admin';
    }
    if (nameLower.includes('loira') || nameLower.includes('caja') || nameLower.includes('cajer')) {
      return 'cajero';
    }
    if (nameLower.includes('dylan') || nameLower.includes('vent')) {
      return 'vendedor';
    }

    // Lookup in users list
    if (sale.user_id) {
      const match = users.find(u => u.id === sale.user_id);
      if (match) return match.role;
    }

    return 'cajero';
  };

  // Helper for role badge display
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
            ADMINISTRADOR
          </span>
        );
      case 'cajero':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            CAJERO
          </span>
        );
      case 'vendedor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            VENDEDOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {role.toUpperCase()}
          </span>
        );
    }
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const ticket = (s.ticket_number || '').toLowerCase();
        const client = (s.customer?.name || (s as any).customer_name || 'Consumidor Final').toLowerCase();
        const user = (s.user_name || '').toLowerCase();
        const idStr = String(s.id);
        const matches = ticket.includes(term) || client.includes(term) || user.includes(term) || idStr.includes(term);
        if (!matches) return false;
      }

      // Role filter
      if (roleFilter !== 'all') {
        const r = getUserRole(s);
        if (r !== roleFilter) return false;
      }

      // Specific user filter
      if (userFilter !== 'all') {
        const uName = (s.user_name || '').toLowerCase();
        if (!uName.includes(userFilter.toLowerCase())) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        const saleMethod = (s.payment_method || '').toLowerCase().trim();
        const filter = paymentFilter.toLowerCase().trim();
        if (filter === 'efectivo') {
          if (saleMethod !== 'efectivo' && saleMethod !== 'cash') return false;
        } else if (filter === 'tarjeta') {
          if (saleMethod !== 'tarjeta' && saleMethod !== 'card') return false;
        } else if (filter === 'transferencia') {
          if (saleMethod !== 'transferencia' && saleMethod !== 'transfer') return false;
        } else if (filter === 'credito') {
          if (saleMethod !== 'credito' && saleMethod !== 'crédito' && saleMethod !== 'credit') return false;
        } else {
          if (saleMethod !== filter) return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (s.status !== statusFilter) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const saleDate = new Date(s.created_at);
        const now = new Date();

        if (dateFilter === 'today') {
          const isToday = saleDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (saleDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'month') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (saleDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'custom') {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (saleDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (saleDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [sales, searchTerm, roleFilter, userFilter, paymentFilter, statusFilter, dateFilter, startDate, endDate, users]);

  // Statistics summaries
  const totalAmountCordobas = useMemo(() => {
    return filteredSales
      .filter(s => s.status !== 'cancelled')
      .reduce((sum, s) => sum + (s.total_cordobas || 0), 0);
  }, [filteredSales]);

  const totalAdminAmount = useMemo(() => {
    return filteredSales
      .filter(s => s.status !== 'cancelled' && getUserRole(s) === 'admin')
      .reduce((sum, s) => sum + (s.total_cordobas || 0), 0);
  }, [filteredSales]);

  const totalCajeroAmount = useMemo(() => {
    return filteredSales
      .filter(s => s.status !== 'cancelled' && getUserRole(s) === 'cajero')
      .reduce((sum, s) => sum + (s.total_cordobas || 0), 0);
  }, [filteredSales]);

  const totalVendedorAmount = useMemo(() => {
    return filteredSales
      .filter(s => s.status !== 'cancelled' && getUserRole(s) === 'vendedor')
      .reduce((sum, s) => sum + (s.total_cordobas || 0), 0);
  }, [filteredSales]);

  // Cancelled vs Active statistics for Anulación tab
  const cancelledSales = useMemo(() => {
    return sales.filter(s => s.status === 'cancelled');
  }, [sales]);

  const activeSales = useMemo(() => {
    return sales.filter(s => s.status !== 'cancelled');
  }, [sales]);

  const totalCancelledAmount = useMemo(() => {
    return cancelledSales.reduce((sum, s) => sum + (s.total_cordobas || 0), 0);
  }, [cancelledSales]);

  const totalReturnedUnits = useMemo(() => {
    return cancelledSales.reduce((sum, s) => {
      const units = (s.items || []).reduce((uSum, it) => uSum + (it.quantity || 0), 0);
      return sum + units;
    }, 0);
  }, [cancelledSales]);

  // Filtered sales for Anulación tab
  const filteredAnulacionSales = useMemo(() => {
    const list = anulacionSubFilter === 'activas' ? activeSales : cancelledSales;
    if (!anulacionSearch.trim()) return list;
    const q = anulacionSearch.toLowerCase().trim();
    return list.filter(s => {
      const ticket = (s.ticket_number || `#FACT-${s.id}`).toLowerCase();
      const client = (s.customer?.name || (s as any).customer_name || 'consumidor final').toLowerCase();
      const user = (s.user_name || '').toLowerCase();
      const reason = (s.cancellation_reason || '').toLowerCase();
      return ticket.includes(q) || client.includes(q) || user.includes(q) || reason.includes(q);
    });
  }, [activeSales, cancelledSales, anulacionSubFilter, anulacionSearch]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      warning('Sin datos', 'No hay facturas para exportar con los filtros seleccionados');
      return;
    }

    const headers = [
      'Nº FACTURA',
      'FECHA Y HORA',
      'CLIENTE',
      'USUARIO / EMISOR',
      'ROL',
      'MÉTODO DE PAGO',
      'ESTADO',
      'TOTAL C$',
      'TOTAL USD',
      'ITEMS'
    ];

    const rows = filteredSales.map(s => {
      const itemsList = (s.items || []).map(i => `${i.quantity}x ${i.product_name}`).join('; ');
      const clientName = s.customer?.name || (s as any).customer_name || 'Consumidor Final';
      const role = getUserRole(s).toUpperCase();
      const status = s.status === 'completed' ? 'Completada' : (s.status === 'cancelled' ? 'Anulada' : s.status);
      
      return [
        `"${s.ticket_number || `#FACT-${s.id}`}"`,
        `"${formatDateTime(s.created_at)}"`,
        `"${clientName}"`,
        `"${s.user_name || 'Usuario'}"`,
        `"${role}"`,
        `"${s.payment_method || 'efectivo'}"`,
        `"${status}"`,
        (s.total_cordobas || 0).toFixed(2),
        (s.total_usd || 0).toFixed(2),
        `"${itemsList}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial_facturas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success('Archivo CSV Generado', `Se exportaron ${filteredSales.length} facturas exitosamente`);
  };

  // Export / Print PDF report
  const handleExportPDF = () => {
    if (filteredSales.length === 0) {
      warning('Sin datos', 'No hay facturas para exportar con los filtros seleccionados');
      return;
    }
    window.print();
  };

  // Open detail modal
  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  // Open direct print modal
  const handleDirectPrint = (sale: Sale) => {
    setPrintSale(sale);
    setShowPrintModal(true);
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

  const handleSendWhatsApp = (sale: Sale) => {
    const rawPhone = sale.customer?.phone || (sale as any).customer_phone || '50588888888';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('505') ? cleanPhone : `505${cleanPhone}`;

    const itemsText =
      sale.items && sale.items.length > 0
        ? sale.items.map(it => `• ${it.quantity}x ${it.product_name} - C$${it.total_cordobas.toFixed(2)}`).join('\n')
        : `• 1x Consumo de artículos - C$${(sale.total_cordobas || 0).toFixed(2)}`;

    const message =
      `🧾 *COMPROBANTE DE FACTURA - SENDA SISTEMAS*\n\n` +
      `*Factura:* ${sale.ticket_number || `#FACT-${sale.id}`}\n` +
      `*Fecha:* ${formatDateTime(sale.created_at)}\n` +
      `*Cliente:* ${sale.customer?.name || (sale as any).customer_name || 'Consumidor Final'}\n` +
      `*Atendido por:* ${sale.user_name || 'Usuario'}\n` +
      `*Método:* ${formatPaymentMethod(sale.payment_method || 'Efectivo')}\n` +
      `--------------------------------\n` +
      `*DETALLE DE PRODUCTOS:*\n${itemsText}\n` +
      `--------------------------------\n` +
      `*TOTAL: C$ ${(sale.total_cordobas || 0).toFixed(2)}*\n\n` +
      `¡Muchas gracias por su preferencia!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Confirm cancel sale
  const handleConfirmCancel = () => {
    if (!saleToCancel) return;
    storage.cancelSale(saleToCancel.id);
    setShowCancelModal(false);
    loadData();
    info('Factura Anulada', `La factura ${saleToCancel.ticket_number} fue marcada como anulada`);
    if (selectedSale?.id === saleToCancel.id) {
      setSelectedSale(prev => prev ? { ...prev, status: 'cancelled' } : null);
    }
    setSaleToCancel(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Facturado</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              C$ {totalAmountCordobas.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{filteredSales.length} facturas encontradas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Facturado Administrador */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Por Administrador</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              C$ {totalAdminAmount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ventas directas de admin</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Facturado Cajero */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Por Cajero(a)</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              C$ {totalCajeroAmount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ventas en caja de cobro</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Facturado Vendedor */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Por Vendedor</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              C$ {totalVendedorAmount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ventas en sala / piso</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION VIEW TABS: Historial de Facturas vs Anulación de Facturas */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab('historial')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeMainTab === 'historial'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Historial de Facturas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('anulaciones')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer relative ${
              activeMainTab === 'anulaciones'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Anulación de Facturas</span>
            {cancelledSales.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeMainTab === 'anulaciones' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
              }`}>
                {cancelledSales.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {activeMainTab === 'historial'
            ? 'Historial de ventas y comprobantes emitidos'
            : 'Procedimiento de anulación y reversión con autorización Supabase'}
        </div>
      </div>

      {/* VIEW TAB 1: HISTORIAL DE FACTURAS */}
      {activeMainTab === 'historial' && (
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in">
        
        {/* CARD TOP HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                HISTORIAL DE FACTURAS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consulte y descargue reportes del historial completo de ventas
              </p>
            </div>
          </div>

          {/* Right Action Controls: Search + CSV + PDF */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="Descargar reporte en formato CSV (Excel)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </button>

            {/* PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-700/60 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="Imprimir / Exportar a PDF"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* SECONDARY FILTER BAR (ROLES, USERS, DATES, STATUS) */}
        <div className="p-3 sm:px-6 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>

            {/* Role Filter Tabs */}
            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
              >
                Todos los Roles
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'admin' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
              >
                Administrador
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('cajero')}
                className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'cajero' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
              >
                Cajero
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('vendedor')}
                className={`px-2.5 py-1 rounded-lg transition ${roleFilter === 'vendedor' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
              >
                Vendedor
              </button>
            </div>

            {/* Payment Method Select */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Forma de Pago: Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="credito">Crédito</option>
            </select>

            {/* Date Quick Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Período: Historial Completo</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Últimos 30 días</option>
              <option value="custom">Rango Personalizado</option>
            </select>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Estado: Todos</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Anuladas</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || roleFilter !== 'all' || paymentFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setUserFilter('all');
                setPaymentFilter('all');
                setStatusFilter('all');
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Limpiar Filtros
            </button>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {dateFilter === 'custom' && (
          <div className="p-3 sm:px-6 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Rango de fechas:</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">Desde:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">Hasta:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* 3. TABLE OF INVOICES */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30">
                <th className="py-3.5 px-4 sm:px-6">Nº FACTURA</th>
                <th className="py-3.5 px-4">FECHA / HORA</th>
                <th className="py-3.5 px-4">CLIENTE</th>
                <th className="py-3.5 px-4">MÉTODO</th>
                <th className="py-3.5 px-4">CAJERO / EMISOR</th>
                <th className="py-3.5 px-4">TOTAL</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const role = getUserRole(sale);
                  const isCancelled = sale.status === 'cancelled';
                  const clientName = sale.customer?.name || (sale as any).customer_name || 'Consumidor Final';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCancelled ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Nº FACTURA */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="font-semibold">{sale.ticket_number || `#FACT-${sale.id}`}</span>
                        {isCancelled && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 uppercase">
                            Anulada
                          </span>
                        )}
                      </td>

                      {/* FECHA / HORA */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(sale.created_at)}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span className="capitalize">{clientName}</span>
                      </td>

                      {/* MÉTODO */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderPaymentBadge(sale.payment_method)}
                      </td>

                      {/* CAJERO / EMISOR */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            {sale.user_name || 'Usuario'}
                          </span>
                          {renderRoleBadge(role)}
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap text-sm">
                        C$ {(sale.total_cordobas || 0).toLocaleString('es-NI', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>

                      {/* ACCIONES (EYE & PRINTER ICONS) */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* Eye: Ver Factura */}
                          <button
                            type="button"
                            onClick={() => handleViewDetail(sale)}
                            className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Ver detalle de factura"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Printer: Imprimir Factura */}
                          <button
                            type="button"
                            onClick={() => handleDirectPrint(sale)}
                            className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Imprimir factura / ticket"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Ban: Anular Factura con Supabase */}
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => {
                                setSaleToAnulate(sale);
                                setShowSupabaseAnulacionModal(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Anular factura (Autorización Supabase)"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No se encontraron facturas
                      </p>
                      <p className="text-xs text-slate-400">
                        Intente ajustar los términos de búsqueda o cambiar los filtros.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER SUMMARY */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSales.length}</span> facturas registradas
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Filtrado:{' '}
              <strong className="text-cyan-600 dark:text-cyan-400 font-black text-sm">
                C$ {totalAmountCordobas.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </div>
      )}

      {/* VIEW TAB 2: ANULACIÓN DE FACTURAS (SUPABASE RPC INTEGRADO) */}
      {activeMainTab === 'anulaciones' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header Banner - Clean Light Friendly */}
          <div className="bg-gradient-to-r from-rose-50/90 via-orange-50/40 to-white dark:from-slate-900 dark:via-rose-950/30 dark:to-slate-900 rounded-2xl p-4 sm:p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Centro de Anulación y Reversión de Facturas
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Supabase RPC
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Las anulaciones requieren autenticación de Administrador, reversión atómica y reintegro inmediato de stock a inventario.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Autorización Protegida</span>
              </span>
            </div>
          </div>

          {/* 4 Micro KPI Cards for Anulaciones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Activas */}
            <div
              onClick={() => setAnulacionSubFilter('activas')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                anulacionSubFilter === 'activas'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-[#070b14] border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Facturas Emitidas</span>
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {activeSales.length}
              </h4>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block truncate">
                Disponibles para anular
              </span>
            </div>

            {/* Anuladas */}
            <div
              onClick={() => setAnulacionSubFilter('anuladas')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                anulacionSubFilter === 'anuladas'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm'
                  : 'bg-white dark:bg-[#070b14] border-slate-200/80 dark:border-slate-800 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Facturas Anuladas</span>
                <Ban className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {cancelledSales.length}
              </h4>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block truncate">
                Procesadas con éxito
              </span>
            </div>

            {/* Monto Total Anulado */}
            <div className="p-3.5 rounded-2xl border bg-white dark:bg-[#070b14] border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Monto Total Anulado</span>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                C$ {totalCancelledAmount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 block truncate">
                Flujo revertido
              </span>
            </div>

            {/* Stock Reintegrado */}
            <div className="p-3.5 rounded-2xl border bg-white dark:bg-[#070b14] border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Stock Reintegrado</span>
                <Undo2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {totalReturnedUnits} unds
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                Devueltas al inventario
              </span>
            </div>
          </div>

          {/* Main Anulaciones Card */}
          <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Sub-Filter Pills */}
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAnulacionSubFilter('activas')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    anulacionSubFilter === 'activas'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Facturas Emitidas ({activeSales.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnulacionSubFilter('anuladas')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    anulacionSubFilter === 'anuladas'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Historial de Anuladas ({cancelledSales.length})</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    anulacionSubFilter === 'activas'
                      ? 'Buscar factura para anular por número, cliente...'
                      : 'Buscar en historial de anuladas...'
                  }
                  value={anulacionSearch}
                  onChange={(e) => setAnulacionSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
                {anulacionSearch && (
                  <button
                    type="button"
                    onClick={() => setAnulacionSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 sm:px-6">Nº Factura</th>
                    <th className="py-3 px-4">Fecha Emisión</th>
                    <th className="py-3 px-4">Cliente</th>
                    {anulacionSubFilter === 'anuladas' ? (
                      <>
                        <th className="py-3 px-4">Fecha Anulación</th>
                        <th className="py-3 px-4">Motivo de Anulación</th>
                        <th className="py-3 px-4">Autorizado Por</th>
                        <th className="py-3 px-4">Estado Stock</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4">Método</th>
                        <th className="py-3 px-4">Cajero / Emisor</th>
                      </>
                    )}
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredAnulacionSales.length > 0 ? (
                    filteredAnulacionSales.map((sale) => {
                      const isCancelled = sale.status === 'cancelled';
                      const clientName = sale.customer?.name || (sale as any).customer_name || 'Consumidor Final';

                      return (
                        <tr
                          key={sale.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isCancelled ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                          }`}
                        >
                          {/* Nº FACTURA */}
                          <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <span className="font-semibold">{sale.ticket_number || `#FACT-${sale.id}`}</span>
                            {isCancelled && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 uppercase">
                                Anulada
                              </span>
                            )}
                          </td>

                          {/* FECHA */}
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatDateTime(sale.created_at)}
                          </td>

                          {/* CLIENTE */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <span className="capitalize">{clientName}</span>
                          </td>

                          {anulacionSubFilter === 'anuladas' ? (
                            <>
                              {/* FECHA ANULACIÓN */}
                              <td className="py-3.5 px-4 text-xs text-rose-600 dark:text-rose-400 font-mono whitespace-nowrap">
                                {sale.cancelled_at ? formatDateTime(sale.cancelled_at) : 'Reciente'}
                              </td>

                              {/* MOTIVO */}
                              <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-700 dark:text-slate-300 italic" title={sale.cancellation_reason || 'Sin motivo registrado'}>
                                {sale.cancellation_reason || 'Sin motivo especificado'}
                              </td>

                              {/* AUTORIZADO POR */}
                              <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                                  <Lock className="w-3 h-3 text-rose-500" />
                                  {sale.cancelled_by || 'Administrador'}
                                </span>
                              </td>

                              {/* ESTADO STOCK */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 uppercase">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Reintegrado
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* MÉTODO */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {renderPaymentBadge(sale.payment_method)}
                              </td>

                              {/* CAJERO */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="text-slate-700 dark:text-slate-200 font-medium">
                                  {sale.user_name || 'Usuario'}
                                </span>
                              </td>
                            </>
                          )}

                          {/* TOTAL */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap text-sm">
                            C$ {(sale.total_cordobas || 0).toLocaleString('es-NI', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>

                          {/* ACCIONES */}
                          <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {/* View detail button */}
                              <button
                                type="button"
                                onClick={() => handleViewDetail(sale)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center justify-center cursor-pointer shadow-2xs"
                                title="Ver detalle de factura"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Action to Annull if not cancelled */}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSaleToAnulate(sale);
                                    setShowSupabaseAnulacionModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-rose-600/20 cursor-pointer"
                                  title="Anular factura con autorización Supabase"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Anular</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={anulacionSubFilter === 'anuladas' ? 8 : 7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Ban className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {anulacionSubFilter === 'anuladas'
                              ? 'No hay facturas anuladas registradas'
                              : 'No se encontraron facturas para anular'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAnulacionSales.length}</span> facturas
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {anulacionSubFilter === 'anuladas' ? 'Total Anulado: ' : 'Total Emitido: '}
                  <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">
                    C$ {filteredAnulacionSales.reduce((sum, s) => sum + (s.total_cordobas || 0), 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: DETALLE COMPLETO DE FACTURA (PORTAL DIRECTO A BODY PARA EVITAR CORTES DE VISUALIZACIÓN) */}
      {showDetailModal && selectedSale && createPortal((() => {
        const isCancelled = selectedSale.status === 'cancelled';
        const role = getUserRole(selectedSale);
        const itemsCount = selectedSale.items?.length || 1;

        return (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDetailModal(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
              
              {/* 1. Encabezado Fijo Superior */}
              <div className="shrink-0 flex items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/70 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Factura {selectedSale.ticket_number ? (selectedSale.ticket_number.startsWith('#') ? selectedSale.ticket_number : '#' + selectedSale.ticket_number) : `#FACT-${selectedSale.id}`}
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
                      {renderPaymentBadge(selectedSale.payment_method)}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                      {formatDateTime(selectedSale.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Cuerpo Scrollable Independiente */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3.5 my-2 [scrollbar-width:thin]">
                {/* Info Grid (Cliente y Emisor / Cajero) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card Cliente */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      CLIENTE
                    </span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {selectedSale.customer?.name || (selectedSale as any).customer_name || 'Consumidor Final'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Tel: {selectedSale.customer?.phone || (selectedSale as any).customer_phone || '50588888888'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Dir: {selectedSale.customer?.address || (selectedSale as any).customer_address || 'Venta de Mostrador'}
                    </p>
                  </div>

                  {/* Card Emisor / Cajero */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      EMISOR / CAJERO
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {selectedSale.user_name || 'Jairo Cajina (Admin)'}
                      </p>
                      {role === 'admin' && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#7e22ce] dark:bg-purple-950/60 dark:text-purple-300">
                          ADMIN
                        </span>
                      )}
                      {role === 'cajero' && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          CAJERO
                        </span>
                      )}
                      {role === 'vendedor' && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          VENDEDOR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Método: <span className="text-slate-600 dark:text-slate-300 font-medium">{formatPaymentMethod(selectedSale.payment_method || 'Efectivo')}</span>
                    </p>
                    {(selectedSale as any).credit_term_days && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                        Plazo Crédito: {(selectedSale as any).credit_term_days} días
                      </p>
                    )}
                  </div>
                </div>

                {/* Banner Contextual de Método de Pago (Créditos / Transferencias / Tarjeta) */}
                {(() => {
                  const mLower = (selectedSale.payment_method || '').toLowerCase().trim();
                  const isCredit = mLower === 'credito' || mLower === 'crédito' || mLower === 'credit';
                  const isTransfer = mLower === 'transferencia' || mLower === 'transfer';
                  const isCard = mLower === 'tarjeta' || mLower === 'card';
                  const linkedCredit = credits.find(
                    c => (selectedSale.ticket_number && c.ticket_number === selectedSale.ticket_number) ||
                         (selectedSale.id && c.sale_id === selectedSale.id)
                  );

                  if (isCredit) {
                    const days = linkedCredit?.dias_plazo || (selectedSale as any).credit_term_days || 30;
                    const remaining = linkedCredit ? (linkedCredit.remaining_debt ?? linkedCredit.total_debt ?? 0) : 0;
                    const isFullyPaid = linkedCredit ? remaining <= 0.01 : false;

                    return (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                                Venta Registrada al Crédito
                              </p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isFullyPaid 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                              }`}>
                                {isFullyPaid ? 'Crédito Saldado' : 'Pendiente de Pago'}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                              Plazo acordado: <strong className="font-bold">{days} días</strong>
                              {linkedCredit?.due_date && ` • Fecha límite: ${new Date(linkedCredit.due_date).toLocaleDateString('es-NI')}`}
                            </p>
                          </div>
                        </div>

                        {linkedCredit && (
                          <div className="sm:text-right shrink-0 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">
                              Saldo Pendiente
                            </span>
                            <span className={`font-mono font-black text-sm ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              C$ {remaining.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (isTransfer) {
                    return (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <ArrowUpDown className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-blue-950 dark:text-blue-200 text-xs sm:text-sm">
                                Pago por Transferencia Bancaria
                              </p>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                                Transf. Verificada
                              </span>
                            </div>
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                              Operación bancaria electrónica registrada y conciliada
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isCard) {
                    return (
                      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm">
                                Pago con Tarjeta Débito / Crédito
                              </p>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                                POS Aprobado
                              </span>
                            </div>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                              Transacción electrónica procesada mediante terminal de venta
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Sección de Detalle de Productos */}
                <div className="space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    DETALLE DE PRODUCTOS ({itemsCount} {itemsCount === 1 ? 'ÍTEM' : 'ÍTEMS'})
                  </span>

                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="max-h-[180px] sm:max-h-[220px] overflow-y-auto [scrollbar-width:thin]">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-10 bg-[#f8fafc] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 text-left w-12 font-bold">Cant</th>
                            <th className="py-2.5 px-3 text-left font-bold">Descripción</th>
                            <th className="py-2.5 px-3 text-right font-bold">P. Unitario</th>
                            <th className="py-2.5 px-3 text-center font-bold">Descuento</th>
                            <th className="py-2.5 px-3 text-right font-bold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                          {selectedSale.items && selectedSale.items.length > 0 ? (
                            selectedSale.items.map((it, idx) => (
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
                                <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200 text-xs align-middle">
                                  C${(it.unit_price_cordobas || 0).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-center text-xs align-middle font-bold text-emerald-500">
                                  -
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white text-xs align-middle">
                                  C${(it.total_cordobas || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition">
                              <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white text-xs align-middle">1</td>
                              <td className="py-2.5 px-3 align-middle">
                                <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">Consumo de Artículos</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">General</p>
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200 text-xs align-middle">C${(selectedSale.total_cordobas || 0).toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-center text-xs align-middle font-bold text-emerald-500">-</td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white text-xs align-middle">C${(selectedSale.total_cordobas || 0).toFixed(2)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Desglose de Totales */}
                  <div className="flex justify-end pt-2 pr-1">
                    <div className="w-56 sm:w-64 space-y-1 text-right text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Subtotal Bruto:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          C${(selectedSale.subtotal_cordobas || selectedSale.total_cordobas || 0).toFixed(2)}
                        </span>
                      </div>

                      {selectedSale.discount_amount && selectedSale.discount_amount > 0 ? (
                        <div className="flex justify-between text-rose-500">
                          <span>Descuento:</span>
                          <span className="font-bold">-C${selectedSale.discount_amount.toFixed(2)}</span>
                        </div>
                      ) : null}

                      <div className="pt-1.5 flex justify-between items-baseline">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          TOTAL:
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#2563eb] tracking-tight">
                          C${(selectedSale.total_cordobas || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Footer Fijo (Siempre Visible, Nunca Cortado) */}
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 pt-4 sm:pt-5 border-t border-slate-100/90 dark:border-slate-800">
                {/* Left: Anular Factura Button */}
                <div>
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => {
                        setSaleToAnulate(selectedSale);
                        setShowSupabaseAnulacionModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 transition cursor-pointer shadow-xs"
                      title="Anular factura mediante autorización Supabase"
                    >
                      <Lock className="w-4 h-4 text-rose-500" />
                      <span>Anular Factura (Supabase)</span>
                    </button>
                  )}
                </div>

                {/* Right: WhatsApp, Imprimir Ticket, Cerrar Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(selectedSale)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDirectPrint(selectedSale);
                    }}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
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

      {/* 5. MODAL: IMPRESIÓN DIRECTA DE COMPROBANTE / FACTURA (REDiseñado con Formato POS y Vista Previa en Vivo) */}
      {showPrintModal && printSale && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-hidden">
          <div className="w-full max-w-5xl h-[92vh] max-h-[850px] min-h-[560px] bg-white dark:bg-[#0b1329] rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* LEFT COLUMN: CONTROLS & METADATA */}
            <div className="w-full md:w-[380px] lg:w-[410px] shrink-0 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto modal-scroll bg-white dark:bg-[#0b1329] border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
                
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-center shrink-0 shadow-xs">
                      <Printer className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Ticket de Impresión
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Factura de Venta POS
                      </p>
                    </div>
                  </div>

                  {/* Metadata Card */}
                  <div className="bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">Documento:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {printSale.ticket_number || `#FACT-${printSale.id}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">Cliente:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {printSale.customer?.name || (printSale as any).customer_name || 'Consumidor Final'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">Tipo:</span>
                      {(() => {
                        const m = (printSale.payment_method || '').toLowerCase();
                        if (m.includes('cred')) {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              A CRÉDITO
                            </span>
                          );
                        }
                        if (m.includes('tarj')) {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                              TARJETA
                            </span>
                          );
                        }
                        if (m.includes('transf')) {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                              TRANSFERENCIA
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                            CONTADO
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400 font-semibold">Total a Imprimir:</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        C$ {(printSale.total_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Formato de Impresión Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black tracking-wider text-slate-500 uppercase block">
                      FORMATO DE IMPRESIÓN
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      
                      {/* Option 80 mm */}
                      <button
                        type="button"
                        onClick={() => setPaperFormat('80mm')}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                          paperFormat === '80mm'
                            ? 'border-2 border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/30 shadow-xs'
                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            80 mm
                          </span>
                          {paperFormat === '80mm' ? (
                            <div className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1">Caja / POS</p>
                      </button>

                      {/* Option 58 mm */}
                      <button
                        type="button"
                        onClick={() => setPaperFormat('58mm')}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                          paperFormat === '58mm'
                            ? 'border-2 border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/30 shadow-xs'
                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            58 mm
                          </span>
                          {paperFormat === '58mm' ? (
                            <div className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1">Bluetooth</p>
                      </button>

                      {/* Option Carta / A4 */}
                      <button
                        type="button"
                        onClick={() => setPaperFormat('letter')}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                          paperFormat === 'letter'
                            ? 'border-2 border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/30 shadow-xs'
                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            Carta (A4)
                          </span>
                          {paperFormat === 'letter' ? (
                            <div className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1">Oficina / PDF</p>
                      </button>

                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="no-print space-y-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>
                      {paperFormat === 'letter' ? 'Imprimir Factura Carta (A4)' : `Imprimir Ticket POS (${paperFormat})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar por WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    Cerrar Vista
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: LIVE TICKET / INVOICE PREVIEW */}
              <div className="flex-1 h-full flex flex-col bg-slate-50/80 dark:bg-slate-900/40 overflow-hidden">
                
                {/* Header info (PINNED AT TOP) */}
                <div className="no-print px-5 sm:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs shrink-0 z-10">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold">
                      Vista Previa en Vivo ({paperFormat === 'letter' ? 'Formato Carta / A4' : `Ancho ${paperFormat}`})
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {paperFormat === 'letter' ? 'Carta / A4' : paperFormat === '80mm' ? '80 x 297 mm' : '58 x 210 mm'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Cerrar ventana"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Viewport */}
                <div className="flex-1 overflow-y-auto modal-scroll p-4 sm:p-6 lg:p-7 flex justify-center items-start">
                  <div className="flex justify-center w-full">
                  {paperFormat === 'letter' ? (
                    /* FORMAL LETTER / A4 INVOICE SHEET */
                    <div
                      id="printable-ticket"
                      className="bg-white text-slate-900 p-8 sm:p-9 shadow-lg border border-slate-200/90 rounded-2xl font-sans text-xs space-y-5 w-full max-w-[620px] paper-letter leading-normal transition-all"
                    >
                      {/* Header: Empresa & Recuadro Factura */}
                      <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200">
                        <div className="space-y-1">
                          {company?.logo ? (
                            <img src={company.logo} alt="Logo" className="h-12 w-auto object-contain mb-2" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base mb-1">
                              {company?.name ? company.name.substring(0, 2).toUpperCase() : 'SF'}
                            </div>
                          )}
                          <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
                            {company?.name || 'AGENCIA DE BEBIDAS SENDADIST'}
                          </h2>
                          {company?.razon_social && (
                            <p className="text-[11px] font-semibold text-slate-600">
                              {company.razon_social}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-600">
                            <span className="font-bold">RUC:</span> {company?.ruc || 'J0310000349281'}
                          </p>
                          <p className="text-[11px] text-slate-600 max-w-xs leading-tight">
                            {company?.address || 'Semáforos El Mayoreo 2c al Norte, Managua'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            <span className="font-bold">Tel:</span> {company?.phone || 'PBX: +505 2244-8899 • Cel: +505 8888-1234'}
                            {company?.email && <span className="ml-2">• {company.email}</span>}
                          </p>
                        </div>

                        {/* Recuadro Factura */}
                        <div className="w-56 p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50/70 text-center space-y-1.5 shrink-0">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            RUC: {company?.ruc || 'J0310000349281'}
                          </p>
                          <div className="bg-slate-900 text-white py-1 px-2 rounded-lg font-black text-xs uppercase tracking-wider">
                            FACTURA DE VENTA
                          </div>
                          <p className="text-sm font-black text-slate-900 tracking-tight pt-0.5">
                            {printSale.ticket_number || `#FACT-${printSale.id}`}
                          </p>
                          <div className="pt-1 flex items-center justify-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              ((printSale.payment_method || '').toLowerCase().includes('cred') || (printSale as any).credit_term_days)
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {printSale.payment_method?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Datos del Cliente y la Operación */}
                      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Señor(es) / Cliente:</span>
                          <span className="font-bold text-slate-900 text-xs">
                            {printSale.customer?.name || (printSale as any).customer_name || 'Consumidor Final'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Fecha de Emisión:</span>
                          <span className="font-semibold text-slate-800">
                            {formatDateTime(printSale.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Dirección / Ubicación:</span>
                          <span className="text-slate-700">
                            {printSale.customer?.address || 'Barrio Altagracia, del Pali 2c al lago, Managua'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Teléfono de Contacto:</span>
                          <span className="text-slate-700">
                            {printSale.customer?.phone || 'No registrado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Atendido por:</span>
                          <span className="text-slate-700 font-medium">
                            {printSale.user_name || 'Cajero'} ({getUserRole(printSale).toUpperCase()})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Condición de Pago:</span>
                          <span className="font-bold text-slate-800">
                            {((printSale.payment_method || '').toLowerCase().includes('cred') || (printSale as any).credit_term_days)
                              ? `Crédito ${(printSale as any).credit_term_days ? `(${(printSale as any).credit_term_days} días)` : ''}`
                              : 'Contado Inmediato'}
                          </span>
                        </div>
                      </div>

                      {/* Tabla de Productos */}
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-white font-bold uppercase text-[9.5px] tracking-wider">
                            <tr>
                              <th className="py-2 px-3 w-14 text-center">Cant.</th>
                              <th className="py-2 px-3">Descripción / Producto</th>
                              <th className="py-2 px-3 w-28 text-right">P. Unitario</th>
                              <th className="py-2 px-3 w-28 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {printSale.items && printSale.items.length > 0 ? (
                              printSale.items.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <td className="py-2 px-3 text-center font-bold text-slate-800">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2 px-3 font-medium text-slate-900">
                                    {item.product_name}
                                  </td>
                                  <td className="py-2 px-3 text-right text-slate-700">
                                    C$ {item.unit_price_cordobas.toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                                    C$ {item.total_cordobas.toFixed(2)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="py-2 px-3 text-center font-bold">1</td>
                                <td className="py-2 px-3">Venta General de Productos</td>
                                <td className="py-2 px-3 text-right">C$ {(printSale.total_cordobas || 0).toFixed(2)}</td>
                                <td className="py-2 px-3 text-right font-bold">C$ {(printSale.total_cordobas || 0).toFixed(2)}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Bloque Inferior: Crédito/Notas a la izquierda, Totales a la derecha */}
                      <div className="grid grid-cols-12 gap-6 pt-1 items-start">
                        
                        {/* Izquierda: Términos / Crédito / Firmas */}
                        <div className="col-span-7 space-y-3.5">
                          {/* Saldo Crédito si aplica */}
                          {((printSale.payment_method || '').toLowerCase().includes('cred') || (printSale as any).credit_term_days) && (
                            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] space-y-1">
                              <span className="font-black text-amber-900 text-[10px] uppercase tracking-wider block">
                                Estado de Cuenta del Cliente
                              </span>
                              <div className="flex justify-between text-slate-700">
                                <span>Saldo Anterior:</span>
                                <span className="font-semibold">
                                  C$ {((printSale.customer?.current_debt || 0) + (printSale.total_cordobas || 0)).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-700">
                                <span>Monto de esta Factura:</span>
                                <span className="font-semibold">C$ {(printSale.total_cordobas || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-amber-950 pt-1 border-t border-amber-200">
                                <span>Nuevo Saldo Cartera:</span>
                                <span>C$ {(printSale.customer?.current_debt || printSale.total_cordobas || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-0.5 text-slate-600 text-[10.5px]">
                            <p className="font-bold uppercase text-slate-800">
                              {company?.ticket_footer || '¡Gracias por su compra y preferencia!'}
                            </p>
                            <p className="text-[9.5px] text-slate-500">
                              Revise su producto antes de firmar o retirar. Esta factura constituye un título valor mercantil.
                            </p>
                          </div>

                          {/* Firmas */}
                          <div className="grid grid-cols-2 gap-4 pt-6 text-center">
                            <div>
                              <div className="border-t border-slate-400 mx-2 pt-1 font-semibold text-[10px] text-slate-700">
                                Entregado Conforme
                              </div>
                              <span className="text-[9px] text-slate-400">Emisor / Vendedor</span>
                            </div>
                            <div>
                              <div className="border-t border-slate-400 mx-2 pt-1 font-semibold text-[10px] text-slate-700">
                                Recibido Conforme
                              </div>
                              <span className="text-[9px] text-slate-400">Cliente / Receptor</span>
                            </div>
                          </div>
                        </div>

                        {/* Derecha: Resumen de Totales */}
                        <div className="col-span-5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-right text-[11px]">
                          {printSale.subtotal_cordobas !== undefined && (
                            <div className="flex justify-between text-slate-600">
                              <span>Subtotal:</span>
                              <span className="font-semibold">C$ {printSale.subtotal_cordobas.toFixed(2)}</span>
                            </div>
                          )}
                          {printSale.discount_amount ? (
                            <div className="flex justify-between text-rose-600 font-semibold">
                              <span>Descuento:</span>
                              <span>-C$ {printSale.discount_amount.toFixed(2)}</span>
                            </div>
                          ) : null}
                          {printSale.tax_amount ? (
                            <div className="flex justify-between text-slate-600">
                              <span>IVA ({printSale.tax_rate || 15}%):</span>
                              <span className="font-semibold">+C$ {printSale.tax_amount.toFixed(2)}</span>
                            </div>
                          ) : null}
                          <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline font-black text-sm text-slate-900">
                            <span className="tracking-wide">TOTAL:</span>
                            <span className="text-base text-cyan-700">
                              C$ {(printSale.total_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {printSale.total_usd ? (
                            <div className="flex justify-between text-slate-500 font-semibold text-[10px] pt-1">
                              <span>Equivalente en USD:</span>
                              <span>$ {printSale.total_usd.toFixed(2)} USD</span>
                            </div>
                          ) : null}
                        </div>

                      </div>

                      {/* Pie de Página / Código */}
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                        <span>Sistema SendaFact • Facturación Electrónica y POS</span>
                        <span className="font-mono">{printSale.ticket_number || `#FACT-${printSale.id}`}</span>
                      </div>

                    </div>
                  ) : (
                    /* THERMAL TICKET (80mm / 58mm) */
                    <div
                      id="printable-ticket"
                      className={`bg-white text-slate-900 p-6 sm:p-7 shadow-lg border border-slate-200/90 font-mono text-[11px] leading-tight space-y-3 transition-all duration-200 ${
                        paperFormat === '58mm' ? 'w-[275px] max-w-[275px] paper-58mm' : 'w-[360px] max-w-[360px] paper-80mm'
                      }`}
                    >
                      {/* Emisor / Comercio */}
                      <div className="text-center space-y-0.5">
                        <h2 className="text-xs font-black uppercase tracking-tight text-slate-900">
                          {company?.name || 'AGENCIA DE BEBIDAS SENDADIST'}
                        </h2>
                        <p className="text-[10px] text-slate-600 font-semibold">
                          RUC: {company?.ruc || 'J0310000349281'}
                        </p>
                        <p className="text-[9.5px] text-slate-600 leading-tight">
                          {company?.address || 'Semáforos El Mayoreo 2c al Norte, Managua'}
                        </p>
                        <p className="text-[9.5px] text-slate-600">
                          {company?.phone ? `PBX: ${company.phone}` : 'PBX: +505 2244-8899 • Cel: +505 8888-1234'}
                        </p>
                      </div>

                      <div className="border-b border-dashed border-slate-300 my-2"></div>

                      {/* Metadata Ticket */}
                      <div className="space-y-1 text-[10.5px]">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>FAC: {printSale.ticket_number || `#FACT-${printSale.id}`}</span>
                          <span className="px-1.5 py-0.2 rounded border border-slate-400 text-[9px] font-bold uppercase">
                            {printSale.payment_method?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Fecha: {formatDateTime(printSale.created_at)}
                        </div>
                        <div className="text-slate-600">
                          Cajero: {printSale.user_name || 'Cajero'} ({getUserRole(printSale).toUpperCase()})
                        </div>
                      </div>

                      <div className="border-b border-dashed border-slate-300 my-2"></div>

                      {/* Cliente */}
                      <div className="space-y-0.5 text-[10.5px]">
                        <div className="font-bold text-slate-900">
                          Cliente: {printSale.customer?.name || (printSale as any).customer_name || 'Consumidor Final'}
                        </div>
                        <div className="text-slate-600 text-[9.5px]">
                          {printSale.customer?.address || 'Barrio Altagracia, del Pali 2c al lago, Managua'}
                        </div>
                      </div>

                      <div className="border-b border-dashed border-slate-300 my-2"></div>

                      {/* Tabla de Artículos */}
                      <div>
                        <div className="flex justify-between font-bold text-[10px] text-slate-700 pb-1">
                          <span>Cant Descripción</span>
                          <span>Total</span>
                        </div>
                        <div className="space-y-1.5 pt-0.5 text-[10.5px]">
                          {printSale.items && printSale.items.length > 0 ? (
                            printSale.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex gap-1.5">
                                    <span className="font-bold">{item.quantity}x</span>
                                    <span className="truncate">{item.product_name}</span>
                                  </div>
                                  <span className="text-[9.5px] text-slate-500 pl-4 block">
                                    P.U: C${item.unit_price_cordobas.toFixed(2)}
                                  </span>
                                </div>
                                <span className="font-bold whitespace-nowrap">
                                  C${item.total_cordobas.toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-between items-center">
                              <span>1x Venta de Productos</span>
                              <span className="font-bold">C${(printSale.total_cordobas || 0).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-b border-dashed border-slate-300 my-2"></div>

                      {/* Totales */}
                      <div className="space-y-1 text-right text-[10.5px]">
                        {printSale.subtotal_cordobas !== undefined && (
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold">C$ {printSale.subtotal_cordobas.toFixed(2)}</span>
                          </div>
                        )}
                        {printSale.discount_amount ? (
                          <div className="flex justify-between text-rose-600 font-semibold">
                            <span>Descuento:</span>
                            <span>-C$ {printSale.discount_amount.toFixed(2)}</span>
                          </div>
                        ) : null}
                        {printSale.tax_amount ? (
                          <div className="flex justify-between text-slate-600">
                            <span>IVA ({printSale.tax_rate || 15}%):</span>
                            <span className="font-semibold">+C$ {printSale.tax_amount.toFixed(2)}</span>
                          </div>
                        ) : null}
                        <div className="border-t-2 border-slate-900 my-1 pt-1.5 flex justify-between items-baseline font-black text-sm text-slate-900">
                          <span className="tracking-wide">TOTAL:</span>
                          <span>
                            C$ {(printSale.total_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Crédito: Saldo Anterior y Nuevo Saldo */}
                      {((printSale.payment_method || '').toLowerCase().includes('cred') || (printSale as any).credit_term_days) && (
                        <div className="border border-dashed border-slate-300 rounded p-2 my-1.5 space-y-1 text-[10px]">
                          <div className="flex justify-between text-slate-600">
                            <span>Saldo Anterior:</span>
                            <span className="font-semibold">
                              C${((printSale.customer?.current_debt || 0) + (printSale.total_cordobas || 0)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Nuevo Saldo Cartera:</span>
                            <span>
                              C${(printSale.customer?.current_debt || printSale.total_cordobas || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="border-b border-dashed border-slate-300 my-2"></div>

                      {/* Mensaje de Pie */}
                      <div className="text-center space-y-0.5 text-[9.5px] text-slate-600">
                        <p className="font-bold uppercase tracking-wider text-slate-800">
                          {company?.ticket_footer || '¡GRACIAS POR SU PREFERENCIA!'}
                        </p>
                        <p className="text-[9px]">Revise su producto antes de firmar o retirar.</p>
                      </div>

                      {/* Código de Barras Simulado */}
                      <div className="pt-2 text-center space-y-0.5 select-none">
                        <div className="font-mono text-xs tracking-[0.25em] text-slate-700">
                          ||| | |||| ||| | || | ||| |||| |
                        </div>
                        <p className="text-[8.5px] text-slate-500 font-mono tracking-wider">
                          {printSale.ticket_number || `#FACT-${printSale.id}`}
                        </p>
                      </div>

                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* 6. MODAL: ANULAR FACTURA CLÁSICO */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="¿Anular Factura?"
        message={`¿Está seguro de que desea anular la factura ${saleToCancel?.ticket_number || ''}? Esta acción cambiará el estado de la venta a anulada.`}
        confirmText="Sí, Anular Factura"
        cancelText="Volver"
        type="danger"
        iconShape="circle"
      />

      {/* 7. MODAL: AUTORIZACIÓN Y ANULACIÓN SUPABASE (RPC / STOCK REINTEGRADO) */}
      <ModalAnulacionSupabase
        facturaId={saleToAnulate?.id || ''}
        sale={saleToAnulate}
        isOpen={showSupabaseAnulacionModal}
        onClose={() => {
          setShowSupabaseAnulacionModal(false);
          setSaleToAnulate(null);
        }}
        onSuccess={() => {
          loadData();
          setAnulacionSubFilter('anuladas');
          success(
            'Factura Anulada Exitosamente',
            'La factura ha sido anulada con autorización Supabase y los productos fueron reintegrados al inventario.'
          );
          if (selectedSale && saleToAnulate && selectedSale.id === saleToAnulate.id) {
            setSelectedSale(prev => prev ? { ...prev, status: 'cancelled' } : null);
          }
        }}
      />
    </div>
  );
};

export default InvoicesPage;
