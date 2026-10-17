import subprocess
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

base_dir = r"p:\TriageNet\video_production"
motion_dir = os.path.join(base_dir, "motion_clips")
snippet_dir = os.path.join(base_dir, "screen_snippets")
audio_file = os.path.join(base_dir, "audio", "Rise_Up.mp3")
out_video = os.path.join(base_dir, "TRIAGENET_EXPLAINER_REFERENCE_CUT.mp4")

# Master Edited Sequence synced to "Rise Up" (112.62 seconds total)
sequence = [
    # [00:00 - 00:12] ACT I: THE GOLDEN HOUR CRISIS & REVEAL
    {"file": os.path.join(motion_dir, "motion_01_intro_hook.mp4"), "t_in": 0.0, "dur": 12.0, "desc": "Motion 01: Golden Hour Crisis & TriageNet Reveal"},

    # [00:12 - 00:24] ACT II: DISTRIBUTED REACTIVE ARCHITECTURE (THE BEAT DROP @ 12.5s)
    {"file": os.path.join(motion_dir, "motion_02_system_architecture.mp4"), "t_in": 0.0, "dur": 12.0, "desc": "Motion 02: Reactive Pipeline (Android <-> Spring <-> Next.js)"},

    # [00:24 - 00:32] WEB DASHBOARD SINGLE PANE OF GLASS
    {"file": os.path.join(snippet_dir, "clip_01_web_analytics_gauge.mp4"), "t_in": 0.0, "dur": 8.0, "desc": "Web Console: Statewide Analytics & Bed Gauges"},

    # [00:32 - 00:56] ACT III: 4 HAND-IMPLEMENTED ALGORITHMS (GRAPHIC -> REAL UI INTERCUT)
    # Algo 1: SeverityScorer Sigmoid S-Curve -> Web Acuity Sliders
    {"file": os.path.join(motion_dir, "motion_03_algorithmic_core.mp4"), "t_in": 0.0, "dur": 4.0, "desc": "Motion 03A: SeverityScorer Sigmoid S-Curve"},
    {"file": os.path.join(snippet_dir, "clip_02_web_acuity_sliders.mp4"), "t_in": 0.0, "dur": 4.0, "desc": "Web Console: Real-time SpO2/GCS Acuity Sliders"},

    # Algo 2: Hungarian Matcher Bipartite -> Web Triage Priority Heap
    {"file": os.path.join(motion_dir, "motion_03_algorithmic_core.mp4"), "t_in": 4.0, "dur": 4.0, "desc": "Motion 03B: Hungarian Bipartite Assignment Matrix"},
    {"file": os.path.join(snippet_dir, "clip_03_web_triage_heap.mp4"), "t_in": 0.0, "dur": 4.0, "desc": "Web Console: Triage Priority Max-Heap Queue"},

    # Algo 3: Dijkstra Router Green Wave -> Web GIS Map Highway Corridor
    {"file": os.path.join(motion_dir, "motion_03_algorithmic_core.mp4"), "t_in": 8.0, "dur": 4.0, "desc": "Motion 03C: Dijkstra Highway Green Wave Corridor"},
    {"file": os.path.join(snippet_dir, "clip_04_web_gis_highway_siren.mp4"), "t_in": 0.0, "dur": 4.0, "desc": "Web Console: NH-33 GIS Corridor & Siren Preemption"},

    # Algo 4: Doctor Specialist Roster & Direct Paging
    {"file": os.path.join(snippet_dir, "clip_05_web_doctor_paging.mp4"), "t_in": 0.0, "dur": 5.0, "desc": "Web Console: Doctor Specialist Direct Trauma Paging"},

    # [00:57 - 01:21] ACT IV: MOBILE 108 AMBULANCE FLEET & CLINICAL INTAKE
    {"file": os.path.join(snippet_dir, "clip_09_mobile_paramedic_gps.mp4"), "t_in": 0.0, "dur": 6.0, "desc": "Mobile App: 108 ALS Paramedic Live GPS (76 km/h)"},
    {"file": os.path.join(snippet_dir, "clip_10_mobile_prealert_voucher.mp4"), "t_in": 0.0, "dur": 6.0, "desc": "Mobile App: Digital Trauma Pre-Alert Voucher"},
    {"file": os.path.join(snippet_dir, "clip_11_mobile_green_wave_active.mp4"), "t_in": 0.0, "dur": 5.0, "desc": "Mobile App: 108 Green Wave Active Banner"},
    {"file": os.path.join(snippet_dir, "clip_12_mobile_triage_nurse_intake.mp4"), "t_in": 2.0, "dur": 5.0, "desc": "Mobile App: ED Triage Nurse Rapid Reception"},

    # [01:21 - 01:38] ACT V: AI CDS GOVERNANCE & REVENUE RECOVERY
    {"file": os.path.join(snippet_dir, "clip_06_web_ai_cds_sigmoid.mp4"), "t_in": 0.0, "dur": 5.0, "desc": "Web Console: AI Clinical Decision Support Audit"},
    {"file": os.path.join(snippet_dir, "clip_07_web_contingency_grant.mp4"), "t_in": 0.0, "dur": 5.0, "desc": "Web Console: Directorate Emergency Contingency Grant"},
    {"file": os.path.join(snippet_dir, "clip_08_web_staff_verification.mp4"), "t_in": 0.0, "dur": 5.0, "desc": "Web Console: Clinician Staff Verification Queue"},

    # [01:38 - 01:52.6] ACT VI: MEASURABLE OUTCOMES & GRAND FINALE
    {"file": os.path.join(motion_dir, "motion_05_statewide_impact_outro.mp4"), "t_in": 0.0, "dur": 14.62, "desc": "Motion 05: Statewide Outcomes Dashboard & TriageNet Logo Reveal"},
]

total_calc = sum(item["dur"] for item in sequence)
print(f"Total Video Timeline: {total_calc:.2f} seconds (Target: 112.62s)")

# Build standardized segments
seg_dir = os.path.join(base_dir, "temp_segments")
os.makedirs(seg_dir, exist_ok=True)
concat_list = os.path.join(seg_dir, "concat.txt")

with open(concat_list, "w", encoding="utf-8") as f_list:
    for i, item in enumerate(sequence):
        seg_file = os.path.join(seg_dir, f"seg_{i:02d}.mp4")
        # Standardize to 1920x1080 60fps with black pillarbox padding if vertical
        vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=60"
        cmd = [
            "ffmpeg.exe", "-y",
            "-ss", str(item["t_in"]),
            "-t", str(item["dur"]),
            "-i", item["file"],
            "-vf", vf,
            "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
            "-an",
            seg_file
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        f_list.write(f"file '{seg_file.replace(chr(92), '/')}'\n")
        print(f"[OK] Rendered segment {i+1:02d}/{len(sequence):02d} ({item['dur']:4.1f}s): {item['desc']}")

# Concat video
concat_video = os.path.join(seg_dir, "raw_concat.mp4")
cmd_concat = [
    "ffmpeg.exe", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list,
    "-c", "copy",
    concat_video
]
subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Mux with master soundtrack and apply 2s audio fade-out at end
cmd_final = [
    "ffmpeg.exe", "-y",
    "-i", concat_video,
    "-i", audio_file,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "320k",
    "-af", "afade=t=out:st=110.5:d=2.0",
    "-shortest",
    out_video
]
subprocess.run(cmd_final, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(f"\n[SUCCESS] Master 112s Explainer Video assembled at:\n  {out_video}")
