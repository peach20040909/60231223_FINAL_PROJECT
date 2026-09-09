/**
 * [이 파일이 하는 일]
 * 회원가입, 로그인, 로그아웃 등 사용자 인증과 관련된 요청(Request)을 받아
 * 처리하고 응답(Response)을 반환하는 컨트롤러입니다.
 */

import type { Request, Response } from 'express';

// 회원가입 컨트롤러
export async function signup(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.body에서 이메일, 비밀번호, 닉네임 등을 추출
  // 2. 비밀번호 해싱 (bcrypt 등 사용)
  // 3. Prisma를 통해 DB에 유저 생성
  // 4. 성공 메시지 또는 생성된 유저 정보 응답 (비밀번호 제외)
  res.status(501).json({
    message: '회원가입 기능은 수업에서 구현 예정입니다.',
  });
}

// 로그인 컨트롤러
export async function login(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. req.body에서 이메일, 비밀번호 추출
  // 2. DB에서 유저 조회 및 비밀번호 일치 확인
  // 3. JWT 토큰 발급 또는 세션 생성
  // 4. 토큰/세션과 함께 로그인 성공 응답
  res.status(501).json({
    message: '로그인 기능은 수업에서 구현 예정입니다.',
  });
}

// 로그아웃 컨트롤러
export async function logout(req: Request, res: Response) {
  // TODO: [수업에서 구현]
  // 1. 클라이언트의 쿠키 또는 세션 무효화
  res.status(501).json({
    message: '로그아웃 기능은 수업에서 구현 예정입니다.',
  });
}
