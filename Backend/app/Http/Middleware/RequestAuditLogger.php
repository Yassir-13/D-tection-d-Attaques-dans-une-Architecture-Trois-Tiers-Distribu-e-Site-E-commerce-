<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequestAuditLogger
{
    /**
     * Handle an incoming request.
     * Écrit chaque requête en JSONL dans storage/logs/audit.jsonl
     * Lu en temps réel par l'app_agent Python.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Démarrer le chrono AVANT de passer la requête au reste de la stack
        $startTime = defined('LARAVEL_START') ? LARAVEL_START : microtime(true);

        // Laisser la requête traverser toute la stack
        $response = $next($request);

        // ─── Calculer le temps de réponse ─────────────────────────────────────
        $responseTimeMs = (int) round((microtime(true) - $startTime) * 1000);

        // ─── IP réelle (Nginx injecte X-Real-IP, sinon fallback) ──────────────
        $ip = $request->header('X-Real-IP')
            ?? $request->header('X-Forwarded-For')
            ?? $request->ip();

        // Si X-Forwarded-For contient plusieurs IPs (chain), prendre la première
        if (str_contains((string) $ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        // ─── Token hash (Bearer token tronqué — proxy de session) ─────────────
        $tokenHash = null;
        $authHeader = $request->header('Authorization', '');
        if (str_starts_with($authHeader, 'Bearer ')) {
            $rawToken = substr($authHeader, 7);
            // On hash pour ne pas stocker le token en clair dans les logs
            $tokenHash = substr(hash('sha256', $rawToken), 0, 16);
        }

        // ─── User ID (null si non authentifié) ────────────────────────────────
        $userId = null;
        try {
            $user = $request->user();
            $userId = $user?->id;
        } catch (\Throwable) {
            // Sanctum peut lever une exception si le token est invalide
            $userId = null;
        }

        // ─── Détection des flags métier ───────────────────────────────────────
        $uri    = $request->getRequestUri();
        $method = $request->method();
        $status = $response->getStatusCode();

        // Tentative de login (POST /api/login)
        $isAuthAttempt = ($method === 'POST' && str_contains($uri, '/api/login'));

        // Route admin (/api/admin/*)
        $isAdminRoute = str_contains($uri, '/api/admin');

        // Throttle hit (429 sur routes auth)
        $isThrottleHit = ($status === 429);

        // ─── Construction de l'entrée JSONL ───────────────────────────────────
        $entry = [
            'timestamp'        => date('c'),               // ISO 8601
            'session_token_hash' => $tokenHash,
            'user_id'          => $userId,
            'ip'               => $ip,
            'method'           => $method,
            'uri'              => $uri,
            'route'            => optional($request->route())->getName(),
            'status'           => $status,
            'response_time_ms' => $responseTimeMs,
            'user_agent'       => $request->userAgent(),
            'content_length'   => (int) $request->header('Content-Length', 0),
            'auth_attempt'     => $isAuthAttempt,
            'is_admin_route'   => $isAdminRoute,
            'throttle_hit'     => $isThrottleHit,
        ];

        // ─── Écriture JSONL directe (pas via Monolog pour garder un format pur) ─
        // app_agent lit ce fichier ligne par ligne avec json.loads()
        $logPath = storage_path('logs/audit.jsonl');
        $line    = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;

        // FILE_APPEND + LOCK_EX pour éviter les corruptions en concurrence (PHP-FPM multi-process)
        file_put_contents($logPath, $line, FILE_APPEND | LOCK_EX);

        return $response;
    }
}