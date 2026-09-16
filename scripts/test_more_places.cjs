const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const queries = [
  '먹으면돼지 명지대점',
  '먹으면돼지 거북골로',
  '화전 명지대점',
  '화전 거북골로',
  '김밥천국 명지점',
  '김밥천국 거북골로',
  '동궁찜닭 명지대점',
  '킹콩부대찌개 명지대점',
  '본죽&비빔밥cafe 남가좌점',
  '긴자료코 명지대점',
  '여부초밥 명지대점',
  '만평우동 명지대점',
  '핵밥 명지대점',
  '허니돈 명지대점',
  '큰손닭갈비&곱창 명지대점'
];

async function testList() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const q of queries) {
    const url = 'https://map.naver.com/p/search/' + encodeURIComponent(q);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    const frames = page.frames();
    const searchFrame = frames.find(f => f.name() === 'searchIframe');
    const entryFrame = frames.find(f => f.name() === 'entryIframe');

    let status = 'OK';
    if (entryFrame) {
      status = 'DIRECT_ENTRY 🎯';
    } else if (searchFrame) {
      const text = await searchFrame.evaluate(() => document.body.innerText).catch(() => '');
      if (text.includes('조건에 맞는 업체가 없습니다')) {
        status = 'FAIL ❌';
      } else {
        status = 'LIST 📋';
      }
    } else {
      status = 'UNKNOWN ❓';
    }

    console.log(`[${status}] ${q}`);
  }

  await browser.close();
}

testList().catch(console.error);
