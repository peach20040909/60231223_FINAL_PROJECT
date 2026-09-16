const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
  });

  // 1. Capture BEFORE Cards (Full cards showing stock photos, titles, tags, buttons)
  const page1 = await browser.newPage();
  await page1.goto('http://localhost:3000/before_index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  
  // Scroll down so the cards are prominently displayed in full view
  await page1.evaluate(() => {
    const el = document.getElementById('places-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, -60);
  });
  await new Promise(r => setTimeout(r, 500));
  
  const beforeCardsPath = path.join(__dirname, '..', 'public', 'presentation_cards_before.png');
  await page1.screenshot({ path: beforeCardsPath });
  console.log('Saved Before Cards:', beforeCardsPath);
  await page1.close();

  // 2. Capture AFTER Cards (Full cards showing emoji badges, solo banners, tags, reviews, copy & map buttons)
  const page2 = await browser.newPage();
  await page2.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  
  await page2.evaluate(() => {
    const el = document.getElementById('places-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, -60);
  });
  await new Promise(r => setTimeout(r, 500));
  
  const afterCardsPath = path.join(__dirname, '..', 'public', 'presentation_cards_after.png');
  await page2.screenshot({ path: afterCardsPath });
  console.log('Saved After Cards:', afterCardsPath);

  // 3. Also capture a tight crop of a single card comparison (치즈밥있슈 Before vs After)
  // Before single card
  const page3 = await browser.newPage();
  await page3.goto('http://localhost:3000/before_index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const beforeCardEl = await page3.$('.place-card-item');
  if (beforeCardEl) {
    const singleBeforePath = path.join(__dirname, '..', 'public', 'presentation_single_card_before.png');
    await beforeCardEl.screenshot({ path: singleBeforePath });
    console.log('Saved Single Card Before:', singleBeforePath);
  }
  await page3.close();

  // After single card
  const page4 = await browser.newPage();
  await page4.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const afterCardEl = await page4.$('.place-card-item');
  if (afterCardEl) {
    const singleAfterPath = path.join(__dirname, '..', 'public', 'presentation_single_card_after.png');
    await afterCardEl.screenshot({ path: singleAfterPath });
    console.log('Saved Single Card After:', singleAfterPath);
  }
  await page4.close();

  await browser.close();
  console.log('Finished capturing all card screenshots!');
}

main().catch(console.error);
