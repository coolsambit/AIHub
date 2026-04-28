# Start both backend and frontend dev servers
# Usage: .\start-dev.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend — uvicorn with auto-reload
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    cd '$root\AIHubBackend\src';
    & '$root\AIHubBackend\.venv\Scripts\Activate.ps1';
    uvicorn coreAPIs.main:app --host 0.0.0.0 --port 8020 --reload
" -WindowStyle Normal

# Frontend — Vite dev server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    cd '$root\FoundryPortal';
    npm run dev
" -WindowStyle Normal

Write-Host "Both servers starting in separate windows." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8020" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
