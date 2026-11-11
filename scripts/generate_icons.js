const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');

// The EHS Delta Prism (Pure geometric shape like Antigravity, ChatGPT, Apple)
const iconSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Facet 1: Environment (Emerald to Cyan) -->
    <linearGradient id="ehs-delta-env" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#00c7be" />
    </linearGradient>

    <!-- Facet 2: Health & Digital (Cyan to Apple Azure) -->
    <linearGradient id="ehs-delta-health" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c7be" />
      <stop offset="100%" stop-color="#0071e3" />
    </linearGradient>

    <!-- Facet 3: Safety Foundation (Apple Azure to Royal Indigo) -->
    <linearGradient id="ehs-delta-safety" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0071e3" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>

  <g transform="translate(0, 1)">
    <!-- Facet 1: Environment (Left Shield Flank) -->
    <path
      d="M 47 14
         C 32 15 18 26 18 45
         C 18 56 23 66 30 73
         L 43 57
         C 39 52 38 48 38 44
         C 38 34 44 26 53 23
         L 47 14 Z"
      fill="url(#ehs-delta-env)"
    />

    <!-- Facet 2: Health & Digital (Right Shield Flank / 'P' Lobe) -->
    <path
      d="M 53 14
         L 47 23
         C 56 26 62 34 62 44
         C 62 48 61 52 57 57
         L 70 73
         C 77 66 82 56 82 45
         C 82 26 68 15 53 14 Z"
      fill="url(#ehs-delta-health)"
    />

    <!-- Facet 3: Safety Foundation (Bottom Apex & Zero-Harm Anchor) -->
    <path
      d="M 33 76
         L 46 60
         C 48 61.2 50 61.8 52 61.8
         C 54 61.8 56 61.2 58 60
         L 71 76
         C 65 83 57 88 50 88
         C 43 88 35 83 33 76 Z"
      fill="url(#ehs-delta-safety)"
    />
  </g>
</svg>
`;

async function generateAllIcons() {
  console.log('Generating EHS Delta Prism icons...');

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

  // Apple Touch Icon 180x180 (iOS Apple squircle standard)
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
