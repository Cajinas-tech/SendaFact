import React, { useState } from 'react';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, 
  Eye, EyeOff
} from 'lucide-react';
import { storage } from '../lib/storage';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('jairotten84@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const users = storage.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (found) {
      storage.setCurrentUser(found);
      onLogin(found);
    } else {
      // Create or use default admin user
      const adminUser: UserType = {
        id: 1,
        name: 'Jairo Cajina (Admin)',
        email: email.trim(),
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString()
      };
      storage.setCurrentUser(adminUser);
      onLogin(adminUser);
    }
  };

  const handleQuickDemoLogin = (role: 'admin' | 'cajero' | 'vendedor') => {
    const demoUser: UserType = {
      id: role === 'admin' ? 1 : role === 'cajero' ? 2 : 3,
      name: role === 'admin' ? 'Jairo Cajina (Admin)' : role === 'cajero' ? 'Cajero Principal' : 'Vendedor Sala de Ventas',
      email: role === 'admin' ? 'jairotten84@gmail.com' : role === 'cajero' ? 'caja@sendasistemas.com' : 'ventas@sendasistemas.com',
      role: role,
      status: 'active',
      created_at: new Date().toISOString()
    };
    storage.setCurrentUser(demoUser);
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-white flex flex-col justify-between items-center p-4 sm:p-6 font-sans transition-colors duration-200">
      
      {/* Top spacer */}
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-6 animate-fade-in py-6">
          
          {/* Logo Icon & Typography */}
          <div className="flex flex-col items-center space-y-3">
            {/* Black rounded icon */}
            <div className="w-20 h-20 rounded-3xl bg-[#070b14] flex items-center justify-center shadow-xl shadow-blue-950/20 p-2 shrink-0 border border-slate-800">
              <img 
                src="/images/logo/senda-logo.png" 
                alt="Senda Sistemas" 
                className="w-full h-full object-contain" 
              />
            </div>

            {/* 3D Transparent SENDA SISTEMAS Graphic */}
            <div className="flex justify-center pt-1">
              <img 
                src="/images/logo/senda-brand-text.png" 
                alt="SENDA SISTEMAS" 
                className="w-auto h-6 sm:h-7 max-w-[210px] object-contain drop-shadow-sm select-none" 
              />
            </div>

            {/* Welcome text */}
            <div className="space-y-1 pt-1">
              <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
          </div>

          {/* Error notification if any */}
          {error && (
            <div className="w-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-2xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            {/* Email / Usuario */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Usuario / Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jairotten84@gmail.com"
                  className="w-full bg-[#edf2f9] dark:bg-slate-900 border border-blue-100/80 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#edf2f9] dark:bg-slate-900 border border-blue-100/80 dark:border-slate-800 rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 accent-blue-600 cursor-pointer"
                />
                <span>Mantener sesión iniciada</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-black text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer active:scale-[0.99]"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="w-full pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition text-[11px] cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('cajero')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 transition text-[11px] cursor-pointer"
            >
              Cajero
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vendedor')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 transition text-[11px] cursor-pointer"
            >
              Ventas
            </button>
          </div>

        </div>
      </div>

      {/* Footer Security Notice */}
      <footer className="w-full py-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Acceso Restringido - Personal Autorizado</span>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;
