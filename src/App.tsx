import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import { ToastProvider } from './components/UI/Toast';

// Pages
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import { CashPage } from './pages/CashPage';
import { MovementsPage } from './pages/MovementsPage';
import { CreditsPage } from './pages/CreditsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'DASHBOARD / ESTADÍSTICAS';
      case '/catalogo': return 'CATÁLOGO DE PRODUCTOS';
      case '/pos': return 'TERMINAL DE VENTAS (POS)';
      case '/caja': return 'CONTROL DE CAJA & ARQUEO';
      case '/productos': return 'GESTIÓN DE PRODUCTOS';
      case '/categorias': return 'CATEGORÍAS DE PRODUCTOS';
      case '/movimientos': return 'KARDEX DE INVENTARIO';
      case '/creditos': return 'CUENTAS POR COBRAR';
      case '/clientes': return 'DIRECTORIO DE CLIENTES';
      case '/ajustes': return 'AJUSTES DEL SISTEMA';
      default: return 'SISTEMA SENDAFACT POS';
    }
  };

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <ToastProvider>
        <LoginPage onLogin={() => navigate('/')} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#060911] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <Header 
            titleBadge={getPageTitle(location.pathname)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/caja" element={<CashPage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/categorias" element={<CategoriesPage />} />
              <Route path="/movimientos" element={<MovementsPage />} />
              <Route path="/creditos" element={<CreditsPage />} />
              <Route path="/clientes" element={<CustomersPage />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage onLogin={() => navigate('/')} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
