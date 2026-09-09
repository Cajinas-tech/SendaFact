import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, PlusCircle, 
  Calendar, Layers, Tag, UserCheck, RefreshCw
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Movement, Product } from '../types';

export const MovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'adjust'>('all');
  const [showModal, setShowModal] = useState(false);

  // New movement form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjust'>('in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const loadData = () => {
    setMovements(storage.getMovements());
    setProducts(storage.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(quantity) || 1;
    let newStock = prod.stock;

    if (movementType === 'in') {
      newStock += qty;
    } else if (movementType === 'out') {
      newStock = Math.max(0, newStock - qty);
    } else if (movementType === 'adjust') {
      newStock = qty; // Replaces stock with exact quantity
    }

    // Update product stock
    storage.saveProduct({
      ...prod,
      stock: newStock
    });

    // Create movement record
    const newMov: Movement = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      product_id: prod.id,
      product_name: prod.name,
      type: movementType,
      quantity: qty,
      reason: reason || (movementType === 'in' ? 'Entrada por compra/reposición' : movementType === 'out' ? 'Baja/merma' : 'Ajuste físico de inventario'),
      user: 'Jairo Cajina',
      created_at: new Date().toISOString()
    };

    storage.saveMovement(newMov);

    setShowModal(false);
    setSelectedProductId('');
    setQuantity('1');
    setReason('');
    loadData();
  };

  const exportCSV = () => {
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kardex de Inventario y Movimientos</h1>
            <p className="text-sm text-slate-400 mt-1">Auditoría completa de entradas, mermas, salidas por venta y ajustes físicos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Ajuste / Entrada
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unidades Ingresadas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalIn}</div>
          <p className="text-xs text-slate-500 mt-1">Compras y reposiciones de stock</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unidades Egresadas</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalOut}</div>
          <p className="text-xs text-slate-500 mt-1">Ventas, mermas y desincorporaciones</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ajustes de Inventario</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{totalAdjust}</div>
          <p className="text-xs text-slate-500 mt-1">Cuadres directos de conteo físico</p>
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
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 w-full md:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Salidas
            </button>
            <button
              onClick={() => setTypeFilter('adjust')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'adjust' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
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
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron movimientos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">{m.id}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{m.product_name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        m.type === 'in' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : m.type === 'out'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {m.type === 'in' && <ArrowUpRight className="w-3 h-3" />}
                        {m.type === 'out' && <ArrowDownRight className="w-3 h-3" />}
                        {m.type === 'adjust' && <Layers className="w-3 h-3" />}
                        {m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                      m.type === 'in' ? 'text-emerald-400' : m.type === 'out' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {m.type === 'in' ? `+${m.quantity}` : m.type === 'out' ? `-${m.quantity}` : `=${m.quantity}`}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs max-w-xs truncate">{m.reason}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-medium">{m.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Registrar Entrada / Salida / Ajuste */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
              Registrar Movimiento de Inventario
            </h3>

            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Producto</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock Actual: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Tipo de Movimiento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('in')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      movementType === 'in' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('out')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      movementType === 'out' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Salida
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('adjust')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      movementType === 'adjust' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Ajuste Físico
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  {movementType === 'adjust' ? 'Nuevo Stock Total' : 'Cantidad a Mover'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Motivo / Comentario</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Factura compra #5432, merma por rotura, inventario mensual..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-600/30 transition"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
