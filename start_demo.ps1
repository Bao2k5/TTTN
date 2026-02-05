$currentDir = Get-Location

Write-Host "Starting HM Jewelry DEMO (AI + Virtual IoT)..." -ForegroundColor Green

# 1. Start AI Service
Write-Host "Launching AI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'AI-Service'; python Hybrid_EdgeAI_FaceRecognition.py"

# 2. Start Virtual ESP32
Write-Host "Launching Virtual ESP32..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python Virtual_ESP32.py"

Write-Host "Demo systems started!" -ForegroundColor Green
