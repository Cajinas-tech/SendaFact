import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  BookOpen, 
  X, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { storage, compressImageFile } from '../lib/storage';
import { Product, Category } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, warning, error, info } = useToast();

  // Modales
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    sku: '',
    price_cordobas: '',
    price_usd: '',
    cost_price: '',
    stock: '10',
    unit: 'UNIDAD',
    expiry_date: '',
    subtitle: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;
    return products.filter(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (cat && cat.name.toLowerCase().includes(term)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(term)) ||
        (p.unit && p.unit.toLowerCase().includes(term))
      );
    });
  }, [products, categories, searchTerm]);

  // Abrir Modal de Creación
  const openCreateModal = () => {
    setFormData({
      name: '',
      category_id: categories[0]?.id || 1,
      sku: '#SKU-' + Math.floor(1000 + Math.random() * 9000),
      price_cordobas: '',
      price_usd: '',
      cost_price: '',
      stock: '10',
      unit: 'UNIDAD',
      expiry_date: '',
      subtitle: '',
      image_url: ''
    });
    setImagePreview(null);
    setCreateModal(true);
  };

  // Abrir Modal de Edición
  const openEditModal = (p: Product) => {
    setCurrentProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      sku: p.sku,
      price_cordobas: String(p.price_cordobas),
      price_usd: String(p.price_usd),
      cost_price: String(p.cost_price),
      stock: String(p.stock),
      unit: p.unit || 'UNIDAD',
      expiry_date: p.expiry_date ? p.expiry_date.substring(0, 10) : '',
      subtitle: p.subtitle || '',
      image_url: p.image_url || ''
    });
    setImagePreview(p.image_url || null);
    setEditModal(true);
  };

  // Manejador de selección de imagen con compresión
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, 600, (dataUrl) => {
        setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, image_url: dataUrl }));
      });
    }
  };

  // Guardar Nuevo Producto
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price_cordobas) {
      alert('Por favor complete el nombre y precio en córdobas');
      return;
    }

    const priceCordobas = parseFloat(formData.price_cordobas);
    const priceUsd = formData.price_usd ? parseFloat(formData.price_usd) : parseFloat((priceCordobas / 36.80).toFixed(2));
    const fallbackSvg = formData.name.toLowerCase().includes('ventana') 
      ? '/images/products/ventana-aluminio.svg' 
      : '/images/products/puerta-aluminio.svg';

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name.toUpperCase(),
      category_id: Number(formData.category_id),
      sku: formData.sku || ('#SKU-' + Math.floor(1000 + Math.random() * 9000)),
      price_cordobas: priceCordobas,
      price_usd: priceUsd,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
      stock: parseInt(formData.stock || '10', 10),
      unit: formData.unit || 'UNIDAD',
      subtitle: formData.subtitle || `${formData.unit || 'UNIDAD'} • TERMINADO`,
      image_url: formData.image_url || fallbackSvg,
      is_finished_good: true,
      status: 'active',
      expiry_date: formData.expiry_date || '2026-09-05',
      updated_at: new Date().toISOString()
    };

    const updated = [newProduct, ...products];
    storage.setProducts(updated);
    setProducts(updated);
    setCreateModal(false);
    success('¡Producto Registrado!', `${newProduct.name} se agregó al inventario correctamente`);
  };

  // Actualizar Producto Existente
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.id) return;

    const priceCordobas = parseFloat(formData.price_cordobas);
    const priceUsd = formData.price_usd ? parseFloat(formData.price_usd) : parseFloat((priceCordobas / 36.80).toFixed(2));

    const updated = products.map(p => {
      if (p.id === currentProduct.id) {
        return {
          ...p,
          name: formData.name.toUpperCase(),
          category_id: Number(formData.category_id),
          sku: formData.sku,
          price_cordobas: priceCordobas,
          price_usd: priceUsd,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          stock: parseInt(formData.stock || '0', 10),
          unit: formData.unit || 'UNIDAD',
          subtitle: formData.subtitle || `${formData.unit || 'UNIDAD'} • TERMINADO`,
          image_url: formData.image_url || p.image_url,
          expiry_date: formData.expiry_date || p.expiry_date || '2026-09-05',
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    storage.setProducts(updated);
    setProducts(updated);
    setEditModal(false);
    success('¡Producto Actualizado!', `${formData.name.toUpperCase()} se modificó con éxito`);
  };

  // Eliminar Producto
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    const updated = products.filter(p => p.id !== id);
    storage.setProducts(updated);
    setProducts(updated);
    warning('Producto Eliminado', `"${name}" fue retirado permanentemente del catálogo`);
    setDeleteTarget(null);
  };

  // Exportar CSV
  const handleExportCSV = () => {
    info('Exportación Iniciada', 'Generando y descargando archivo CSV...');
    const headers = ['ID,SKU,NOMBRE,CATEGORIA,PRECIO_C$,PRECIO_USD,COSTO_C$,STOCK,SUBTITULO'];
    const rows = products.map(p => {
      const cat = categories.find(c => c.id === p.category_id)?.name || 'GENERAL';
      return `"${p.id}","${p.sku}","${p.name}","${cat}","${p.price_cordobas}","${p.price_usd}","${p.cost_price}","${p.stock}","${p.subtitle || ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `productos_sendafact_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTION BAR */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Gestión de Productos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestione el catálogo de ventas, imágenes y precios de sus artículos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4 w-20">IMAGEN</th>
                <th className="p-4 w-28">CÓDIGO</th>
                <th className="p-4 min-w-[220px]">NOMBRE</th>
                <th className="p-4 text-center">CATEGORÍA</th>
                <th className="p-4 font-black">PRECIO</th>
                <th className="p-4 text-center">STOCK</th>
                <th className="p-4 text-center">FECHA VENC.</th>
                <th className="p-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find(c => c.id === p.category_id);
                  const fallbackSvg = p.name.toLowerCase().includes('ventana') 
                    ? '/images/products/ventana-aluminio.svg' 
                    : '/images/products/puerta-aluminio.svg';
                  const imgSrc = p.image_url || fallbackSvg;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      
                      {/* IMAGEN */}
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shadow-2xs">
                          <img
                            src={imgSrc}
                            alt={p.name}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>

                      {/* CÓDIGO */}
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {p.sku}
                      </td>

                      {/* NOMBRE */}
                      <td className="p-4">
                        <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight">
                          {p.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                          {p.subtitle || 'UNIDAD • TERMINADO'}
                        </p>
                      </td>

                      {/* CATEGORÍA */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 tracking-wider">
                          {cat?.name || 'GENERAL'}
                        </span>
                      </td>

                      {/* PRECIO */}
                      <td className="p-4 font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                        C${parseFloat(p.price_cordobas as any || 0).toFixed(2)}
                      </td>

                      {/* STOCK */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {p.stock}
                        </span>
                      </td>

                      {/* FECHA */}
                      <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                        {p.expiry_date || '2026-09-05'}
                      </td>

                      {/* ACCIONES */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs"
                            title="Editar producto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-2xs cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR PRODUCTO */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Registrar Nuevo Producto</h3>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. PUERTA DE ALUMINIO-VIDRIO"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold outline-none"
                  />
                </div>

                {/* Subir Imagen */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Imagen del Producto (JPG, PNG, WEBP)
                  </label>
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleImageChange}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Selecciona una imagen en formato JPG o PNG desde tu dispositivo.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="#SKU-9859"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta (C$ Córdobas)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_cordobas}
                    onChange={(e) => setFormData({ ...formData, price_cordobas: e.target.value })}
                    placeholder="28.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Costo Unitario (C$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                {/* UNIDAD DE MEDIDA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  >
                    <option value="UNIDAD">UNIDAD</option>
                    <option value="CAJA">CAJA</option>
                    <option value="TRES LITROS">TRES LITROS</option>
                    <option value="DOS LITROS">DOS LITROS</option>
                    <option value="UN LITRO">UN LITRO</option>
                    <option value="MEDIO LITRO">MEDIO LITRO</option>
                    <option value="LIBRA">LIBRA</option>
                    <option value="ONZA">ONZA</option>
                  </select>
                </div>

                {/* FECHA DE VENCIMIENTO */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Subtítulo / Unidad / Medidas</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ej. BEBIDA GASEOSA"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Editar Producto</h3>
              </div>
              <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold outline-none"
                  />
                </div>

                {/* Subir Imagen */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Imagen del Producto (JPG, PNG)
                  </label>
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleImageChange}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Selecciona una nueva foto para reemplazar la imagen del producto.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Precio Venta (C$ Córdobas)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_cordobas}
                    onChange={(e) => setFormData({ ...formData, price_cordobas: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Costo Unitario (C$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none"
                  />
                </div>

                {/* UNIDAD DE MEDIDA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  >
                    <option value="UNIDAD">UNIDAD</option>
                    <option value="CAJA">CAJA</option>
                    <option value="TRES LITROS">TRES LITROS</option>
                    <option value="DOS LITROS">DOS LITROS</option>
                    <option value="UN LITRO">UN LITRO</option>
                    <option value="MEDIO LITRO">MEDIO LITRO</option>
                    <option value="LIBRA">LIBRA</option>
                    <option value="ONZA">ONZA</option>
                  </select>
                </div>

                {/* FECHA DE VENCIMIENTO */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Subtítulo / Unidad / Medidas</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ej. BEBIDA GASEOSA"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase shadow-md shadow-blue-500/25"
                >
                  Actualizar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación Animado */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Producto del Catálogo?"
        itemName={deleteTarget?.name}
        message="¿Estás seguro de que deseas eliminar permanentemente este producto? Se removerá del inventario y del catálogo de ventas (POS)."
        confirmText="Sí, Eliminar Producto"
        cancelText="Cancelar"
        type="danger"
      />

    </div>
  );
}
