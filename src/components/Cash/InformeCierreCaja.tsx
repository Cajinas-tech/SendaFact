import React from 'react';
import { 
  Vault, Lock, DollarSign, Banknote, CreditCard, Receipt, 
  ArrowDownRight, Calendar, User, Clock, CheckCircle2, Printer, X,
  ArrowUpRight, AlertCircle, ShoppingBag, ShieldCheck
} from 'lucide-react';

export interface AbonoTurno {
  id?: number | string;
  credito_id?: number | string;
  ticket_number?: string;
  cliente_nombre: string;
  credito_original: number;
  monto_abonado_hoy: number;
  saldo_restante_actual: number;
  hora_pago: string;
  payment_method?: string;
}

export interface InformeCierreCajaProps {
  cajaId: number | string;
  cajeroNombre: string;
  fechaApertura: string;
  fondoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia?: number;
  ventasCredito: number;
  cobranzaAbonos: number;
  egresosGastos: number;
  totalEfectivoEsperado: number;
  abonosDetalle: AbonoTurno[];
  onConfirmarCierre: () => Promise<void> | void;
  onCancelar: () => void;
  cargando?: boolean;
}

export const InformeCierreCaja: React.FC<InformeCierreCajaProps> = ({
  cajaId,
  cajeroNombre,
  fechaApertura,
  fondoInicial,
  ventasEfectivo,
  ventasTarjeta,
  ventasTransferencia = 0,
  ventasCredito,
  cobranzaAbonos,
  egresosGastos,
  totalEfectivoEsperado,
  abonosDetalle,
  onConfirmarCierre,
  onCancelar,
  cargando = false
}) => {
  const ventasElectronicas = (ventasTarjeta || 0) + (ventasTransferencia || 0);

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. ENCABEZADO FIJO */}
      <div className="shrink-0 flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Vault className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Informe de Cierre y Arqueo de Caja
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                Arqueo Final
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                Turno #{cajaId}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {cajeroNombre}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Apertura: {fechaApertura ? new Date(fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones Superiores: Imprimir y Botón Cerrar (X) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir</span>
          </button>
          
          <button
            type="button"
            onClick={onCancelar}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. CONTENIDO DESPLAZABLE (SCROLLABLE BODY) */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 [scrollbar-width:thin]">
        {/* Tarjetas Resumen de Totales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Fondo Apertura</span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white block mt-0.5">
              C$ {fondoInicial.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Ventas Contado</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
              + C$ {ventasEfectivo.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">Cobranza Abonos</span>
            <span className="text-base sm:text-lg font-black font-mono text-teal-600 dark:text-teal-400 block mt-0.5">
              + C$ {cobranzaAbonos.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Ventas a Crédito</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
              C$ {ventasCredito.toFixed(2)}
            </span>
            <span className="text-[9px] text-amber-600/80 dark:text-amber-400/70 font-semibold block mt-0.5">No entra a caja</span>
          </div>
        </div>

        {/* Desglose Matemático del Arqueo de Efectivo Físico */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span className="font-medium">Fondo Inicial de Apertura:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">C$ {fondoInicial.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span className="font-medium">(+) Entradas por Ventas de Contado (Efectivo):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+ C$ {ventasEfectivo.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span className="font-medium">(+) Entradas por Abonos de Clientes a Crédito:</span>
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+ C$ {cobranzaAbonos.toFixed(2)}</span>
          </div>

          {ventasElectronicas > 0 && (
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-medium">Ventas Electrónicas (Tarjeta / Transferencia):</span>
              <span className="font-mono font-semibold">C$ {ventasElectronicas.toFixed(2)} (en banco)</span>
            </div>
          )}

          {egresosGastos > 0 && (
            <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
              <span className="font-medium">(-) Salidas de Efectivo / Gastos del Turno:</span>
              <span className="font-mono font-bold">- C$ {egresosGastos.toFixed(2)}</span>
            </div>
          )}

          {/* Gran Total Efectivo en Gaveta */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-slate-900 dark:text-white text-sm sm:text-base font-black block">
                Total Efectivo Físico a Entregar:
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Monto que debe estar físicamente en la gaveta
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              C$ {totalEfectivoEsperado.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Auditoría: Clientes que Abonaron Durante este Turno */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-teal-500" />
              <span>Clientes que abonaron durante este turno de caja ({abonosDetalle.length})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/60">
              Total Cobranza: C$ {cobranzaAbonos.toFixed(2)}
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="max-h-52 overflow-y-auto [scrollbar-width:thin] overflow-x-auto">
              {abonosDetalle.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No se registraron abonos a cuentas de crédito durante este turno.
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[520px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3.5 py-2.5">Cliente</th>
                      <th className="px-3.5 py-2.5 text-right">Crédito Original</th>
                      <th className="px-3.5 py-2.5 text-right text-teal-600 dark:text-teal-400">Monto Abonado Hoy</th>
                      <th className="px-3.5 py-2.5 text-right">Saldo Restante Actual</th>
                      <th className="px-3.5 py-2.5 text-center">Hora Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {abonosDetalle.map((abono, idx) => (
                      <tr key={abono.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-3.5 py-2.5 font-sans">
                          <span className="font-bold text-slate-900 dark:text-white block leading-tight">{abono.cliente_nombre}</span>
                          {abono.ticket_number && (
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{abono.ticket_number}</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right text-slate-600 dark:text-slate-400">
                          C$ {abono.credito_original.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-black text-teal-600 dark:text-teal-400">
                          + C$ {abono.monto_abonado_hoy.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right text-slate-700 dark:text-slate-300 font-semibold">
                          C$ {abono.saldo_restante_actual.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2.5 text-center text-[10px] font-sans text-slate-400">
                          {abono.hora_pago ? new Date(abono.hora_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTONES DE ACCIÓN FIJOS AL FONDO */}
      <div className="shrink-0 flex items-center gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
        <button
          type="button"
          disabled={cargando}
          onClick={onCancelar}
          className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50"
        >
          Volver a Turno
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={onConfirmarCierre}
          className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {cargando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Cerrando Caja...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Confirmar y Cerrar Turno</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InformeCierreCaja;
