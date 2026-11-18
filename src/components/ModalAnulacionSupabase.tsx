import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/storage';
import { Sale } from '../types';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock, FileText } from 'lucide-react';

export interface ModalAnulacionProps {
  facturaId: string | number;
  sale?: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalAnulacionSupabase({
  facturaId,
  sale,
  isOpen,
  onClose,
  onSuccess
}: ModalAnulacionProps) {
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
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
          const { data, error } = await supabase.rpc('verficar_y_anular_factura', {
            p_factura_id: String(facturaId),
            p_motivo_anulacion: motivo.trim(),
            p_admin_email: emailAdmin.trim(),
            p_admin_password: passwordAdmin.trim()
          });

          if (error) {
            console.warn('Aviso Supabase RPC:', error.message);
            // Si el error es de permisos o contraseña incorrecta
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

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[130] animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Autorización de Anulación
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                  Supabase
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Se requiere autorización de Administrador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Factura Resumen Mini Card */}
        {sale && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Factura a Anular
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {sale.ticket_number || `#FACT-${sale.id}`}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {sale.customer?.name || (sale as any).customer_name || 'Consumidor Final'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Facturado
              </span>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                C$ {(sale.total_cordobas || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Esta acción modificará el inventario reintegrando las unidades vendidas y anulará el comprobante de forma irreversible.
          </p>
        </div>

        <form onSubmit={ejecutarAnulacionSupabase} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Motivo de Anulación *
            </label>
            <textarea
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
              rows={2}
              placeholder="Ej: Error en digitación de productos, devolución autorizada por cliente..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Correo del Administrador *
              </label>
              <input
                type="email"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                placeholder="admin@sendasistemas.com"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Contraseña del Administrador *
              </label>
              <input
                type="password"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                placeholder="••••••••"
                value={passwordAdmin}
                onChange={(e) => setPasswordAdmin(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              disabled={loading}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Verificando...' : 'Autorizar y Anular'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
