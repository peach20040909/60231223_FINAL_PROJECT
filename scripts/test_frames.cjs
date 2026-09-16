const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFrames() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://map.naver.com/p/search/' + encodeURIComponent('마라왕 명지점'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  for (const frame of page.frames()) {
    console.log('Frame name:', frame.name(), 'url:', frame.url());
    try {
      const text = await frame.evaluate(() => document.body.innerText);
      if (text.length > 0) {
        console.log(`--- Frame [${frame.name()}] Text Preview (${text.length} chars) ---`);
        console.log(text.substring(0, 300));
      }
    } catch (e) {}
  }

  await browser.close();
}

testFrames().catch(console.error);
