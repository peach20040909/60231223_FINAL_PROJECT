const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const places = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/daedongPlaces.json'), 'utf8'));

async function auditAll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const failures = [];
  const successes = [];

  console.log(`Starting full audit for ${places.length} places...`);

  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    const originalQuery = p.place_name;
    const url = 'https://map.naver.com/p/search/' + encodeURIComponent(originalQuery);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1200));

      const frames = page.frames();
      const searchFrame = frames.find(f => f.name() === 'searchIframe');
      const entryFrame = frames.find(f => f.name() === 'entryIframe');

      let failed = false;

      if (entryFrame) {
        failed = false;
      } else if (searchFrame) {
        const text = await searchFrame.evaluate(() => document.body.innerText).catch(() => '');
        if (text.includes('조건에 맞는 업체가 없습니다') || text.includes('일치하는 결과를 찾을 수 없습니다')) {
          failed = true;
        }
      } else {
        // No search frame or entry frame
        failed = true;
      }

      if (failed) {
        failures.push({
          id: p.id,
          name: p.place_name,
          road_address: p.road_address_name,
          phone: p.phone
        });
        console.log(`[${i+1}/${places.length}] ❌ FAIL: ${p.place_name}`);
      } else {
        successes.push(p.place_name);
        console.log(`[${i+1}/${places.length}] ⭕ OK: ${p.place_name}`);
      }
    } catch (e) {
      failures.push({ id: p.id, name: p.place_name, error: e.message });
      console.log(`[${i+1}/${places.length}] ⚠️ ERR: ${p.place_name}`);
    }
  }

  console.log('\n=======================================');
  console.log(`Audit Complete! Total: ${places.length}, Success: ${successes.length}, Failed: ${failures.length}`);
  console.log('Failed List:');
  console.log(JSON.stringify(failures, null, 2));

  fs.writeFileSync(
    path.join(__dirname, 'naver_audit_result.json'),
    JSON.stringify({ total: places.length, successCount: successes.length, failCount: failures.length, failures }, null, 2),
    'utf8'
  );

  await browser.close();
}

auditAll().catch(console.error);
