# TodoListApp — 실행계획

> 버전: 1.0.0 | 작성일: 2026-05-13 | 기준 문서: 2-prd.md v1.1, 4-project-principles.md, 6-erd.md

---

## 개요

전체 구현을 **데이터베이스 → 백엔드 → 프론트엔드** 3단계로 분리하며, 각 단계 내 독립 Task는 병렬 수행이 가능하다.  
의존성이 있는 Task는 선행 Task 완료 후 착수한다.

---

## 범례

| 기호 | 의미 |
|------|------|
| `[ ]` | 미완료 |
| `[x]` | 완료 |
| `depends:` | 선행 완료 필요 Task ID |

---

## Phase 1 — Database

### DB-01: PostgreSQL 환경 설정

> 개발 환경에서 PostgreSQL 17 인스턴스를 준비하고 연결을 검증한다.

> **[결정사항]** Docker 없이 로컬 머신에 PostgreSQL 17을 직접 설치하는 방식을 채택함.
> PostgreSQL 17.9 (Windows x86_64) 설치 및 기동 완료 확인.

**작업 목록**
- [x] 로컬 머신에 PostgreSQL 17 직접 설치 및 기동 (PostgreSQL 17.9 확인)
- [x] `.env` 파일에 접속 정보 기재 (`POSTGRES_CONNECTION_STRING` 설정 완료)
- [x] MCP를 통한 로컬 DB 접속 확인
- [x] 개발용 DB 생성 (`todolist_dev`)

**완료 조건**
- [x] `SELECT version();` 결과가 PostgreSQL 17.x 반환 → **PostgreSQL 17.9 확인**
- [x] `todolist_dev` DB 접속 성공

**접속 정보** (`.env` 기준)
```
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/todolist_dev
```

**의존성**: 없음

---

### DB-02: 스키마 적용 및 시드 데이터 확인

> `database/schema.sql`을 실행하여 테이블과 기본 카테고리 시드 데이터를 적용한다.

**작업 목록**
- [x] `database/schema.sql` 파일 작성 완료
- [x] `todolist_dev` DB에 스키마 적용 완료 (MCP 통해 직접 실행)
- [x] 시드 데이터(업무/개인/기타) 정상 삽입 확인

**완료 조건**
- [x] `users`, `categories`, `todos` 3개 테이블 존재 확인
- [x] `SELECT * FROM categories WHERE is_default = true;` 결과 3행 반환
- [x] 기본 카테고리 `user_id` 전부 NULL 확인

**의존성**: `depends: DB-01`

---

## Phase 2 — Backend

### BE-01: 프로젝트 초기화 및 디렉토리 구조 생성

> Node.js + Express (JavaScript) 기반 백엔드 프로젝트 골격을 생성한다.

**작업 목록**
- [x] `backend/` 디렉토리 생성 및 `npm init -y`
- [x] 패키지 설치: `express`, `pg`, `jsonwebtoken`, `bcrypt`, `dotenv`, `cors`
- [x] 개발 의존성: `nodemon`
- [x] 디렉토리 구조 생성:
  ```
  backend/src/
  ├── routes/
  ├── controllers/
  ├── services/
  ├── repositories/
  ├── middlewares/
  ├── db/
  ├── config/
  ├── errors/
  └── utils/
  ```
- [x] `package.json` scripts 설정 (`dev`, `start`)
- [x] `.env.example` 파일 작성 (DB, JWT_SECRET, PORT)

**완료 조건**
- [x] `npm run dev` 실행 시 서버 기동 성공 (예: `Listening on port 3000`)
- [x] `GET /api/health` → `200 OK` 응답 확인 (Jest + Supertest 4/4 통과)

**의존성**: 없음

---

### BE-02: DB 연결 및 설정 모듈

> `pg.Pool`을 이용한 데이터베이스 연결 풀을 설정하고, 환경 변수 검증 로직을 추가한다.

**작업 목록**
- [x] `backend/src/db/pool.js` — `pg.Pool` 인스턴스 생성 및 export
- [x] `backend/src/config/env.config.js` — 필수 환경 변수 검증 (없으면 프로세스 종료)
- [x] DB 연결 실패 시 에러 로그 출력 및 종료 처리

**완료 조건**
- [x] 서버 기동 시 `DB connected` 로그 출력
- [x] 잘못된 DB URL로 실행 시 명확한 에러 메시지와 함께 종료

**의존성**: `depends: BE-01, DB-02`

---

### BE-03: 공통 유틸리티 및 에러 클래스 정의

> HTTP 에러 클래스, 응답 헬퍼, JWT/bcrypt 유틸리티를 구현한다.

