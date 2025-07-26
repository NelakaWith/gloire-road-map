@echo off
REM === Start MySQL Service (edit if using XAMPP) ===
net start mysql
REM If using XAMPP, replace above with: call "C:\xampp\xampp_start.exe"

REM === Start Backend ===
start cmd /k "cd /d %~dp0backend && npm install && npm run dev"

REM === Start Frontend ===
start cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

REM === Instructions ===
echo Servers starting. Open http://localhost:5173 in your browser.
pause
