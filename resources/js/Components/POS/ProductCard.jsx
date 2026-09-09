import React from 'react';
import { Plus } from 'lucide-react';

export default function ProductCard({ product, onAdd }) {
    const fallbackSvg = (product.name && product.name.toLowerCase().includes('ventana')) 
        ? '/images/products/ventana-aluminio.svg' 
        : '/images/products/puerta-aluminio.svg';

    const imgSrc = product.image_url || fallbackSvg;
    const priceCordobas = parseFloat(product.price_cordobas || 0);
    const priceUsd = parseFloat(product.price_usd || (priceCordobas / 36.80));

    return (
        <div 
            onClick={() => onAdd(product)}
            className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group bg-white dark:bg-slate-900 select-none relative overflow-hidden"
        >
            <div className="space-y-2">
                <div className="h-24 sm:h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 relative overflow-hidden">
                    <img 
                        src={imgSrc} 
                        alt={product.name}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; }}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs" 
                    />
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white p-1 rounded-lg shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {product.sku || '#SKU-' + product.id}
                    </span>
                    {product.stock !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700'}`}>
                            Stock: {product.stock}
                        </span>
                    )}
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase line-clamp-2 leading-tight">
                    {product.name}
                </h4>
            </div>

            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">
                    C${priceCordobas.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                    ≈ ${priceUsd.toFixed(2)}
                </span>
            </div>
        </div>
    );
}
