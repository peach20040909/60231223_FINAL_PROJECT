const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureZoomSlider() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. 지도로 보기 모드 전환
  await page.waitForSelector('#btn-view-map');
  await page.click('#btn-view-map');

  // 2. 지도 컨테이너 스크롤
  await page.evaluate(() => {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  await new Promise(r => setTimeout(r, 2200));

  // 3. 줌 슬라이더 컨트롤러가 나타났는지 확인
  const hasZoomControl = await page.evaluate(() => {
    return !!document.querySelector('.naver-style-zoom-control');
  });
  console.log('Naver zoom control present:', hasZoomControl);

  // 4. 슬라이더 트랙에 마우스 호버하여 툴팁(Lv.16.5) 표시
  await page.hover('.naver-zoom-slider-track');
  await new Promise(r => setTimeout(r, 600));

  // 5. [전체 지도 뷰 캡처] 네이버식 세로 줌 슬라이더 + 하단 미터 축척 바 포함
  const fullOutputPath = path.join(__dirname, '../사진_캡쳐/10_Leaflet지도_네이버식_줌슬라이더_After.png');
  await page.screenshot({ path: fullOutputPath });
  console.log('Saved 10_Leaflet지도_네이버식_줌슬라이더_After.png to:', fullOutputPath);

  // 6. [슬라이더 집중 캡처] 좌상단 네이버 줌 슬라이더 클로즈업 캡처
  const zoomControlElem = await page.$('.naver-style-zoom-control');
  if (zoomControlElem) {
    const detailOutputPath = path.join(__dirname, '../사진_캡쳐/11_Leaflet지도_줌슬라이더_상세_After.png');
    await zoomControlElem.screenshot({ path: detailOutputPath });
    console.log('Saved 11_Leaflet지도_줌슬라이더_상세_After.png to:', detailOutputPath);
  }

  await browser.close();
}

captureZoomSlider().catch(err => {
  console.error(err);
  process.exit(1);
});
