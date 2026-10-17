const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'motion_clips');

const SCENES = [
  {
    name: 'motion_01_intro_hook.mp4',
    template: 'scene_01_intro.html',
    duration: 12.0,
    fps: 60
  },
  {
    name: 'motion_02_system_architecture.mp4',
    template: 'scene_02_architecture.html',
    duration: 12.0,
    fps: 60
  },
  {
    name: 'motion_03_algorithmic_core.mp4',
    template: 'scene_03_algorithms.html',
    duration: 16.0,
    fps: 60
  },
  {
    name: 'motion_04_hud_telemetry_overlay.mp4',
    template: 'scene_04_hud.html',
    duration: 12.0,
    fps: 60
  },
  {
    name: 'motion_05_statewide_impact_outro.mp4',
    template: 'scene_05_impact.html',
    duration: 14.6,
    fps: 60
  }
];

async function renderScene(browser, sceneConfig) {
  const { name, template, duration, fps } = sceneConfig;
  const templatePath = path.join(TEMPLATES_DIR, template);
  const fileUrl = 'file:///' + templatePath.replace(/\\/g, '/');
  const outFile = path.join(OUTPUT_DIR, name);
  const totalFrames = Math.round(duration * fps);

  console.log(`\n==================================================`);
  console.log(`🎬 Rendering ${name} (${duration}s @ ${fps}fps = ${totalFrames} frames)`);
  console.log(`Template: ${fileUrl}`);
  console.log(`==================================================`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: 'load' });

  // Spawn ffmpeg to read high-quality MJPEG frames from pipe
  const ffmpeg = spawn('ffmpeg.exe', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '17',
    '-preset', 'veryfast',
    outFile
  ]);

  ffmpeg.stderr.on('data', () => {}); // silence or drain ffmpeg logs

  const startTime = Date.now();
  let lastLoggedPercent = -1;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    const p = t / duration;

    // Call timeline hook in page
    await page.evaluate((prog, time) => {
      if (window.setTimeline) {
        window.setTimeline(prog, time);
      }
    }, p, t);

    // Capture screenshot buffer (JPEG quality 95)
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    ffmpeg.stdin.write(buf);

    const percent = Math.floor((f / totalFrames) * 100);
    if (percent % 20 === 0 && percent !== lastLoggedPercent) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const fpsRender = (f / Math.max(0.1, (Date.now() - startTime) / 1000)).toFixed(1);
      console.log(`  -> Progress: ${percent}% (Frame ${f}/${totalFrames}) - ${elapsed}s elapsed (${fpsRender} fps)`);
      lastLoggedPercent = percent;
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[SUCCESS] Completed ${name} in ${totalTime}s -> ${outFile}`);
  await page.close();
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const targetSceneArg = process.argv[2];
  let scenesToRender = SCENES;
  if (targetSceneArg) {
    scenesToRender = SCENES.filter(s => s.name.includes(targetSceneArg) || s.template.includes(targetSceneArg));
  }

  console.log(`Starting render queue for ${scenesToRender.length} scenes...`);
  for (const scene of scenesToRender) {
    await renderScene(browser, scene);
  }

  await browser.close();
  console.log('\n🎉 ALL SCENES RENDERED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Fatal rendering error:', err);
  process.exit(1);
});
