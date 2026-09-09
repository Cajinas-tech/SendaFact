import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  // Safe fallback if price is null or string
  const priceCordobas = typeof product.price_cordobas === 'number' 
    ? product.price_cordobas 
    : parseFloat(product.price_cordobas as any || '0');
    
  const priceUsd = typeof product.price_usd === 'number'
    ? product.price_usd
    : (priceCordobas / 36.80);

  const isLowStock = product.stock <= (product.min_stock || 5);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onAdd(product)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0b1329] border transition-all duration-200 cursor-pointer overflow-hidden ${
        isOutOfStock
          ? 'opacity-60 border-slate-200 dark:border-slate-800 pointer-events-none'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5'
      }`}
    >
      {/* Stock status badge */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
          {product.sku || 'SKU-N/A'}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
            isOutOfStock
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              : isLowStock
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}
        >
          {isOutOfStock ? 'Agotado' : `${product.stock} ${product.unit || 'und'}`}
        </span>
      </div>

      {/* Product Image or Fallback */}
      <div className="relative w-full h-28 rounded-xl bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center overflow-hidden mb-2.5">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
            <Package className="w-8 h-8 stroke-[1.5]" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Sin Foto</span>
          </div>
        )}

        {/* Quick Add Overlay on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
          {product.name}
        </h4>
        
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
              C$ {priceCordobas.toFixed(2)}
            </span>
            <span className="block text-[10px] text-slate-400 font-mono font-medium">
              ≈ ${priceUsd.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
