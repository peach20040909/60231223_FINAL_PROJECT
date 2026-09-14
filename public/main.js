/**
 * solo-map 프론트엔드 핵심 로직
 * 1. 카카오 로컬 실시간 API 연동 & 현실 반영 혼밥 난이도(Lv.1~Lv.5) 계산
 * 2. 🎲 "오늘 뭐 먹지?" 랜덤 혼밥 추천 룰렛
 * 3. ❤️ "내가 찜한 식당" 즐겨찾기 (localStorage)
 * 4. 💬 실제 혼밥 리뷰 작성 & 실시간 누적/평균 평점 계산 (localStorage)
 * 5. 🗺️ 카드 목록 ↔ Leaflet 인터랙티브 지도 뷰 토글
 */

// 음식 카테고리별 고품질 썸네일 이미지 매핑 (Unsplash Curated & 100% 정상 로드 검증)
// 카테고리 & 세부 메뉴별 3D 감성 이모지 및 테마 컬러 매핑 (모던 클린 카드 UI)
function getCategoryEmoji(category = '', name = '') {
  const t = `${category} ${name}`.toLowerCase();

  // 1. 뷔페 / 패밀리레스토랑 / 애슐리
  if (t.includes('뷔페') || t.includes('패밀리레스토랑') || t.includes('애슐리') || t.includes('샐러드바')) {
    return { icon: '🍽️', bg: '#f3e8ff', color: '#7e22ce' };
  }

  // 2. 찜닭 / 닭요리 / 치킨
  if (t.includes('찜닭') || t.includes('두찜') || t.includes('동궁') || t.includes('닭요리') || t.includes('닭볶음') || t.includes('치킨')) {
    return { icon: '🍗', bg: '#ffedd5', color: '#c2410c' };
  }

  // 3. 보쌈 / 족발
  if (t.includes('보쌈') || t.includes('족발')) {
    return { icon: '🥓', bg: '#fef2f2', color: '#b91c1c' };
  }

  // 4. 두루치기 / 불고기 / 제육볶음 / 쌈밥
  if (t.includes('두루치기') || t.includes('불고기') || t.includes('제육') || t.includes('주물럭') || t.includes('쌈밥')) {
    return { icon: '🍳', bg: '#fff1eb', color: '#ea580c' };
  }

  // 5. 곱창 / 막창 / 대창구이
  if (t.includes('곱창') || t.includes('막창') || t.includes('대창')) {
    return { icon: '🔥', bg: '#fee2e2', color: '#dc2626' };
  }

  // 6. 삼겹살 / 고깃집 / 구이 / 갈비
  if (t.includes('삼겹살') || t.includes('갈비') || t.includes('고깃집') || t.includes('구이') || t.includes('고기') || t.includes('정육')) {
    return { icon: '🥩', bg: '#fee2e2', color: '#b91c1c' };
  }

  // 7. 국밥 / 순대국 / 설렁탕 / 곰탕 / 해장국 / 뚝배기
  if (t.includes('국밥') || t.includes('순대') || t.includes('설렁탕') || t.includes('곰탕') || t.includes('해장국') || t.includes('추어탕') || t.includes('도가니')) {
    return { icon: '🍲', bg: '#fff7ed', color: '#ea580c' };
  }

  // 8. 찌개 / 전골 / 김치찌개 / 된장찌개 / 순두부 / 감자탕
  if (t.includes('찌개') || t.includes('부대') || t.includes('순두부') || t.includes('감자탕') || t.includes('전골')) {
    return { icon: '🥘', bg: '#fff1eb', color: '#ea580c' };
  }

  // 9. 떡볶이 / 즉석떡볶이 / 엽떡 / 두끼 / 신전
  if (t.includes('떡볶이') || t.includes('엽떡') || t.includes('청년다방') || t.includes('두끼') || t.includes('신전') || t.includes('즉석떡')) {
    return { icon: '🍢', bg: '#ffe4e6', color: '#e11d48' };
  }

  // 10. 돈까스 / 일식 카레
  if (t.includes('돈까스') || t.includes('돈가츠') || t.includes('가츠') || t.includes('카레')) {
    return { icon: '🍛', bg: '#fefce8', color: '#ca8a04' };
  }

  // 11. 초밥 / 스시 / 횟집 / 참치
  if (t.includes('초밥') || t.includes('스시') || t.includes('횟집') || t.includes('회') || t.includes('참치')) {
    return { icon: '🍣', bg: '#ecfeff', color: '#0891b2' };
  }

  // 12. 라멘 / 우동 / 소바 / 칼국수 / 냉면 / 국수
  if (t.includes('라멘') || t.includes('라면') || t.includes('우동') || t.includes('소바') || t.includes('국수') || t.includes('칼국수') || t.includes('냉면')) {
    return { icon: '🍜', bg: '#fef3c7', color: '#d97706' };
  }

  // 13. 중식 / 마라탕 / 짬뽕 / 짜장 / 탕수육
  if (t.includes('중식') || t.includes('마라') || t.includes('짬뽕') || t.includes('짜장') || t.includes('탕수육') || t.includes('양꼬치')) {
    return { icon: '🥢', bg: '#fef2f2', color: '#e11d48' };
  }

  // 14. 햄버거 / 패스트푸드
  if (t.includes('버거') || t.includes('패스트푸드') || t.includes('맥도날드') || t.includes('롯데리아') || t.includes('버거킹') || t.includes('맘스터치') || t.includes('kfc')) {
    return { icon: '🍔', bg: '#fef2f2', color: '#dc2626' };
  }

  // 15. 토스트 / 김밥 / 샌드위치 / 도시락 / 한솥 / 만두
  if (t.includes('토스트') || t.includes('이삭') || t.includes('김밥') || t.includes('도시락') || t.includes('한솥') || t.includes('샌드위치') || t.includes('서브웨이') || t.includes('컵밥') || t.includes('만두') || t.includes('분식')) {
    return { icon: '🥪', bg: '#fef9c3', color: '#ca8a04' };
  }

  // 16. 피자
  if (t.includes('피자')) {
    return { icon: '🍕', bg: '#fff7ed', color: '#ea580c' };
  }

  // 17. 파스타 / 양식 / 스테이크
  if (t.includes('파스타') || t.includes('양식') || t.includes('스파게티') || t.includes('스테이크')) {
    return { icon: '🍝', bg: '#faf5ff', color: '#9333ea' };
  }

  // 18. 샐러드 / 포케
  if (t.includes('샐러드') || t.includes('포케')) {
    return { icon: '🥗', bg: '#ecfdf5', color: '#059669' };
  }

  // 19. 카페 / 디저트 / 베이커리
  if (t.includes('카페') || t.includes('디저트') || t.includes('베이커리') || t.includes('커피')) {
    return { icon: '☕', bg: '#f5f3ff', color: '#6d28d9' };
  }

  // 20. 술집 / 주점 / 호프 / 포차
  if (t.includes('술집') || t.includes('주점') || t.includes('호프') || t.includes('포차') || t.includes('이자카야')) {
    return { icon: '🍺', bg: '#fef9c3', color: '#854d0e' };
  }

  // 21. 한식 / 백반 / 밥집 / 가정식 (부안식당 등)
  if (t.includes('한식') || t.includes('백반') || t.includes('식당') || t.includes('가정식') || t.includes('밥')) {
    return { icon: '🍱', bg: '#f0fdf4', color: '#16a34a' };
  }

  return { icon: '🍴', bg: '#f1f5f9', color: '#475569' };
}

