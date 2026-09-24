import React, { useState, useEffect, useMemo } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Sale, CompanySetting, User } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export const InvoicesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
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

  // Void/Cancel sale modal
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { success, warning, info } = useToast();

  const loadData = () => {
    const loadedSales = storage.getSales();
    setSales(loadedSales);
    setUsers(storage.getUsers());
    setCompany(storage.getCompanySettings());
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
        if (s.payment_method !== paymentFilter) return false;
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

  const formatPaymentMethod = (method: string) => {
    if (method === 'Efectivo') return 'Efectivo (CONTADO)';
    if (method === 'Crédito' || method === 'credito') return 'Crédito (Abonos)';
    if (method === 'Transferencia' || method === 'transferencia') return 'Transferencia Bancaria';
    if (method === 'Tarjeta' || method === 'tarjeta') return 'Tarjeta Débito/Crédito';
    return method;
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

      {/* 2. MAIN CARD: HISTORIAL DE FACTURAS (EXACTLY MATCHING THE USER SCREENSHOT) */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
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

      {/* 4. MODAL: DETALLE COMPLETO DE FACTURA */}
      {showDetailModal && selectedSale && (() => {
        const isCancelled = selectedSale.status === 'cancelled';
        const role = getUserRole(selectedSale);
        const itemsCount = selectedSale.items?.length || 1;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1526] border border-slate-100 dark:border-[#1E293B] rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-xs transition-colors my-auto max-h-[95vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100/50 dark:border-blue-900/30 shadow-sm">
                    <FileText className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        Factura {selectedSale.ticket_number || `#FACT-${selectedSale.id}`}
                      </h3>
                      {isCancelled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 tracking-wider">
                          ANULADA
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 tracking-wider">
                          COMPLETADA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
                      {formatDateTime(selectedSale.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Two Info Cards Grid (CLIENTE & EMISOR / CAJERO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CLIENTE Card */}
                <div className="bg-slate-50/70 dark:bg-[#0A0F1D] border border-slate-100 dark:border-[#182338] rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase block mb-1">
                    CLIENTE
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedSale.customer?.name || (selectedSale as any).customer_name || 'Consumidor Final'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tel: {selectedSale.customer?.phone || (selectedSale as any).customer_phone || '50588888888'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dir: {selectedSale.customer?.address || (selectedSale as any).customer_address || 'Venta de Mostrador'}
                  </p>
                </div>

                {/* EMISOR / CAJERO Card */}
                <div className="bg-slate-50/70 dark:bg-[#0A0F1D] border border-slate-100 dark:border-[#182338] rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase block mb-1">
                    EMISOR / CAJERO
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedSale.user_name || 'Jairo Cajina (Admin)'}
                    </h4>
                    {role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                        ADMIN
                      </span>
                    )}
                    {role === 'cajero' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                        CAJERO
                      </span>
                    )}
                    {role === 'vendedor' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                        VENDEDOR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Método: <span className="font-medium text-slate-700 dark:text-slate-300">{formatPaymentMethod(selectedSale.payment_method || 'Efectivo')}</span>
                  </p>
                </div>
              </div>

              {/* DETALLE DE PRODUCTOS Section */}
              <div className="pt-1">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  DETALLE DE PRODUCTOS ({itemsCount} {itemsCount === 1 ? 'ÍTEM' : 'ÍTEMS'})
                </h4>

                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-[#0A0F1D] text-slate-500 dark:text-slate-400 font-bold text-[11px] border-b border-slate-100 dark:border-[#182338]">
                        <th className="py-2.5 px-4 text-left font-bold w-16">Cant</th>
                        <th className="py-2.5 px-4 text-left font-bold">Descripción</th>
                        <th className="py-2.5 px-4 text-center font-bold">P. Unitario</th>
                        <th className="py-2.5 px-4 text-center font-bold">Descuento</th>
                        <th className="py-2.5 px-4 text-right font-bold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#182338]">
                      {selectedSale.items && selectedSale.items.length > 0 ? (
                        selectedSale.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#111A2D]">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {it.quantity}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {it.product_name}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                                {(it as any).category || (it as any).brand || 'General'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                              C${it.unit_price_cordobas.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                              -
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                              C${it.total_cordobas.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">1</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">Gaseosa Pepsi Cola 3 Litros</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Pepsi • Gaseosas</div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">C$68.00</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-medium">-</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">C$68.00</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Total Section */}
                <div className="mt-4 pt-3 flex flex-col items-end pr-2 space-y-1.5 border-t border-slate-100 dark:border-[#182338]">
                  <div className="flex items-center justify-end gap-10 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Subtotal Bruto:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      C${(selectedSale.subtotal_cordobas || selectedSale.total_cordobas || 0).toFixed(2)}
                    </span>
                  </div>

                  {selectedSale.discount_amount && selectedSale.discount_amount > 0 ? (
                    <div className="flex items-center justify-end gap-10 text-xs text-rose-500">
                      <span className="font-medium">Descuento:</span>
                      <span className="font-mono font-bold">-C${selectedSale.discount_amount.toFixed(2)}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-10 pt-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      TOTAL:
                    </span>
                    <span className="text-2xl font-black font-mono text-[#0284c7] dark:text-[#38bdf8]">
                      C${(selectedSale.total_cordobas || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-[#182338]">
                {/* Left: Anular Factura Button */}
                <div>
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => {
                        setSaleToCancel(selectedSale);
                        setShowCancelModal(true);
                      }}
                      className="border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full px-4.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Anular Factura</span>
                    </button>
                  )}
                </div>

                {/* Right: WhatsApp, Imprimir Ticket, Cerrar Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(selectedSale)}
                    className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full px-5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDirectPrint(selectedSale);
                    }}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Cerrar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. MODAL: IMPRESIÓN DIRECTA DE COMPROBANTE / FACTURA */}
      {showPrintModal && printSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-[#0b1329] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-auto">
            
            {/* Header */}
            <div className="no-print flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-500" /> Vista de Impresión
              </span>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div
              id="printable-ticket"
              className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs shadow-inner space-y-3"
            >
              <div className="text-center space-y-1 pb-2">
                {company?.logo ? (
                  <div className="flex justify-center mb-1">
                    <img
                      src={company.logo}
                      alt={company.name || 'Logo'}
                      className="max-h-14 max-w-[160px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-1">
                    <Building2 className="w-4 h-4" />
                  </div>
                )}
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {company?.name || 'SENDA SISTEMAS'}
                </h2>
                {company?.ruc && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">RUC: {company.ruc}</p>
                )}
                {company?.phone && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">Tel: {company.phone}</p>
                )}
                {company?.address && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{company.address}</p>
                )}
              </div>

              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>FACTURA:</span>
                  <span>{printSale.ticket_number || `#FACT-${printSale.id}`}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fecha:</span>
                  <span>{formatDateTime(printSale.created_at)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Atendido por:</span>
                  <span>{printSale.user_name || 'Cajero'} ({getUserRole(printSale).toUpperCase()})</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Cliente:</span>
                  <span className="font-semibold">{printSale.customer?.name || (printSale as any).customer_name || 'Consumidor Final'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Forma de Pago:</span>
                  <span className="uppercase font-semibold">{printSale.payment_method || 'Efectivo'}</span>
                </div>
                {printSale.status === 'cancelled' && (
                  <div className="flex justify-center text-rose-600 font-bold py-1 border border-rose-300 rounded uppercase">
                    *** FACTURA ANULADA ***
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 pb-1">
                  <span>Cant. / Detalle</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1 pt-1 text-[11px]">
                  {printSale.items && printSale.items.length > 0 ? (
                    printSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white leading-tight">
                            {item.quantity}x {item.product_name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            @ C$ {item.unit_price_cordobas.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          C$ {item.total_cordobas.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>1x Venta de Productos</span>
                      <span className="font-bold">C$ {(printSale.total_cordobas || 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t-2 border-slate-800 dark:border-slate-300 pt-2.5 space-y-1 text-right text-[11px]">
                {printSale.subtotal_cordobas !== undefined && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-bold">C$ {printSale.subtotal_cordobas.toFixed(2)}</span>
                  </div>
                )}
                {printSale.discount_amount ? (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Descuento:</span>
                    <span className="font-bold">-C$ {printSale.discount_amount.toFixed(2)}</span>
                  </div>
                ) : null}
                {printSale.tax_amount ? (
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>IVA:</span>
                    <span className="font-bold">+C$ {printSale.tax_amount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="pt-1.5 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-white">
                  <span className="uppercase text-xs tracking-wider">TOTAL:</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">
                    C$ {(printSale.total_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Equivalente en USD:</span>
                  <span className="font-bold text-emerald-600">
                    $ {(printSale.total_usd || 0).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center text-[10px] text-slate-500 space-y-0.5">
                <p className="font-bold uppercase tracking-wider">¡Gracias por su compra!</p>
                <p>Sistema SendaFact</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print space-y-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ahora</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL: ANULAR FACTURA */}
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
    </div>
  );
};

export default InvoicesPage;
