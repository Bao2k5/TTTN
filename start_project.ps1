$currentDir = Get-Location

Write-Host "Starting HM Jewelry Smart System..." -ForegroundColor Green

# 1. Start Backend
Write-Host "Launching Backend (Node.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Web-App'; npm run dev"

# 2. Start Frontend
Write-Host "Launching Frontend (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Web-App/FE'; npm run dev"

# 3. Start AI Service
Write-Host "Launching Edge AI (Python)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'AI-Service'; python Hybrid_EdgeAI_FaceRecognition.py"

Write-Host "All systems started! Please check the opened windows." -ForegroundColor Green
