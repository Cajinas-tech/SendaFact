<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SendaAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificar cookie directa ultra-persistente para Vercel
        if (isset($_COOKIE['senda_auth_token']) || isset($_COOKIE['senda_user'])) {
            return $next($request);
        }

        // 2. Verificar sesión o Auth estándar
        if (session('is_authenticated') || Auth::check()) {
            return $next($request);
        }

        return redirect()->route('login');
    }
}
