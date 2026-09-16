const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const places = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/daedongPlaces.json'), 'utf8'));

// Test places with branch suffix and others
const testCandidates = [
  '마라왕 명지점',
  '밥은 명지대점',
  '생선구이와돈까스 2호점',
  '육초연 명지대점',
  '나베야 남가좌명지대점',
  '미분당 가좌점',
  '스텔라떡볶이 서울명지대점',
  '큰손닭갈비&곱창 명지대점',
  '주인백파스타 명지대점',
  '타코볼볼 명지대점',
  '먹으면돼지 명지대점',
  '화전 명지대점',
  '여부초밥 명지대점',
  '만평우동 명지대점',
  '치즈밥있슈 명지대점'
];

async function checkBatch() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];

  for (const query of testCandidates) {
    const url = 'https://map.naver.com/p/search/' + encodeURIComponent(query);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const pageText = await page.evaluate(() => document.body.innerText);
    const isFailed = pageText.includes('조건에 맞는 업체가 없습니다') || pageText.includes('일치하는 결과를 찾을 수 없습니다');
    results.push({ query, isFailed, url });
    console.log(`[${isFailed ? 'FAIL ❌' : 'SUCCESS ⭕'}] ${query}`);
  }

  console.log('\n--- SUMMARY ---');
  console.log('Failed count:', results.filter(r => r.isFailed).length);
  console.log(results.filter(r => r.isFailed));

  await browser.close();
}

checkBatch().catch(console.error);
