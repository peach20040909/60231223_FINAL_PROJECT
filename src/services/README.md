# Services 계층 (비즈니스 로직)

## 이 폴더의 역할
- **Controller**가 클라이언트의 요청(req)을 받고 응답(res)을 보내는 곳이라면,
- **Service**는 실제 핵심 로직(Prisma를 통한 DB 조회/생성/수정/삭제, 데이터 계산 등)을 수행하는 계층입니다.
- 나중에 수업에서 Prisma를 배운 후 `auth.service.ts`, `place.service.ts`, `review.service.ts` 등을 만들어 컨트롤러에서 불러와 사용하면 코드가 매우 깔끔해집니다!
