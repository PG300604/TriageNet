"""
TriageNet v1.3.0 - PowerPoint Slide Deck Generator (.pptx)
Generates a presentation slide deck from the high-resolution DJI-styled whitepaper:
- Crisp 2x Retina slide graphics (1684 x 1190 px)
- 16:9 / Landscape A4 presentation format
- Complete speaker notes on every slide
- Ready for Google Drive, Microsoft PowerPoint, and Apple Keynote
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import pypdfium2 as pdfium

def generate_pptx(pdf_path, output_pptx_path):
    print(f"Loading PDF: {pdf_path}")
    pdf = pdfium.PdfDocument(pdf_path)
    num_pages = len(pdf)
    print(f"Total pages to convert: {num_pages}")
    
    prs = Presentation()
    # Landscape A4 dimensions in inches: 11.693 x 8.268 (exact match to ReportLab landscape A4)
    prs.slide_width = Inches(11.693)
    prs.slide_height = Inches(8.268)
    
    # Speaker notes for each slide
    speaker_notes = [
        # Slide 1
        """Slide 1: Executive Vision & Golden Hour Crisis
- Project: TriageNet v1.3.0 (Autonomous Statewide Trauma Care & Routing Engine)
- Context: Jharkhand, India (24 administrative districts, 39 million citizens).
- The Problem: Trauma mortality peaks in the first 60 minutes (the Golden Hour). 54% of rural/tribal trauma deaths stem from 'The Secondary Transfer Trap' - ambulances taking polytrauma patients to clinics lacking CT scanners, blood banks, or neurosurgeons, forcing fatal secondary transfers.
- The Solution: Autonomous multi-criteria routing, Kuhn-Munkres bipartite hospital allocation, and ITMS 108 Green Wave traffic signal preemption.
- Live Links: Live Web Console at triagenet-frontend.onrender.com, Citizen Emergency Portal, and GitHub v1.3.0 release.""",

        # Slide 2
        """Slide 2: Enterprise Distributed Architecture & Multi-Container Topology
- Architecture: Dual-Bus reactive streaming infrastructure.
- Telemetry Bus: Redis 7.2 In-Memory Pub/Sub processing ambulance GPS coordinates and vitals at >15,000 messages/sec.
- Application Layer: Spring Boot 3.3.13 API Core (Java 17 LTS, Project Loom Virtual Threads) with Server-Sent Events (SSE).
- Spatial Database: PostgreSQL 16 + PostGIS 3.4 using ST_DWithin() and GIST R-tree spatial geometry indexing.
- Edge Proxy: Nginx Alpine handling SSL termination, HTTP/2 proxying, and rate-limiting (100 req/min per IP).
- Reliability: 100% offline-capable inside state intranet nodes with zero external black-box solver dependencies.""",

        # Slide 3
        """Slide 3: The 4 Hand-Implemented Core Algorithmic Engines
- Engine 1 (SeverityScorer.java): Dynamic Sigmoid Acuity Scorer in O(1). Calculates S(v, c, t) using GCS (3-15), Shock Index (HR / SBP), SpO2 hypoxia, and dynamic time decay lambda*delta_t.
- Engine 2 (HungarianMatcher.java): Bipartite Kuhn-Munkres cost matrix minimization in O(n^3). Matches n incoming patients to m hospitals based on distance, surgical capabilities, and real-time bed queues in 3.80 ms.
- Engine 3 (DijkstraRouter.java): Multi-weighted shortest path on 24-district highway graph in O((V+E) log V). Features ITMS 108 corridor green-wave preemption.
- Engine 4 (TriageQueueService.java): Binary Max-Heap priority queue in O(log n). Dynamically escalates priority keys as patient vitals decay in transit, with aging anti-starvation.""",

        # Slide 4
        """Slide 4: Statewide Arterial Highway Network & ITMS 108 Green Wave
- Topology: Full graph across Jharkhand's 24 districts connecting Ranchi, Jamshedpur, Dhanbad, Bokaro, Deoghar, Hazaribagh, Dumka, Chaibasa, Palamu, etc.
- Corridors: NH-33 (Industrial Spine), NH-20 (Central Corridor), NH-18/NH-32 (Coal Belt), NH-39 (Western Belt), NH-43 (Southern Belt).
- ITMS Green Wave Protocol: For Category RED ambulances, upcoming signalized intersections are pre-emptively locked to green 45s ahead of arrival, cutting urban delays by 28% to 34%.
- Offline Fallback: Embedded deterministic GeoJSON road graph with Haversine distance calculations ensures continuous routing even with zero cellular signal.""",

        # Slide 5
        """Slide 5: Production Web Command Console & Clinical Workflows
