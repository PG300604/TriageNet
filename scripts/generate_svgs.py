import os

svg_dir = r"p:\TriageNet\video_production\assets\svgs"
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    "redis.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#D82C20" stroke="#FFFFFF" stroke-width="2"/>
  <polygon points="50,25 78,39 78,61 50,75 22,61 22,39" fill="#A41E12"/>
  <text x="50" y="56" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">REDIS</text>
</svg>""",

    "spring-boot.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
  <path fill="#6DB33F" d="m23.693 10.7058-4.73-8.1844c-.4094-.7106-1.4166-1.2942-2.2402-1.2942H7.2725c-.819 0-1.8308.5836-2.2402 1.2942L.307 10.7058c-.4095.7106-.4095 1.873 0 2.5837l4.7252 8.189c.4094.7107 1.4166 1.2943 2.2402 1.2943h9.455c.819 0 1.826-.5836 2.2402-1.2942l4.7252-8.189c.4095-.7107.4095-1.8732 0-2.5838z"/>
  <path fill="#FFFFFF" d="M10.9763 5.7547c0-.5365.4377-.9742.9742-.9742s.9742.4377.9742.9742v5.8217c0 .5366-.4377.9742-.9742.9742s-.9742-.4376-.9742-.9742z"/>
  <path fill="#FFFFFF" d="M11.9505 18.1841c-3.6427 0-6.6077-2.965-6.6077-6.6077.0047-2.0896.993-4.0521 2.6685-5.304a.8657.8657 0 0 1 1.2142.1788.8657.8657 0 0 1-.1788 1.2143c-2.1602 1.6048-2.612 4.6592-1.0072 6.8194 1.6049 2.1603 4.6593 2.612 6.8195 1.0072 1.2378-.9177 1.9673-2.372 1.9673-3.9157a4.8972 4.8972 0 0 0-1.9861-3.925c-.386-.2824-.466-.8284-.1836-1.2143.2824-.386.8283-.466 1.2143-.1835 1.6895 1.2471 2.6826 3.2238 2.6873 5.3228 0 3.6474-2.965 6.6077-6.6077 6.6077z"/>
</svg>""",

    "nextjs.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#000000" stroke="#444444" stroke-width="2"/>
  <path d="M35 30 L35 70 M35 30 L68 70 M65 30 L65 52" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>""",

    "postgresql.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="#336791"/>
  <path d="M35 32 C42 22 58 22 65 32 C72 42 70 58 65 68 C60 76 40 76 35 68 C30 58 28 42 35 32 Z" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="42" cy="42" r="3" fill="#336791"/>
  <circle cx="58" cy="42" r="3" fill="#336791"/>
  <path d="M46 54 Q50 58 54 54" stroke="#336791" stroke-width="2" fill="none"/>
</svg>""",

    "android.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M28 48 C28 35 38 25 50 25 C62 25 72 35 72 48 Z" fill="#3DDC84"/>
  <circle cx="42" cy="40" r="3" fill="#FFFFFF"/>
  <circle cx="58" cy="40" r="3" fill="#FFFFFF"/>
  <line x1="38" y1="26" x2="32" y2="16" stroke="#3DDC84" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="26" x2="68" y2="16" stroke="#3DDC84" stroke-width="3" stroke-linecap="round"/>
  <rect x="28" y="52" width="44" height="30" rx="5" fill="#3DDC84"/>
</svg>""",

    "docker.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="#1D63ED"/>
  <rect x="30" y="42" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <rect x="39" y="42" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <rect x="48" y="42" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <rect x="57" y="42" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <rect x="39" y="33" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <rect x="48" y="33" width="7" height="7" fill="#FFFFFF" rx="1"/>
  <path d="M22 52 C26 68 50 72 74 65 C78 63 80 57 78 54 C66 52 50 52 22 52 Z" fill="#FFFFFF"/>
</svg>""",

    "typescript.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="8" y="8" width="84" height="84" rx="14" fill="#3178C6"/>
  <text x="50" y="68" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TS</text>
</svg>""",

    "java.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="#EA2D2E"/>
  <path d="M38 70 C46 72 54 72 62 70 C58 66 42 66 38 70 Z" fill="#FFFFFF"/>
  <path d="M34 62 C46 65 56 65 66 62 C60 57 40 57 34 62 Z" fill="#FFFFFF"/>
  <path d="M48 30 Q54 40 44 48 Q54 52 50 60" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>""",

    "leaflet.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="#199900"/>
  <path d="M30 65 C30 45 45 25 70 20 C65 45 50 65 30 65 Z" fill="#A4E53B"/>
  <line x1="30" y1="65" x2="60" y2="30" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
</svg>""",

    "tailwind.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="#0F172A"/>
  <path d="M32 46 C35 38 42 34 50 36 C55 37 58 42 63 44 C67 45 70 43 73 38 C70 46 64 50 56 48 C51 47 48 42 43 40 C39 39 36 41 32 46 Z" fill="#38BDF8"/>
  <path d="M22 58 C25 50 32 46 40 48 C45 49 48 54 53 56 C57 57 60 55 63 50 C60 58 54 62 46 60 C41 59 38 54 33 52 C29 51 26 53 22 58 Z" fill="#38BDF8"/>
</svg>""",

    "python.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M48 15 C34 15 35 21 35 21 L35 28 L49 28 L49 30 L27 30 C27 30 18 30 18 43 C18 56 25 56 25 56 L30 56 L30 49 C30 43 36 43 36 43 L49 43 C55 43 55 37 55 37 L55 22 C55 15 48 15 48 15 Z" fill="#3776AB"/>
  <circle cx="42" cy="22" r="2.5" fill="#FFFFFF"/>
  <path d="M52 85 C66 85 65 79 65 79 L65 72 L51 72 L51 70 L73 70 C73 70 82 70 82 57 C82 44 75 44 75 44 L70 44 L70 51 C70 57 64 57 64 57 L51 57 C45 57 45 63 45 63 L45 78 C45 85 52 85 52 85 Z" fill="#FFD43B"/>
  <circle cx="58" cy="78" r="2.5" fill="#FFFFFF"/>
</svg>"""
}

for name, content in svgs.items():
    file_path = os.path.join(svg_dir, name)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"[OK] Generated: {name}")

print(f"\nSuccessfully created all {len(svgs)} tech stack SVGs in {svg_dir}")