**작업 목록**
- [x] `backend/src/errors/AppError.js` — 베이스 에러 클래스 + `BadRequestError(400)`, `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)`, `ConflictError(409)` 정의
- [x] `backend/src/utils/jwt.utils.js` — `signToken(payload)`, `verifyToken(token)` 함수 (만료 1시간)
- [x] `backend/src/utils/password.utils.js` — `hashPassword(plain)`, `comparePassword(plain, hash)` 함수 (salt rounds 12)
- [x] `backend/src/utils/response.utils.js` — 성공/에러 응답 표준 포맷 헬퍼

**완료 조건**
- [x] `AppError` 인스턴스가 `instanceof AppError` 판별 가능
- [x] `signToken` + `verifyToken` 왕복 테스트 통과
- [x] `hashPassword` + `comparePassword` 왕복 테스트 통과

**의존성**: `depends: BE-01`

---

### BE-04: 공통 미들웨어 구현

> JWT 인증 미들웨어, 에러 핸들러, 요청 로깅 미들웨어를 구현한다.

**작업 목록**
- [x] `backend/src/middlewares/authenticate.js` — `Authorization: Bearer <token>` 추출 → `verifyToken` → `req.user` 주입; 실패 시 `UnauthorizedError`
- [x] `backend/src/middlewares/errorHandler.js` — `AppError`는 statusCode 사용, 그 외는 500 반환; 프로덕션에서 스택 트레이스 제외
- [x] `backend/src/middlewares/requestLogger.js` — `[METHOD] /path → statusCode` 구조화 로그 출력
- [x] `app.js`에 전역 미들웨어 등록 (`cors`, `json`, requestLogger, errorHandler)

**완료 조건**
- [x] 유효한 JWT 없이 보호된 엔드포인트 요청 시 `401 Unauthorized` 반환
- [x] 존재하지 않는 라우트 요청 시 `404 Not Found` 반환
- [x] 처리되지 않은 에러 발생 시 `500 Internal Server Error` 반환 (스택 트레이스 미포함)

**의존성**: `depends: BE-03`

---

### BE-05: 인증 API (Auth)

> 회원가입, 로그인, 로그아웃, 회원 탈퇴 API를 구현한다.

**작업 목록**

**Repository (`repositories/authRepository.js`)**
- [x] `findByEmail(email)`, `findById(userId)` — users 테이블 조회
- [x] `createUser(email, hashedPassword, name)` — INSERT 후 생성된 row 반환
- [x] `deleteUser(userId)` — users 테이블 삭제 (CASCADE DELETE 자동 처리)

**Service (`services/authService.js`)**
- [x] `signup`, `login`, `logout`, `deleteAccount` — BR-01~BR-03 완전 구현

**Controller (`controllers/authController.js`)**
- [x] `POST /api/auth/signup` — `201 Created`
- [x] `POST /api/auth/login` — `200 OK` + `{ accessToken, user }`
- [x] `POST /api/auth/logout` — `200 OK`
- [x] `DELETE /api/auth/account` — `200 OK`

**Routes (`routes/authRouter.js`)**
- [x] 4개 엔드포인트 등록, `/logout`, `/account`에 `authenticate` 적용

**완료 조건**
- [x] `POST /api/auth/signup` 정상 요청 → `201` + 사용자 데이터 반환
- [x] 중복 이메일 가입 시 `409 Conflict` 반환
- [x] 잘못된 비밀번호 형식 가입 시 `400 Bad Request` 반환
- [x] `POST /api/auth/login` 정상 요청 → `200` + accessToken 반환
- [x] 비밀번호 불일치 로그인 → `401 Unauthorized` 반환
- [x] `DELETE /api/auth/account` 정상 요청 → `200 OK`, DB에서 사용자 삭제 확인

**의존성**: `depends: BE-02, BE-03, BE-04`

---

### BE-06: 카테고리 API (Categories)

> 카테고리 목록 조회, 생성, 수정, 삭제 API를 구현한다.

**작업 목록**

**Repository (`repositories/categoryRepository.js`)**
- [x] `findAllByUser`, `findById`, `create`, `update`, `deleteById`, `countTodosByCategory`

**Service (`services/categoryService.js`)**
- [x] `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` — BR-08~BR-11 완전 구현

**Controller (`controllers/categoryController.js`)**
- [x] `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`

**Routes (`routes/categoryRouter.js`)**
- [x] 전체 엔드포인트에 `authenticate` 적용

