@echo off
cd /d "%~dp0"
start "Succes Bac SM" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
timeout /t 2 /nobreak >nul
start http://127.0.0.1:8765/
