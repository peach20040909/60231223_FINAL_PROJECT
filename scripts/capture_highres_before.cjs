const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureHighResBefore() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 🎯 deviceScaleFactor: 2 로 레티나/2K 초고화질 선명도 확보!
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 지도로 보기 버튼 클릭
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');

  // Leaflet 지도 컨테이너 확인 및 스크롤
  await page.evaluate(() => {
    // Leaflet 지도가 화면에 보이도록 확실하게 설정
    const leafletCanvas = document.getElementById('leaflet-map');
    const naverCanvas = document.getElementById('naver-map-canvas');
    if (naverCanvas) naverCanvas.classList.add('hidden');
    if (leafletCanvas) leafletCanvas.classList.remove('hidden');

    const mapEngineLabel = document.getElementById('map-engine-label');
    if (mapEngineLabel) mapEngineLabel.textContent = 'Leaflet (오픈맵)';

    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  // 타일 및 마커 렌더링 대기
  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.join(__dirname, '../사진_캡쳐/07_Leaflet지도_렉_마커겹침_수정전_Before.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved crystal clear high-res Before capture to:', outputPath);

  await browser.close();
}

captureHighResBefore().catch(err => {
  console.error(err);
  process.exit(1);
});
