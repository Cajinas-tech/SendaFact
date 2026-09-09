<?php

// Sanitize oversized incoming cookies from previous requests to prevent Header Overflow
if (isset($_SERVER['HTTP_COOKIE']) && strlen($_SERVER['HTTP_COOKIE']) > 3000) {
    $cookies = explode(';', $_SERVER['HTTP_COOKIE']);
    $cleanCookies = [];
    foreach ($cookies as $c) {
        if (strlen($c) < 1000) {
            $cleanCookies[] = $c;
        }
    }
    $_SERVER['HTTP_COOKIE'] = implode(';', $cleanCookies);
}

// Preparar directorios en /tmp para el entorno serverless de Vercel
$tmpStorage = '/tmp/storage';
if (!is_dir($tmpStorage . '/framework/views')) {
    @mkdir($tmpStorage . '/framework/views', 0777, true);
    @mkdir($tmpStorage . '/framework/cache/data', 0777, true);
    @mkdir($tmpStorage . '/framework/sessions', 0777, true);
    @mkdir($tmpStorage . '/logs', 0777, true);
    @mkdir($tmpStorage . '/app/public', 0777, true);
}

putenv('VIEW_COMPILED_PATH=' . $tmpStorage . '/framework/views');
putenv('APP_CONFIG_CACHE=/tmp/config.php');
putenv('APP_EVENTS_CACHE=/tmp/events.php');
putenv('APP_PACKAGES_CACHE=/tmp/packages.php');
putenv('APP_ROUTES_CACHE=/tmp/routes.php');
putenv('APP_SERVICES_CACHE=/tmp/services.php');
putenv('SESSION_DRIVER=file');
putenv('SESSION_PATH=' . $tmpStorage . '/framework/sessions');

// Requerir el punto de entrada normal de Laravel
require __DIR__ . '/../public/index.php';
