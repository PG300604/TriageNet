# Accessibility Policy & Statement for TriageNet

**TriageNet** is committed to ensuring digital accessibility for all users—including triage nurses, emergency medical technicians, hospital dispatchers, emergency room doctors, and public health administrators across Jharkhand. We are continuously improving the user experience for everyone and applying the relevant accessibility standards.

---

## 1. Conformance Status

The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.

**TriageNet aims for WCAG 2.1 Level AA conformance** across all public and authenticated web interfaces.

---

## 2. Core Accessibility Features

### High-Contrast Visual Architecture
- **Emergency Dark Palette**: TriageNet's primary user interface utilizes a high-contrast dark palette (`#100904` base, `#1a0f07` cards, `#ffedd7` text, and `#dc5000` primary emergency accent).
- **Text Contrast Ratios**: All body text, headers, and essential interactive elements exceed the WCAG AA contrast ratio requirement of `4.5:1` (with high-priority elements exceeding `7:1`).
- **Color Independence**: Severity levels (*Immediate*, *Urgent*, *Delayed*, *Minor*) and bed occupancy statuses are communicated through distinct shapes, numerical triage scores, textual badges, and icons—never by color alone.

### Keyboard Navigation & Focus Management
- **Logical Tab Order**: Full keyboard traversability through all navigation items, triage intake forms, hospital filter dropdowns, and modal dialogs.
- **Visible Focus Rings**: Interactive elements render unambiguous high-contrast focus rings (`ring-2 ring-primary`) when focused via keyboard navigation.
- **Escape Key Handlers**: All modal dialogs and filter popups dismiss on pressing `Escape`, returning focus to the triggering element.

### Screen Reader Support & Semantic HTML
- **Semantic Structure**: Modern HTML5 landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`) are employed consistently.
- **ARIA Live Regions**: Dynamic triage queue updates and real-time WebSocket alerts leverage `aria-live="polite"` and `aria-live="assertive"` to ensure screen reader users receive time-critical dispatch updates.
- **Accessible Form Controls**: All inputs in patient registration and hospital search feature explicit `<label>` bindings and `aria-describedby` helper texts.

### Touch Targets & Responsiveness
- **Minimum Target Size**: Critical dispatch and emergency action buttons maintain a minimum touch target size of `44 x 44px`.
- **Responsive Layout**: Designed for seamless operation on mobile dispatch tablets, emergency vehicle terminals, and desktop multi-monitor command center setups.

---

## 3. Assistive Technologies Tested

TriageNet is periodically verified against standard modern accessibility tools:
- **Screen Readers**: NVDA (Windows), VoiceOver (macOS / iOS), and ChromeVox.
- **Browsers**: Google Chrome, Mozilla Firefox, Brave, and Microsoft Edge.
- **Automated Scanners**: Lighthouse Accessibility Audits and axe DevTools.

---

## 4. Known Limitations & Ongoing Roadmap

While TriageNet strives for complete accessibility, some areas are actively being enhanced:
- **Interactive Spatial Maps**: Complex Leaflet-based geospatial maps provide visual route tracking. We are continually expanding alternative text and tabular views for dispatch routing to provide 100% equivalent spatial information in tabular form.
- **Multi-lingual Support**: Localization for regional languages in Jharkhand (Hindi, Santali, Mundari, Ho, Bengali) is planned on our product roadmap.

---

## 5. Feedback & Reporting Accessibility Barriers

We welcome your feedback on the accessibility of TriageNet. If you encounter accessibility barriers, or need assistance accessing any emergency triage workflows:

- **Email**: `priyanshu@triagenet.dev`
- **Issue Tracker**: Open an issue on GitHub tagged with `accessibility`

Please include details such as the page URL or component name, the assistive technology you were using, and a description of the issue. We aim to respond to accessibility inquiries within 3 business days.
