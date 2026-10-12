const sharp = require('sharp');
const fs = require('fs');

async function processFavicon() {
  const src = 'd:/abpnews/abpnews-website/public/favicon update.png';
  
  // 1. Trim the extra transparent margins so the logo graphic uses all available space
  const trimmed = await sharp(src).trim().toBuffer();
  
  const size = 128;
  const padding = 12;
  const innerSize = size - (padding * 2);

  // Resize trimmed emblem
  const emblemResized = await sharp(trimmed)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  // Create clean rounded white badge background
  const badgeSvg = Buffer.from(
    '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="2" y="2" width="' + (size - 4) + '" height="' + (size - 4) + '" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>' +
    '</svg>'
  );

  // Composite emblem over the white badge
  const finalIcon = await sharp(badgeSvg)
    .composite([{ input: emblemResized, gravity: 'center' }])
    .png()
    .toBuffer();

  const destinations = [
    'd:/abpnews/abpnews-website/public/favicon.png',
    'd:/abpnews/abpnews-website/public/favicon update.png',
    'd:/abpnews/abpnews-website/public/favicon.ico',
    'd:/abpnews/abpnews-website/src/app/icon.png',
    'd:/abpnews/abpnews-admin/public/favicon.png',
    'd:/abpnews/abpnews-admin/public/favicon update.png',
    'd:/abpnews/abpnews-admin/public/favicon.ico',
    'd:/abpnews/abpnews-admin/src/app/icon.png',
  ];

  for (const dest of destinations) {
    fs.writeFileSync(dest, finalIcon);
    console.log('Saved icon to:', dest);
  }
}

processFavicon().then(() => console.log('Done!')).catch(console.error);
