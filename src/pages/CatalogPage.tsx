import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Printer, 
  Paperclip, 
  Check, 
  Package, 
  ExternalLink 
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Product, Category } from '../types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
      const term = search.toLowerCase().trim();
      const matchSearch = !term || 
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            Catálogo Digital de Productos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fichas técnicas y comerciales con fotos, medidas y descripciones para mostrar o enviar a clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Vista en Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Print PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 text-xs font-extrabold transition shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU, medidas..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(String(c.id))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
                selectedCategory === String(c.id)
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const fallbackSvg = (product.name && product.name.toLowerCase().includes('ventana'))
              ? '/images/products/ventana-aluminio.svg'
              : '/images/products/puerta-aluminio.svg';
            const imgSrc = product.image_url || fallbackSvg;
            const priceCordobas = parseFloat(product.price_cordobas as any || 0);
            const priceUsd = parseFloat(product.price_usd as any || (priceCordobas / 36.80));

            return (
              <div
                key={product.id}
                className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col justify-between group hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 bg-white dark:bg-[#0f172a]"
              >
                <div className="p-6 pb-2 relative flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> {product.stock} en Stock
                    </span>
                  </div>

                  <div className="w-full h-48 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; }}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-900/80 text-blue-200 border border-blue-700/50">
                      {product.sku}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase leading-snug">
                      {product.name}
                    </h3>

                    {product.subtitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{product.subtitle}</span>
                      </div>
                    )}

                    {product.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PRECIO VENTA</span>
                      <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        C$ {priceCordobas.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                        ≈ ${priceUsd.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">SKU / Medidas</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-right">Precio (C$)</th>
                  <th className="p-4 text-right">Precio (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const fallbackSvg = (p.name && p.name.toLowerCase().includes('ventana'))
                    ? '/images/products/ventana-aluminio.svg'
                    : '/images/products/puerta-aluminio.svg';
                  const imgSrc = p.image_url || fallbackSvg;
                  const cat = categories.find((c) => c.id === p.category_id);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; }}
                          className="w-10 h-10 object-contain rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
                        />
                        <div>
                          <p>{p.name}</p>
                          <span className="text-[11px] text-slate-400 font-normal">{p.subtitle}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {p.sku} {p.dimensions ? `• ${p.dimensions}` : ''}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {cat?.name || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                        C$ {parseFloat(p.price_cordobas as any || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-400">
                        ${parseFloat(p.price_usd as any || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
