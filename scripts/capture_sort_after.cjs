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
  await new Promise(r => setTimeout(r, 1000));

  // 1. Desktop: Select level-desc (난이도 높은 순 Lv.5 -> 1)
  await page.select('#sort-select', 'level-desc');
  await new Promise(r => setTimeout(r, 800));

  const desktopPath = path.join(__dirname, '../사진_캡쳐/19_정렬옵션_난이도순_정렬성공_수정후_After.png');
  await page.screenshot({ path: desktopPath, fullPage: false });
  console.log('✅ Desktop After screenshot saved to:', desktopPath);

  // 2. Mobile viewport capture (390 x 844 iPhone 14 / Galaxy)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.select('#sort-select', 'distance');
  await new Promise(r => setTimeout(r, 800));

  const mobilePath = path.join(__dirname, '../사진_캡쳐/20_모바일_거리순_난이도순_정렬_After.png');
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log('✅ Mobile After screenshot saved to:', mobilePath);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
