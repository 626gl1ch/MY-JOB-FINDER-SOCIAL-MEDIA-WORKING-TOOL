# build_android.ps1
# Automates the creation of the Android APK

Write-Host "Setting up Android Build Environment..." -ForegroundColor Cyan

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 1. Download and extract Portable JDK 17 if missing
$jdkDir = "$PSScriptRoot\.jdk"
if (-Not (Test-Path "$jdkDir\jdk-17.0.10+7")) {
    Write-Host "Downloading OpenJDK 17 (Eclipse Temurin) using curl.exe..." -ForegroundColor Yellow
    $zipPath = "$PSScriptRoot\jdk.zip"
    
    # Remove corrupt zip if exists
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    # Use native curl for more reliable downloading and automatic redirect following (-L)
    curl.exe -L -o $zipPath "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip"
    
    if (Test-Path $zipPath) {
        Write-Host "Extracting JDK (this may take a minute)..." -ForegroundColor Yellow
        Expand-Archive -Path $zipPath -DestinationPath $jdkDir -Force
        Remove-Item $zipPath -Force
    } else {
        Write-Host "Failed to download JDK zip file!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "JDK 17 already exists at $jdkDir" -ForegroundColor Green
}

# 2. Set JAVA_HOME and PATH for this session
$env:JAVA_HOME = "$jdkDir\jdk-17.0.10+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
Write-Host "JAVA_HOME set to $env:JAVA_HOME" -ForegroundColor Green

# 3. Build Web App
Write-Host "Building web frontend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm run build

# 4. Sync Capacitor
Write-Host "Syncing Android project..." -ForegroundColor Cyan
npx cap sync android

# 5. Build APK
Write-Host "Building Android APK via Gradle..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend\android"
.\gradlew.bat assembleDebug

# 6. Announce Path
$apkPath = "$PSScriptRoot\frontend\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Your APK is ready at: $apkPath" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Green
} else {
    Write-Host "Build failed or APK not found." -ForegroundColor Red
}

Set-Location -Path "$PSScriptRoot"
