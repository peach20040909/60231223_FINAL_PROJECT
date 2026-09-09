/**
 * [이 파일이 하는 일]
 * 카카오 로컬 REST API를 호출하여 키워드로 식당(장소) 목록을 검색하는 모듈입니다.
 * 외부 API와의 직접적인 통신 및 응답 데이터 타입 정의를 담당합니다.
 */

// 카카오 로컬 API 장소 단일 항목 응답 인터페이스 (TypeScript 타입)
export interface KakaoPlaceDocument {
  id: string; // 카카오 장소 고유 ID
  place_name: string; // 식당/장소 이름 (예: "이치란 라멘")
  category_name: string; // 카테고리 전체 (예: "음식점 > 일식 > 일본식라면")
  category_group_code: string; // 카테고리 그룹 코드 (음식점은 'FD6', 카페는 'CE7')
  category_group_name: string; // 카테고리 그룹 명 (예: "음식점")
  phone: string; // 전화번호
  address_name: string; // 지번 주소
  road_address_name: string; // 도로명 주소
  x: string; // 경도 (Longitude)
  y: string; // 위도 (Latitude)
  place_url: string; // 카카오맵 상세 웹페이지 URL
  distance?: string; // 중심좌표로부터의 거리 (단위: 미터)
}

// 카카오 로컬 API 메타데이터 인터페이스
export interface KakaoSearchMeta {
  total_count: number; // 검색된 전체 문서 수
  pageable_count: number; // 노출 가능한 문서 수 (최대 45)
  is_end: boolean; // 현재 페이지가 마지막 페이지인지 여부
  same_name?: {
    region: string[];
    keyword: string;
    selected_region: string;
  };
}

// 카카오 키워드 검색 전체 응답 형태
export interface KakaoSearchResponse {
  meta: KakaoSearchMeta;
  documents: KakaoPlaceDocument[];
}

// 명지대학교 인문캠퍼스 (서울 서대문구 거북골로 34) 기본 중심 좌표
export const MYONGJI_SEOUL_COORDS = {
  name: '명지대학교 인문캠퍼스',
  address: '서울 서대문구 거북골로 34',
  x: '126.9234', // 경도 (Longitude)
  y: '37.5802', // 위도 (Latitude)
} as const;

// 검색 옵션 타입
export interface SearchPlacesOptions {
  page?: number; // 조회할 페이지 번호 (기본값: 1, 최대: 45)
  size?: number; // 한 페이지에 보여줄 개수 (기본값: 15, 최대: 15)
  category_group_code?: string; // 'FD6'(음식점), 'CE7'(카페) 등
  x?: string; // 중심 좌표 X(경도) - 특정 위치 기준 검색 시 사용
  y?: string; // 중심 좌표 Y(위도) - 특정 위치 기준 검색 시 사용
  radius?: number; // 중심 좌표 기준 반경 거리 (단위: 미터, 0 ~ 20000m)
  sort?: 'accuracy' | 'distance'; // 정렬 기준 ('accuracy': 정확도순, 'distance': 거리순)
}

const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

/**
 * 키워드로 식당/장소를 검색하는 함수
 * @param query 검색 키워드 (예: "홍대 라멘", "강남 혼밥")
 * @param options 페이지, 사이즈, 카테고리 필터 옵션
 * @returns 카카오 API 검색 결과 (메타 정보 및 장소 리스트)
 */
export async function searchPlacesByKeyword(
  query: string,
  options: SearchPlacesOptions = {}
): Promise<KakaoSearchResponse> {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  // 1. 카카오 API 키 검증 (.env 파일에 설정되었는지 확인)
  if (!apiKey || apiKey === 'your_kakao_rest_api_key_here') {
    throw new Error(
      '카카오 REST API 키가 설정되지 않았습니다. .env 파일에 KAKAO_REST_API_KEY를 등록해주세요.'
    );
  }

  if (!query || query.trim() === '') {
    throw new Error('검색할 키워드를 입력해주세요.');
  }

  // 2. 요청 URL 파라미터(Query String) 구성
  const {
    page = 1,
    size = 15,
    category_group_code = 'FD6',
    x,
    y,
    radius,
    sort,
  } = options;

  const params = new URLSearchParams({
    query: query.trim(),
    page: String(page),
    size: String(size),
  });

  // 카테고리 코드가 지정된 경우 추가 (기본값: 'FD6' 음식점)
  if (category_group_code) {
    params.append('category_group_code', category_group_code);
  }

  // 좌표 기반 반경 검색 파라미터 추가
  if (x && y) {
    params.append('x', x);
    params.append('y', y);
  }
  if (radius) {
    params.append('radius', String(radius));
  }
  if (sort) {
    params.append('sort', sort);
  }

  const targetUrl = `${KAKAO_KEYWORD_SEARCH_URL}?${params.toString()}`;

  // 3. 카카오 REST API 호출 (Node 18+ 내장 fetch 사용)
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      // 카카오 인증 규격: 'KakaoAK ' 접두어 + REST API 키
      Authorization: `KakaoAK ${apiKey}`,
    },
  });

  // 4. 응답 에러 처리
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `카카오 API 요청 실패 (상태 코드: ${response.status}): ${errorText}`
    );
  }

  // 5. JSON 파싱 후 반환
  const data = (await response.json()) as KakaoSearchResponse;
  return data;
}
