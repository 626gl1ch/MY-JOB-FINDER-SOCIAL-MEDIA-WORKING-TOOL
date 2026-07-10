# build_with_java21.ps1
# Automates downloading JDK 21 and building the APK

$jdkDir = "$PSScriptRoot\.jdk21"
$env:ANDROID_HOME = "$PSScriptRoot\.android-sdk"

Write-Host "Setting up Java 21 Environment..." -ForegroundColor Cyan

if (-Not (Test-Path "$jdkDir\jdk-21.0.3+9")) {
    Write-Host "Downloading OpenJDK 21 (Eclipse Temurin) using curl.exe..." -ForegroundColor Yellow
    $zipPath = "$PSScriptRoot\jdk21.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    curl.exe -L -o $zipPath "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.3%2B9/OpenJDK21U-jdk_x64_windows_hotspot_21.0.3_9.zip"
    
    if (Test-Path $zipPath) {
        Write-Host "Extracting JDK 21 (this may take a minute)..." -ForegroundColor Yellow
        Expand-Archive -Path $zipPath -DestinationPath $jdkDir -Force
        Remove-Item $zipPath -Force
    } else {
        Write-Host "Failed to download JDK 21 zip file!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "JDK 21 already exists at $jdkDir" -ForegroundColor Green
}

$env:JAVA_HOME = "$jdkDir\jdk-21.0.3+9"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
Write-Host "JAVA_HOME set to $env:JAVA_HOME" -ForegroundColor Green

Write-Host "Building Web Frontend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm run build

Write-Host "Syncing assets to Capacitor..." -ForegroundColor Cyan
npx cap sync

Write-Host "Building final APK with Java 21..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend\android"

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
        Write-Host "Build failed. Retrying in 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $retryCount++
    }
}

if ($success) {
    $apkPath = "$PSScriptRoot\frontend\android\app\build\outputs\apk\debug\app-debug.apk"
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL! APK is ready at: $apkPath" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Green
} else {
    Write-Host "Build failed after $maxRetries attempts." -ForegroundColor Red
}
