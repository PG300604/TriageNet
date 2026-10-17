import subprocess
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

python_exe = r"C:\Users\priya\AppData\Local\Programs\Python\Python312\python.exe"
manim_script = r"p:\TriageNet\scripts\generate_system_design_manim.py"
assets_dir = r"p:\TriageNet\.github\assets"
os.makedirs(assets_dir, exist_ok=True)

scenes = [
    ("DeploymentDockerRedisScene", "manim-deployment-docker-redis.gif"),
    ("SystemDesignLevel0Scene", "manim-system-design-level0.gif"),
    ("SystemDesignLevel1Scene", "manim-system-design-level1.gif"),
    ("SafetySecurityArchitectureScene", "manim-safety-security.gif"),
]

for scene_name, gif_name in scenes:
    print(f"\n==========================================")
    print(f"🎬 Rendering Manim Scene: {scene_name}...")
    cmd_manim = [
        python_exe, "-m", "manim", "-qm",
        manim_script, scene_name
    ]
    subprocess.run(cmd_manim, cwd=r"p:\TriageNet")

    # The rendered mp4 is located in media/videos/generate_system_design_manim/720p30/<scene_name>.mp4
    mp4_path = os.path.join(r"p:\TriageNet", "media", "videos", "generate_system_design_manim", "720p30", f"{scene_name}.mp4")
    out_gif = os.path.join(assets_dir, gif_name)

    if os.path.exists(mp4_path):
        print(f"Converting to GIF: {gif_name}...")
        vf = "fps=15,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"
        cmd_gif = [
            "ffmpeg.exe", "-y",
            "-i", mp4_path,
            "-vf", vf,
            out_gif
        ]
        subprocess.run(cmd_gif, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        size_kb = os.path.getsize(out_gif) / 1024
        print(f"  -> [SUCCESS] Generated {gif_name} ({size_kb:.1f} KB)")
    else:
        print(f"  -> [ERROR] Could not find {mp4_path}")

print("\n🎉 ALL SYSTEM DESIGN & DEPLOYMENT GIFS GENERATED!")
