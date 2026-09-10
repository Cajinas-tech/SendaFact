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
        <div className={`border-b border-slate-100 dark:border-slate-800/80 shrink-0 ${collapsed ? 'p-3 flex justify-center' : 'p-4'}`}>
          {collapsed ? (
            <div className="w-14 h-14 rounded-2xl bg-[#070b14] flex items-center justify-center shadow-lg shadow-blue-950/40 p-1.5 shrink-0 overflow-hidden border border-slate-800/80 mx-auto">
              <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-2.5">
              {/* Logo Icon Box (+40% size) */}
              <div className="w-[90px] h-[90px] rounded-2xl bg-[#070b14] flex items-center justify-center shadow-xl shadow-blue-950/40 p-2 shrink-0 overflow-hidden border border-slate-800/80">
                <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" className="w-full h-full object-contain" />
              </div>
              
              {/* Brand Title SENDA SISTEMAS (3D Metallic Logo Graphic) */}
              <div className="w-full px-1 flex justify-center py-0.5">
                <img 
                  src="/images/logo/senda-brand-text.png" 
                  alt="SENDA SISTEMAS" 
                  className="w-auto h-5 sm:h-5.5 max-w-[195px] object-contain drop-shadow-md select-none pointer-events-none" 
                />
              </div>

              {/* Version Pill Badge */}
              <div className="flex justify-center">
                <span className="text-[10px] font-black px-3.5 py-0.5 rounded-full bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 uppercase tracking-wider shadow-2xs">
                  SISTEMA V3.0 (REACT)
                </span>
              </div>
            </div>
          )}
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
