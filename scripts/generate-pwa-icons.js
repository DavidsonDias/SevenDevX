// scripts/generate-pwa-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.resolve(__dirname, '../public/logo.png'); // SEU LOGO
const outputDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    
    console.log(`✅ Generated icon-${size}x${size}.png`);
  }
  
  // Maskable icons (padding 10% para safe zone)
  await sharp(inputFile)
    .resize(174, 174) // 192 - 18px padding (10%)
    .extend({
      top: 9,
      bottom: 9,
      left: 9,
      right: 9,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .toFile(path.join(outputDir, 'icon-maskable-192x192.png'));
  
  await sharp(inputFile)
    .resize(465, 465) // 512 - 47px padding
    .extend({
      top: 23,
      bottom: 24,
      left: 23,
      right: 24,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .toFile(path.join(outputDir, 'icon-maskable-512x512.png'));
  
  console.log('✅ All icons generated!');
}

generateIcons().catch(console.error);