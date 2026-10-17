import subprocess
import os

web_video = r"C:\Users\priya\Videos\2026-10-16 21-20-26.mp4"
mobile_video = r"C:\Users\priya\Videos\Recording-2026-10-16-212711.mp4"
output_dir = r"p:\TriageNet\video_production\screen_snippets"
os.makedirs(output_dir, exist_ok=True)

clips = [
    # Web clips
    {"name": "clip_01_web_analytics_gauge.mp4", "src": web_video, "start": "00:00:00", "end": "00:00:08"},
    {"name": "clip_02_web_acuity_sliders.mp4", "src": web_video, "start": "00:00:32", "end": "00:00:46"},
    {"name": "clip_03_web_triage_heap.mp4", "src": web_video, "start": "00:01:03", "end": "00:01:16"},
    {"name": "clip_04_web_gis_highway_siren.mp4", "src": web_video, "start": "00:01:38", "end": "00:01:52"},
    {"name": "clip_05_web_doctor_paging.mp4", "src": web_video, "start": "00:02:00", "end": "00:02:14"},
    {"name": "clip_06_web_ai_cds_sigmoid.mp4", "src": web_video, "start": "00:02:24", "end": "00:02:35"},
    {"name": "clip_07_web_contingency_grant.mp4", "src": web_video, "start": "00:02:40", "end": "00:02:50"},
    {"name": "clip_08_web_staff_verification.mp4", "src": web_video, "start": "00:03:35", "end": "00:03:41"},

    # Mobile clips
    {"name": "clip_09_mobile_paramedic_gps.mp4", "src": mobile_video, "start": "00:00:07", "end": "00:00:18"},
    {"name": "clip_10_mobile_prealert_voucher.mp4", "src": mobile_video, "start": "00:00:26", "end": "00:00:32"},
    {"name": "clip_11_mobile_green_wave_active.mp4", "src": mobile_video, "start": "00:00:36", "end": "00:00:43"},
    {"name": "clip_12_mobile_triage_nurse_intake.mp4", "src": mobile_video, "start": "00:00:48", "end": "00:01:05"},
    {"name": "clip_13_mobile_superintendent_reconcile.mp4", "src": mobile_video, "start": "00:01:14", "end": "00:01:25"},
    {"name": "clip_14_mobile_cmo_governance.mp4", "src": mobile_video, "start": "00:01:40", "end": "00:01:45"},
]

for c in clips:
    out_path = os.path.join(output_dir, c["name"])
    cmd = [
        "ffmpeg.exe", "-y",
        "-ss", c["start"],
        "-to", c["end"],
        "-i", c["src"],
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac",
        out_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    status = "OK" if res.returncode == 0 else "FAIL"
    print(f"[{status}] Extracted: {c['name']} ({c['start']} -> {c['end']})")

print(f"\nAll snippets successfully extracted into {output_dir}")
