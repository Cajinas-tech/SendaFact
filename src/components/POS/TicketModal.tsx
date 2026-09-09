import React, { useEffect } from 'react';
import { Printer, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  saleId: number;
  totalCordobas: number;
}

export default function TicketModal({ isOpen, onClose, ticketNumber, saleId, totalCordobas }: TicketModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 bg-white dark:bg-[#0b1329] text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            ¡Venta Registrada!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            La transacción se completó con éxito.
          </p>
        </div>

        {/* Ticket Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Ticket / Factura:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">{ticketNumber}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>ID de Operación:</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">#{saleId}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="font-bold text-slate-800 dark:text-white uppercase">Monto Total:</span>
            <span className="text-lg font-black font-mono text-emerald-500">
              C$ {totalCordobas.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket Térmico</span>
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
