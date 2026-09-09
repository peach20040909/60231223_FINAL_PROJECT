/**
 * [이 파일이 하는 일]
 * 사용자 회원가입, 로그인, 로그아웃 관련 HTTP 요청 경로(URL)를 정의하는 라우터입니다.
 * 클라이언트의 요청 URL을 알맞은 컨트롤러 함수에 연결해 줍니다.
 */

import { Router } from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';

export const authRouter = Router();

// 회원가입: POST /api/auth/signup
// TODO: [수업에서 구현] 회원가입 컨트롤러 연결
authRouter.post('/signup', signup);

// 로그인: POST /api/auth/login
// TODO: [수업에서 구현] 로그인 컨트롤러 연결
authRouter.post('/login', login);

// 로그아웃: POST /api/auth/logout
// TODO: [수업에서 구현] 로그아웃 컨트롤러 연결
authRouter.post('/logout', logout);
