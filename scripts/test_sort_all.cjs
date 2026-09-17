const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSortAll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const getTopCards = () => page.evaluate(() => {
    return Array.from(document.querySelectorAll('.place-card-item')).slice(0, 4).map(card => {
      const name = card.querySelector('.place-title')?.textContent?.trim();
      const level = card.querySelector('.solo-badge-chip')?.textContent?.trim();
      const dist = card.querySelector('.distance-pill')?.textContent?.trim();
      return { name, level, dist };
    });
  });

  // 1. Default (distance)
  const defaultCards = await getTopCards();
  console.log('1. Distance (Default):', defaultCards);

  // 2. Level Desc (Lv.5 -> 1)
  await page.select('#sort-select', 'level-desc');
  await new Promise(r => setTimeout(r, 600));
  const levelDescCards = await getTopCards();
  console.log('2. Level Desc (Lv.5 first):', levelDescCards);

  // 3. Level Asc (Lv.1 -> 5)
  await page.select('#sort-select', 'level-asc');
  await new Promise(r => setTimeout(r, 600));
  const levelAscCards = await getTopCards();
  console.log('3. Level Asc (Lv.1 first):', levelAscCards);

  // 4. Name (가나다순)
  await page.select('#sort-select', 'name');
  await new Promise(r => setTimeout(r, 600));
  const nameCards = await getTopCards();
  console.log('4. Name (Alphabetical):', nameCards);

  // 5. Test Mobile viewport
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.select('#sort-select', 'distance');
  await new Promise(r => setTimeout(r, 600));
  const mobileCards = await getTopCards();
  console.log('5. Mobile viewport Distance:', mobileCards);

  await browser.close();
}

testSortAll().catch(err => {
  console.error(err);
  process.exit(1);
});
