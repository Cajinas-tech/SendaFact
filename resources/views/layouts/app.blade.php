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
        /* Barra de Desplazamiento Visible Permanente para el Menú Lateral */
        .sidebar-scroll {
            overflow-y: scroll !important;
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #e2e8f0;
        }
        .dark .sidebar-scroll {
            scrollbar-color: #3b82f6 #1e293b;
        }
        .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
            display: block;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 9999px;
            margin: 6px 0;
        }
        .dark .sidebar-scroll::-webkit-scrollbar-track {
            background: #1e293b;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 9999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
        }
    </style>
    @stack('styles')
</head>
<body class="bg-[#f4f7fb] dark:bg-[#0b1120] text-[#1e293b] dark:text-[#f1f5f9] font-sans antialiased h-screen overflow-hidden transition-colors duration-200">
    <div class="flex h-screen w-full overflow-hidden">
        
        <!-- SIDEBAR (INDEPENDENT FIXED HEIGHT CONTAINER) -->
        <aside :class="sidebarCollapsed ? 'w-20' : 'w-64'" 
               class="bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none shadow-sm">
            
            <!-- Sidebar Top: Brand Logo (Pinned Top) -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-[#070b14] flex items-center justify-center shadow-lg shadow-blue-950/40 p-1 shrink-0 overflow-hidden border border-slate-800/80">
                        <img src="/images/logo/senda-logo.png" alt="Senda Sistemas" class="w-full h-full object-contain">
                    </div>
                    <div x-show="!sidebarCollapsed" class="overflow-hidden">
                        <h1 class="font-black text-sm tracking-tight uppercase leading-tight flex items-center gap-1">
                            <span class="text-blue-500 font-extrabold tracking-wider">SENDA</span> 
                            <span class="text-amber-400 font-extrabold tracking-wider">SISTEMAS</span>
                        </h1>
                        <!-- Blue and Gold Brand Accent Line -->
                        <div class="h-0.5 w-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 rounded-full my-1"></div>
                        <div class="inline-block">
                            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 uppercase">
                                SISTEMA V3.0 (POS)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Navigation Items (INDEPENDENT VERTICAL SCROLL) -->
            <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scroll overscroll-contain">
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

            <!-- Sidebar Bottom: Logout & Collapse Action (Pinned Bottom) -->
            <div class="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1 shrink-0 bg-white dark:bg-[#0f172a]">
                
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

        <!-- MAIN CONTENT WRAPPER (INDEPENDENT SCROLL) -->
        <div class="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
            
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
                        $activeBox = null;
                        try {
                            $activeBox = \App\Models\CashRegister::where('status', 'open')->latest()->first();
                        } catch (\Throwable $e) {}
                        
                        $cookieUser = null;
                        if (isset($_COOKIE['senda_user'])) {
                            $cookieUser = json_decode($_COOKIE['senda_user'], true);
                        }
                        
                        $currentName = $cookieUser['name'] ?? session('user_name') ?? (auth()->user()->name ?? 'Jairo');
                        $currentEmail = $cookieUser['email'] ?? session('user_email') ?? (auth()->user()->email ?? 'jairotten84@gmail.com');
                        $currentRole = $cookieUser['role'] ?? session('user_role') ?? (auth()->user()->role ?? 'administrador');
                        $currentRoleLabel = strtoupper($currentRole);
                    @endphp
                    <a href="{{ route('cash.index') }}" class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border {{ $activeBox ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' }}">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{{ $activeBox ? 'CAJA ABIERTA' : 'CAJA LISTA' }}</span>
                    </a>

                    <!-- User Profile Dropdown Pill (DYNAMIC FROM DATABASE ROLE) -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" class="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <div class="w-8 h-8 rounded-full {{ $currentRole === 'administrador' ? 'bg-blue-100 text-blue-600' : ($currentRole === 'cajero' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600') }} flex items-center justify-center font-black text-xs">
                                {{ substr($currentName, 0, 2) }}
                            </div>
                            <div class="text-left hidden sm:block">
                                <p class="text-xs font-bold text-slate-800 dark:text-white leading-tight">{{ $currentName }}</p>
                                <p class="text-[10px] font-extrabold uppercase {{ $currentRole === 'administrador' ? 'text-blue-600 dark:text-blue-400' : ($currentRole === 'cajero' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400') }}">
                                    {{ $currentRoleLabel }}
                                </p>
                            </div>
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
                        </button>

                        <!-- Dropdown Menu -->
                        <div x-show="open" @click.away="open = false" x-cloak
                             class="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-700 text-xs">
                                <p class="font-bold text-slate-800 dark:text-white">{{ $currentName }}</p>
                                <p class="text-[11px] text-slate-400 font-mono truncate">{{ $currentEmail }}</p>
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