// 현실 식당 및 메뉴 특성을 정밀 반영한 대중적 혼밥 난이도 5단계 알고리즘
function evaluateSoloIndex(category = '', name = '') {
  const text = `${category} ${name}`.toLowerCase();

  // Lv.5 혼밥 끝판왕 (불판 구이, 최소 2인 주문 필수, 시끌벅적 회식/술자리 분위기)
  if (
    text.includes('삼겹살') || text.includes('갈비') || text.includes('고깃집') ||
    text.includes('구이') || text.includes('곱창') || text.includes('막창') ||
    text.includes('대창') || text.includes('닭갈비') || text.includes('조개구이') ||
    text.includes('횟집') || text.includes('회센터') || text.includes('참치') ||
    text.includes('주점') || text.includes('술집') || text.includes('호프') ||
    text.includes('포차') || text.includes('이자카야') || text.includes('족발') ||
    text.includes('보쌈') || text.includes('정육식당')
  ) {
    return {
      lv: 5,
      label: 'Lv.5 혼밥 끝판왕',
      pillClass: 'lv-5',
      psychology: '불판 구이 & 술자리 회식 분위기 · 최고난도 혼밥 도전',
      tags: ['#최소2인주문', '#불판구이', '#술자리회식분위기', '#혼밥끝판왕', '#최고난도도전'],
    };
  }

  // Lv.4 다인석 식당 (떡볶이 냄비/대형세트, 샤브샤브, 파스타, 패밀리, 단체 냄비 요리)
  if (
    text.includes('떡볶이') || text.includes('엽기떡볶이') || text.includes('엽떡') ||
    text.includes('청년다방') || text.includes('두끼') || text.includes('신전') ||
    text.includes('샤브') || text.includes('뷔페') || text.includes('패밀리레스토랑') ||
    text.includes('피자') || text.includes('파스타') || text.includes('감자탕') ||
    text.includes('찜닭') || text.includes('닭볶음탕') || text.includes('부대찌개') ||
    text.includes('전골') || text.includes('아시안') || text.includes('스테이크')
  ) {
    return {
      lv: 4,
      label: 'Lv.4 다인석 식당',
      pillClass: 'lv-4',
      psychology: '2인 이상 냄비 or 데이트·모임 위주 · 혼밥 도전 코스',
      tags: ['#2인이상냄비', '#떡볶이전문점', '#데이트손님위주', '#혼밥도전코스', '#포장추천'],
    };
  }

  // Lv.1 입문 혼밥 (키오스크 주문, 1인석 대다수, 혼밥러 비율 압도적, 시선 신경 0%)
  if (
    text.includes('패스트푸드') || text.includes('햄버거') || text.includes('버거') ||
    text.includes('맥도날드') || text.includes('롯데리아') || text.includes('버거킹') ||
    text.includes('맘스터치') || text.includes('서브웨이') || text.includes('샌드위치') ||
    text.includes('토스트') || text.includes('이삭') || text.includes('김밥') ||
    text.includes('김밥천국') || text.includes('도시락') || text.includes('한솥') ||
    text.includes('컵밥') || text.includes('편의점') || text.includes('학식') ||
    text.includes('만두') || text.includes('베이커리') || text.includes('카페') ||
    text.includes('바비든든')
  ) {
    return {
      lv: 1,
      label: 'Lv.1 입문 혼밥',
      pillClass: 'lv-1',
      psychology: '혼자 먹는 게 당연한 곳 · 키오스크 선불 & 시선 신경 0%',
      tags: ['#키오스크선불', '#1인석기본', '#시선신경0%', '#초스피드식사', '#혼밥입문'],
    };
  }

  // Lv.2 혼밥 성지 (국밥, 라멘, 1인 바 테이블 구비로 눈치 전혀 안 보는 곳)
  if (
    text.includes('국밥') || text.includes('순대국') || text.includes('순댓국') ||
    text.includes('돼지국밥') || text.includes('설렁탕') || text.includes('곰탕') ||
    text.includes('해장국') || text.includes('추어탕') || text.includes('도가니') ||
    text.includes('라멘') || text.includes('일식') || text.includes('우동') ||
    text.includes('소바') || text.includes('1인샤브') || text.includes('카레') ||
    text.includes('회전초밥') || text.includes('초밥') || text.includes('샐러드') ||
    text.includes('포케')
  ) {
    return {
      lv: 2,
      label: 'Lv.2 혼밥 성지',
      pillClass: 'lv-2',
      psychology: '한국인 공인 1등 혼밥 성지 & 1인 뚝배기/바 테이블 대환영',
      tags: ['#국밥부장관', '#1인뚝배기', '#바테이블완비', '#사장님환영', '#혼밥성지'],
    };
  }

  // Lv.3 일반 밥집 (백반, 찌개, 중국집, 돈까스 등 평범한 2인석 착석 식사)
  return {
    lv: 3,
    label: 'Lv.3 일반 밥집',
    pillClass: 'lv-3',
    psychology: '평범하고 든든한 식사 · 단 점심 피크시간(12시)엔 살짝 눈치',
    tags: ['#든든한한끼', '#2인테이블착석', '#피크시간눈치살짝', '#가정식백반', '#학생단골밥집'],
  };
}

