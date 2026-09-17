import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, PlusCircle, 
  Calendar, Layers, X
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Movement, Product } from '../types';
import { useToast } from '../components/UI/Toast';

export const MovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'adjust'>('all');
  const [showModal, setShowModal] = useState(false);
  const { success, info } = useToast();

  // Formulario de movimiento según el diseño objetivo
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState<'ENTRADA' | 'MERMA' | 'AJUSTE'>('ENTRADA');
  const [idLote, setIdLote] = useState('LOT-2026-170');
  const [quantity, setQuantity] = useState('10');
  const [fechaVencimiento, setFechaVencimiento] = useState('2027-03-17');
  const [costoCompra, setCostoCompra] = useState('20');
  const [reason, setReason] = useState('Inventario Inicial');

  const loadData = () => {
    setMovements(storage.getMovements());
    setProducts(storage.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

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

    const updatedProd: Product = {
      ...prod,
      stock: newStock
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

  const exportCSV = () => {
    info('Exportación Iniciada', 'Descargando kardex de movimientos...');
    const headers = ['ID,Fecha,Producto,Tipo,Cantidad,Motivo,Usuario'];
    const rows = filteredMovements.map(m => 
      `"${m.id}","${new Date(m.created_at).toLocaleString()}","${m.product_name}","${m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}","${m.quantity}","${m.reason}","${m.user}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kardex_movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);
  const totalAdjust = movements.filter(m => m.type === 'adjust').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Kardex de Inventario y Movimientos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Auditoría completa de entradas, mermas, salidas por venta y ajustes físicos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'in' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Salidas
            </button>
            <button
              onClick={() => setTypeFilter('adjust')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
                        {m.type === 'adjust' && <Layers className="w-3 h-3" />}
                        {m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                      m.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : m.type === 'out' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {m.type === 'in' ? `+${m.quantity}` : m.type === 'out' ? `-${m.quantity}` : `=${m.quantity}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate">{m.reason}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">{m.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR MOVIMIENTO DE INVENTARIO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            {/* Encabezado */}
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
              {/* TIPO DE MOVIMIENTO */}
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

              {/* PRODUCTO * */}
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

              {/* N° LOTE / CÓDIGO * y CANTIDAD * */}
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

              {/* FECHA DE VENCIMIENTO y COSTO UNIT. (C$) - Solo para ENTRADA */}
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

              {/* MOTIVO / DETALLE */}
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

              {/* Botones */}
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
    </div>
  );
};
