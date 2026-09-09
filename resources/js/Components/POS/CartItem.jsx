import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
    const priceCordobas = parseFloat(item.price_cordobas || item.price || 0);
    const itemTotal = priceCordobas * item.quantity;

    return (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 transition-all">
            <div className="min-w-0 flex-1">
                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase truncate">
                    {item.name}
                </h5>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        C${priceCordobas.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">× {item.quantity}</span>
                    <span className="text-[11px] font-mono font-black text-slate-800 dark:text-slate-200">
                        = C${itemTotal.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-2xs">
                    <button 
                        type="button"
                        onClick={() => onDecrement(item.id)}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Disminuir"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {item.quantity}
                    </span>
                    <button 
                        type="button"
                        onClick={() => onIncrement(item.id)}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Aumentar"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                <button 
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    title="Eliminar del carrito"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
