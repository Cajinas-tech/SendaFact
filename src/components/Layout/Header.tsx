import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, Clock, Wallet } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User } from '../../types';
import { VencimientoCriticoModal } from '../Alertas/VencimientoCriticoModal';

interface HeaderProps {
  titleBadge?: string;
  onOpenMobileMenu: () => void;
}

export default function Header({ titleBadge = 'DASHBOARD / ESTADÍSTICAS', onOpenMobileMenu }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [modalAlertasAbierto, setModalAlertasAbierto] = useState(false);
  const [alertasCount, setAlertasCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  const activeRegister = storage.getActiveCashRegister();
  const company = storage.getCompanySettings();
  const exchangeRate = company?.exchange_rate || 36.63;

  // Live Clock (Formato: 11:36:17 p. m.)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-NI', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    try {
      const prods = storage.getProducts();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let count = 0;
      prods.forEach(p => {
        const minStock = p.min_stock !== undefined ? p.min_stock : 5;
        if (p.stock <= minStock) count++;
        if (p.expiry_date) {
          const vto = new Date(p.expiry_date);
          vto.setHours(0, 0, 0, 0);
          const dias = Math.ceil((vto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          if (dias <= 30) count++;
        }
      });
      setAlertasCount(count);
    } catch (e) {
      setAlertasCount(0);
    }
  }, [modalAlertasAbierto]);

  const getInitials = (name: string) => {
    if (!name) return 'JA';
    const clean = name.replace(/\s*\(.*?\)\s*/g, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  const cleanUserName = (currentUser?.name || 'jairotten84')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();

  const openingAmount = activeRegister
    ? Number(activeRegister.opening_amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '1,000.00';

  return (
    <>
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors gap-3">
      
      {/* LEFT: MOBILE MENU & TITLE */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
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

      {/* RIGHT: EXACT 6 BUTTONS / PILLS AS IN REFERENCE SCREENSHOTS */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-x-auto no-scrollbar py-0.5 max-w-full">
        
        {/* 1. Botón de Alertas */}
        <button
          type="button"
          onClick={() => setModalAlertasAbierto(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group active:scale-95 shrink-0"
          title="Ver alertas de stock bajo y lotes próximos a vencer"
        >
          <Bell className="w-3.5 h-3.5 text-red-500 fill-red-500/20 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">Alertas</span>
          {alertasCount > 0 ? (
            <span className="bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none shadow-xs">
              {alertasCount}
            </span>
          ) : (
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
              0
            </span>
          )}
        </button>

        {/* 2. Switch Modo Claro / Oscuro */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer select-none active:scale-95 shrink-0"
          title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {/* Mini Switch Track */}
          <div className={`w-9 h-5 rounded-full p-0.5 flex items-center justify-between transition-colors ${
            darkMode 
              ? 'bg-[#0b1329] border border-slate-700/80' 
              : 'bg-slate-100 border border-slate-200/90'
          }`}>
            {darkMode ? (
              <>
                <Sun className="w-2.5 h-2.5 text-slate-600 ml-1 shrink-0" />
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Moon className="w-2.5 h-2.5 fill-white stroke-[2.5]" />
                </div>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sun className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
                <Moon className="w-2.5 h-2.5 text-slate-400 mr-1 shrink-0" />
              </>
            )}
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {darkMode ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* 3. Tasa Oficial BCN */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs font-black shadow-2xs shrink-0 select-none">
          <div className="w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs shrink-0">
            $
          </div>
          <span className="text-blue-600 dark:text-blue-400 font-black">BCN:</span>
          <span className="text-slate-900 dark:text-white font-black tracking-tight">
            1 USD = C$ {exchangeRate.toFixed(2)}
          </span>
        </div>

        {/* 4. Estado de Caja */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-2xs shrink-0 select-none ${
          activeRegister
            ? 'border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
            : 'border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${activeRegister ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <Wallet className={`w-3.5 h-3.5 shrink-0 ${activeRegister ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
          <span className="font-bold">
            {activeRegister ? `Caja Abierta (C$${openingAmount})` : 'Caja Cerrada'}
          </span>
        </div>

        {/* 5. Reloj en Vivo */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-2xs shrink-0 select-none">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="font-medium tracking-tight">
            {currentTime || '11:00:00 p. m.'}
          </span>
        </div>

        {/* 6. Perfil de Usuario y Estado */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 shadow-2xs shrink-0 select-none">
          <div className="w-5.5 h-5.5 min-w-[22px] h-[22px] rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(currentUser?.name || 'jairotten84')}
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {cleanUserName}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            En Línea
          </span>
        </div>

      </div>

    </header>

    <VencimientoCriticoModal
      isOpen={modalAlertasAbierto}
      onClose={() => setModalAlertasAbierto(false)}
    />
  </>
  );
}
