import React, { useState } from 'react';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, User, KeyRound
} from 'lucide-react';
import { storage } from '../lib/storage';

interface LoginPageProps {
  onLogin: (user: any) => void;
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
      localStorage.setItem('senda_current_user', JSON.stringify(found));
      onLogin(found);
    } else {
      // Fallback default admin
      const adminUser = {
        id: 'usr-1',
        name: 'Jairo Cajina (Admin)',
        email: email,
        role: 'admin',
        active: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('senda_current_user', JSON.stringify(adminUser));
      onLogin(adminUser);
    }
  };

  const handleQuickDemoLogin = (role: 'admin' | 'cashier' | 'supervisor') => {
    const demoUser = {
      id: `usr-${role}`,
      name: role === 'admin' ? 'Jairo Cajina (Admin)' : role === 'supervisor' ? 'Carlos Gómez (Supervisor)' : 'María López (Cajera)',
      email: `${role}@sendafact.com`,
      role: role,
      active: true,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('senda_current_user', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 relative z-10 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/30 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SF
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SendaFact V3.0</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Sistema de Facturación & Punto de Venta
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="usuario@sendafact.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Acceso Rápido de Demostración
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-purple-400 text-center transition"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickDemoLogin('supervisor')}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-amber-400 text-center transition"
            >
              Supervisor
            </button>
            <button
              onClick={() => handleQuickDemoLogin('cashier')}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-blue-400 text-center transition"
            >
              Cajero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
