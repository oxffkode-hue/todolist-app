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

**작업 목록**
- [ ] Docker Compose 또는 로컬 PostgreSQL 17 설치 및 기동
- [ ] 개발용 DB 생성 (`todolist_dev`)
- [ ] `.env` 파일에 `DATABASE_URL` 등 접속 정보 기재
- [ ] `psql` 또는 DBeaver 등으로 접속 확인

**완료 조건**
- [ ] `psql -U <user> -d todolist_dev` 접속 성공
- [ ] `SELECT version();` 결과가 PostgreSQL 17.x 반환

**의존성**: 없음

---

### DB-02: 스키마 적용 및 시드 데이터 확인

> `database/schema.sql`을 실행하여 테이블과 기본 카테고리 시드 데이터를 적용한다.

**작업 목록**
- [x] `database/schema.sql` 파일 작성 완료
- [ ] `psql -d todolist_dev -f database/schema.sql` 실행
- [ ] 시드 데이터(업무/개인/기타) 정상 삽입 확인

**완료 조건**
- [ ] `\dt` 명령으로 `users`, `categories`, `todos` 3개 테이블 존재 확인
- [ ] `SELECT * FROM categories WHERE is_default = true;` 결과 3행 반환
- [ ] `SELECT user_id FROM categories WHERE is_default = true;` 결과 전부 NULL

**의존성**: `depends: DB-01`

---

## Phase 2 — Backend

### BE-01: 프로젝트 초기화 및 디렉토리 구조 생성

> Node.js + Express + TypeScript 기반 백엔드 프로젝트 골격을 생성한다.

