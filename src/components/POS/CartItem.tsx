import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    sku: string;
    price_cordobas: number;
    price_usd: number;
    quantity: number;
  };
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  const totalItemCordobas = item.price_cordobas * item.quantity;

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 gap-3 group">
      {/* Product Name and Unit Price */}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">
          {item.name}
        </h5>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono font-medium text-slate-400">
            C$ {item.price_cordobas.toFixed(2)} c/u
          </span>
          <span className="text-[10px] font-mono font-bold text-blue-500">
            = C$ {totalItemCordobas.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => onDecrement(item.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 transition cursor-pointer"
          aria-label="Disminuir"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-xs font-black font-mono text-slate-900 dark:text-white">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onIncrement(item.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 transition cursor-pointer"
          aria-label="Aumentar"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        title="Eliminar de la orden"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
