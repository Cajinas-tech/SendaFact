import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  Layers,
  CreditCard,
  Download,
  Calendar,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Info,
  Tag,
  Boxes,
  HelpCircle,
  BarChart3,
  X,
  Printer,
  Copy,
  Check,
  FileText,
  User,
  Clock,
  ArrowRight,
  ExternalLink,
  Share2,
  Building2,
  ArrowRightLeft,
  Banknote
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Sale, Product, Category, Movement } from '../types';
import { useToast } from '../components/UI/Toast';

export default function MetricsPage() {
  const { success, info } = useToast();

  // Storage data
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales() || []);
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts() || []);
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories() || []);
  const [movements, setMovements] = useState<Movement[]>(() => storage.getMovements() || []);

  // Filter state
  const [timeFilter, setTimeFilter] = useState<'hoy' | '7dias' | 'mes' | 'historico' | 'personalizado'>('historico');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'marcas' | 'productos' | 'matriz'>('marcas');

  // Search & sorting for products
  const [searchProduct, setSearchProduct] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState<
    'ganancia_desc' | 'margen_desc' | 'ventas_desc' | 'unidades_desc' | 'ganancia_unit_desc' | 'margen_asc'
  >('ganancia_desc');

  // Modals
  const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);
  const [showMermasModal, setShowMermasModal] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [inspectingInvoice, setInspectingInvoice] = useState<any | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);
  const company = storage.getCompanySettings();

  // Reload data from storage
  const reloadData = () => {
    setSales(storage.getSales() || []);
    setProducts(storage.getProducts() || []);
    setCategories(storage.getCategories() || []);
    setMovements(storage.getMovements() || []);
  };

  const handleResetDemo = () => {
    storage.resetMetricsDemo();
    reloadData();
    success('Datos Sincronizados', 'Se han cargado los datos financieros de demostración del sistema.');
  };

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((sale) => {
      if (sale.status === 'cancelled') return false;
      if (!sale.created_at) return true;

      const saleDate = new Date(sale.created_at);

      if (timeFilter === 'hoy') {
        const todayStr = now.toISOString().split('T')[0];
        return sale.created_at.startsWith(todayStr);
      }

      if (timeFilter === '7dias') {
        const diffTime = now.getTime() - saleDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (timeFilter === 'mes') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }

      if (timeFilter === 'personalizado') {
        if (!startDate && !endDate) return true;
        const s = startDate ? new Date(startDate) : new Date(0);
        const e = endDate ? new Date(endDate + 'T23:59:59') : new Date();
        return saleDate >= s && saleDate <= e;
      }

      // 'historico' -> all sales
      return true;
    });
  }, [sales, timeFilter, startDate, endDate]);

  // Filter mermas/losses from movements
  const filteredMermas = useMemo(() => {
    const now = new Date();

    return movements.filter((mov) => {
      const isMerma =
        mov.type === 'out' &&
        (mov.sub_type === 'MERMA' ||
          (mov.reason &&
            (mov.reason.toLowerCase().includes('merma') ||
              mov.reason.toLowerCase().includes('venc') ||
              mov.reason.toLowerCase().includes('dañ'))));

      if (!isMerma) return false;
      if (!mov.created_at) return true;

      const movDate = new Date(mov.created_at);

      if (timeFilter === 'hoy') {
        const todayStr = now.toISOString().split('T')[0];
        return mov.created_at.startsWith(todayStr);
      }

      if (timeFilter === '7dias') {
        const diffTime = now.getTime() - movDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (timeFilter === 'mes') {
        return (
          movDate.getMonth() === now.getMonth() &&
          movDate.getFullYear() === now.getFullYear()
        );
      }

      if (timeFilter === 'personalizado') {
        if (!startDate && !endDate) return true;
        const s = startDate ? new Date(startDate) : new Date(0);
        const e = endDate ? new Date(endDate + 'T23:59:59') : new Date();
        return movDate >= s && movDate <= e;
      }

      return true;
    });
  }, [movements, timeFilter, startDate, endDate]);

  // Product lookup helper
  const getProductInfo = (productId?: number, productName?: string) => {
    if (productId) {
      const found = products.find((p) => p.id === productId);
      if (found) return found;
    }
    if (productName) {
      const cleanName = productName.trim().toLowerCase();
      const found = products.find(
        (p) =>
          p.name.trim().toLowerCase() === cleanName ||
          cleanName.includes(p.name.trim().toLowerCase())
      );
      if (found) return found;
    }
    return null;
  };

  const getCategoryName = (catId?: number | string) => {
    if (!catId) return 'GENERAL';
    const cat = categories.find((c) => String(c.id) === String(catId));
    return cat ? cat.name.toUpperCase() : 'GENERAL';
  };

  // Financial Calculations & Aggregations
  const analytics = useMemo(() => {
    let totalIngresos = 0;
    let totalCostoPEPS = 0;
    let totalMermas = 0;

    const paymentMethods: { [key: string]: number } = {
      credito: 0,
      efectivo: 0,
      transferencia: 0,
      tarjeta: 0
    };

    const productSalesMap: {
      [key: string]: {
        productId: number | null;
        productName: string;
        sku: string;
        brand: string;
        category: string;
        costPrice: number;
        salePrice: number;
        unitProfit: number;
        unitMargin: number;
        unitsSold: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        marginPercent: number;
        salesInvoices: { ticket: string; date: string; qty: number; unitPrice: number; total: number }[];
      };
    } = {};

    const brandStatsMap: {
      [brand: string]: {
        brand: string;
        unitsSold: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        marginPercent: number;
      };
    } = {};

    const categoryStatsMap: {
      [category: string]: {
        category: string;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        marginPercent: number;
      };
    } = {};

    // Process sales & sale items
    filteredSales.forEach((sale) => {
      const saleTotal = sale.total_cordobas || sale.subtotal_cordobas || 0;
      totalIngresos += saleTotal;

      // Method of payment
      const method = (sale.payment_method || 'efectivo').toLowerCase();
      if (paymentMethods[method] !== undefined) {
        paymentMethods[method] += saleTotal;
      } else {
        paymentMethods['efectivo'] += saleTotal;
      }

      // Process items
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => {
          const qty = item.quantity || 1;
          const unitPrice = item.unit_price_cordobas || (saleTotal / qty);
          const itemRevenue = item.total_cordobas || unitPrice * qty;

          const prod = getProductInfo(item.product_id, item.product_name);

          // Purchase cost (valor de compras / unitario)
          let unitCost = 0;
          let prodBrand = 'GENERAL';
          let prodCategory = 'GENERAL';
          let sku = item.product_name;

          if (prod) {
            unitCost = prod.cost_price || 0;
            prodBrand = (prod.brand || 'GENERAL').toUpperCase();
            prodCategory = getCategoryName(prod.category_id);
            sku = prod.sku || prod.name;
          } else {
            // Heuristic fallback if product wasn't found in catalog
            const nameLower = item.product_name.toLowerCase();
            if (nameLower.includes('coca')) {
              prodBrand = 'COCA-COLA';
              prodCategory = 'GASEOSAS';
              unitCost = unitPrice * 0.70;
            } else if (nameLower.includes('cerveza') || nameLower.includes('toña')) {
              prodBrand = 'COMPAÑÍA CERVECERA';
              prodCategory = 'CERVEZAS';
              unitCost = unitPrice * 0.79;
            } else if (nameLower.includes('agua') || nameLower.includes('fuente')) {
              prodBrand = 'FUENTE PURA';
              prodCategory = 'AGUAS';
              unitCost = unitPrice * 0.60;
            } else if (nameLower.includes('pepsi')) {
              prodBrand = 'PEPSI';
              prodCategory = 'GASEOSAS';
              unitCost = unitPrice * 0.66;
            } else if (nameLower.includes('dos pinos') || nameLower.includes('leche') || nameLower.includes('jugo')) {
              prodBrand = 'DOS PINOS';
              prodCategory = 'JUGOS';
              unitCost = unitPrice * 0.68;
            } else {
              prodBrand = 'GENERAL';
              prodCategory = 'GENERAL';
              unitCost = unitPrice * 0.88;
            }
          }

          const itemCost = unitCost * qty;
          const itemProfit = itemRevenue - itemCost;
          totalCostoPEPS += itemCost;

          // Aggregate by Product
          const prodKey = prod ? String(prod.id) : item.product_name.trim().toUpperCase();
          if (!productSalesMap[prodKey]) {
            productSalesMap[prodKey] = {
              productId: prod ? prod.id : null,
              productName: prod ? prod.name : item.product_name,
              sku: sku,
              brand: prodBrand,
              category: prodCategory,
              costPrice: unitCost,
              salePrice: unitPrice,
              unitProfit: unitPrice - unitCost,
              unitMargin: unitPrice > 0 ? ((unitPrice - unitCost) / unitPrice) * 100 : 0,
              unitsSold: 0,
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              marginPercent: 0,
              salesInvoices: []
            };
          }

          productSalesMap[prodKey].unitsSold += qty;
          productSalesMap[prodKey].totalRevenue += itemRevenue;
          productSalesMap[prodKey].totalCost += itemCost;
          productSalesMap[prodKey].totalProfit += itemProfit;
          productSalesMap[prodKey].salesInvoices.push({
            ticket: sale.ticket_number || ('#' + sale.id),
            saleId: sale.id,
            date: sale.created_at,
            customerName: sale.customer?.name || (sale as any).customer_name || 'Consumidor Final',
            customerPhone: sale.customer?.phone || '',
            userName: sale.user_name || 'Caja Principal',
            userRole: sale.user_role || 'cajero',
            paymentMethod: (sale.payment_method || 'efectivo').toLowerCase(),
            status: sale.status || 'completed',
            qty: qty,
            unitPrice: unitPrice,
            unitCost: unitCost,
            totalCost: itemCost,
            total: itemRevenue,
            profit: itemProfit,
            margin: itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0,
            sale: sale
          });

          // Aggregate by Brand
          if (!brandStatsMap[prodBrand]) {
            brandStatsMap[prodBrand] = {
              brand: prodBrand,
              unitsSold: 0,
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              marginPercent: 0
            };
          }
          brandStatsMap[prodBrand].unitsSold += qty;
          brandStatsMap[prodBrand].totalRevenue += itemRevenue;
          brandStatsMap[prodBrand].totalCost += itemCost;
          brandStatsMap[prodBrand].totalProfit += itemProfit;

          // Aggregate by Category
          if (!categoryStatsMap[prodCategory]) {
            categoryStatsMap[prodCategory] = {
              category: prodCategory,
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              marginPercent: 0
            };
          }
          categoryStatsMap[prodCategory].totalRevenue += itemRevenue;
          categoryStatsMap[prodCategory].totalCost += itemCost;
          categoryStatsMap[prodCategory].totalProfit += itemProfit;
        });
      }
    });

    // Process Mermas
    filteredMermas.forEach((merma) => {
      const q = merma.quantity || 1;
      const c = merma.unit_cost || 0;
      totalMermas += q * c;
    });

    // Compute Margins for Products
    const productStatsList = Object.values(productSalesMap).map((item) => {
      const avgSalePrice = item.unitsSold > 0 ? item.totalRevenue / item.unitsSold : item.salePrice;
      const avgCostPrice = item.unitsSold > 0 ? item.totalCost / item.unitsSold : item.costPrice;
      const unitProfit = avgSalePrice - avgCostPrice;
      const margin = item.totalRevenue > 0 ? (item.totalProfit / item.totalRevenue) * 100 : 0;

      return {
        ...item,
        salePrice: avgSalePrice,
        costPrice: avgCostPrice,
        unitProfit: unitProfit,
        unitMargin: avgSalePrice > 0 ? (unitProfit / avgSalePrice) * 100 : 0,
        marginPercent: margin
      };
    });

    // Compute Margins for Brands & Sort by profit descending
    const brandStatsList = Object.values(brandStatsMap)
      .map((b) => ({
        ...b,
        marginPercent: b.totalRevenue > 0 ? (b.totalProfit / b.totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);

    // Compute Margins for Categories
    const categoryStatsList = Object.values(categoryStatsMap)
      .map((c) => ({
        ...c,
        marginPercent: c.totalRevenue > 0 ? (c.totalProfit / c.totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Totals
    const totalFacturas = filteredSales.length;
    const utilidadNeta = totalIngresos - totalCostoPEPS - totalMermas;
    const margenNeto = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
    const ticketPromedio = totalFacturas > 0 ? totalIngresos / totalFacturas : 0;

    return {
      totalIngresos,
      totalFacturas,
      totalCostoPEPS,
      utilidadNeta,
      margenNeto,
      totalMermas,
      ticketPromedio,
      paymentMethods,
      productStatsList,
      brandStatsList,
      categoryStatsList
    };
  }, [filteredSales, filteredMermas, products, categories]);

  // Max brand profit for relative progress bars
  const maxBrandProfit = useMemo(() => {
    if (analytics.brandStatsList.length === 0) return 1;
    return Math.max(...analytics.brandStatsList.map((b) => b.totalProfit), 1);
  }, [analytics.brandStatsList]);

  // Max product profit for relative bars
  const maxProductProfit = useMemo(() => {
    if (analytics.productStatsList.length === 0) return 1;
    return Math.max(...analytics.productStatsList.map((p) => p.totalProfit), 1);
  }, [analytics.productStatsList]);

  // Filter & Sort Products
  const processedProducts = useMemo(() => {
    return analytics.productStatsList
      .filter((p) => {
        const matchesSearch =
          p.productName.toLowerCase().includes(searchProduct.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchProduct.toLowerCase());

        const matchesCategory =
          categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

        const matchesBrand =
          brandFilter === 'all' || p.brand.toLowerCase() === brandFilter.toLowerCase();

        return matchesSearch && matchesCategory && matchesBrand;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'ganancia_desc':
            return b.totalProfit - a.totalProfit;
          case 'margen_desc':
            return b.marginPercent - a.marginPercent;
          case 'margen_asc':
            return a.marginPercent - b.marginPercent;
          case 'ventas_desc':
            return b.totalRevenue - a.totalRevenue;
          case 'unidades_desc':
            return b.unitsSold - a.unitsSold;
          case 'ganancia_unit_desc':
            return b.unitProfit - a.unitProfit;
          default:
            return b.totalProfit - a.totalProfit;
        }
      });
  }, [analytics.productStatsList, searchProduct, categoryFilter, brandFilter, sortBy]);

  // Format currency helper
  const formatMoney = (val: number) => {
    return `C$${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Export to Excel / CSV with BOM
  const handleExportExcel = () => {
    try {
      const now = new Date();
      const filename = `Reporte_Metricas_Ganancias_${timeFilter}_${now.toISOString().slice(0, 10)}.csv`;

      let csv = '\uFEFF'; // UTF-8 BOM
      csv += 'SENDA SISTEMAS - REPORTE DE MÉTRICAS Y RENTABILIDAD REAL PEPS\r\n';
      csv += `Generado:;${now.toLocaleString('es-NI')}\r\n`;
      csv += `Filtro Seleccionado:;${timeFilter.toUpperCase()}\r\n\r\n`;

      csv += '=== RESUMEN EJECUTIVO FINANCIERO ===\r\n';
      csv += `Ingresos Totales (C$):;${analytics.totalIngresos.toFixed(2)}\r\n`;
      csv += `Total de Facturas:;${analytics.totalFacturas}\r\n`;
      csv += `Costo PEPS / Costo de Ventas (C$):;${analytics.totalCostoPEPS.toFixed(2)}\r\n`;
      csv += `Utilidad Neta (C$):;${analytics.utilidadNeta.toFixed(2)}\r\n`;
      csv += `Margen Neto Real (%):;${analytics.margenNeto.toFixed(2)}%\r\n`;
      csv += `Mermas y Bajas (C$):;${analytics.totalMermas.toFixed(2)}\r\n`;
      csv += `Ticket Promedio por Cliente (C$):;${analytics.ticketPromedio.toFixed(2)}\r\n\r\n`;

      csv += '=== DETALLE DE GANANCIAS POR PRODUCTO (COMPRA VS VENTA) ===\r\n';
      csv += 'SKU;Producto;Marca;Categoría;Valor Compra (Costo Unitario);Valor Venta (Precio Venta);Ganancia Unitaria;Unidades Vendidas;Inversión Total (Costo);Ventas Totales (Ingresos);Ganancia Neta Total;Margen Real (%)\r\n';

      analytics.productStatsList.forEach((p) => {
        csv += `"${p.sku}";"${p.productName}";"${p.brand}";"${p.category}";${p.costPrice.toFixed(2)};${p.salePrice.toFixed(2)};${p.unitProfit.toFixed(2)};${p.unitsSold};${p.totalCost.toFixed(2)};${p.totalRevenue.toFixed(2)};${p.totalProfit.toFixed(2)};${p.marginPercent.toFixed(1)}%\r\n`;
      });

      csv += '\r\n=== MARCAS MÁS RENTABLES ===\r\n';
      csv += 'Ranking;Marca;Unidades Vendidas;Ventas Totales (C$);Costo Total (C$);Ganancia Neta (C$);Margen (%)\r\n';
      analytics.brandStatsList.forEach((b, idx) => {
        csv += `${idx + 1};"${b.brand}";${b.unitsSold};${b.totalRevenue.toFixed(2)};${b.totalCost.toFixed(2)};${b.totalProfit.toFixed(2)};${b.marginPercent.toFixed(1)}%\r\n`;
      });

      csv += '\r\n=== VENTAS POR CATEGORÍA ===\r\n';
      csv += 'Categoría;Ventas Totales (C$);Ganancia Neta (C$);Margen (%)\r\n';
      analytics.categoryStatsList.forEach((c) => {
        csv += `"${c.category}";${c.totalRevenue.toFixed(2)};${c.totalProfit.toFixed(2)};${c.marginPercent.toFixed(1)}%\r\n`;
      });

      csv += '\r\n=== DESGLOSE POR MÉTODOS DE PAGO ===\r\n';
      csv += 'Método;Monto (C$);Participación (%)\r\n';
      const tot = analytics.totalIngresos || 1;
      csv += `Crédito;${analytics.paymentMethods.credito.toFixed(2)};${((analytics.paymentMethods.credito / tot) * 100).toFixed(1)}%\r\n`;
      csv += `Efectivo;${analytics.paymentMethods.efectivo.toFixed(2)};${((analytics.paymentMethods.efectivo / tot) * 100).toFixed(1)}%\r\n`;
      csv += `Transferencia;${analytics.paymentMethods.transferencia.toFixed(2)};${((analytics.paymentMethods.transferencia / tot) * 100).toFixed(1)}%\r\n`;
      if (analytics.paymentMethods.tarjeta > 0) {
        csv += `Tarjeta;${analytics.paymentMethods.tarjeta.toFixed(2)};${((analytics.paymentMethods.tarjeta / tot) * 100).toFixed(1)}%\r\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success('Reporte Exportado', `Se ha generado el archivo ${filename}`);
    } catch (e) {
      console.error(e);
      info('Error', 'No se pudo exportar el archivo');
    }
  };

  // Top Product Star
  const topProduct = useMemo(() => {
    if (analytics.productStatsList.length === 0) return null;
    return [...analytics.productStatsList].sort((a, b) => b.totalProfit - a.totalProfit)[0];
  }, [analytics.productStatsList]);

  // Top Margin Product
  const topMarginProduct = useMemo(() => {
    if (analytics.productStatsList.length === 0) return null;
    return [...analytics.productStatsList]
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.marginPercent - a.marginPercent)[0];
  }, [analytics.productStatsList]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* 1. TOP MODULE HEADER (Matching Image 1 & 2) */}
      <div className="bg-white dark:bg-[#070b14] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                MÉTRICAS Y GANANCIAS
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                PRO v3.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Análisis financiero, rentabilidad real PEPS y mermas en Córdobas (C$)
            </p>
          </div>
        </div>

        {/* Right: Date Filter Pill Buttons & Excel Button */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Time Filter Pill Buttons */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeFilter('hoy')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeFilter === 'hoy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('7dias')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeFilter === '7dias'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Días
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('mes')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeFilter === 'mes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('historico')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeFilter === 'historico'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Histórico
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('personalizado')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                timeFilter === 'personalizado'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Filtrar por rango personalizado de fechas"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          {/* Sync / Demo Reset Button */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Sincronizar y recargar datos de prueba de la imagen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Range Inputs when 'personalizado' is active */}
      {timeFilter === 'personalizado' && (
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center gap-3 animate-in fade-in">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Rango de fechas:</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* 2. 4 TOP FINANCIAL KPI CARDS (Image 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: INGRESOS TOTALES */}
        <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              INGRESOS TOTALES
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {formatMoney(analytics.totalIngresos)}
            </h3>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
              {analytics.totalFacturas} facturas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: COSTO PEPS */}
        <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              COSTO PEPS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {formatMoney(analytics.totalCostoPEPS)}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Costo compras lotes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: UTILIDAD NETA */}
        <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              UTILIDAD NETA
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {formatMoney(analytics.utilidadNeta)}
            </h3>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ↗ {analytics.margenNeto.toFixed(1)}% Margen
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: MERMAS / BAJAS */}
        <div
          onClick={() => setShowMermasModal(true)}
          className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
          title="Ver registro de mermas y productos dados de baja"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block group-hover:text-rose-500 transition-colors">
              MERMAS / BAJAS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {formatMoney(analytics.totalMermas)}
            </h3>
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
              ↘ Daños/vencidos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION VIEW TOGGLE: Marcas vs Ganancias por Productos vs Matriz */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('marcas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'marcas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Marcas Más Rentables</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('productos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer relative ${
              activeTab === 'productos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Ganancias por Productos</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white">
              NUEVO
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matriz')}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'matriz'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Matriz & Análisis</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Mostrando datos calculados en base a precios unitarios de compra y venta
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            LEFT COLUMN (Col span 7 or 8 on desktop): Main interactive analytics
           ======================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* VIEW TAB 1: MARCAS MÁS RENTABLES (Exact Image 1 & 2 design) */}
          {activeTab === 'marcas' && (
            <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      MARCAS MÁS RENTABLES (GANANCIA NETA C$)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ranking ordenado por volumen de ganancia líquida
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('productos')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver por productos ➔
                </button>
              </div>

              {/* Brands Ranking List */}
              <div className="space-y-4 pt-1">
                {analytics.brandStatsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No hay ventas registradas en el período seleccionado.
                  </div>
                ) : (
                  analytics.brandStatsList.map((brand, idx) => {
                    const relativePercent = Math.min(
                      100,
                      Math.max(8, (brand.totalProfit / maxBrandProfit) * 100)
                    );

                    return (
                      <div key={brand.brand} className="space-y-1.5 group">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {idx + 1}
                            </span>
                            <span className="font-black text-slate-900 dark:text-white uppercase tracking-wide">
                              {brand.brand}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                              ({brand.unitsSold} unds vendidas)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              {formatMoney(brand.totalProfit)}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              ({brand.marginPercent.toFixed(1)}% margen)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar (Teal / Turquoise matching image) */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${relativePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW TAB 2: GANANCIAS POR VENTAS DE PRODUCTOS (USER'S ENHANCEMENT REQUEST) */}
          {activeTab === 'productos' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Highlight / Educational Formula Box */}
              <div className="bg-gradient-to-r from-blue-50 via-teal-50/60 to-emerald-50/50 dark:from-blue-950/40 dark:via-teal-950/20 dark:to-emerald-950/30 rounded-2xl p-4 border border-blue-200/80 dark:border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Cálculo de Ganancias Unitarias y Totales por Producto
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Ganancia Unitaria = Valor de Venta - Valor de Compra (Costo) • Ganancia Total = Unidades × Ganancia Unitaria
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                    Margen = (Ganancia / Venta) × 100
                  </span>
                </div>
              </div>

              {/* 3 Quick Micro Cards: Top product, best margin, total units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#070b14] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/60">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                      Mayor Ganancia Neta
                    </span>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {topProduct?.productName || 'N/A'}
                    </p>
                    <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                      +{formatMoney(topProduct?.totalProfit || 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#070b14] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                      Mayor Margen %
                    </span>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {topMarginProduct?.productName || 'N/A'}
                    </p>
                    <span className="text-[11px] font-mono font-black text-teal-600 dark:text-teal-400">
                      {topMarginProduct?.marginPercent.toFixed(1)}% margen
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#070b14] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                      Total Unidades Vendidas
                    </span>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {analytics.productStatsList.reduce((acc, p) => acc + p.unitsSold, 0)} unidades
                    </p>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {processedProducts.length} productos con venta
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Filters & Sorters */}
              <div className="bg-white dark:bg-[#070b14] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Buscar producto por nombre, SKU o marca..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las Categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Brand Filter */}
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las Marcas</option>
                    {analytics.brandStatsList.map((b) => (
                      <option key={b.brand} value={b.brand}>
                        {b.brand}
                      </option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-bold px-2.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ganancia_desc">Mayor Ganancia Total (C$)</option>
                    <option value="margen_desc">Mayor Margen (%)</option>
                    <option value="unidades_desc">Más Vendidos (Unidades)</option>
                    <option value="ventas_desc">Mayor Venta Bruta (C$)</option>
                    <option value="ganancia_unit_desc">Mayor Ganancia Unitaria</option>
                    <option value="margen_asc">Menor Margen (Revisar precios)</option>
                  </select>
                </div>
              </div>

              {/* Products Detailed Profitability Cards / Table */}
              <div className="space-y-3">
                {processedProducts.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#070b14] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    No se encontraron productos coincidentes con los filtros seleccionados.
                  </div>
                ) : (
                  processedProducts.map((p, idx) => {
                    const relativePercent = Math.min(
                      100,
                      Math.max(6, (p.totalProfit / maxProductProfit) * 100)
                    );

                    const isHighMargin = p.marginPercent >= 30;
                    const isMediumMargin = p.marginPercent >= 20 && p.marginPercent < 30;
                    const isLowMargin = p.marginPercent < 20;

                    return (
                      <div
                        key={p.sku + idx}
                        className="bg-white dark:bg-[#070b14] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all space-y-3 group"
                      >
                        {/* Top Line: SKU, Brand, Category, Product Name */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                                {p.brand}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {p.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {p.sku}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {p.productName}
                            </h4>
                          </div>

                          {/* Profit Pill Badge */}
                          <div className="text-left sm:text-right shrink-0">
                            <div className="flex items-center gap-1.5 sm:justify-end">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                Ganancia Neta Total:
                              </span>
                              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                                +{formatMoney(p.totalProfit)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:justify-end text-xs">
                              <span
                                className={`font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                                  isHighMargin
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : isMediumMargin
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {p.marginPercent.toFixed(1)}% Margen
                              </span>
                              <span className="text-slate-400 font-bold">
                                • {p.unitsSold} unds vendidas
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Line: Unit Cost vs Unit Sale Price vs Unit Profit (User Request) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                          {/* Unit Cost */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Valor Compra (Costo)
                            </span>
                            <span className="font-black text-slate-700 dark:text-slate-200 font-mono text-xs sm:text-sm">
                              {formatMoney(p.costPrice)}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">por unidad</span>
                          </div>

                          {/* Unit Sale Price */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Valor Venta (Precio)
                            </span>
                            <span className="font-black text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-sm">
                              {formatMoney(p.salePrice)}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">por unidad</span>
                          </div>

                          {/* Unit Profit */}
                          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-2.5 border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                              Ganancia Unitaria
                            </span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm">
                              +{formatMoney(p.unitProfit)}
                            </span>
                            <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
                              {p.salePrice > 0 ? `+${((p.unitProfit / p.costPrice) * 100).toFixed(0)}% markup` : ''}
                            </span>
                          </div>

                          {/* Total Revenue & Inversion */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Total Ventas / Costo
                            </span>
                            <span className="font-black text-slate-800 dark:text-slate-100 font-mono text-xs sm:text-sm">
                              {formatMoney(p.totalRevenue)}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              Costo: {formatMoney(p.totalCost)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Line: Relative Profit Bar & Quick Invoice Drill-down Button */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Contribución relativa a las ganancias:</span>
                              <span className="font-bold">{relativePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                                style={{ width: `${relativePercent}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedProductDetail(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Facturas ({p.salesInvoices.length})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW TAB 3: MATRIZ DE RENTABILIDAD & SUGERENCIAS */}
          {activeTab === 'matriz' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quadrant 1: Productos Estrella */}
                <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-black text-sm uppercase tracking-tight">
                      ⭐ Productos Estrella (Alto Volumen + Alto Margen)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Productos que generan el mayor flujo de caja y mayor ganancia porcentual.
                  </p>
                  <div className="space-y-2">
                    {analytics.productStatsList
                      .filter((p) => p.marginPercent >= 25 && p.unitsSold >= 5)
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.sku}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.unitsSold} unds • Costo {formatMoney(p.costPrice)} ➔ Venta {formatMoney(p.salePrice)}
                            </span>
                          </div>
                          <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">
                            +{formatMoney(p.totalProfit)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quadrant 2: Oportunidades de Ajuste de Precios */}
                <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-black text-sm uppercase tracking-tight">
                      ⚠️ Oportunidad de Ajuste (Margen Bajo &lt; 20%)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Productos con margen reducido donde se sugiere revisar costo de compra o subir precio de venta.
                  </p>
                  <div className="space-y-2">
                    {analytics.productStatsList
                      .filter((p) => p.marginPercent < 20 && p.unitsSold > 0)
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.sku}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              Margen actual: {p.marginPercent.toFixed(1)}% (Ganancia unitaria: {formatMoney(p.unitProfit)})
                            </span>
                          </div>
                          <span className="font-black font-mono text-slate-700 dark:text-slate-300">
                            {formatMoney(p.totalRevenue)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =======================================================================
            RIGHT COLUMN (Col span 5 or 4 on desktop): Ticket Promedio, Categorías, Métodos de Pago
           ======================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Card 1: TICKET PROMEDIO POR CLIENTE (Solid Blue with rounded white icon) */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/25 relative overflow-hidden group">
            {/* Ambient Background Circle */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/40 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-100">
                  TICKET PROMEDIO POR CLIENTE
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {formatMoney(analytics.ticketPromedio)}
              </h2>

              <p className="text-xs text-blue-100/90 font-medium">
                Consumo medio por transacción
              </p>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
                <span>Facturas evaluadas:</span>
                <span className="font-black font-mono">{analytics.totalFacturas} tickets</span>
              </div>
            </div>
          </div>

          {/* Card 2: VENTAS POR CATEGORÍA (Exact Image 1 & 2 design) */}
          <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                VENTAS POR CATEGORÍA
              </h3>
            </div>

            <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/80">
              {analytics.categoryStatsList.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Sin ventas por categoría
                </div>
              ) : (
                analytics.categoryStatsList.map((cat) => (
                  <div key={cat.category} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide block">
                        {cat.category}
                      </span>
                      <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{formatMoney(cat.totalProfit)} ganancia
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block">
                        {formatMoney(cat.totalRevenue)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cat.marginPercent.toFixed(1)}% margen
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: DESGLOSE POR MÉTODOS DE PAGO (Exact Image 2 design) */}
          <div className="bg-white dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                DESGLOSE POR MÉTODOS DE PAGO
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Crédito */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  CRÉDITO
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white block truncate">
                  {formatMoney(analytics.paymentMethods.credito)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block">
                  {analytics.totalIngresos > 0
                    ? `${((analytics.paymentMethods.credito / analytics.totalIngresos) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>

              {/* Efectivo */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  EFECTIVO
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white block truncate">
                  {formatMoney(analytics.paymentMethods.efectivo)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block">
                  {analytics.totalIngresos > 0
                    ? `${((analytics.paymentMethods.efectivo / analytics.totalIngresos) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>

              {/* Transferencia */}
              <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    TRANSFERENCIA
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white block">
                    {formatMoney(analytics.paymentMethods.transferencia)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {analytics.totalIngresos > 0
                    ? `${((analytics.paymentMethods.transferencia / analytics.totalIngresos) * 100).toFixed(1)}% del total`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="pt-1">
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${(analytics.paymentMethods.efectivo / (analytics.totalIngresos || 1)) * 100}%`
                  }}
                  title="Efectivo"
                />
                <div
                  className="h-full bg-teal-500"
                  style={{
                    width: `${(analytics.paymentMethods.transferencia / (analytics.totalIngresos || 1)) * 100}%`
                  }}
                  title="Transferencia"
                />
                <div
                  className="h-full bg-purple-600"
                  style={{
                    width: `${(analytics.paymentMethods.credito / (analytics.totalIngresos || 1)) * 100}%`
                  }}
                  title="Crédito"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MODAL 1: DETALLE DE FACTURAS POR PRODUCTO (INVOICES DRILLDOWN ULTRA MODERNO & CLARO)
         ======================================================================= */}
      {selectedProductDetail && (() => {
        const productInvoices = (selectedProductDetail.salesInvoices || []).filter((inv: any) => {
          if (!invoiceSearch.trim()) return true;
          const query = invoiceSearch.toLowerCase().trim();
          return (
            inv.ticket?.toLowerCase().includes(query) ||
            inv.customerName?.toLowerCase().includes(query) ||
            inv.userName?.toLowerCase().includes(query) ||
            inv.paymentMethod?.toLowerCase().includes(query)
          );
        });

        const handleCopyTicket = (ticket: string) => {
          navigator.clipboard.writeText(ticket);
          setCopiedTicket(ticket);
          setTimeout(() => setCopiedTicket(null), 2000);
        };

        const handleExportProductCSV = () => {
          try {
            let csv = '\uFEFF';
            csv += `REPORTE DE FACTURAS - ${selectedProductDetail.productName}\r\n`;
            csv += `SKU:;${selectedProductDetail.sku}\r\n`;
            csv += `Marca:;${selectedProductDetail.brand}\r\n`;
            csv += `Categoría:;${selectedProductDetail.category}\r\n`;
            csv += `Valor Compra (Costo):;${selectedProductDetail.costPrice.toFixed(2)}\r\n`;
            csv += `Valor Venta (Precio):;${selectedProductDetail.salePrice.toFixed(2)}\r\n`;
            csv += `Ganancia Total:;${selectedProductDetail.totalProfit.toFixed(2)} (${selectedProductDetail.marginPercent.toFixed(1)}%)\r\n\r\n`;

            csv += 'Ticket;Fecha;Cliente;Cajero;Metodo Pago;Cantidad;Precio Unitario;Costo Invertido;Total Facturado;Ganancia Neta;Margen (%)\r\n';
            selectedProductDetail.salesInvoices.forEach((inv: any) => {
              const invCost = inv.qty * selectedProductDetail.costPrice;
              const invProfit = inv.total - invCost;
              const invMargin = inv.total > 0 ? (invProfit / inv.total) * 100 : 0;
              csv += `"${inv.ticket}";"${new Date(inv.date).toLocaleString('es-NI')}";"${inv.customerName}";"${inv.userName}";"${inv.paymentMethod.toUpperCase()}";${inv.qty};${inv.unitPrice.toFixed(2)};${invCost.toFixed(2)};${inv.total.toFixed(2)};${invProfit.toFixed(2)};${invMargin.toFixed(1)}%\r\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Facturas_${selectedProductDetail.sku}_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            success('Reporte Descargado', 'Historial de facturas del producto exportado a Excel/CSV');
          } catch (e) {
            info('Error', 'No se pudo exportar el historial de facturas');
          }
        };

        return createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="my-auto w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
              
              {/* 1. MODAL HEADER (Light & Clean Theme Friendly) */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                      <Boxes className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedProductDetail.brand}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {selectedProductDetail.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          SKU: {selectedProductDetail.sku}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        {selectedProductDetail.productName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Historial detallado de ventas y cálculo de rentabilidad por factura
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductDetail(null);
                      setInvoiceSearch('');
                    }}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
                    title="Cerrar ventana"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. 4 FINANCIAL CARDS (Clean, Bright & High Contrast in Light Mode) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                  {/* Valor Compra */}
                  <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl p-3 border border-amber-200/90 dark:border-amber-800/50">
                    <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Valor Compra</span>
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white block">
                      {formatMoney(selectedProductDetail.costPrice)}
                    </span>
                    <span className="text-[10px] text-amber-700/90 dark:text-slate-400 block mt-0.5">
                      Inversión: {formatMoney(selectedProductDetail.totalCost)}
                    </span>
                  </div>

                  {/* Valor Venta */}
                  <div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-2xl p-3 border border-blue-200/90 dark:border-blue-800/50">
                    <div className="flex items-center justify-between text-blue-800 dark:text-blue-400 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Valor Venta</span>
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-blue-400 block">
                      {formatMoney(selectedProductDetail.salePrice)}
                    </span>
                    <span className="text-[10px] text-blue-700/90 dark:text-slate-400 block mt-0.5">
                      Ventas: {formatMoney(selectedProductDetail.totalRevenue)}
                    </span>
                  </div>

                  {/* Ganancia Unitaria */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-200/90 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Ganancia / Unidad</span>
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                      +{formatMoney(selectedProductDetail.unitProfit)}
                    </span>
                    <span className="text-[10px] text-emerald-700/90 dark:text-emerald-300 font-bold block mt-0.5">
                      {selectedProductDetail.costPrice > 0
                        ? `+${((selectedProductDetail.unitProfit / selectedProductDetail.costPrice) * 100).toFixed(1)}% markup`
                        : '+100%'}
                    </span>
                  </div>

                  {/* Ganancia Total & Margen */}
                  <div className="bg-teal-50/90 dark:bg-teal-950/40 rounded-2xl p-3 border border-teal-300 dark:border-teal-800/60 shadow-xs">
                    <div className="flex items-center justify-between text-teal-800 dark:text-teal-400 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Ganancia Neta</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-base sm:text-lg font-black font-mono text-teal-700 dark:text-teal-300 block">
                      +{formatMoney(selectedProductDetail.totalProfit)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-600 text-white inline-block mt-0.5">
                      {selectedProductDetail.marginPercent.toFixed(1)}% Margen
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. TOOLBAR: Search & Invoices Count */}
              <div className="p-3.5 sm:px-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Facturas donde se vendió este producto ({productInvoices.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      placeholder="Buscar por ticket, cliente o cajero..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportProductCSV}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Exportar listado a Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
              </div>

              {/* 4. INVOICES LIST (Elevated Modern Cards) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50 dark:bg-[#070b14]">
                {productInvoices.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">
                      {invoiceSearch
                        ? 'No se encontraron facturas con el término de búsqueda.'
                        : 'No hay facturas vinculadas a este producto en el período actual.'}
                    </p>
                  </div>
                ) : (
                  productInvoices.map((inv: any, iIdx: number) => {
                    const invCost = inv.qty * selectedProductDetail.costPrice;
                    const invProfit = inv.total - invCost;
                    const invMargin = inv.total > 0 ? (invProfit / inv.total) * 100 : 0;
                    const isCopied = copiedTicket === inv.ticket;

                    // Payment method styling
                    const method = (inv.paymentMethod || 'efectivo').toLowerCase();
                    const isCash = method === 'efectivo';
                    const isCredit = method === 'credito' || method === 'crédito';
                    const isTransfer = method === 'transferencia';

                    return (
                      <div
                        key={iIdx}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all space-y-2.5 group"
                      >
                        {/* Top: Ticket Number, Date, Status, Payment Method */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-tight">
                                {inv.ticket}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTicket(inv.ticket)}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Copiar folio"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 ml-1">
                              <Clock className="w-3 h-3" />
                              {new Date(inv.date).toLocaleString('es-NI', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Badges: Payment Method & Status */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                isCash
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : isTransfer
                                  ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                                  : isCredit
                                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {isCash && <Banknote className="w-3 h-3" />}
                              {isTransfer && <ArrowRightLeft className="w-3 h-3" />}
                              {isCredit && <CreditCard className="w-3 h-3" />}
                              <span>{inv.paymentMethod.toUpperCase()}</span>
                            </span>

                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              COMPLETADA
                            </span>
                          </div>
                        </div>

                        {/* Middle: Customer & Cashier info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-500">Cliente:</span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {inv.customerName}
                            </span>
                            {inv.customerPhone && (
                              <span className="text-[10px] text-slate-400 font-mono">({inv.customerPhone})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-500">Atendido por:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {inv.userName}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Transaction Financial Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                              {inv.qty} {inv.qty === 1 ? 'unidad' : 'unidades'} × {formatMoney(inv.unitPrice)}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Costo invertido: {formatMoney(invCost)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">
                                Total Venta:
                              </span>
                              <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                                {formatMoney(inv.total)}
                              </span>
                            </div>

                            <div className="text-right bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-xl">
                              <span className="text-[9px] text-emerald-800 dark:text-emerald-300 block font-black uppercase">
                                Ganancia:
                              </span>
                              <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400 block">
                                +{formatMoney(invProfit)} ({invMargin.toFixed(1)}%)
                              </span>
                            </div>

                            {/* Action to view full ticket voucher */}
                            {inv.sale && (
                              <button
                                type="button"
                                onClick={() => setInspectingInvoice(inv.sale)}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-900/50 ml-1"
                                title="Ver comprobante completo"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ver Ticket</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 5. MODAL FOOTER */}
              <div className="p-4 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                  <span>
                    Total Facturado:{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {formatMoney(selectedProductDetail.totalRevenue)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ganancia Líquida:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      +{formatMoney(selectedProductDetail.totalProfit)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductDetail(null);
                      setInvoiceSearch('');
                    }}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* =======================================================================
          MODAL 1.1: COMPROBANTE DE TICKET COMPLETO (RECEIPT INSPECTOR)
         ======================================================================= */}
      {inspectingInvoice && createPortal(
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="my-auto bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Comprobante de Venta
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setInspectingInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Voucher Body */}
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs space-y-3">
              {/* Company Info */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <h3 className="font-black text-sm text-slate-900 dark:text-white tracking-wider">
                  {company?.name || 'SENDA SISTEMAS'}
                </h3>
                <p className="text-[10px] text-slate-500">{company?.address || 'Managua, Nicaragua'}</p>
                <p className="text-[10px] text-slate-500">Tel: {company?.phone || '+505 8888-0000'}</p>
              </div>

              {/* Ticket Meta */}
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Documento:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectingInvoice.ticket_number || '#' + inspectingInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{new Date(inspectingInvoice.created_at).toLocaleString('es-NI')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-bold">{inspectingInvoice.customer?.name || (inspectingInvoice as any).customer_name || 'Consumidor Final'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cajero/Vendedor:</span>
                  <span>{inspectingInvoice.user_name || 'Caja Principal'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de Pago:</span>
                  <span className="font-bold uppercase text-blue-600 dark:text-blue-400">{inspectingInvoice.payment_method}</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Artículos Facturados:
                </span>
                {(inspectingInvoice.items || []).map((it: any, itIdx: number) => {
                  const isCurrent =
                    selectedProductDetail &&
                    (it.product_name === selectedProductDetail.productName ||
                      it.product_id === selectedProductDetail.productId);

                  return (
                    <div
                      key={itIdx}
                      className={`flex justify-between py-1 px-1.5 rounded ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {it.quantity}x {it.product_name}
                      </span>
                      <span className="shrink-0">{formatMoney(it.total_cordobas || (it.quantity * it.unit_price_cordobas))}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                  <span>TOTAL PAGADO:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatMoney(inspectingInvoice.total_cordobas || inspectingInvoice.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =======================================================================
          MODAL 2: HISTORIAL DE MERMAS Y BAJAS
         ======================================================================= */}
      {showMermasModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="my-auto bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base uppercase">
                    Registro de Mermas y Bajas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Productos vencidos o con daños reportados en el inventario
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMermasModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Pérdida Total por Mermas:
              </span>
              <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                {formatMoney(analytics.totalMermas)}
              </span>
            </div>

            {/* Movements list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredMermas.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No hay mermas registradas en el período seleccionado.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredMermas.map((m) => {
                    const cost = (m.quantity || 1) * (m.unit_cost || 0);

                    return (
                      <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {m.product_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {m.reason} • {new Date(m.created_at).toLocaleDateString('es-NI')}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">
                            {m.quantity} unds
                          </span>
                          <span className="font-black font-mono text-rose-600 dark:text-rose-400 text-xs">
                            -{formatMoney(cost)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMermasModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