**완료 조건**
- [x] `GET /api/categories` → 기본 3개 + 사용자 정의 카테고리 반환
- [x] 기본 카테고리(is_default=true) 수정/삭제 시 `403 Forbidden` 반환
- [x] 타인 카테고리 수정/삭제 시 `403 Forbidden` 반환
- [x] 할일이 있는 카테고리 삭제 시 `400 Bad Request` 반환
- [x] 동일 사용자 내 카테고리명 중복 생성 시 `409 Conflict` 반환

**의존성**: `depends: BE-04, BE-05`

---

### BE-07: 할일 API (Todos)

> 할일 등록, 목록 조회(필터링), 단건 조회, 수정, 삭제 API를 구현한다.

**작업 목록**

**Repository (`repositories/todoRepository.js`)**
- [x] `findAllByUser(userId, filters)` — 동적 WHERE절 parameterized query (AND 필터)
- [x] `findById`, `create`, `update(동적 SET절)`, `deleteById`

**Service (`services/todoService.js`)**
- [x] `getTodos`, `getTodoById`, `createTodo`, `updateTodo`, `deleteTodo` — BR-04~BR-07 완전 구현

**Controller (`controllers/todoController.js`)**
- [x] 5개 엔드포인트 (isCompleted string→boolean 변환 포함)

**Routes (`routes/todoRouter.js`)**
- [x] 전체 엔드포인트에 `authenticate` 적용

**완료 조건**
- [x] `GET /api/todos?isCompleted=false` → 미완료 할일만 반환
- [x] `GET /api/todos?categoryId=<uuid>&dueDateFrom=2026-05-01&dueDateTo=2026-05-31` → AND 필터 적용된 결과 반환
- [x] 타인 할일 조회/수정/삭제 시 `403 Forbidden` 반환
- [x] 존재하지 않는 할일 요청 시 `404 Not Found` 반환
- [x] `isCompleted` 완료 → 미완료 토글 가능 (BR-07)
- [x] 카테고리 없이 할일 생성 시 `400 Bad Request` 반환

**의존성**: `depends: BE-04, BE-06`

---

### BE-08: 사용자 정보 수정 API (Users)

> 이름 및 비밀번호 수정 API를 구현한다.

**작업 목록**

**Repository (`repositories/userRepository.js`)**
- [x] `findById`, `updateName`, `updatePassword`

**Service (`services/userService.js`)**
- [x] `updateProfile` — 이름/비밀번호 수정, 현재 비밀번호 확인, 형식 검증

**Controller (`controllers/userController.js`)**
- [x] `PATCH /api/users/me` — `200 OK` + 수정된 사용자 정보

**Routes (`routes/userRouter.js`)**
- [x] `authenticate` 적용

**완료 조건**
- [x] `PATCH /api/users/me` 이름 변경 → `200 OK`, DB 반영 확인
- [x] 현재 비밀번호 불일치 시 `401 Unauthorized` 반환
- [x] 새 비밀번호 형식 불량 시 `400 Bad Request` 반환
- [x] `PATCH /api/users/me` 비밀번호 변경 후 새 비밀번호로 로그인 성공

**의존성**: `depends: BE-04, BE-05`

---

### BE-09: 백엔드 통합 검증

> 전체 백엔드 API를 통합하여 end-to-end 흐름을 검증한다.

**작업 목록**
- [x] Supertest 통합 테스트로 전체 API 시나리오 검증 (pg pool mock)
- [x] CORS 설정 확인 (corsOrigin 환경 변수 기반)
- [x] 환경 변수 누락 시 명확한 에러 출력 확인 (env.config.js)
- [x] `GET /api/health` 엔드포인트 확인

**완료 조건**
- [x] 회원가입 → 로그인 → 카테고리 생성 → 할일 CRUD → 회원 탈퇴 전체 흐름 오류 없이 통과
- [x] 인증 없이 보호 API 접근 시 모두 `401` 반환
- [x] 타인 리소스 접근 시 모두 `403` 반환
- [x] 존재하지 않는 리소스 접근 시 `404` 반환

**의존성**: `depends: BE-05, BE-06, BE-07, BE-08`

---

## Phase 3 — Frontend

### FE-01: 프로젝트 초기화 및 환경 설정

> Vite + React 19 + TypeScript 기반 프론트엔드 프로젝트를 생성한다.

**작업 목록**
- [x] `npm create vite@latest frontend -- --template react-ts` (Vite 8.0.12 + React 19.2.6 + TS 6.0.3)
- [x] 패키지 설치: `axios`, `react-router-dom`, `zustand`, `@tanstack/react-query` (최신 버전)
- [x] 디렉토리 구조 생성:
  ```
  frontend/src/
  ├── pages/
  ├── components/
  ├── layouts/
  ├── stores/
  ├── queries/
  ├── mutations/
  ├── api/
  ├── hooks/
  ├── types/
  ├── constants/
  └── utils/
  ```
