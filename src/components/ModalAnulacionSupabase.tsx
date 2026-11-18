import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/storage';
import { Sale } from '../types';
import {
  Lock,
  ShieldAlert,
  X,
  AlertTriangle,
  FileText,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  PackageCheck,
  Check
} from 'lucide-react';

export interface ModalAnulacionProps {
  facturaId: string | number;
  sale?: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_REASONS = [
  'Error en digitación de productos',
  'Devolución solicitada por cliente',
  'Factura duplicada en sistema',
  'Cambio en forma de pago'
];

export function ModalAnulacionSupabase({
  facturaId,
  sale,
  isOpen,
  onClose,
  onSuccess
}: ModalAnulacionProps) {
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const ejecutarAnulacionSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || !emailAdmin.trim() || !passwordAdmin.trim()) {
      return setErrorMsg('Todos los campos son obligatorios.');
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let rpcExecuted = false;

      // 1. Si Supabase está configurado, invocar la función RPC atómica
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.rpc('verficar_y_anular_factura', {
            p_factura_id: String(facturaId),
            p_motivo_anulacion: motivo.trim(),
            p_admin_email: emailAdmin.trim(),
            p_admin_password: passwordAdmin.trim()
          });

          if (error) {
            console.warn('Aviso Supabase RPC:', error.message);
            if (
              error.message.toLowerCase().includes('credenciales') ||
              error.message.toLowerCase().includes('password') ||
              error.message.toLowerCase().includes('no autorizado') ||
              error.message.toLowerCase().includes('denegado')
            ) {
              throw new Error(error.message);
            }
          } else {
            rpcExecuted = true;
          }
        } catch (rpcErr: any) {
          if (
            rpcErr.message &&
            (rpcErr.message.toLowerCase().includes('credenciales') ||
              rpcErr.message.toLowerCase().includes('password') ||
              rpcErr.message.toLowerCase().includes('no autorizado'))
          ) {
            throw rpcErr;
          }
          console.warn('Conexión Supabase RPC no disponible, procediendo con verificación de seguridad local:', rpcErr);
        }
      }

      // 2. Verificación de seguridad de Administrador en el sistema
      const users = storage.getUsers();
      const adminFound = users.find(
        (u) => u.email.toLowerCase() === emailAdmin.trim().toLowerCase() && u.role === 'admin'
      );

      if (!adminFound && !rpcExecuted) {
        throw new Error('El correo ingresado no pertenece a un usuario Administrador registrado en el sistema.');
      }

      // 3. Reversión atómica en almacenamiento local y reintegro de stock
      const sales = storage.getSales();
      const numericId = typeof facturaId === 'number' ? facturaId : parseInt(String(facturaId), 10);
      const targetSale = sale || sales.find((s) => s.id === numericId || s.ticket_number === String(facturaId));

      if (targetSale) {
        targetSale.status = 'cancelled';
        targetSale.cancellation_reason = motivo.trim();
        targetSale.cancelled_by = emailAdmin.trim();
        targetSale.cancelled_at = new Date().toISOString();
        storage.setSales(sales);

        // Devolución de stock al inventario
        if (targetSale.items && targetSale.items.length > 0) {
          const products = storage.getProducts();
          const updatedProducts = products.map((prod) => {
            const item = targetSale.items?.find((it) => it.product_id === prod.id);
            if (item) {
              return {
                ...prod,
                stock: (prod.stock || 0) + item.quantity
              };
            }
            return prod;
          });
          storage.setProducts(updatedProducts);

          // Registrar movimiento de auditoría en inventario
          targetSale.items.forEach((it) => {
            storage.addMovement({
              product_id: it.product_id,
              product_name: it.product_name,
              type: 'in',
              quantity: it.quantity,
              reason: `Reversión por anulación de factura ${targetSale.ticket_number || '#' + targetSale.id}: ${motivo.trim()} (Autorizado por: ${emailAdmin.trim()})`,
              created_at: new Date().toISOString()
            });
          });
        }
      }

      // Limpiar formulario y notificar
      setEmailAdmin('');
      setPasswordAdmin('');
      setMotivo('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación o permisos.');
    } finally {
      setLoading(false);
    }
  };

  const totalItemsCount = sale?.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-[150] overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative bg-white dark:bg-[#0b1222] rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 my-auto overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Decoración Superior con Acento Rojo */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />

        {/* Header Principal */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/25">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Autorización de Anulación
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                  Supabase RPC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reversión atómica y reintegro inmediato de stock a inventario
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 disabled:opacity-40"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={ejecutarAnulacionSupabase} className="p-5 sm:p-6 space-y-4">
          
          {/* Tarjeta de Resumen de Factura */}
          {sale && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Factura Seleccionada
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      {sale.ticket_number || `#FACT-${sale.id}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Facturado
                  </span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                    C$ {(sale.total_cordobas || 0).toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[200px]">
                  Cliente: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{sale.customer?.name || (sale as any).customer_name || 'Consumidor Final'}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  <PackageCheck className="w-3.5 h-3.5" />
                  {totalItemsCount} {totalItemsCount === 1 ? 'unidad a reintegrar' : 'unidades a reintegrar'}
                </span>
              </div>
            </div>
          )}

          {/* Alerta Informativa */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-950/25 rounded-2xl border border-amber-500/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
              Esta acción modificará el inventario reintegrando las existencias vendidas y anulará el comprobante de forma definitiva.
            </p>
          </div>

          {/* Campo: Motivo de Anulación */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Motivo de Anulación <span className="text-rose-500">*</span>
            </label>
            <textarea
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition leading-relaxed"
              rows={2}
              placeholder="Escriba el motivo detallado de anulación o seleccione uno rápido..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />

            {/* Sugerencias Rápidas de Motivo */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Rápido:
              </span>
              {QUICK_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setMotivo(reason)}
                  className={`text-[10.5px] px-2.5 py-1 rounded-xl font-medium transition cursor-pointer border ${
                    motivo === reason
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200/60 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Credenciales de Administrador (Grid Compacto 2 Columnas) */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Credenciales de Autorización (Administrador)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Correo Administrador */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                    placeholder="admin@sendasistemas.com"
                    value={emailAdmin}
                    onChange={(e) => setEmailAdmin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contraseña Administrador */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Contraseña <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                    placeholder="••••••••"
                    value={passwordAdmin}
                    onChange={(e) => setPasswordAdmin(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Auditoría con Supabase
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Autorizar y Anular</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}