import React, { useState, useEffect } from 'react';
import { Tag, X, Check } from 'lucide-react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseSubtotal: number;
  currentDiscountType: 'percentage' | 'fixed';
  currentDiscountValue: number;
  onApplyDiscount: (type: 'percentage' | 'fixed', value: number) => void;
}

export default function DiscountModal({
  isOpen,
  onClose,
  baseSubtotal,
  currentDiscountType,
  currentDiscountValue,
  onApplyDiscount
}: DiscountModalProps) {
  const [tab, setTab] = useState<'percentage' | 'fixed'>(currentDiscountType || 'percentage');
  const [percentValue, setPercentValue] = useState<string>(
    currentDiscountType === 'percentage' && currentDiscountValue > 0 ? String(currentDiscountValue) : ''
  );
  const [fixedValue, setFixedValue] = useState<string>(
    currentDiscountType === 'fixed' && currentDiscountValue > 0 ? String(currentDiscountValue) : ''
  );

  useEffect(() => {
    if (isOpen) {
      setTab(currentDiscountType || 'percentage');
      if (currentDiscountType === 'percentage') {
        setPercentValue(currentDiscountValue > 0 ? String(currentDiscountValue) : '');
        setFixedValue('');
      } else {
        setFixedValue(currentDiscountValue > 0 ? String(currentDiscountValue) : '');
        setPercentValue('');
      }
    }
  }, [isOpen, currentDiscountType, currentDiscountValue]);

  if (!isOpen) return null;

  const percentagePresets = [5, 10, 15, 20, 25, 30, 50];

  // Calculate estimated discount
  let estimatedDiscount = 0;
  if (tab === 'percentage') {
    const p = parseFloat(percentValue) || 0;
    estimatedDiscount = (baseSubtotal * Math.min(Math.max(p, 0), 100)) / 100;
  } else {
    const f = parseFloat(fixedValue) || 0;
    estimatedDiscount = Math.min(Math.max(f, 0), baseSubtotal);
  }

  const newSubtotal = Math.max(baseSubtotal - estimatedDiscount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'percentage') {
      const val = parseFloat(percentValue) || 0;
      onApplyDiscount('percentage', Math.min(Math.max(val, 0), 100));
    } else {
      const val = parseFloat(fixedValue) || 0;
      onApplyDiscount('fixed', Math.min(Math.max(val, 0), baseSubtotal));
    }
    onClose();
  };

  const handleClearDiscount = () => {
    onApplyDiscount('percentage', 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Aplicar Descuento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste el valor para esta venta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setTab('percentage')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'percentage'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>% Porcentaje (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('fixed')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'fixed'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>C$ Monto Fijo</span>
            </button>
          </div>

          {/* TAB 1: PERCENTAGE */}
          {tab === 'percentage' && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {percentagePresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentValue(String(pct))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition border cursor-pointer ${
                      percentValue === String(pct)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Input */}
              <div>
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-2 block uppercase">
                  PORCENTAJE DE DESCUENTO (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                    placeholder="Ej. 10"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIXED AMOUNT */}
          {tab === 'fixed' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-2 block uppercase">
                  MONTO DE DESCUENTO (C$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={baseSubtotal}
                    value={fixedValue}
                    onChange={(e) => setFixedValue(e.target.value)}
                    placeholder="Ej. 50.00"
                    className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">
                    C$
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>Subtotal base:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                C$ {baseSubtotal.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
              <span>Descuento estimado:</span>
              <span className="font-mono">
                -C$ {estimatedDiscount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Nuevo Subtotal:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                C$ {newSubtotal.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {estimatedDiscount > 0 && (
              <button
                type="button"
                onClick={handleClearDiscount}
                className="mr-auto text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline transition cursor-pointer"
              >
                Quitar Descuento
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>APLICAR DESCUENTO</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
