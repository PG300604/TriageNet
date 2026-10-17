# TriageNet Companion Android APK Automated Build & Deploy Script
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$buildTools = "$env:USERPROFILE\AppData\Local\Android\Sdk\build-tools\28.0.3"
$platform = "$env:USERPROFILE\AppData\Local\Android\Sdk\platforms\android-28\android.jar"
$adbPath = "C:\Program Files\BlueStacks_msi5\HD-Adb.exe"

Write-Host "==> [1/7] Generating R.java with aapt..." -ForegroundColor Cyan
& "$buildTools\aapt.exe" package -f -m -J "$scriptDir\gen" -M "$scriptDir\AndroidManifest.xml" -S "$scriptDir\res" -I "$platform"

Write-Host "==> [2/7] Compiling Java sources with javac..." -ForegroundColor Cyan
javac.exe -source 1.8 -target 1.8 -d "$scriptDir\bin" -cp "$platform" "$scriptDir\gen\com\triagenet\companion\R.java" "$scriptDir\src\com\triagenet\companion\MainActivity.java"

Write-Host "==> [3/7] Converting bytecode to classes.dex with d8..." -ForegroundColor Cyan
$d8jar = "$buildTools\lib\d8.jar"
$classes = (Get-ChildItem -Path "$scriptDir\bin" -Filter "*.class" -Recurse).FullName
java.exe -jar "$d8jar" --min-api 21 --lib "$platform" --output "$scriptDir\bin" $classes

Write-Host "==> [4/7] Packaging resources and assets into unaligned APK..." -ForegroundColor Cyan
& "$buildTools\aapt.exe" package -f -M "$scriptDir\AndroidManifest.xml" -S "$scriptDir\res" -A "$scriptDir\assets" -I "$platform" -F "$scriptDir\bin\app-unaligned.apk"

Write-Host "==> [5/7] Adding classes.dex to APK..." -ForegroundColor Cyan
Push-Location "$scriptDir\bin"
& "$buildTools\aapt.exe" add "app-unaligned.apk" "classes.dex"
Pop-Location

Write-Host "==> [6/7] Aligning and signing release APK..." -ForegroundColor Cyan
& "$buildTools\zipalign.exe" -f -p 4 "$scriptDir\bin\app-unaligned.apk" "$scriptDir\bin\app-aligned.apk"
$apksigner = "$buildTools\lib\apksigner.jar"
java.exe -jar "$apksigner" sign --ks "$scriptDir\triagenet.keystore" --ks-pass pass:triagenet2026 --key-pass pass:triagenet2026 --out "$scriptDir\bin\triagenet-companion-v1.2.0.apk" "$scriptDir\bin\app-aligned.apk"
java.exe -jar "$apksigner" verify "$scriptDir\bin\triagenet-companion-v1.2.0.apk"

Write-Host "==> [7/7] Deploying APK to public downloads..." -ForegroundColor Cyan
Copy-Item -Path "$scriptDir\bin\triagenet-companion-v1.2.0.apk" -Destination "$projectRoot\frontend\public\downloads\triagenet-companion-v1.2.0.apk" -Force
if (Test-Path "$env:USERPROFILE\Downloads") {
    Copy-Item -Path "$scriptDir\bin\triagenet-companion-v1.2.0.apk" -Destination "$env:USERPROFILE\Downloads\triagenet-companion-v1.2.0.apk" -Force
}

if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    if ($devices -match "device\b") {
        Write-Host "==> Installing to active emulator/device..." -ForegroundColor Green
        & $adbPath install -r "$scriptDir\bin\triagenet-companion-v1.2.0.apk"
        & $adbPath shell am start -n com.triagenet.companion/.MainActivity
    } else {
        Write-Host "==> Emulator not currently running. APK deployed to Downloads." -ForegroundColor Yellow
    }
}

Write-Host "BUILD COMPLETE: $projectRoot\frontend\public\downloads\triagenet-companion-v1.2.0.apk" -ForegroundColor Green
