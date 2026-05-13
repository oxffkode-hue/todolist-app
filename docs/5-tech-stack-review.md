# 기술 스택 일관성 검토 보고서

| 항목 | 내용 |
|------|------|
| 검토 기준 문서 | `2-prd.md` (v1.1) |
| 검토 대상 문서 | 1-domain-definition.md, 3-user-scenario.md, 4-project-principles.md, 5-arch-diagram.md, 99-uc.md |
| 검토일 | 2026-05-13 |
| 검토자 | Business Analyst |

---

## 1. PRD 기준 기술 스택 (검토 원본)

| 영역 | PRD 기준 기술 |
|------|-------------|
| 프론트엔드 | React 19+, TypeScript, Zustand, TanStack Query |
| 백엔드 | Node.js + Express (REST API) |
| 데이터베이스 | PostgreSQL 17 |
| DB 연동 | pg 라이브러리 (ORM 사용 금지, Raw SQL) |
| 인증 | JWT (1차), OAuth Social 확장 예정 (2차) |
| 비밀번호 암호화 | bcrypt |
| 반응형 기준 | 768px |
| 배포 규모 | 단일 서버, 최대 300명 동시접속 |

---

## 2. 파일별 기술 스택 언급 현황표

범례: `일치` / `불일치` / `누락` / `해당없음(문서 성격상 언급 불필요)` / `부분언급(버전/표기 차이)`

### 2.1 `1-domain-definition.md` — 도메인 정의서

| 기술 항목 | 언급 여부 | 판정 | 비고 |
|----------|----------|------|------|
| React 19+ / TypeScript | 미언급 | 해당없음 | 도메인 정의서는 기술 스택 기술 범위 밖 |
| Zustand / TanStack Query | 미언급 | 해당없음 | 동일 |
| Node.js + Express | 미언급 | 해당없음 | 동일 |
| PostgreSQL 17 | 미언급 | 해당없음 | 동일 |
| pg / Raw SQL | 미언급 | 해당없음 | 동일 |
| JWT | 언급 (`UC-02`: JWT 인증 토큰 발급) | 일치 | 표기 일치 |
| bcrypt | 언급 (`BR-02`: bcrypt로 암호화) | 일치 | 표기 일치 |
| OAuth | 미언급 | 해당없음 | 도메인 범위 외 |
| 768px 반응형 | 미언급 | 해당없음 | 동일 |
| 300명 동시접속 | 미언급 | 해당없음 | 동일 |

**판정 요약**: 언급된 기술(JWT, bcrypt) 모두 PRD 기준과 일치. 도메인 정의서 성격상 기술 스택 미언급은 정상.

---

### 2.2 `2-prd.md` — PRD (기준 문서)

기준 문서이므로 별도 검토 불필요. 모든 기술 스택의 원본 출처.

---

### 2.3 `3-user-scenario.md` — 사용자 시나리오

| 기술 항목 | 언급 여부 | 판정 | 비고 |
|----------|----------|------|------|
| React 19+ / TypeScript | 미언급 | 해당없음 | 사용자 시나리오는 UX 중심 서술 |
| Zustand / TanStack Query | 미언급 | 해당없음 | 동일 |
| Node.js + Express | 미언급 | 해당없음 | 동일 |
| PostgreSQL 17 | 미언급 | 해당없음 | 동일 |
| pg / Raw SQL | 미언급 | 해당없음 | 동일 |
| JWT | 언급 (시나리오 2, 4, 9 등 다수) | 일치 | "JWT 토큰" 표기 일치 |
| bcrypt | 언급 (시나리오 1 결과: "bcrypt로 암호화", 시나리오 8) | 일치 | 표기 일치 |
| OAuth | 미언급 | 해당없음 | 1차 기능 아님, 정상 |
| 768px 반응형 | 미언급 | 해당없음 | 시나리오 서술 범위 밖 |
| 300명 동시접속 | 미언급 | 해당없음 | 동일 |
| CASCADE DELETE | 언급 (시나리오 9) | 일치 | DB 삭제 정책 일치 |

