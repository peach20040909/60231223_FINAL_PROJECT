/**
 * [이 파일이 하는 일]
 * 식당(장소) 검색 및 상세 조회와 관련된 요청을 처리하는 컨트롤러입니다.
 * 카카오 로컬 API를 호출하는 kakao.ts 모듈을 활용하여 식당 데이터를 응답합니다.
 */

import type { Request, Response, NextFunction } from 'express';
import { searchPlacesByKeyword, MYONGJI_SEOUL_COORDS, type KakaoPlaceDocument } from '../lib/kakao.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 대동명지도 2026 ver. 명지대 실제 대학가 검증 맛집 데이터 로드 (개발 및 프로덕션 환경 완벽 호환)
let daedongPlaces: KakaoPlaceDocument[] = [];
try {
  const candidatePaths = [
    path.resolve(process.cwd(), 'src/data/daedongPlaces.json'),
    path.resolve(process.cwd(), 'dist/data/daedongPlaces.json'),
    path.resolve(__dirname, '../data/daedongPlaces.json'),
  ];
  const validPath = candidatePaths.find((p) => fs.existsSync(p));
  if (validPath) {
    const raw = fs.readFileSync(validPath, 'utf8');
    daedongPlaces = JSON.parse(raw);
    console.log(`✅ [대동명지도 2026] 명지대 맛집 ${daedongPlaces.length}곳 성공적으로 로드됨! (경로: ${validPath})`);
  } else {
    console.warn('⚠️ daedongPlaces.json 파일을 찾을 수 없습니다.');
  }
} catch (err) {
  console.warn('⚠️ daedongPlaces.json 로드 실패:', err);
}

// 식당 키워드 검색 컨트롤러 (대동명지도 DB + 카카오 로컬 API 실시간 융합)
export async function searchPlaces(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req.query.query as string) || '혼밥';

    // 1. 대동명지도에서 검색어 매칭되는 식당 우선 추출
    const qLower = query.toLowerCase().trim();
    const isGeneralQuery = qLower === '혼밥' || qLower === '전체' || qLower === '맛집' || qLower === '식당' || qLower === '';

    let matchedDaedong: KakaoPlaceDocument[] = [];
    if (isGeneralQuery) {
      // 일반 전체 검색일 때는 대동명지도 111개 전체 식당 제공! (엄마손떡볶이, 모래내곱창, 주인백파스타 등 100% 노출)
      matchedDaedong = [...daedongPlaces];
    } else {
      // 특정 검색어(예: '곱창', '파스타', '떡볶이', '국밥' 등)일 때는 대동명지도 내 이름/카테고리 일치 식당 우선 필터
      matchedDaedong = daedongPlaces.filter((p) => {
        const text = `${p.place_name} ${p.category_name} ${p.road_address_name || ''}`.toLowerCase();
        return text.includes(qLower);
      });
    }

    // 2. 카카오 로컬 API 3대 거점 (인문캠, 명지전문대, 백련시장) 도보 상권(800m) 실시간 검색 병렬 수행
    // 반경을 800m로 정밀 타겟팅하여 증산동, 불광천, 수색 등 먼 외곽 상권이 섞이지 않도록 방지!
    const hubs = [
      { name: '명지대 인문캠', x: MYONGJI_SEOUL_COORDS.x, y: MYONGJI_SEOUL_COORDS.y, radius: 800 },
      { name: '명지전문대', x: '126.9240', y: '37.5845', radius: 800 },
      { name: '백련시장', x: '126.9231', y: '37.5768', radius: 800 },
    ];

    const kakaoSearchTerm = isGeneralQuery ? '명지대 맛집' : `${query} 명지대`;

    const searchPromises = hubs.map((hub) =>
      searchPlacesByKeyword(kakaoSearchTerm, {
        page: 1,
        size: 15,
        x: hub.x,
        y: hub.y,
        radius: hub.radius,
        sort: 'distance',
      }).catch(() => ({
        meta: { total_count: 0, pageable_count: 0, is_end: true },
        documents: [] as KakaoPlaceDocument[],
      }))
    );

    const results = await Promise.all(searchPromises);

    // 3. 대동명지도 식당을 최우선으로 리스트에 담고, 카카오 실시간 검색 결과를 중복 없이 병합
    // 🎯 명지대 실제 도보 상권 (남가좌동, 가좌로, 증가로) 및 순수 식사/밥집(술집·반찬가게 제외) 엄격 필터링!
    const isPureMealAndWalkingZone = (p: KakaoPlaceDocument) => {
      const lat = Number(p.y);
      const lng = Number(p.x);
      const name = p.place_name.toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      const addr = (p.road_address_name || p.address_name || '').toLowerCase();

      // 1. 증산, 은평구, 수색 등 원거리 상권 제외
      if (addr.includes('증산') || addr.includes('은평구') || addr.includes('수색')) {
        return false;
      }
      if (lat < 37.573 || lat > 37.588 || lng < 126.917 || lng > 126.933) {
        return false;
      }

      // 2. 🍺 혼밥에 부적절한 술집/주점/호프/포차/반찬가게 전면 제외 (미자네맛반찬, 돼지주막 등 100% 차단)
      if (name.includes('미자네맛반찬') || name.includes('돼지주막')) return false;
      if (cat.includes('술집') || cat.includes('호프') || cat.includes('포장마차') || cat.includes('주점') || cat.includes('이자카야') || cat.includes('반찬')) {
        return false;
      }
      const barKeywords = ['주막', '술집', '포차', '호프', '이자카야', '맥주', '주점', '반찬', '와인', '펍', 'pub', '소주', '비어'];
      if (barKeywords.some((kw) => name.includes(kw))) {
        return false;
      }

      return true;
    };

    const combinedPlaces: KakaoPlaceDocument[] = matchedDaedong.filter(isPureMealAndWalkingZone);
    const existingIds = new Set<string>(combinedPlaces.map((p) => p.id));
    const existingNames = new Set<string>(combinedPlaces.map((p) => p.place_name.replace(/\s+/g, '')));

    for (const resData of results) {
      for (const place of resData.documents) {
        if (!isPureMealAndWalkingZone(place)) continue;
        const normName = place.place_name.replace(/\s+/g, '');
        if (!existingIds.has(place.id) && !existingNames.has(normName)) {
          existingIds.add(place.id);
          existingNames.add(normName);
          combinedPlaces.push(place);
        }
      }
    }

    res.json({
      success: true,
      meta: {
        total_count: combinedPlaces.length,
        pageable_count: combinedPlaces.length,
        is_end: true,
        daedong_count: matchedDaedong.length,
      },
      places: combinedPlaces,
    });
  } catch (error) {
    // 에러 발생 시 Express 전역 에러 핸들러로 전달
    next(error);
  }
}

// 식당 상세 정보 조회 컨트롤러
export async function getPlaceDetail(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.params.id에서 식당 고유 ID 추출
  // 2. DB에서 해당 식당의 기본 정보 + 혼밥 난이도 평균 점수 + 최신 리뷰 조회
  // 3. 클라이언트에 식당 상세 데이터 응답
  const { id } = req.params;

  res.status(501).json({
    message: `식당(ID: ${id}) 상세 조회 기능은 수업에서 구현 예정입니다.`,
  });
}
