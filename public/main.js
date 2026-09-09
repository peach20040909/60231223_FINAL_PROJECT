/**
 * solo-map 프론트엔드 인터랙션 스크립트
 * Express 5 백엔드 API(/api/places/search)와 통신하여 식당을 렌더링합니다.
 */

// 식당 카테고리에 따른 기본 혼밥 난이도 추천 계산기 (재미있는 UX 기능)
function guessSoloDifficulty(category) {
  if (!category) return { lv: 3, label: 'Lv.3 일반' };
  if (category.includes('패스트푸드') || category.includes('분식') || category.includes('토스트') || category.includes('샐러드')) {
    return { lv: 1, label: 'Lv.1 초급 혼밥', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  }
  if (category.includes('일식') || category.includes('일본식') || category.includes('라면') || category.includes('국수') || category.includes('우동')) {
    return { lv: 2, label: 'Lv.2 바 테이블', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
  }
  if (category.includes('한식') || category.includes('중식') || category.includes('찌개') || category.includes('돈까스')) {
    return { lv: 3, label: 'Lv.3 일반 식당', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  }
  if (category.includes('양식') || category.includes('패밀리레스토랑') || category.includes('뷔페') || category.includes('피자')) {
    return { lv: 4, label: 'Lv.4 용기 필요', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
  }
  if (category.includes('육류') || category.includes('고기') || category.includes('술집') || category.includes('회')) {
    return { lv: 5, label: 'Lv.5 혼밥 마스터', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  }
  return { lv: 3, label: 'Lv.3 일반', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
}

// DOM 요소
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const placesGrid = document.getElementById('places-grid');
const resultsCount = document.getElementById('results-count');
const resultsTitle = document.getElementById('results-title');
const quickTags = document.querySelectorAll('.quick-tag');

// 모달 요소
const reviewModal = document.getElementById('review-modal');
const modalClose = document.getElementById('modal-close');
const modalPlaceName = document.getElementById('modal-place-name');
const modalPlaceAddress = document.getElementById('modal-place-address');
const submitReviewBtn = document.getElementById('submit-review-btn');
const diffButtons = document.querySelectorAll('.diff-btn');
let selectedDifficulty = 1;

// 식당 검색 API 호출 함수
async function fetchPlaces(keyword) {
  placesGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #94a3b8;">
      <p style="font-size: 24px; margin-bottom: 12px;">🔍</p>
      <p>명지대 인문캠퍼스 주변 <strong>"${keyword}"</strong> 식당을 검색하는 중...</p>
    </div>
  `;
  resultsCount.textContent = '검색 중...';
  resultsTitle.textContent = `"${keyword}" 검색 결과`;

  try {
    const response = await fetch(`/api/places/search?query=${encodeURIComponent(keyword)}&size=15`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '식당 정보를 불러오지 못했습니다.');
    }

    const places = data.places || [];
    resultsCount.textContent = `총 ${places.length}곳 발견`;

    if (places.length === 0) {
      placesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #94a3b8;">
          <p style="font-size: 24px; margin-bottom: 8px;">😢</p>
          <p>검색 결과가 없습니다. 다른 키워드로 검색해 보세요!</p>
        </div>
      `;
      return;
    }

    renderPlaceCards(places);
  } catch (err) {
    console.error(err);
    placesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; color: #f87171;">
        <p>⚠️ <strong>검색 실패:</strong> ${err.message}</p>
      </div>
    `;
    resultsCount.textContent = '0곳';
  }
}

// 식당 카드 렌더링
function renderPlaceCards(places) {
  placesGrid.innerHTML = places
    .map((place) => {
      const diff = guessSoloDifficulty(place.category_name);
      return `
        <article class="place-card">
          <div>
            <div class="card-top">
              <h3 class="place-name">${escapeHtml(place.place_name)}</h3>
              <span class="card-diff-badge" style="color: ${diff.color}; background: ${diff.bg}; border: 1px solid ${diff.color}40;">
                ${diff.label}
              </span>
            </div>
            <span class="category-tag">${escapeHtml(place.category_name || '음식점')}</span>

            <ul class="place-info-list">
              <li>
                <span>📍</span>
                <span>${escapeHtml(place.road_address_name || place.address_name)}</span>
              </li>
              ${place.distance ? `
                <li>
                  <span>🚶</span>
                  <span>캠퍼스로부터 약 <strong>${place.distance}m</strong></span>
                </li>
              ` : ''}
              <li>
                <span>📞</span>
                <span>${escapeHtml(place.phone || '전화번호 정보 없음')}</span>
              </li>
            </ul>
          </div>

          <div class="card-actions">
            <a href="${escapeHtml(place.place_url)}" target="_blank" rel="noopener noreferrer" class="btn-detail">
              카카오맵 길찾기
            </a>
            <button type="button" class="btn-review" onclick="openReviewModal('${escapeHtml(place.place_name)}', '${escapeHtml(place.road_address_name || place.address_name)}')">
              혼밥 리뷰 쓰기
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

// 리뷰 모달 제어
window.openReviewModal = function(name, address) {
  modalPlaceName.textContent = name;
  modalPlaceAddress.textContent = `📍 ${address}`;
  reviewModal.classList.remove('hidden');
};

modalClose.addEventListener('click', () => {
  reviewModal.classList.add('hidden');
});

reviewModal.addEventListener('click', (e) => {
  if (e.target === reviewModal) {
    reviewModal.classList.add('hidden');
  }
});

// 난이도 선택 버튼
diffButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    diffButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.level;
  });
});

// 리뷰 등록 버튼 클릭
submitReviewBtn.addEventListener('click', () => {
  const content = document.getElementById('review-content').value;
  alert(
    `[혼밥 리뷰 작성 완료!]\n\n식당: ${modalPlaceName.textContent}\n난이도: Lv.${selectedDifficulty}\n내용: ${content || '(작성 내용 없음)'}\n\n* 리뷰 저장 기능은 수업에서 Prisma와 연동할 예정입니다!`
  );
  document.getElementById('review-content').value = '';
  reviewModal.classList.add('hidden');
});

// 검색 이벤트
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) fetchPlaces(q);
});

quickTags.forEach((tag) => {
  tag.addEventListener('click', () => {
    const q = tag.dataset.query;
    searchInput.value = q;
    fetchPlaces(q);
  });
});

// XSS 방지 유틸
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (match) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}

// 초기 로딩 시 명지대 인문캠퍼스 주변 기본 혼밥 식당 검색
fetchPlaces('혼밥');
