# 60231223_FINAL_PROJECT - 혼밥 난이도 지도 (solo-map)

> **혼밥 난이도 지도 (solo-map)**: 사용자들이 식당별 "혼밥 난이도(1~5)"와 혼밥 관점의 솔직한 리뷰를 공유하고 지도에서 확인할 수 있는 서비스입니다.

---

## 🛠️ 기술 스택
- **언어**: TypeScript (ESM, NodeNext)
- **런타임 / 프레임워크**: Node.js, Express 5
- **개발 환경**: `tsx` (핫 리로드 개발 서버), `tsc --noEmit` (타입 검사)
- **외부 API**: 카카오 로컬 REST API (키워드 및 좌표 기반 식당 검색)
- **데이터베이스 (예정)**: Prisma ORM + Supabase (PostgreSQL)

---

## 📁 프로젝트 폴더 구조

```
Final_project/
├── prisma/               # (추후 수업) Prisma ORM 스키마 및 마이그레이션
├── public/               # 정적 파일 서빙 (사용자 업로드 이미지 등)
│   └── uploads/
├── src/
│   ├── controllers/      # 요청(req) 검증 및 응답(res) 핸들러 (TODO 뼈대)
│   │   ├── auth.controller.ts
│   │   ├── place.controller.ts
│   │   └── review.controller.ts
│   ├── lib/              # 외부 API 및 유틸리티
│   │   └── kakao.ts      # 카카오 로컬 REST API 검색 모듈 (위경도/반경 지원)
│   ├── middlewares/      # Express 미들웨어 (인증, 전역 에러 핸들러)
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/           # 라우터 엔드포인트 정의
│   │   ├── auth.routes.ts       # POST /api/auth/signup, login, logout
│   │   ├── place.routes.ts      # GET /api/places/search, /:id
│   │   └── review.routes.ts     # POST/GET/PATCH/DELETE /api/reviews
│   ├── services/         # 비즈니스 로직 계층 (추후 DB 쿼리 분리)
│   └── app.ts            # Express 5 진입점 및 서버 실행
├── .env.example          # 환경변수 템플릿
├── .gitignore            # Git 제외 목록 (.env, node_modules 등)
├── package.json          # 패키지 설정 및 스크립트
├── tsconfig.json         # TypeScript 컴파일 설정
└── test-api.ts           # 카카오 로컬 API 연동 검증용 테스트 스크립트
```

---

## 🚀 실행 및 개발 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 카카오 REST API 키를 입력합니다.
```env
PORT=3000
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

### 3. 개발 서버 실행 (코드 저장 시 자동 재시작)
```bash
npm run dev
```
- 서버 주소: `http://localhost:3000`
- 기본 헬스체크: `GET /` ➔ `"solo-map API running"`

### 4. 타입 검사 (Type Check)
```bash
npm run typecheck
```

### 5. 카카오 API 연동 테스트
```bash
npx tsx test-api.ts
```

---

## 📍 주요 API 엔드포인트 요약

| Method | Endpoint | 설명 | 상태 |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | 서버 헬스체크 ("solo-map API running") | 완료 |
| `GET` | `/api/places/search` | 식당 키워드/위치 검색 (카카오 로컬 연동) | 완료 |
| `GET` | `/api/places/:id` | 식당 상세 정보 및 리뷰 통계 | TODO (수업 진행) |
| `POST` | `/api/auth/signup` | 회원가입 | TODO (수업 진행) |
| `POST` | `/api/auth/login` | 로그인 (JWT/세션) | TODO (수업 진행) |
| `POST` | `/api/reviews` | 특정 식당에 혼밥 난이도(1~5) 및 리뷰 작성 | TODO (수업 진행) |
| `GET` | `/api/reviews/place/:placeId` | 특정 식당의 리뷰 목록 조회 | TODO (수업 진행) |
| `PATCH` | `/api/reviews/:id` | 리뷰 수정 | TODO (수업 진행) |
| `DELETE` | `/api/reviews/:id` | 리뷰 삭제 | TODO (수업 진행) |
