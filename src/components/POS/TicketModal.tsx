import React, { useEffect, useState } from 'react';
import { Printer, CheckCircle2, X, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sale, CompanySetting } from '../../types';
import { storage } from '../../lib/storage';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  saleId: number;
  totalCordobas: number;
  sale?: Sale | null;
}

export default function TicketModal({ 
  isOpen, 
  onClose, 
  ticketNumber, 
  saleId, 
  totalCordobas,
  sale
}: TicketModalProps) {
  const [company, setCompany] = useState<CompanySetting | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCompany(storage.getCompanySettings());
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exchangeRate = company?.exchange_rate || 36.80;
  const totalUsd = totalCordobas / exchangeRate;
  const saleDate = sale?.created_at ? new Date(sale.created_at) : new Date();
  const formattedDate = saleDate.toLocaleDateString('es-NI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-md glass-card rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 bg-white dark:bg-[#0b1329] my-auto">
        
        {/* Modal Top Header (No print) */}
        <div className="no-print flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ¡Venta Realizada con Éxito!
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE TICKET CONTAINER */}
        <div 
          id="printable-ticket" 
          className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs shadow-inner space-y-3"
        >
          {/* Header & Company Logo */}
          <div className="text-center space-y-1.5 pb-2">
            {company?.logo ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={company.logo} 
                  alt={company.name || 'Logo de la Empresa'} 
                  className="max-h-16 max-w-[180px] object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-1">
                <Building2 className="w-5 h-5" />
              </div>
            )}

            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {company?.name || 'SENDAFACT POS'}
            </h2>

            {company?.ruc && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                RUC: {company.ruc}
              </p>
            )}

            {company?.phone && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Tel: {company.phone}
              </p>
            )}

            {company?.address && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {company.address}
              </p>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>TICKET / FACTURA:</span>
              <span>{ticketNumber}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Fecha & Hora:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Cajero(a):</span>
              <span>{sale?.user_name || 'Administrador'}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Cliente:</span>
              <span className="font-semibold">{sale?.customer?.name || 'Cliente General'}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Forma de Pago:</span>
              <span className="uppercase font-semibold">{sale?.payment_method || 'Efectivo'}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 pb-1">
              <span>Cant. / Detalle</span>
              <span>Total</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              {sale?.items && sale.items.length > 0 ? (
                sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white leading-tight">
                        {item.quantity}x {item.product_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        @ C$ {item.unit_price_cordobas.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      C$ {item.total_cordobas.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center">
                  <span>1x Venta de Productos</span>
                  <span className="font-bold">C$ {totalCordobas.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grand Total Highlight */}
          <div className="border-t-2 border-slate-800 dark:border-slate-300 pt-2.5 space-y-1 text-right">
            <div className="flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-white">
              <span className="uppercase text-xs tracking-wider">TOTAL A PAGAR:</span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400">
                C$ {totalCordobas.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
              <span>Equivalente en USD:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                $ {totalUsd.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <p className="font-bold uppercase tracking-wider">¡Gracias por su compra y preferencia!</p>
            <p>Sistema de Facturación SendaFact</p>
          </div>
        </div>

        {/* Action Buttons (No print) */}
        <div className="no-print space-y-2 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket / Factura</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Nueva Venta
          </button>
        </div>

      </div>
    </div>
  );
}
