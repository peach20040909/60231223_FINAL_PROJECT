/**
 * [이 파일이 하는 일]
 * Express 5 서버의 메인 진입점(Entry Point) 파일입니다.
 * 미들웨어 설정, 라우터 연결, 기본 헬스체크 엔드포인트(GET /) 및 서버 포트 리스닝을 담당합니다.
 */

import 'dotenv/config'; // .env 파일의 환경변수를 process.env로 불러옵니다.
import express from 'express';
import { authRouter } from './routes/auth.routes.js';
import { placeRouter } from './routes/place.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 공통 전역 미들웨어 설정
// 클라이언트가 보낸 JSON 형식의 요청 본문(body)을 req.body로 파싱
app.use(express.json());
// URL-encoded 형태의 폼 데이터 파싱
app.use(express.urlencoded({ extended: true }));
// public 폴더의 정적 파일(업로드 이미지 등)을 웹에서 바로 접근할 수 있도록 서빙
app.use(express.static('public'));

// 2. 헬스체크(Health Check) 엔드포인트
app.get('/api/health', (req, res) => {
  res.send('solo-map API running');
});

// 3. 기능별 라우터 등록 (/api 접두어로 통일)
app.use('/api/auth', authRouter);
app.use('/api/places', placeRouter);
app.use('/api/reviews', reviewRouter);

// 4. 전역 에러 핸들러 미들웨어 등록 (반드시 라우터 등록보다 아래에 위치해야 함)
app.use(errorHandler);

// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` 혼밥 난이도 지도 (solo-map) 서버 실행 중!`);
  console.log(` 포트: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

export default app;