**판정 요약**: 언급된 기술 모두 PRD 기준과 표기 및 내용이 일치. 시나리오 문서 성격상 프레임워크/DB 미언급은 정상.

---

### 2.4 `4-project-principles.md` — 프로젝트 설계 원칙

| 기술 항목 | 언급 여부 | 판정 | 비고 |
|----------|----------|------|------|
| React 19+ | 미언급 (React라고만 표기) | **부분언급** | 버전 명시 없음. 파일명 `.tsx` 등 React 사용 명시됨 |
| TypeScript | 언급 (strict 모드, `any` 금지 등 상세 기술) | 일치 | |
| Zustand | 언급 (섹션 2.2, 디렉토리 구조 등) | 일치 | |
| TanStack Query | 언급 (섹션 2.2, `queries/`, `mutations/` 구조 등) | 일치 | |
| Node.js + Express | 언급 (Express 앱, 미들웨어 등 상세 기술) | 일치 | |
| PostgreSQL | 언급 (섹션 2.1 레이어 다이어그램에 `[PostgreSQL]`) | **부분언급** | 버전(17) 명시 없음 |
| pg / Raw SQL | 언급 (섹션 2.3, 4.3, 5.4 등 상세 기술) | 일치 | ORM 금지 원칙도 명시 |
| JWT | 언급 (섹션 5.2, 인증 미들웨어 등) | 일치 | |
| bcrypt | 언급 (섹션 5.3 상세 설정 포함) | 일치 | |
| OAuth | 미언급 | 해당없음 | 설계 원칙 문서 범위 밖 |
| 768px 반응형 | 언급 (`useMediaQuery.ts` 주석에 "768px") | 일치 | |
| 300명 동시접속 | 언급 (섹션 1.2: "동시접속 300명") | 일치 | |
| axios | 언급 (디렉토리 구조: `axiosInstance.ts`) | 일치 | PRD에 명시되지 않은 추가 항목이나 React 프론트엔드의 HTTP 클라이언트로 자연스러운 선택 |
| zod | 언급 (validate.middleware.ts 주석) | 추가항목 | PRD 미기재. 충돌 없음 |
| Jest/Vitest, Playwright | 언급 (섹션 4.1) | 추가항목 | PRD 미기재. 충돌 없음 |

**판정 요약**:
- `React` 버전(19+) 미기재 — **경미한 불일치**
- `PostgreSQL` 버전(17) 미기재 — **경미한 불일치**
- 핵심 기술 원칙(pg, ORM 금지, Zustand, TanStack Query, bcrypt, JWT 등)은 모두 일치
- 추가 기술(axios, zod, Jest 등) 기재는 PRD와 충돌 없이 자연스러운 확장

---

### 2.5 `5-arch-diagram.md` — 기술 아키텍처 다이어그램

| 기술 항목 | 언급 여부 | 판정 | 비고 |
|----------|----------|------|------|
| React 19+ | 언급 (`React 19 + TypeScript`) | 일치 | 다이어그램 노드에 버전 명시 |
| TypeScript | 언급 | 일치 | |
| Zustand | 언급 (`Zustand · TanStack Query`) | 일치 | |
| TanStack Query | 언급 | 일치 | |
| Node.js + Express | 언급 (`Node.js + Express`) | 일치 | |
| PostgreSQL 17 | 언급 (`PostgreSQL 17`) | 일치 | 버전 포함 명시 |
| pg / Raw SQL | 언급 (`pg Raw SQL`, 레포지토리 노드) | 일치 | |
| JWT | 언급 (`JWT 인증 미들웨어`, `JWT Bearer Token`, `JWT Access Token`) | 일치 | |
| bcrypt | 언급 (시퀀스 다이어그램: `bcrypt.compare`) | 일치 | |
| OAuth | 미언급 | 해당없음 | 1차 아키텍처 범위 밖 |
| 768px 반응형 | 미언급 | 해당없음 | 아키텍처 다이어그램 범위 밖 |
| 300명 동시접속 | 미언급 | 해당없음 | 동일 |

**판정 요약**: 기술 스택 명칭 및 버전 모두 PRD와 완전히 일치. 검토 대상 6개 파일 중 기술 스택 표기 일관성이 가장 우수한 문서.

