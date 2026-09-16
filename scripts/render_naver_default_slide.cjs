const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const beforeImgBase64 = fs.readFileSync(path.join(__dirname, '../사진_캡쳐/15_기본지도_Leaflet_숫자마커_수정전_Before.png')).toString('base64');
const afterImgBase64 = fs.readFileSync(path.join(__dirname, '../사진_캡쳐/16_기본지도_네이버지도_가게명마커_수정후_After.png')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>네이버 지도 기본화 및 가게명 마커 상시 표출 비교</title>
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
      background: linear-gradient(135deg, #03c75a, #00b047);
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
      border-color: rgba(3, 199, 90, 0.6);
      box-shadow: 0 8px 30px rgba(3, 199, 90, 0.15);
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
    .panel.after .panel-tag { background: #03c75a; color: #fff; }
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
    .panel.after .panel-foot li strong { color: #4ade80; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>
        <span>🗺️ 혼밥지도 엔진 및 마커 UX 전면 개편</span>
        <span class="badge">네이버 공식 지도 기본화 & 상호명 상시 표출</span>
      </h1>
      <p>지도로 보기 진입 시 네이버 지도 기본 로드 및 마커 캡슐에 가게명(상호명) 상시 표출로 직관성 극대화</p>
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
        <span class="panel-summary">오픈맵(Leaflet) 기본 실행 + 번호만 뜨는 도트 마커</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${beforeImgBase64}" alt="수정 전">
      </div>
      <div class="panel-foot">
        <ul>
          <li>⚠️ <strong>기본 엔진</strong>: Leaflet 오픈맵이 강제 기본값으로 로드됨</li>
          <li>⚠️ <strong>가게명 부재</strong>: 마커에 레벨 숫자(1, 2, 3)만 원형으로 떠서 어떤 식당인지 알 수 없음</li>
          <li>⚠️ <strong>조작 불편</strong>: 상호명을 보려면 114개 마커 하나하나에 마우스를 올려야만 확인 가능</li>
        </ul>
      </div>
    </div>

    <!-- AFTER -->
    <div class="panel after">
      <div class="panel-head">
        <span class="panel-tag">✅ 수정 후 (After)</span>
        <span class="panel-summary">네이버 공식 지도 기본 실행 + [레벨] [가게명] 마커 상시 표출</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${afterImgBase64}" alt="수정 후">
      </div>
      <div class="panel-foot">
        <ul>
          <li>✨ <strong>기본 엔진</strong>: '지도로 보기' 클릭 시 네이버 지도 API v3가 100% 기본 엔진으로 즉시 실행</li>
          <li>✨ <strong>상호명 상시 표출</strong>: 모든 마커에 [Lv 배지] + [식당 상호명] 캡슐이 즉각 한눈에 파악됨</li>
          <li>✨ <strong>하이브리드 자유 전환</strong>: 상단 🌐 토글 버튼을 통해 Leaflet 오픈맵 ↔ 네이버 지도 언제든 전환 가능</li>
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

  const outputPath = path.join(__dirname, '../사진_캡쳐/17_발표슬라이드_기본지도_네이버지도_가게명마커_전환완료.png');
  await page.screenshot({ path: outputPath });
  console.log('✅ Comparison slide saved to:', outputPath);

  await browser.close();
}

renderSlide().catch(err => {
  console.error(err);
  process.exit(1);
});
