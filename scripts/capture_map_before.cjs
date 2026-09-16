const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureMapBefore() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 지도로 보기 버튼 클릭
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');

  // 지도 컨테이너로 스크롤 이동
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.join(__dirname, '../사진_캡쳐/07_지도_줌기능_수정전_Before.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved correct full map Before capture to:', outputPath);

  await browser.close();
}

captureMapBefore().catch(err => {
  console.error(err);
  process.exit(1);
});
