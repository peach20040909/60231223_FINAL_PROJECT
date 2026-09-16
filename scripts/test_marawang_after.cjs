const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testMarawangAfter() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Naver Map with '마라왕마라탕' (or '마라왕 거북골로')
  console.log('Navigating to Naver map for 마라왕마라탕...');
  await page.goto('https://map.naver.com/p/search/' + encodeURIComponent('마라왕마라탕'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  const outputPath = path.join(__dirname, '../사진_캡쳐/13_마라왕_네이버지도_검색성공_수정후_After.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved AFTER capture to:', outputPath);

  await browser.close();
}

testMarawangAfter().catch(console.error);
