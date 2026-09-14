/**
 * solo-map 프론트엔드 핵심 로직
 * 1. 카카오 로컬 실시간 API 연동 & 현실 반영 혼밥 난이도(Lv.1~Lv.5) 계산
 * 2. 🎲 "오늘 뭐 먹지?" 랜덤 혼밥 추천 룰렛
 * 3. ❤️ "내가 찜한 식당" 즐겨찾기 (localStorage)
 * 4. 💬 실제 혼밥 리뷰 작성 & 실시간 누적/평균 평점 계산 (localStorage)
 * 5. 🗺️ 카드 목록 ↔ Leaflet 인터랙티브 지도 뷰 토글
 */

// 음식 카테고리별 고품질 썸네일 이미지 매핑 (Unsplash Curated)
const FOOD_IMAGES = {
  gukbap: 'https://images.unsplash.com/photo-1583032015879-672583808a32?auto=format&fit=crop&w=600&q=80',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  cutlet: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  korean: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  tteokbokki: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80',
  meat: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
};

function getCategoryPhoto(category, name = '') {
  const target = `${category || ''} ${name || ''}`.toLowerCase();
  if (target.includes('국밥') || target.includes('순대') || target.includes('설렁탕') || target.includes('해장국')) return FOOD_IMAGES.gukbap;
  if (target.includes('라면') || target.includes('라멘') || target.includes('우동') || target.includes('소바') || target.includes('초밥')) return FOOD_IMAGES.ramen;
  if (target.includes('버거') || target.includes('패스트푸드') || target.includes('샌드위치') || target.includes('토스트')) return FOOD_IMAGES.burger;
  if (target.includes('돈까스') || target.includes('가츠') || target.includes('카레')) return FOOD_IMAGES.cutlet;
  if (target.includes('샐러드') || target.includes('포케')) return FOOD_IMAGES.salad;
  if (target.includes('떡볶이') || target.includes('엽떡') || target.includes('청년다방') || target.includes('두끼')) return FOOD_IMAGES.tteokbokki;
  if (target.includes('고기') || target.includes('삼겹살') || target.includes('갈비') || target.includes('곱창') || target.includes('막창') || target.includes('닭갈비')) return FOOD_IMAGES.meat;
  if (target.includes('중식') || target.includes('마라') || target.includes('짬뽕') || target.includes('짜장')) return FOOD_IMAGES.chinese;
  if (target.includes('피자') || target.includes('파스타') || target.includes('양식') || target.includes('스테이크')) return FOOD_IMAGES.pizza;
  if (target.includes('한식') || target.includes('찌개') || target.includes('백반')) return FOOD_IMAGES.korean;
  return FOOD_IMAGES.default;
}

