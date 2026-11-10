@echo off
title SBL EHS Mobile Control Tower
echo ===================================================
echo   SBL SPECIALTY COATINGS - EHS CONTROL TOWER MOBILE
echo ===================================================
echo.
echo Starting local mobile dev server...
echo Access on your Mobile phone via: http://localhost:5173
echo or via your computer's Wi-Fi / LAN IP address.
echo.
call npm run dev -- --host
pause
