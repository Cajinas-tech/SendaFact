<!DOCTYPE html>
<html lang="es" x-data="{ darkMode: localStorage.getItem('theme') === 'dark' }" :class="{ 'dark': darkMode }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - SendaFact POS</title>
    
    <!-- PWA & Mobile App Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#2563eb">
    <link rel="apple-touch-icon" href="/images/logo/senda-logo.svg">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="SendaFact">
    <link rel="icon" type="image/svg+xml" href="/images/logo/senda-logo.svg">
    
    <!-- Google Fonts -->
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
                    }
                }
            }
        }
    </script>
    
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-[#f4f7fb] dark:bg-[#0b1120] text-[#1e293b] dark:text-[#f1f5f9] font-sans antialiased min-h-screen flex items-center justify-center p-4 transition-colors duration-200">

    <div class="max-w-md w-full space-y-6">
        
        <!-- Brand Header -->
        <div class="text-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-[#090d16] flex items-center justify-center shadow-xl p-2 mx-auto overflow-hidden">
                <img src="/images/logo/senda-logo.svg" alt="Senda Logo" class="w-full h-full object-contain">
            </div>
            <div>
                <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    SENDA <span class="text-blue-600">SISTEMAS</span>
                </h1>
                <span class="inline-block mt-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                    SISTEMA V3.0 (LARAVEL + SUPABASE)
                </span>
            </div>
        </div>

        <!-- Login Card -->
        <div class="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-6">
            
            <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase">Acceso al Sistema</h2>
                <p class="text-xs text-slate-400 mt-0.5">Ingresa tus credenciales registradas en la base de datos.</p>
            </div>

            @if(session('success'))
                <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if($errors->any())
                <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <i data-lucide="alert-circle" class="w-4 h-4 text-rose-600 shrink-0"></i>
                    <span>{{ $errors->first() }}</span>
                </div>
            @endif

            <!-- Form -->
            <form action="/login" method="POST" class="space-y-4" id="loginForm">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Correo Electrónico</label>
                    <div class="relative">
                        <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                        <input type="email" name="email" id="emailInput" value="{{ old('email', 'jairotten84@gmail.com') }}" required 
                               placeholder="jairotten84@gmail.com"
                               class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Contraseña</label>
                    <div class="relative">
                        <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                        <input type="password" name="password" id="passwordInput" required 
                               placeholder="Ingresa tu contraseña"
                               class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs">
                    <label class="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                        <input type="checkbox" name="remember" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked>
                        <span>Recordar sesión</span>
                    </label>
                </div>

                <button type="submit" 
                        class="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    INICIAR SESIÓN
                </button>
            </form>

            <!-- Quick Demo Accounts (Roles) -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Acceso Rápido por Rol (Base de Datos)
                </span>
                
                <div class="grid grid-cols-3 gap-2">
                    <button type="button" onclick="setCredentials('jairotten84@gmail.com', '')"
                            class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-center transition">
                        <span class="block text-xs font-black text-blue-600 dark:text-blue-400">👑 Admin</span>
                        <span class="block text-[9px] text-slate-400">Jairo</span>
                    </button>

                    <button type="button" onclick="setCredentials('cajero@sendasistemas.com', 'cajero123')"
                            class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition">
                        <span class="block text-xs font-black text-emerald-600 dark:text-emerald-400">💵 Cajero</span>
                        <span class="block text-[9px] text-slate-400">María</span>
                    </button>

                    <button type="button" onclick="setCredentials('vendedor@sendasistemas.com', 'vendedor123')"
                            class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-center transition">
                        <span class="block text-xs font-black text-purple-600 dark:text-purple-400">🏷️ Vendedor</span>
                        <span class="block text-[9px] text-slate-400">Carlos</span>
                    </button>
                </div>
            </div>

        </div>

        <p class="text-center text-xs text-slate-400">
            SendaFact POS • Conectado a Supabase PostgreSQL
        </p>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });

        function setCredentials(email, pass) {
            document.getElementById('emailInput').value = email;
            const passInput = document.getElementById('passwordInput');
            if (pass) {
                passInput.value = pass;
            } else {
                passInput.value = '';
                passInput.focus();
            }
        }
    </script>
</body>
</html>