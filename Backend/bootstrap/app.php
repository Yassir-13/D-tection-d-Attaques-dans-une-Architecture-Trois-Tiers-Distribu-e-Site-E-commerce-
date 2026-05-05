<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\RequestAuditLogger::class,  // ← AJOUT : après CORS (IP réelle dispo), avant SecurityHeaders
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
        $middleware->statefulApi();

        // Register named middleware aliases
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
        // Note: rate limiting is applied per-route in api.php (throttle:10,1 on auth routes)
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();