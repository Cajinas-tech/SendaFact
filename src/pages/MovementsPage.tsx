import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftRight, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, PlusCircle, 
  Calendar, Layers, X, ShieldAlert, Plus
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Movement, Product, Category } from '../types';
import { useToast } from '../components/UI/Toast';

// Formato de moneda en Córdobas (C$)
const formatMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(monto)
    .replace('NIO', 'C$');
};

// Días restantes para vencimiento
const getDiasRestantes = (fechaVencimiento: string): number => {
  if (!fechaVencimiento) return 999;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vto = new Date(fechaVencimiento);
  vto.setHours(0, 0, 0, 0);
  const diffTiempo = vto.getTime() - hoy.getTime();
  return Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
};

// Estado del lote según días restantes
const getEstadoLote = (diasRestantes: number): {
  estado: 'CRITICO' | 'POR_VENCER' | 'NORMAL' | 'VENCIDO';
  color: string;
  badgeBg: string;
  texto: string;
} => {
  if (diasRestantes < 0) {
    return { estado: 'VENCIDO', color: 'text-red-700', badgeBg: 'bg-red-100 text-red-800 border-red-300', texto: '¡Vencido!' };
  }
  if (diasRestantes <= 5) {
    return { estado: 'CRITICO', color: 'text-rose-600', badgeBg: 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse', texto: `¡Vence en ${diasRestantes}d!` };
  }
  if (diasRestantes <= 15) {
    return { estado: 'POR_VENCER', color: 'text-amber-600', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', texto: `${diasRestantes} días restantes` };
  }
  return { estado: 'NORMAL', color: 'text-emerald-600', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', texto: `${diasRestantes} días` };
};

export const MovementsPage: React.FC = () => {
  // Sub-vistas: 'KARDEX' (Kardex de Movimientos) vs 'LOTES' (Control de Lotes & Stock PEPS)
  const [vista, setVista] = useState<'LOTES' | 'KARDEX'>('KARDEX');

  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [busquedaLotes, setBusquedaLotes] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'adjust'>('all');

  // Modales
  const [showModal, setShowModal] = useState(false); // Modal Movimiento General
  const [modalMerma, setModalMerma] = useState(false); // Modal Merma / Ajuste rápido
  const [modalEntrada, setModalEntrada] = useState(false); // Modal Entrada rápido

  const { success, info, error } = useToast();

  // Form State Operación General
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState<'ENTRADA' | 'MERMA' | 'AJUSTE'>('ENTRADA');
  const [idLote, setIdLote] = useState('LOT-2026-170');
  const [quantity, setQuantity] = useState('10');
  const [fechaVencimiento, setFechaVencimiento] = useState('2027-03-17');
  const [costoCompra, setCostoCompra] = useState('20');
  const [reason, setReason] = useState('Inventario Inicial');

  // Form State Merma / Ajuste Rápido
  const [formMerma, setFormMerma] = useState({
    productoId: '',
    idLote: '',
    tipo: 'MERMA' as 'MERMA' | 'AJUSTE',
    cantidad: 1,
    motivo: 'Baja por rotura / vencimiento'
  });

  // Form State Entrada Rápida
  const [formEntrada, setFormEntrada] = useState({
    productoId: '',
    idLote: '',
    cantidad: 12,
    fechaVencimiento: '',
    costoCompra: 20.00
  });

  const loadData = () => {
    setMovements(storage.getMovements());
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Abrir Modal Operación General
  const abrirModalOperacion = () => {
    const prods = storage.getProducts();
    const prodDef = prods[0];
    const defDate = new Date();
    defDate.setFullYear(defDate.getFullYear() + 1);
    const dateStr = defDate.toISOString().split('T')[0];

    setSelectedProductId(prodDef ? String(prodDef.id) : '');
    setTipoOperacion('ENTRADA');
    setIdLote(prodDef?.sku ? `LOT-${prodDef.sku.replace('#', '')}` : 'LOT-2026-170');
    setQuantity('10');
    setFechaVencimiento(prodDef?.expiry_date || dateStr);
    setCostoCompra(prodDef?.cost_price ? String(prodDef.cost_price) : '20');
    setReason('Inventario Inicial');
    setShowModal(true);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find(p => String(p.id) === String(productId));
    if (prod) {
      if (prod.sku) {
        setIdLote(`LOT-${prod.sku.replace('#', '')}`);
      }
      if (prod.cost_price) {
        setCostoCompra(String(prod.cost_price));
      }
      if (prod.expiry_date) {
        setFechaVencimiento(prod.expiry_date);
      }
    }
  };

  const handleCambiarTipo = (tipo: 'ENTRADA' | 'MERMA' | 'AJUSTE') => {
    setTipoOperacion(tipo);
    if (tipo === 'ENTRADA') {
      setReason('Inventario Inicial');
    } else if (tipo === 'MERMA') {
      setReason('Baja por daño / rotura / vencido');
    } else {
      setReason('Ajuste de conteo físico');
    }
  };

  // Guardar Operación General
  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => String(p.id) === String(selectedProductId));
    if (!prod) return;

    const qty = parseInt(quantity) || 1;
    let newStock = prod.stock;

    if (tipoOperacion === 'ENTRADA') {
      newStock += qty;
    } else if (tipoOperacion === 'MERMA') {
      newStock = Math.max(0, newStock - qty);
    } else if (tipoOperacion === 'AJUSTE') {
      newStock = qty;
    }

    const lotesActuales = prod.lotes ? [...prod.lotes] : [];
    if (tipoOperacion === 'ENTRADA') {
      const loteExistente = lotesActuales.find(l => l.idLote === idLote);
      if (loteExistente) {
        loteExistente.cantidad += qty;
        if (fechaVencimiento) loteExistente.fechaVencimiento = fechaVencimiento;
      } else {
        lotesActuales.push({
          idLote: idLote || `LOT-${Date.now().toString().slice(-4)}`,
          cantidad: qty,
          fechaVencimiento: fechaVencimiento || '2026-10-11',
          costoCompra: parseFloat(costoCompra) || prod.cost_price
        });
      }
    } else {
      const loteAfectado = lotesActuales.find(l => l.idLote === idLote) || lotesActuales[0];
      if (loteAfectado) {
        loteAfectado.cantidad = Math.max(0, loteAfectado.cantidad - qty);
      }
    }

    const updatedProd: Product = {
      ...prod,
      stock: newStock,
      lotes: lotesActuales
    };

    if (tipoOperacion === 'ENTRADA') {
      if (fechaVencimiento) {
        updatedProd.expiry_date = fechaVencimiento;
      }
      const costo = parseFloat(costoCompra);
      if (!isNaN(costo) && costo > 0) {
        updatedProd.cost_price = costo;
      }
    }

    storage.saveProduct(updatedProd);

    const movType = tipoOperacion === 'ENTRADA' ? 'in' : (tipoOperacion === 'MERMA' ? 'out' : 'adjust');
    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: movType,
      quantity: qty,
      reason: reason || (tipoOperacion === 'ENTRADA' ? 'Inventario Inicial' : tipoOperacion === 'MERMA' ? 'Baja por daño / rotura / vencido' : 'Ajuste de conteo físico'),
      user: 'Jairo Cajina',
      created_at: new Date().toISOString()
    };

    storage.saveMovement(newMov);

    setShowModal(false);
    loadData();
    success(
      '¡Movimiento Registrado!',
      `${tipoOperacion === 'ENTRADA' ? 'Entrada de' : tipoOperacion === 'MERMA' ? 'Salida/Merma de' : 'Ajuste a'} ${qty} unid. de ${prod.name}`
    );
  };

  // Abrir Modal Entrada Rápida
  const abrirModalEntrada = () => {
    const prod = products[0];
    const defDate = new Date();
    defDate.setMonth(defDate.getMonth() + 6);
    setFormEntrada({
      productoId: prod ? String(prod.id) : '',
      idLote: 'LOT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      cantidad: 12,
      fechaVencimiento: defDate.toISOString().split('T')[0],
      costoCompra: prod?.cost_price || 20.00
    });
    setModalEntrada(true);
  };

  // Guardar Entrada Rápida
  const handleGuardarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => String(p.id) === String(formEntrada.productoId));
    if (!prod || !formEntrada.idLote || !formEntrada.fechaVencimiento || formEntrada.cantidad <= 0) {
      error('Campos incompletos', 'Por favor complete todos los campos requeridos para la entrada.');
      return;
    }

    const cant = Number(formEntrada.cantidad);
    const nuevoLote = {
      idLote: formEntrada.idLote.trim(),
      cantidad: cant,
      fechaVencimiento: formEntrada.fechaVencimiento,
      costoCompra: Number(formEntrada.costoCompra)
    };

    const lotesActuales = prod.lotes ? [...prod.lotes] : [];
    const idx = lotesActuales.findIndex(l => l.idLote === nuevoLote.idLote);
    if (idx >= 0) {
      lotesActuales[idx] = {
        ...lotesActuales[idx],
        cantidad: lotesActuales[idx].cantidad + cant,
        fechaVencimiento: nuevoLote.fechaVencimiento,
        costoCompra: nuevoLote.costoCompra
      };
    } else {
      lotesActuales.push(nuevoLote);
    }

    const updatedProd: Product = {
      ...prod,
      stock: prod.stock + cant,
      lotes: lotesActuales,
      cost_price: nuevoLote.costoCompra || prod.cost_price,
      expiry_date: nuevoLote.fechaVencimiento || prod.expiry_date
    };

    storage.saveProduct(updatedProd);

    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: 'in',
      quantity: cant,
      reason: `Entrada Lote ${nuevoLote.idLote} (Compra / Proveedor)`,
      user: 'Jairo Cajina',
      created_at: new Date().toISOString()
    };
    storage.saveMovement(newMov);

    setModalEntrada(false);
    loadData();
    success('¡Entrada de Mercancía Confirmada!', `Se ingresaron ${cant} unds al lote ${nuevoLote.idLote} de ${prod.name}`);
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
    if (!prod || !formMerma.idLote || formMerma.cantidad <= 0) {
      error('Campos incompletos', 'Por favor seleccione el producto, lote y cantidad a descargar.');
      return;
    }

    const cant = Number(formMerma.cantidad);
    const lotesActuales = prod.lotes ? [...prod.lotes] : [];
    const loteTarget = lotesActuales.find(l => l.idLote === formMerma.idLote);
    if (loteTarget) {
      loteTarget.cantidad = Math.max(0, loteTarget.cantidad - cant);
    }

    const updatedProd: Product = {
      ...prod,
      stock: Math.max(0, prod.stock - cant),
      lotes: lotesActuales
    };

    storage.saveProduct(updatedProd);

    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: formMerma.tipo === 'MERMA' ? 'out' : 'adjust',
      quantity: cant,
      reason: `${formMerma.tipo === 'MERMA' ? 'Baja Merma' : 'Ajuste Físico'} Lote ${formMerma.idLote}: ${formMerma.motivo}`,
      user: 'Jairo Cajina',
      created_at: new Date().toISOString()
    };
    storage.saveMovement(newMov);

    setModalMerma(false);
    loadData();
    success(
      formMerma.tipo === 'MERMA' ? '¡Merma Procesada!' : '¡Ajuste Físico Procesado!',
      `Se descargaron ${cant} unds del lote ${formMerma.idLote} en ${prod.name}`
    );
  };

  // Exportar CSV
  const exportCSV = () => {
    info('Exportación Iniciada', 'Descargando kardex de movimientos...');
    const headers = ['ID,Fecha,Producto,Tipo,Cantidad,Motivo,Usuario'];
    const rows = filteredMovements.map(m => 
      `"${m.id}","${new Date(m.created_at).toLocaleString()}","${m.product_name}","${m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}","${m.quantity}","${m.reason}","${m.user || m.user_name || 'Admin'}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kardex_movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryName = (prod: Product) => {
    if (prod.category?.name) return prod.category.name;
    const cat = categories.find(c => String(c.id) === String(prod.category_id));
    return cat ? cat.name : 'BEBIDAS';
  };

  // Filtrado de movimientos Kardex
  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(m.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Filtrado de Lotes PEPS
  const productosLotesFiltrados = useMemo(() => {
    const q = busquedaLotes.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
      getCategoryName(p).toLowerCase().includes(q) ||
      p.lotes?.some(l => l.idLote.toLowerCase().includes(q))
    );
  }, [products, busquedaLotes, categories]);

  const totalIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);
  const totalAdjust = movements.filter(m => m.type === 'adjust' || m.type === 'adjustment').length;

  const productoSeleccionadoMerma = products.find(p => String(p.id) === String(formMerma.productoId));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. BARRA SUPERIOR EN UNA SOLA LÍNEA (EXACTO A IMAGEN 2) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        {/* Lado Izquierdo: Botones Segmentados (Control de Lotes & Kardex) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setVista('LOTES')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all text-xs text-center cursor-pointer font-bold whitespace-nowrap ${
              vista === 'LOTES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Control de Lotes & Stock PEPS
          </button>
          <button
            onClick={() => setVista('KARDEX')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all text-xs text-center cursor-pointer font-bold whitespace-nowrap ${
              vista === 'KARDEX'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kardex de Movimientos
          </button>
        </div>

        {/* Lado Derecho: Botones Registrar Merma / Ajuste & + Entrada de Mercancía EN UNA SOLA LÍNEA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={abrirModalMerma}
            className="flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#be123c] dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2]" />
            <span>Registrar Merma / Ajuste</span>
          </button>

          <button
            onClick={abrirModalEntrada}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#00875a] hover:bg-[#00704a] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Entrada de Mercancía</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: CONTROL DE LOTES & STOCK PEPS */}
      {vista === 'LOTES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Card de Lotes con Buscador */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                CONTROL FÍSICO DE LOTES EN ALMACÉN (PEPS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lotes ordenados por Primero en Entrar, Primero en Salir con alerta de vencimiento
              </p>
            </div>

            <div className="relative min-w-[260px] w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busquedaLotes}
                onChange={(e) => setBusquedaLotes(e.target.value)}
                placeholder="Buscar por lote o producto..."
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Grid de Productos con Lotes PEPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosLotesFiltrados.map((prod) => {
              const stockBajo = prod.stock <= (prod.min_stock || 2);
              const categoryName = getCategoryName(prod);

              return (
                <div
                  key={prod.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-colors ${
                    stockBajo
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-900/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/60">
                        {categoryName}
                      </span>
                      {stockBajo && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                          STOCK BAJO
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-2">{prod.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {prod.brand || 'Marca General'} {prod.dimensions ? `· ${prod.dimensions}` : (prod.measurements_spec ? `· ${prod.measurements_spec}` : '')}
                    </p>

                    <div className="mt-3 flex justify-between items-baseline p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Total</span>
                        <span className={`text-base font-black ${stockBajo ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {prod.stock} unds
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Mínimo</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{prod.min_stock || 2} unds</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Precio</span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{formatMoneda(prod.price_cordobas)}</span>
                      </div>
                    </div>

                    {/* Desglose de Lotes Físicos (PEPS) */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Lotes Físicos (PEPS):</p>
                      {!prod.lotes || prod.lotes.length === 0 || prod.lotes.every((l) => l.cantidad === 0) ? (
                        <p className="text-[10px] text-slate-400 italic py-1">Sin lotes activos</p>
                      ) : (
                        prod.lotes
                          .filter((l) => l.cantidad > 0)
                          .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                          .map((lote) => {
                            const dias = getDiasRestantes(lote.fechaVencimiento);
                            const estado = getEstadoLote(dias);
                            return (
                              <div
                                key={lote.idLote}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{lote.idLote}</span>
                                  <span className="text-[10px] text-slate-500 ml-1.5 font-bold">({lote.cantidad} unds)</span>
                                  <p className="text-[10px] text-slate-400">Vence: {lote.fechaVencimiento}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${estado.badgeBg}`}>
                                  {estado.texto}
                                </span>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: KARDEX DE MOVIMIENTOS */}
      {vista === 'KARDEX' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inventario & Movimientos</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Auditoría completa de entradas, mermas, salidas por venta y ajustes físicos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-500" />
                Exportar CSV
              </button>
              <button
                onClick={abrirModalOperacion}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Ajuste / Entrada
              </button>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Unidades Ingresadas</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalIn}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compras y reposiciones de stock</p>
            </div>

            <div className="glass-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Unidades Egresadas</span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalOut}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ventas, mermas y desincorporaciones</p>
            </div>

            <div className="glass-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Ajustes de Inventario</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{totalAdjust}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cuadres directos de conteo físico</p>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto, motivo o código de movimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl gap-1 w-full md:w-auto">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    typeFilter === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter('in')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    typeFilter === 'in' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setTypeFilter('out')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    typeFilter === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Salidas
                </button>
                <button
                  onClick={() => setTypeFilter('adjust')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    typeFilter === 'adjust' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ajustes
                </button>
              </div>
            </div>
          </div>

          {/* Movements Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Fecha / Hora</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4 text-center">Tipo</th>
                    <th className="px-6 py-4 text-right">Cantidad</th>
                    <th className="px-6 py-4">Motivo / Detalle</th>
                    <th className="px-6 py-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No se encontraron movimientos registrados con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-slate-400 text-xs">{m.id}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{m.product_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            m.type === 'in' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : m.type === 'out'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            {m.type === 'in' && <ArrowUpRight className="w-3 h-3" />}
                            {m.type === 'out' && <ArrowDownRight className="w-3 h-3" />}
                            {(m.type === 'adjust' || m.type === 'adjustment') && <Layers className="w-3 h-3" />}
                            {m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                          m.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : m.type === 'out' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {m.type === 'in' ? `+${m.quantity}` : m.type === 'out' ? `-${m.quantity}` : `=${m.quantity}`}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate">{m.reason}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">{m.user || m.user_name || 'Admin'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR MOVIMIENTO GENERAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  REGISTRAR MOVIMIENTO DE INVENTARIO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                  TIPO DE MOVIMIENTO
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCambiarTipo('ENTRADA')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      tipoOperacion === 'ENTRADA'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 mb-1" />
                    <span>ENTRADA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCambiarTipo('MERMA')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      tipoOperacion === 'MERMA'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 mb-1" />
                    <span>MERMA / SALIDA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCambiarTipo('AJUSTE')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      tipoOperacion === 'AJUSTE'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 mb-1" />
                    <span>AJUSTE FÍSICO</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                  PRODUCTO *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.dimensions || p.measurements_spec || p.name}) - Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    N° LOTE / CÓDIGO *
                  </label>
                  <input
                    type="text"
                    required
                    value={idLote}
                    onChange={(e) => setIdLote(e.target.value)}
                    placeholder="LOT-2026-170"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    CANTIDAD *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {tipoOperacion === 'ENTRADA' && (
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                      FECHA DE VENCIMIENTO
                    </label>
                    <input
                      type="date"
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                      COSTO UNIT. (C$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costoCompra}
                      onChange={(e) => setCostoCompra(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                  MOTIVO / DETALLE
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    tipoOperacion === 'ENTRADA'
                      ? 'Inventario Inicial'
                      : tipoOperacion === 'MERMA'
                      ? 'Baja por daño / rotura / vencido'
                      : 'Ajuste de conteo físico'
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  GUARDAR MOVIMIENTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR MERMA / AJUSTE RÁPIDO (EXACTO A IMAGEN 3) */}
      {modalMerma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Registrar Merma / Ajuste
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Baja por daño, fecha de vencimiento o auditoría física
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMerma(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarMerma} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Producto Afectado *
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
                      {p.name} ({p.dimensions || p.measurements_spec || p.name}) - Stock Total: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Lote Específico a Descargar *
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
                    <option value="">Lote General | Stock: {productoSeleccionadoMerma?.stock || 0} unds</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Tipo de Operación *
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Cantidad a Descargar *
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
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Motivo o Justificación *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formMerma.motivo}
                  onChange={(e) => setFormMerma({ ...formMerma, motivo: e.target.value })}
                  placeholder="Describa el motivo de la baja..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalMerma(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  Procesar Baja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ENTRADA DE MERCANCÍA RÁPIDA (EXACTO A IMAGEN 4) */}
      {modalEntrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Entrada de Mercancía
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registrar nuevo lote de inventario por compra o proveedor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEntrada(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarEntrada} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Producto Destino *
                </label>
                <select
                  value={formEntrada.productoId}
                  onChange={(e) => setFormEntrada({ ...formEntrada, productoId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.dimensions || p.measurements_spec || p.name}) - Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    N° Lote / Identificador *
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Cantidad Recibida (Unds) *
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Fecha de Vencimiento *
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Costo Unit. Compra (C$) *
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
