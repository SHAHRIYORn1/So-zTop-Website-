@echo off
title So'zTop - Ishga tushirish
color 0A
echo ============================================================
echo          SO'ZTOP TA'LIMIY O'YINLAR PLATFORMASI
echo ============================================================
echo.
echo 1. Python FastAPI Backend ishga tushirilmoqda (port 8000)...
cd /d "%~dp0server"
start "So'zTop Backend (FastAPI)" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. React Vite Frontend ishga tushirilmoqda (port 5173)...
cd /d "%~dp0"
start "So'zTop Frontend (Vite)" cmd /k "npm run dev"

echo.
echo Ikkala server ishga tushirildi!
echo Brauzerda http://localhost:5173 ochilmoqda...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo Dasturni to'xtatish uchun ochilgan ikkita qora oynani yopsangiz kifoya.
echo ============================================================
pause
