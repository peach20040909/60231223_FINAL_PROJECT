/**
 * [이 파일이 하는 일]
 * 식당(장소) 검색 및 상세 조회와 관련된 요청을 처리하는 컨트롤러입니다.
 * 카카오 로컬 API를 호출하는 kakao.ts 모듈을 활용하여 식당 데이터를 응답합니다.
 */

import type { Request, Response, NextFunction } from 'express';
import { searchPlacesByKeyword, MYONGJI_SEOUL_COORDS, type KakaoPlaceDocument } from '../lib/kakao.js';

// 식당 키워드 검색 컨트롤러 (카카오 로컬 API 연동)
export async function searchPlaces(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.query as string;
    const page = req.query.page ? Number(req.query.page) : 1;
    const size = req.query.size ? Number(req.query.size) : 15;

    if (!query) {
      res.status(400).json({
        success: false,
        message: '검색어(query) 쿼리 파라미터가 필요합니다. 예: ?query=홍대 라멘',
      });
      return;
    }

    // 명지대 대학가 3대 핵심 생활 거점 (인문캠퍼스, 명지전문대, 백련시장)
    // 단일 좌표 거리순의 국소 뭉침(정문 앞 100m만 나오는 현상)을 해결하고
    // 명지전문대 북측 상권과 백련시장 남측 골목까지 대학가 전체를 풍성하게 커버!
    const hubs = [
      { name: '명지대 인문캠', x: MYONGJI_SEOUL_COORDS.x, y: MYONGJI_SEOUL_COORDS.y, radius: 1500 },
      { name: '명지전문대', x: '126.9240', y: '37.5845', radius: 1500 },
      { name: '백련시장', x: '126.9231', y: '37.5768', radius: 1500 },
    ];

    const searchPromises = hubs.map((hub) =>
      searchPlacesByKeyword(query, {
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

    // 중복 제거 및 리스트 병합
    const combinedPlaces: KakaoPlaceDocument[] = [];
    const existingIds = new Set<string>();

    for (const resData of results) {
      for (const place of resData.documents) {
        if (!existingIds.has(place.id)) {
          existingIds.add(place.id);
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
