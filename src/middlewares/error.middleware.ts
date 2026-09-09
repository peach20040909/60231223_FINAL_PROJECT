/**
 * [이 파일이 하는 일]
 * Express 애플리케이션 전역에서 발생하는 에러를 한곳에서 잡아 처리하는 에러 핸들러 미들웨어입니다.
 * 비정상적인 예외로 서버가 꺼지는 것을 방지하고, 일관된 형태의 에러 응답을 클라이언트에 전송합니다.
 */

import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error('[Error] 전역 에러 감지:', err.message);

  // Express 5에서는 async 함수에서 throw된 에러도 자동으로 이 핸들러로 전달됩니다.
  res.status(500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
  });
}
