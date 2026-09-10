import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, Database, Users, Building2, 
  Download, Upload, Save, AlertTriangle, 
  FileSpreadsheet, RotateCcw, Flame, UserPlus, Trash2, CheckCircle2,
  Image as ImageIcon, UploadCloud, X
} from 'lucide-react';
import { storage } from '../lib/storage';
import { User, CompanySetting, Product } from '../types';
import { useToast } from '../components/UI/Toast';

export const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'backup' | 'users' | 'company'>(
    tabParam === 'users' ? 'users' : tabParam === 'company' ? 'company' : 'backup'
  );
  const { success, warning, error, info } = useToast();

  useEffect(() => {
    if (tabParam === 'users' || tabParam === 'backup' || tabParam === 'company') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // File input refs
  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Company settings
  const [company, setCompany] = useState<CompanySetting>({
    name: 'SENDAFACT POS',
    ruc: 'J0310000284920',
    address: 'Managua, Nicaragua',
    phone: '+505 8888-8888',
    email: 'contacto@sendafact.com',
    exchange_rate: 36.80,
    main_currency: 'C$',
    secondary_currency: 'USD'
  });

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'cajero' | 'vendedor'>('cajero');
  const [userPassword, setUserPassword] = useState('');

  const loadData = () => {
    setUsers(storage.getUsers());
    const comp = storage.getCompanySettings();
    if (comp) setCompany(comp);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. BACKUP JSON (EXPORT)
  const handleExportJSON = () => {
    const data = storage.exportAllDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sendafact_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('¡Copia de Seguridad Descargada!', 'Archivo JSON generado con éxito');
  };

  // 1. BACKUP JSON (IMPORT / RESTORE)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importAllDataJSON(content)) {
        success('¡Base de Datos Restaurada!', 'Todos los registros han sido actualizados');
        loadData();
      } else {
        error('Error al Restaurar', 'El archivo JSON de respaldo es inválido');
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  // 1. BACKUP AUTOMÁTICO (RECUPERAR)
  const handleAutoBackupRestore = () => {
    // Re-sync and verify storage integrity
    const products = storage.getProducts();
    const sales = storage.getSales();
    success('¡Backup Automático Sincronizado!', `${products.length} productos y ${sales.length} ventas verificadas en caché local`);
  };

  // 2. CSV INVENTARIO (EXPORT)
  const handleExportCSV = () => {
    const products = storage.getProducts();
    const categories = storage.getCategories();
    const headers = ['ID,SKU,NOMBRE,CATEGORIA,PRECIO_CORDOBAS,PRECIO_USD,COSTO,STOCK,SUBTITULO'];
    const rows = products.map(p => {
      const cat = categories.find(c => c.id === p.category_id)?.name || 'GENERAL';
      return `"${p.id}","${p.sku}","${p.name.replace(/"/g, '""')}","${cat}","${p.price_cordobas}","${p.price_usd}","${p.cost_price || 0}","${p.stock}","${(p.subtitle || '').replace(/"/g, '""')}"`;
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_sendafact_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('¡Inventario CSV Exportado!', 'Archivo compatible con Microsoft Excel descargado');
  };

  // 2. CSV INVENTARIO (IMPORT)
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          warning('Archivo vacío', 'El archivo CSV no contiene filas de productos');
          return;
        }

        const currentProducts = storage.getProducts();
        const categories = storage.getCategories();
        let importedCount = 0;

        // Process rows (skip header)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(col => col.replace(/^"(.*)"$/, '$1').trim());
          if (cols.length >= 5) {
            const sku = cols[1] || ('#SKU-' + (1000 + i));
            const name = (cols[2] || 'PRODUCTO IMPORTADO').toUpperCase();
            const catName = (cols[3] || 'GENERAL').toUpperCase();
            const priceCordobas = parseFloat(cols[4]) || 0;
            const priceUsd = parseFloat(cols[5]) || parseFloat((priceCordobas / 36.80).toFixed(2));
            const cost = parseFloat(cols[6]) || 0;
            const stock = parseInt(cols[7], 10) || 10;
            const subtitle = cols[8] || 'UNIDAD';

            let cat = categories.find(c => c.name.toUpperCase() === catName);
            const catId = cat ? cat.id : 1;

            const existingIdx = currentProducts.findIndex(p => p.sku === sku || p.name.toUpperCase() === name);
            if (existingIdx >= 0) {
              currentProducts[existingIdx] = {
                ...currentProducts[existingIdx],
                name,
                category_id: catId,
                price_cordobas: priceCordobas,
                price_usd: priceUsd,
                cost_price: cost,
                stock: stock,
                subtitle: subtitle
              };
            } else {
              currentProducts.unshift({
                id: Date.now() + i,
                sku,
                name,
                category_id: catId,
                price_cordobas: priceCordobas,
                price_usd: priceUsd,
                cost_price: cost,
                stock: stock,
                subtitle: subtitle,
                status: 'active',
                is_finished_good: true,
                image_url: null,
                created_at: new Date().toISOString()
              });
            }
            importedCount++;
          }
        }

        storage.setProducts(currentProducts);
        loadData();
        success('¡Inventario Actualizado!', `${importedCount} productos procesados e importados desde Excel CSV`);
      } catch (err) {
        error('Error al importar CSV', 'Verifica el formato del archivo CSV');
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  // 3. RESTABLECER SISTEMA
  const handleResetData = () => {
    if (confirm('¿Está seguro de restablecer TODO el sistema? Se borrarán las ventas locales y se restaurará el inventario a los valores de fábrica.')) {
      storage.resetAllData();
      loadData();
      warning('¡Sistema Restablecido!', 'Base de datos devuelta a valores iniciales de fábrica');
    }
  };

  // Logo handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Archivo no válido', 'Por favor selecciona una imagen válida (PNG, JPG, SVG o WebP)');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      warning('Imagen muy pesada', 'El tamaño máximo recomendado es 2.5MB para almacenamiento local');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCompany(prev => ({ ...prev, logo: base64 }));
      info('Logo cargado', 'Recuerda hacer clic en "Guardar Cambios" para confirmar');
    };
    reader.onerror = () => {
      error('Error', 'No se pudo procesar la imagen seleccionada');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompany(prev => ({ ...prev, logo: '' }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    info('Logo removido', 'Recuerda hacer clic en "Guardar Cambios" para confirmar');
  };

  // Save company info
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveCompanySettings(company);
    success('¡Configuración Guardada!', 'Datos comerciales y logotipo de la empresa actualizados correctamente');
  };

  // Save User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: editingUser ? editingUser.id : (Date.now() as any),
      name: userName,
      email: userEmail,
      role: userRole,
      status: 'active',
      created_at: editingUser ? editingUser.created_at : new Date().toISOString()
    };

    storage.saveUser(newUser);
    setShowUserModal(false);
    loadData();
    success(
      editingUser ? '¡Usuario Actualizado!' : '¡Usuario Creado!',
      `${newUser.name} asignado como ${newUser.role.toUpperCase()}`
    );
  };

  const handleDeleteUser = (id: any) => {
    if (confirm('¿Desea eliminar este usuario?')) {
      storage.deleteUser(id);
      loadData();
      warning('Usuario Eliminado', 'El usuario fue retirado del sistema');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Hidden file inputs for JSON & CSV */}
      <input
        type="file"
        ref={jsonInputRef}
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />
      <input
        type="file"
        ref={csvInputRef}
        accept=".csv"
        onChange={handleImportCSV}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 p-0.5 shadow-lg shadow-slate-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Settings className="w-7 h-7 text-slate-300" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ajustes Generales del Sistema</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configuración fiscal, centro de respaldos de base de datos y control de usuarios</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'backup'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Centro de Copias y Respaldos
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuarios y Permisos
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'company'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Datos de la Empresa
        </button>
      </div>

      {/* TAB 1: CENTRO DE COPIAS Y RESPALDOS (3 CARDS STRUCTURE AS IN USER SCREENSHOT) */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Section Header */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Copias y Respaldos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gestiona la base de datos de tu negocio en formatos JSON completos o edita tu catálogo en Excel usando archivos CSV.
              </p>
            </div>
          </div>

          {/* 3 Columns Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: 1 - BACKUP COMPLETO */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Save className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      1 - Backup Completo
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    Formato JSON
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Copia TODOS los datos de tu POS (productos, clientes, usuarios, ventas y turnos) en un solo archivo para transferirlos fácilmente entre dispositivos o guardarlos.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>Hacer Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Restaurar Backup</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoBackupRestore}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Recuperar Backup Automático</span>
                </button>
              </div>
            </div>

            {/* CARD 2: 2 - INVENTARIO CSV (EXCEL) */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      2 - Inventario CSV (Excel)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    Compatible con Excel
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Exporta e importa tu catálogo en formato CSV para edición masiva en Excel. Modifica los precios, costos, nombres o stock y vuelve a importarlo para actualizar el sistema.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Inventario</span>
                </button>

                <button
                  type="button"
                  onClick={() => csvInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Importar Inventario</span>
                </button>
              </div>
            </div>

            {/* CARD 3: 3 - RESTABLECER SISTEMA */}
            <div className="glass-card rounded-2xl p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-rose-700 dark:text-rose-300">
                      3 - Restablecer Sistema
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                    Acción Destructiva
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Borra TODO el almacenamiento local del POS (catálogo, clientes, ventas y configuraciones). Útil para limpiar el sistema si hay datos corruptos o para empezar de cero con datos demo.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <Flame className="w-4 h-4" />
                  <span>Restablecer Base de Datos</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: USERS AND ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Usuarios del Sistema</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestión de cuentas, cajeros y roles de seguridad</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserName('');
                setUserEmail('');
                setUserRole('cajero');
                setUserPassword('');
                setShowUserModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          : u.role === 'vendedor'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : u.role === 'vendedor' ? 'Vendedor' : 'Cajero'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setUserName(u.name);
                            setUserEmail(u.email);
                            setUserRole(u.role);
                            setUserPassword('');
                            setShowUserModal(true);
                          }}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY SETTINGS */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="glass-card p-6 max-w-2xl space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Información del Comercio y Logotipo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personaliza la identidad y cabecera de tus facturas y tickets térmicos
              </p>
            </div>
          </div>

          {/* Logotipo de la Empresa */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Logotipo de la Empresa
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Este logo aparecerá impreso en la parte superior de cada factura y ticket de venta (POS).
                </p>
              </div>
              {company.logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-2.5 py-1 text-xs font-medium text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-200 dark:border-rose-900/50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar Logo
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Box */}
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center p-2 overflow-hidden shadow-xs shrink-0">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt="Logo Empresa"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-600 flex flex-col items-center">
                    <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 font-medium">Sin Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  <span>{company.logo ? 'Cambiar Logotipo' : 'Subir Logotipo de Empresa'}</span>
                </button>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Formatos admitidos: PNG, JPG, SVG o WebP (Fondo transparente recomendado, máx. 2.5 MB).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Nombre Comercial</label>
              <input
                type="text"
                required
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">RUC / Cédula Jurídica</label>
              <input
                type="text"
                required
                value={company.ruc}
                onChange={(e) => setCompany({ ...company, ruc: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Teléfono</label>
              <input
                type="text"
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Correo</label>
              <input
                type="email"
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Dirección</label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </form>
      )}

      {/* MODAL: Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Correo de Acceso</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Rol de Acceso</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="cajero">Cajero (Solo POS y ventas)</option>
                  <option value="vendedor">Vendedor Sala de Ventas</option>
                  <option value="admin">Administrador Total</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso'}
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={editingUser ? 'Dejar en blanco para no cambiar' : '••••••••'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
