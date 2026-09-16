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

  // 1. 지도로 보기 클릭
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');
  await new Promise(r => setTimeout(r, 600));

  // 2. "네이버 지도" 엔진 토글 버튼 클릭 -> Leaflet 모드로 전환!
  const engineBtn = await page.$('#btn-toggle-map-engine');
  if (engineBtn) {
    await engineBtn.click();
    console.log('Clicked engine toggle to Leaflet');
    await new Promise(r => setTimeout(r, 1500));
  }

  // 3. 지도 컨테이너로 스크롤
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  const outputPath = path.join(__dirname, '../사진_캡쳐/07_Leaflet지도_수정전_Before.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved Leaflet Before map capture to:', outputPath);

  await browser.close();
}

captureLeafletBefore().catch(err => {
  console.error(err);
  process.exit(1);
});