- [x] `.env` 파일: `VITE_API_BASE_URL=http://localhost:3000/api` 설정 (+ `.env.example`)
- [x] ESLint + Prettier 설정 (eslint-config-prettier 통합)
- [x] `tsconfig.app.json` strict mode 활성화

**완료 조건**
- [x] `npm run dev` 실행 시 http://localhost:5173 HTTP 200 응답 확인
- [x] TypeScript 컴파일 오류 없음 (`npm run build` 성공)

**의존성**: 없음

---

### FE-02: 공통 타입, 상수, API 레이어 설정

> TypeScript 타입 정의, axios 인스턴스(JWT 인터셉터), 공통 상수를 설정한다.

**작업 목록**
- [x] `types/user.types.ts` — `User`, `LoginRequest`, `LoginResponse`, `SignupRequest`, `UpdateProfileRequest`, `DeleteAccountRequest`
- [x] `types/todo.types.ts` — `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoFilters`
- [x] `types/category.types.ts` — `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest`
- [x] `types/api.types.ts` — `ApiSuccessResponse<T>`, `ApiErrorResponse`, `MessageResponse`
- [x] `api/axiosInstance.ts` — baseURL, Authorization 요청 인터셉터, 401(TOKEN_MISSING/TOKEN_INVALID) → clearAuth + `/login` 리다이렉트 (PASSWORD_MISMATCH는 제외)
- [x] `api/auth.api.ts` — signup, login, logout, deleteAccount
- [x] `api/todos.api.ts` — getTodos, getTodoById, createTodo, updateTodo, deleteTodo
- [x] `api/categories.api.ts` — getCategories, createCategory, updateCategory, deleteCategory
- [x] `api/users.api.ts` — updateProfile
- [x] `constants/index.ts` — QUERY_KEYS, ROUTES
- [x] `utils/getErrorCode.ts` — axios 에러에서 백엔드 code/message 추출
- [x] `stores/authStore.ts` — 인터셉터에서 사용하는 최소 구현 (FE-03에서 확장)

**완료 조건**
- [x] 모든 API 함수 TypeScript 타입 완전 적용 (any 없음, `tsc -b` 통과)
- [x] axios 인터셉터에서 토큰 자동 주입 동작 확인 (vitest 단위 테스트)
- [x] `401` 응답 시 로그인 페이지 리다이렉트 동작 확인 (vitest 6/6 통과)

**의존성**: `depends: FE-01`

---

### FE-03: Zustand 상태 관리 스토어 설정

> 인증 상태(JWT 토큰 + 사용자 정보)를 Zustand 메모리에 보관하는 스토어를 구현한다.

**작업 목록**
- [x] `stores/authStore.ts`:
  - 상태: `accessToken: string | null`, `user: User | null`, `isAuthenticated: boolean`
  - 액션: `setAuth(token, user)`, `clearAuth()`, `updateUser(partial)`
  - **localStorage/Cookie 저장 금지** — 메모리(JavaScript 변수)에만 보관
- [x] `stores/uiStore.ts`:
  - 상태: `isSidebarOpen: boolean`, `activeFilter: TodoFilters`
  - 액션: `toggleSidebar()`, `setSidebarOpen(open)`, `setFilter(filters)`, `resetFilter()`

**완료 조건**
- [x] 페이지 새로고침 시 `accessToken`이 `null`로 초기화됨 (persist 미사용 확인)
- [x] `setAuth` 호출 후 `isAuthenticated`가 `true` 반환
- [x] `clearAuth` 호출 후 `accessToken`, `user` 모두 `null` (vitest 11/11 통과)

**의존성**: `depends: FE-02`

---

### FE-04: 라우팅 및 레이아웃 설정

> React Router 기반 라우팅, 인증 가드, 공통 레이아웃을 구현한다.

**작업 목록**
- [x] `layouts/AppLayout.tsx` — 헤더(dark) + 사이드바(PC 고정 / 모바일 오버레이) + `<Outlet />`
- [x] `layouts/AuthLayout.tsx` — 중앙 정렬, 인증 상태면 `/`로 리다이렉트
- [x] `components/ProtectedRoute.tsx` — `isAuthenticated` false 시 `/login` 리다이렉트
- [x] `App.tsx` 라우터 설정:
  - `/login`, `/signup` → AuthLayout
  - `/`, `/categories`, `/profile` → ProtectedRoute + AppLayout
  - `*` → `/` 리다이렉트
