const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureLeafletBefore() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 브라우저 컨텍스트에서 switchViewMode('map') 실행 및 leaflet 강제 활성화
  await page.evaluate(() => {
    // switch to leaflet
    window.currentMapEngine = 'leaflet';
    const btnViewMap = document.getElementById('btn-view-map');
    if (btnViewMap) btnViewMap.click();

    // ensure leaflet map is visible
    const naverCanvas = document.getElementById('naver-map-canvas');
    const leafletCanvas = document.getElementById('leaflet-map');
    if (naverCanvas) naverCanvas.classList.add('hidden');
    if (leafletCanvas) leafletCanvas.classList.remove('hidden');

    const mapEngineLabel = document.getElementById('map-engine-label');
    if (mapEngineLabel) mapEngineLabel.textContent = 'Leaflet (오픈맵)';

    if (typeof initLeafletMap === 'function') {
      initLeafletMap();
      if (typeof leafletMap !== 'undefined' && leafletMap) {
        leafletMap.invalidateSize();
        if (typeof fitMapBounds === 'function') fitMapBounds();
      }
    }

    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  // 타일 및 마커 렌더링 대기
  await new Promise(r => setTimeout(r, 2500));

  const outputPath = path.join(__dirname, '../사진_캡쳐/07_Leaflet지도_줌_렉_수정전_Before.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved correct Leaflet Before map capture to:', outputPath);

  await browser.close();
}

captureLeafletBefore().catch(err => {
  console.error(err);
  process.exit(1);
});
