const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const beforeImgBase64 = fs.readFileSync(path.join(__dirname, '../사진_캡쳐/18_정렬옵션_거리순_난이도순_미작동_수정전_Before.png')).toString('base64');
const afterImgBase64 = fs.readFileSync(path.join(__dirname, '../사진_캡쳐/19_정렬옵션_난이도순_정렬성공_수정후_After.png')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>다차원 정렬 옵션(거리순/난이도순) 연동 전후 비교 슬라이드</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #090d16;
      color: #ffffff;
      font-family: 'Pretendard', sans-serif;
      display: flex;
      flex-direction: column;
      padding: 44px 56px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 18px;
    }
    .header-left h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.8px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge {
      font-size: 14px;
      font-weight: 700;
      background: linear-gradient(135deg, #ff5722, #f97316);
      color: #fff;
      padding: 5px 14px;
      border-radius: 20px;
    }
    .header-left p {
      font-size: 17px;
      color: #94a3b8;
      margin-top: 6px;
    }
    .header-right {
      text-align: right;
      font-size: 14px;
      color: #64748b;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      flex: 1;
      min-height: 0;
    }
    .panel {
      background: #131b2e;
      border-radius: 18px;
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .panel.before {
      border-color: rgba(239, 68, 68, 0.4);
    }
    .panel.after {
      border-color: rgba(255, 87, 34, 0.6);
      box-shadow: 0 8px 30px rgba(255, 87, 34, 0.15);
    }
    .panel-head {
      padding: 14px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .panel-tag {
      font-size: 14px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .panel.before .panel-tag { background: #ef4444; color: #fff; }
    .panel.after .panel-tag { background: #ff5722; color: #fff; }
    .panel-summary {
      font-size: 14px;
      color: #cbd5e1;
      font-weight: 500;
    }
    .img-wrap {
      flex: 1;
      overflow: hidden;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
    }
    .panel-foot {
      padding: 16px 22px;
      background: rgba(15, 23, 42, 0.6);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .panel-foot ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .panel-foot li {
      font-size: 14px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .panel.before .panel-foot li strong { color: #f87171; }
    .panel.after .panel-foot li strong { color: #fb923c; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>
        <span>⚡ 식당 다차원 정렬(거리순 · 난이도순) 엔진 구축</span>
        <span class="badge">모바일 터치 & PC 정렬 완벽 호환</span>
      </h1>
      <p>정렬 옵션 선택 시 즉각 반응하는 클라이언트 정렬 파이프라인 및 모바일 최적화 UI 구축</p>
    </div>
    <div class="header-right">
      <strong>명지대학교 융합소프트웨어 고급웹프로그래밍</strong><br>
      FINAL_PROJECT SoloMap
    </div>
  </div>

  <div class="grid">
    <!-- BEFORE -->
    <div class="panel before">
      <div class="panel-head">
        <span class="panel-tag">❌ 수정 전 (Before)</span>
        <span class="panel-summary">옵션을 변경해도 이벤트 리스너 부재로 정렬 미작동</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${beforeImgBase64}" alt="수정 전">
      </div>
      <div class="panel-foot">
        <ul>
          <li>⚠️ <strong>이벤트 부재</strong>: select 변경 이벤트 리스너가 연결되지 않아 선택값이 무시됨</li>
          <li>⚠️ <strong>정렬 로직 누락</strong>: getFilteredList()에서 거리 및 난이도 정렬 알고리즘 미구현</li>
          <li>⚠️ <strong>결과 불일치</strong>: '난이도 높은 순(Lv.5→1)'을 골라도 Lv.2 식당이 1위에 그대로 머무름</li>
        </ul>
      </div>
    </div>

    <!-- AFTER -->
    <div class="panel after">
      <div class="panel-head">
        <span class="panel-tag">✅ 수정 후 (After)</span>
        <span class="panel-summary">5대 정렬 모듈 가동 + 토스트 피드백 + 모바일 100% 호환</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${afterImgBase64}" alt="수정 후">
      </div>
      <div class="panel-foot">
        <ul>
          <li>✨ <strong>다차원 정렬 완벽 가동</strong>: 거리순(가까운순), 난이도 낮은순/높은순, 리뷰순, 가나다순 100% 정렬</li>
          <li>✨ <strong>정렬 즉각 반영</strong>: '난이도 높은 순' 선택 시 325세겹살, 금정가든, 모래내곱창 등 Lv.5 끝판왕 즉시 1순위 정렬</li>
          <li>✨ <strong>모바일/PC 터치 최적화</strong>: 42px 터치 영역 확보 및 change/input 듀얼 리스너로 모든 기기 완벽 작동</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

async function renderSlide() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(__dirname, '../사진_캡쳐/21_발표슬라이드_정렬옵션_거리순_난이도순_연동완료.png');
  await page.screenshot({ path: outputPath });
  console.log('✅ Comparison slide saved to:', outputPath);

  await browser.close();
}

renderSlide().catch(err => {
  console.error(err);
  process.exit(1);
});