// 현실 식당 및 메뉴 특성을 정밀 반영한 혼밥 난이도 알고리즘
function evaluateSoloIndex(category = '', name = '') {
  const text = `${category} ${name}`.toLowerCase();

  // Lv.5 혼밥 마스터 (최소 2인 주문 필수, 고기 굽는 불판, 시끌벅적 회식/술자리 분위기)
  if (
    text.includes('삼겹살') || text.includes('갈비') || text.includes('고깃집') ||
    text.includes('구이') || text.includes('곱창') || text.includes('막창') ||
    text.includes('대창') || text.includes('닭갈비') || text.includes('조개구이') ||
    text.includes('횟집') || text.includes('회센터') || text.includes('참치') ||
    text.includes('주점') || text.includes('술집') || text.includes('호프') ||
    text.includes('포차') || text.includes('이자카야') || text.includes('족발')
  ) {
    return {
      lv: 5,
      label: 'Lv.5 혼밥 마스터',
      pillClass: 'lv-5',
      tags: ['#최소2인주문', '#혼밥끝판왕', '#시끌벅적회식분위기', '#용자만도전'],
    };
  }

  // Lv.4 다인석 식당 (떡볶이 냄비/세트, 샤브샤브, 뷔페, 단체 모임 위주로 혼자 가기 눈치 보임)
  if (
    text.includes('떡볶이') || text.includes('엽기떡볶이') || text.includes('청년다방') ||
    text.includes('두끼') || text.includes('신전') || text.includes('샤브') ||
    text.includes('뷔페') || text.includes('패밀리레스토랑') || text.includes('피자') ||
    text.includes('파스타') || text.includes('감자탕') || text.includes('찜닭') ||
    text.includes('닭볶음탕') || text.includes('부대찌개') || text.includes('아시안')
  ) {
    return {
      lv: 4,
      label: 'Lv.4 다인석 식당',
      pillClass: 'lv-4',
      tags: ['#다인용메뉴', '#2인이상추천', '#피크타임눈치', '#포장추천'],
    };
  }

  // Lv.1 초급 혼밥 (키오스크 주문, 1인석 대다수, 혼밥러 비율 압도적)
  if (
    text.includes('패스트푸드') || text.includes('햄버거') || text.includes('버거') ||
    text.includes('맥도날드') || text.includes('롯데리아') || text.includes('버거킹') ||
    text.includes('맘스터치') || text.includes('서브웨이') || text.includes('샌드위치') ||
    text.includes('토스트') || text.includes('이삭') || text.includes('김밥') ||
    text.includes('김밥천국') || text.includes('도시락') || text.includes('한솥') ||
    text.includes('컵밥') || text.includes('편의점') || text.includes('학식') ||
    text.includes('만두') || text.includes('베이커리') || text.includes('카페')
  ) {
    return {
      lv: 1,
      label: 'Lv.1 초급 혼밥',
      pillClass: 'lv-1',
      tags: ['#키오스크선불', '#1인석완비', '#혼밥러천국', '#초스피드식사'],
    };
  }

  // Lv.2 혼밥 성지 (국밥, 라멘, 1인 바 테이블 구비로 눈치 전혀 안 보는 곳)
  if (
    text.includes('국밥') || text.includes('순대국') || text.includes('돼지국밥') ||
    text.includes('설렁탕') || text.includes('곰탕') || text.includes('해장국') ||
    text.includes('라멘') || text.includes('일식') || text.includes('우동') ||
    text.includes('소바') || text.includes('1인샤브') || text.includes('카레') ||
    text.includes('회전초밥') || text.includes('샐러드') || text.includes('포케')
  ) {
    return {
      lv: 2,
      label: 'Lv.2 혼밥 성지',
      pillClass: 'lv-2',
      tags: ['#바테이블완비', '#1인좌석구비', '#눈치전혀안봄', '#혼밥성지'],
    };
  }

  // Lv.3 일반 밥집 (백반, 찌개, 중국집, 돈까스 등 평범한 2인석 착석 식사)
  return {
    lv: 3,
    label: 'Lv.3 일반 밥집',
    pillClass: 'lv-3',
    tags: ['#2인테이블혼밥', '#피크시간합석주의', '#든든한한끼', '#학생들많음'],
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
    1: 'Lv.1 초급 혼밥',
    2: 'Lv.2 혼밥 성지',
    3: 'Lv.3 일반 밥집',
    4: 'Lv.4 다인석 식당',
    5: 'Lv.5 혼밥 마스터',
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

// 개별 식당 카드 HTML 생성
function createCardHtml(place) {
  const soloInfo = getDynamicSoloIndex(place);
  const photoUrl = getCategoryPhoto(place.category_name, place.place_name);
  const walkText = formatDistanceWalking(place.distance);
  const cleanAddr = place.road_address_name || place.address_name || '주소 정보 없음';
  const cleanPhone = place.phone || '전화번호 미등록';
  const isFav = isPlaceFavorite(place.id);
  const reviews = getPlaceReviews(place.id);

  const reviewPreviewHtml = reviews.length > 0
    ? `
      <div class="card-review-box">
        <div class="review-box-header">
          <span class="review-box-tag">💬 학우 최신 팁</span>
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
    <article class="place-card-item" id="place-card-${place.id}">
      <!-- 썸네일 영역 -->
      <div class="card-media">
        <img src="${photoUrl}" alt="${escapeHtml(place.place_name)}" loading="lazy" />
        
        <!-- 하트 찜 버튼 -->
        <button 
          type="button" 
          class="btn-heart-fav ${isFav ? 'active' : ''}" 
          title="찜하기"
          onclick="handleToggleFav('${place.id}', event)"
        >
          ${isFav ? '❤️' : '🤍'}
        </button>

        <div class="media-badges">
          <span class="difficulty-pill index-level ${soloInfo.pillClass}">
            ${soloInfo.label}
          </span>
          <span class="distance-pill">
            ${walkText}
          </span>
        </div>
      </div>

      <!-- 카드 본문 -->
      <div class="card-body">
        <span class="place-category">${escapeHtml(place.category_name || '일반음식점')}</span>
        <h3 class="place-title">${escapeHtml(place.place_name)}</h3>

        <!-- 혼밥 포인트 태그 -->
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

        <!-- 하단 액션 버튼 -->
        <div class="card-footer-actions">
          <a href="${escapeHtml(place.place_url)}" target="_blank" rel="noopener noreferrer" class="btn-map-link">
            카카오맵
          </a>
          <button type="button" class="btn-open-review" onclick="openReviewModalById('${place.id}')">
            혼밥 리뷰 작성
          </button>
        </div>
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
    const photo = getCategoryPhoto(winner.category_name, winner.place_name);
    const walk = formatDistanceWalking(winner.distance);

    rouletteCardSlot.classList.add('is-winner');
    rouletteCardSlot.innerHTML = `
      <div class="roulette-winner-card">
        <div class="winner-img-wrap">
          <img src="${photo}" alt="${escapeHtml(winner.place_name)}" />
          <div class="winner-badges">
            <span class="difficulty-pill index-level ${soloInfo.pillClass}">${soloInfo.label}</span>
            <span class="distance-pill">${walk}</span>
          </div>
        </div>
        <h4 class="winner-title">${escapeHtml(winner.place_name)}</h4>
        <span class="winner-category">${escapeHtml(winner.category_name || '식당')}</span>
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

  // Leaflet 지도 생성 (명지대 중심)
  leafletMap = L.map('leaflet-map', {
    center: [MYONGJI_COORDS.lat, MYONGJI_COORDS.lng],
    zoom: 16,
    zoomControl: true,
  });

  // 오픈소스 & 워터마크 없는 OpenStreetMap 표준 고화질 타일
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    const photo = getCategoryPhoto(place.category_name, place.place_name);
    const walk = formatDistanceWalking(place.distance);

    const pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="pin-bubble ${soloInfo.pillClass}"><span>${soloInfo.lv}</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const popupHtml = `
      <div class="map-popup-card">
        <div class="popup-img-wrap">
          <img src="${photo}" alt="${escapeHtml(place.place_name)}" />
          <div class="media-badges">
            <span class="difficulty-pill index-level ${soloInfo.pillClass}">${soloInfo.label}</span>
            <span class="distance-pill">${walk}</span>
          </div>
        </div>
        <div class="popup-body">
          <h4 class="popup-title">${escapeHtml(place.place_name)}</h4>
          <p class="popup-meta">📍 ${escapeHtml(place.road_address_name || place.address_name || '주소 정보 없음')}</p>
          <div class="popup-footer-actions">
            <a href="${escapeHtml(place.place_url)}" target="_blank" rel="noopener noreferrer" class="popup-btn primary">
              길찾기
            </a>
            <button type="button" class="popup-btn secondary" onclick="openReviewModalById('${place.id}')">
              리뷰 작성
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
   초기화 실행
   =================================================== */
updateFavBadge();
loadPlaces('혼밥');
