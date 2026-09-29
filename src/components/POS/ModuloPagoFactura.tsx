import React, { useState } from 'react';
import { Banknote, CreditCard, Clock, Search, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface Cliente {
  id: string | number;
  nombre: string;
  limite_credito: number;
  current_debt?: number;
  telefono?: string;
}

export interface FacturacionProps {
  clientes: Cliente[];
  totalCarrito: number;
  onProcesarFactura: (datos: {
    metodoPago: 'EFECTIVO' | 'TARJETA' | 'CREDITO';
    clienteId: string | number | null;
    diasPlazo: number;
  }) => Promise<void> | void;
}

export const ModuloPagoFactura: React.FC<FacturacionProps> = ({ 
  clientes, 
  totalCarrito, 
  onProcesarFactura 
}) => {
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'CREDITO'>('EFECTIVO');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [diasPlazo, setDiasPlazo] = useState<number>(30);
  const [cargando, setCargando] = useState(false);

  // Filtrar clientes en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (c.telefono && c.telefono.includes(busquedaCliente))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (metodoPago === 'CREDITO' && !clienteSeleccionado) {
      alert("Por favor, selecciona un cliente para el crédito.");
      return;
    }
    
    setCargando(true);
    try {
      await onProcesarFactura({
        metodoPago,
        clienteId: clienteSeleccionado ? clienteSeleccionado.id : null,
        diasPlazo: metodoPago === 'CREDITO' ? diasPlazo : 0
      });
    } finally {
      setCargando(false);
    }
  };

  const creditoDisponible = clienteSeleccionado 
    ? Math.max(0, (clienteSeleccionado.limite_credito || 0) - (clienteSeleccionado.current_debt || 0))
    : 0;
  const cupoInsuficiente = clienteSeleccionado && creditoDisponible < totalCarrito;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 transition-all">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Finalizar Facturación</h2>
      
      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl mb-5 flex justify-between items-center border border-gray-100 dark:border-slate-800">
        <span className="text-gray-600 dark:text-slate-400 font-medium text-sm">Total a Pagar:</span>
        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
          C$ {totalCarrito.toFixed(2)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Método de Pago */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { tipo: 'EFECTIVO' as const, icon: Banknote },
              { tipo: 'TARJETA' as const, icon: CreditCard },
              { tipo: 'CREDITO' as const, icon: Clock }
            ]).map(({ tipo, icon: Icon }) => (
              <button
                key={tipo}
                type="button"
                onClick={() => {
                  setMetodoPago(tipo);
                  if (tipo !== 'CREDITO') {
                    setClienteSeleccionado(null);
                    setBusquedaCliente('');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === tipo 
                    ? tipo === 'CREDITO'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : tipo === 'TARJETA'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tipo}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sección Condicional: Gestión y Búsqueda de Clientes para Crédito */}
        {metodoPago === 'CREDITO' && (
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Configuración del Crédito
              </h3>
              <span className="text-[10px] font-bold bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                Sin entrada a caja
              </span>
            </div>
            
            {/* Buscador de Clientes en Tiempo Real */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Buscar Cliente Registrado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={clienteSeleccionado ? clienteSeleccionado.nombre : busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    if (clienteSeleccionado) setClienteSeleccionado(null);
                  }}
                  placeholder="Escribe el nombre o teléfono del cliente..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Desplegable de Resultados de Clientes Filtrados */}
              {busquedaCliente && !clienteSeleccionado && (
                <ul className="absolute z-20 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 mt-1 rounded-xl max-h-48 overflow-y-auto shadow-xl divide-y divide-gray-100 dark:divide-slate-800">
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map(cliente => (
                      <li 
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setBusquedaCliente('');
                        }}
                        className="px-3.5 py-2.5 text-xs hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <span className="font-bold text-gray-800 dark:text-white block">{cliente.nombre}</span>
                          {cliente.telefono && <span className="text-[10px] text-gray-400">Tel: {cliente.telefono}</span>}
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          Cupo: C$ {cliente.limite_credito.toLocaleString()}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="px-3.5 py-3 text-xs text-gray-500 italic text-center">
                      No se encontraron clientes registrados con ese nombre
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Resumen del Cliente Seleccionado */}
            {clienteSeleccionado && (
              <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-amber-200 dark:border-slate-800 text-xs space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-gray-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {clienteSeleccionado.nombre}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setBusquedaCliente('');
                    }}
                    className="text-[10px] text-amber-600 hover:underline font-bold"
                  >
                    Cambiar
                  </button>
                </div>
                <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span>Límite total:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-white">
                    C$ {clienteSeleccionado.limite_credito.toFixed(2)}
                  </span>
                </div>
                {typeof clienteSeleccionado.current_debt === 'number' && (
                  <div className="flex justify-between text-gray-500">
                    <span>Deuda actual:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      C$ {clienteSeleccionado.current_debt.toFixed(2)}
                    </span>
                  </div>
                )}
                {cupoInsuficiente && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Advertencia: El monto excede el límite de crédito disponible.</span>
                  </div>
                )}
              </div>
            )}

            {/* Días de Plazo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Días de Plazo para Abonar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={diasPlazo}
                  onChange={(e) => setDiasPlazo(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono font-bold"
                />
                <div className="flex gap-1.5">
                  {[8, 15, 30, 45].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiasPlazo(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        diasPlazo === d
                          ? 'bg-amber-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Fecha límite de cobro: {new Date(Date.now() + diasPlazo * 86400000).toLocaleDateString('es-NI')}
              </p>
            </div>
          </div>
        )}

        {/* Botón de Acción con protección de Doble Clic */}
        <button
          type="submit"
          disabled={cargando}
          className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            cargando 
              ? 'bg-gray-400 dark:bg-slate-700 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] shadow-emerald-600/30'
          }`}
        >
          {cargando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando Transacción...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Facturar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ModuloPagoFactura;
