import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Banknote,
  Package,
  ClipboardList,
  CreditCard,
  Users,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { storage } from '../../lib/storage';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const navigate = useNavigate();

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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#070b14] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 shadow-xl lg:shadow-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* LOGO & BRAND HEADER */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#070b14] flex items-center justify-center shadow-lg shadow-blue-950/40 p-1 shrink-0 overflow-hidden border border-slate-800/80">
              <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-black text-sm tracking-tight uppercase leading-tight flex items-center gap-1">
                  <span className="text-blue-500 font-extrabold tracking-wider">SENDA</span>
                  <span className="text-amber-400 font-extrabold tracking-wider">SISTEMAS</span>
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

        {/* NAVIGATION ITEMS WITH INDEPENDENT SCROLL */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-8 space-y-1.5 sidebar-scroll flex flex-col justify-between">
          <div>
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-4">
                {!collapsed && (
                  <div className="pt-2 pb-1 first:pt-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                      {section.title}
                    </span>
                  </div>
                )}
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                          {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* BOTTOM ACTIONS: COLLAPSE TOGGLE & LOGOUT */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1 shrink-0">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full hidden lg:flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              title={collapsed ? 'Expandir barra' : 'Contraer barra'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 mx-auto text-slate-400" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                  <span>Contraer barra</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
