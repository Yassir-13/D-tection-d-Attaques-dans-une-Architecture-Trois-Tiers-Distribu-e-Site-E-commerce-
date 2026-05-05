@echo off
echo ==============================
echo  Three-Tier Attack Simulation
echo ==============================

pip install -r requirements.txt -q

echo --- [1/7] Trafic normal ---
python simulate_normal_traffic.py
timeout /t 2 /nobreak >nul

echo --- [2/7] SQLi (CEP-1) ---
python simulate_sqli.py
timeout /t 5 /nobreak >nul

echo --- [3/7] XSS ---
python simulate_xss.py
timeout /t 2 /nobreak >nul

echo --- [4/7] DDoS ---
python simulate_ddos.py
timeout /t 2 /nobreak >nul

echo --- [5/7] Brute-force ---
python simulate_bruteforce.py
timeout /t 2 /nobreak >nul

echo --- [6/7] Scanner ---
python simulate_scanner.py
timeout /t 2 /nobreak >nul

echo --- [7/7] Path traversal ---
python simulate_path_traversal.py

echo ==============================
echo  Simulation terminee !
echo  Grafana : http://localhost:3000
echo ==============================
pause