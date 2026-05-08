@echo off
echo.
echo  Suite de Simulation CEP - first-born
echo  ======================================
echo.

:: Verifier que Python est disponible
where python >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou pas dans le PATH.
    pause & exit /b 1
)

:: Installer requests si absent
pip install requests -q 2>nul

:: Changer vers le dossier simulation
cd /d "%~dp0"

:: Lancement
if "%1"=="" (
    echo [*] Lancement de tous les tests CEP-1 a CEP-7
    python run_all_cep.py
) else if "%1"=="--verify" (
    echo [*] Verification des resultats uniquement
    python run_all_cep.py --verify
) else (
    echo [*] Lancement: %*
    python run_all_cep.py %*
)

echo.
echo [GRAFANA] http://localhost:3000  (admin/admin)
echo.
pause
