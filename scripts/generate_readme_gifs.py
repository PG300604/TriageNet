import subprocess
import os
import sys

base_dir = r"p:\TriageNet"
video_prod = os.path.join(base_dir, "video_production")
motion_dir = os.path.join(video_prod, "motion_clips")
snippet_dir = os.path.join(video_prod, "screen_snippets")
assets_dir = os.path.join(base_dir, ".github", "assets")
os.makedirs(assets_dir, exist_ok=True)

def make_gif(input_mp4, start_time, duration, output_gif, width=800, fps=15):
    print(f"Generating GIF: {os.path.basename(output_gif)} (t={start_time}s, dur={duration}s)...")
    vf = f"fps={fps},scale={width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"
    cmd = [
        "ffmpeg.exe", "-y",
        "-ss", str(start_time),
        "-t", str(duration),
        "-i", input_mp4,
        "-vf", vf,
        output_gif
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    size_kb = os.path.getsize(output_gif) / 1024
    print(f"  -> [OK] {os.path.basename(output_gif)} ({size_kb:.1f} KB)")

def make_screenshot(input_mp4, timestamp, output_png):
    print(f"Extracting Screenshot: {os.path.basename(output_png)} (t={timestamp}s)...")
    cmd = [
        "ffmpeg.exe", "-y",
        "-ss", str(timestamp),
        "-i", input_mp4,
        "-vframes", "1",
        output_png
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    size_kb = os.path.getsize(output_png) / 1024
    print(f"  -> [OK] {os.path.basename(output_png)} ({size_kb:.1f} KB)")

# 1. Hero Preview GIF (at top of README)
hero_video = os.path.join(video_prod, "TRIAGENET_EXPLAINER_REFERENCE_CUT.mp4")
make_gif(hero_video, start_time=12.0, duration=7.0, output_gif=os.path.join(assets_dir, "hero-architecture-preview.gif"), width=900, fps=16)

# 2. Algorithmic Motion GIFs
algo_video = os.path.join(motion_dir, "motion_03_algorithmic_core.mp4")
make_gif(algo_video, start_time=0.5, duration=3.5, output_gif=os.path.join(assets_dir, "algo-sigmoid-acuity.gif"), width=800, fps=15)
make_gif(algo_video, start_time=4.5, duration=3.5, output_gif=os.path.join(assets_dir, "algo-hungarian-matching.gif"), width=800, fps=15)
make_gif(algo_video, start_time=8.5, duration=3.5, output_gif=os.path.join(assets_dir, "algo-dijkstra-greenwave.gif"), width=800, fps=15)
make_gif(algo_video, start_time=12.5, duration=3.5, output_gif=os.path.join(assets_dir, "algo-maxheap-queue.gif"), width=800, fps=15)

# 3. Architecture & Impact GIFs
arch_video = os.path.join(motion_dir, "motion_02_system_architecture.mp4")
make_gif(arch_video, start_time=2.0, duration=5.0, output_gif=os.path.join(assets_dir, "architecture-dualbus.gif"), width=800, fps=15)

impact_video = os.path.join(motion_dir, "motion_05_statewide_impact_outro.mp4")
make_gif(impact_video, start_time=0.5, duration=6.0, output_gif=os.path.join(assets_dir, "statewide-impact-metrics.gif"), width=800, fps=15)

# 4. Live UI Screen Recording GIFs
gis_video = os.path.join(snippet_dir, "clip_04_web_gis_highway_siren.mp4")
make_gif(gis_video, start_time=0.0, duration=5.0, output_gif=os.path.join(assets_dir, "gis-highway-ambulance.gif"), width=800, fps=15)

mobile_video = os.path.join(snippet_dir, "clip_09_mobile_paramedic_gps.mp4")
make_gif(mobile_video, start_time=0.5, duration=5.0, output_gif=os.path.join(assets_dir, "mobile-paramedic-gps.gif"), width=400, fps=15)

mobile_voucher = os.path.join(snippet_dir, "clip_10_mobile_prealert_voucher.mp4")
make_gif(mobile_voucher, start_time=0.5, duration=5.0, output_gif=os.path.join(assets_dir, "mobile-trauma-voucher.gif"), width=400, fps=15)

# 5. High-Resolution Screenshots
make_screenshot(os.path.join(snippet_dir, "clip_01_web_analytics_gauge.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-analytics-dashboard.png"))
make_screenshot(os.path.join(snippet_dir, "clip_02_web_acuity_sliders.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-acuity-sliders.png"))
make_screenshot(os.path.join(snippet_dir, "clip_03_web_triage_heap.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-triage-priority-heap.png"))
make_screenshot(os.path.join(snippet_dir, "clip_05_web_doctor_paging.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-specialist-doctor-roster.png"))
make_screenshot(os.path.join(snippet_dir, "clip_06_web_ai_cds_sigmoid.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-ai-cds-audit.png"))
make_screenshot(os.path.join(snippet_dir, "clip_07_web_contingency_grant.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-contingency-grant.png"))
make_screenshot(os.path.join(snippet_dir, "clip_08_web_staff_verification.mp4"), timestamp=2.0, output_png=os.path.join(assets_dir, "screenshot-staff-verification.png"))

print("\nAll README media assets successfully generated!")