- [x] `TanStackQueryProvider` 및 `QueryClient` 설정 (retry 1, staleTime 30s)
- [x] `index.css` — 스타일 가이드 CSS 변수 전체 적용

**완료 조건**
- [x] 비인증 상태에서 `/` 접근 시 `/login`으로 이동 (vitest 확인)
- [x] 인증 후 `/login` 접근 시 `/`로 이동 (AuthLayout Navigate 처리)
- [x] PC(768px+): 사이드바 2단 레이아웃, 모바일: 햄버거 메뉴 + 오버레이 사이드바

**의존성**: `depends: FE-03`

---

### FE-05: 인증 페이지 구현 (로그인 / 회원가입)

> 로그인 페이지, 회원가입 페이지, 관련 TanStack Query mutation을 구현한다.

**작업 목록**
- [x] `mutations/useLoginMutation.ts` — login API 호출, 성공 시 setAuth + `/` 이동
- [x] `mutations/useSignupMutation.ts` — signup API 호출, 성공 시 `/login` 이동
- [x] `pages/LoginPage.tsx` — 이메일/비밀번호 폼, 에러 메시지(원인 미노출), 회원가입 링크
- [x] `pages/SignupPage.tsx` — 이름/이메일/비밀번호/비밀번호확인 폼, 클라이언트 검증, 서버 에러 처리
- [x] `components/common/Button.tsx` + `Input.tsx` — 공통 컴포넌트 (variant/size/error 지원)
- [x] `utils/validation.ts` — validatePassword, validateEmail

**완료 조건**
- [x] 정상 로그인 시 `/` 이동 및 사용자 정보 표시
- [x] 잘못된 자격 증명 로그인 시 에러 메시지 표시 (vitest 확인)
- [x] 정상 회원가입 시 `/login` 이동
- [x] 중복 이메일 회원가입 시 에러 메시지 표시 (vitest 확인)
- [x] 비밀번호 형식 불량 시 클라이언트 측 즉시 에러 표시 (vitest 확인)

**의존성**: `depends: FE-04`

---

### FE-06: 카테고리 기능 구현

> 카테고리 목록 조회, 생성, 수정, 삭제 UI 및 비즈니스 로직을 구현한다.

**작업 목록**
- [x] `queries/useCategoriesQuery.ts` — GET /api/categories
- [x] `mutations/useCreateCategoryMutation.ts` — 생성 후 categories 캐시 무효화
- [x] `mutations/useUpdateCategoryMutation.ts` — 수정 후 캐시 무효화
- [x] `mutations/useDeleteCategoryMutation.ts` — 삭제 후 캐시 무효화
- [x] `components/CategoryList.tsx` — 기본/사용자 정의 구분, 생성 폼 토글
- [x] `components/CategoryItem.tsx` — 수정/삭제 버튼 (기본 카테고리 비활성화, 인라인 수정 폼)
- [x] `components/CategoryForm.tsx` — 생성/수정 공용 폼
- [x] `pages/CategoriesPage.tsx` — 실제 구현 (로딩/에러 처리 포함)
- [x] `layouts/AppLayout.tsx` — 사이드바에 카테고리 목록 표시

**완료 조건**
- [x] 카테고리 목록에 기본/사용자 정의 카테고리 표시 (vitest 확인)
- [x] 기본 카테고리 수정/삭제 버튼 비활성화 (vitest 확인)
- [x] 카테고리 생성 후 목록 즉시 갱신 (캐시 무효화)
- [x] 할일이 있는 카테고리 삭제 시 에러 메시지 표시 (vitest 확인)
- [x] 중복 카테고리명 생성 시 에러 메시지 표시 (vitest 확인)

**의존성**: `depends: FE-05`

---

### FE-07: 할일 목록 및 필터링 구현

> 할일 목록 조회, 필터(카테고리/완료여부/기간) UI를 구현한다.

**작업 목록**
- [x] `queries/useTodosQuery.ts` — `GET /api/todos` 조회, `TodoFilters` 파라미터 적용
- [x] `components/TodoList.tsx` — 할일 카드 목록, 빈 상태 표시
- [x] `components/TodoCard.tsx` — 제목, 카테고리, 종료예정일, 완료 여부 표시
- [x] `components/FilterPanel.tsx` — 카테고리 선택 / 완료 여부 토글 / 기간 선택 (AND 조합)
- [x] `stores/uiStore.ts` 필터 상태 연동 (카테고리 클릭 시 필터 적용)
- [x] `pages/TodoListPage.tsx` — FilterPanel + TodoList 조합

