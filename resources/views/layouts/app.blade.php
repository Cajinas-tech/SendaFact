<!DOCTYPE html>
<html lang="es" x-data="{ darkMode: localStorage.getItem('theme') === 'dark', sidebarCollapsed: false }" :class="{ 'dark': darkMode }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'SendaFact') }} - Sistema POS y Facturación</title>
    
    <!-- PWA & Mobile App Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#2563eb">
    <link rel="apple-touch-icon" href="/images/logo/senda-logo.svg">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="SendaFact">
    <link rel="icon" type="image/svg+xml" href="/images/logo/senda-logo.svg">
    
    <!-- Google Fonts: Inter & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"></script>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        [x-cloak] { display: none !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border: 1px solid #e2e8f0;
        }
        .dark .glass-card {
            background: rgba(15, 23, 42, 0.95);
            border-color: #1e293b;
        }
    </style>
    @stack('styles')
</head>
<body class="bg-[#f4f7fb] dark:bg-[#0b1120] text-[#1e293b] dark:text-[#f1f5f9] font-sans antialiased min-h-screen transition-colors duration-200">
    <div class="flex min-h-screen overflow-hidden">
        
        <!-- SIDEBAR -->
        <aside :class="sidebarCollapsed ? 'w-20' : 'w-64'" 
               class="bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none shadow-sm">
            
            <!-- Sidebar Top: Brand Logo -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-800/60">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#090d16] flex items-center justify-center shadow-md p-1 shrink-0 overflow-hidden">
                        <img src="/images/logo/senda-logo.svg" alt="Senda Logo" class="w-full h-full object-contain">
                    </div>
                    <div x-show="!sidebarCollapsed" class="overflow-hidden">
                        <h1 class="font-extrabold text-base tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                            SENDA <span class="text-blue-600">SISTEMAS</span>
                        </h1>
                        <div class="inline-block mt-1">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                                SISTEMA V3.0 (LARAVEL)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Navigation Items -->
            <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                @php
                    $navItems = [
                        ['route' => 'dashboard', 'pattern' => 'dashboard*', 'icon' => 'layout-dashboard', 'label' => 'Panel Central'],
                        ['route' => 'catalog.index', 'pattern' => 'catalogo*', 'icon' => 'book-open', 'label' => 'Catálogo de Productos'],
                        ['route' => 'pos.index', 'pattern' => 'pos*', 'icon' => 'shopping-cart', 'label' => 'Ventas (POS)'],
                        ['route' => 'products.index', 'pattern' => 'productos*', 'icon' => 'package', 'label' => 'Gestión de Productos'],
                        ['route' => 'movements.index', 'pattern' => 'movimientos*', 'icon' => 'clipboard-list', 'label' => 'Inventario & Movimientos'],
                        ['route' => 'credits.index', 'pattern' => 'creditos*', 'icon' => 'credit-card', 'label' => 'Créditos'],
                        ['route' => 'backup.index', 'pattern' => 'backup*', 'icon' => 'shield-check', 'label' => 'Backup y Seguridad'],
                        ['route' => 'cash.index', 'pattern' => 'caja*', 'icon' => 'banknote', 'label' => 'Caja'],
                        ['route' => 'customers.index', 'pattern' => 'clientes*', 'icon' => 'users', 'label' => 'Gestión de Clientes'],
                        ['route' => 'users.index', 'pattern' => 'usuarios*', 'icon' => 'user-cog', 'label' => 'Usuarios & Roles'],
                        ['route' => 'settings.index', 'pattern' => 'ajustes*', 'icon' => 'sliders-horizontal', 'label' => 'Ajuste del Sistema'],
                    ];
                @endphp

                @foreach($navItems as $item)
                    @php
                        $isActive = request()->is($item['pattern']) || (request()->routeIs('dashboard') && $item['route'] === 'dashboard');
                    @endphp
                    <a href="{{ route($item['route']) }}" 
                       class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group {{ $isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white' }}">
                        <i data-lucide="{{ $item['icon'] }}" class="w-5 h-5 shrink-0 {{ $isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300' }}"></i>
                        <span x-show="!sidebarCollapsed" class="truncate font-medium">{{ $item['label'] }}</span>
                    </a>
                @endforeach
            </div>

            <!-- Sidebar Bottom: Logout & Collapse Action (EXACTLY AS IN SCREENSHOT) -->
            <div class="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
                
                <!-- BOTÓN SALIR DEL SISTEMA (RED / PINK AS IN SCREENSHOT) -->
                <form action="{{ route('logout') }}" method="POST" class="w-full">
                    @csrf
                    <button type="submit" 
                            class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition group">
                        <i data-lucide="log-out" class="w-5 h-5 text-rose-500 group-hover:text-rose-600 shrink-0"></i>
                        <span x-show="!sidebarCollapsed" class="truncate font-bold">Salir del Sistema</span>
                    </button>
                </form>

                <!-- CONTRAER BARRA -->
                <button @click="sidebarCollapsed = !sidebarCollapsed" 
                        class="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition">
                    <i data-lucide="chevron-left" :class="sidebarCollapsed ? 'rotate-180' : ''" class="w-4 h-4 transition-transform duration-300 shrink-0"></i>
                    <span x-show="!sidebarCollapsed">CONTRAER BARRA</span>
                </button>
            </div>
        </aside>

        <!-- MAIN CONTENT WRAPPER -->
        <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
            
            <!-- TOP NAVBAR -->
            <header class="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 shadow-xs">
                <!-- Breadcrumb / View Title -->
                <div class="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    @yield('title_badge', 'DASHBOARD / ESTADÍSTICAS')
                </div>

                <!-- Right Header Controls -->
                <div class="flex items-center gap-3">
                    <!-- Botón Instalar App (PWA) -->
                    <button id="btnInstallPwa" style="display: none;" 
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-2xs">
                        <i data-lucide="download-cloud" class="w-3.5 h-3.5"></i>
                        <span>INSTALAR APP</span>
                    </button>

                    <!-- Modo Claro / Modo Oscuro Toggle -->
                    <button @click="darkMode = !darkMode; localStorage.setItem('theme', darkMode ? 'dark' : 'light')" 
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <i x-show="!darkMode" data-lucide="moon" class="w-3.5 h-3.5 text-slate-600"></i>
                        <i x-show="darkMode" data-lucide="sun" class="w-3.5 h-3.5 text-amber-400"></i>
                        <span x-text="darkMode ? 'MODO OSCURO' : 'MODO CLARO'"></span>
                    </button>

                    <!-- Estado de Caja Pill -->
                    @php
                        $activeBox = \App\Models\CashRegister::where('status', 'open')->latest()->first();
                        $authUser = auth()->user() ?? \App\Models\User::first();
                    @endphp
                    <a href="{{ route('cash.index') }}" class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border {{ $activeBox ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-700 border-rose-200' }}">
                        <span class="w-2 h-2 rounded-full {{ $activeBox ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500' }}"></span>
                        <span>{{ $activeBox ? 'CAJA ABIERTA' : 'CAJA CERRADA' }}</span>
                    </a>

                    <!-- User Profile Dropdown Pill (DYNAMIC FROM DATABASE ROLE) -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" class="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <div class="w-8 h-8 rounded-full {{ ($authUser->role ?? 'administrador') === 'administrador' ? 'bg-blue-100 text-blue-600' : (($authUser->role ?? '') === 'cajero' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600') }} flex items-center justify-center font-black text-xs">
                                {{ substr($authUser->name ?? 'J', 0, 2) }}
                            </div>
                            <div class="text-left hidden sm:block">
                                <p class="text-xs font-bold text-slate-800 dark:text-white leading-tight">{{ $authUser->name ?? 'Jairo' }}</p>
                                <p class="text-[10px] font-extrabold uppercase {{ ($authUser->role ?? 'administrador') === 'administrador' ? 'text-blue-600 dark:text-blue-400' : (($authUser->role ?? '') === 'cajero' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400') }}">
                                    {{ $authUser->role_label ?? 'ADMINISTRADOR' }}
                                </p>
                            </div>
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
                        </button>

                        <!-- Dropdown Menu -->
                        <div x-show="open" @click.away="open = false" x-cloak
                             class="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-700 text-xs">
                                <p class="font-bold text-slate-800 dark:text-white">{{ $authUser->name ?? 'Usuario' }}</p>
                                <p class="text-[11px] text-slate-400 font-mono truncate">{{ $authUser->email ?? 'admin@sendasistemas.com' }}</p>
                            </div>
                            <a href="{{ route('users.index') }}" class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <i data-lucide="users" class="w-4 h-4 text-blue-500"></i> Gestión de Usuarios
                            </a>
                            <a href="{{ route('settings.index') }}" class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <i data-lucide="settings" class="w-4 h-4 text-slate-500"></i> Configuración del Sistema
                            </a>
                            <div class="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                            <form action="{{ route('logout') }}" method="POST">
                                @csrf
                                <button type="submit" class="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                                    <i data-lucide="log-out" class="w-4 h-4"></i> Cerrar Sesión
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <!-- NOTIFICATIONS -->
            @if(session('success'))
                <div class="mx-6 mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs">
                    <div class="flex items-center gap-2 text-sm font-semibold">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
                        <span>{{ session('success') }}</span>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="mx-6 mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-xs">
                    <div class="flex items-center gap-2 text-sm font-semibold">
                        <i data-lucide="alert-circle" class="w-5 h-5 text-rose-600"></i>
                        <span>{{ session('error') }}</span>
                    </div>
                </div>
            @endif

            <!-- MAIN VIEW BODY -->
            <main class="flex-1 p-6">
                @yield('content')
            </main>
        </div>
    </div>

    <!-- Initialize Lucide Icons & PWA Service Worker -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
        document.addEventListener('alpine:initialized', () => {
            lucide.createIcons();
        });

        // PWA Service Worker Registration & Installation Prompt
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SendaFact PWA ServiceWorker registrado con éxito', reg.scope))
                .catch(err => console.log('Error registrando ServiceWorker:', err));
        }

        let deferredPrompt;
        const btnInstallPwa = document.getElementById('btnInstallPwa');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (btnInstallPwa) {
                btnInstallPwa.style.display = 'inline-flex';
            }
        });

        if (btnInstallPwa) {
            btnInstallPwa.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                    btnInstallPwa.style.display = 'none';
                }
            });
        }

        window.addEventListener('appinstalled', () => {
            if (btnInstallPwa) {
                btnInstallPwa.style.display = 'none';
            }
            console.log('SendaFact App instalada exitosamente');
        });
    </script>
    @stack('scripts')
</body>
</html>