# TriageNet Automated Mobile App Actor
# Drives BlueStacks companion app interactions in real time for OBS Shoot 2 (63 seconds)
$adb = "C:\Program Files\BlueStacks_msi5\HD-Adb.exe"
if (-not (Test-Path $adb)) {
    $adb = (Get-Command adb -ErrorAction SilentlyContinue)?.Source
}

if (-not $adb -or -not (Test-Path $adb)) {
    Write-Warning "⚠️ BlueStacks ADB not found at default location. Please ensure BlueStacks is running."
    exit 1
}

Write-Host "🎬 [TriageNet Mobile Actor] Starting 63s Mobile Interaction Sequence..." -ForegroundColor Cyan

function Tap($x, $y) {
    & $adb shell input tap $x $y
}

# 0s - 5s: Establishing Phone Frame & Welcome
Write-Host "📱 [0s] Establishing phone view..."
Start-Sleep -Seconds 5

# 5s - 14s: Onboarding Walkthrough (tap Guide button at top right: 1380, 50)
Write-Host "📱 [5s] Opening 4-step onboarding guide..."
Tap 1380 50
Start-Sleep -Seconds 4

# Advance carousel (tap Next slide)
Write-Host "📱 [9s] Advancing onboarding slide..."
Tap 920 1600
Start-Sleep -Seconds 3

# Close onboarding walkthrough (tap Start Using App)
Write-Host "📱 [12s] Closing onboarding guide to active console..."
Tap 720 1700
Start-Sleep -Seconds 3

# 14s - 22s: Vitals Acuity Preset — Code Red Polytrauma
Write-Host "📱 [15s] Selecting '💥 Code Red Polytrauma' preset..."
Tap 200 825
Start-Sleep -Seconds 7

# 22s - 36s: Vitals Acuity Preset — Cardiac VFIB (animating sliders: GCS 4, SpO2 72, BP 60, HR 162)
Write-Host "📱 [22s] Selecting '⚡ Cardiac VFIB' preset (live sliders recalculation)..."
Tap 675 825
Start-Sleep -Seconds 12

# 36s - 46s: Activate 108 Green Wave Signal Siren
Write-Host "📱 [36s] Engaging 108 Green Wave Signal Siren corridor..."
Tap 720 2188
Start-Sleep -Seconds 10

# 46s - 56s: Dispatch Trauma Bay & Generate Handover Voucher
Write-Host "📱 [46s] Tapping 'PRE-ALERT TRAUMA BAY & DISPATCH'..."
Tap 720 2090
Start-Sleep -Seconds 8

# Close Handover Voucher
Write-Host "📱 [54s] Acknowledging handover voucher..."
Tap 720 1630
Start-Sleep -Seconds 2

# 56s - 63s: Reset Green Wave for clean finish
Write-Host "📱 [56s] Finalizing mobile session and resetting camera..."
Tap 720 2188

Write-Host "✅ [TriageNet Mobile Actor] Mobile shoot interaction completed cleanly!" -ForegroundColor Green
