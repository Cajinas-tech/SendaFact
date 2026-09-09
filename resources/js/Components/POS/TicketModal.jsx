import React from 'react';
import { Check, Printer, X } from 'lucide-react';

export default function TicketModal({ isOpen, onClose, ticketNumber, saleId, totalCordobas }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <Check className="w-8 h-8" />
                </div>

                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        ¡Venta Exitosa!
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        Ticket: #{ticketNumber}
                    </p>
                </div>

                <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Cobrado</span>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                        C${parseFloat(totalCordobas || 0).toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <a 
                        href={`/pos/ticket/${saleId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Ticket</span>
                    </a>
                    <button 
                        onClick={onClose} 
                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
