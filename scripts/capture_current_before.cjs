const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1.5 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Switch to map view
  await page.click('#btn-view-map');
  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.join(__dirname, '../사진_캡쳐/15_기본지도_Leaflet_숫자마커_수정전_Before.png');
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log('✅ Before screenshot saved to:', outputPath);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
