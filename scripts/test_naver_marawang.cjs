const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testMarawang() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Testing Naver search for 마라왕...');
  await page.goto('https://map.naver.com/p/search/' + encodeURIComponent('마라왕'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(__dirname, 'marawang_only_search.png') });

  console.log('Testing Naver search for 거북골로 마라왕...');
  await page.goto('https://map.naver.com/p/search/' + encodeURIComponent('거북골로 마라왕'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(__dirname, 'marawang_street_search.png') });

  await browser.close();
}

testMarawang().catch(err => console.error(err));
