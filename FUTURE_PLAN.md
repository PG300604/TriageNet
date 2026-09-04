# TriageNet Future Implementation Plan & Roadmap

> **Official Future Implementation & Sprint Architecture Record**  
> *Jharkhand State Health Command System (TriageNet)*

---

## 🎯 Immediate Next Sprint: Clinician & Doctor Profile Customization System

### 1. User & Staff Profile Customization Architecture
- **Individualized Profile Cards for Every User**:
  - Every registered clinician, administrator, nurse, and dispatcher will have their own dedicated profile card.
  - Editable fields:
    - Personal Details: Full Name, Official Title, Photo / Avatar upload.
    - Medical Credentials: Registration Number (e.g., Medical Council of Jharkhand / State Medical Council), Degrees & Qualifications (e.g. MBBS, MD, MS, MCh, DM, Fellowship).
    - Clinical Department & Sub-Specialty (e.g. Trauma Surgery, Interventional Cardiology, Critical Care).
    - Healthcare Facility Affiliation & Assigned Ward / Station / OT Bay.
    - Shift Schedule & Roster Preferences (Day 8h, Day 12h, Night Emergency, On-Call Trauma).
    - Internal Communications: Pager Extension, VoIP line, Secure Station Radio Frequency.
    - Digital Cryptographic Signature & Verification Seal.
- **Card Template & Layout Support**:
  - Architecture ready to consume the user-provided customized profile card design.
  - Standardized display format so profile cards look uniform and clinical across all roles.

### 2. Universal Cross-User Profile Card Inspection
- **Interactive Doctor & Staff Lookup**:
  - Clicking on any doctor in the **Doctor & Specialist Availability Console** (`doctors-view.tsx`) opens their verified Doctor Profile Card.
  - Clicking on any triage nurse or physician assigned to a patient in the **Triage Queue** or **Patient Directory** opens their clinician credential card.
  - Allows inter-facility triage officers to instantly verify the qualifications, current active case load, station room, and contact extension of the receiving specialist before initiating emergency transfer.

### 3. Authentication & Session Navigation Cleanup
- **Strict Post-Logout Flow**:
  - Clicking the Logout icon in the sidebar clears all session tokens, shift locks, and demo presets, immediately routing to `/login`.
  - Future marketing/landing pages will feature a dedicated "Clinician Login" portal entry button.
  - Clicking the user profile avatar or name in the sidebar opens their personal profile card for self-inspection and customization.

---

## 🚀 Strategic Multi-Phase Roadmap Overview

| Phase | Title | Focus & Deliverables | Status |
|---|---|---|---|
| **Phase 9.1** | Cryptographic Authentication & Shift Sessions | TOTP RFC 6238, BIP-39 12-word mnemonic phrases, 8h/12h shift lock PIN | ✅ Completed |
| **Phase 9.2** | Official Staff ID & Dual-Control Onboarding | `JH-STF-XXXX` identifier, probe endpoint, Medical Superintendent verification queue | ✅ Completed |
| **Phase 9.3** | UI/UX Modernization & Doctor Availability | Plus Jakarta Sans typography, Boltshift KPIs, Globetrans Map HUD, Doctor Roster | ✅ Completed |
| **Phase 9.4** | Clinician & Doctor Profile Customization | Individual editable profile cards, cross-user inspection, user-provided card layout | 🔮 Next Sprint |
| **Phase 10** | FIDO2 / WebAuthn Hardware Security Keys | Physical YubiKey 5 NFC / USB-C & biometric fingerprint passkey support | 🔮 Planned |
| **Phase 11** | Real-Time Bed & Oxygen IoT Telemetry | PSA oxygen plant telemetry, LMO pressure sensors, HL7/FHIR ventilator polling | 🔮 Planned |
| **Phase 12** | 108 Ambulance Dedicated Field Mobile App | Flutter/React Native PWA, `< 2KB` payload, offline SQLite queue, glove-friendly UI | 🔮 Planned |
| **Phase 13** | W3C Web Push & Sound Beacon Sirens | Zero-SMS native browser push notifications, acoustic siren for incoming trauma | 🔮 Planned |
| **Phase 14** | ABDM & ABHA National Health ID Linking | Ayushman Bharat 14-digit ABHA integration, consent-based emergency EHR retrieval | 🔮 Planned |

---

## 🛡️ Architectural Principles
1. **Separation of Concerns**: High-level station command web dashboards are reserved for leadership (Super Admin, District CMO, Hospital Admin, ED Triage Lead, 108 Dispatcher); downstream routine mobile tasks are relegated to dedicated mobile apps.
2. **Zero Plaintext Secrets**: All sensitive identifiers and credentials must remain cryptographically hashed.
3. **No Breaking Telemetry**: Profile inspection must be non-blocking and zero-latency during emergency mass-casualty triage.
