const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  // 1. Capture BEFORE UI (Early Rainbow Version from commit 60943fa)
  const page1 = await browser.newPage();
  await page1.goto('http://localhost:3000/before_index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  const beforeImgPath = path.join(__dirname, '..', 'public', 'presentation_before_ui.png');
  await page1.screenshot({ path: beforeImgPath });
  console.log('Saved Before UI:', beforeImgPath);
  await page1.close();

  // 2. Capture AFTER UI (Modern Minimal List View)
  const page2 = await browser.newPage();
  await page2.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  const afterListImgPath = path.join(__dirname, '..', 'public', 'presentation_after_list.png');
  await page2.screenshot({ path: afterListImgPath });
  console.log('Saved After List UI:', afterListImgPath);

  // 3. Capture AFTER UI (Naver Map View)
  await page2.evaluate(() => {
    const btn = document.getElementById('btn-view-map');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page2.evaluate(() => {
    const el = document.getElementById('map-view-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));
  const afterMapNaverPath = path.join(__dirname, '..', 'public', 'presentation_after_map_naver.png');
  await page2.screenshot({ path: afterMapNaverPath });
  console.log('Saved After Naver Map UI:', afterMapNaverPath);

  // 4. Capture AFTER UI (Fixed Leaflet Korean VWorld Map View)
  await page2.evaluate(() => {
    const engineBtn = document.getElementById('btn-toggle-map-engine');
    if (engineBtn) engineBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const afterMapLeafletPath = path.join(__dirname, '..', 'public', 'presentation_after_map_leaflet.png');
  await page2.screenshot({ path: afterMapLeafletPath });
  console.log('Saved After Leaflet Map UI:', afterMapLeafletPath);

  await browser.close();
  console.log('All presentation screenshots captured successfully!');
}

main().catch(console.error);
