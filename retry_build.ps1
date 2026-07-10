# retry_build.ps1
$env:JAVA_HOME = "C:\Users\DANIEL\MY JOB-FINDER-SOCIAL-MEDIA-WORKING-TOOL\.jdk\jdk-17.0.10+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
cd frontend\android

$maxRetries = 10
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries) {
    Write-Host "Starting Gradle build (Attempt $($retryCount + 1) of $maxRetries)..." -ForegroundColor Cyan
    .\gradlew.bat assembleDebug
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build Successful!" -ForegroundColor Green
        $success = $true
        break
    } else {
        Write-Host "Build failed due to network timeout. Retrying in 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $retryCount++
    }
}

if (-Not $success) {
    Write-Host "Build failed after $maxRetries attempts." -ForegroundColor Red
}
