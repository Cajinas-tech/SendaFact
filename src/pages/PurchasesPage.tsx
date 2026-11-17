import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  Calendar,
  Building2,
  FileText,
  DollarSign,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  X,
  CreditCard,
  Banknote,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Clock,
  AlertCircle,
  Upload,
  Check,
  Eye,
  RotateCcw
} from 'lucide-react';
import { storage, compressImageFile } from '../lib/storage';
import { Product, Supplier, Category, Purchase, PurchaseItem, CashRegister } from '../types';
import { useToast } from '../components/UI/Toast';
import ConfirmModal from '../components/UI/ConfirmModal';

export const PurchasesPage: React.FC = () => {
  // Pestaña activa: 'REGISTRO' o 'HISTORIAL'
  const [activeTab, setActiveTab] = useState<'REGISTRO' | 'HISTORIAL'>('REGISTRO');

  // Datos del sistema
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);

  const { success, warning, error, info } = useToast();

  // Estado del Formulario de Compra (Imágenes 1 y 2)
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentCondition, setPaymentCondition] = useState<'contado' | 'credito'>('contado');
  const [paymentSource, setPaymentSource] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [creditDueDate, setCreditDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [observations, setObservations] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  // Artículos en la tabla interactiva
  const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);

  // Buscador de productos
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modales
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Estado del Formulario Nuevo Producto (Imágenes 3 y 4)
  const [newProductForm, setNewProductForm] = useState({
    sku: '',
    barcode: '',
    name: '',
    category_id: 1,
    unit: 'Unidad',
    tipo: 'Producto Terminado',
    price_cordobas: 0,
    cost_price: 0,
    stock: 0,
    min_stock: 5,
    expiry_date: '',
    measurements_spec: '',
    alto: '',
    ancho: '',
    espesor: '',
    description: '',
    specifications: '',
    image_url: ''
  });
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

  // Cargar datos
  const loadData = () => {
    const prods = storage.getProducts();
    const sups = storage.getSuppliers();
    const cats = storage.getCategories();
    const purchs = storage.getPurchases();
    const cash = storage.getActiveCashRegister();

    setProducts(prods);
    setSuppliers(sups);
    setCategories(cats);
    setPurchases(purchs);
    setCashRegister(cash);

    if (sups.length > 0 && supplierId === '') {
      setSupplierId(sups[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de productos para el buscador en tiempo real
  const searchResults = useMemo(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.toLowerCase().includes(term))
    ).slice(0, 8);
  }, [products, productSearch]);

  // Cálculos de Totales
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  }, [cartItems]);

  const taxIva = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.apply_iva) {
        return sum + (item.unit_cost * item.quantity * 0.15);
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const totalNeto = useMemo(() => {
    return Math.max(0, subtotal - (Number(discount) || 0) + taxIva);
  }, [subtotal, discount, taxIva]);

  // Agregar producto al detalle
  const handleAddProductToCart = (prod: Product) => {
    const existsIdx = cartItems.findIndex(item => item.product_id === prod.id);
    if (existsIdx >= 0) {
      const updated = [...cartItems];
      updated[existsIdx].quantity += 1;
      updated[existsIdx].subtotal = updated[existsIdx].quantity * updated[existsIdx].unit_cost;
      setCartItems(updated);
      info(`Cantidad de "${prod.name}" incrementada a ${updated[existsIdx].quantity}`);
    } else {
      const cat = categories.find(c => c.id === prod.category_id);
      const newItem: PurchaseItem = {
        id: Date.now() + Math.random(),
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        category_name: cat ? cat.name : 'General',
        current_stock: prod.stock || 0,
        unit_cost: prod.cost_price || 0,
        quantity: 1,
        apply_iva: true,
        sale_price: prod.price_cordobas || 0,
        subtotal: prod.cost_price || 0,
        lot_number: '',
        expiry_date: prod.expiry_date || ''
      };
      setCartItems([newItem, ...cartItems]);
      success(`"${prod.name}" agregado a la orden`);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Actualizar ítem en la tabla
  const handleUpdateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updated = [...cartItems];
    const item = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_cost') {
      const q = field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
      const c = field === 'unit_cost' ? Math.max(0, Number(value) || 0) : item.unit_cost;
      item.quantity = q;
      item.unit_cost = c;
      item.subtotal = q * c;
    }
    
    updated[index] = item;
    setCartItems(updated);
  };

  // Eliminar ítem del detalle
  const handleRemoveItem = (index: number) => {
    const item = cartItems[index];
    setCartItems(cartItems.filter((_, i) => i !== index));
    info(`"${item.product_name}" removido de la orden`);
  };

  // Limpiar / Cancelar Orden
  const handleCancelOrder = () => {
    setCartItems([]);
    setInvoiceNumber('');
    setObservations('');
    setDiscount(0);
    setPaymentCondition('contado');
    setPaymentSource('efectivo');
    setShowCancelConfirm(false);
    info('Orden de compra reiniciada');
  };

  // Procesar Compra
  const handleProcessPurchase = (status: 'completed' | 'draft' = 'completed') => {
    if (!supplierId) {
      warning('Seleccione el proveedor de la mercancía');
      return;
    }
    if (cartItems.length === 0) {
      warning('Agregue al menos un producto a la tabla de compra');
      return;
    }

    const selectedSup = suppliers.find(s => s.id === Number(supplierId));
    const invNum = invoiceNumber.trim() || `FAC-AUTO-${Date.now().toString().slice(-6)}`;

    const newPurchase: Purchase = {
      id: Date.now(),
      invoice_number: invNum,
      supplier_id: Number(supplierId),
      supplier_name: selectedSup ? (selectedSup.company_name || selectedSup.name || 'Proveedor') : 'Proveedor',
      supplier_ruc: selectedSup?.ruc,
      purchase_date: purchaseDate,
      payment_condition: paymentCondition,
      payment_source: paymentCondition === 'contado' ? paymentSource : 'credito',
      due_date: paymentCondition === 'credito' ? creditDueDate : undefined,
      subtotal,
      discount: Number(discount) || 0,
      tax_iva: taxIva,
      total_neto: totalNeto,
      observations: observations.trim(),
      status,
      items: cartItems,
      user_name: 'Administrador',
      created_at: new Date().toISOString()
    };

    try {
      storage.savePurchase(newPurchase);
      loadData();

      if (status === 'completed') {
        success(`¡Compra procesada con éxito! Se abasteció el inventario y se registraron los movimientos en Kardex.`);
      } else {
        info(`Borrador de compra guardado correctamente`);
      }

      // Reiniciar estado
      setCartItems([]);
      setInvoiceNumber('');
      setObservations('');
      setDiscount(0);
    } catch (err) {
      error('Ocurrió un error al procesar la compra');
      console.error(err);
    }
  };

  // Abrir Modal Nuevo Producto con SKU generado
  const openNewProductDialog = () => {
    const randomSkuNum = Math.floor(1000 + Math.random() * 9000);
    setNewProductForm({
      sku: `SKU-${randomSkuNum}`,
      barcode: '',
      name: '',
      category_id: categories.length > 0 ? Number(categories[0].id) : 1,
      unit: 'Unidad',
      tipo: 'Producto Terminado',
      price_cordobas: 0,
      cost_price: 0,
      stock: 0,
      min_stock: 5,
      expiry_date: '',
      measurements_spec: '',
      alto: '',
      ancho: '',
      espesor: '',
      description: '',
      specifications: '',
      image_url: ''
    });
    setProductImagePreview(null);
    setShowNewProductModal(true);
  };

  // Manejador de carga de imagen para el nuevo producto
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, 600, (dataUrl) => {
        setProductImagePreview(dataUrl);
        setNewProductForm(prev => ({ ...prev, image_url: dataUrl }));
      });
    }
  };

  // Guardar Nuevo Producto desde el Modal (Imágenes 3 y 4)
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      warning('El nombre del producto es obligatorio');
      return;
    }
    if (!newProductForm.sku.trim()) {
      warning('El código SKU es obligatorio');
      return;
    }

    const createdProduct: Product = {
      id: Date.now(),
      category_id: Number(newProductForm.category_id),
      sku: newProductForm.sku.trim().toUpperCase(),
      barcode: newProductForm.barcode.trim() || undefined,
      name: newProductForm.name.trim(),
      subtitle: `${newProductForm.tipo} • ${newProductForm.unit}`,
      description: newProductForm.description.trim() || undefined,
      dimensions: newProductForm.measurements_spec.trim() || undefined,
      measurements_spec: newProductForm.measurements_spec.trim() || undefined,
      cost_price: Number(newProductForm.cost_price) || 0,
      price_cordobas: Number(newProductForm.price_cordobas) || 0,
      price_usd: Number(((Number(newProductForm.price_cordobas) || 0) / 36.63).toFixed(2)),
      stock: Number(newProductForm.stock) || 0,
      min_stock: Number(newProductForm.min_stock) || 5,
      image_url: newProductForm.image_url || null,
      unit: newProductForm.unit,
      expiry_date: newProductForm.expiry_date || undefined,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    storage.saveProduct(createdProduct);
    loadData();
    setShowNewProductModal(false);
    success(`Producto "${createdProduct.name}" creado en el catálogo`);

    // Agregarlo inmediatamente a la orden de compra
    handleAddProductToCart(createdProduct);
  };

  // Exportar Compras a CSV
  const handleExportCSV = () => {
    if (purchases.length === 0) {
      warning('No hay compras registradas para exportar');
      return;
    }

    const headers = ['ID', 'N° FACTURA', 'PROVEEDOR', 'FECHA', 'CONDICION', 'ESTADO', 'SUBTOTAL (C$)', 'IVA (C$)', 'TOTAL NETO (C$)'];
    const rows = purchases.map(p => [
      p.id,
      `"${p.invoice_number}"`,
      `"${p.supplier_name}"`,
      p.purchase_date,
      p.payment_condition.toUpperCase(),
      p.status.toUpperCase(),
      p.subtotal.toFixed(2),
      p.tax_iva.toFixed(2),
      p.total_neto.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Registro_Compras_SendaFact_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Reporte de compras exportado en CSV');
  };

  // Imprimir comprobante
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. Header Card Principal: Registro de Compras e Insumos */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Título & Subtítulo */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-2xs shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  REGISTRO DE COMPRAS E INSUMOS
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Ingrese la factura de mercancía del proveedor para abastecer inventario y recalcular costos
              </p>
            </div>
          </div>

          {/* Badges de Estado y Botones CSV / PDF / Pestañas */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Badge Caja */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs font-black shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{cashRegister?.status === 'open' ? 'CAJA ABIERTA' : 'CAJA PRINCIPAL'}</span>
            </div>

            {/* Botón CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Exportar compras a Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            {/* Botón PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Imprimir formato o guardar PDF"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF</span>
            </button>

            {/* Pestañas: REGISTRO vs HISTORIAL */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => setActiveTab('REGISTRO')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'REGISTRO'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Nueva Compra
              </button>
              <button
                onClick={() => setActiveTab('HISTORIAL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'HISTORIAL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Historial ({purchases.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'REGISTRO' ? (
        <>
          {/* 2. CARD: [CABECERA DE FACTURA] (Fiel a Imágenes 1 y 2) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 sm:p-5 shadow-xs space-y-4">
            
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  [CABECERA DE FACTURA]
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                COMPRAS FISCALES DGI NICARAGUA
              </span>
            </div>

            {/* Fila Principal de Cabecera: Proveedor, N° Factura, Fecha, Condición de Pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Proveedor */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  PROVEEDOR <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none shadow-2xs pr-8"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.company_name || s.name} {s.ruc ? `(${s.ruc})` : ''}
                      </option>
                    ))}
                  </select>
                  <Building2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. N° Factura Física */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  N° FACTURA FÍSICA
                </label>
                <input
                  type="text"
                  placeholder="Ej. FAC-001-4500"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              {/* 3. Fecha de Compra */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  FECHA DE COMPRA
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 4. Condición de Pago: CONTADO vs CRÉDITO */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  CONDICIÓN DE PAGO
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setPaymentCondition('contado')}
                    className={`py-1.5 text-xs font-black uppercase tracking-tight rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentCondition === 'contado'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>CONTADO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCondition('credito')}
                    className={`py-1.5 text-xs font-black uppercase tracking-tight rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentCondition === 'credito'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>CRÉDITO</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Sub-Fila Condicional: Origen de Fondos (Contado) vs Vencimiento Crédito (Crédito) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {paymentCondition === 'contado' ? (
                /* Imagen 1: ORIGEN DE FONDOS */
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    ORIGEN DE FONDOS:
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentSource"
                      checked={paymentSource === 'efectivo'}
                      onChange={() => setPaymentSource('efectivo')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Efectivo (Caja Principal)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentSource"
                      checked={paymentSource === 'transferencia'}
                      onChange={() => setPaymentSource('transferencia')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Transferencia / Banco</span>
                  </label>
                </div>
              ) : (
                /* Imagen 2: VENCIMIENTO CRÉDITO */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      VENCIMIENTO CRÉDITO (CUENTAS POR PAGAR):
                    </span>
                    <input
                      type="date"
                      value={creditDueDate}
                      onChange={(e) => setCreditDueDate(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white shadow-2xs"
                    />
                  </div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Se enviará el saldo automáticamente al módulo de Cuentas por Pagar</span>
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* 3. CARD: Buscador de Productos & Botón + Nuevo Producto (Fiel a Imagen 1) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Buscador de Producto con Dropdown interactivo */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Escanear código de barras o escribir nombre del producto (Presione Enter para agregar)..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />

                {/* Dropdown de Resultados de Búsqueda */}
                {showProductDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProductToCart(p)}
                        className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-blue-50/70 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                      >
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>SKU: {p.sku}</span>
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                            <span>• Stock Actual: {p.stock}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono">
                            Costo: C${(p.cost_price || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            + Agregar a orden
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón + Nuevo Producto (Abre Modal de Imágenes 3 y 4) */}
              <button
                type="button"
                onClick={openNewProductDialog}
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 dark:border-blue-900/60 transition cursor-pointer shrink-0 active:scale-95 shadow-2xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Nuevo Producto</span>
              </button>

            </div>
          </div>

          {/* 4. CARD: TABLA INTERACTIVA DE DETALLE (Fiel a Imagen 1) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            
            {/* Header de la Tabla */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-850/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  TABLA INTERACTIVA DE DETALLE
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                  {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium italic hidden sm:inline">
                Edite cantidad o costo directamente en las celdas
              </span>
            </div>

            {/* Contenedor de Tabla con Scroll Horizontal */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                    <th className="py-3 px-5">PRODUCTO</th>
                    <th className="py-3 px-3 text-center">STOCK ACT.</th>
                    <th className="py-3 px-3 text-center">COSTO UNIT. (C$)</th>
                    <th className="py-3 px-3 text-center">CANTIDAD</th>
                    <th className="py-3 px-3 text-center">IVA 15%</th>
                    <th className="py-3 px-4 text-center">IMPACTO / PRECIO VENTA</th>
                    <th className="py-3 px-4 text-right">SUBTOTAL</th>
                    <th className="py-3 px-4 text-center">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-2.5">
                          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            <Package className="w-6 h-6 stroke-[1.8]" />
                          </div>
                          <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                            No hay productos agregados a la orden de compra.
                          </p>
                          <p className="text-xs text-slate-400">
                            Escanee un código SKU o escriba un nombre en el buscador superior.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, idx) => {
                      const margenPorc = item.sale_price && item.unit_cost > 0
                        ? (((item.sale_price - item.unit_cost) / item.unit_cost) * 100).toFixed(0)
                        : '0';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                          {/* 1. PRODUCTO */}
                          <td className="py-3 px-5 min-w-[200px]">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.product_name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>SKU: {item.sku || 'S/N'}</span>
                              <span>• {item.category_name}</span>
                            </div>
                          </td>

                          {/* 2. STOCK ACTUAL */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                              {item.current_stock}
                            </span>
                          </td>

                          {/* 3. COSTO UNIT. (C$) EDITABLE */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="relative inline-block w-24">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                C$
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_cost}
                                onChange={(e) => handleUpdateItem(idx, 'unit_cost', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>
                          </td>

                          {/* 4. CANTIDAD EDITABLE */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                                className="w-14 text-center font-mono font-bold text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* 5. IVA 15% TOGGLE */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.apply_iva}
                                onChange={(e) => handleUpdateItem(idx, 'apply_iva', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                              />
                              <span className={`text-[11px] font-black ${item.apply_iva ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                {item.apply_iva ? '15%' : 'Exento'}
                              </span>
                            </label>
                          </td>

                          {/* 6. IMPACTO / PRECIO VENTA */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div>
                                <span className="block font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                  PVP: C${(item.sale_price || 0).toFixed(2)}
                                </span>
                                <span className={`text-[10px] font-black ${Number(margenPorc) >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                                  Margen: +{margenPorc}%
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 7. SUBTOTAL */}
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                            C${item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* 8. ACCIÓN */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="Eliminar artículo de la orden"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* 5. CARD: FOOTER CON OBSERVACIONES Y TOTALES (Fiel a Imagen 1) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 sm:p-6 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Lado Izquierdo: Observaciones y Botones Cancelar / Borrador */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    OBSERVACIONES DE RECEPCIÓN / DETALLES DE ENTREGA
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Mercadería recibida conforme en bodega central, lote sellado y verificado..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (cartItems.length > 0) setShowCancelConfirm(true);
                      else handleCancelOrder();
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    CANCELAR ORDEN
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProcessPurchase('draft')}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Guardar Borrador</span>
                  </button>
                </div>
              </div>

              {/* Lado Derecho: Resumen de Totales y Botón Procesar Compra */}
              <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-850/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                
                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span className="uppercase tracking-wider">SUBTOTAL:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black text-sm">
                    C${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Descuento */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span className="uppercase tracking-wider">DESCUENTO:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">C$</span>
                    <input
                      type="number"
                      min="0"
                      value={discount || ''}
                      placeholder="0"
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-right font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* IVA (15% NICARAGUA) */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span className="uppercase tracking-wider">IVA (15% NICARAGUA):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black text-sm">
                    C${taxIva.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Separador */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    TOTAL NETO:
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    C${totalNeto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Botón Principal: PROCESAR COMPRA */}
                <button
                  type="button"
                  onClick={() => handleProcessPurchase('completed')}
                  className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>PROCESAR COMPRA</span>
                </button>

              </div>

            </div>
          </div>
        </>
      ) : (
        /* Pestaña: HISTORIAL DE COMPRAS */
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Historial de Facturas de Compras Registradas
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Total facturas: {purchases.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-5">N° FACTURA</th>
                  <th className="py-3 px-4">PROVEEDOR</th>
                  <th className="py-3 px-4">FECHA</th>
                  <th className="py-3 px-4 text-center">CONDICIÓN</th>
                  <th className="py-3 px-4 text-center">ESTADO</th>
                  <th className="py-3 px-4 text-right">TOTAL NETO (C$)</th>
                  <th className="py-3 px-5 text-center">DETALLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No hay compras registradas en el historial.
                    </td>
                  </tr>
                ) : (
                  purchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {p.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {p.supplier_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {p.purchase_date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.payment_condition === 'contado'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'
                        }`}>
                          {p.payment_condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        C${p.total_neto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => setViewingPurchase(p)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Ver comprobante de compra"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL: NUEVO PRODUCTO (Fiel a Imágenes 3 y 4) */}
      {showNewProductModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Nuevo Producto
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Complete los datos generales del catálogo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Scroll */}
            <form onSubmit={handleSaveNewProduct} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                
                {/* Fila 1: CÓDIGO SKU & CÓDIGO DE BARRAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      CÓDIGO SKU <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="SKU-6925"
                      value={newProductForm.sku}
                      onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      CÓDIGO DE BARRAS (EAN)
                    </label>
                    <input
                      type="text"
                      placeholder="Escanee o ingrese código de barra"
                      value={newProductForm.barcode}
                      onChange={(e) => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Fila 2: NOMBRE DEL PRODUCTO */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    NOMBRE DEL PRODUCTO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Leche Entera 1 Litro"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Fila 3: CATEGORÍA, UNIDAD DE MEDIDA, TIPO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      CATEGORÍA
                    </label>
                    <select
                      value={newProductForm.category_id}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category_id: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      UNIDAD DE MEDIDA
                    </label>
                    <select
                      value={newProductForm.unit}
                      onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Unidad">Unidad</option>
                      <option value="Litro">Litro</option>
                      <option value="Kilogramo">Kilogramo</option>
                      <option value="Metro">Metro</option>
                      <option value="Caja">Caja</option>
                      <option value="Paquete">Paquete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      TIPO
                    </label>
                    <select
                      value={newProductForm.tipo}
                      onChange={(e) => setNewProductForm({ ...newProductForm, tipo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Producto Terminado">Producto Terminado</option>
                      <option value="Materia Prima">Materia Prima</option>
                      <option value="Insumo">Insumo</option>
                    </select>
                  </div>
                </div>

                {/* Fila 4: PRECIO VENTA & COSTO PRODUCCIÓN / COMPRA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      PRECIO VENTA (C$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={newProductForm.price_cordobas}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price_cordobas: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      COSTO PRODUCCIÓN / COMPRA (C$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={newProductForm.cost_price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, cost_price: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fila 5: STOCK ACTUAL, STOCK MÍNIMO ALERTA, FECHA VENCIMIENTO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      STOCK ACTUAL
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProductForm.stock}
                      onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      STOCK MÍNIMO ALERTA
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newProductForm.min_stock}
                      onChange={(e) => setNewProductForm({ ...newProductForm, min_stock: Number(e.target.value) || 1 })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      FECHA VENCIMIENTO
                    </label>
                    <input
                      type="date"
                      value={newProductForm.expiry_date}
                      onChange={(e) => setNewProductForm({ ...newProductForm, expiry_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subsección: FICHA TÉCNICA / MEDIDAS DE VENTA (Imagen 4) */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <span>FICHA TÉCNICA / MEDIDAS DE VENTA</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Catálogo y Ficha Cliente
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      MEDIDAS COMERCIALES (TEXTO DESCRIPTIVO)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1.80m Largo × 1.20m Alto × 5.71cm Espesor"
                      value={newProductForm.measurements_spec}
                      onChange={(e) => setNewProductForm({ ...newProductForm, measurements_spec: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">ALTO ESTÁNDAR</label>
                      <input
                        type="text"
                        placeholder="Ej. 1.20 m"
                        value={newProductForm.alto}
                        onChange={(e) => setNewProductForm({ ...newProductForm, alto: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">ANCHO ESTÁNDAR</label>
                      <input
                        type="text"
                        placeholder="Ej. 1.80 m"
                        value={newProductForm.ancho}
                        onChange={(e) => setNewProductForm({ ...newProductForm, ancho: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">ESPESOR / GROSOR</label>
                      <input
                        type="text"
                        placeholder="Ej. 10 mm"
                        value={newProductForm.espesor}
                        onChange={(e) => setNewProductForm({ ...newProductForm, espesor: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      DESCRIPCIÓN COMERCIAL PARA CLIENTES
                    </label>
                    <input
                      type="text"
                      placeholder="Descripción detallada para la ficha técnica del cliente..."
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Imagen / Foto del Producto */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      IMAGEN / FOTO DEL PRODUCTO (.JPG, .PNG)
                    </label>
                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {productImagePreview ? (
                        <div className="flex items-center gap-3">
                          <img src={productImagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border" />
                          <span className="text-xs font-bold text-blue-600">Cambiar imagen seleccionada</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <Upload className="w-6 h-6 mx-auto text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                            Arrastra una imagen o haz clic aquí
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                </div>

              </div>

              {/* Footer Modal Nuevo Producto */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-blue-500/25"
                >
                  GUARDAR PRODUCTO
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 7. MODAL: VER DETALLE / COMPROBANTE DE COMPRA */}
      {viewingPurchase && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Comprobante de Recepción: {viewingPurchase.invoice_number}
              </h3>
              <button onClick={() => setViewingPurchase(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div><strong>Proveedor:</strong> {viewingPurchase.supplier_name}</div>
              <div><strong>Fecha de Compra:</strong> {viewingPurchase.purchase_date}</div>
              <div><strong>Condición de Pago:</strong> {viewingPurchase.payment_condition.toUpperCase()} ({viewingPurchase.payment_source})</div>
              {viewingPurchase.due_date && <div><strong>Vencimiento Crédito:</strong> {viewingPurchase.due_date}</div>}
              {viewingPurchase.observations && <div><strong>Observaciones:</strong> {viewingPurchase.observations}</div>}
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-2">Producto</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Costo</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {viewingPurchase.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{it.product_name}</td>
                      <td className="p-2 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="p-2 text-right font-mono">C${it.unit_cost.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold">C${it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right space-y-1 font-mono text-xs">
              <div>Subtotal: C${viewingPurchase.subtotal.toFixed(2)}</div>
              <div>IVA 15%: C${viewingPurchase.tax_iva.toFixed(2)}</div>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">Total: C${viewingPurchase.total_neto.toFixed(2)}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Imprimir Comprobante
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 8. MODAL CONFIRMACIÓN CANCELAR */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelOrder}
        title="¿Cancelar Orden de Compra?"
        message="Se perderán los artículos y datos ingresados en la orden actual."
        confirmText="Sí, Cancelar Orden"
        cancelText="Volver"
        type="warning"
      />

    </div>
  );
};
