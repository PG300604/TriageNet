# TriageNet Companion Mobile Application (Flutter)

Unified, cross-platform companion mobile application for healthcare workers across **Jharkhand’s 24 districts**, built with Flutter (Dart).

---

## 📱 Dynamic Role-Based Auto-Redirection

The application contains a single unified authentication gate (`lib/features/auth/screens/login_screen.dart`). Upon login, the app inspects the officer’s cryptographic role token and immediately redirects them to their designated viewport:

| Role | Default Staff ID | Redirected Screen | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **108 EMT Paramedic** | `JH-DSP-5001` | `AmbulanceEmtScreen` | In-transit vitals entry, road navigation, 108 Green Wave siren preemption, trauma bay pre-alerts |
| **Emergency Triage Nurse** | `JH-NUR-1002` | `NurseBedsideScreen` | Bedside casualty intake, ML Acuity score calculation, trauma bay bed lock |
| **Medical Superintendent** | `JH-MS-3001` | `SuperintendentScreen` | Critical care census, ICU meters, surgeon duty rosters, financial ERP sync |
| **District CMO** | `JH-CMO-2001` | `DistrictCmoScreen` | District contingency pool grants, Dijkstra inter-district transfer authorizations |
| **State Health Command** | `JH-GOV-0001` | `DistrictCmoScreen` | Statewide casualty monitoring & governance |

---

## 🚀 Building & Running

### Prerequisites
- Flutter SDK 3.16+ / Dart 3.2+
- Android Studio / Android SDK (API level 26+ / Android 8.0 Oreo or later)
- Chrome / Edge (for Web Companion testing)

### Commands

1. **Install Dependencies**:
   ```bash
   cd mobile
   flutter pub get
   ```

2. **Run in Web Browser**:
   ```bash
   flutter run -d chrome
   ```

3. **Run on Android Emulator or Physical Device**:
   ```bash
   flutter run -d android
   ```

4. **Build Production Release APK**:
   ```bash
   flutter build apk --release
   ```
   The compiled APK will be output to:
   `build/app/outputs/flutter-apk/app-release.apk`

---

## 🔄 In-App OTA Auto-Update Engine

- **Service**: `lib/core/services/ota_service.dart`
- **Endpoint**: Connects to `http://<server-ip>:3000/api/app/version`
- **Behavior**:
  - Automatically polls every 4 hours.
  - If a newer `buildNumber` is detected on the server, an in-app banner displays the clinical release notes and download link.
  - Updates can also be downloaded directly via the web portal at `/downloads`.

---

## 🏗️ Architecture & Directory Tree

```
mobile/
├── pubspec.yaml              # App configuration, SDK constraints, dependencies
├── README.md                 # Architecture & build guide
└── lib/
    ├── main.dart             # App entry point, theme & RootRouter redirection
    ├── core/
    │   ├── models/
    │   │   └── user_role.dart    # UserRole enum & UserSession model
    │   └── services/
    │       ├── auth_service.dart # Authentication & session management
    │       └── ota_service.dart  # In-app OTA version check engine
    └── features/
        ├── auth/
        │   └── screens/login_screen.dart           # Unified login with role router
        ├── ambulance/
        │   └── screens/ambulance_emt_screen.dart   # 108 Paramedic field terminal
        ├── nurse/
        │   └── screens/nurse_bedside_screen.dart   # Bedside triage & bed lock
        ├── superintendent/
        │   └── screens/superintendent_screen.dart  # Hospital capacity & ERP sync
        └── cmo/
            └── screens/cmo_district_screen.dart    # District grants & transfers
```
