const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureBefore() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Naver Map with '마라왕 명지점' failure
  await page.goto('https://map.naver.com/p/search/' + encodeURIComponent('마라왕 명지점'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  const outputPath = path.join(__dirname, '../사진_캡쳐/12_마라왕_네이버지도_검색실패_수정전_Before.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved BEFORE capture to:', outputPath);

  await browser.close();
}

captureBefore().catch(console.error);
