import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  Printer,
  X,
  MessageCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Supplier } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [copiedRucId, setCopiedRucId] = useState<number | null>(null);

  const { success, warning, error, info } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    ruc: '',
    email: '',
    address: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  const loadData = () => {
    const list = storage.getSuppliers();
    setSuppliers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Métricas de KPIs
  const totalProveedores = suppliers.length;
  const conRuc = useMemo(() => suppliers.filter(s => s.ruc && s.ruc.trim().length > 0).length, [suppliers]);
  const conTelefono = useMemo(() => suppliers.filter(s => s.phone && s.phone.trim().length > 0).length, [suppliers]);
  const conCorreo = useMemo(() => suppliers.filter(s => s.email && s.email.trim().length > 0).length, [suppliers]);

  // Filtrado en tiempo real
  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return suppliers;

    return suppliers.filter(s => {
      const companyMatch = (s.company_name || s.name || '').toLowerCase().includes(term);
      const contactMatch = (s.contact_name || '').toLowerCase().includes(term);
      const rucMatch = (s.ruc || '').toLowerCase().includes(term);
      const phoneMatch = (s.phone || '').toLowerCase().includes(term);
      const addressMatch = (s.address || '').toLowerCase().includes(term);
      const emailMatch = (s.email || '').toLowerCase().includes(term);

      return companyMatch || contactMatch || rucMatch || phoneMatch || addressMatch || emailMatch;
    });
  }, [suppliers, searchTerm]);

  // Abrir Modal Nuevo Proveedor
  const openNewModal = () => {
    setEditingSupplier(null);
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      ruc: '',
      email: '',
      address: '',
      notes: '',
      status: 'active'
    });
    setShowModal(true);
  };

  // Abrir Modal Editar Proveedor
  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      company_name: supplier.company_name || supplier.name || '',
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      ruc: supplier.ruc || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
      status: supplier.status || 'active'
    });
    setShowModal(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name.trim()) {
      warning('El nombre de la empresa o razón social es obligatorio');
      return;
    }

    try {
      const supplierToSave: Supplier = {
        id: editingSupplier ? editingSupplier.id : Date.now(),
        company_name: formData.company_name.trim(),
        name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim(),
        phone: formData.phone.trim(),
        ruc: formData.ruc.trim().toUpperCase(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
        created_at: editingSupplier ? editingSupplier.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.saveSupplier(supplierToSave);
      loadData();
      setShowModal(false);

      if (editingSupplier) {
        success(`Proveedor "${supplierToSave.company_name}" actualizado correctamente`);
      } else {
        success(`Proveedor "${supplierToSave.company_name}" registrado con éxito`);
      }
    } catch (err) {
      error('Error al guardar el proveedor');
      console.error(err);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (!deletingSupplier) return;
    try {
      storage.deleteSupplier(deletingSupplier.id);
      loadData();
      success(`Proveedor "${deletingSupplier.company_name || deletingSupplier.name}" eliminado correctamente`);
      setDeletingSupplier(null);
    } catch (err) {
      error('Error al eliminar el proveedor');
      console.error(err);
    }
  };

  // Copiar RUC al portapapeles
  const handleCopyRuc = (ruc: string, id: number) => {
    if (!ruc) return;
    navigator.clipboard.writeText(ruc);
    setCopiedRucId(id);
    info(`RUC ${ruc} copiado al portapapeles`);
    setTimeout(() => {
      setCopiedRucId(null);
    }, 2000);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (suppliers.length === 0) {
      warning('No hay proveedores registrados para exportar');
      return;
    }

    const headers = ['ID', 'EMPRESA / RAZÓN SOCIAL', 'CONTACTO', 'RUC', 'TELÉFONO', 'CORREO ELECTRÓNICO', 'DIRECCIÓN', 'FECHA REGISTRO'];
    const rows = suppliers.map(s => [
      s.id,
      `"${(s.company_name || s.name || '').replace(/"/g, '""')}"`,
      `"${(s.contact_name || '').replace(/"/g, '""')}"`,
      `"${(s.ruc || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      s.created_at ? new Date(s.created_at).toLocaleDateString('es-NI') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Directorio_Proveedores_SendaFact_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Directorio exportado en archivo CSV');
  };

  // Imprimir directorio
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Card Principal con Búsqueda y Botón Nuevo */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Título & Subtítulo con Icono Truck */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-2xs shrink-0">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>GESTIÓN DE PROVEEDORES</span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                  {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'registro' : 'registros'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Gestione sus relaciones comerciales e ingresos de mercadería
              </p>
            </div>
          </div>

          {/* Buscador y Botón Nuevo Proveedor */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px] sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botón Nuevo Proveedor */}
            <button
              onClick={openNewModal}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nuevo Proveedor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen KPI (4 Métricas que enriquecen el módulo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: TOTAL PROVEEDORES */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL PROVEEDORES
            </span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalProveedores}
            </span>
            <span className="block text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              Empresas activas
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: CON RUC REGISTRADO */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CON RUC / FORMAL
            </span>
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {conRuc}
            </span>
            <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Cédula tributaria
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: LÍNEAS DE TELÉFONO */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CON CONTACTO DIRECTO
            </span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white mt-1">
              {conTelefono}
            </span>
            <span className="block text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              Teléfono / WhatsApp
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
            <Phone className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: CORREO ELECTRÓNICO */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CORREOS PARA PEDIDOS
            </span>
            <span className="block text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {conCorreo}
            </span>
            <span className="block text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              Cotizaciones activas
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
            <Mail className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Utilidades: Exportación e Impresión */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-semibold">
          Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSuppliers.length}</span> de <span className="font-bold text-slate-800 dark:text-slate-200">{suppliers.length}</span> proveedores
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer shadow-2xs"
            title="Exportar a archivo Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer shadow-2xs"
            title="Imprimir listado de proveedores"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* 4. Tabla de Proveedores (Estructura y diseño exacto a la imagen) */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  EMPRESA / RAZÓN SOCIAL
                </th>
                <th className="py-3.5 px-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  CONTACTO
                </th>
                <th className="py-3.5 px-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  RUC / ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  TELÉFONO
                </th>
                <th className="py-3.5 px-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  DIRECCIÓN
                </th>
                <th className="py-3.5 px-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  CORREO ELECTRÓNICO
                </th>
                <th className="py-3.5 px-5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
                        <Truck className="w-7 h-7 stroke-[1.8]" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                        {searchTerm ? 'No se encontraron proveedores coincidentes' : 'No hay proveedores registrados aún'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm
                          ? `No encontramos resultados para "${searchTerm}". Intente con otro término o limpie el filtro.`
                          : 'Comience agregando su primer proveedor comercial haciendo clic en el botón "+ Nuevo Proveedor".'}
                      </p>
                      {searchTerm ? (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          Limpiar Búsqueda
                        </button>
                      ) : (
                        <button
                          onClick={openNewModal}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/20"
                        >
                          + Crear Primer Proveedor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const companyName = supplier.company_name || supplier.name || 'Empresa Sin Nombre';
                  const contact = supplier.contact_name || '—';
                  const ruc = supplier.ruc || '—';
                  const phone = supplier.phone || '—';
                  const address = supplier.address || '—';
                  const email = supplier.email || '—';
                  const cleanPhone = (supplier.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. EMPRESA / RAZÓN SOCIAL */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {companyName}
                        </div>
                        {supplier.notes && (
                          <div className="text-[11px] text-slate-400 italic truncate max-w-xs mt-0.5" title={supplier.notes}>
                            {supplier.notes}
                          </div>
                        )}
                      </td>

                      {/* 2. CONTACTO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {contact}
                        </div>
                      </td>

                      {/* 3. RUC / ID */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-medium text-slate-700 dark:text-slate-300 text-xs">
                          <span>{ruc}</span>
                          {supplier.ruc && (
                            <button
                              onClick={() => handleCopyRuc(supplier.ruc!, supplier.id)}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer p-1 rounded-md"
                              title="Copiar RUC al portapapeles"
                            >
                              {copiedRucId === supplier.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 4. TELÉFONO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {supplier.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${supplier.phone}`}
                              className="font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              {phone}
                            </a>
                            {cleanPhone.length >= 8 && (
                              <a
                                href={`https://wa.me/505${cleanPhone.slice(-8)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                                title="Enviar mensaje por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      {/* 5. DIRECCIÓN */}
                      <td className="py-4 px-4 max-w-[240px]">
                        {supplier.address ? (
                          <div className="text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1.5 truncate" title={supplier.address}>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 6. CORREO ELECTRÓNICO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {supplier.email ? (
                          <a
                            href={`mailto:${supplier.email}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span>{email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      {/* 7. ACCIONES (Editar y Eliminar) */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botón Editar (Pencil azul tenue exactamente como en la imagen) */}
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-400 transition cursor-pointer border border-blue-200/50 dark:border-blue-900/40 shadow-2xs active:scale-95"
                            title="Editar proveedor"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Botón Eliminar (Papelera roja tenue exactamente como en la imagen) */}
                          <button
                            onClick={() => setDeletingSupplier(supplier)}
                            className="p-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition cursor-pointer border border-rose-200/50 dark:border-rose-900/40 shadow-2xs active:scale-95"
                            title="Eliminar proveedor"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 5. Modal de Formulario Nuevo / Editar Proveedor (Fiel a la Imagen 2) */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
                
                {/* Fila 1: Nombre de la Empresa & Nombre del Contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      NOMBRE DE LA EMPRESA <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Distribuidora S.A."
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      NOMBRE DEL CONTACTO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Martínez"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Fila 2: Teléfono de Contacto & RUC / Razón Social ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      TELÉFONO DE CONTACTO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 88888888"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      RUC / RAZÓN SOCIAL ID
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. RUC0000000000"
                      value={formData.ruc}
                      onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Fila 3: Correo Electrónico */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. ventas@proveedor.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                  />
                </div>

                {/* Fila 4: Dirección de Entrega */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    DIRECCIÓN DE ENTREGA
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dirección del centro de distribución o almacén..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs resize-none"
                  />
                </div>

                {/* Fila 5: Notas u Observaciones adicionales (Plus) */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    NOTAS O TÉRMINOS COMERCIALES (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Crédito 30 días, entrega martes y jueves..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                  />
                </div>

              </div>

              {/* Modal Footer con Botones Cancelar y Guardar */}
              <div className="flex items-center justify-end gap-3 px-6 py-4.5 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition cursor-pointer uppercase tracking-wide"
                >
                  {editingSupplier ? 'GUARDAR CAMBIOS' : 'GUARDAR PROVEEDOR'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 6. Modal de Confirmación para Eliminar */}
      <ConfirmModal
        isOpen={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Proveedor?"
        message={`¿Está seguro de que desea eliminar a "${deletingSupplier?.company_name || deletingSupplier?.name}"? Esta acción removerá al proveedor del directorio activo.`}
        confirmText="Sí, Eliminar Proveedor"
        cancelText="Cancelar"
        type="danger"
      />

    </div>
  );
};