**완료 조건**
- [x] 할일 목록 정상 렌더링 (vitest 확인)
- [x] 카테고리 필터 적용 시 해당 카테고리 할일만 표시 (URL ?categoryId 파라미터 → uiStore 연동)
- [x] 완료 여부 필터 작동 확인 (vitest 확인)
- [x] 기간 필터(dueDateFrom~dueDateTo) 적용 시 결과 필터링 (FilterPanel date input 연동)
- [x] 필터 조합(AND) 정상 작동 (uiStore activeFilter → useTodosQuery params)
- [x] 할일이 없을 때 빈 상태 UI 표시 (필터 여부에 따라 메시지 분기)

**의존성**: `depends: FE-06`

---

### FE-08: 할일 CRUD 구현

> 할일 등록, 수정, 완료 토글, 삭제 기능을 구현한다.

**작업 목록**
- [x] `mutations/useCreateTodoMutation.ts` — 생성 성공 시 todos 캐시 무효화
- [x] `mutations/useUpdateTodoMutation.ts` — 수정 성공 시 캐시 무효화
- [x] `mutations/useDeleteTodoMutation.ts` — 삭제 성공 시 캐시 무효화
- [x] `mutations/useToggleTodoMutation.ts` — `isCompleted` 토글 전용
- [x] `components/TodoForm.tsx` — 제목(필수), 설명, 종료예정일, 카테고리(필수) 입력 폼 (등록/수정 공용)
- [x] `components/TodoDetail.tsx` — 등록/수정 공용 모달 (오버레이 + 닫기)
- [x] 완료 체크박스 클릭 → `useToggleTodoMutation` 호출 (TodoListPage 연결)

**완료 조건**
- [x] 할일 등록 폼에서 제목 미입력 시 제출 불가 (제출 시 검증 + 에러 메시지)
- [x] 카테고리 미선택 시 제출 불가 (제출 시 검증 + 에러 메시지)
- [x] 할일 등록 성공 시 목록에 즉시 반영 (todos 캐시 무효화)
- [x] 완료 체크박스 클릭 시 완료 ↔ 미완료 양방향 토글 동작 (vitest 확인)
- [x] 할일 수정 성공 시 변경 내용 즉시 반영 (캐시 무효화)
- [x] 할일 삭제 후 목록에서 즉시 제거 (캐시 무효화)
- [x] 타인 할일 수정/삭제 불가 (TodoDetail 403 에러 메시지 처리)

**의존성**: `depends: FE-07`

---

### FE-09: 사용자 프로필 및 회원 탈퇴 구현

> 이름/비밀번호 수정, 로그아웃, 회원 탈퇴 기능을 구현한다.

**작업 목록**
- [x] `mutations/useUpdateProfileMutation.ts` — 이름/비밀번호 수정
- [x] `mutations/useDeleteAccountMutation.ts` — 회원 탈퇴, 성공 시 `clearAuth` + `/login` 이동
- [x] `mutations/useLogoutMutation.ts` — `POST /api/auth/logout` 호출 + `clearAuth` + `/login` 이동
- [x] `pages/ProfilePage.tsx`:
  - 이름 수정 폼
  - 비밀번호 변경 폼 (현재 비밀번호 확인 후 새 비밀번호)
  - 로그아웃 버튼 (AppLayout 헤더에서 처리)
  - 회원 탈퇴 섹션 (비밀번호 재입력 확인 모달)

**완료 조건**
- [x] 이름 변경 성공 시 UI 즉시 반영
- [x] 현재 비밀번호 불일치 시 에러 메시지 표시
- [x] 새 비밀번호 형식 불량 시 클라이언트 측 에러 표시
- [x] 로그아웃 후 Zustand 토큰 초기화 및 `/login` 이동 확인
- [x] 회원 탈퇴 확인 모달 표시 후 탈퇴 성공 시 `/login` 이동
- [x] 탈퇴 후 기존 JWT로 API 요청 시 `401` 반환

**의존성**: `depends: FE-05`

---

### FE-10: 반응형 UI 및 공통 컴포넌트 완성

> 768px 브레이크포인트 기반 반응형 레이아웃과 공통 UI 컴포넌트를 완성한다.

