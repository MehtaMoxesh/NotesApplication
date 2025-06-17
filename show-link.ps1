Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SMART NOTES APP - PROJECT LINK" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your project is running at:" -ForegroundColor Green
Write-Host ""
Write-Host "    http://localhost:5173/" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"
Write-Host ""
Write-Host "Browser should open automatically!" -ForegroundColor Green
Write-Host "If not, manually copy and paste: http://localhost:5173/" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue" 