// 도보 시간 환산 (분당 약 65m 기준)
function formatDistanceWalking(distanceMeter) {
  if (!distanceMeter) return '명지대 근처';
  const m = Number(distanceMeter);
  if (isNaN(m)) return '명지대 근처';
  const min = Math.max(1, Math.round(m / 65));
  return `도보 ${min}분 · ${m}m`;
}

/* ===================================================
   로컬 스토리지 (찜 목록 & 리뷰 데이터 관리)
   =================================================== */
const STORAGE_KEYS = {
  FAVORITES: 'solo_map_favorites_v1',
  REVIEWS: 'solo_map_reviews_v1',
};

function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleFavorite(placeId) {
  let favs = getFavorites();
  const exists = favs.includes(placeId);
  if (exists) {
    favs = favs.filter((id) => id !== placeId);
  } else {
    favs.push(placeId);
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  updateFavBadge();
  return !exists;
}

function isPlaceFavorite(placeId) {
  const favs = getFavorites();
  return favs.includes(placeId);
}

function updateFavBadge() {
  const count = getFavorites().length;
  const badge = document.getElementById('fav-badge-count');
  if (badge) badge.textContent = count;
}

function getAllReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getPlaceReviews(placeId) {
  const all = getAllReviews();
  return all[placeId] || [];
}

function savePlaceReview(placeId, placeName, level, text) {
  const all = getAllReviews();
  if (!all[placeId]) all[placeId] = [];
  const newReview = {
    id: Date.now().toString(),
    placeName,
    level: Number(level),
    text: text.trim(),
    createdAt: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  };
  all[placeId].unshift(newReview);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(all));
  return newReview;
}

// 사용자 리뷰가 있을 경우 가중 평균 난이도 계산
function getDynamicSoloIndex(place) {
  const base = evaluateSoloIndex(place.category_name, place.place_name);
  const reviews = getPlaceReviews(place.id);
  if (reviews.length === 0) return base;

  const sum = reviews.reduce((acc, r) => acc + r.level, 0);
  const avg = Math.round(sum / reviews.length);
  const clampLv = Math.min(5, Math.max(1, avg));

  const levelLabels = {
    1: 'Lv.1 입문 혼밥',
    2: 'Lv.2 혼밥 성지',
    3: 'Lv.3 일반 밥집',
    4: 'Lv.4 다인석 식당',
    5: 'Lv.5 혼밥 끝판왕',
  };

  return {
    lv: clampLv,
    label: `${levelLabels[clampLv]} (학우평가)`,
    pillClass: `lv-${clampLv}`,
    tags: base.tags,
    userReviewCount: reviews.length,
  };
}

/* ===================================================
   전역 상태 변수 & DOM 요소 바인딩
   =================================================== */
let currentPlaces = [];
let currentFilter = 'all';
let currentViewMode = 'list'; // 'list' | 'map'
let targetReviewPlace = null;
let leafletMap = null;
let mapMarkers = [];

// DOM 요소
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const placesContainer = document.getElementById('places-container');
const mapViewContainer = document.getElementById('map-view-container');
const catalogTitle = document.getElementById('catalog-title');
const catalogCount = document.getElementById('catalog-count');
const kwChips = document.querySelectorAll('.kw-chip');
const filterTabs = document.querySelectorAll('.tab-btn');
const btnViewList = document.getElementById('btn-view-list');
const btnViewMap = document.getElementById('btn-view-map');

// 룰렛 관련 요소
const btnRandomRoulette = document.getElementById('btn-random-roulette');
const rouletteModal = document.getElementById('roulette-modal');
const rouletteClose = document.getElementById('roulette-close');
const rouletteCardSlot = document.getElementById('roulette-card-slot');
const btnRouletteAgain = document.getElementById('btn-roulette-again');
const btnRouletteGo = document.getElementById('btn-roulette-go');
let currentWinningPlace = null;
let rouletteInterval = null;

// 리뷰 모달 요소
const reviewModal = document.getElementById('review-modal');
const modalClose = document.getElementById('modal-close');
const modalPlaceName = document.getElementById('modal-place-name');
const modalPlaceAddress = document.getElementById('modal-place-address');
const btnSubmitReview = document.getElementById('btn-submit-review');
const levelOptions = document.querySelectorAll('.level-opt');
let selectedReviewLevel = 1;

// 토스트 메시지
const toastMessage = document.getElementById('toast-message');
const toastText = document.getElementById('toast-text');
let toastTimer = null;

function showToast(message) {
  if (!toastMessage) return;
  toastText.textContent = message;
  toastMessage.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.classList.add('hidden');
  }, 2600);
}

/* ===================================================
   식당 검색 API 호출 및 렌더링
   =================================================== */
async function loadPlaces(keyword) {
  placesContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 70px 0; color: #64748b;">
      <p style="font-size: 32px; margin-bottom: 12px; animation: pulse 1s infinite;">🔍</p>
      <p style="font-size: 16px; font-weight: 700; color: #0f172a;">명지대 인문캠퍼스 반경 1.5km 내 식당 탐색 중...</p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">카카오 로컬 실시간 API 연동</p>
    </div>
  `;
  catalogTitle.textContent = `"${keyword}" 검색 결과`;
  catalogCount.textContent = '검색 중...';

  try {
    const res = await fetch(`/api/places/search?query=${encodeURIComponent(keyword)}&size=15`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || '식당 정보를 불러오지 못했습니다.');
    }

    currentPlaces = data.places || [];
    renderFilteredPlaces();
    updateMapMarkers();
  } catch (err) {
    console.error(err);
    placesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; color: #dc2626;">
        <p style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">식당 정보를 가져올 수 없습니다</p>
        <p style="font-size: 14px; color: #991b1b;">${err.message}</p>
      </div>
    `;
    catalogCount.textContent = '0곳';
  }
}

// 필터링 계산
function getFilteredList() {
  if (currentFilter === 'fav') {
    const favs = getFavorites();
    return currentPlaces.filter((p) => favs.includes(p.id));
  }
  if (currentFilter === 'all') {
    return currentPlaces;
  }
  const targetLv = Number(currentFilter);
  return currentPlaces.filter((p) => {
    const info = getDynamicSoloIndex(p);
    return info.lv === targetLv;
  });
}

