import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Banknote,
  Package,
  ClipboardList,
  CreditCard,
  Users,
  Tag,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { storage } from '../../lib/storage';
import ConfirmModal from '../UI/ConfirmModal';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navSections = [
    {
      title: 'OPERACIONES',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Panel Central' },
        { path: '/catalogo', icon: BookOpen, label: 'Catálogo de Productos' },
        { path: '/pos', icon: ShoppingCart, label: 'Ventas (POS)' },
        { path: '/caja', icon: Banknote, label: 'Control de Caja' },
      ]
    },
    {
      title: 'INVENTARIO Y CRÉDITOS',
      items: [
        { path: '/productos', icon: Package, label: 'Gestión de Productos' },
        { path: '/categorias', icon: Tag, label: 'Categorías' },
        { path: '/movimientos', icon: ClipboardList, label: 'Inventario & Movimientos' },
        { path: '/creditos', icon: CreditCard, label: 'Créditos y Cuentas' },
        { path: '/clientes', icon: Users, label: 'Gestión de Clientes' },
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        { path: '/ajustes', icon: SlidersHorizontal, label: 'Ajuste del Sistema' },
      ]
    }
  ];

  const handleLogout = () => {
    storage.setCurrentUser(null);
    navigate('/login');
  };

  const isItemActive = (path: string) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search === `?${query}`;
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path && !location.search;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-white dark:bg-[#070b14] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 shadow-xl lg:shadow-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* 1. LOGO & BRAND HEADER (Fixed, shrink-0) */}
        <div className={`p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#070b14] flex items-center justify-center shadow-lg shadow-blue-950/40 p-1 shrink-0 overflow-hidden border border-slate-800/80">
              <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-black text-sm tracking-tight uppercase leading-tight flex items-center gap-1">
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold tracking-wider">SENDA</span>
                  <span className="text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">SISTEMAS</span>
                </h1>
                {/* Blue & Gold Brand Accent Line */}
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 rounded-full my-1" />
                <div className="inline-block">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 uppercase">
                    SISTEMA V3.0 (POS)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. NAVIGATION ITEMS & ACTIONS WITH FULL-HEIGHT BLUE SCROLLBAR */}
        <div className={`flex-1 min-h-0 overflow-y-auto ${collapsed ? 'px-2' : 'px-2.5'} py-3 space-y-4 sidebar-scroll flex flex-col justify-between`}>
          <div className="space-y-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pt-1 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {section.title}
                    </span>
                  </div>
                )}
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path);

                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 3. BOTTOM ACTIONS: LOGOUT & COLLAPSE (INSIDE FULL SCROLL) */}
          <div className={`pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 shrink-0 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className={`w-full flex items-center ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer`}
              title="Salir del Sistema"
            >
              <LogOut className="w-5 h-5 shrink-0 text-rose-500" />
              {!collapsed && <span>Salir del Sistema</span>}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={`w-full hidden lg:flex items-center ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer`}
              title={collapsed ? 'Expandir barra' : 'Contraer barra'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span>CONTRAER BARRA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Confirmación de Cerrar Sesión */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="¿Cerrar Sesión?"
        message="¿Está seguro de que desea salir del sistema? Tendrá que volver a ingresar sus credenciales para acceder."
        confirmText="Sí, Salir"
        cancelText="Cancelar"
        type="logout"
        iconShape="circle"
      />
    </>
  );
}
