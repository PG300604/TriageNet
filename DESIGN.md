# DESIGN.md — Panacea Healthcare SaaS Design System

**Reference:** Panacea Healthcare SaaS Dashboard (Panze UX Studio) | **Version:** 3.0

---

## 1. Aesthetic Vision & Design Pillars

Modeled directly after **Panacea Healthcare SaaS**, a modern EHR/CRM & Hospital Management UI design system:

1. **Calm Clinical Hierarchy**: High contrast, clean card-based layout, and clear data visualization designed to eliminate clutter and reduce cognitive load for clinical teams.
2. **Unified Patient Risk Analytics**: Clear stratification of patients into visual risk tiers:
   - **High Risk / Critical (S≥80)**: Coral Red badge (`bg-red-500/15 text-red-400 border-red-500/30`)
   - **Moderate Risk / Strained (S 50-79)**: Soft Amber badge (`bg-amber-500/15 text-amber-400 border-amber-500/30`)
   - **Low Risk / Nominal (S <50)**: Soft Emerald badge (`bg-emerald-500/15 text-emerald-400 border-emerald-500/30`)
   - **Preempted / Step-Down**: Soft Purple badge (`bg-purple-500/15 text-purple-400 border-purple-500/30`)
3. **Elevated SaaS Card Language**: Soft rounded corners (`rounded-2xl`), crisp white/dark slate cards (`#121929`), top-lit 1px border highlights, and subtle elevation shadows (`shadow-xl`).
4. **Primary Brand Palette**: Deep Medical Slate (`#0b0f19`), Surgical Navy (`#121929`), Electric Medical Blue (`#2563eb`), and Medical Teal (`#06b6d4`).

---

## 2. Page & Component Layouts

- **Navbar**: Sleek Panacea header with brand logo, nav items, and Launch Simulator CTA.
- **Panacea Hero Command Center**: Interactive Patient Record & Risk Analytics preview widget with real-time scenario switches, +15m Fast Forward, Critical Preemption, and Auto Play.
- **Problem Section**: Clean Panacea clinical bottleneck cards.
- **Pinned 4-Step Pipeline**: Scroll-pinned EHR telemetry screen.
- **Four Algorithm Showcase**: Sleek cards detailing ML Severity, Priority Heap, Hungarian Engine, and Dijkstra Router.
- **Metrics Band & Footer**: Panacea SaaS metrics tiles and CTA.