function renderFilteredPlaces() {
  const filtered = getFilteredList();
  catalogCount.textContent = `${filtered.length}곳`;

  if (filtered.length === 0) {
    const emptyMsg = currentFilter === 'fav'
      ? '아직 찜한 식당이 없습니다! 식당 카드의 하트(❤️) 버튼을 눌러 나만의 혼밥 리스트를 만들어보세요.'
      : '해당 조건의 식당이 없습니다. 상단 필터를 변경하거나 다른 메뉴를 검색해 보세요.';

    placesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 20px;">
        <p style="font-size: 36px; margin-bottom: 12px;">🍚</p>
        <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
          ${currentFilter === 'fav' ? '찜한 식당이 비어있습니다' : '일치하는 식당이 없습니다'}
        </h4>
        <p style="font-size: 13.5px; color: #64748b; word-break: keep-all; max-width: 420px; margin: 0 auto;">
          ${emptyMsg}
        </p>
      </div>
    `;
    return;
  }

  placesContainer.innerHTML = filtered.map((place) => createCardHtml(place)).join('');
}

// 개별 식당 카드 HTML 생성 (토스/당근마켓 스타일 모던 클린 카드 UI)
function createCardHtml(place) {
  const soloInfo = getDynamicSoloIndex(place);
  const catIcon = getCategoryEmoji(place.category_name, place.place_name);
  const walkText = formatDistanceWalking(place.distance);
  const cleanAddr = place.road_address_name || place.address_name || '주소 정보 없음';
  const cleanPhone = place.phone || '전화번호 미등록';
  const isFav = isPlaceFavorite(place.id);
  const reviews = getPlaceReviews(place.id);

  // 카카오맵 및 네이버 지도 링크 (양대 플랫폼 듀얼 연동)
  const kakaoUrl = place.place_url || `https://map.kakao.com/link/search/${encodeURIComponent(place.place_name)}`;
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(place.place_name + ' 명지대')}`;

  const reviewPreviewHtml = reviews.length > 0
    ? `
      <div class="card-review-box">
        <div class="review-box-header">
          <span class="review-box-tag">💬 학우 실시간 팁</span>
          <span class="review-box-count">${reviews.length}개 리뷰</span>
        </div>
        <p class="review-box-text">"${escapeHtml(reviews[0].text)}"</p>
      </div>
    `
    : `
      <div class="card-review-box">
        <div class="review-box-header">
          <span class="review-box-tag">💬 혼밥 팁</span>
          <span class="review-box-count">첫 리뷰를 남겨보세요!</span>
        </div>
        <p class="review-box-empty">아직 등록된 후기가 없습니다. 직접 혼밥 팁을 남겨보세요!</p>
      </div>
    `;

  return `
    <article class="place-card-item clean-card" id="place-card-${place.id}">
      <!-- 카드 헤더 영역 (3D 카테고리 아이콘 + 타이틀 + 찜 버튼) -->
      <div class="card-header-row">
        <div class="card-icon-badge" style="background: ${catIcon.bg}; color: ${catIcon.color};" title="${escapeHtml(place.category_name || '식당')}">
          <span class="icon-emoji">${catIcon.icon}</span>
        </div>
        <div class="card-title-group">
          <div class="card-cat-line">
            <span class="place-category">${escapeHtml(place.category_name || '일반음식점')}</span>
            <span class="distance-pill">${walkText}</span>
          </div>
          <h3 class="place-title">${escapeHtml(place.place_name)}</h3>
        </div>
        <button 
          type="button" 
          class="btn-heart-fav ${isFav ? 'active' : ''}" 
          title="찜하기"
          onclick="handleToggleFav('${place.id}', event)"
        >
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>

      <!-- 혼밥 난이도 배너 및 심리 안내 -->
      <div class="card-solo-banner ${soloInfo.pillClass}">
        <div class="solo-badge-chip">${soloInfo.label}</div>
        <div class="solo-psychology-text">${soloInfo.psychology}</div>
      </div>

      <!-- 혼밥 특징 태그 -->
      <div class="solo-tags">
        ${soloInfo.tags.map((t) => `<span class="solo-tag">${t}</span>`).join('')}
      </div>

      <!-- 실시간 학우 혼밥 팁 박스 -->
      ${reviewPreviewHtml}

      <!-- 주소 및 연락처 정보 -->
      <ul class="place-meta-list">
        <li>
          <span class="meta-icon">📍</span>
          <span>${escapeHtml(cleanAddr)}</span>
        </li>
        <li>
          <span class="meta-icon">📞</span>
          <span>${escapeHtml(cleanPhone)}</span>
        </li>
      </ul>

      <!-- 하단 액션 버튼 (카카오맵 + 네이버 지도 듀얼 연동 & 리뷰 작성) -->
      <div class="card-footer-actions dual-map-actions">
        <div class="map-links-group">
          <a href="${escapeHtml(kakaoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-map-link kakao" title="카카오맵에서 위치 및 길찾기 보기">
            <span>🟡</span> 카카오맵
          </a>
          <a href="${escapeHtml(naverUrl)}" target="_blank" rel="noopener noreferrer" class="btn-map-link naver" title="네이버 지도에서 방문자 영수증 리뷰 및 메뉴 사진 보기">
            <span>🟢</span> 네이버 지도
          </a>
        </div>
        <button type="button" class="btn-open-review" onclick="openReviewModalById('${place.id}')">
          ✏️ 리뷰 작성
        </button>
      </div>
    </article>
  `;
}

// 찜 토글 이벤트
window.handleToggleFav = function (placeId, event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const isNowFav = toggleFavorite(placeId);

  btn.classList.toggle('active', isNowFav);
  btn.innerHTML = isNowFav ? '❤️' : '🤍';
  btn.classList.add('anim-pop');
  setTimeout(() => btn.classList.remove('anim-pop'), 400);

  showToast(isNowFav ? '내 찜 목록에 추가되었습니다! ❤️' : '찜 목록에서 제외되었습니다.');

  if (currentFilter === 'fav') {
    renderFilteredPlaces();
  }
};

/* ===================================================
   🎲 기능 1: "오늘 뭐 먹지?" 랜덤 추천 룰렛
   =================================================== */
btnRandomRoulette.addEventListener('click', () => {
  openRouletteModal();
});

rouletteClose.addEventListener('click', () => {
  closeRouletteModal();
});

rouletteModal.addEventListener('click', (e) => {
  if (e.target === rouletteModal) closeRouletteModal();
});

btnRouletteAgain.addEventListener('click', () => {
  spinRoulette();
});

btnRouletteGo.addEventListener('click', () => {
  if (!currentWinningPlace) return;
  closeRouletteModal();

  // 목록 뷰로 전환 후 해당 카드로 부드럽게 스크롤
  switchViewMode('list');

  setTimeout(() => {
    const card = document.getElementById(`place-card-${currentWinningPlace.id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
      card.style.boxShadow = '0 0 0 4px #ff5226, 0 16px 36px rgba(255, 82, 38, 0.35)';
      card.style.transform = 'scale(1.02)';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
      }, 2500);
    }
  }, 300);
});

