/**
 * [이 파일이 하는 일]
 * 식당별 혼밥 난이도 및 리뷰 생성/조회/수정/삭제(CRUD) 엔드포인트를 정의하는 라우터입니다.
 */

import { Router } from 'express';
import {
  createReview,
  getPlaceReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const reviewRouter = Router();

// 리뷰 작성: POST /api/reviews
// TODO: [수업에서 구현] 로그인 인증(requireAuth) 후 리뷰 작성
reviewRouter.post('/', requireAuth, createReview);

// 특정 식당의 리뷰 목록 조회: GET /api/reviews/place/:placeId
// TODO: [수업에서 구현] 누구나 조회 가능
reviewRouter.get('/place/:placeId', getPlaceReviews);

// 리뷰 수정: PATCH /api/reviews/:id
// TODO: [수업에서 구현] 로그인 인증 및 작성자 본인 확인 후 수정
reviewRouter.patch('/:id', requireAuth, updateReview);

// 리뷰 삭제: DELETE /api/reviews/:id
// TODO: [수업에서 구현] 로그인 인증 및 작성자 본인 확인 후 삭제
reviewRouter.delete('/:id', requireAuth, deleteReview);
