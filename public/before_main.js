/**
 * solo-map 프론트엔드 로직
 * 명지대 인문캠퍼스 카카오 로컬 검색 및 혼밥 난이도 UI 렌더링
 */

// 음식 카테고리별 고품질 썸네일 이미지 매핑 (Unsplash Curated)
const FOOD_IMAGES = {
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  korean: 'https://images.unsplash.com/photo-1583032015879-672583808a32?auto=format&fit=crop&w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  cutlet: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  snack: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
};

function getCategoryPhoto(category) {
  if (!category) return FOOD_IMAGES.default;
  if (category.includes('라면') || category.includes('일식') || category.includes('우동') || category.includes('초밥')) return FOOD_IMAGES.ramen;
  if (category.includes('패스트푸드') || category.includes('햄버거') || category.includes('치킨')) return FOOD_IMAGES.burger;
  if (category.includes('피자') || category.includes('양식') || category.includes('파스타')) return FOOD_IMAGES.pizza;
  if (category.includes('돈까스') || category.includes('가츠')) return FOOD_IMAGES.cutlet;
  if (category.includes('샐러드') || category.includes('샌드위치')) return FOOD_IMAGES.salad;
  if (category.includes('중식') || category.includes('마라') || category.includes('짬뽕')) return FOOD_IMAGES.chinese;
  if (category.includes('분식') || category.includes('떡볶이') || category.includes('김밥')) return FOOD_IMAGES.snack;
  if (category.includes('한식') || category.includes('찌개') || category.includes('국밥') || category.includes('백반')) return FOOD_IMAGES.korean;
  return FOOD_IMAGES.default;
}

// 식당별 혼밥 난이도 및 뱃지 정보 계산
function evaluateSoloIndex(category) {
  if (!category) return { lv: 3, label: 'Lv.3 일반 밥집', tags: ['#일반테이블', '#식사주문'] };
  
  if (category.includes('패스트푸드') || category.includes('분식') || category.includes('샐러드') || category.includes('토스트')) {
    return {
      lv: 1,
      label: 'Lv.1 초급 혼밥',
      pillClass: 'lv-1',
      tags: ['#1인석많음', '#키오스크주문', '#혼밥비율높음', '#빠른식사'],
    };
  }
  if (category.includes('일식') || category.includes('라면') || category.includes('우동') || category.includes('국수')) {
    return {
      lv: 2,
      label: 'Lv.2 바 테이블',
      pillClass: 'lv-2',
      tags: ['#바테이블완비', '#1인좌석', '#조용한분위기', '#눈치전혀안봄'],
    };
  }
  if (category.includes('한식') || category.includes('중식') || category.includes('찌개') || category.includes('돈까스') || category.includes('국밥')) {
    return {
      lv: 3,
      label: 'Lv.3 일반 밥집',
      pillClass: 'lv-3',
      tags: ['#2인석착석', '#셀프바이용', '#든든한한끼', '#직장인/학생혼밥'],
    };
  }
  if (category.includes('양식') || category.includes('패밀리레스토랑') || category.includes('뷔페') || category.includes('피자')) {
    return {
      lv: 4,
      label: 'Lv.4 다인석 위주',
      pillClass: 'lv-4',
      tags: ['#테이블넓음', '#약간의용기필요', '#피크시간피하기'],
    };
  }
  return {
    lv: 5,
    label: 'Lv.5 혼밥 마스터',
    pillClass: 'lv-5',
    tags: ['#고깃집/술집', '#혼밥끝판왕', '#당당하게2인분'],
  };
}

// 거리(m)를 도보 시간으로 환산
function formatDistanceWalking(distanceMeter) {
  if (!distanceMeter) return '인문캠 근처';
  const m = Number(distanceMeter);
  if (isNaN(m)) return '인문캠 근처';
  const min = Math.max(1, Math.round(m / 65)); // 분당 약 65m 도보 기준
  return `도보 ${min}분 · ${m}m`;
}

// 상태 변수
let currentPlaces = [];
let currentFilter = 'all';

// DOM 요소
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const placesContainer = document.getElementById('places-container');
const catalogTitle = document.getElementById('catalog-title');
const catalogCount = document.getElementById('catalog-count');
const kwChips = document.querySelectorAll('.kw-chip');
const filterTabs = document.querySelectorAll('.tab-btn');

// 모달 요소
const reviewModal = document.getElementById('review-modal');
const modalClose = document.getElementById('modal-close');
const modalPlaceName = document.getElementById('modal-place-name');
const modalPlaceAddress = document.getElementById('modal-place-address');
const btnSubmitReview = document.getElementById('btn-submit-review');
const levelOptions = document.querySelectorAll('.level-opt');
let selectedLevel = 1;