---

### 2.6 `99-uc.md` — 유스케이스 다이어그램

| 기술 항목 | 언급 여부 | 판정 | 비고 |
|----------|----------|------|------|
| React 19+ / TypeScript | 미언급 | 해당없음 | UC 다이어그램은 기능 범위 기술 문서 |
| Zustand / TanStack Query | 미언급 | 해당없음 | 동일 |
| Node.js + Express | 미언급 | 해당없음 | 동일 |
| PostgreSQL 17 | 미언급 | 해당없음 | 동일 |
| pg / Raw SQL | 미언급 | 해당없음 | 동일 |
| JWT | 언급 (액터 정의: "JWT 토큰으로 인증된 사용자") | 일치 | |
| bcrypt | 미언급 | 해당없음 | UC 다이어그램 범위 밖 |
| OAuth | 미언급 | 해당없음 | 1차 기능 아님 |

**판정 요약**: 언급된 JWT 표기 일치. 유스케이스 다이어그램 성격상 기술 스택 미언급은 정상.

---

## 3. 불일치 / 누락 항목 상세

### [문제 1] `4-project-principles.md` — React 버전 미기재

- **파일**: `4-project-principles.md`
- **위치**: 섹션 2.1 레이어 다이어그램, 섹션 6 프론트엔드 디렉토리 구조 전체
- **현황**: `React` 또는 `.tsx` 파일 확장자로만 언급. "React 19+" 버전 명시 없음
- **PRD 기준**: `React 19+`
- **심각도**: 낮음 (버전 누락이나 기술 자체는 일관성 유지)
- **권장 조치**: 섹션 2.1 레이어 다이어그램의 `[Client / Browser]` 설명 또는 섹션 6 도입부에 `React 19+ + TypeScript` 버전 명시 추가

---

### [문제 2] `4-project-principles.md` — PostgreSQL 버전 미기재

- **파일**: `4-project-principles.md`
- **위치**: 섹션 2.1 레이어 다이어그램 (`[PostgreSQL]`), 섹션 4.3 (`테스트용 PostgreSQL DB`)
- **현황**: `PostgreSQL`로만 표기. 버전 "17" 미기재
- **PRD 기준**: `PostgreSQL 17`
- **심각도**: 낮음 (DB 종류는 일치, 버전만 누락)
- **권장 조치**: 섹션 2.1 다이어그램 및 섹션 4.3의 PostgreSQL 표기를 `PostgreSQL 17`로 통일

---

### [문제 3] `4-project-principles.md` — zod 라이브러리 추가 기재 (PRD 미기재 항목)

- **파일**: `4-project-principles.md`
- **위치**: 섹션 7 백엔드 디렉토리 구조 (`validate.middleware.ts` 주석: "zod 스키마 기반"), 섹션 5.1 (`env.config.ts` 주석: "환경 변수 검증(zod)")
- **현황**: `zod`가 입력 유효성 검사 및 환경 변수 검증 도구로 명시됨
- **PRD 기준**: PRD에 zod 언급 없음
- **심각도**: 낮음 (PRD와 충돌 없음. Express REST API 구현 시 표준적 선택)
- **권장 조치**: PRD 6.1 기술 스택 표에 `zod` 항목 추가하거나, 설계 원칙 문서에 PRD 미기재 라이브러리임을 명시하는 주석 추가 (선택 사항)

---

### [참고] 불일치 아님 — `4-project-principles.md`의 JWT Refresh Token 패턴

- **위치**: 섹션 5.2 JWT 토큰 보안 원칙
- **내용**: PRD에는 "JWT (Bearer Token)"만 명시. 설계 원칙 문서는 Access Token(15분) + Refresh Token(7일) 이중 토큰 패턴과 Silent Refresh 구현을 상세 정의
- **판정**: 충돌 아님. PRD 9장 가정 사항에 "리프레시 토큰은 1차 선택 사항"으로 명시됨. 설계 원칙 문서가 이를 구체화한 것으로 해석 가능
- **권장 조치**: PRD 6.1 기술 스택 표 비고에 "Refresh Token 패턴 설계 원칙 문서 참조" 메모 추가 권장

