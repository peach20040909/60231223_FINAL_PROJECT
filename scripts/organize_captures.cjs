const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function organizeCaptures() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Capture the new LLM Curation Slide
  await page.goto('http://localhost:3000/presentation_slide_llm_curation.html', {
    waitUntil: 'networkidle0'
  });
  const llmSlidePath = path.join(__dirname, '../presentation_captures/04_발표슬라이드_식당설명_LLM개인화_진화.png');
  await page.screenshot({ path: llmSlidePath });
  console.log('Saved LLM curation slide to:', llmSlidePath);

  await browser.close();

  // 2. Copy existing high-quality captures to presentation_captures folder
  const targetDir = path.join(__dirname, '../presentation_captures');

  const copyMap = [
    {
      src: path.join(__dirname, '../public/presentation_cards_before.png'),
      dest: path.join(targetDir, '01_식당카드_Before_스톡사진표지_오류모음.png')
    },
    {
      src: path.join(__dirname, '../public/presentation_cards_after.png'),
      dest: path.join(targetDir, '02_식당카드_After_이모티콘뱃지_심리가이드.png')
    },
    {
      src: path.join(__dirname, '../public/presentation_card_evolution_slide.png'),
      dest: path.join(targetDir, '03_발표슬라이드_카드UI_이모티콘뱃지_진화.png')
    },
    {
      src: path.join(__dirname, '../public/presentation_single_card_before.png'),
      dest: path.join(targetDir, '05_단일카드_비교_Before_치즈밥있슈.png')
    },
    {
      src: path.join(__dirname, '../public/presentation_single_card_after.png'),
      dest: path.join(targetDir, '06_단일카드_비교_After_샘분식.png')
    }
  ];

  for (const item of copyMap) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dest);
      console.log('Copied to presentation_captures:', path.basename(item.dest));
    }
  }

  // Create an informative README.txt in the folder
  const readmeContent = `혼밥지도 (SoloMap) 최종 발표 및 과제 제출용 캡처 자료 모음
========================================================================

본 폴더(presentation_captures)는 발표 PPT 제작 및 최종 보고서 작성을 위해
UI/UX 진화 과정과 문제 해결 사례를 고화질로 캡처하여 정리한 폴더입니다.

[포함된 파일 목록 및 활용처]

1. 01_식당카드_Before_스톡사진표지_오류모음.png
   - 기존의 외부 스톡 사진 표지 방식 캡처
   - 문제점: 실제 메뉴 불일치(치즈밥에 고기볶음 등), 동일 카테고리 사진 복사, 링크 만료로 인한 엑박(Broken Image) 다수 발생

2. 02_식당카드_After_이모티콘뱃지_심리가이드.png
   - 현재 개선 완료된 완성형 카드 캡처
   - 개선점: 직관적인 3D 카테고리 이모티콘 뱃지, 엑박 오류 0%, 절약된 공간에 심리적 혼밥 난이도 가이드 배너 배치

3. 03_발표슬라이드_카드UI_이모티콘뱃지_진화.png (1920x1080 FHD)
   - PPT에 바로 1장으로 띄울 수 있는 완성형 슬라이드 이미지
   - 스톡 사진의 한계 vs 이모티콘 뱃지 개선 효과 좌우 1:1 비교 및 발표 추천 멘트 포함

4. 04_발표슬라이드_식당설명_LLM개인화_진화.png (1920x1080 FHD)
   - "레벨별 하드코딩 복붙 설명" -> "Gemini LLM 활용 93개 식당별 1:1 맞춤 가이드" 비교 슬라이드
   - 떡집/치킨집에 집밥 설명이 붙던 오류를 LLM 파이프라인으로 해결한 인공지능 활용 사례 발표용

5. 05_단일카드_비교_Before_치즈밥있슈.png & 06_단일카드_비교_After_샘분식.png
   - 단일 카드로 세밀하게 비교할 때 사용할 수 있는 고화질 확대 캡처본

========================================================================
`;
  fs.writeFileSync(path.join(targetDir, 'README_캡처설명서.txt'), readmeContent, 'utf-8');
  console.log('Created README_캡처설명서.txt in presentation_captures');
}

organizeCaptures().catch(err => {
  console.error(err);
  process.exit(1);
});
