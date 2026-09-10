import React, { useState } from 'react';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, User, KeyRound, Building2
} from 'lucide-react';
import { storage } from '../lib/storage';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@sendafact.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storage.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      storage.setCurrentUser(found);
      onLogin(found);
    } else {
      // Fallback default admin
      const adminUser: UserType = {
        id: 1,
        name: 'Jairo Cajina (Admin)',
        email: email,
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
      email: role === 'admin' ? 'admin@sendafact.com' : role === 'cajero' ? 'caja@sendasistemas.com' : 'ventas@sendasistemas.com',
      role: role,
      status: 'active',
      created_at: new Date().toISOString()
    };
    storage.setCurrentUser(demoUser);
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 relative z-10 border border-slate-800/80 shadow-2xl backdrop-blur-xl bg-[#0b1329]/90 rounded-3xl animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#070b14] flex items-center justify-center shadow-xl shadow-blue-950/60 p-2 mx-auto mb-4 border border-slate-800">
            <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" className="w-full h-full object-contain" />
          </div>
          
          <div className="flex justify-center mb-2">
            <img 
              src="/images/logo/senda-brand-text.png" 
              alt="SENDA SISTEMAS" 
              className="w-auto h-7 sm:h-8 max-w-[240px] object-contain drop-shadow-lg" 
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            SISTEMA DE FACTURACIÓN V3.0 (POS)
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="admin@sendafact.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Acceso Rápido de Demostración
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-[11px] font-bold text-purple-400 text-center transition cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('cajero')}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl text-[11px] font-bold text-blue-400 text-center transition cursor-pointer"
            >
              Cajero
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vendedor')}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-[11px] font-bold text-amber-400 text-center transition cursor-pointer"
            >
              Vendedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
