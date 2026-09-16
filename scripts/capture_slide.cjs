const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3000/presentation_slide_card_evolution.html', {
    waitUntil: 'networkidle0'
  });

  const outputPath = path.join(__dirname, '../public/presentation_card_evolution_slide.png');
  await page.screenshot({ path: outputPath });
  console.log('Saved comparison slide to:', outputPath);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
