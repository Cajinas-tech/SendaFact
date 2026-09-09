import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, DollarSign, UserCheck, ShieldCheck } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User } from '../../types';

interface HeaderProps {
  titleBadge?: string;
  onOpenMobileMenu: () => void;
}

export default function Header({ titleBadge = 'SISTEMA POS & FACTURACIÓN', onOpenMobileMenu }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const settings = storage.getSettings();

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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      
      {/* LEFT: MOBILE TOGGLE & PAGE BADGE */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {titleBadge}
          </span>
        </div>
      </div>

      {/* RIGHT: EXCHANGE RATE, THEME TOGGLE, USER BADGE */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* Dual Currency Exchange Rate Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>T.C: 1 USD = C$ {settings.exchange_rate.toFixed(2)}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase leading-none">
              {currentUser.name.split(' ')[0]}
            </p>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
              {currentUser.role}
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}
