import React from 'react';
import { 
  Vault, Lock, DollarSign, Banknote, CreditCard, Receipt, 
  ArrowDownRight, Calendar, User, Clock, CheckCircle2, Printer
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
  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Encabezado del Informe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Vault className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Informe de Cierre y Arqueo de Caja
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                Turno #{cajaId}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {cajeroNombre}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Apertura: {new Date(fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Imprimir Arqueo</span>
        </button>
      </div>

      {/* Tarjetas Resumen de Totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Fondo Apertura</span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            C$ {fondoInicial.toFixed(2)}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Ventas Contado</span>
          <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
            C$ {ventasEfectivo.toFixed(2)}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">Cobranza Abonos</span>
          <span className="text-lg font-black font-mono text-teal-600 dark:text-teal-400">
            C$ {cobranzaAbonos.toFixed(2)}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Ventas a Crédito</span>
          <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
            C$ {ventasCredito.toFixed(2)}
          </span>
          <span className="text-[9px] text-amber-600 dark:text-amber-500 block">No entra a caja</span>
        </div>
      </div>

      {/* Desglose Matemático del Arqueo */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Fondo Inicial de Apertura:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white">C$ {fondoInicial.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>(+) Entradas por Ventas de Contado (Efectivo):</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+ C$ {ventasEfectivo.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>(+) Entradas por Abonos de Clientes a Crédito:</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+ C$ {cobranzaAbonos.toFixed(2)}</span>
        </div>
        {(ventasTarjeta + ventasTransferencia) > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>Ventas Electrónicas (Tarjeta / Transferencia):</span>
            <span className="font-mono">C$ {(ventasTarjeta + ventasTransferencia).toFixed(2)}</span>
          </div>
        )}
        {egresosGastos > 0 && (
          <div className="flex justify-between text-rose-600 dark:text-rose-400">
            <span>(-) Salidas de Efectivo / Gastos del Turno:</span>
            <span className="font-mono font-bold">- C$ {egresosGastos.toFixed(2)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-black">
          <span className="text-slate-900 dark:text-white text-sm sm:text-base">
            Total Efectivo Físico a Entregar:
          </span>
          <span className="text-xl sm:text-2xl font-mono text-amber-600 dark:text-amber-400">
            C$ {totalEfectivoEsperado.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Auditoría: Clientes que Abonaron Durante este Turno */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-teal-500" />
            Clientes que abonaron durante este turno de caja ({abonosDetalle.length})
          </h3>
          <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
            Total Cobranza: C$ {cobranzaAbonos.toFixed(2)}
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
          {abonosDetalle.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No se registraron abonos a cuentas de crédito durante este turno.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5 text-right">Crédito Original</th>
                  <th className="px-4 py-2.5 text-right text-teal-600 dark:text-teal-400">Monto Abonado Hoy</th>
                  <th className="px-4 py-2.5 text-right">Saldo Restante Actual</th>
                  <th className="px-4 py-2.5 text-center">Hora Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {abonosDetalle.map((abono, idx) => (
                  <tr key={abono.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-2.5 font-sans">
                      <span className="font-bold text-slate-900 dark:text-white block">{abono.cliente_nombre}</span>
                      {abono.ticket_number && (
                        <span className="text-[10px] font-mono text-slate-400">{abono.ticket_number}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                      C$ {abono.credito_original.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-teal-600 dark:text-teal-400">
                      + C$ {abono.monto_abonado_hoy.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-300 font-semibold">
                      C$ {abono.saldo_restante_actual.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[10px] font-sans text-slate-400">
                      {abono.hora_pago ? new Date(abono.hora_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={cargando}
          onClick={onCancelar}
          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer disabled:opacity-50"
        >
          Volver a Turno
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={onConfirmarCierre}
          className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
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