---

### [참고] 불일치 아님 — `3-user-scenario.md` 시나리오 9의 "기본 카테고리 포함 삭제" 표현

- **위치**: `3-user-scenario.md` 시나리오 9 결과 섹션
- **내용**: "모든 카테고리(기본 포함)가 데이터베이스에서 즉시 완전 삭제된다"
- **PRD 기준**: PRD UC-09는 "Todo, Category(Custom), User 데이터를 CASCADE DELETE"로 기술. Custom Category만 명시
- **판정**: 미세한 표현 불일치. 기본 카테고리는 `user_id = NULL`이므로 특정 사용자 탈퇴 CASCADE DELETE 시 실제로는 삭제되지 않음
- **심각도**: 중간 (독자에게 잘못된 동작 기대를 형성할 수 있음)
- **권장 조치**: `3-user-scenario.md` 시나리오 9 결과를 "기본 카테고리는 시스템 공유 데이터이므로 유지"로 수정 권장

---

## 4. 종합 판정

### 4.1 전체 일관성 점수

| 평가 항목 | 점수 | 근거 |
|----------|------|------|
| 기술명 표기 일관성 | 5 / 5 | 6개 파일 전체에서 "React Query"나 "Postgres"와 같은 비표준 표기 없음. 모든 문서가 PRD 표기("TanStack Query", "PostgreSQL", "Zustand", "bcrypt", "JWT") 준수 |
| 버전 일관성 | 4 / 5 | `5-arch-diagram.md`는 완벽. `4-project-principles.md`에서 React 19+, PostgreSQL 17 버전 누락 (-1) |
| 누락 여부 | 4 / 5 | 문서 성격에 맞게 기술 스택이 언급됨. `3-user-scenario.md` 시나리오 9의 CASCADE DELETE 범위 표현이 PRD와 미세하게 다름 (-1) |
| 충돌 여부 | 5 / 5 | 어떤 문서에도 PRD 기준과 정면 충돌하는 기술 기재 없음 (ORM 사용, 다른 DB 언급 등 없음) |
| **종합** | **4.5 / 5** | |

### 4.2 수정 필요 항목 우선순위

| 우선순위 | 파일 | 수정 항목 | 심각도 |
|---------|------|----------|--------|
| P1 (즉시 수정 권장) | `3-user-scenario.md` | 시나리오 9 결과: 기본 카테고리 삭제 여부 표현 수정 | 중간 — 기능 오해 유발 가능 |
| P2 (다음 버전 반영) | `4-project-principles.md` | PostgreSQL 17 버전 명시 (섹션 2.1, 4.3) | 낮음 — 버전 추적 일관성 |
| P2 (다음 버전 반영) | `4-project-principles.md` | React 19+ 버전 명시 (섹션 2.1 또는 6 도입부) | 낮음 — 버전 추적 일관성 |
| P3 (선택 개선) | `2-prd.md` 또는 `4-project-principles.md` | zod 라이브러리 공식 기재 여부 결정 | 낮음 — 관리 대상 명확화 |
| P3 (선택 개선) | `2-prd.md` | Refresh Token 패턴을 기술 스택 표 또는 비고에 명시 | 낮음 — 설계 의사결정 추적 |

---

### 4.3 긍정적 발견 사항

- 6개 문서 전체에서 "React Query" (구 명칭) 대신 "TanStack Query"를 일관되게 사용하고 있어 최신 표기 기준을 준수함
- ORM 금지 및 pg Raw SQL 원칙이 PRD, 설계 원칙, 아키텍처 다이어그램 세 문서에 걸쳐 일관되게 반복 강조됨
- bcrypt 표기가 모든 관련 문서에서 소문자 일관 표기로 통일됨
- `5-arch-diagram.md`는 프론트엔드(React 19), 백엔드(Node.js + Express), DB(PostgreSQL 17), 연동(pg Raw SQL), 인증(JWT), 암호화(bcrypt) 모두 PRD 기준 표기와 완전히 일치하는 기준 다이어그램 역할을 충실히 수행함
