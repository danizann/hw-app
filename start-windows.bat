@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Hoodwood Windows One-Click Launcher
echo ========================================
echo.

call :ensure_node
if errorlevel 1 exit /b 1

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

start "Hoodwood Dev Server" cmd /k "cd /d "%~dp0" && npm run dev"
if errorlevel 1 goto :error

echo [INFO] Setup selesai. Server berjalan di jendela "Hoodwood Dev Server".
echo [INFO] Jangan tutup jendela server jika aplikasi masih dipakai.
pause
exit /b 0

:error
echo.
echo [ERROR] Setup gagal. Periksa pesan error di atas.
pause
exit /b 1

:ensure_node
where node >nul 2>nul
if errorlevel 1 (
  echo [WARN] Node.js tidak ditemukan di PATH.
  echo [INFO] Mencoba install Node.js LTS otomatis via winget...
  where winget >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] winget tidak tersedia untuk install otomatis.
    echo Install Node.js LTS dulu dari https://nodejs.org lalu jalankan ulang script ini.
    pause
    exit /b 1
  )

  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
  if errorlevel 1 (
    echo [ERROR] Gagal install Node.js otomatis via winget.
    echo Silakan install Node.js LTS manual dari https://nodejs.org lalu jalankan ulang script ini.
    pause
    exit /b 1
  )

  call :setup_node_path
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js masih belum terdeteksi.
  echo Tutup terminal ini, lalu jalankan lagi start-windows.bat.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  call :setup_node_path
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan.
  echo Pastikan instalasi Node.js sudah benar, lalu jalankan ulang script ini.
  pause
  exit /b 1
)

exit /b 0

:setup_node_path
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
)
exit /b 0