function openRouletteModal() {
  rouletteModal.classList.remove('hidden');
  spinRoulette();
}

function closeRouletteModal() {
  clearInterval(rouletteInterval);
  rouletteModal.classList.add('hidden');
}

function spinRoulette() {
  const places = currentPlaces.length > 0 ? currentPlaces : [];
  if (places.length === 0) {
    rouletteCardSlot.innerHTML = `
      <p style="color: #64748b; font-size: 14px;">검색된 식당이 없습니다. 먼저 식당을 검색해 주세요!</p>
    `;
    return;
  }

  rouletteCardSlot.classList.remove('is-winner');
  btnRouletteAgain.disabled = true;
  btnRouletteGo.disabled = true;

  const funnyPhrases = [
    '🍜 든든한 국밥과 라멘 사이 고민 중...',
    '🍛 바삭한 돈까스냐 매콤한 마라탕이냐...',
    '🍔 빠르게 햄버거 세트 한 입?!',
    '🥘 오늘은 떡볶이에 도전해볼까...',
    '🥩 당당하게 고깃집 1인분 도전?!',
  ];

  let step = 0;
  clearInterval(rouletteInterval);

  rouletteInterval = setInterval(() => {
    const randomTemp = places[Math.floor(Math.random() * places.length)];
    const phrase = funnyPhrases[step % funnyPhrases.length];

    rouletteCardSlot.innerHTML = `
      <div class="slot-rolling-anim">
        <span class="slot-icon-dice">🎲</span>
        <p style="font-size: 18px; font-weight: 800; color: #ff5226;">${escapeHtml(randomTemp.place_name)}</p>
        <p class="slot-text-sub">${phrase}</p>
      </div>
    `;
    step++;
  }, 100);

  // 1.5초 후 당첨 발표
  setTimeout(() => {
    clearInterval(rouletteInterval);
    const winner = places[Math.floor(Math.random() * places.length)];
    currentWinningPlace = winner;

    const soloInfo = getDynamicSoloIndex(winner);
    const catIcon = getCategoryEmoji(winner.category_name, winner.place_name);
    const walk = formatDistanceWalking(winner.distance);

    rouletteCardSlot.classList.add('is-winner');
    rouletteCardSlot.innerHTML = `
      <div class="roulette-winner-card clean-winner">
        <div class="winner-icon-wrap" style="background: ${catIcon.bg}; color: ${catIcon.color};">
          <span class="winner-emoji">${catIcon.icon}</span>
        </div>
        <div class="winner-badges">
          <span class="difficulty-pill index-level ${soloInfo.pillClass}">${soloInfo.label}</span>
          <span class="distance-pill">${walk}</span>
        </div>
        <h4 class="winner-title">${escapeHtml(winner.place_name)}</h4>
        <span class="winner-category">${escapeHtml(winner.category_name || '식당')}</span>
        <p class="winner-psychology">${soloInfo.psychology}</p>
        <p class="winner-meta">📍 ${escapeHtml(winner.road_address_name || winner.address_name || '명지대 근처')}</p>
      </div>
    `;

    btnRouletteAgain.disabled = false;
    btnRouletteGo.disabled = false;
  }, 1500);
}

/* ===================================================
   💬 기능 3: 실제 혼밥 리뷰 모달 및 저장
   =================================================== */
window.openReviewModalById = function (placeId) {
  const place = currentPlaces.find((p) => p.id === placeId);
  if (!place) return;
  targetReviewPlace = place;

  modalPlaceName.textContent = place.place_name;
  modalPlaceAddress.textContent = `📍 ${place.road_address_name || place.address_name || '명지대 주변'}`;
  document.getElementById('review-textarea').value = '';

  selectedReviewLevel = 1;
  levelOptions.forEach((b) => b.classList.remove('active'));
  if (levelOptions[0]) levelOptions[0].classList.add('active');

  reviewModal.classList.remove('hidden');
};

modalClose.addEventListener('click', () => {
  reviewModal.classList.add('hidden');
});

reviewModal.addEventListener('click', (e) => {
  if (e.target === reviewModal) reviewModal.classList.add('hidden');
});

levelOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    levelOptions.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedReviewLevel = Number(btn.dataset.level);
  });
});

btnSubmitReview.addEventListener('click', () => {
  if (!targetReviewPlace) return;

  const content = document.getElementById('review-textarea').value.trim();
  if (!content) {
    alert('혼밥러들을 위해 한 줄 후기나 팁을 간단히 작성해 주세요!');
    document.getElementById('review-textarea').focus();
    return;
  }

  savePlaceReview(targetReviewPlace.id, targetReviewPlace.place_name, selectedReviewLevel, content);

  reviewModal.classList.add('hidden');
  renderFilteredPlaces();
  updateMapMarkers();
  showToast('소중한 혼밥 리뷰가 등록되었습니다! ✨');
});

/* ===================================================
   🗺️ 기능 4: Leaflet 인터랙티브 지도 연동
   =================================================== */
const MYONGJI_COORDS = { lat: 37.5802, lng: 126.9234 }; // 명지대학교 인문캠퍼스
let mjuMarker = null;

