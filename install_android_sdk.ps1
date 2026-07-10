# install_android_sdk.ps1
# Automates the downloading of the Android SDK and compilation

$sdkDir = "$PSScriptRoot\.android-sdk"
$env:ANDROID_HOME = $sdkDir

# Need Java to run sdkmanager
$env:JAVA_HOME = "$PSScriptRoot\.jdk\jdk-17.0.10+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Setting up Android SDK Environment..." -ForegroundColor Cyan

if (-Not (Test-Path "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat")) {
    Write-Host "Downloading Android Command Line Tools..." -ForegroundColor Yellow
    $zipPath = "$PSScriptRoot\cmdlinetools.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    curl.exe -L -o $zipPath "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    
    if (Test-Path $zipPath) {
        Write-Host "Extracting Command Line Tools..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools\latest" | Out-Null
        Expand-Archive -Path $zipPath -DestinationPath "$sdkDir\cmdline-tools\latest" -Force
        # The zip contains a 'cmdline-tools' folder inside, so we need to move its contents up
        Move-Item -Path "$sdkDir\cmdline-tools\latest\cmdline-tools\*" -Destination "$sdkDir\cmdline-tools\latest" -Force
        Remove-Item "$sdkDir\cmdline-tools\latest\cmdline-tools" -Recurse -Force
        Remove-Item $zipPath -Force
    } else {
        Write-Host "Failed to download Command Line Tools!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Accepting Licenses..." -ForegroundColor Yellow
$yesString = "y`n" * 50
$yesString | & "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat" --licenses

Write-Host "Downloading Android Platforms and Build Tools (This will take a while)..." -ForegroundColor Yellow
& "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;34.0.0" "platforms;android-34" "platform-tools"

Write-Host "Setting local.properties..." -ForegroundColor Yellow
$localProperties = "$PSScriptRoot\frontend\android\local.properties"
"sdk.dir=$($sdkDir.Replace('\', '\\'))" | Out-File -FilePath $localProperties -Encoding utf8

Write-Host "Building final APK..." -ForegroundColor Cyan
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
