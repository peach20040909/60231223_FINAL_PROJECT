/**
 * [이 파일이 하는 일]
 * 식당(장소) 검색 및 상세 조회와 관련된 요청을 처리하는 컨트롤러입니다.
 * 카카오 로컬 API를 호출하는 kakao.ts 모듈을 활용하여 식당 데이터를 응답합니다.
 */

import type { Request, Response, NextFunction } from 'express';
import { searchPlacesByKeyword, MYONGJI_SEOUL_COORDS } from '../lib/kakao.js';

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

    // 명지대학교 인문캠퍼스(서울 서대문구 거북골로) 기준 반경 1.5km(1500m) 내 검색
    const searchResult = await searchPlacesByKeyword(query, {
      page,
      size,
      x: MYONGJI_SEOUL_COORDS.x,
      y: MYONGJI_SEOUL_COORDS.y,
      radius: 1500,
      sort: 'distance',
    });

    res.json({
      success: true,
      meta: searchResult.meta,
      places: searchResult.documents,
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
