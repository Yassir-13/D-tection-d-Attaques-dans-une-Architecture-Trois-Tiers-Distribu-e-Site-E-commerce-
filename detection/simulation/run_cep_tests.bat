@echo off
echo ══════════════════════════════════════════════════
echo   CEP Correlation Rules Test Suite
echo   CEP-1 deja valide  ·  Test CEP-2 → CEP-7
echo ══════════════════════════════════════════════════

pip install requests -q 2>nul

echo.
echo --- Etape 1 : Vider le state Redis (clean start) ---
docker exec first-born-redis-1 redis-cli -n 2 FLUSHDB
echo.

echo --- Etape 2 : Lancement des tests CEP ---
echo.

if "%1"=="" (
    echo [*] Lancement de TOUS les tests CEP-2 a CEP-7
    python test_cep_rules.py
) else (
    echo [*] Lancement du test %*
    python test_cep_rules.py %*
)

echo.
echo --- Etape 3 : Verification des resultats ---
echo.
echo [LOGS] Derniers logs du correlation_engine :
docker logs first-born-correlation_engine-1 --tail 30 2>&1 | findstr /i "CORRELATED CEP"

echo.
echo [KAFKA] Alertes correlees dans le topic :
docker exec first-born-kafka-1 kafka-console-consumer --bootstrap-server localhost:9092 --topic alerts.correlated --from-beginning --timeout-ms 5000 2>nul

echo.
echo ══════════════════════════════════════════════════
echo   Tests termines ! Voir Grafana: http://localhost:3000
echo ══════════════════════════════════════════════════
pause
