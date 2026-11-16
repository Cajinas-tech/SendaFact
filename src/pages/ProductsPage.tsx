import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  X, 
  Image as ImageIcon,
  Check,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Calendar
} from 'lucide-react';
import { storage, compressImageFile } from '../lib/storage';
import { Product, Category, Movement } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export default function ProductsPage() {
  // Pestañas principales: 'LOTES' (Control de Lotes & Stock PEPS) vs 'KARDEX' (Kardex de Movimientos)
  const [vista, setVista] = useState<'LOTES' | 'KARDEX'>('LOTES');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  
  // Búsqueda y filtros para Lotes / Productos
  const [searchTerm, setSearchTerm] = useState('');

  // Búsqueda y filtros para Kardex
  const [kardexSearch, setKardexSearch] = useState('');
  const [kardexFilter, setKardexFilter] = useState<'TODOS' | 'ENTRADA' | 'VENTA' | 'MERMA' | 'AJUSTE'>('TODOS');

  const { success, warning, error, info } = useToast();

  // Modales de Productos
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name: string } | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // Modales Rápidos: Merma y Entrada
  const [modalMerma, setModalMerma] = useState(false);
  const [modalEntrada, setModalEntrada] = useState(false);

  // Form State Merma / Ajuste Rápido
  const [formMerma, setFormMerma] = useState({
    productoId: '',
    idLote: '',
    tipo: 'MERMA' as 'MERMA' | 'AJUSTE',
    cantidad: 1,
    motivo: 'Baja por daño / rotura / vencido'
  });

  // Form State Entrada Rápida
  const [formEntrada, setFormEntrada] = useState({
    productoId: '',
    idLote: '',
    cantidad: 24,
    fechaVencimiento: '',
    costoCompra: 20.00
  });

  // Form State Producto (Crear / Editar)
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    sku: '',
    price_cordobas: '',
    price_usd: '',
    cost_price: '',
    stock: '10',
    unit: 'UNIDAD',
    expiry_date: '',
    subtitle: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setMovements(storage.getMovements());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de Productos para Vista LOTES
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;
    return products.filter(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (cat && cat.name.toLowerCase().includes(term)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(term)) ||
        (p.unit && p.unit.toLowerCase().includes(term))
      );
    });
  }, [products, categories, searchTerm]);

  // Filtrado de Movimientos para Vista KARDEX
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      // Determinar tipo canónico
      let mTipo: 'ENTRADA' | 'VENTA' | 'MERMA' | 'AJUSTE' = 'ENTRADA';
      if (m.sub_type) {
        mTipo = m.sub_type;
      } else if (m.type === 'in') {
        mTipo = 'ENTRADA';
      } else if (m.type === 'out') {
        if (m.reason.toLowerCase().includes('merma') || m.reason.toLowerCase().includes('daño') || m.reason.toLowerCase().includes('venc')) {
          mTipo = 'MERMA';
        } else {
          mTipo = 'VENTA';
        }
      } else {
        mTipo = 'AJUSTE';
      }

      // Filtro de botón
      if (kardexFilter !== 'TODOS' && mTipo !== kardexFilter) {
        return false;
      }

      // Filtro de texto
      const term = kardexSearch.toLowerCase().trim();
      if (!term) return true;

      const pName = (m.product_name || '').toLowerCase();
      const lote = (m.lot_number || '').toLowerCase();
      const reason = (m.reason || '').toLowerCase();
      const user = (m.user || m.user_name || '').toLowerCase();

      return pName.includes(term) || lote.includes(term) || reason.includes(term) || user.includes(term);
    });
  }, [movements, kardexSearch, kardexFilter]);

  // Abrir Modal de Creación
  const openCreateModal = () => {
    setFormData({
      name: '',
      category_id: categories[0]?.id || 1,
      sku: '#SKU-' + Math.floor(1000 + Math.random() * 9000),
      price_cordobas: '',
      price_usd: '',
      cost_price: '',
      stock: '10',
      unit: 'UNIDAD',
      expiry_date: '',
      subtitle: '',
      image_url: ''
    });
    setImagePreview(null);
    setCreateModal(true);
  };

  // Abrir Modal de Edición
  const openEditModal = (p: Product) => {
    setCurrentProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      sku: p.sku,
      price_cordobas: String(p.price_cordobas),
      price_usd: String(p.price_usd),
      cost_price: String(p.cost_price),
      stock: String(p.stock),
      unit: p.unit || 'UNIDAD',
      expiry_date: p.expiry_date ? p.expiry_date.substring(0, 10) : '',
      subtitle: p.subtitle || '',
      image_url: p.image_url || ''
    });
    setImagePreview(p.image_url || null);
    setEditModal(true);
  };

  // Manejador de selección de imagen con compresión
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, 600, (dataUrl) => {
        setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, image_url: dataUrl }));
      });
    }
  };

  // Guardar Nuevo Producto
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price_cordobas) {
      alert('Por favor complete el nombre y precio en córdobas');
      return;
    }

    const priceCordobas = parseFloat(formData.price_cordobas);
    const priceUsd = formData.price_usd ? parseFloat(formData.price_usd) : parseFloat((priceCordobas / 36.80).toFixed(2));
    const fallbackSvg = formData.name.toLowerCase().includes('ventana') 
      ? '/images/products/ventana-aluminio.svg' 
      : '/images/products/puerta-aluminio.svg';

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name.toUpperCase(),
      category_id: Number(formData.category_id),
      sku: formData.sku || ('#SKU-' + Math.floor(1000 + Math.random() * 9000)),
      price_cordobas: priceCordobas,
      price_usd: priceUsd,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
      stock: parseInt(formData.stock || '10', 10),
      unit: formData.unit || 'UNIDAD',
      subtitle: formData.subtitle || `${formData.unit || 'UNIDAD'} • TERMINADO`,
      image_url: formData.image_url || fallbackSvg,
      is_finished_good: true,
      status: 'active',
      expiry_date: formData.expiry_date || '2026-10-11',
      updated_at: new Date().toISOString()
    };

    const updated = [newProduct, ...products];
    storage.setProducts(updated);
    setProducts(updated);
    setCreateModal(false);
    success('¡Producto Registrado!', `${newProduct.name} se agregó al catálogo correctamente`);
  };

  // Actualizar Producto Existente
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.id) return;

    const priceCordobas = parseFloat(formData.price_cordobas);
    const priceUsd = formData.price_usd ? parseFloat(formData.price_usd) : parseFloat((priceCordobas / 36.80).toFixed(2));

    const updated = products.map(p => {
      if (p.id === currentProduct.id) {
        return {
          ...p,
          name: formData.name.toUpperCase(),
          category_id: Number(formData.category_id),
          sku: formData.sku,
          price_cordobas: priceCordobas,
          price_usd: priceUsd,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          stock: parseInt(formData.stock || '0', 10),
          unit: formData.unit || 'UNIDAD',
          subtitle: formData.subtitle || `${formData.unit || 'UNIDAD'} • TERMINADO`,
          image_url: formData.image_url || p.image_url,
          expiry_date: formData.expiry_date || p.expiry_date || '2026-10-11',
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    storage.setProducts(updated);
    setProducts(updated);
    setEditModal(false);
    success('¡Producto Actualizado!', `${formData.name.toUpperCase()} se modificó con éxito`);
  };

  // Eliminar Producto
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    const updated = storage.deleteProduct(id);
    setProducts(updated);
    warning('Producto Eliminado', `"${name}" fue retirado permanentemente del catálogo`);
    setDeleteTarget(null);
  };

  // Exportar Productos a CSV
  const handleExportCSV = () => {
    info('Exportación Iniciada', 'Generando y descargando catálogo de productos en CSV...');
    const headers = ['ID,SKU,NOMBRE,CATEGORIA,PRECIO_C$,PRECIO_USD,COSTO_C$,STOCK,SUBTITULO'];
    const rows = products.map(p => {
      const cat = categories.find(c => c.id === p.category_id)?.name || 'GENERAL';
      return `"${p.id}","${p.sku}","${p.name}","${cat}","${p.price_cordobas}","${p.price_usd}","${p.cost_price}","${p.stock}","${p.subtitle || ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `productos_sendafact_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar Kardex a Excel / CSV (.xlsx)
  const handleExportExcelKardex = () => {
    info('Exportación Iniciada', 'Descargando kardex de movimientos a Excel...');
    const headers = ['FECHA,TIPO,PRODUCTO,LOTE_AFECTADO,CANTIDAD,COSTO_UNITARIO,MOTIVO_DETALLE,USUARIO'];
    const rows = filteredMovements.map(m => {
      const fecha = new Date(m.created_at).toLocaleString();
      let tipo = m.sub_type || (m.type === 'in' ? 'ENTRADA' : (m.reason.toLowerCase().includes('merma') ? 'MERMA' : 'VENTA'));
      const cant = m.type === 'in' ? `+${m.quantity}` : `-${m.quantity}`;
      const costo = m.unit_cost ? `C$${m.unit_cost.toFixed(2)}` : 'C$20.00';
      return `"${fecha}","${tipo}","${m.product_name}","${m.lot_number || 'LOT-2026-001'}","${cant}","${costo}","${m.reason}","${m.user || m.user_name || 'Admin'}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex_movimientos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Abrir Modal Entrada Rápida
  const abrirModalEntrada = () => {
    const prod = products[0];
    const defDate = new Date();
    defDate.setMonth(defDate.getMonth() + 6);
    setFormEntrada({
      productoId: prod ? String(prod.id) : '',
      idLote: 'LOT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      cantidad: 24,
      fechaVencimiento: defDate.toISOString().split('T')[0],
      costoCompra: prod?.cost_price || 20.00
    });
    setModalEntrada(true);
  };

  // Guardar Entrada Rápida
  const handleGuardarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => String(p.id) === String(formEntrada.productoId));
    if (!prod || !formEntrada.idLote || formEntrada.cantidad <= 0) {
      error('Campos incompletos', 'Por favor complete todos los campos requeridos.');
      return;
    }

    const cant = Number(formEntrada.cantidad);
    const nuevoLote = {
      idLote: formEntrada.idLote,
      cantidad: cant,
      fechaVencimiento: formEntrada.fechaVencimiento || '2026-10-11',
      costoCompra: Number(formEntrada.costoCompra) || 20.00
    };

    const lotesActuales = prod.lotes ? [...prod.lotes] : [];
    const loteIndex = lotesActuales.findIndex(l => l.idLote === formEntrada.idLote);
    if (loteIndex >= 0) {
      lotesActuales[loteIndex].cantidad += cant;
    } else {
      lotesActuales.push(nuevoLote);
    }

    const updatedProd: Product = {
      ...prod,
      stock: prod.stock + cant,
      expiry_date: formEntrada.fechaVencimiento || prod.expiry_date,
      cost_price: Number(formEntrada.costoCompra) || prod.cost_price,
      lotes: lotesActuales
    };

    storage.saveProduct(updatedProd);

    const currentUser = storage.getCurrentUser();
    const userName = currentUser?.name || 'Jairo';

    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: 'in',
      sub_type: 'ENTRADA',
      lot_number: formEntrada.idLote,
      unit_cost: Number(formEntrada.costoCompra) || 20.00,
      quantity: cant,
      previous_stock: prod.stock,
      new_stock: prod.stock + cant,
      reason: `Ingreso nuevo lote ${formEntrada.idLote}`,
      user: userName,
      user_name: userName,
      created_at: new Date().toISOString()
    };

    storage.saveMovement(newMov);

    setModalEntrada(false);
    loadData();
    success('¡Entrada de Mercancía Confirmada!', `Se ingresaron ${cant} unds al lote ${formEntrada.idLote} de ${prod.name}`);
  };

  // Abrir Modal Merma / Ajuste Rápido
  const abrirModalMerma = () => {
    const prod = products[0];
    const primerLote = prod?.lotes?.find((l) => l.cantidad > 0) || prod?.lotes?.[0];
    setFormMerma({
      productoId: prod ? String(prod.id) : '',
      idLote: primerLote ? primerLote.idLote : '',
      tipo: 'MERMA',
      cantidad: 1,
      motivo: 'Baja por daño / rotura / vencido'
    });
    setModalMerma(true);
  };

  // Guardar Merma / Ajuste Rápido
  const handleGuardarMerma = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => String(p.id) === String(formMerma.productoId));
    if (!prod || formMerma.cantidad <= 0) {
      error('Campos incompletos', 'Por favor seleccione el producto y la cantidad.');
      return;
    }

    const cant = Number(formMerma.cantidad);
    const lotesActuales = prod.lotes ? [...prod.lotes] : [];
    if (formMerma.idLote) {
      const loteTarget = lotesActuales.find(l => l.idLote === formMerma.idLote);
      if (loteTarget) {
        loteTarget.cantidad = Math.max(0, loteTarget.cantidad - cant);
      }
    }

    const updatedProd: Product = {
      ...prod,
      stock: Math.max(0, prod.stock - cant),
      lotes: lotesActuales
    };

    storage.saveProduct(updatedProd);

    const currentUser = storage.getCurrentUser();
    const userName = currentUser?.name || 'Jairo Cajina (Admin)';

    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: 'out',
      sub_type: formMerma.tipo,
      lot_number: formMerma.idLote || 'LOT-GENERAL',
      unit_cost: prod.cost_price || 20.00,
      quantity: cant,
      previous_stock: prod.stock,
      new_stock: Math.max(0, prod.stock - cant),
      reason: `${formMerma.tipo === 'MERMA' ? 'Baja Merma' : 'Ajuste Físico'} Lote ${formMerma.idLote || 'General'}: ${formMerma.motivo}`,
      user: userName,
      user_name: userName,
      created_at: new Date().toISOString()
    };

    storage.saveMovement(newMov);

    setModalMerma(false);
    loadData();
    success(
      formMerma.tipo === 'MERMA' ? '¡Merma Procesada!' : '¡Ajuste Físico Procesado!',
      `Se descargaron ${cant} unds de ${prod.name}`
    );
  };

  const productoSeleccionadoMerma = products.find(p => String(p.id) === String(formMerma.productoId));

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. BARRA SUPERIOR EN UNA SOLA LÍNEA (EXACTO A IMAGEN 2 Y 3) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 overflow-x-auto">
        {/* Lado Izquierdo: Botones Segmentados (Control de Lotes & Kardex) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setVista('LOTES')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all text-xs text-center cursor-pointer font-bold whitespace-nowrap ${
              vista === 'LOTES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Control de Lotes & Stock PEPS
          </button>
          <button
            type="button"
            onClick={() => setVista('KARDEX')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all text-xs text-center cursor-pointer font-bold whitespace-nowrap ${
              vista === 'KARDEX'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kardex de Movimientos
          </button>
        </div>

        {/* Lado Derecho: Botones Registrar Merma / Ajuste & + Entrada de Mercancía */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={abrirModalMerma}
            className="flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#be123c] dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2]" />
            <span>Registrar Merma / Ajuste</span>
          </button>

          <button
            type="button"
            onClick={abrirModalEntrada}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#00875a] hover:bg-[#00704a] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Entrada de Mercancía</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: CONTROL DE LOTES & STOCK PEPS (CATÁLOGO DE PRODUCTOS - IMAGEN 2) */}
      {vista === 'LOTES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* HEADER & ACTION BAR */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Plus className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Gestión de Productos
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gestione el catálogo de ventas, imágenes y precios de sus artículos
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase shadow-md shadow-blue-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* PRODUCTS TABLE */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4 w-20">IMAGEN</th>
                    <th className="p-4 w-28">CÓDIGO</th>
                    <th className="p-4 min-w-[220px]">NOMBRE</th>
                    <th className="p-4 text-center">CATEGORÍA</th>
                    <th className="p-4 font-black">PRECIO</th>
                    <th className="p-4 text-center">STOCK</th>
                    <th className="p-4 text-center">FECHA VENC.</th>
                    <th className="p-4 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        No se encontraron productos registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const cat = categories.find(c => c.id === p.category_id);
                      const fallbackSvg = p.name.toLowerCase().includes('ventana') 
                        ? '/images/products/ventana-aluminio.svg' 
                        : '/images/products/puerta-aluminio.svg';
                      const imgSrc = p.image_url || fallbackSvg;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          
                          {/* IMAGEN */}
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shadow-2xs">
                              <img
                                src={imgSrc}
                                alt={p.name}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; }}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </td>

                          {/* CÓDIGO */}
                          <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {p.sku}
                          </td>

                          {/* NOMBRE */}
                          <td className="p-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight">
                              {p.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                              {p.subtitle || 'GENERAL • GASEOSAS'}
                            </p>
                          </td>

                          {/* CATEGORÍA */}
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 tracking-wider">
                              {cat?.name || 'BEBIDAS'}
                            </span>
                          </td>

                          {/* PRECIO */}
                          <td className="p-4 font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                            C$ {parseFloat(p.price_cordobas as any || 0).toFixed(2)}
                          </td>

                          {/* STOCK */}
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {p.stock}
                            </span>
                          </td>

                          {/* FECHA */}
                          <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                            {p.expiry_date || '2026-10-11'}
                          </td>

                          {/* ACCIONES */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs cursor-pointer"
                                title="Editar producto"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-2xs cursor-pointer"
                                title="Eliminar producto"
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
        </div>
      )}

      {/* VISTA 2: KARDEX DE MOVIMIENTOS (EXACTO A IMAGEN 3) */}
      {vista === 'KARDEX' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] space-y-4">
            
            {/* Controles: Buscador, Filtros y Botón Exportar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={kardexSearch}
                  onChange={(e) => setKardexSearch(e.target.value)}
                  placeholder="Buscar por producto, lote o motivo..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones de Filtro (TODOS, ENTRADA, VENTA, MERMA, AJUSTE) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold overflow-x-auto shrink-0">
                {(['TODOS', 'ENTRADA', 'VENTA', 'MERMA', 'AJUSTE'] as const).map((filtro) => (
                  <button
                    key={filtro}
                    type="button"
                    onClick={() => setKardexFilter(filtro)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                      kardexFilter === filtro
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filtro}
                  </button>
                ))}
              </div>

              {/* Botón Exportar a Excel */}
              <button
                type="button"
                onClick={handleExportExcelKardex}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 text-xs font-bold transition shadow-2xs cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar a Excel (.xlsx)</span>
              </button>
            </div>

            {/* TABLA DE KARDEX */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4 whitespace-nowrap">FECHA</th>
                    <th className="p-4 text-center whitespace-nowrap">TIPO</th>
                    <th className="p-4 min-w-[200px]">PRODUCTO</th>
                    <th className="p-4 whitespace-nowrap">LOTE AFECTADO</th>
                    <th className="p-4 text-center whitespace-nowrap">CANTIDAD</th>
                    <th className="p-4 whitespace-nowrap font-bold">COSTO UNITARIO</th>
                    <th className="p-4 min-w-[260px]">MOTIVO / DETALLE</th>
                    <th className="p-4 whitespace-nowrap">USUARIO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        No se encontraron movimientos registrados con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => {
                      // Determinar tipo canónico
                      let mTipo: 'ENTRADA' | 'VENTA' | 'MERMA' | 'AJUSTE' = 'ENTRADA';
                      if (m.sub_type) {
                        mTipo = m.sub_type;
                      } else if (m.type === 'in') {
                        mTipo = 'ENTRADA';
                      } else if (m.type === 'out') {
                        if (m.reason.toLowerCase().includes('merma') || m.reason.toLowerCase().includes('daño') || m.reason.toLowerCase().includes('venc')) {
                          mTipo = 'MERMA';
                        } else {
                          mTipo = 'VENTA';
                        }
                      } else {
                        mTipo = 'AJUSTE';
                      }

                      // Badge de Tipo
                      const badgeClasses = {
                        VENTA: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800/60',
                        ENTRADA: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
                        MERMA: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60',
                        AJUSTE: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60',
                      }[mTipo];

                      // Formatear Fecha
                      const fechaStr = new Date(m.created_at).toLocaleString('es-NI', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });

                      const cantidadStr = mTipo === 'ENTRADA' ? `+${m.quantity}` : `-${m.quantity}`;
                      const costoStr = m.unit_cost ? `C$${Number(m.unit_cost).toFixed(2)}` : 'C$20.00';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          
                          {/* FECHA */}
                          <td className="p-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {fechaStr}
                          </td>

                          {/* TIPO */}
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClasses}`}>
                              {mTipo}
                            </span>
                          </td>

                          {/* PRODUCTO */}
                          <td className="p-4">
                            <span className="font-extrabold text-slate-900 dark:text-white uppercase text-xs tracking-tight">
                              {m.product_name}
                            </span>
                          </td>

                          {/* LOTE AFECTADO */}
                          <td className="p-4 font-mono text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap font-medium">
                            {m.lot_number || 'LOT-2026-277'}
                          </td>

                          {/* CANTIDAD */}
                          <td className="p-4 text-center font-mono font-bold text-sm">
                            <span className={mTipo === 'ENTRADA' ? 'text-emerald-600 dark:text-emerald-400' : (mTipo === 'MERMA' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white')}>
                              {cantidadStr}
                            </span>
                          </td>

                          {/* COSTO UNITARIO */}
                          <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
                            {costoStr}
                          </td>

                          {/* MOTIVO / DETALLE */}
                          <td className="p-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            {m.reason}
                          </td>

                          {/* USUARIO */}
                          <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
                            {m.user || m.user_name || 'Jairo Cajina (Admin)'}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR MERMA / AJUSTE RÁPIDO */}
      {modalMerma && createPortal(
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalMerma(false);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0f172a]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                  <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    REGISTRAR MERMA / AJUSTE
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Baja por daño, fecha de vencimiento o auditoría física
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMerma(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarMerma} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  PRODUCTO AFECTADO *
                </label>
                <select
                  value={formMerma.productoId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const prod = products.find(p => String(p.id) === pid);
                    const primerLote = prod?.lotes?.find(l => l.cantidad > 0) || prod?.lotes?.[0];
                    setFormMerma({
                      ...formMerma,
                      productoId: pid,
                      idLote: primerLote ? primerLote.idLote : ''
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.name}) - Stock Total: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  LOTE ESPECÍFICO A DESCARGAR *
                </label>
                <select
                  value={formMerma.idLote}
                  onChange={(e) => setFormMerma({ ...formMerma, idLote: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {productoSeleccionadoMerma?.lotes && productoSeleccionadoMerma.lotes.length > 0 ? (
                    productoSeleccionadoMerma.lotes.map(l => (
                      <option key={l.idLote} value={l.idLote}>
                        Lote: {l.idLote} | Stock Disp: {l.cantidad} unds | Vence: {l.fechaVencimiento}
                      </option>
                    ))
                  ) : (
                    <option value="LOT-2026-834">Lote: LOT-2026-834 | Stock Disp: 23 unds | Vence: 2027-04-04</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    TIPO DE OPERACIÓN *
                  </label>
                  <select
                    value={formMerma.tipo}
                    onChange={(e) => setFormMerma({ ...formMerma, tipo: e.target.value as 'MERMA' | 'AJUSTE' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="MERMA">Merma (Daño / Quebrado / Vencido)</option>
                    <option value="AJUSTE">Ajuste de Conteo Físico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    CANTIDAD A DESCARGAR *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMerma.cantidad}
                    onChange={(e) => setFormMerma({ ...formMerma, cantidad: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  MOTIVO O JUSTIFICACIÓN *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formMerma.motivo}
                  onChange={(e) => setFormMerma({ ...formMerma, motivo: e.target.value })}
                  placeholder="Producto dañado / vencido"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalMerma(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  Procesar Baja
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: ENTRADA DE MERCANCÍA RÁPIDA */}
      {modalEntrada && createPortal(
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalEntrada(false);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0f172a]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    ENTRADA DE MERCANCÍA
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Registrar nuevo lote de inventario por compra o proveedor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEntrada(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarEntrada} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  PRODUCTO DESTINO *
                </label>
                <select
                  value={formEntrada.productoId}
                  onChange={(e) => setFormEntrada({ ...formEntrada, productoId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    N° LOTE / IDENTIFICADOR *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="LOT-2026-001"
                    value={formEntrada.idLote}
                    onChange={(e) => setFormEntrada({ ...formEntrada, idLote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    CANTIDAD RECIBIDA (UNDS) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formEntrada.cantidad}
                    onChange={(e) => setFormEntrada({ ...formEntrada, cantidad: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    FECHA DE VENCIMIENTO *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEntrada.fechaVencimiento}
                    onChange={(e) => setFormEntrada({ ...formEntrada, fechaVencimiento: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    COSTO UNIT. COMPRA (C$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formEntrada.costoCompra}
                    onChange={(e) => setFormEntrada({ ...formEntrada, costoCompra: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalEntrada(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: CREAR PRODUCTO */}
      {createModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50 shadow-xs">
                  <Plus className="w-5 h-5 stroke-[2.8]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Registrar Nuevo Producto
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Ingresa los datos para registrar el producto en el catálogo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="px-6 py-5 overflow-y-auto modal-scroll space-y-4.5 flex-1 pr-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Nombre del Producto */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. PUERTA DE ALUMINIO-VIDRIO"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none placeholder:text-slate-400 placeholder:font-normal uppercase"
                      autoFocus
                    />
                  </div>

                  {/* Subir Imagen */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Imagen del Producto (JPG, PNG, WEBP)
                    </label>
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={handleImageChange}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          Selecciona una imagen en formato JPG o PNG desde tu dispositivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Categoría
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none uppercase"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* SKU / Código */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      SKU / Código
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="#SKU-7244"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Precio Venta */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Precio Venta (C$ Córdobas) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price_cordobas}
                      onChange={(e) => setFormData({ ...formData, price_cordobas: e.target.value })}
                      placeholder="28.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-black text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Costo Unitario */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Costo Unitario (C$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Stock Inicial */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Unidad de Medida */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Unidad de Medida
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none uppercase"
                    >
                      <option value="UNIDAD">UNIDAD</option>
                      <option value="CAJA">CAJA</option>
                      <option value="TRES LITROS">TRES LITROS</option>
                      <option value="DOS LITROS">DOS LITROS</option>
                      <option value="UN LITRO">UN LITRO</option>
                      <option value="MEDIO LITRO">MEDIO LITRO</option>
                      <option value="LIBRA">LIBRA</option>
                      <option value="ONZA">ONZA</option>
                    </select>
                  </div>

                  {/* Fecha de Vencimiento */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Detalle o Descripción del Producto */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Detalle o Descripción del Producto
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Ej. BEBIDA GASEOSA"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none placeholder:text-slate-400 placeholder:font-normal uppercase"
                    />
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: EDITAR PRODUCTO */}
      {editModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50 shadow-xs">
                  <Edit3 className="w-5 h-5 stroke-[2.8]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Editar Producto
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Modifica los parámetros comerciales y existencias del producto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="px-6 py-5 overflow-y-auto modal-scroll space-y-4.5 flex-1 pr-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Nombre del Producto */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none uppercase"
                    />
                  </div>

                  {/* Subir Imagen */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Imagen del Producto (JPG, PNG)
                    </label>
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={handleImageChange}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          Selecciona una nueva foto para reemplazar la imagen del producto.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Categoría
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none uppercase"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* SKU / Código */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      SKU / Código
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Precio Venta */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Precio Venta (C$ Córdobas) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price_cordobas}
                      onChange={(e) => setFormData({ ...formData, price_cordobas: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-black text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Costo Unitario */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Costo Unitario (C$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Unidad de Medida */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Unidad de Medida
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none uppercase"
                    >
                      <option value="UNIDAD">UNIDAD</option>
                      <option value="CAJA">CAJA</option>
                      <option value="TRES LITROS">TRES LITROS</option>
                      <option value="DOS LITROS">DOS LITROS</option>
                      <option value="UN LITRO">UN LITRO</option>
                      <option value="MEDIO LITRO">MEDIO LITRO</option>
                      <option value="LIBRA">LIBRA</option>
                      <option value="ONZA">ONZA</option>
                    </select>
                  </div>

                  {/* Fecha de Vencimiento */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  {/* Detalle o Descripción del Producto */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-1.5 block uppercase">
                      Detalle o Descripción del Producto
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Ej. BEBIDA GASEOSA"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none placeholder:text-slate-400 placeholder:font-normal uppercase"
                    />
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Actualizar Producto</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: CONFIRMACIÓN DE ELIMINACIÓN */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Producto del Catálogo?"
        itemName={deleteTarget?.name}
        message="¿Estás seguro de que deseas eliminar permanentemente este producto? Se removerá del inventario y del catálogo de ventas (POS)."
        confirmText="Sí, Eliminar Producto"
        cancelText="Cancelar"
        type="danger"
      />

    </div>
  );
}
