import React from 'react';
import { Trash2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmColor?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Ambient Top Glow Effect */}
        <div 
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-32 blur-3xl opacity-25 rounded-full pointer-events-none ${
            isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
          }`} 
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Icon Container */}
        <div className="pt-2">
          <div 
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-xl transition-transform hover:scale-105 ${
              isDanger
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-rose-500/20'
                : isWarning
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-amber-500/20'
                : 'bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-blue-500/20'
            }`}
          >
            {isDanger && <Trash2 className="w-8 h-8 stroke-[2.2] animate-bounce-subtle" />}
            {isWarning && <AlertTriangle className="w-8 h-8 stroke-[2.2]" />}
            {!isDanger && !isWarning && <Info className="w-8 h-8 stroke-[2.2]" />}
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          
          {itemName && (
            <div className="inline-block max-w-full px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
              {itemName}
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            {message || '¿Estás seguro de continuar con esta operación? Esta acción no se puede deshacer.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            {isDanger && <Trash2 className="w-4 h-4" />}
            {isWarning && <ShieldAlert className="w-4 h-4" />}
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
