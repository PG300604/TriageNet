const fs = require('fs');
const path = require('path');
const sharp = require('../frontend/node_modules/sharp');

const WIDTH = 1280;
const HEIGHT = 640;

// Read logo as base64
const logoPath = path.join(__dirname, '../frontend/public/triagenet-logo.png');
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0502" />
      <stop offset="40%" stop-color="#140a04" />
      <stop offset="100%" stop-color="#070301" />
    </linearGradient>

    <radialGradient id="glow-orange" cx="22%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.30" />
      <stop offset="50%" stop-color="#c2410c" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glow-logo" cx="80%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#b91c1c" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="card-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.08" />
    </linearGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a1205" stroke-width="0.7" stroke-opacity="0.45" />
      <circle cx="0" cy="0" r="1.2" fill="#ea580c" fill-opacity="0.25" />
    </pattern>

    <clipPath id="logo-circle-clip">
      <circle cx="0" cy="0" r="115" />
    </clipPath>
  </defs>

  <!-- 1. Background Layers -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-grad)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow-orange)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow-logo)" />

  <!-- 2. Subtle Tech Constellation Background Lines -->
  <g opacity="0.3" stroke="#f97316" stroke-width="1" stroke-dasharray="3,4">
    <circle cx="1035" cy="315" r="215" fill="none" stroke-opacity="0.2" />
    <circle cx="1035" cy="315" r="260" fill="none" stroke-opacity="0.1" />
  </g>

  <g fill="#f97316" opacity="0.5">
    <line x1="820" y1="90" x2="940" y2="160" stroke="#f97316" stroke-width="1" stroke-opacity="0.25" />
    <line x1="940" y1="160" x2="1140" y2="130" stroke="#f97316" stroke-width="1" stroke-opacity="0.25" />
    <line x1="940" y1="160" x2="1035" y2="315" stroke="#f97316" stroke-width="1" stroke-opacity="0.2" />
    <line x1="840" y1="490" x2="950" y2="460" stroke="#f97316" stroke-width="1" stroke-opacity="0.25" />
    <line x1="950" y1="460" x2="1160" y2="510" stroke="#f97316" stroke-width="1" stroke-opacity="0.25" />

    <circle cx="820" cy="90" r="3.5" fill="#fbbf24" />
    <circle cx="940" cy="160" r="3" fill="#ea580c" />
    <circle cx="1140" cy="130" r="4.5" fill="#22c55e" />
    <circle cx="840" cy="490" r="3" fill="#fbbf24" />
    <circle cx="950" cy="460" r="4" fill="#ef4444" />
    <circle cx="1160" cy="510" r="3.5" fill="#22c55e" />
  </g>

  <!-- 3. Main Brand Title: Perfectly Matched to Logo (White 'Triage' + Green 'Net') -->
  <g transform="translate(80, 135)">
    <text x="0" y="0" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="88" fill="#ffffff" letter-spacing="-1">
      Triage<tspan fill="#22c55e">Net</tspan>
    </text>
  </g>

  <!-- 4. Subtitle & Description -->
  <text x="80" y="184" font-family="Segoe UI, -apple-system, sans-serif" font-weight="600" font-size="21.5" fill="#ffedd7" letter-spacing="-0.2">
    AI-Powered Emergency Healthcare Triage &amp; Spatial Resource Allocation
  </text>

  <text x="80" y="216" font-family="Segoe UI, -apple-system, sans-serif" font-weight="400" font-size="15" fill="#a8a29e" letter-spacing="0">
    State-wide clinical triage, emergency telemetry &amp; hospital bed matching for the 24 districts of Jharkhand
  </text>

  <!-- 5. Real-Time ECG Waveform Line (Clean, without system text) -->
  <g opacity="0.8" transform="translate(80, 246)">
    <path d="M 0 10 L 120 10 L 135 10 L 145 -4 L 155 24 L 165 0 L 175 14 L 185 10 L 330 10 L 340 -2 L 350 22 L 360 4 L 370 10 L 676 10" 
          fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="676" cy="10" r="4" fill="#22c55e" />
  </g>

  <!-- 6. Three Feature Pillars (Glass Cards with Vector Icons) -->
  <g transform="translate(80, 290)">
    <!-- Card 1: Severity Scorer -->
    <g transform="translate(0, 0)">
      <rect width="216" height="175" rx="14" fill="#170c06" fill-opacity="0.9" stroke="url(#card-border)" stroke-width="1.2" />
      
      <!-- Icon Container -->
      <rect x="18" y="18" width="38" height="38" rx="9" fill="#2c1407" stroke="#ea580c" stroke-width="1" stroke-opacity="0.4" />
      <!-- Lightning Bolt Vector -->
      <path d="M 40 25 L 29 38 L 35 38 L 33 49 L 46 36 L 40 36 Z" fill="#fb923c" />

      <text x="18" y="88" font-family="Segoe UI, sans-serif" font-size="16" font-weight="700" fill="#ffffff">
        Severity Scorer
      </text>
      <text x="18" y="110" font-family="Segoe UI, sans-serif" font-size="12.5" fill="#fdba74" font-weight="600">
        0–100 Multi-Parameter
      </text>
      <text x="18" y="135" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#a8a29e">
        Automated priority queue
      </text>
      <text x="18" y="153" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#78716c">
        with dynamic wait decay
      </text>
    </g>

    <!-- Card 2: Hungarian Matching -->
    <g transform="translate(230, 0)">
      <rect width="216" height="175" rx="14" fill="#170c06" fill-opacity="0.9" stroke="url(#card-border)" stroke-width="1.2" />
      
      <!-- Icon Container -->
      <rect x="18" y="18" width="38" height="38" rx="9" fill="#2c1407" stroke="#ea580c" stroke-width="1" stroke-opacity="0.4" />
      <!-- Hospital Cross Shield Vector -->
      <path d="M 37 24 L 27 29 V 39 C 27 44 37 49 37 49 C 37 49 47 44 47 39 V 29 Z" fill="#2c1407" stroke="#fb923c" stroke-width="1.5" />
      <path d="M 35 32 H 39 V 36 H 43 V 40 H 39 V 44 H 35 V 40 H 31 V 36 H 35 Z" fill="#22c55e" />

      <text x="18" y="88" font-family="Segoe UI, sans-serif" font-size="16" font-weight="700" fill="#ffffff">
        Hungarian Match
      </text>
      <text x="18" y="110" font-family="Segoe UI, sans-serif" font-size="12.5" fill="#fdba74" font-weight="600">
        Spatial Optimization
      </text>
      <text x="18" y="135" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#a8a29e">
        Optimal bed allocation
      </text>
      <text x="18" y="153" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#78716c">
        bipartite acuity matching
      </text>
    </g>

    <!-- Card 3: Dijkstra Router -->
    <g transform="translate(460, 0)">
      <rect width="216" height="175" rx="14" fill="#170c06" fill-opacity="0.9" stroke="url(#card-border)" stroke-width="1.2" />
      
      <!-- Icon Container -->
      <rect x="18" y="18" width="38" height="38" rx="9" fill="#2c1407" stroke="#ea580c" stroke-width="1" stroke-opacity="0.4" />
      <!-- Route / Ambulance Path Vector -->
      <circle cx="29" cy="42" r="3.5" fill="#22c55e" />
      <circle cx="45" cy="28" r="3.5" fill="#ef4444" />
      <path d="M 29 42 Q 33 28 45 28" fill="none" stroke="#fb923c" stroke-width="2" stroke-dasharray="2,2" />

      <text x="18" y="88" font-family="Segoe UI, sans-serif" font-size="16" font-weight="700" fill="#ffffff">
        Dijkstra Router
      </text>
      <text x="18" y="110" font-family="Segoe UI, sans-serif" font-size="12.5" fill="#fdba74" font-weight="600">
        Inter-District Transit
      </text>
      <text x="18" y="135" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#a8a29e">
        Cross-boundary transfer
      </text>
      <text x="18" y="153" font-family="Segoe UI, sans-serif" font-size="11.5" fill="#78716c">
        live road graph topology
      </text>
    </g>
  </g>

  <!-- 7. Bottom Architecture Matrix -->
  <g transform="translate(80, 524)">
    <line x1="0" y1="0" x2="676" y2="0" stroke="#381b0a" stroke-width="1" />
    
    <g transform="translate(0, 26)">
      <text x="0" y="0" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#f97316">
        24
      </text>
      <text x="22" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#78716c">
        Districts
      </text>

      <text x="86" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#44210e">•</text>

      <text x="104" y="0" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#f97316">
        111+
      </text>
      <text x="142" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#78716c">
        Hospitals
      </text>

      <text x="210" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#44210e">•</text>

      <text x="228" y="0" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#f97316">
        6
      </text>
      <text x="242" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#78716c">
        RBAC Roles
      </text>

      <text x="320" y="0" font-family="Segoe UI, sans-serif" font-size="12" fill="#44210e">•</text>

      <text x="338" y="0" font-family="Consolas, monospace" font-size="12" font-weight="600" fill="#a8a29e">
        Next.js 16 • Spring Boot 3.3 • PostgreSQL 16 • Redis 7 • Nginx
      </text>
    </g>
  </g>

  <!-- 8. Right Hero Card: Clean Display for Brand Logo & Apex Referral -->
  <g transform="translate(830, 96)">
    <!-- Outer Glow Container -->
    <rect width="375" height="448" rx="28" fill="#130803" fill-opacity="0.85" stroke="url(#card-border)" stroke-width="1.5" />
    
    <!-- Center Logo with Circular Accent Rings and Masked Circular Border -->
    <g transform="translate(187, 185)">
      <circle cx="0" cy="0" r="118" fill="#2d0c03" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.5" />
      <circle cx="0" cy="0" r="132" fill="none" stroke="#f97316" stroke-width="1" stroke-dasharray="8,6" stroke-opacity="0.25" />
      
      <!-- Embedded Logo Image Clipped into Circle -->
      <g clip-path="url(#logo-circle-clip)">
        <image href="${logoBase64}" x="-115" y="-115" width="230" height="230" />
      </g>
    </g>

    <!-- Bottom Telemetry Card Inside Right Container -->
    <g transform="translate(22, 348)">
      <rect width="331" height="74" rx="14" fill="#1b0e06" stroke="#381b0a" stroke-width="1" />
      
      <g transform="translate(16, 24)">
        <text x="0" y="0" font-family="Segoe UI, sans-serif" font-size="10" font-weight="700" fill="#a8a29e" letter-spacing="0.5">
          APEX REFERRAL FACILITY
        </text>
        <text x="0" y="22" font-family="Segoe UI, sans-serif" font-size="14.5" font-weight="800" fill="#ffedd7">
          RIMS Ranchi (Tier-1)
        </text>
      </g>

      <!-- Immediate Badge with Centered Coordinates -->
      <g transform="translate(222, 20)">
        <rect width="92" height="34" rx="8" fill="#dc2626" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.2" />
        <text x="46" y="21" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="11" font-weight="800" fill="#fca5a5" letter-spacing="0.5">
          IMMEDIATE
        </text>
      </g>
    </g>
  </g>

  <!-- Outer Border Frame -->
  <rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" fill="none" stroke="#2d1305" stroke-width="2" />
</svg>
`;

async function generate() {
  const assetsDir = path.join(__dirname, '../.github/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const outputPngPath = path.join(assetsDir, 'social-preview.png');
  const outputRootPngPath = path.join(__dirname, '../.github/social-preview.png');

  console.log('Rendering updated 1280x640 Social Preview using Sharp...');
  const buffer = Buffer.from(svg);

  await sharp(buffer)
    .resize(WIDTH, HEIGHT)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPngPath);

  fs.copyFileSync(outputPngPath, outputRootPngPath);

  console.log(`Saved social preview to: ${outputPngPath}`);
  console.log(`Saved social preview to: ${outputRootPngPath}`);
}

generate().catch(err => {
  console.error('Error generating social preview:', err);
  process.exit(1);
});
