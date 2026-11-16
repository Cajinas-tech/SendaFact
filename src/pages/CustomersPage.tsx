import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, UserPlus, Search, Phone, Mail, 
  MapPin, Edit3, DollarSign, CheckCircle2, CreditCard,
  Download, History, X, Check, ArrowRight, ShieldAlert,
  Building2, UserCheck, Calendar
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Customer, CreditPayment } from '../types';
import { useToast } from '../components/UI/Toast';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'AL_DIA' | 'CON_SALDO'>('TODOS');
  
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [abonoCustomer, setAbonoCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  
  const { success, warning, error, info } = useToast();

  // Form State Cliente
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    document_number: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: '10000',
    dias_plazo: '15'
  });

  // Form State Abono
  const [formAbono, setFormAbono] = useState({
    amount: '',
    method: 'efectivo',
    receipt: '',
    notes: ''
  });

  const loadData = () => {
    const list = storage.getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Métricas de KPIs
  const totalClientes = customers.length;
  const clientesAlDia = useMemo(() => customers.filter(c => (c.current_debt || 0) <= 0.01).length, [customers]);
  const clientesConSaldo = useMemo(() => customers.filter(c => (c.current_debt || 0) > 0.01).length, [customers]);
  const totalPorCobrar = useMemo(() => customers.reduce((sum, c) => sum + (c.current_debt || 0), 0), [customers]);
  const limiteTotal = useMemo(() => customers.reduce((sum, c) => sum + (c.credit_limit || 0), 0), [customers]);

  // Filtrado de clientes
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Filtro de estado
      const deuda = c.current_debt || 0;
      if (filterStatus === 'AL_DIA' && deuda > 0.01) return false;
      if (filterStatus === 'CON_SALDO' && deuda <= 0.01) return false;

      // Filtro de texto
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const nameMatch = c.name?.toLowerCase().includes(term);
      const contactMatch = c.contact_name?.toLowerCase().includes(term);
      const docMatch = c.document_number?.toLowerCase().includes(term);
      const phoneMatch = c.phone?.toLowerCase().includes(term);
      const addressMatch = c.address?.toLowerCase().includes(term);

      return nameMatch || contactMatch || docMatch || phoneMatch || addressMatch;
    });
  }, [customers, filterStatus, searchTerm]);

  // Abrir Modal Nuevo
  const openNewModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      contact_name: '',
      document_number: `#LI-00${customers.length + 1}`,
      phone: '+505',
      email: '',
      address: '',
      credit_limit: '10000',
      dias_plazo: '15'
    });
    setShowModal(true);
  };

  // Abrir Modal Editar
  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      contact_name: c.contact_name || '',
      document_number: c.document_number || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      credit_limit: (c.credit_limit ?? 10000).toString(),
      dias_plazo: (c.dias_plazo ?? 15).toString()
    });
    setShowModal(true);
  };

  // Guardar Cliente (Crear / Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Campo Requerido', 'Por favor ingresa el nombre del cliente o negocio.');
      return;
    }

    const newCustomer: Customer = {
      id: editingCustomer ? editingCustomer.id : Date.now(),
      name: formData.name.trim(),
      contact_name: formData.contact_name.trim() || formData.name.trim(),
      document_number: formData.document_number.trim() || `#LI-00${customers.length + 1}`,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim() || 'Managua, Nicaragua',
      credit_limit: parseFloat(formData.credit_limit) || 0,
      dias_plazo: parseInt(formData.dias_plazo) || 15,
      current_debt: editingCustomer ? (editingCustomer.current_debt || 0) : 0,
      sales_count: editingCustomer ? (editingCustomer.sales_count || 0) : 0,
      credits_count: editingCustomer ? (editingCustomer.credits_count || 0) : 0,
      created_at: editingCustomer ? editingCustomer.created_at : new Date().toISOString()
    };

    storage.saveCustomer(newCustomer);
    setShowModal(false);
    loadData();
    success(
      editingCustomer ? '¡Cliente Actualizado!' : '¡Cliente Registrado con Éxito!',
      `${newCustomer.name} se guardó correctamente en la cartera`
    );
  };

  // Abrir Modal Abono
  const openAbonoModal = (c: Customer) => {
    setAbonoCustomer(c);
    setFormAbono({
      amount: c.current_debt > 0 ? String(Math.min(c.current_debt, 1000)) : '',
      method: 'efectivo',
      receipt: `REC-${Math.floor(100 + Math.random() * 900)}`,
      notes: ''
    });
  };

  // Guardar Abono
  const handleGuardarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoCustomer) return;

    const monto = parseFloat(formAbono.amount);
    if (!monto || monto <= 0) {
      error('Monto Inválido', 'Por favor ingrese un monto mayor a C$ 0.00');
      return;
    }

    if (monto > (abonoCustomer.current_debt || 0)) {
      warning('Aviso', 'El monto ingresado es mayor al saldo pendiente actual del cliente.');
    }

    const nuevaDeuda = Math.max(0, (abonoCustomer.current_debt || 0) - monto);
    const updatedCust: Customer = {
      ...abonoCustomer,
      current_debt: Number(nuevaDeuda.toFixed(2))
    };

    storage.saveCustomer(updatedCust);

    // Registrar en créditos si existe crédito pendiente
    const credits = storage.getCredits() || [];
    const custCredit = credits.find(cr => 
      cr.customer_id === abonoCustomer.id || 
      cr.customer_name?.toLowerCase() === abonoCustomer.name.toLowerCase()
    );

    if (custCredit) {
      const nuevoPago: CreditPayment = {
        id: Date.now(),
        credit_id: custCredit.id,
        customer_name: abonoCustomer.name,
        amount_cordobas: monto,
        payment_method: formAbono.method === 'efectivo' ? 'Efectivo' : (formAbono.method === 'tarjeta' ? 'Tarjeta' : 'Transferencia'),
        receipt_number: formAbono.receipt || `REC-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString()
      };
      const pagosActuales = custCredit.payments ? [...custCredit.payments] : [];
      pagosActuales.push(nuevoPago);
      const remDebt = Math.max(0, (custCredit.remaining_debt || custCredit.total_debt) - monto);
      
      const updatedCredit = {
        ...custCredit,
        remaining_debt: remDebt,
        status: (remDebt <= 0.01 ? 'paid' : custCredit.status) as any,
        payments: pagosActuales
      };
      storage.saveCredit(updatedCredit);
    }

    setAbonoCustomer(null);
    loadData();
    success(
      '¡Abono Registrado!',
      `Se aplicó C$ ${monto.toFixed(2)} a la cuenta de ${abonoCustomer.name}. Nuevo saldo: C$ ${nuevaDeuda.toFixed(2)}`
    );
  };

  // Exportar Cartera a CSV / Excel
  const handleExportCSV = () => {
    info('Exportación Iniciada', 'Generando reporte de cartera de clientes...');
    const headers = ['ID,NEGOCIO_CLIENTE,CONTACTO,TELEFONO,EMAIL,DIRECCION,LIMITE_CREDITO,DIAS_PLAZO,SALDO_PENDIENTE,ESTADO'];
    const rows = customers.map(c => {
      const estado = (c.current_debt > c.credit_limit && c.credit_limit > 0)
        ? 'EXCEDE LIMITE'
        : (c.current_debt > 0 ? 'CON SALDO' : 'AL DIA');
      return `"${c.document_number || ('#LI-00' + c.id)}","${c.name}","${c.contact_name || c.name}","${c.phone || ''}","${c.email || ''}","${c.address || ''}","C$ ${c.credit_limit.toFixed(2)}","${c.dias_plazo || 15} días","C$ ${c.current_debt.toFixed(2)}","${estado}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cartera_clientes_sendafact_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      
      {/* 1. Header Banner Superior */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0">
            <Users className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              CARTERA DE CLIENTES
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Gestión de clientes, líneas de crédito, cobranzas y registro de abonos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Exportar Cartera</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/25 flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.8]" />
            <span>+ NUEVO CLIENTE</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen KPI (4 Métricas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: TOTAL CLIENTES */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL CLIENTES
            </span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalClientes}
            </span>
            <span className="block text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              Clientes activos
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-2xs">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* KPI 2: CLIENTES AL DÍA */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CLIENTES AL DÍA
            </span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white mt-1">
              {clientesAlDia}
            </span>
            <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Sin saldo pendiente
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* KPI 3: POR COBRAR */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              POR COBRAR (C$)
            </span>
            <span className="block text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              C${totalPorCobrar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="block text-xs font-bold text-rose-500 dark:text-rose-400 mt-0.5">
              {clientesConSaldo} con saldo
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50 shadow-2xs">
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* KPI 4: LÍMITE TOTAL */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              LÍMITE TOTAL
            </span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              C${limiteTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              Líneas crédito
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50 shadow-2xs">
            <CreditCard className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* 3. Barra de Búsqueda y Filtros de Segmento */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por negocio, contacto, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setFilterStatus('TODOS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'TODOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('AL_DIA')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'AL_DIA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Al Día
          </button>
          <button
            onClick={() => setFilterStatus('CON_SALDO')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'CON_SALDO'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Con Saldo
          </button>
        </div>
      </div>

      {/* 4. Tabla de Clientes */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">NEGOCIO / CLIENTE</th>
                <th className="py-3.5 px-4">CONTACTO / TELÉFONO</th>
                <th className="py-3.5 px-4">DIRECCIÓN</th>
                <th className="py-3.5 px-4 text-center">LÍMITE CRÉDITO</th>
                <th className="py-3.5 px-4 text-center">SALDO PENDIENTE</th>
                <th className="py-3.5 px-4 text-center">ESTADO</th>
                <th className="py-3.5 px-5 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No se encontraron clientes</p>
                    <p className="text-xs text-slate-400 mt-1">Intenta con otros términos o registra un nuevo cliente.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const deuda = c.current_debt || 0;
                  const limite = c.credit_limit || 0;
                  const isExcede = deuda > limite && limite > 0;
                  const isConSaldo = deuda > 0.01;

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. NEGOCIO / CLIENTE */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono font-medium mt-0.5">
                          ID: {c.document_number || ('#LI-00' + c.id)}
                        </div>
                      </td>

                      {/* 2. CONTACTO / TELÉFONO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {c.contact_name || c.name}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{c.phone || '+505 8888 8888'}</span>
                        </div>
                      </td>

                      {/* 3. DIRECCIÓN */}
                      <td className="py-4 px-4 max-w-[240px]">
                        <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 truncate" title={c.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.address || 'Managua, Nicaragua'}</span>
                        </div>
                      </td>

                      {/* 4. LÍMITE CRÉDITO */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="font-bold font-mono text-slate-900 dark:text-white text-xs">
                          C${limite.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {c.dias_plazo ?? 15} días plazo
                        </div>
                      </td>

                      {/* 5. SALDO PENDIENTE */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className={`font-black font-mono text-xs ${
                          deuda > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          C${deuda.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {deuda > 0 && (
                          <div className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mt-0.5">
                            En deuda
                          </div>
                        )}
                      </td>

                      {/* 6. ESTADO */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isExcede ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tight bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
                            EXCEDE LÍMITE
                          </span>
                        ) : isConSaldo ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tight bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
                            CON SALDO
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                            AL DÍA
                          </span>
                        )}
                      </td>

                      {/* 7. ACCIONES */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openAbonoModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 font-black text-xs transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                            title="Registrar abono de crédito"
                          >
                            <span>C$ Abonar</span>
                          </button>

                          <button
                            onClick={() => setHistoryCustomer(c)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Ver historial de cuenta"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                            title="Editar cliente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: NUEVO / EDITAR CLIENTE */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0f172a]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingCustomer ? 'EDITAR CLIENTE' : 'REGISTRAR NUEVO CLIENTE'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {editingCustomer ? 'Modifica los datos del negocio y condiciones comerciales' : 'Ingresa la información comercial y línea de crédito autorizada'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre de Negocio */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  NOMBRE DEL NEGOCIO / RAZÓN SOCIAL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Abarrotería San José"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contacto & Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    NOMBRE DE CONTACTO
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Ej: Don José Martínez"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    TELÉFONO / WHATSAPP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+505 8888 1234"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ID / Cédula y Correo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    ID / CÉDULA / RUC
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="#LI-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  DIRECCIÓN COMPLETA
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Barrio Altagracia, del Pali 2c al lago, Managua"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Límite y Días Plazo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    LÍMITE CRÉDITO (C$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    DÍAS DE PLAZO
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dias_plazo}
                    onChange={(e) => setFormData({ ...formData, dias_plazo: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editingCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: REGISTRAR ABONO A CARTERA */}
      {abonoCustomer && createPortal(
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbonoCustomer(null);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0f172a]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    REGISTRAR ABONO
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Abono a línea de crédito de cartera
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAbonoCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGuardarAbono} className="p-6 space-y-4">
              {/* Resumen del Cliente */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {abonoCustomer.name}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Saldo Pendiente:</span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                    C$ {(abonoCustomer.current_debt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Monto del Abono */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  MONTO DEL ABONO (C$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  value={formAbono.amount}
                  onChange={(e) => setFormAbono({ ...formAbono, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  MÉTODO DE PAGO *
                </label>
                <select
                  value={formAbono.method}
                  onChange={(e) => setFormAbono({ ...formAbono, method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="efectivo">Efectivo en Caja</option>
                  <option value="tarjeta">Tarjeta de Débito / Crédito</option>
                  <option value="transferencia">Transferencia Bancaria / BAC / Banpro</option>
                </select>
              </div>

              {/* N° Comprobante */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  N° RECIBO / REFERENCIA
                </label>
                <input
                  type="text"
                  value={formAbono.receipt}
                  onChange={(e) => setFormAbono({ ...formAbono, receipt: e.target.value })}
                  placeholder="REC-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAbonoCustomer(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Abono</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: HISTORIAL DE CUENTA */}
      {historyCustomer && createPortal(
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryCustomer(null);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0f172a]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                  <History className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    HISTORIAL DE CUENTA
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {historyCustomer.name} (ID: {historyCustomer.document_number || ('#LI-00' + historyCustomer.id)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Límite de Crédito</span>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    C$ {(historyCustomer.credit_limit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Deuda Pendiente</span>
                  <div className={`text-base font-black font-mono mt-0.5 ${
                    (historyCustomer.current_debt || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    C$ {(historyCustomer.current_debt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Crédito Disponible:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    C$ {Math.max(0, (historyCustomer.credit_limit || 0) - (historyCustomer.current_debt || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Plazo Otorgado:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {historyCustomer.dias_plazo ?? 15} días
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Teléfono de Cobranza:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {historyCustomer.phone || 'No registrado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Dirección de Entrega:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                    {historyCustomer.address || 'Managua, Nicaragua'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHistoryCustomer(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
