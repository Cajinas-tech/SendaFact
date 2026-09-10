import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Category, Product } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, warning } = useToast();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [preventDeleteModal, setPreventDeleteModal] = useState<{ name: string; count: number } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Load categories & products
  const loadData = () => {
    setCategories(storage.getCategories());
    setProducts(storage.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  // Count products associated with a category
  const getProductCount = (catId: number | string) => {
    return products.filter(p => String(p.category_id) === String(catId)).length;
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  // Handle Save (Create / Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanDesc = description.trim();

    if (!cleanName) {
      warning('Campo requerido', 'Por favor ingrese el nombre de la categoría');
      return;
    }

    if (editingCategory) {
      // Update
      const updated: Category = {
        ...editingCategory,
        name: cleanName.toUpperCase(),
        description: cleanDesc ? cleanDesc.toUpperCase() : `${cleanName.toUpperCase()} GENERAL`,
      };
      storage.saveCategory(updated);
      success('Categoría Actualizada', `"${cleanName.toUpperCase()}" se guardó correctamente.`);
    } else {
      // Create new
      const newCategory: Category = {
        id: Date.now(),
        code: Math.random().toString(36).substring(2, 10),
        name: cleanName.toUpperCase(),
        slug: cleanName.toLowerCase().replace(/\s+/g, '-'),
        description: cleanDesc ? cleanDesc.toUpperCase() : `${cleanName.toUpperCase()} GENERAL`,
        icon: 'folder',
        created_at: new Date().toISOString()
      };
      storage.saveCategory(newCategory);
      success('¡Categoría Creada!', `"${cleanName.toUpperCase()}" fue agregada exitosamente.`);
    }

    setModalOpen(false);
    loadData();
  };

  // Handle Delete Click
  const handleDeleteClick = (cat: Category) => {
    const associatedCount = getProductCount(cat.id);
    if (associatedCount > 0) {
      setPreventDeleteModal({
        name: cat.name,
        count: associatedCount
      });
      return;
    }
    setDeleteTarget(cat);
  };

  // Confirm Deletion
  const confirmDelete = () => {
    if (!deleteTarget) return;
    storage.deleteCategory(deleteTarget.id);
    warning('Categoría Eliminada', `"${deleteTarget.name}" fue eliminada del sistema.`);
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER & ACTION BAR */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0f172a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              CATEGORÍAS DE PRODUCTOS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organice y clasifique las existencias de su negocio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categorías..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      <div className="block md:hidden">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categorías..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CATEGORIES TABLE CARD */}
      <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ID / CÓDIGO
                </th>
                <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  NOMBRE
                </th>
                <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  DESCRIPCIÓN
                </th>
                <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  PRODUCTOS ASOC.
                </th>
                <th className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    No se encontraron categorías registradas.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const count = getProductCount(cat.id);
                  const displayCode = cat.code || `cat-${cat.id}`;
                  return (
                    <tr 
                      key={String(cat.id)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* ID / CÓDIGO */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {displayCode}
                        </span>
                      </td>

                      {/* NOMBRE */}
                      <td className="py-4 px-6">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                          {cat.name}
                        </span>
                      </td>

                      {/* DESCRIPCIÓN */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          {cat.description || `${cat.name} GENERAL`}
                        </span>
                      </td>

                      {/* PRODUCTOS ASOCIADOS */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center min-w-8 px-3.5 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                          {count}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-xl bg-blue-50/90 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 transition shadow-2xs hover:scale-105 cursor-pointer"
                            title="Editar Categoría"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            className="p-2 rounded-xl bg-red-50/90 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 transition shadow-2xs hover:scale-105 cursor-pointer"
                            title="Eliminar Categoría"
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

      {/* MODAL CREAR / EDITAR CATEGORÍA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* Nombre */}
                <div>
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-2 block uppercase">
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Bebidas, Abarrotes..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none uppercase"
                    autoFocus
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-wider mb-2 block uppercase">
                    DESCRIPCIÓN
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalle o notas de la categoría..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none uppercase resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  {editingCategory ? 'Actualizar Categoría' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="¿Eliminar Categoría?"
        message={`¿Está seguro de eliminar la categoría "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* PREVENT DELETE MODAL IF HAS PRODUCTS */}
      {preventDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                No se puede eliminar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                La categoría <strong className="text-slate-800 dark:text-slate-200">"{preventDeleteModal.name}"</strong> tiene <strong className="text-blue-600 dark:text-blue-400">{preventDeleteModal.count} producto(s)</strong> asociados. Debe reasignar o eliminar los productos antes de borrar esta categoría.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setPreventDeleteModal(null)}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
