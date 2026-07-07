@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Hoodwood Windows One-Click Launcher
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  echo Install Node.js LTS terlebih dahulu dari https://nodejs.org
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan.
  echo Pastikan instalasi Node.js sudah benar.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo [INFO] File .env dibuat dari .env.example
  ) else (
    echo [ERROR] .env.example tidak ditemukan.
    pause
    exit /b 1
  )
)

set "NEED_SEED=0"
if not exist "prisma\dev.db" set "NEED_SEED=1"

echo [1/5] Install dependency...
call npm install
if errorlevel 1 goto :error

echo [2/5] Generate Prisma client...
call npx prisma generate
if errorlevel 1 goto :error

echo [3/5] Apply migration...
call npx prisma migrate deploy
if errorlevel 1 goto :error

if "%NEED_SEED%"=="1" (
  echo [4/5] Seed database awal...
  call npx prisma db seed
  if errorlevel 1 goto :error
) else (
  echo [4/5] Seed database dilewati (prisma\dev.db sudah ada).
)

echo [5/5] Menjalankan Next.js dev server...
echo.
echo URL: http://localhost:3000
start "" "http://localhost:3000"
call npm run dev
if errorlevel 1 goto :error

exit /b 0

:error
echo.
echo [ERROR] Setup gagal. Periksa pesan error di atas.
pause
exit /b 1