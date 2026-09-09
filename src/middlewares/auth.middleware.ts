/**
 * [이 파일이 하는 일]
 * 특정 API 요청(예: 리뷰 작성, 수정 등)을 보낸 사용자가 로그인된 사용자인지 검증하는 미들웨어입니다.
 * 인증(Authentication)이 필요한 라우터 앞에 붙여서 사용합니다.
 */

import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // TODO: [수업에서 구현]
  // 1. 요청 헤더(Authorization)에서 토큰(JWT)이나 쿠키/세션을 추출합니다.
  // 2. 토큰이 유효한지 검증합니다.
  // 3. 유효하다면 req 객체에 유저 정보를 담아 next()를 호출합니다. (예: (req as any).user = payload)
  // 4. 유효하지 않다면 401 Unauthorized 에러를 응답합니다.

  console.log('[AuthMiddleware] 인증 검증 미들웨어 실행 (현재는 통과)');
  next();
}