- Tech Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS, Leaflet GIS.
- Panel A: Real-Time Command Analytics & Bed Occupancy Dashboard with statewide KPI cards and 24-district incident cluster heatmaps.
- Panel B: Clinical Acuity Sliders & Physiological Parameter Scoring with real-time recalculation of GCS, BP, HR, RR, and SpO2.
- Panel C: Dynamic Priority Max-Heap Queue Monitor with live patient rank, arrival ETA, and automated preemption alerts.
- Panel D: Specialist Doctor On-Call Roster showing real-time surgeon availability (In Surgery / Ready / On Call) for Hungarian Matcher verification.""",

        # Slide 6
        """Slide 6: 3-Tier Clinical Safety, Dual-Key Overrides & Security Governance
- Tier 1: Deterministic Safety Guardrails. Machine learning models are constrained by strict rules (e.g. GCS < 8 or Shock Index > 1.0 unconditionally forces Category RED).
- Tier 2: Dual-Key Administrative Contingency Grants. Disaster bed expansions in mass-casualty events require simultaneous cryptographic signatures from the Medical Superintendent AND District Magistrate (DM).
- Tier 3: Immutable AI CDS Audit Trail & ABDM Verification. SHA-256 tamper-evident logging of all automated recommendations vs clinician actions, integrated with Aadhaar/ABDM biometric staff verification.""",

        # Slide 7
        """Slide 7: Field Paramedic Mobile Companion Suite (Android & iOS)
- Architecture: Offline-first Mobile PWA with local SQLite buffering for cellular dead-zones.
- Screen 1: District CMO Governance Console for inter-hospital transfer authorizations and emergency contingency disaster funding.
- Screen 2: Rapid ED Patient Intake Modal for one-tap emergency triage desk admission and instant priority queue injection.
- Screen 3: 108 Paramedic Field Triage & ITMS Green Wave HUD featuring real-time GPS tracking along NH-33 collision zones, vital sign entry, and one-touch green wave siren preemption.""",

        # Slide 8
        """Slide 8: Benchmarks, Security Hardening & Live Cloud Sandbox Access
- Stress Benchmarks: 10,000 vital telemetry updates/sec sustained with zero packet drop.
- Measured P99 Latency: Severity scoring 1.42 us, Hungarian matching 3.80 ms, Dijkstra statewide routing 8.10 ms.
- Security: OWASP Top 10 hardened, stateless HMAC-SHA256 JWT tokens, PostgreSQL Row-Level Security (RLS).
- Live Access QR Codes: Scannable links to Live Web Console (Guest Sandbox), Citizen Emergency Portal, Swagger UI OpenAPI 3.0, and GitHub v1.3.0 Release.
- Author: Priyanshu Ghosh, CSBS '27, Asansol Engineering College. Open to SDE Internships in backend distributed systems."""
    ]
    
    # Blank slide layout
    blank_layout = prs.slide_layouts[6]
    
    temp_img_dir = os.path.join(os.path.dirname(output_pptx_path), 'pptx_temp_frames')
    os.makedirs(temp_img_dir, exist_ok=True)
    
    for i, page in enumerate(pdf):
        print(f"Rendering slide {i+1} of {num_pages} at 2x Retina resolution...")
        # Render at 2.0x scale for crisp slide quality
        pil_img = page.render(scale=2.0).to_pil()
        temp_img_path = os.path.join(temp_img_dir, f'slide_{i+1}.png')
        pil_img.save(temp_img_path, quality=95)
        
        # Add slide
        slide = prs.slides.add_slide(blank_layout)
        
        # Add full-bleed image fitting slide dimensions exactly
        slide.shapes.add_picture(
            temp_img_path,
            left=Inches(0),
            top=Inches(0),
            width=prs.slide_width,
            height=prs.slide_height
        )
        
        # Add speaker notes
        if i < len(speaker_notes):
            notes_slide = slide.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = speaker_notes[i]
            
    # Clean up temp frames
    import shutil
    shutil.rmtree(temp_img_dir, ignore_errors=True)
    
    prs.save(output_pptx_path)
    print(f"Successfully generated PowerPoint Slide Deck: {output_pptx_path}")

if __name__ == '__main__':
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    pdf_in = os.path.join(base, 'docs', 'TriageNet_Executive_Whitepaper.pdf')
    pptx_out = os.path.join(base, 'docs', 'TriageNet_Executive_Slide_Deck.pptx')
    generate_pptx(pdf_in, pptx_out)
