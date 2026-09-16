const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function renderSlide() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const slideUrl = 'file:///' + path.join(__dirname, '../public/presentation_slide_map_link_fix.html').replace(/\\/g, '/');
  await page.goto(slideUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const outputPath = path.join(__dirname, '../사진_캡쳐/14_발표슬라이드_네이버지도_마라왕_매칭오류_해결.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved presentation slide to:', outputPath);

  await browser.close();
}

renderSlide().catch(console.error);
