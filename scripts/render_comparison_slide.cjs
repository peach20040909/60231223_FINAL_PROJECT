const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>혼밥지도 Before vs After 비교 슬라이드</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0f172a;
      color: #ffffff;
      font-family: 'Pretendard', sans-serif;
      display: flex;
      flex-direction: column;
      padding: 48px 64px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 20px;
    }
    .header-left h1 {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.8px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .header-left h1 span.badge {
      font-size: 15px;
      font-weight: 700;
      background: linear-gradient(135deg, #ff5722, #f97316);
      color: #fff;
      padding: 5px 14px;
      border-radius: 20px;
    }
    .header-left p {
      font-size: 18px;
      color: #94a3b8;
      margin-top: 6px;
    }
    .header-right {
      text-align: right;
      font-size: 15px;
      color: #64748b;
      font-weight: 500;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      flex: 1;
    }
    .comparison-card {
      background: #1e293b;
      border-radius: 20px;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .comparison-card.before {
      border-top: 5px solid #ef4444;
    }
    .comparison-card.after {
      border-top: 5px solid #10b981;
      background: linear-gradient(180deg, #1e293b 0%, #0f232e 100%);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-tag {
      font-size: 14px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .card-tag.before { background: rgba(239, 68, 68, 0.18); color: #f87171; }
    .card-tag.after { background: rgba(16, 185, 129, 0.18); color: #34d399; }
    .card-title {
      font-size: 22px;
      font-weight: 800;
      color: #f1f5f9;
    }
    .img-preview-box {
      width: 100%;
      height: 480px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: #020617;
      margin-bottom: 18px;
      position: relative;
    }
    .img-preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 9px;
      font-size: 15px;
      line-height: 1.45;
    }
    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .feature-list.before li { color: #cbd5e1; }
    .feature-list.after li { color: #e2e8f0; }
    .bullet { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>
        혼밥지도 (SoloMap) UI/UX 고도화 및 진화 과정
        <span class="badge">Before vs After</span>
      </h1>
      <p>초기 기능 구현 프로토타입에서 명지대 학우 맞춤형 프리미엄 서비스로의 발전</p>
    </div>
    <div class="header-right">
      <p>고급웹프로그래밍 기말 프로젝트 (60231223 장민준)</p>
      <p style="color: #94a3b8; margin-top: 4px;">프론트엔드 디자인 시스템 & 지도 엔진 리팩토링 보고서</p>
    </div>
  </div>

  <div class="cards-grid">
    <!-- BEFORE CARD -->
    <div class="comparison-card before">
      <div class="card-header">
        <span class="card-tag before">BEFORE (초기 버전)</span>
        <h2 class="card-title">기본 프로토타입 UI</h2>
      </div>
      <div class="img-preview-box">
        <img src="/presentation_before_ui.png" alt="초기 UI">
      </div>
      <ul class="feature-list before">
        <li><span class="bullet">❌</span> <span><strong>이미지 엑박 및 불일치:</strong> Unsplash 스톡 사진 사용으로 실제 식당 메뉴와 사진이 불일치하고 엑박 발생</span></li>
        <li><span class="bullet">❌</span> <span><strong>단순 난이도 분류:</strong> 직관적이지 않은 명칭(초급/바 테이블/마스터) 및 심리적 가이드 부재</span></li>
        <li><span class="bullet">❌</span> <span><strong>정렬 & 검색 편의 부재:</strong> 검색어 원클릭 삭제(✕) 미지원, 거리순/난이도순 다차원 정렬 불가</span></li>
        <li><span class="bullet">❌</span> <span><strong>오픈맵 워터마크 & 마커 겹침:</strong> CartoDB 타일 API Key 오류 워터마크 노출 및 100여 개 마커 기둥 겹침 현상</span></li>
      </ul>
    </div>

    <!-- AFTER CARD -->
    <div class="comparison-card after">
      <div class="card-header">
        <span class="card-tag after">AFTER (최종 완성본)</span>
        <h2 class="card-title">사용자 중심 프리미엄 UI & 듀얼 맵</h2>
      </div>
      <div class="img-preview-box">
        <img src="/presentation_after_map_leaflet.png" alt="완성된 UI">
      </div>
      <ul class="feature-list after">
        <li><span class="bullet">✨</span> <span><strong>공식 한국어 지도 완전 전환:</strong> 국토교통부 브이월드(VWorld) & 네이버 지도 v3 무결점 연동 (워터마크 0%)</span></li>
        <li><span class="bullet">✨</span> <span><strong>적응형 마커 & 3대 랜드마크:</strong> 줌 레벨에 따라 원형 배지 ↔ 풀네임 캡슐 자동 전환 및 명지대·전문대·백련시장 앵커</span></li>
        <li><span class="bullet">✨</span> <span><strong>대동명지도 111곳 + 5단계 심리 지수:</strong> 시선 부담률과 1인석 유무를 반영한 Lv.1 입문 ~ Lv.5 끝판왕 큐레이션</span></li>
        <li><span class="bullet">✨</span> <span><strong>학우 편의 극대화:</strong> 🎲 랜덤 혼밥 룰렛, ⚡ 5가지 다차원 정렬, 📋 원클릭 주소 복사, 💬 리뷰 개별 삭제 모달</span></li>
      </ul>
    </div>
  </div>
</body>
</html>`;

async function run() {
  const slideHtmlPath = path.join(__dirname, '..', 'public', 'presentation_comparison.html');
  fs.writeFileSync(slideHtmlPath, htmlContent, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/presentation_comparison.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const outPath = path.join(__dirname, '..', 'public', 'presentation_before_after_slide.png');
  await page.screenshot({ path: outPath });
  console.log('Saved 1920x1080 Comparison Slide to:', outPath);

  await browser.close();
}

run().catch(console.error);