// 식당 검색 API 호출
async function loadPlaces(keyword) {
  placesContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 70px 0; color: #64748b;">
      <p style="font-size: 28px; margin-bottom: 12px; animation: pulse 1s infinite;">🔍</p>
      <p style="font-size: 16px; font-weight: 600; color: #0f172a;">명지대 인문캠퍼스 반경 1.5km 내 식당을 찾는 중입니다...</p>
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

// 필터링 및 렌더링
function renderFilteredPlaces() {
  let filtered = currentPlaces;
  if (currentFilter !== 'all') {
    const targetLv = Number(currentFilter);
    filtered = currentPlaces.filter((p) => {
      const { lv } = evaluateSoloIndex(p.category_name);
      return targetLv === 4 ? lv >= 4 : lv === targetLv;
    });
  }

  catalogCount.textContent = `${filtered.length}곳`;

  if (filtered.length === 0) {
    placesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 20px;">
        <p style="font-size: 32px; margin-bottom: 12px;">🍚</p>
        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">해당 조건의 식당이 없습니다</h4>
        <p style="font-size: 13px; color: #64748b;">상단 난이도 필터를 '전체'로 변경하거나 다른 메뉴를 검색해 보세요.</p>
      </div>
    `;
    return;
  }

  placesContainer.innerHTML = filtered.map((place) => createCardHtml(place)).join('');
}

// 카드 HTML 생성기
function createCardHtml(place) {
  const soloInfo = evaluateSoloIndex(place.category_name);
  const photoUrl = getCategoryPhoto(place.category_name);
  const walkText = formatDistanceWalking(place.distance);
  const cleanAddr = place.road_address_name || place.address_name || '주소 정보 없음';
  const cleanPhone = place.phone || '전화번호 미등록';

  return `
    <article class="place-card-item">
      <!-- 썸네일 영역 -->
      <div class="card-media">
        <img src="${photoUrl}" alt="${escapeHtml(place.place_name)}" loading="lazy" />
        <div class="media-badges">
          <span class="difficulty-pill index-level ${soloInfo.pillClass}">
            ${soloInfo.label}
          </span>
          <span class="distance-pill">
            ${walkText}
          </span>
        </div>
      </div>

      <!-- 본문 영역 -->
      <div class="card-body">
        <span class="place-category">${escapeHtml(place.category_name || '일반음식점')}</span>
        <h3 class="place-title">${escapeHtml(place.place_name)}</h3>

        <!-- 혼밥 포인트 태그 -->
        <div class="solo-tags">
          ${soloInfo.tags.map((t) => `<span class="solo-tag">${t}</span>`).join('')}
        </div>

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
          <button type="button" class="btn-open-review" onclick="openReviewModal('${escapeHtml(place.place_name)}', '${escapeHtml(cleanAddr)}')">
            혼밥 리뷰 작성
          </button>
        </div>
      </div>
    </article>
  `;
}

// 리뷰 모달 제어
window.openReviewModal = function (name, address) {
  modalPlaceName.textContent = name;
  modalPlaceAddress.textContent = `📍 ${address}`;
  reviewModal.classList.remove('hidden');
};

modalClose.addEventListener('click', () => {
  reviewModal.classList.add('hidden');
});

reviewModal.addEventListener('click', (e) => {
  if (e.target === reviewModal) reviewModal.classList.add('hidden');
});

// 난이도 선택 버튼
levelOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    levelOptions.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLevel = Number(btn.dataset.level);
  });
});

// 리뷰 제출 버튼
btnSubmitReview.addEventListener('click', () => {
  const content = document.getElementById('review-textarea').value.trim();
  alert(
    `[혼밥 리뷰 등록 완료!]\n\n• 식당: ${modalPlaceName.textContent}\n• 선택한 난이도: Lv.${selectedLevel}\n• 남긴 후기: ${content || '(내용 없음)'}\n\n* 실제 데이터 저장은 수업에서 Prisma DB를 연동하면 데이터베이스에 영구 저장됩니다!`
  );
  document.getElementById('review-textarea').value = '';
  reviewModal.classList.add('hidden');
});

// 검색 폼 제출
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) loadPlaces(q);
});

// 퀵 카테고리 칩 클릭
kwChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    kwChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const q = chip.dataset.query;
    searchInput.value = q;
    loadPlaces(q);
  });
});

// 난이도 필터 탭 클릭
filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    filterTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderFilteredPlaces();
  });
});

// XSS 보안 이스케이프
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[m];
  });
}

// 최초 진입 시 명지대 인문캠퍼스 기본 혼밥 식당 로드
loadPlaces('혼밥');
