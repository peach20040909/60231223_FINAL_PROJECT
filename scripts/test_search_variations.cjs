const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testItems = [
  { name: '마라왕 명지점', clean: '마라왕', addr: '거북골로 14' },
  { name: '치즈밥있슈 명지대점', clean: '치즈밥있슈', addr: '명지대길 62' },
  { name: '밥은 명지대점', clean: '밥은', addr: '거북골로 14' },
  { name: '생선구이와돈까스 2호점', clean: '생선구이와돈까스', addr: '명지대2길 7' },
  { name: '나베야 남가좌명지대점', clean: '나베야', addr: '증가로 150' },
  { name: '미분당 가좌점', clean: '미분당 가좌점', addr: '증가로 122' },
  { name: '스텔라떡볶이 서울명지대점', clean: '스텔라떡볶이', addr: '증가로 150' },
  { name: '육초연 명지대점', clean: '육초연', addr: '거북골로 21-12' },
  { name: '타코볼볼 명지대점', clean: '타코볼볼', addr: '거북골로 27' }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  async function checkQuery(query) {
    const url = 'https://map.naver.com/p/search/' + encodeURIComponent(query);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const frames = page.frames();
    const searchFrame = frames.find(f => f.name() === 'searchIframe');
    const entryFrame = frames.find(f => f.name() === 'entryIframe');

    if (entryFrame) {
      // Directly found place and opened place detail!
      return { status: 'DIRECT_ENTRY', query };
    }

    if (searchFrame) {
      const text = await searchFrame.evaluate(() => document.body.innerText).catch(() => '');
      if (text.includes('조건에 맞는 업체가 없습니다')) {
        return { status: 'NO_RESULTS', query };
      }
      return { status: 'LIST_FOUND', query, count: text.split('\n').filter(l => l.length > 2).length };
    }

    return { status: 'UNKNOWN', query };
  }

  for (const item of testItems) {
    console.log(`\nTesting item: ${item.name}`);
    const resOrig = await checkQuery(item.name);
    console.log(`  [Original] "${item.name}" => ${resOrig.status}`);

    if (resOrig.status === 'NO_RESULTS') {
      const resClean = await checkQuery(item.clean);
      console.log(`  [Clean]    "${item.clean}" => ${resClean.status}`);
      const resAddr = await checkQuery(`${item.clean} ${item.addr.split(' ')[0]}`);
      console.log(`  [Addr]     "${item.clean} ${item.addr.split(' ')[0]}" => ${resAddr.status}`);
    }
  }

  await browser.close();
}

run().catch(console.error);
