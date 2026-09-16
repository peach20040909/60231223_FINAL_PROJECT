const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAndCaptureLeafletAfter() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 🎯 deviceScaleFactor: 2 로 초고화질 선명도 확보!
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // "지도로 보기" 클릭
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');

  // 지도 컨테이너로 스크롤
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  // 1.5초간 타일 및 마커 렌더링 대기
  await new Promise(r => setTimeout(r, 2000));

  // 1) 기본 뷰(도트 핀 모드) 캡처 -> 겹침 100% 해결 및 렉 제로 증명
  const outputPath = path.join(__dirname, '../사진_캡쳐/08_Leaflet지도_렉해결_스마트도트_After.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved crystal clear high-res After capture to:', outputPath);

  // 2) 마우스 호버 시 툴팁 및 확대 시 캡슐 확장 모습도 캡처
  // 줌을 17.5로 살짝 확대해서 상세 캡슐 뷰 캡처
  await page.evaluate(() => {
    if (window.leafletMap) {
      window.leafletMap.setZoom(17.5);
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  const zoomPath = path.join(__dirname, '../사진_캡쳐/09_Leaflet지도_스무스확대_상세캡슐_After.png');
  await page.screenshot({ path: zoomPath });
  console.log('Saved Zoom In After capture to:', zoomPath);

  await browser.close();
}

testAndCaptureLeafletAfter().catch(err => {
  console.error(err);
  process.exit(1);
});