**작업 목록**
- [ ] `backend/` 디렉토리 생성 및 `npm init -y`
- [ ] 패키지 설치: `express`, `pg`, `jsonwebtoken`, `bcrypt`, `dotenv`, `cors`
- [ ] 개발 의존성: `typescript`, `ts-node`, `nodemon`, `@types/*`
- [ ] `tsconfig.json` 설정 (strict mode, ES2022 target)
- [ ] 디렉토리 구조 생성:
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
  ├── types/
  └── utils/
  ```
- [ ] `package.json` scripts 설정 (`dev`, `build`, `start`)
- [ ] `.env.example` 파일 작성 (DB, JWT_SECRET, PORT)

**완료 조건**
- [ ] `npm run dev` 실행 시 서버 기동 성공 (예: `Listening on port 3000`)
- [ ] `GET /api/health` → `200 OK` 응답 확인

**의존성**: 없음

---

### BE-02: DB 연결 및 설정 모듈

> `pg.Pool`을 이용한 데이터베이스 연결 풀을 설정하고, 환경 변수 검증 로직을 추가한다.

**작업 목록**
- [ ] `backend/src/db/pool.ts` — `pg.Pool` 인스턴스 생성 및 export
- [ ] `backend/src/config/env.ts` — 필수 환경 변수 검증 (없으면 프로세스 종료)
- [ ] DB 연결 실패 시 에러 로그 출력 및 종료 처리

**완료 조건**
- [ ] 서버 기동 시 `DB connected` 로그 출력
- [ ] 잘못된 DB URL로 실행 시 명확한 에러 메시지와 함께 종료

**의존성**: `depends: BE-01, DB-02`

---

### BE-03: 공통 유틸리티 및 에러 클래스 정의

> HTTP 에러 클래스, 응답 헬퍼, JWT/bcrypt 유틸리티를 구현한다.

**작업 목록**
- [ ] `backend/src/errors/AppError.ts` — 베이스 에러 클래스 (statusCode, message, code)
- [ ] `backend/src/errors/index.ts` — `BadRequestError(400)`, `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)`, `ConflictError(409)` 정의
- [ ] `backend/src/utils/jwt.ts` — `signToken(payload)`, `verifyToken(token)` 함수 (만료 1시간)
- [ ] `backend/src/utils/bcrypt.ts` — `hashPassword(plain)`, `comparePassword(plain, hash)` 함수 (salt rounds 12)
- [ ] `backend/src/utils/response.ts` — 성공 응답 표준 포맷 헬퍼 (`{ data, message }`)

**완료 조건**
- [ ] `AppError` 인스턴스가 `instanceof AppError` 판별 가능
- [ ] `signToken` + `verifyToken` 왕복 테스트 통과
- [ ] `hashPassword` + `comparePassword` 왕복 테스트 통과

**의존성**: `depends: BE-01`

---

### BE-04: 공통 미들웨어 구현

> JWT 인증 미들웨어, 에러 핸들러, 요청 로깅 미들웨어를 구현한다.

**작업 목록**
- [ ] `backend/src/middlewares/auth.ts` — `Authorization: Bearer <token>` 추출 → `verifyToken` → `req.user` 주입; 실패 시 `UnauthorizedError`
- [ ] `backend/src/middlewares/errorHandler.ts` — `AppError`는 statusCode 사용, 그 외는 500 반환; 프로덕션에서 스택 트레이스 제외
- [ ] `backend/src/middlewares/requestLogger.ts` — `[METHOD] /path → statusCode` 구조화 로그 출력
- [ ] `app.ts`에 전역 미들웨어 등록 (`cors`, `json`, requestLogger, routes, errorHandler)

**완료 조건**
- [ ] 유효한 JWT 없이 보호된 엔드포인트 요청 시 `401 Unauthorized` 반환
- [ ] 존재하지 않는 라우트 요청 시 `404 Not Found` 반환
- [ ] 처리되지 않은 에러 발생 시 `500 Internal Server Error` 반환 (스택 트레이스 미포함)

**의존성**: `depends: BE-03`

---

### BE-05: 인증 API (Auth)

> 회원가입, 로그인, 로그아웃, 회원 탈퇴 API를 구현한다.

**작업 목록**

**Repository (`repositories/authRepository.ts`)**
- [ ] `findByEmail(email)` — users 테이블 조회
- [ ] `createUser(email, hashedPassword, name)` — INSERT 후 생성된 row 반환
- [ ] `deleteUser(userId)` — users 테이블 삭제 (CASCADE DELETE 자동 처리)

**Service (`services/authService.ts`)**
- [ ] `signup(email, password, name)`:
  - 이메일 중복 체크 → `ConflictError` (BR-01)
  - 비밀번호 형식 검증: 8자 이상, 영문+숫자 조합 필수 (BR-02)
  - `hashPassword` 적용 후 저장
- [ ] `login(email, password)`:
  - 이메일 없음 또는 비밀번호 불일치 → `UnauthorizedError` (BR-03, 구체적 원인 미노출)
  - `signToken({ userId, email })` 반환
- [ ] `logout()` — 서버에서는 무동작 (토큰은 클라이언트가 삭제)
- [ ] `deleteAccount(userId, password)`:
  - 비밀번호 재확인 → `UnauthorizedError`
  - `deleteUser(userId)` 호출

**Controller (`controllers/authController.ts`)**
- [ ] `POST /api/auth/signup` — `201 Created` + 생성된 사용자 정보
- [ ] `POST /api/auth/login` — `200 OK` + `{ accessToken }`
- [ ] `POST /api/auth/logout` — `200 OK`
- [ ] `DELETE /api/auth/account` — `200 OK` (JWT 인증 필요)

**Routes (`routes/authRouter.ts`)**
- [ ] 위 4개 엔드포인트 라우터 등록
- [ ] `/api/auth/account`에 `authMiddleware` 적용

**완료 조건**
- [ ] `POST /api/auth/signup` 정상 요청 → `201` + 사용자 데이터 반환
- [ ] 중복 이메일 가입 시 `409 Conflict` 반환
- [ ] 잘못된 비밀번호 형식 가입 시 `400 Bad Request` 반환
- [ ] `POST /api/auth/login` 정상 요청 → `200` + accessToken 반환
- [ ] 비밀번호 불일치 로그인 → `401 Unauthorized` 반환
- [ ] `DELETE /api/auth/account` 정상 요청 → `200 OK`, DB에서 사용자 삭제 확인

**의존성**: `depends: BE-02, BE-03, BE-04`

---

### BE-06: 카테고리 API (Categories)

> 카테고리 목록 조회, 생성, 수정, 삭제 API를 구현한다.

**작업 목록**

**Repository (`repositories/categoryRepository.ts`)**
- [ ] `findAllByUser(userId)` — 기본 카테고리(`user_id IS NULL`) + 해당 사용자 카테고리 조회
- [ ] `findById(categoryId)` — 단일 카테고리 조회
- [ ] `create(userId, name)` — INSERT 후 생성된 row 반환
- [ ] `update(categoryId, name)` — UPDATE 후 수정된 row 반환
- [ ] `delete(categoryId)` — DELETE

**Service (`services/categoryService.ts`)**
- [ ] `getCategories(userId)` — Repository 위임
- [ ] `createCategory(userId, name)`:
  - 동일 사용자 내 카테고리명 중복 체크 → `ConflictError` (BR-10)
- [ ] `updateCategory(userId, categoryId, name)`:
  - 기본 카테고리 수정 불가 → `ForbiddenError` (BR-08)
  - 본인 소유 확인 → `ForbiddenError` (BR-09)
  - 카테고리명 중복 체크 (BR-10)
- [ ] `deleteCategory(userId, categoryId)`:
  - 기본 카테고리 삭제 불가 → `ForbiddenError` (BR-08)
  - 본인 소유 확인 → `ForbiddenError` (BR-09)
  - 해당 카테고리에 할일이 존재하면 삭제 불가 → `BadRequestError` (BR-11)

**Controller (`controllers/categoryController.ts`)**
- [ ] `GET /api/categories` — `200 OK` + categories 배열
- [ ] `POST /api/categories` — `201 Created` + 생성된 category
- [ ] `PATCH /api/categories/:id` — `200 OK` + 수정된 category
- [ ] `DELETE /api/categories/:id` — `200 OK`

**Routes (`routes/categoryRouter.ts`)**
- [ ] 전체 엔드포인트에 `authMiddleware` 적용

**완료 조건**
- [ ] `GET /api/categories` → 기본 3개 + 사용자 정의 카테고리 반환
- [ ] 기본 카테고리(is_default=true) 수정/삭제 시 `403 Forbidden` 반환
- [ ] 타인 카테고리 수정/삭제 시 `403 Forbidden` 반환
- [ ] 할일이 있는 카테고리 삭제 시 `400 Bad Request` 반환
- [ ] 동일 사용자 내 카테고리명 중복 생성 시 `409 Conflict` 반환

**의존성**: `depends: BE-04, BE-05`

---

### BE-07: 할일 API (Todos)

> 할일 등록, 목록 조회(필터링), 단건 조회, 수정, 삭제 API를 구현한다.

**작업 목록**

**Repository (`repositories/todoRepository.ts`)**
- [ ] `findAllByUser(userId, filters)` — 카테고리ID / isCompleted / dueDate 범위 AND 필터 지원 (동적 WHERE 절 parameterized query)
- [ ] `findById(todoId)` — 단일 할일 조회
- [ ] `create(userId, categoryId, title, description, dueDate)` — INSERT 후 생성된 row 반환
- [ ] `update(todoId, fields)` — 부분 업데이트(PATCH), `updatedAt` 자동 갱신
- [ ] `delete(todoId)` — DELETE

**Service (`services/todoService.ts`)**
- [ ] `getTodos(userId, filters)` — Repository 위임 (BR-12, BR-13)
- [ ] `getTodoById(userId, todoId)`:
  - 존재 확인 → `NotFoundError`
  - 본인 소유 확인 → `ForbiddenError` (BR-06)
- [ ] `createTodo(userId, data)`:
  - 제목 필수 확인 (BR-04)
  - 카테고리 존재 및 접근 권한 확인 (BR-05)
- [ ] `updateTodo(userId, todoId, data)`:
  - 존재 확인, 본인 소유 확인 (BR-06)
  - `isCompleted` 양방향 토글 허용 (BR-07)
  - 카테고리 변경 시 카테고리 존재 확인
- [ ] `deleteTodo(userId, todoId)`:
  - 존재 확인, 본인 소유 확인 (BR-06)

**Controller (`controllers/todoController.ts`)**
- [ ] `GET /api/todos` — `200 OK` + todos 배열 (쿼리 파라미터: `categoryId`, `isCompleted`, `dueDateFrom`, `dueDateTo`)
- [ ] `POST /api/todos` — `201 Created` + 생성된 todo
- [ ] `GET /api/todos/:id` — `200 OK` + 단일 todo
- [ ] `PATCH /api/todos/:id` — `200 OK` + 수정된 todo
- [ ] `DELETE /api/todos/:id` — `200 OK`

**Routes (`routes/todoRouter.ts`)**
- [ ] 전체 엔드포인트에 `authMiddleware` 적용

**완료 조건**
- [ ] `GET /api/todos?isCompleted=false` → 미완료 할일만 반환
- [ ] `GET /api/todos?categoryId=<uuid>&dueDateFrom=2026-05-01&dueDateTo=2026-05-31` → AND 필터 적용된 결과 반환
- [ ] 타인 할일 조회/수정/삭제 시 `403 Forbidden` 반환
- [ ] 존재하지 않는 할일 요청 시 `404 Not Found` 반환
- [ ] `isCompleted` 완료 → 미완료 토글 가능 (BR-07)
- [ ] 카테고리 없이 할일 생성 시 `400 Bad Request` 반환

**의존성**: `depends: BE-04, BE-06`

---

### BE-08: 사용자 정보 수정 API (Users)

> 이름 및 비밀번호 수정 API를 구현한다.

**작업 목록**

**Repository (`repositories/userRepository.ts`)**
- [ ] `findById(userId)` — 사용자 단건 조회
- [ ] `updateName(userId, name)` — 이름 수정
- [ ] `updatePassword(userId, hashedPassword)` — 비밀번호 수정

**Service (`services/userService.ts`)**
- [ ] `updateProfile(userId, data)`:
  - `name` 수정 시: 빈 문자열 불가 (`BadRequestError`)
  - `password` 수정 시: 현재 비밀번호 확인 → 불일치 시 `UnauthorizedError`; 새 비밀번호 형식 검증; `hashPassword` 적용 (BR-02)

**Controller (`controllers/userController.ts`)**
- [ ] `PATCH /api/users/me` — `200 OK` + 수정된 사용자 정보

**Routes (`routes/userRouter.ts`)**
- [ ] `authMiddleware` 적용

**완료 조건**
- [ ] `PATCH /api/users/me` 이름 변경 → `200 OK`, DB 반영 확인
- [ ] 현재 비밀번호 불일치 시 `401 Unauthorized` 반환
- [ ] 새 비밀번호 형식 불량 시 `400 Bad Request` 반환
- [ ] `PATCH /api/users/me` 비밀번호 변경 후 새 비밀번호로 로그인 성공

**의존성**: `depends: BE-04, BE-05`

---

### BE-09: 백엔드 통합 검증

> 전체 백엔드 API를 통합하여 end-to-end 흐름을 검증한다.

**작업 목록**
- [ ] Postman / HTTP 파일로 전체 API 시나리오 테스트 스크립트 작성
- [ ] CORS 설정 확인 (프론트엔드 origin 허용)
- [ ] 환경 변수 누락 시 명확한 에러 출력 확인
- [ ] `GET /api/health` 엔드포인트 확인

**완료 조건**
- [ ] 회원가입 → 로그인 → 카테고리 생성 → 할일 CRUD → 회원 탈퇴 전체 흐름 오류 없이 통과
- [ ] 인증 없이 보호 API 접근 시 모두 `401` 반환
- [ ] 타인 리소스 접근 시 모두 `403` 반환
- [ ] 존재하지 않는 리소스 접근 시 `404` 반환

**의존성**: `depends: BE-05, BE-06, BE-07, BE-08`

---

## Phase 3 — Frontend

### FE-01: 프로젝트 초기화 및 환경 설정

> Vite + React 19 + TypeScript 기반 프론트엔드 프로젝트를 생성한다.

**작업 목록**
- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] 패키지 설치: `axios`, `react-router-dom`, `zustand`, `@tanstack/react-query`
- [ ] 디렉토리 구조 생성:
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
- [ ] `.env` 파일: `VITE_API_BASE_URL` 설정
- [ ] ESLint + Prettier 설정
- [ ] `tsconfig.json` strict mode 활성화

**완료 조건**
- [ ] `npm run dev` 실행 시 브라우저에서 기본 페이지 렌더링 성공
- [ ] TypeScript 컴파일 오류 없음

**의존성**: 없음

---

### FE-02: 공통 타입, 상수, API 레이어 설정

> TypeScript 타입 정의, axios 인스턴스(JWT 인터셉터), 공통 상수를 설정한다.

**작업 목록**
- [ ] `types/user.types.ts` — `User`, `LoginRequest`, `SignupRequest`
- [ ] `types/todo.types.ts` — `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoFilters`
- [ ] `types/category.types.ts` — `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest`
- [ ] `api/axiosInstance.ts` — baseURL 설정, `Authorization: Bearer <token>` 요청 인터셉터, `401` 응답 시 authStore 초기화 + 로그인 페이지 이동
- [ ] `api/auth.api.ts` — signup, login, logout, deleteAccount 함수
- [ ] `api/todos.api.ts` — getTodos, getTodoById, createTodo, updateTodo, deleteTodo 함수
- [ ] `api/categories.api.ts` — getCategories, createCategory, updateCategory, deleteCategory 함수
- [ ] `api/users.api.ts` — updateProfile 함수
- [ ] `constants/index.ts` — QUERY_KEYS, ROUTES 상수 정의

**완료 조건**
- [ ] 모든 API 함수 TypeScript 타입 완전 적용 (any 없음)
- [ ] axios 인터셉터에서 토큰 자동 주입 동작 확인
- [ ] `401` 응답 시 로그인 페이지 리다이렉트 동작 확인

**의존성**: `depends: FE-01`

---

### FE-03: Zustand 상태 관리 스토어 설정

> 인증 상태(JWT 토큰 + 사용자 정보)를 Zustand 메모리에 보관하는 스토어를 구현한다.

**작업 목록**
- [ ] `stores/authStore.ts`:
  - 상태: `accessToken: string | null`, `user: User | null`, `isAuthenticated: boolean`
  - 액션: `setAuth(token, user)`, `clearAuth()`
  - **localStorage/Cookie 저장 금지** — 메모리(JavaScript 변수)에만 보관
- [ ] `stores/uiStore.ts`:
  - 상태: `isSidebarOpen: boolean`, `activeFilter: TodoFilters`
  - 액션: `toggleSidebar()`, `setFilter(filters)`, `resetFilter()`

**완료 조건**
- [ ] 페이지 새로고침 시 `accessToken`이 `null`로 초기화됨 (의도된 동작)
- [ ] `setAuth` 호출 후 `isAuthenticated`가 `true` 반환
- [ ] `clearAuth` 호출 후 `accessToken`, `user` 모두 `null`

**의존성**: `depends: FE-02`

---

### FE-04: 라우팅 및 레이아웃 설정

> React Router 기반 라우팅, 인증 가드, 공통 레이아웃을 구현한다.

**작업 목록**
- [ ] `layouts/AppLayout.tsx` — 사이드바(PC) + 상단 헤더(모바일) + `<Outlet />` 구성
- [ ] `layouts/AuthLayout.tsx` — 중앙 정렬 인증 페이지 레이아웃
- [ ] `components/ProtectedRoute.tsx` — `isAuthenticated` false 시 `/login`으로 리다이렉트
- [ ] `App.tsx` 라우터 설정:
  - `/login` → `LoginPage` (AuthLayout)
  - `/signup` → `SignupPage` (AuthLayout)
  - `/` → `TodoListPage` (AppLayout, ProtectedRoute)
  - `/profile` → `ProfilePage` (AppLayout, ProtectedRoute)
- [ ] `TanStackQueryProvider` 및 `QueryClient` 설정

**완료 조건**
- [ ] 비인증 상태에서 `/` 접근 시 `/login`으로 이동
- [ ] 인증 후 `/login` 접근 시 `/`로 이동
- [ ] PC(768px+)에서 사이드바 레이아웃 렌더링, 모바일에서 단일 컬럼 레이아웃 렌더링

**의존성**: `depends: FE-03`

---

### FE-05: 인증 페이지 구현 (로그인 / 회원가입)

> 로그인 페이지, 회원가입 페이지, 관련 TanStack Query mutation을 구현한다.

**작업 목록**
- [ ] `mutations/useLoginMutation.ts` — `login` API 호출, 성공 시 `setAuth` 호출 후 `/` 이동
- [ ] `mutations/useSignupMutation.ts` — `signup` API 호출, 성공 시 `/login` 이동
- [ ] `pages/LoginPage.tsx`:
  - 이메일, 비밀번호 입력 폼
  - 에러 메시지 표시 (구체적 원인 미노출 — "이메일 또는 비밀번호가 올바르지 않습니다")
  - 회원가입 페이지 링크
- [ ] `pages/SignupPage.tsx`:
  - 이메일, 비밀번호, 이름 입력 폼
  - 비밀번호 형식 클라이언트 측 검증 (8자+영문+숫자)
  - 에러 메시지 표시 (이메일 중복 등)

**완료 조건**
- [ ] 정상 로그인 시 `/` 이동 및 사용자 정보 표시
- [ ] 잘못된 자격 증명 로그인 시 에러 메시지 표시
- [ ] 정상 회원가입 시 `/login` 이동
- [ ] 중복 이메일 회원가입 시 에러 메시지 표시
- [ ] 비밀번호 형식 불량 시 클라이언트 측 즉시 에러 표시

**의존성**: `depends: FE-04`

---

### FE-06: 카테고리 기능 구현

> 카테고리 목록 조회, 생성, 수정, 삭제 UI 및 비즈니스 로직을 구현한다.

**작업 목록**
- [ ] `queries/useCategoriesQuery.ts` — `GET /api/categories` 조회
- [ ] `mutations/useCreateCategoryMutation.ts` — 생성 성공 시 categories 캐시 무효화
- [ ] `mutations/useUpdateCategoryMutation.ts` — 수정 성공 시 캐시 무효화
- [ ] `mutations/useDeleteCategoryMutation.ts` — 삭제 성공 시 캐시 무효화
- [ ] `components/CategoryList.tsx` — 사이드바 내 카테고리 목록 (기본/사용자 정의 구분)
- [ ] `components/CategoryItem.tsx` — 수정/삭제 버튼 (기본 카테고리는 비활성화)
- [ ] `components/CategoryForm.tsx` — 카테고리명 입력 폼 (생성/수정 공용)

**완료 조건**
- [ ] 카테고리 목록에 기본 3개 + 사용자 정의 카테고리 표시
- [ ] 기본 카테고리 수정/삭제 버튼 비활성화
- [ ] 카테고리 생성 후 목록 즉시 갱신
- [ ] 할일이 있는 카테고리 삭제 시 에러 메시지 표시
- [ ] 중복 카테고리명 생성 시 에러 메시지 표시

**의존성**: `depends: FE-05`

---

### FE-07: 할일 목록 및 필터링 구현

> 할일 목록 조회, 필터(카테고리/완료여부/기간) UI를 구현한다.

**작업 목록**
- [ ] `queries/useTodosQuery.ts` — `GET /api/todos` 조회, `TodoFilters` 파라미터 적용
- [ ] `components/TodoList.tsx` — 할일 카드 목록, 빈 상태 표시
- [ ] `components/TodoCard.tsx` — 제목, 카테고리, 종료예정일, 완료 여부 표시
- [ ] `components/FilterPanel.tsx` — 카테고리 선택 / 완료 여부 토글 / 기간 선택 (AND 조합)
- [ ] `stores/uiStore.ts` 필터 상태 연동 (카테고리 클릭 시 필터 적용)
- [ ] `pages/TodoListPage.tsx` — FilterPanel + TodoList 조합

**완료 조건**
- [ ] 할일 목록 정상 렌더링
- [ ] 카테고리 필터 적용 시 해당 카테고리 할일만 표시
- [ ] 완료 여부 필터 작동 확인
- [ ] 기간 필터(dueDateFrom~dueDateTo) 적용 시 결과 필터링
- [ ] 필터 조합(AND) 정상 작동
- [ ] 할일이 없을 때 빈 상태 UI 표시

**의존성**: `depends: FE-06`

---

### FE-08: 할일 CRUD 구현

> 할일 등록, 수정, 완료 토글, 삭제 기능을 구현한다.

**작업 목록**
- [ ] `mutations/useCreateTodoMutation.ts` — 생성 성공 시 todos 캐시 무효화
- [ ] `mutations/useUpdateTodoMutation.ts` — 수정 성공 시 캐시 무효화
- [ ] `mutations/useDeleteTodoMutation.ts` — 삭제 성공 시 캐시 무효화
- [ ] `mutations/useToggleTodoMutation.ts` — `isCompleted` 토글 전용 (낙관적 업데이트 옵션)
- [ ] `components/TodoForm.tsx` — 제목(필수), 설명, 종료예정일, 카테고리(필수) 입력 폼 (등록/수정 공용)
- [ ] `components/TodoDetail.tsx` — 단건 상세 모달 또는 패널
- [ ] 완료 체크박스 클릭 → `useToggleTodoMutation` 호출

**완료 조건**
- [ ] 할일 등록 폼에서 제목 미입력 시 제출 불가
- [ ] 카테고리 미선택 시 제출 불가
- [ ] 할일 등록 성공 시 목록에 즉시 반영
- [ ] 완료 체크박스 클릭 시 완료 ↔ 미완료 양방향 토글 동작
- [ ] 할일 수정 성공 시 변경 내용 즉시 반영
- [ ] 할일 삭제 후 목록에서 즉시 제거
- [ ] 타인 할일 수정/삭제 불가 (403 에러 처리)

**의존성**: `depends: FE-07`

---

### FE-09: 사용자 프로필 및 회원 탈퇴 구현

> 이름/비밀번호 수정, 로그아웃, 회원 탈퇴 기능을 구현한다.

**작업 목록**
- [ ] `mutations/useUpdateProfileMutation.ts` — 이름/비밀번호 수정
- [ ] `mutations/useDeleteAccountMutation.ts` — 회원 탈퇴, 성공 시 `clearAuth` + `/login` 이동
- [ ] `mutations/useLogoutMutation.ts` — `POST /api/auth/logout` 호출 + `clearAuth` + `/login` 이동
- [ ] `pages/ProfilePage.tsx`:
  - 이름 수정 폼
  - 비밀번호 변경 폼 (현재 비밀번호 확인 후 새 비밀번호)
  - 로그아웃 버튼
  - 회원 탈퇴 섹션 (비밀번호 재입력 확인 모달)

**완료 조건**
- [ ] 이름 변경 성공 시 UI 즉시 반영
- [ ] 현재 비밀번호 불일치 시 에러 메시지 표시
- [ ] 새 비밀번호 형식 불량 시 클라이언트 측 에러 표시
- [ ] 로그아웃 후 Zustand 토큰 초기화 및 `/login` 이동 확인
- [ ] 회원 탈퇴 확인 모달 표시 후 탈퇴 성공 시 `/login` 이동
- [ ] 탈퇴 후 기존 JWT로 API 요청 시 `401` 반환

**의존성**: `depends: FE-05`

---

### FE-10: 반응형 UI 및 공통 컴포넌트 완성

> 768px 브레이크포인트 기반 반응형 레이아웃과 공통 UI 컴포넌트를 완성한다.

**작업 목록**
- [ ] `components/common/Button.tsx` — variant(primary/secondary/danger), loading 상태 지원
- [ ] `components/common/Input.tsx` — 에러 메시지 표시, 레이블 포함
- [ ] `components/common/Modal.tsx` — 확인 다이얼로그 공용
- [ ] `components/common/LoadingSpinner.tsx` — 로딩 상태 표시
- [ ] `components/common/ErrorMessage.tsx` — API 에러 표시
- [ ] PC(768px+): 좌측 사이드바(카테고리 + 네비게이션) + 우측 메인 영역 2단 레이아웃
- [ ] 모바일(768px 미만): 단일 컬럼 + 하단 고정 할일 등록 버튼
- [ ] CSS 반응형 미디어 쿼리 또는 Tailwind CSS breakpoint 적용

**완료 조건**
- [ ] 768px 이상: 사이드바 표시, 2단 레이아웃 렌더링
- [ ] 768px 미만: 사이드바 숨김, 단일 컬럼 레이아웃 렌더링
- [ ] 로딩 중 LoadingSpinner 표시
- [ ] API 에러 발생 시 ErrorMessage 표시
- [ ] 삭제/탈퇴 등 위험 동작 시 Modal 확인 다이얼로그 표시

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
- [ ] 페이지 새로고침 시 로그인 화면 이동 확인 (JWT 메모리 초기화)

**완료 조건**
- [ ] 9개 사용자 시나리오 전부 오류 없이 통과
- [ ] PC / 모바일 뷰포트 모두 레이아웃 정상
- [ ] 네트워크 에러 시 사용자 친화적 메시지 표시
- [ ] 브라우저 개발자 도구 콘솔에 에러 없음

**의존성**: `depends: FE-10, BE-09`

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
                 └─ FE-05
                      ├─ FE-06
                      │    └─ FE-07
                      │         └─ FE-08
                      │              └─ FE-10
                      └─ FE-09        └─ FE-11 (+ BE-09)
```

---

## 작업 현황 요약

| Phase | Task | 상태 |
|-------|------|------|
| Database | DB-01 | [ ] 미완료 |
| Database | DB-02 | [ ] 미완료 (schema.sql 파일은 완성) |
| Backend | BE-01 ~ BE-09 | [ ] 미완료 |
| Frontend | FE-01 ~ FE-11 | [ ] 미완료 |

> `database/schema.sql` 파일은 완성 상태이며 DB-02의 실행 단계만 남아있음.
