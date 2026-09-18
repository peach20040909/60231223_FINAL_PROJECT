const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const logoSvg = fs.readFileSync(path.resolve(__dirname, '../public/logo.svg'), 'utf8');
  const favSvg = fs.readFileSync(path.resolve(__dirname, '../public/favicon.svg'), 'utf8');
  const logoTransSvg = fs.readFileSync(path.resolve(__dirname, '../public/logo-transparent.svg'), 'utf8');
  const page = await browser.newPage();

  // 1. 파비콘 렌더링 (favicon.svg 기반)
  const favSizes = [16, 32, 48, 64, 180, 192, 512];
  const pngBuffers = {};

  for (const size of favSizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const html = `<!DOCTYPE html><html><head><style>html, body { margin:0; padding:0; width:${size}px; height:${size}px; overflow:hidden; background:transparent; }</style></head><body>${favSvg}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    const buf = await page.screenshot({ omitBackground: true, type: 'png' });
    pngBuffers[size] = buf;
    if (size === 16) fs.writeFileSync(path.resolve(__dirname, '../public/favicon-16x16.png'), buf);
    if (size === 32) fs.writeFileSync(path.resolve(__dirname, '../public/favicon-32x32.png'), buf);
    if (size === 64) fs.writeFileSync(path.resolve(__dirname, '../public/favicon.png'), buf);
    if (size === 180) fs.writeFileSync(path.resolve(__dirname, '../public/apple-touch-icon.png'), buf);
    if (size === 192) fs.writeFileSync(path.resolve(__dirname, '../public/android-chrome-192x192.png'), buf);
    if (size === 512) fs.writeFileSync(path.resolve(__dirname, '../public/android-chrome-512x512.png'), buf);
  }

  // 2. 메인 브랜드 로고 (logo.svg 기반: 128, 256, 512, 1024)
  for (const size of [128, 256, 512, 1024]) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const html = `<!DOCTYPE html><html><head><style>html, body { margin:0; padding:0; width:${size}px; height:${size}px; overflow:hidden; background:transparent; }</style></head><body>${logoSvg}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    const buf = await page.screenshot({ omitBackground: true, type: 'png' });
    fs.writeFileSync(path.resolve(__dirname, `../public/logo-${size}x${size}.png`), buf);
    if (size === 512) {
      fs.writeFileSync(path.resolve(__dirname, '../public/logo.png'), buf);
    }
  }

  // 3. 투명 배경 심볼 로고 (logo-transparent.svg 기반: 512, 1024)
  for (const size of [512, 1024]) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const html = `<!DOCTYPE html><html><head><style>html, body { margin:0; padding:0; width:${size}px; height:${size}px; overflow:hidden; background:transparent; }</style></head><body>${logoTransSvg}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    const buf = await page.screenshot({ omitBackground: true, type: 'png' });
    if (size === 512) fs.writeFileSync(path.resolve(__dirname, '../public/logo-transparent.png'), buf);
    if (size === 1024) fs.writeFileSync(path.resolve(__dirname, '../public/logo-transparent-1024x1024.png'), buf);
  }

  await browser.close();

  // 4. 멀티사이즈 ICO 파일 작성 (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;
  let offset = 6 + 16 * count;
  const entries = [];

  for (const s of icoSizes) {
    const buf = pngBuffers[s];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // Width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // Height
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += buf.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = Icon
  header.writeUInt16LE(count, 4); // Count

  const icoBuffer = Buffer.concat([header, ...entries, ...icoSizes.map(s => pngBuffers[s])]);
  fs.writeFileSync(path.resolve(__dirname, '../public/favicon.ico'), icoBuffer);

  console.log('Successfully generated all B-plan logo assets (Master SVG, Transparent SVG, High-Res PNGs, ICO)!');
})();