**작업 목록**
- [x] `components/common/Button.tsx` — variant(primary/secondary/danger), loading 상태 지원
- [x] `components/common/Input.tsx` — 에러 메시지 표시, 레이블 포함
- [x] `components/common/Modal.tsx` — 확인 다이얼로그 공용
- [x] `components/common/LoadingSpinner.tsx` — 로딩 상태 표시
- [x] `components/common/ErrorMessage.tsx` — API 에러 표시
- [x] PC(768px+): 좌측 사이드바(카테고리 + 네비게이션) + 우측 메인 영역 2단 레이아웃
- [x] 모바일(768px 미만): 단일 컬럼 + 하단 고정 할일 등록 버튼
- [x] CSS 반응형 미디어 쿼리 적용

**완료 조건**
- [x] 768px 이상: 사이드바 표시, 2단 레이아웃 렌더링
- [x] 768px 미만: 사이드바 숨김, 단일 컬럼 레이아웃 렌더링
- [x] 로딩 중 LoadingSpinner 표시
- [x] API 에러 발생 시 ErrorMessage 표시
- [x] 삭제/탈퇴 등 위험 동작 시 Modal 확인 다이얼로그 표시

**의존성**: `depends: FE-08, FE-09`

---

### FE-11: 프론트엔드 통합 검증

> 전체 사용자 시나리오를 브라우저에서 end-to-end로 검증한다.

**작업 목록**
- [ ] 시나리오 1: 신규 사용자 회원가입 → 로그인
- [ ] 시나리오 2: 로그인 후 AND 필터 조합 할일 조회
- [ ] 시나리오 3: 모바일 뷰포트에서 할일 등록 + 카테고리 생성
- [ ] 시나리오 4: 완료 처리 + 로그아웃
- [ ] 시나리오 5: 완료된 할일 미완료로 되돌리기
- [ ] 시나리오 6: 할일 삭제
- [ ] 시나리오 7: 카테고리 생성/수정/삭제 (기본 카테고리 수정 불가 확인)
- [ ] 시나리오 8: 비밀번호 변경
- [ ] 시나리오 9: 회원 탈퇴 (데이터 전체 삭제 확인)
- [ ] 시나리오 10: 언어 설정 변경 (한국어 ↔ 영어) — i18n 동작 확인
- [ ] 페이지 새로고침 시 로그인 화면 이동 확인 (JWT 메모리 초기화)
- [ ] 날짜 입력 필터 placeholder 언어별 표시 확인

**완료 조건**
- [ ] 10개 사용자 시나리오 전부 오류 없이 통과
- [ ] PC / 모바일 뷰포트 모두 레이아웃 정상
- [ ] 네트워크 에러 시 사용자 친화적 메시지 표시
- [ ] 브라우저 개발자 도구 콘솔에 에러 없음
- [ ] 언어 변경 후 기본 카테고리명도 동시에 변환됨

**의존성**: `depends: FE-10, BE-09`

---

### FE-12: i18n 다국어 지원 구현

> 다국어 지원 기능을 전체 애플리케이션에 통합한다.

**작업 목록**

**라이브러리 및 초기화**
- [x] `react-i18next` 패키지 설치
- [x] `frontend/src/i18n.ts` 파일 생성 — i18next 초기화, 리소스 로드(ko.json, en.json), 기본 언어 'ko' 설정
- [x] `main.tsx`에 `import './i18n'` 추가 (모든 컴포넌트 로드 전 i18n 초기화)

**번역 파일**
- [x] `frontend/src/locales/ko.json` — 한국어 번역 (모든 UI 텍스트 포함)
- [x] `frontend/src/locales/en.json` — 영어 번역 (모든 UI 텍스트 포함)
- [x] 기본 카테고리명 i18n 키: `category.defaultNames.work`, `category.defaultNames.personal`, `category.defaultNames.etc`
- [x] 날짜 필터 placeholder: `filter.datePlaceholder` (한국어 "년-월-일", 영어 "YYYY-MM-DD")

**프론트엔드 통합**
- [x] `useTranslation()` hook을 모든 컴포넌트에서 사용하여 텍스트 렌더링
- [x] `FilterPanel.tsx`, `TodoForm.tsx`: `type="date"` → `type="text"` + `inputMode="numeric"` + `placeholder={t('filter.datePlaceholder')}`
- [x] `getCategoryDisplayName(category, t)` 유틸 함수 구현 — 기본 카테고리 이름을 i18n 번역으로 변환
- [x] `useToggleLanguageMutation.ts` — 언어 설정 변경 시 `PATCH /api/users/me` 호출

**백엔드 통합**
- [x] `userRepository.js`: `updateLanguage()` 함수 추가, 모든 RETURNING 절에 `language` 포함
- [x] `userService.js`: `language` 필드 처리 및 응답에 포함
- [x] `authService.js`: 로그인 응답에 `language: user.language ?? 'ko'` 포함
- [x] `userController.js`: 요청 body에서 `language` 필드 추출