function initLeafletMap() {
  if (leafletMap) return;

  const mapElem = document.getElementById('leaflet-map');
  if (!mapElem) return;

  // Leaflet 지도 생성 (명지대 중심, 마우스 휠 줌 감도 완화 및 중심점 줌 고정)
  leafletMap = L.map('leaflet-map', {
    center: [MYONGJI_COORDS.lat, MYONGJI_COORDS.lng],
    zoom: 16,
    minZoom: 13.5,
    maxZoom: 18.5,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    scrollWheelZoom: 'center', // 🎯 마우스 커서 위치로 튀지 않고 뷰포트 중심 기준으로 안정적 줌
    wheelPxPerZoomLevel: 140,  // 🖱️ 휠 민감도 완화 (기본값 60 -> 140으로 둔화)
    wheelDebounceTime: 60,     // 휠 연속 이벤트 디바운스
    doubleClickZoom: 'center',
    maxBounds: [
      [37.540, 126.870],
      [37.620, 126.970],
    ],
    maxBoundsViscosity: 0.75,
    zoomControl: true,
  });

  // 고해상도 & 모던 파스텔 타일 (CartoDB Voyager: 국내외 최고 수준의 화사하고 세련된 벡터형 타일)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(leafletMap);

  // 명지대학교 인문캠퍼스 대표 마커
  const mjuIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div class="pin-bubble mju-pin"><span>🏛️</span></div>',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  mjuMarker = L.marker([MYONGJI_COORDS.lat, MYONGJI_COORDS.lng], { icon: mjuIcon })
    .addTo(leafletMap)
    .bindPopup(`
      <div style="padding: 10px 12px; font-family: 'Pretendard', sans-serif;">
        <h4 style="font-size: 14px; font-weight: 800; color: #002c5f; margin-bottom: 2px;">🏛️ 명지대학교 인문캠퍼스</h4>
        <p style="font-size: 11.5px; color: #64748b;">서울 서대문구 거북골로 34</p>
      </div>
    `);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (currentMapEngine === 'naver' && naverMap) {
    updateNaverMapMarkers();
  }
  if (!leafletMap) return;

  // 기존 식당 마커 정리
  mapMarkers.forEach((m) => leafletMap.removeLayer(m));
  mapMarkers = [];

  const filtered = getFilteredList();

  filtered.forEach((place) => {
    if (!place.y || !place.x) return;
    const lat = Number(place.y);
    const lng = Number(place.x);
    if (isNaN(lat) || isNaN(lng)) return;

    const soloInfo = getDynamicSoloIndex(place);
    const catIcon = getCategoryEmoji(place.category_name, place.place_name);
    const walk = formatDistanceWalking(place.distance);
    const kakaoUrl = place.place_url || `https://map.kakao.com/link/search/${encodeURIComponent(place.place_name)}`;
    const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(place.place_name + ' 명지대')}`;

    const pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="pin-bubble ${soloInfo.pillClass}"><span>${soloInfo.lv}</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const popupHtml = `
      <div class="map-popup-card clean-popup">
        <div class="popup-header-row">
          <div class="popup-icon-badge" style="background: ${catIcon.bg}; color: ${catIcon.color};">
            <span>${catIcon.icon}</span>
          </div>
          <div class="popup-title-box">
            <h4 class="popup-title">${escapeHtml(place.place_name)}</h4>
            <div class="popup-badges-row">
              <span class="difficulty-pill index-level ${soloInfo.pillClass}">${soloInfo.label}</span>
              <span class="distance-pill">${walk}</span>
            </div>
          </div>
        </div>
        <div class="popup-body">
          <p class="popup-psychology">${soloInfo.psychology}</p>
          <p class="popup-meta">📍 ${escapeHtml(place.road_address_name || place.address_name || '주소 정보 없음')}</p>
          <div class="popup-footer-actions">
            <a href="${escapeHtml(kakaoUrl)}" target="_blank" rel="noopener noreferrer" class="popup-btn kakao" title="카카오맵 길찾기">
              🟡 카카오맵
            </a>
            <a href="${escapeHtml(naverUrl)}" target="_blank" rel="noopener noreferrer" class="popup-btn naver" title="네이버 지도 리뷰">
              🟢 네이버 지도
            </a>
            <button type="button" class="popup-btn secondary" onclick="openReviewModalById('${place.id}')">
              ✏️ 리뷰 작성
            </button>
          </div>
        </div>
      </div>
    `;

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(leafletMap).bindPopup(popupHtml);
    mapMarkers.push(marker);
  });
}

function fitMapBounds() {
  if (!leafletMap) return;
  const points = [[MYONGJI_COORDS.lat, MYONGJI_COORDS.lng]];
  mapMarkers.forEach((m) => {
    points.push([m.getLatLng().lat, m.getLatLng().lng]);
  });
  if (points.length > 1) {
    leafletMap.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
  } else {
    leafletMap.setView([MYONGJI_COORDS.lat, MYONGJI_COORDS.lng], 16);
  }
}

/* ===================================================
   🗺️ 기능 4-B: 네이버 지도 API v3 연동 & 하이브리드 전환
   =================================================== */
let naverMap = null;
let naverMarkers = [];
let naverInfoWindows = [];
let currentMapEngine = 'leaflet'; // 'leaflet' | 'naver'
let naverClientId = localStorage.getItem('solo_map_naver_client_id') || '';

// 서버 환경변수(NAVER_CLIENT_ID) 확인 및 자동 네이버 지도 모드 활성화
fetch('/api/config')
  .then((res) => res.json())
  .then(async (cfg) => {
    if (cfg && cfg.naverClientId) {
      naverClientId = cfg.naverClientId;
      localStorage.setItem('solo_map_naver_client_id', cfg.naverClientId);
    }
    if (naverClientId) {
      const ok = await loadNaverMapSdk(naverClientId);
      if (ok) {
        currentMapEngine = 'naver';
        const toggleBtn = document.getElementById('btn-toggle-naver-map');
        if (toggleBtn) {
          toggleBtn.classList.add('active');
          toggleBtn.innerHTML = '🌐 기본 지도로 전환';
        }
      }
    }
  })
  .catch(() => {});

function loadNaverMapSdk(clientId) {
  if (window.naver && window.naver.maps) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.getElementById('naver-maps-sdk-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'naver-maps-sdk-script';
    script.type = 'text/javascript';
    // ncpClientId와 ncpKeyId 둘 다 호환되도록 전달
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&ncpClientId=${encodeURIComponent(clientId)}`;
    script.onload = () => {
      console.log('🟢 네이버 지도 v3 SDK 로드 성공!');
      resolve(true);
    };
    script.onerror = () => {
      console.warn('네이버 지도 SDK 로드 실패 (Client ID 또는 도메인 등록을 확인하세요)');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

function initNaverMap() {
  if (!window.naver || !window.naver.maps) return false;

  const canvasElem = document.getElementById('naver-map-canvas');
  if (!canvasElem) return false;

  if (!naverMap) {
    naverMap = new naver.maps.Map('naver-map-canvas', {
      center: new naver.maps.LatLng(MYONGJI_COORDS.lat, MYONGJI_COORDS.lng),
      zoom: 16,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_LEFT,
      },
    });

    // 명지대학교 인문캠퍼스 마커
    new naver.maps.Marker({
      position: new naver.maps.LatLng(MYONGJI_COORDS.lat, MYONGJI_COORDS.lng),
      map: naverMap,
      icon: {
        content: '<div class="pin-bubble mju-pin"><span>🏛️</span></div>',
        size: new naver.maps.Size(38, 38),
        anchor: new naver.maps.Point(19, 38),
      },
    });
  }

  updateNaverMapMarkers();
  return true;
}

function updateNaverMapMarkers() {
  if (!naverMap || !window.naver || !window.naver.maps) return;

  // 기존 마커 및 인포윈도우 제거
  naverMarkers.forEach((m) => m.setMap(null));
  naverMarkers = [];
  naverInfoWindows.forEach((w) => w.close());
  naverInfoWindows = [];

  const filtered = getFilteredList();

  filtered.forEach((place) => {
    if (!place.y || !place.x) return;
    const lat = Number(place.y);
    const lng = Number(place.x);
    if (isNaN(lat) || isNaN(lng)) return;

    const soloInfo = getDynamicSoloIndex(place);
    const catIcon = getCategoryEmoji(place.category_name, place.place_name);
    const walk = formatDistanceWalking(place.distance);
    const kakaoUrl = place.place_url || `https://map.kakao.com/link/search/${encodeURIComponent(place.place_name)}`;
    const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(place.place_name + ' 명지대')}`;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: naverMap,
      icon: {
        content: `<div class="pin-bubble ${soloInfo.pillClass}"><span>${soloInfo.lv}</span></div>`,
        size: new naver.maps.Size(32, 32),
        anchor: new naver.maps.Point(16, 32),
      },
    });

    const popupHtml = `
      <div class="map-popup-card clean-popup" style="padding: 14px;">
        <div class="popup-header-row">
          <div class="popup-icon-badge" style="background: ${catIcon.bg}; color: ${catIcon.color};">
            <span>${catIcon.icon}</span>
          </div>
          <div class="popup-title-box">
            <h4 class="popup-title">${escapeHtml(place.place_name)}</h4>
            <div class="popup-badges-row">
              <span class="difficulty-pill index-level ${soloInfo.pillClass}">${soloInfo.label}</span>
              <span class="distance-pill">${walk}</span>
            </div>
          </div>
        </div>
        <div class="popup-body" style="padding-top: 6px;">
          <p class="popup-psychology">${soloInfo.psychology}</p>
          <p class="popup-meta">📍 ${escapeHtml(place.road_address_name || place.address_name || '주소 정보 없음')}</p>
          <div class="popup-footer-actions">
            <a href="${escapeHtml(kakaoUrl)}" target="_blank" rel="noopener noreferrer" class="popup-btn kakao">
              🟡 카카오맵
            </a>
            <a href="${escapeHtml(naverUrl)}" target="_blank" rel="noopener noreferrer" class="popup-btn naver">
              🟢 네이버 지도
            </a>
            <button type="button" class="popup-btn secondary" onclick="openReviewModalById('${place.id}')">
              ✏️ 리뷰 작성
            </button>
          </div>
        </div>
      </div>
    `;

    const infoWindow = new naver.maps.InfoWindow({
      content: popupHtml,
      borderWidth: 0,
      backgroundColor: 'transparent',
      disableAnchor: true,
    });

    naver.maps.Event.addListener(marker, 'click', () => {
      naverInfoWindows.forEach((w) => w.close());
      infoWindow.open(naverMap, marker);
    });

    naverMarkers.push(marker);
    naverInfoWindows.push(infoWindow);
  });
}

function fitNaverMapBounds() {
  if (!naverMap || !window.naver || !window.naver.maps) return;
  const bounds = new naver.maps.LatLngBounds();
  bounds.extend(new naver.maps.LatLng(MYONGJI_COORDS.lat, MYONGJI_COORDS.lng));
  naverMarkers.forEach((m) => bounds.extend(m.getPosition()));
  naverMap.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
}

// 목록 보기 ↔ 지도로 보기 뷰 모드 전환
function switchViewMode(mode) {
  currentViewMode = mode;

  if (mode === 'list') {
    btnViewList.classList.add('active');
    btnViewMap.classList.remove('active');
    placesContainer.classList.remove('hidden');
    mapViewContainer.classList.add('hidden');
  } else {
    btnViewMap.classList.add('active');
    btnViewList.classList.remove('active');
    placesContainer.classList.add('hidden');
    mapViewContainer.classList.remove('hidden');

    if (currentMapEngine === 'naver' && window.naver && window.naver.maps) {
      initNaverMap();
      setTimeout(() => {
        fitNaverMapBounds();
      }, 120);
    } else {
      initLeafletMap();
      setTimeout(() => {
        if (leafletMap) {
          leafletMap.invalidateSize();
          updateMapMarkers();
          fitMapBounds();
        }
      }, 120);
    }
  }
}

btnViewList.addEventListener('click', () => switchViewMode('list'));
btnViewMap.addEventListener('click', () => switchViewMode('map'));

/* ===================================================
   검색 & 필터 이벤트 리스너
   =================================================== */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) loadPlaces(q);
});

kwChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    kwChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const q = chip.dataset.query;
    searchInput.value = q;
    loadPlaces(q);
  });
});

filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    filterTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderFilteredPlaces();
    updateMapMarkers();
  });
});

// XSS 방지 이스케이프
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[m];
  });
}

/* ===================================================
   지도 플로팅 버튼, 로고 홈 리셋, 난이도 카드 필터 연동
   =================================================== */
const btnMapCenterMju = document.getElementById('btn-map-center-mju');
if (btnMapCenterMju) {
  btnMapCenterMju.addEventListener('click', () => {
    if (currentMapEngine === 'naver' && naverMap && window.naver && window.naver.maps) {
      naverMap.morph(new naver.maps.LatLng(MYONGJI_COORDS.lat, MYONGJI_COORDS.lng), 16);
    } else if (leafletMap) {
      leafletMap.flyTo([MYONGJI_COORDS.lat, MYONGJI_COORDS.lng], 16, { duration: 0.6 });
    }
  });
}

const btnMapFitBounds = document.getElementById('btn-map-fit-bounds');
if (btnMapFitBounds) {
  btnMapFitBounds.addEventListener('click', () => {
    if (currentMapEngine === 'naver' && naverMap && window.naver && window.naver.maps) {
      fitNaverMapBounds();
    } else {
      fitMapBounds();
    }
  });
}

// 좌측 상단 로고 클릭 시 첫 화면으로 완벽 리셋
function resetToHome(e) {
  if (e) e.preventDefault();
  searchInput.value = '';
  kwChips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.query === '혼밥');
  });
  filterTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.filter === 'all');
  });
  document.querySelectorAll('.difficulty-index .index-card').forEach((c) => {
    c.classList.remove('active');
  });
  currentFilter = 'all';
  switchViewMode('list');
  loadPlaces('혼밥');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const logoHome = document.getElementById('logo-home');
if (logoHome) {
  logoHome.addEventListener('click', resetToHome);
}

// 상단 현실 반영 혼밥 난이도 카드 클릭 시 즉시 해당 레벨 필터링
document.querySelectorAll('.difficulty-index .index-card').forEach((card) => {
  card.addEventListener('click', () => {
    const level = card.dataset.level;
    if (!level) return;

    filterTabs.forEach((t) => {
      t.classList.toggle('active', t.dataset.filter === level);
    });
    document.querySelectorAll('.difficulty-index .index-card').forEach((c) => {
      c.classList.toggle('active', c === card);
    });

    currentFilter = level;
    renderFilteredPlaces();
    updateMapMarkers();

    document.querySelector('.catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ===================================================
   🟢 네이버 지도 전환 버튼 & Client ID 모달 연동
   =================================================== */
const btnToggleNaverMap = document.getElementById('btn-toggle-naver-map');
const naverConfigModal = document.getElementById('naver-config-modal');
const naverConfigClose = document.getElementById('naver-config-close');
const inputNaverClientId = document.getElementById('input-naver-client-id');
const btnSaveNaverId = document.getElementById('btn-save-naver-id');
const btnClearNaverId = document.getElementById('btn-clear-naver-id');

function activateNaverMapEngine() {
  currentMapEngine = 'naver';
  document.getElementById('leaflet-map')?.classList.add('hidden');
  document.getElementById('naver-map-canvas')?.classList.remove('hidden');
  btnToggleNaverMap?.classList.add('active');
  if (btnToggleNaverMap) btnToggleNaverMap.innerHTML = '🌐 기본 지도로 전환';

  const ok = initNaverMap();
  if (ok) {
    fitNaverMapBounds();
    showToast('🟢 네이버 순정 지도 모드로 전환되었습니다!');
  }
}

function activateLeafletMapEngine() {
  currentMapEngine = 'leaflet';
  document.getElementById('naver-map-canvas')?.classList.add('hidden');
  document.getElementById('leaflet-map')?.classList.remove('hidden');
  btnToggleNaverMap?.classList.remove('active');
  if (btnToggleNaverMap) btnToggleNaverMap.innerHTML = '🟢 네이버 지도 전환';

  if (leafletMap) {
    leafletMap.invalidateSize();
    fitMapBounds();
  }
  showToast('🌐 글로벌 모던 지도 모드로 전환되었습니다.');
}

if (btnToggleNaverMap) {
  btnToggleNaverMap.addEventListener('click', async () => {
    if (currentMapEngine === 'naver') {
      activateLeafletMapEngine();
      return;
    }

    // 네이버 모드로 전환 시도
    if (window.naver && window.naver.maps) {
      activateNaverMapEngine();
      return;
    }

    // 키가 저장되어 있으면 로드 시도
    if (naverClientId) {
      const ok = await loadNaverMapSdk(naverClientId);
      if (ok) {
        activateNaverMapEngine();
        return;
      }
    }

    // 키가 없거나 실패 시 모달 오픈
    if (inputNaverClientId) inputNaverClientId.value = naverClientId || '';
    naverConfigModal?.classList.remove('hidden');
  });
}

if (naverConfigClose) {
  naverConfigClose.addEventListener('click', () => naverConfigModal?.classList.add('hidden'));
}
naverConfigModal?.addEventListener('click', (e) => {
  if (e.target === naverConfigModal) naverConfigModal.classList.add('hidden');
});

if (btnSaveNaverId) {
  btnSaveNaverId.addEventListener('click', async () => {
    const val = inputNaverClientId?.value.trim();
    if (!val) {
      alert('네이버 클라우드 플랫폼(NCP)의 Client ID를 입력해 주세요!');
      return;
    }
    naverClientId = val;
    localStorage.setItem('solo_map_naver_client_id', val);
    naverConfigModal?.classList.add('hidden');

    showToast('네이버 지도 SDK를 불러오는 중입니다...');
    const ok = await loadNaverMapSdk(val);
    if (ok) {
      activateNaverMapEngine();
    } else {
      alert('네이버 지도 SDK를 로드하지 못했습니다.\nClient ID가 올바른지, 콘솔에서 웹 서비스 URL(http://localhost:3000)이 등록되어 있는지 확인해주세요.');
    }
  });
}

if (btnClearNaverId) {
  btnClearNaverId.addEventListener('click', () => {
    localStorage.removeItem('solo_map_naver_client_id');
    naverClientId = '';
    if (inputNaverClientId) inputNaverClientId.value = '';
    activateLeafletMapEngine();
    naverConfigModal?.classList.add('hidden');
    showToast('네이버 Client ID가 초기화되었습니다.');
  });
}

/* ===================================================
   초기화 실행
   =================================================== */
updateFavBadge();
loadPlaces('혼밥');
