/**
 * [이 파일이 하는 일]
 * 식당별 '혼밥 난이도(1~5)'와 리뷰의 생성, 조회, 수정, 삭제(CRUD) 요청을
 * 처리하는 컨트롤러입니다.
 */

import type { Request, Response } from 'express';

// 1. 리뷰 작성 (POST /api/reviews)
export async function createReview(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.body에서 { placeId, difficulty(1~5), content } 추출
  // 2. req.user(로그인된 유저 정보)에서 작성자 userId 확인
  // 3. Prisma를 통해 reviews 테이블에 새 리뷰 레코드 생성
  // 4. 해당 식당의 평균 혼밥 난이도 재계산/업데이트 (필요 시)
  // 5. 생성된 리뷰 데이터 응답 (201 Created)
  res.status(501).json({
    message: '리뷰 작성 기능은 수업에서 구현 예정입니다.',
  });
}

// 2. 특정 식당의 리뷰 목록 조회 (GET /api/reviews/place/:placeId)
export async function getPlaceReviews(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.params.placeId로 해당 식당 식별
  // 2. DB에서 이 식당에 달린 리뷰 목록(작성자 정보 포함)을 최신순으로 조회
  // 3. 리뷰 목록과 총 개수 응답
  const { placeId } = req.params;

  res.status(501).json({
    message: `식당(ID: ${placeId})의 리뷰 목록 조회 기능은 수업에서 구현 예정입니다.`,
  });
}

// 3. 리뷰 수정 (PATCH /api/reviews/:id)
export async function updateReview(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.params.id (수정할 리뷰 ID) 확인
  // 2. DB에서 기존 리뷰를 조회하여 본인이 쓴 글인지 권한 확인
  // 3. req.body에서 수정할 난이도(difficulty)나 내용(content) 반영하여 DB 업데이트
  // 4. 수정된 리뷰 결과 응답
  const { id } = req.params;

  res.status(501).json({
    message: `리뷰(ID: ${id}) 수정 기능은 수업에서 구현 예정입니다.`,
  });
}

// 4. 리뷰 삭제 (DELETE /api/reviews/:id)
export async function deleteReview(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.params.id (삭제할 리뷰 ID) 확인
  // 2. 본인이 쓴 글인지 또는 관리자 권한인지 확인
  // 3. DB에서 해당 리뷰 삭제
  // 4. 성공 메시지 응답 (200 OK 또는 204 No Content)
  const { id } = req.params;

  res.status(501).json({
    message: `리뷰(ID: ${id}) 삭제 기능은 수업에서 구현 예정입니다.`,
  });
}
