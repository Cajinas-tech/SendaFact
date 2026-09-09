<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'pos/store',
            'ajustes/test-supabase',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

// Configurar almacenamiento temporal /tmp para Vercel Serverless
if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || env('VERCEL') || env('APP_ENV') === 'production') {
    $tmpStorage = '/tmp/storage';
    if (!is_dir($tmpStorage . '/framework/views')) {
        @mkdir($tmpStorage . '/framework/views', 0777, true);
        @mkdir($tmpStorage . '/framework/cache/data', 0777, true);
        @mkdir($tmpStorage . '/framework/sessions', 0777, true);
        @mkdir($tmpStorage . '/logs', 0777, true);
        @mkdir($tmpStorage . '/app/public', 0777, true);
    }
    $app->useStoragePath($tmpStorage);
}

return $app;
