import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User } from '../../types';

interface HeaderProps {
  titleBadge?: string;
  onOpenMobileMenu: () => void;
}

export default function Header({ titleBadge = 'DASHBOARD / ESTADÍSTICAS', onOpenMobileMenu }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const activeRegister = storage.getActiveCashRegister();

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sendafact_theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sendafact_theme', 'dark');
      setDarkMode(true);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sendafact_theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'JA';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* LEFT: MOBILE MENU & TITLE */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
          {titleBadge}
        </h2>
      </div>

      {/* RIGHT: BUTTONS & USER PILL */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Modo Claro / Oscuro Button */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider shadow-2xs transition cursor-pointer"
          title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          <span className="hidden sm:inline">{darkMode ? 'MODO OSCURO' : 'MODO CLARO'}</span>
        </button>

        {/* Caja Lista Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
          activeRegister
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${activeRegister ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{activeRegister ? 'CAJA LISTA' : 'CAJA CERRADA'}</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
            {getInitials(currentUser?.name || 'Jairo Cajina')}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-black text-slate-800 dark:text-white capitalize">
              {(currentUser?.name || 'Administrador').split(' ')[0]}
            </p>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {currentUser?.role === 'cajero' ? 'CAJERO' : currentUser?.role === 'vendedor' ? 'VENDEDOR' : 'ADMINISTRADOR'}
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}
