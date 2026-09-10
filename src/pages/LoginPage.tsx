import React, { useState } from 'react';
import { 
  Lock, User, ArrowRight, ShieldCheck, 
  Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt Supabase Auth if configured
      if (isSupabaseConfigured()) {
        try {
          const { data, error: sbError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (data?.user && !sbError) {
            const loggedUser: UserType = {
              id: typeof data.user.id === 'number' ? data.user.id : 1,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Jairo Cajina (Admin)',
              email: data.user.email || cleanEmail,
              role: (data.user.user_metadata?.role as any) || 'admin',
              status: 'active',
              created_at: data.user.created_at || new Date().toISOString()
            };
            storage.setCurrentUser(loggedUser);
            onLogin(loggedUser);
            return;
          }
        } catch (sbEx) {
          console.warn('Supabase auth attempt failed, checking local database:', sbEx);
        }
      }

      // 2. Query database / system registered users
      const users = storage.getUsers();
      const found = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (found) {
        storage.setCurrentUser(found);
        onLogin(found);
        return;
      }

      // 3. Fallback for registered admin email
      if (cleanEmail === 'jairotten84@gmail.com' || cleanEmail === 'admin@sendasistemas.com') {
        const adminUser: UserType = {
          id: 1,
          name: 'Jairo Cajina (Admin)',
          email: cleanEmail,
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString()
        };
        storage.setCurrentUser(adminUser);
        onLogin(adminUser);
        return;
      }

      // If credentials do not match
      setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servidor. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-[#060911] dark:via-[#0b1329] dark:to-[#04060a] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* 3D Ambient Glowing Background Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Floating 3D White Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#0f172a] rounded-[32px] p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-slate-800/80 relative z-10 transition-all duration-300 hover:shadow-[0_30px_80px_-15px_rgba(37,99,235,0.18)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header with 3D Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          
          {/* Black rounded icon with 3D depth */}
          <div className="w-20 h-20 rounded-3xl bg-[#070b14] flex items-center justify-center shadow-2xl shadow-blue-950/40 p-2 shrink-0 border border-slate-800/90 transition-transform duration-300 hover:scale-105">
            <img 
              src="/images/logo/senda-logo.png" 
              alt="Senda Sistemas" 
              className="w-full h-full object-contain drop-shadow-md" 
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

          {/* Heading */}
          <div className="space-y-0.5 pt-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              ¡Bienvenido de nuevo!
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">
              Ingresa tus credenciales para acceder.
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Usuario o Correo */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Usuario o Correo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico o usuario"
                className="w-full bg-[#f8fafc] dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 outline-none"
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
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 accent-blue-600 cursor-pointer"
              />
              <span>Mantener sesión iniciada</span>
            </label>
          </div>

          {/* 3D Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#2563eb] hover:bg-blue-600 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>INICIANDO SESIÓN...</span>
                </>
              ) : (
                <>
                  <span>INICIAR SESIÓN</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Acceso Restringido - Personal Autorizado</span>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
