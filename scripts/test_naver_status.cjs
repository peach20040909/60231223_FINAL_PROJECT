const puppeteer = require('puppeteer-core');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Click view map
  await page.click('#btn-view-map');
  await new Promise(r => setTimeout(r, 1000));

  const state = await page.evaluate(() => {
    return {
      currentMapEngine: window.currentMapEngine || typeof currentMapEngine !== 'undefined' ? currentMapEngine : 'undefined',
      hasNaver: !!(window.naver && window.naver.maps),
      naverMapInstance: !!window.naverMap,
      leafletMapInstance: !!window.leafletMap,
      naverCanvasVisible: !document.getElementById('naver-map-canvas')?.classList.contains('hidden'),
      leafletCanvasVisible: !document.getElementById('leaflet-map')?.classList.contains('hidden'),
      markerTitleVisibleCount: document.querySelectorAll('.marker-title:not([style*="display: none"])').length,
      compactMarkersApplied: document.getElementById('map-view-container')?.classList.contains('compact-markers')
    };
  });

  console.log('Test State:', JSON.stringify(state, null, 2));

  await browser.close();
}

test().catch(console.error);
