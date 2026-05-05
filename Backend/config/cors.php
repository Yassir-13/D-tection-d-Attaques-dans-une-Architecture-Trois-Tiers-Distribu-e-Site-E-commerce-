<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',       // dev local (Vite)
        'http://127.0.0.1:5173',      // dev local (Vite)
        'http://localhost:8000',       // FIX: Docker (Nginx sert React sur :8000)
        'http://127.0.0.1:8000',      // FIX: Docker variante IP
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];