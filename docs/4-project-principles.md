# TodoListApp — 프로젝트 구조 설계 원칙

> 버전: 1.0.0 | 작성일: 2026-05-13

---

## 목차

1. [공통 최상위 원칙](#1-공통-최상위-원칙)
2. [의존성 / 레이어 원칙](#2-의존성--레이어-원칙)
3. [코드 / 네이밍 원칙](#3-코드--네이밍-원칙)
4. [테스트 / 품질 원칙](#4-테스트--품질-원칙)
5. [설정 / 보안 / 운영 원칙](#5-설정--보안--운영-원칙)
6. [프론트엔드 디렉토리 구조](#6-프론트엔드-디렉토리-구조)
7. [백엔드 디렉토리 구조](#7-백엔드-디렉토리-구조)

---

## 1. 공통 최상위 원칙

### 1.1 프로젝트 철학

- **단순성 우선**: 기능을 충족하는 가장 단순한 구현을 선택한다. 과도한 추상화, 미래를 위한 선행 설계(YAGNI), 불필요한 패턴 도입을 금지한다.
- **명확성**: 코드는 작성자가 아닌 독자를 위해 작성한다. 의도가 드러나는 이름, 명시적인 흐름, 주석 없이도 읽히는 코드를 지향한다.
- **일관성**: 파일 하나가 아닌 프로젝트 전체가 동일한 패턴을 사용한다. 일관성이 최선의 선택보다 중요하다.
- **최소 결합(Loose Coupling)**: 레이어 간, 모듈 간 의존을 최소화하여 변경이 한 곳에 국한되도록 한다.
- **높은 응집(High Cohesion)**: 같은 이유로 변경되는 코드는 같은 위치에 둔다.

### 1.2 코드 작성의 핵심 가치

1. **가독성 > 성능**: 소규모 프로젝트(동시접속 300명)에서 성능보다 유지보수 가능성을 우선한다. 병목이 측정된 경우에만 최적화한다.
2. **명시적 오류 처리**: 에러를 숨기거나 무시하지 않는다. 모든 예외 경로를 명시적으로 처리한다.
3. **불변성 선호**: 상태 변이(mutation)를 최소화하고 새 값을 반환하는 방식을 선호한다.
4. **순수 함수 우선**: 부수 효과(side effect)는 경계(레이어 진입점, 이벤트 핸들러)로 격리한다.
5. **타입 안전성**: TypeScript strict 모드를 활성화하고 `any` 타입 사용을 금지한다.

### 1.3 변경에 강한 구조를 위한 원칙

- **인터페이스 기반 설계**: 구체 구현이 아닌 계약(interface/type)에 의존한다. DB 드라이버, 외부 서비스는 인터페이스 뒤로 숨긴다.
- **설정의 외부화**: 환경별로 달라지는 값(URL, 포트, 시크릿)은 반드시 환경 변수로 분리한다. 코드에 하드코딩하지 않는다.
- **단일 책임 원칙(SRP)**: 하나의 파일/함수/클래스는 하나의 이유로만 변경된다. 파일이 200줄을 초과하면 분리를 검토한다.
- **의존성 역전**: 상위 레이어(Controller, Service)는 하위 레이어의 구현 세부사항을 알지 않는다.
- **기능 단위 모듈화**: 도메인(auth, todos, categories, users)을 중심으로 코드를 구성하여 기능 추가/제거가 최소 파일 수정으로 가능하도록 한다.

---

## 2. 의존성 / 레이어 원칙

### 2.1 레이어 간 의존 방향 규칙

**의존 방향은 단방향으로 고정한다. 역방향 참조는 순환 의존을 유발하므로 절대 금지한다.**

```
[Client / Browser]
       ↓
[Frontend: Pages → Components]
       ↓
[Frontend: API Layer (axios instance)]
       ↓  HTTP
[Backend: Routes]
       ↓
[Backend: Controllers]
       ↓
[Backend: Services]
       ↓
[Backend: Repositories]
       ↓
[PostgreSQL 17]
```

- 상위 레이어는 바로 아래 레이어만 호출한다. Controller가 Repository를 직접 호출하는 것은 금지한다.
- 공통 유틸리티(utils, constants, types)는 모든 레이어에서 참조 가능하나, 비즈니스 로직을 포함하지 않는다.

### 2.2 프론트엔드 상태 레이어 분리 원칙

**Zustand(클라이언트 상태)와 TanStack Query(서버 상태)는 역할이 명확히 구분되며 서로의 영역을 침범하지 않는다.**

| 구분 | 도구 | 저장 대상 | 예시 |
|------|------|-----------|------|
| 클라이언트 상태 | Zustand | UI 상태, 인증 사용자 정보, 전역 필터 설정 | 로그인 유저 객체, 사이드바 열림 여부, 선택된 카테고리 ID |
| 서버 상태 | TanStack Query | 서버에서 가져온 데이터의 캐시 | todos 목록, categories 목록 |

- **서버 데이터를 Zustand에 복사하지 않는다.** 서버 데이터는 TanStack Query가 단일 진실 공급원(Single Source of Truth)이다.
- **TanStack Query의 캐시 무효화(invalidate)는 mutation 성공 콜백에서만 수행한다.**
- Zustand 스토어는 서버 API를 직접 호출하지 않는다. API 호출은 TanStack Query의 queryFn / mutationFn 내부에서만 수행한다.
- 인증 토큰(JWT Access Token)은 Zustand authStore 메모리에 보관한다. localStorage, sessionStorage, Cookie 저장은 금지한다. (보안 원칙 섹션 참고)

### 2.3 백엔드 레이어별 책임 정의

**Controller (요청/응답 경계)**
- HTTP 요청을 수신하고 응답을 반환하는 유일한 레이어
- 책임: 요청 파라미터 추출, 입력 유효성 검사(validation), Service 호출, HTTP 상태코드 결정, 응답 직렬화
- 금지: 비즈니스 규칙 포함, DB 쿼리 직접 실행, 다른 Controller 호출

**Service (비즈니스 로직)**
- 애플리케이션의 핵심 규칙이 위치하는 레이어
- 책임: 도메인 규칙 적용(기본 카테고리 수정 불가 등), 권한 검사(403 판단), 트랜잭션 조율, 여러 Repository 조합
- 금지: HTTP 요청/응답 객체(req, res) 참조, SQL 쿼리 직접 작성

**Repository (데이터 접근)**
- DB와의 유일한 접점
- 책임: pg를 사용한 Raw SQL 실행, 결과 매핑(snake_case → camelCase), DB 에러를 도메인 에러로 변환
- 금지: 비즈니스 규칙 포함, HTTP 관련 코드, 다른 도메인의 Repository 직접 호출

### 2.4 순환 의존 금지 원칙

- **같은 레이어 내 교차 참조를 금지한다.** (예: TodoService가 CategoryService를 import하고, CategoryService가 TodoService를 import하는 구조 금지)
- 공통 로직이 필요한 경우 `shared` 또는 `common` 모듈로 추출하고, 해당 모듈은 어떤 도메인 모듈도 import하지 않는다.
- ESLint `import/no-cycle` 규칙을 활성화하여 순환 의존을 자동으로 검출한다.

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일명 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | PascalCase | `TodoCard.tsx`, `AuthLayout.tsx` |
| React 페이지 파일 | PascalCase + `Page` 접미사 | `LoginPage.tsx`, `TodoListPage.tsx` |
| 훅 파일 | camelCase + `use` 접두사 | `useAuth.ts`, `useTodoFilter.ts` |
| 스토어 파일 | camelCase + `Store` 접미사 | `authStore.ts`, `uiStore.ts` |
| 서비스/레포지토리/컨트롤러 | camelCase + 역할 접미사 | `todoService.ts`, `todoRepository.ts`, `todoController.ts` |
| 타입 정의 파일 | camelCase + `.types.ts` | `todo.types.ts`, `auth.types.ts` |
| 상수 파일 | camelCase + `.constants.ts` | `http.constants.ts`, `error.constants.ts` |
| 유틸리티 파일 | camelCase + `.utils.ts` | `date.utils.ts`, `jwt.utils.ts` |
| 테스트 파일 | 대상 파일명 + `.test.ts(x)` | `todoService.test.ts`, `TodoCard.test.tsx` |
| 마이그레이션 파일 | `{순번}_{설명}.sql` | `001_create_users.sql` |

### 3.2 변수명 / 함수명 컨벤션

- **변수, 함수, 파라미터**: camelCase (`userId`, `getTodoById`, `isCompleted`)
- **React 컴포넌트**: PascalCase (`TodoCard`, `FilterDropdown`)
- **불리언 변수**: `is`, `has`, `can`, `should` 접두사 사용 (`isLoading`, `hasError`, `canDelete`)
- **이벤트 핸들러**: `handle` 접두사 사용 (`handleSubmit`, `handleDeleteClick`)
- **비동기 함수**: 동사로 시작, 반환 타입을 이름에서 추론 가능하게 (`fetchTodos`, `createTodo`, `deleteCategory`)

### 3.3 DB 컬럼명 ↔ 코드 변수명 변환 기준

**DB는 snake_case, 코드(TypeScript)는 camelCase를 사용한다. 변환은 Repository 레이어 경계에서만 수행한다.**

- DB 컬럼: `user_id`, `is_completed`, `due_date`, `created_at`
- TypeScript 변수: `userId`, `isCompleted`, `dueDate`, `createdAt`
- Repository에서 SELECT 결과를 반환할 때 camelCase로 변환하여 반환한다. Service와 Controller는 항상 camelCase 객체를 다룬다.
- INSERT/UPDATE 시 Repository 내부에서 camelCase → snake_case 매핑을 수행한다.

```typescript
// Repository 내부 변환 예시
function mapRowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

### 3.4 API 엔드포인트 네이밍 규칙 (RESTful)

- **리소스는 복수 명사**를 사용한다.
- **동사를 URL에 포함하지 않는다.** HTTP 메서드가 동사 역할을 한다.
- **계층 관계는 경로로 표현**하되 2단계를 초과하지 않는다.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| DELETE | `/api/auth/account` | 회원탈퇴 |
| GET | `/api/todos` | 할일 목록 (쿼리 파라미터로 필터) |
| POST | `/api/todos` | 할일 등록 |
| GET | `/api/todos/:id` | 할일 단건 조회 |
| PATCH | `/api/todos/:id` | 할일 부분 수정 |
| DELETE | `/api/todos/:id` | 할일 삭제 |
| GET | `/api/categories` | 카테고리 목록 |
| POST | `/api/categories` | 카테고리 등록 |
| PATCH | `/api/categories/:id` | 카테고리 수정 |
| DELETE | `/api/categories/:id` | 카테고리 삭제 |
| PATCH | `/api/users/me` | 개인정보 수정 |

- 버전 관리: 현재는 `/api` prefix만 사용. 하위 호환 불가 변경 발생 시 `/api/v2`로 확장한다.
- 필터 파라미터: 쿼리 스트링 사용 (`GET /api/todos?categoryId=uuid&isCompleted=false&dueDate=2026-05-13`)

### 3.5 TypeScript 타입 / 인터페이스 네이밍 규칙

- **도메인 엔티티 타입**: PascalCase, 명사 (`Todo`, `Category`, `User`)
- **요청 DTO**: PascalCase + `Request` 접미사 (`CreateTodoRequest`, `LoginRequest`)
- **응답 DTO**: PascalCase + `Response` 접미사 (`TodoResponse`, `AuthResponse`)
- **인터페이스**: PascalCase, `I` 접두사 금지 (`TodoRepository`, `AuthService`)
- **유니온/교차 타입**: PascalCase (`TodoFilterParams`, `SortOrder`)
- **열거형**: PascalCase, 값은 UPPER_SNAKE_CASE (`enum TodoStatus { NOT_STARTED, IN_PROGRESS, COMPLETED }`)
- **제네릭 타입 파라미터**: 단일 대문자 또는 의미있는 PascalCase (`T`, `TData`, `TError`)
- **API 응답 래퍼**: `ApiResponse<T>`, `PaginatedResponse<T>` 형태

### 3.6 상수 네이밍 규칙

- **파일 내 상수**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_PAGE_SIZE`)
- **객체형 상수 (enum-like)**: PascalCase 객체 + UPPER_SNAKE_CASE 키

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  FORBIDDEN_RESOURCE: 'FORBIDDEN_RESOURCE',
} as const;
```

---

## 4. 테스트 / 품질 원칙

### 4.1 테스트 전략

**테스트는 비즈니스 가치가 높은 순서대로 우선순위를 둔다.**

| 레벨 | 도구 | 범위 | 목표 커버리지 |
|------|------|------|--------------|
| 단위 테스트 | Jest / Vitest | 순수 함수, Service 비즈니스 로직, 유틸리티 | 80% 이상 |
| 통합 테스트 | Supertest + 테스트 DB | API 엔드포인트 전체 흐름 (Controller → Repository → DB) | 주요 유스케이스 100% |
| E2E 테스트 | Playwright | 핵심 사용자 시나리오 (로그인, 할일 CRUD) | UC별 핵심 경로 |

### 4.2 프론트엔드 테스트 원칙

- **컴포넌트 테스트**: React Testing Library를 사용하여 DOM 동작 기준으로 테스트한다. 내부 구현(state, props)이 아닌 사용자 행동(클릭, 입력, 렌더링 결과)을 검증한다.
- **커스텀 훅 테스트**: `renderHook`을 사용하여 훅의 반환값과 상태 변화를 검증한다.
- **TanStack Query 테스트**: `QueryClientProvider`와 `msw`(Mock Service Worker)를 사용하여 실제 네트워크 요청 없이 테스트한다.
- **Zustand 스토어 테스트**: 스토어 액션 호출 후 상태 변화를 단위 테스트로 검증한다.
- **스냅샷 테스트 금지**: UI 변경에 취약한 스냅샷 테스트는 사용하지 않는다.

### 4.3 백엔드 테스트 원칙 (pg Raw SQL 특성 반영)

- **Service 단위 테스트**: Repository를 mock으로 대체하여 비즈니스 로직만 순수하게 검증한다. pg 연결 불필요.
- **Repository 통합 테스트**: 실제 테스트용 PostgreSQL DB(Docker)에 연결하여 SQL 쿼리의 정확성을 검증한다. 각 테스트 전후로 트랜잭션을 롤백하여 격리를 보장한다.
- **Controller 통합 테스트**: Supertest로 실제 Express 앱에 HTTP 요청을 보내 응답 상태코드, 바디, 헤더를 검증한다.
- **SQL Injection 테스트**: 입력 필드에 SQL 특수문자를 포함한 케이스를 테스트하여 parameterized query가 올바르게 동작함을 검증한다.
- **인증 흐름 테스트**: 토큰 없음(401), 만료 토큰(401), 타인 리소스 접근(403) 케이스를 반드시 테스트한다.

### 4.4 수락 기준(AC) 기반 테스트 작성 원칙

- **테스트 설명은 유스케이스의 AC를 그대로 반영한다.** `describe`는 기능/유스케이스, `it`은 AC 문장으로 작성한다.
- 테스트 케이스는 Happy Path(정상), Edge Case(경계), Failure Path(실패) 세 가지를 모두 포함한다.

```typescript
describe('UC-04: 할일 등록', () => {
  it('유효한 요청 시 201과 생성된 할일을 반환한다', async () => { ... });
  it('title이 빈 문자열이면 400을 반환한다', async () => { ... });
  it('존재하지 않는 categoryId이면 404를 반환한다', async () => { ... });
  it('인증 토큰이 없으면 401을 반환한다', async () => { ... });
});
```

### 4.5 코드 품질 도구 설정 원칙

**ESLint**
- TypeScript strict 규칙 적용 (`@typescript-eslint/recommended-type-checked`)
- `no-console`: warn (개발 중 허용, 프로덕션 빌드에서 오류)
- `import/no-cycle`: error (순환 의존 검출)
- `@typescript-eslint/no-explicit-any`: error

**Prettier**
- 모든 파일에 동일하게 적용 (탭 크기: 2, 세미콜론: true, 작은따옴표: true, 줄 길이: 100)
- ESLint와 충돌 방지: `eslint-config-prettier` 사용

**기타**
- `husky` + `lint-staged`: 커밋 전 ESLint, Prettier, 타입 검사 자동 실행
- CI 파이프라인에서 테스트 실패 시 병합(merge) 차단

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경 변수 관리 원칙

**민감 정보는 절대 코드에 하드코딩하지 않는다. 모든 환경 의존 값은 환경 변수로 관리한다.**

```
.env                  # 로컬 개발 (git 추적 제외)
.env.test             # 테스트 환경 (git 추적 제외)
.env.example          # 필요한 키 목록 템플릿 (git 추적, 값은 빈 문자열)
```

환경 변수 분류 기준:
- **애플리케이션 설정**: `PORT`, `NODE_ENV`, `API_BASE_URL`
- **DB 연결**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **JWT 시크릿**: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- **bcrypt**: `BCRYPT_SALT_ROUNDS`
- **CORS**: `CORS_ORIGIN`

시작 시 유효성 검사: 서버 시작 시 필수 환경 변수가 모두 존재하는지 검증하고, 누락 시 즉시 프로세스를 종료한다.

### 5.2 JWT 토큰 보안 원칙

- **Access Token 저장**: Zustand authStore 메모리(JavaScript 변수)에만 보관한다. `localStorage`, `sessionStorage`, Cookie 저장 금지 (XSS / CSRF 취약점).
- **Refresh Token**: 미사용. 페이지 새로고침 또는 탭 종료 시 토큰이 소멸되며 재로그인이 필요하다.
- **Access Token 만료**: 1시간 (`1h`). 페이지를 닫지 않는 일반 사용 세션에서 재로그인 빈도를 최소화한다.
- **로그아웃**: Zustand authStore의 토큰과 사용자 정보를 초기화한다. 서버에 별도 요청 불필요 (Stateless JWT).
- **페이지 새로고침 처리**: 새로고침 시 Zustand 메모리가 초기화되므로 로그인 화면으로 이동한다. 이는 의도된 동작이다.
- **JWT Payload**: `userId`, `email`만 포함한다. 비밀번호 등 민감 정보는 절대 포함하지 않는다.
- **알고리즘**: HS256 사용. 시크릿은 최소 256비트 이상의 무작위 값을 사용한다.

### 5.3 bcrypt 설정 원칙

- **Salt Rounds**: 기본값 `12` 사용 (환경 변수 `BCRYPT_SALT_ROUNDS`로 관리)
- 비교 시 타이밍 공격 방지를 위해 반드시 `bcrypt.compare()`를 사용한다. 직접 문자열 비교 금지.
- 비밀번호는 **반드시 Service 레이어**에서 해시화한 후 Repository로 전달한다. Repository는 평문 비밀번호를 받지 않는다.
- 비밀번호 최소 요구사항: 최소 8자, 영문+숫자 조합 (입력 유효성 검사 시 강제).

### 5.4 SQL Injection 방어 원칙

**모든 DB 쿼리는 pg의 parameterized query($1, $2, ...)를 사용한다. 문자열 보간(template literal)으로 SQL을 조합하는 것은 절대 금지한다.**

```typescript
// 금지 (SQL Injection 취약)
const query = `SELECT * FROM todos WHERE user_id = '${userId}'`;

// 올바른 방법 (parameterized query)
const query = 'SELECT * FROM todos WHERE user_id = $1';
const result = await pool.query(query, [userId]);
```

- 동적 정렬(ORDER BY) 컬럼 이름은 화이트리스트 배열로 검증 후 사용한다. (컬럼명은 parameterized query 불가)
- ESLint 커스텀 규칙 또는 코드 리뷰 체크리스트로 SQL 보간 패턴을 검출한다.

### 5.5 에러 응답 일관성 원칙

**모든 에러 응답은 동일한 구조를 가진다.**

```json
{
  "status": "error",
  "code": "RESOURCE_NOT_FOUND",
  "message": "요청한 할일을 찾을 수 없습니다.",
  "timestamp": "2026-05-13T00:00:00.000Z"
}
```

HTTP 상태코드 표준화:
| 상황 | 상태코드 |
|------|---------|
| 성공 (조회) | 200 OK |
| 성공 (생성) | 201 Created |
| 성공 (삭제) | 204 No Content |
| 입력 유효성 오류 | 400 Bad Request |
| 미인증 | 401 Unauthorized |
| 권한 없음 | 403 Forbidden |
| 리소스 없음 | 404 Not Found |
| 이메일 중복 등 | 409 Conflict |
| 서버 내부 오류 | 500 Internal Server Error |

- **프로덕션 환경에서 스택 트레이스를 응답에 포함하지 않는다.** 스택 트레이스는 서버 로그에만 기록한다.
- Express 전역 에러 핸들러 미들웨어에서 모든 에러를 통합 처리한다.
- 도메인 에러 클래스(`NotFoundError`, `ForbiddenError`, `ConflictError`)를 정의하여 Service에서 throw하고, 에러 핸들러에서 HTTP 상태코드로 매핑한다.

### 5.6 로깅 원칙

- **구조화 로깅**: JSON 형식으로 로그를 출력한다. `winston` 또는 `pino` 사용.
- **로그 레벨**: `error`(시스템 오류), `warn`(비정상 상황), `info`(주요 이벤트), `debug`(개발용)
- **요청 로그**: 모든 HTTP 요청에 대해 메서드, 경로, 상태코드, 응답시간을 기록한다.
- **에러 로그**: 에러 발생 시 상태코드, 에러 코드, 스택 트레이스를 기록한다.
- **민감 정보 로깅 금지**: 비밀번호, JWT 토큰, 개인정보(이메일 일부 마스킹)는 로그에 포함하지 않는다.
- **상관 ID(Correlation ID)**: 요청마다 고유 ID를 생성하여 요청-응답 추적이 가능하도록 한다.

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/                         # 정적 파일 (favicon, robots.txt)
├── src/
│   ├── main.tsx                    # React 19+ 앱 진입점, QueryClientProvider 설정
│   ├── App.tsx                     # 라우터 설정 및 전역 레이아웃 렌더링
│   │
│   ├── pages/                      # 라우트에 1:1 대응하는 페이지 컴포넌트
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx       # 로그인 페이지 (UC-02)
│   │   │   └── SignupPage.tsx      # 회원가입 페이지 (UC-01)
│   │   ├── todos/
│   │   │   └── TodoListPage.tsx    # 할일 목록 메인 페이지 (UC-05)
│   │   ├── categories/
│   │   │   └── CategoryPage.tsx    # 카테고리 관리 페이지 (UC-08)
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx    # 개인정보 수정 페이지 (UC-03)
│   │   └── NotFoundPage.tsx        # 404 페이지
│   │
│   ├── components/                 # 재사용 가능한 UI 컴포넌트
│   │   ├── common/                 # 도메인 무관 범용 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── todos/                  # 할일 도메인 컴포넌트
│   │   │   ├── TodoCard.tsx        # 할일 카드 단위 컴포넌트
│   │   │   ├── TodoList.tsx        # 할일 목록 렌더링
│   │   │   ├── TodoForm.tsx        # 할일 등록/수정 폼
│   │   │   └── TodoFilterBar.tsx   # 필터 UI
│   │   ├── categories/             # 카테고리 도메인 컴포넌트
│   │   │   ├── CategoryList.tsx
│   │   │   └── CategoryForm.tsx
│   │   └── auth/                   # 인증 도메인 컴포넌트
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   │
│   ├── layouts/                    # 페이지 레이아웃 (공통 헤더/사이드바 포함)
│   │   ├── AppLayout.tsx           # 인증 후 메인 레이아웃 (헤더 + 사이드바)
│   │   ├── AuthLayout.tsx          # 인증 전 레이아웃 (센터 정렬)
│   │   └── ProtectedRoute.tsx      # 인증 여부 검사 후 리다이렉트
│   │
│   ├── stores/                     # Zustand 클라이언트 상태 스토어
│   │   ├── authStore.ts            # 로그인 유저 정보, JWT Access Token (Zustand 메모리 — 새로고침 시 초기화)
│   │   └── uiStore.ts              # 사이드바 열림, 선택된 카테고리 ID 등 UI 상태
│   │
│   ├── queries/                    # TanStack Query — queryFn 정의 (서버 데이터 조회)
│   │   ├── todoQueries.ts          # useTodosQuery, useTodoDetailQuery
│   │   └── categoryQueries.ts      # useCategoriesQuery
│   │
│   ├── mutations/                  # TanStack Query — mutationFn 정의 (서버 데이터 변경)
│   │   ├── todoMutations.ts        # useCreateTodo, useUpdateTodo, useDeleteTodo
│   │   ├── categoryMutations.ts    # useCreateCategory, useUpdateCategory, useDeleteCategory
│   │   └── authMutations.ts        # useLogin, useSignup, useLogout, useDeleteAccount
│   │
│   ├── api/                        # axios 인스턴스 및 엔드포인트별 API 함수
│   │   ├── axiosInstance.ts        # axios 인스턴스 생성, 인터셉터 설정 (토큰 갱신)
│   │   ├── todoApi.ts              # todos 엔드포인트 호출 함수
│   │   ├── categoryApi.ts          # categories 엔드포인트 호출 함수
│   │   ├── authApi.ts              # auth 엔드포인트 호출 함수
│   │   └── userApi.ts              # users 엔드포인트 호출 함수
│   │
│   ├── hooks/                      # 도메인 무관 커스텀 훅
│   │   ├── useDebounce.ts          # 입력 디바운스 훅
│   │   └── useMediaQuery.ts        # 반응형 브레이크포인트 감지 훅 (768px)
│   │
│   ├── types/                      # TypeScript 타입 / 인터페이스 정의
│   │   ├── todo.types.ts           # Todo, CreateTodoRequest, UpdateTodoRequest
│   │   ├── category.types.ts       # Category, CreateCategoryRequest
│   │   ├── auth.types.ts           # LoginRequest, SignupRequest, AuthResponse
│   │   ├── user.types.ts           # User, UpdateUserRequest
│   │   └── api.types.ts            # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │
│   ├── constants/                  # 애플리케이션 전역 상수
│   │   ├── routes.constants.ts     # 라우트 경로 상수 (ROUTES.LOGIN 등)
│   │   ├── query.constants.ts      # TanStack Query 키 상수
│   │   └── error.constants.ts      # 에러 코드 상수
│   │
│   └── utils/                      # 순수 유틸리티 함수
│       ├── date.utils.ts           # 날짜 포맷 유틸리티
│       └── validation.utils.ts     # 입력 유효성 검사 함수
│
├── .env.example                    # 환경 변수 키 템플릿
├── index.html
├── tsconfig.json
├── vite.config.ts
├── eslint.config.ts
└── package.json
```

### 디렉토리별 핵심 역할 요약

| 디렉토리 | 역할 | Zustand/TanStack Query 사용 |
|----------|------|----------------------------|
| `pages/` | 라우트 단위 페이지, queries/mutations 조합 | TanStack Query 훅 호출 |
| `components/` | 재사용 UI, props로만 데이터 수신 | 직접 호출 금지 |
| `layouts/` | 공통 레이아웃, 인증 가드 | authStore 참조 가능 |
| `stores/` | 클라이언트 전용 UI/인증 상태 | Zustand 정의 |
| `queries/` | 서버 데이터 조회 훅 | TanStack Query useQuery |
| `mutations/` | 서버 데이터 변경 훅 | TanStack Query useMutation |
| `api/` | 실제 HTTP 요청 함수 | 없음 (순수 함수) |
| `hooks/` | 범용 커스텀 훅 | 도메인 무관 |
| `types/` | 타입 정의만, 로직 없음 | 없음 |
| `constants/` | 불변 상수, 로직 없음 | 없음 |
| `utils/` | 순수 함수, 부수 효과 없음 | 없음 |

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── index.ts                         # 서버 진입점, 환경 변수 검증, app.listen
│   ├── app.ts                           # Express 앱 설정, 미들웨어 등록, 라우터 마운트
│   │
│   ├── routes/                          # Express 라우터 — URL 경로와 Controller 연결만 담당
│   │   ├── auth.routes.ts               # /api/auth/* 경로 정의
│   │   ├── todo.routes.ts               # /api/todos/* 경로 정의
│   │   ├── category.routes.ts           # /api/categories/* 경로 정의
│   │   └── user.routes.ts               # /api/users/* 경로 정의
│   │
│   ├── controllers/                     # HTTP 요청/응답 처리 — 입력 추출, Service 호출, 응답 반환
│   │   ├── auth.controller.ts           # signup, login, logout, deleteAccount
│   │   ├── todo.controller.ts           # createTodo, getTodos, getTodoById, updateTodo, deleteTodo
│   │   ├── category.controller.ts       # createCategory, getCategories, updateCategory, deleteCategory
│   │   └── user.controller.ts           # updateProfile
│   │
│   ├── services/                        # 비즈니스 로직 — 도메인 규칙, 권한 검사, 트랜잭션 조율
│   │   ├── auth.service.ts              # 회원가입(bcrypt), 로그인(JWT 발급), 토큰 갱신, 탈퇴
│   │   ├── todo.service.ts              # 할일 CRUD 규칙, 소유권 검사, 필터 처리
│   │   ├── category.service.ts          # 기본 카테고리 수정/삭제 방어, 소유권 검사
│   │   └── user.service.ts              # 개인정보 수정, 비밀번호 변경
│   │
│   ├── repositories/                    # DB 접근 — pg Raw SQL 실행, 결과 매핑 (snake_case → camelCase)
│   │   ├── user.repository.ts           # users 테이블 CRUD 쿼리
│   │   ├── todo.repository.ts           # todos 테이블 CRUD + 필터 쿼리
│   │   └── category.repository.ts       # categories 테이블 CRUD 쿼리
│   │
│   ├── middlewares/                     # Express 미들웨어
│   │   ├── authenticate.middleware.ts   # JWT Access Token 검증, req.user 주입
│   │   ├── validate.middleware.ts       # 요청 바디/쿼리 유효성 검사 (zod 스키마 기반)
│   │   ├── errorHandler.middleware.ts   # 전역 에러 핸들러 — 도메인 에러 → HTTP 응답 변환
│   │   └── requestLogger.middleware.ts  # 요청/응답 구조화 로깅
│   │
│   ├── db/                              # DB 연결 설정 및 마이그레이션
│   │   ├── pool.ts                      # pg Pool 인스턴스 생성 및 내보내기
│   │   └── migrations/                  # SQL 마이그레이션 파일 (순번 관리)
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_categories.sql
│   │       └── 003_create_todos.sql
│   │
│   ├── config/                          # 환경 변수 파싱 및 설정 객체 내보내기
│   │   └── env.config.ts                # 환경 변수 검증(zod), 설정 객체 export
│   │
│   ├── errors/                          # 도메인 에러 클래스 정의
│   │   └── AppError.ts                  # AppError, NotFoundError, ForbiddenError, ConflictError, UnauthorizedError
│   │
│   ├── types/                           # TypeScript 타입 / 인터페이스
│   │   ├── domain.types.ts              # Todo, Category, User 도메인 엔티티 타입
│   │   ├── request.types.ts             # Express Request 확장 (req.user 타입 추가)
│   │   └── api.types.ts                 # ApiResponse<T>, 표준 에러 응답 타입
│   │
│   └── utils/                           # 순수 유틸리티 함수
│       ├── jwt.utils.ts                 # JWT 생성/검증 래퍼 함수
│       ├── password.utils.ts            # bcrypt hash/compare 래퍼 함수
│       └── response.utils.ts            # 표준 응답 객체 생성 헬퍼 (success, error)
│
├── tests/
│   ├── unit/                            # Service 단위 테스트 (Repository mock)
│   │   ├── auth.service.test.ts
│   │   ├── todo.service.test.ts
│   │   └── category.service.test.ts
│   ├── integration/                     # API 통합 테스트 (Supertest + 테스트 DB)
│   │   ├── auth.test.ts
│   │   ├── todo.test.ts
│   │   └── category.test.ts
│   └── helpers/
│       ├── testDb.ts                    # 테스트 DB 초기화, 트랜잭션 롤백 헬퍼
│       └── testApp.ts                   # 테스트용 Express 앱 인스턴스
│
├── .env.example                         # 환경 변수 키 템플릿 (값 없음)
├── .env                                 # 로컬 환경 변수 (git 제외)
├── tsconfig.json
├── eslint.config.ts
├── jest.config.ts
└── package.json
```

### 백엔드 레이어별 핵심 규칙 요약

| 레이어 | 파일 위치 | pg 직접 사용 | req/res 참조 | 비즈니스 로직 |
|--------|----------|:---:|:---:|:---:|
| Routes | `routes/` | 금지 | 금지 | 금지 |
| Controllers | `controllers/` | 금지 | 허용 | 금지 |
| Services | `services/` | 금지 | 금지 | **필수** |
| Repositories | `repositories/` | **필수** | 금지 | 금지 |
| Middlewares | `middlewares/` | 금지 | 허용 | 최소한 |

---

*이 문서는 프로젝트 초기 설계 원칙을 정의하며, 기술적 의사결정 발생 시 이 문서를 기준으로 판단한다. 원칙 변경이 필요한 경우 팀 합의 후 이 문서를 먼저 업데이트하고 코드를 변경한다.*
