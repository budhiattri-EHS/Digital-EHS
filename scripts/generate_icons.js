const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');

// The Sovereign EHS Crest: Symmetrical 4-Pillar Emblem
// Combines 4 distinct shapes & 4 distinct colors in perfect bilateral mirror symmetry:
// 1. SAFETY (SHIELD): Golden Amber
// 2. ENVIRONMENT (TWIN LEAVES): Emerald Green
// 3. HEALTH (CENTERED HEART): Coral Rose
// 4. DIGITAL (CROWN DIAMOND): Electric Sapphire Blue

const iconSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 1. DIGITAL: Electric Sapphire to Cyan (Vision & Cloud Intelligence) -->
    <linearGradient id="symm-digital" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0071e3" />
      <stop offset="100%" stop-color="#00c7be" />
    </linearGradient>

    <!-- 2. ENVIRONMENT: Vibrant Emerald to Mint (Nature & Sustainability) -->
    <linearGradient id="symm-env" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34c759" />
    </linearGradient>

    <!-- 3. HEALTH: Radiant Coral Rose to Crimson (Vitality & Human Life) -->
    <linearGradient id="symm-health" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>

    <!-- 4. SAFETY: Industrial Golden Amber to Deep Gold (Zero Harm & Protective Shield) -->
    <linearGradient id="symm-safety" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ff9500" />
    </linearGradient>
  </defs>

  <g transform="translate(0, 1)">
    <!-- 1. SAFETY: Foundation Shield Cradle (Golden Amber) -->
    <path
      d="M 50 88
         C 37 82 17 68 17 44
         C 17 35 21 29 26 25
         L 32 31
         C 28 34 25 38 25 44
         C 25 62 41 74 50 80
         C 59 74 75 62 75 44
         C 75 38 72 34 68 31
         L 74 25
         C 79 29 83 35 83 44
         C 83 68 63 82 50 88 Z"
      fill="url(#symm-safety)"
    />

    <!-- 2. ENVIRONMENT: Twin Botanical Leaves (Emerald Green) -->
    <!-- Left Leaf -->
    <path
      d="M 30 46
         C 19 46 19 29 34 23
         C 42 29 42 42 30 46 Z"
      fill="url(#symm-env)"
    />
    <!-- Right Leaf (Mirror reflection across x=50) -->
    <path
      d="M 70 46
         C 81 46 81 29 66 23
         C 58 29 58 42 70 46 Z"
      fill="url(#symm-env)"
    />

    <!-- 3. HEALTH: Centered Heart / Vitality Bloom (Coral Rose) -->
    <path
      d="M 50 66
         C 43 57 33 49 33 37
         C 33 28 40 23 46 26
         C 48 27 49.3 29 50 31
         C 50.7 29 52 27 54 26
         C 60 23 67 28 67 37
         C 67 49 57 57 50 66 Z"
      fill="url(#symm-health)"
    />

    <!-- 4. DIGITAL: Crown Tech Diamond Spark (Electric Sapphire) -->
    <path
      d="M 50 11
         L 59 21
         L 50 31
         L 41 21 Z"
      fill="url(#symm-digital)"
    />
    <circle cx="50" cy="21" r="2.5" fill="#ffffff" />
  </g>
</svg>
`;

async function generateAllIcons() {
  console.log('Generating Sovereign EHS Crest icons...');

  // 1. Write SVG icons
  const svgTargets = [
    path.join(rootDir, 'public', 'icon.svg'),
    path.join(rootDir, 'public', 'favicon.svg'),
    path.join(rootDir, 'src', 'app', 'icon.svg')
  ];

  for (const target of svgTargets) {
    fs.writeFileSync(target, iconSvgContent.trim(), 'utf8');
    console.log(`Saved SVG: ${path.relative(rootDir, target)}`);
  }

  const svgBuffer = Buffer.from(iconSvgContent);

  // 2. Generate PNG raster icons
  // Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(rootDir, 'public', 'favicon.png'));
  console.log('Generated public/favicon.png (64x64)');

  // App Icon 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-192.png'));
  console.log('Generated public/icon-192.png (192x192)');

  // App Icon 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-512.png'));
  console.log('Generated public/icon-512.png (512x512)');

  // Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'public', 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png (180x180)');

  console.log('All icons successfully updated!');
}

generateAllIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
