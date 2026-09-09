/**
 * [이 파일이 하는 일]
 * 식당(장소) 검색 및 상세 조회에 관한 URL 라우트를 정의하는 라우터입니다.
 */

import { Router } from 'express';
import { searchPlaces, getPlaceDetail } from '../controllers/place.controller.js';

export const placeRouter = Router();

// 식당 키워드 검색: GET /api/places/search?query=검색어&page=1
// 카카오 로컬 API를 호출하여 장소 목록을 반환합니다.
placeRouter.get('/search', searchPlaces);

// 식당 상세 조회: GET /api/places/:id
// TODO: [수업에서 구현] 특정 식당의 정보와 혼밥 난이도 평균, 리뷰 목록을 반환합니다.
placeRouter.get('/:id', getPlaceDetail);