**데이터베이스**
- [x] `database/schema.sql`: `users` 테이블에 `language VARCHAR(10) NOT NULL DEFAULT 'ko'` 컬럼 추가

**완료 조건**
- [x] 모든 UI 텍스트가 `t()` 함수로 i18n 키 기반 렌더링
- [x] 로그인 시 저장된 사용자 언어 설정이 프론트엔드에 전달되고 UI 변환
- [x] 언어 설정 변경 후 즉시 전체 UI 한국어 ↔ 영어 전환
- [x] 기본 카테고리 이름도 언어 변경 시 함께 변환됨
- [x] 회원가입 시 기본값 'ko' 저장
- [x] 날짜 입력 필터 placeholder가 언어별로 다르게 표시

**의존성**: `depends: FE-04, BE-08`

---

## 전체 의존성 요약

```
DB-01
  └─ DB-02
       └─ BE-02

BE-01
  └─ BE-02 (+ DB-02)
  └─ BE-03
       └─ BE-04
            ├─ BE-05 ──────────────┐
            ├─ BE-06 (+ BE-05) ───┤
            ├─ BE-07 (+ BE-06) ───┤
            └─ BE-08 (+ BE-05) ───┤
                                   └─ BE-09

FE-01
  └─ FE-02
       └─ FE-03
            └─ FE-04
                 ├─ FE-05
                 │    ├─ FE-06
                 │    │    └─ FE-07
                 │    │         └─ FE-08
                 │    │              └─ FE-10
                 │    │                   └─ FE-11 (+ BE-09)
                 │    └─ FE-09
                 └─ FE-12 (i18n) (+ FE-04, BE-08)
```

---

## 작업 현황 요약

| Phase | Task | 상태 |
|-------|------|------|
| Database | DB-01 | ✅ 완료 |
| Database | DB-02 | ✅ 완료 |
| Backend | BE-01 | ✅ 완료 — 프로젝트 초기화, health 엔드포인트 |
| Backend | BE-02 | ✅ 완료 — pg.Pool, connectPool |
| Backend | BE-03 | ✅ 완료 — AppError, jwt/bcrypt/response 유틸 |
| Backend | BE-04 | ✅ 완료 — authenticate, errorHandler, requestLogger |
| Backend | BE-05 | ✅ 완료 — Auth API (signup/login/logout/deleteAccount) |
| Backend | BE-06 | ✅ 완료 — Categories API |
| Backend | BE-07 | ✅ 완료 — Todos API (동적 필터링) |
| Backend | BE-08 | ✅ 완료 — Users API (프로필 수정) |
| Backend | BE-09 | ✅ 완료 — 전체 통합 테스트 111/111 통과 |
| Frontend | FE-01 | ✅ 완료 — Vite 8 + React 19 + TS 6 strict, ESLint+Prettier, 디렉토리 구조 |
| Frontend | FE-02 | ✅ 완료 — 타입/상수/API 레이어, axios 인터셉터(vitest 6/6 통과) |
| Frontend | FE-03 | ✅ 완료 — authStore + uiStore (vitest 11/11 통과) |
| Frontend | FE-04 | ✅ 완료 — 라우터/레이아웃/ProtectedRoute/CSS변수 (vitest 20/20 통과) |
| Frontend | FE-05 | ✅ 완료 — 로그인/회원가입 페이지, 공통 Button/Input (vitest 36/36 통과) |
| Frontend | FE-06 | ✅ 완료 — 카테고리 CRUD, CategoryList/Item/Form, 사이드바 연동 (vitest 44/44 통과) |
| Frontend | FE-07 | ✅ 완료 — 할일 목록/필터링, TodoCard/TodoList/FilterPanel (vitest 80/80 통과) |
| Frontend | FE-08 | ✅ 완료 — 할일 CRUD mutations, TodoForm/TodoDetail 모달, 토글 (vitest 103/103 통과) |
| Frontend | FE-09 | ✅ 완료 — ProfilePage, useUpdateProfileMutation/useDeleteAccountMutation/useLogoutMutation (vitest 19/19 통과) |
| Frontend | FE-10 | ✅ 완료 — Modal/LoadingSpinner/ErrorMessage 컴포넌트, 반응형 CSS, 삭제 확인 모달 (vitest 130/130 통과) |
| Frontend | FE-11 | ⬜ 미완료 |
| Frontend | FE-12 | ✅ 완료 — i18n 다국어 지원 (ko/en), react-i18next, useToggleLanguageMutation, 기본 카테고리 i18n 처리 |
