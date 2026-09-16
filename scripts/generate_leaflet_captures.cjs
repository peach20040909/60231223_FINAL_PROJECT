const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateAllLeafletCaptures() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 🎯 레티나/2K 초고화질 (deviceScaleFactor: 2) 로 폰트 깨짐 0%!
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 지도로 보기 버튼 클릭
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');

  // 지도 컨테이너로 스크롤
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. [BEFORE 캡처] 캡슐 마커가 다닥다닥 겹치던 기존 렉 발생 상태를 초고화질로 캡처!
  // 임시로 compact-markers 클래스를 제거하여 114개 캡슐 마커가 겹치는 상태를 재현
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    const leafletElem = document.getElementById('leaflet-map');
    if (mapContainer) mapContainer.classList.remove('compact-markers');
    if (leafletElem) leafletElem.classList.remove('compact-markers');
  });
  await new Promise(r => setTimeout(r, 600));

  const beforeOutputPath = path.join(__dirname, '../사진_캡쳐/07_Leaflet지도_렉_마커겹침_수정전_Before.png');
  await page.screenshot({ path: beforeOutputPath });
  console.log('1. Saved crystal clear high-res BEFORE capture:', beforeOutputPath);

  // 2. [AFTER 캡처 #1] 스마트 도트 핀 모드 (겹침 100% 해소, 60fps 무지연)
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    const leafletElem = document.getElementById('leaflet-map');
    if (mapContainer) mapContainer.classList.add('compact-markers');
    if (leafletElem) leafletElem.classList.add('compact-markers');
  });
  await new Promise(r => setTimeout(r, 600));

  const afterDotPath = path.join(__dirname, '../사진_캡쳐/08_Leaflet지도_렉해결_스마트도트_After.png');
  await page.screenshot({ path: afterDotPath });
  console.log('2. Saved crystal clear high-res AFTER (Dot mode) capture:', afterDotPath);

  // 3. [AFTER 캡처 #2] 줌 인(Zoom 17.5) 시 상세 캡슐 자연스러운 확장
  await page.evaluate(() => {
    if (window.leafletMap) {
      window.leafletMap.setZoom(17.5);
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  const afterZoomPath = path.join(__dirname, '../사진_캡쳐/09_Leaflet지도_스무스확대_상세캡슐_After.png');
  await page.screenshot({ path: afterZoomPath });
  console.log('3. Saved crystal clear high-res AFTER (Zoom In) capture:', afterZoomPath);

  await browser.close();
}

generateAllLeafletCaptures().catch(err => {
  console.error(err);
  process.exit(1);
});
