# TodoListApp — 프론트엔드 통합 가이드

> 버전: 1.0.0 | 작성일: 2026-05-14 | 기준: 백엔드 v1.0 (BE-01 ~ BE-09 완료)

---

## 목차

1. [백엔드 서버 정보](#1-백엔드-서버-정보)
2. [공통 응답 형식](#2-공통-응답-형식)
3. [인증 방식 (JWT)](#3-인증-방식-jwt)
4. [axios 인스턴스 설정 가이드](#4-axios-인스턴스-설정-가이드)
5. [Zustand authStore 설계 가이드](#5-zustand-authstore-설계-가이드)
6. [API 엔드포인트 상세](#6-api-엔드포인트-상세)
7. [에러 코드 레퍼런스](#7-에러-코드-레퍼런스)
8. [프론트엔드에서 처리할 비즈니스 규칙](#8-프론트엔드에서-처리할-비즈니스-규칙)
9. [주요 통합 패턴](#9-주요-통합-패턴)

---

## 1. 백엔드 서버 정보

| 항목 | 값 |
|------|-----|
| 개발 서버 URL | `http://localhost:3000` |
| API Base Path | `/api` |
| Swagger UI | `http://localhost:3000/api-docs` |
| CORS 허용 Origin | `http://localhost:5173` (Vite 기본 포트) |
| Content-Type | `application/json` |

**서버 기동 명령**
```bash
cd backend
npm run dev    # nodemon (개발 — 파일 변경 시 자동 재시작)
npm start      # node (프로덕션)
```

**헬스 체크**
```
GET /api/health
→ 200 OK  { "status": "success", "data": { "message": "OK" } }
```

---

## 2. 공통 응답 형식

모든 API 응답은 아래 두 가지 형식 중 하나를 따른다.

### 성공 응답

```json
{
  "status": "success",
  "data": { /* 엔드포인트별 데이터 */ },
  "timestamp": "2026-05-14T00:00:00.000Z"
}
```

- 목록 조회 시 `data`는 배열(`[]`)
- 삭제 성공 시 `data`는 `{ "message": "..." }` 객체

### 에러 응답

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "사용자에게 표시할 메시지",
  "timestamp": "2026-05-14T00:00:00.000Z"
}
```

- `code` 필드를 기반으로 에러 종류를 분기 처리한다.
- `message`는 한국어이므로 UI에 직접 표시하거나 참고용으로 사용한다.

---

## 3. 인증 방식 (JWT)

### 토큰 발급

`POST /api/auth/login` 성공 시 응답의 `data.accessToken`을 사용한다.

### 토큰 보관 — 필수 규칙

| 방법 | 허용 여부 |
|------|-----------|
| **Zustand 메모리 (JavaScript 변수)** | ✅ 허용 |
| `localStorage` | ❌ 금지 (XSS 취약) |
| `sessionStorage` | ❌ 금지 |
| Cookie | ❌ 금지 (CSRF 취약) |

> 페이지 새로고침 시 토큰이 소멸되며 로그인 화면으로 이동하는 것은 **의도된 동작**이다.

### 토큰 사용

인증이 필요한 모든 요청에 Authorization 헤더를 포함한다.

```
Authorization: Bearer <accessToken>
```

### 토큰 만료

- 유효 시간: **1시간 (`1h`)**
- Refresh Token 없음 — 만료 시 `401` 응답을 받으면 로그인 화면으로 이동시킨다.
- axios 인터셉터에서 `401` 응답을 감지하여 `authStore.clearAuth()` 호출 후 `/login`으로 리다이렉트한다.

### JWT Payload

```json
{
  "userId": "UUID",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## 4. axios 인스턴스 설정 가이드

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:3000
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터 — 토큰 자동 주입
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 401 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

**프론트엔드 환경변수 (`.env`)**
```
VITE_API_BASE_URL=http://localhost:3000
```

---

## 5. Zustand authStore 설계 가이드

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  updateUser: (updated) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    })),
}));
```

> `localStorage` 연동(`persist` 미들웨어) 사용 금지. Zustand 메모리에만 보관한다.

---

## 6. API 엔드포인트 상세

### 6.1 Auth — 인증

#### `POST /api/auth/signup` — 회원가입

**Request**
```json
{
  "email": "user@example.com",
  "password": "pass1234",
  "name": "홍길동"
}
```

**Response 201**
```json
{
  "status": "success",
  "data": {
    "id": "UUID",
    "email": "user@example.com",
    "name": "홍길동"
  },
  "timestamp": "..."
}
```

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 400 | `INVALID_PASSWORD_FORMAT` | 비밀번호 8자 미만 또는 영문/숫자 미포함 |
| 409 | `EMAIL_CONFLICT` | 이미 가입된 이메일 |

---

#### `POST /api/auth/login` — 로그인

**Request**
```json
{
  "email": "user@example.com",
  "password": "pass1234"
}
```

**Response 200**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "UUID",
      "email": "user@example.com",
      "name": "홍길동",
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "timestamp": "..."
}
```

**성공 후 처리**
```typescript
const { accessToken, user } = response.data.data;
useAuthStore.getState().setAuth(accessToken, user);
navigate('/');
```

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 401 | (code 없음) | 이메일 미존재 또는 비밀번호 불일치 (원인 미구분 — 보안) |

---

#### `POST /api/auth/logout` — 로그아웃

인증 필요. 서버는 무동작 (Stateless JWT). 클라이언트에서 직접 처리한다.

**Response 200**
```json
{ "status": "success", "data": { "message": "로그아웃 되었습니다." }, "timestamp": "..." }
```

**성공 후 처리**
```typescript
useAuthStore.getState().clearAuth();
navigate('/login');
```

---

#### `DELETE /api/auth/account` — 회원 탈퇴

인증 필요. 현재 비밀번호로 본인 확인 후 계정 및 모든 데이터(할일, 사용자 정의 카테고리) 삭제.

**Request**
```json
{ "password": "pass1234" }
```

**Response 200**
```json
{ "status": "success", "data": { "message": "계정이 삭제되었습니다." }, "timestamp": "..." }
```

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 401 | (code 없음) | 비밀번호 불일치 |

---

### 6.2 Todos — 할일

#### `GET /api/todos` — 할일 목록 조회 (필터링)

인증 필요. 쿼리 파라미터로 필터 적용 (모두 선택 사항, AND 조건).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `categoryId` | UUID | 특정 카테고리로 필터 |
| `isCompleted` | boolean | `true` = 완료만, `false` = 미완료만 |
| `dueDateFrom` | YYYY-MM-DD | 종료예정일 시작 범위 (이상 포함) |
| `dueDateTo` | YYYY-MM-DD | 종료예정일 종료 범위 (이하 포함) |

**예시**
```
GET /api/todos?categoryId=UUID&isCompleted=false&dueDateFrom=2026-05-01&dueDateTo=2026-05-31
```

**Response 200**
```json
{
  "status": "success",
  "data": [
    {
      "id": "UUID",
      "userId": "UUID",
      "categoryId": "UUID",
      "title": "기획서 초안 작성",
      "description": "1분기 마케팅 전략",
      "dueDate": "2026-05-20",
      "isCompleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "timestamp": "..."
}
```

> 필터에 맞는 항목이 없으면 빈 배열 `[]` 반환 (404 아님).

---

#### `POST /api/todos` — 할일 등록

인증 필요.

**Request**
```json
{
  "title": "기획서 초안 작성",
  "description": "1분기 마케팅 전략 기획서",
  "dueDate": "2026-05-20",
  "categoryId": "UUID"
}
```

> `description`, `dueDate`는 선택 사항. `dueDate` 미전달 시 `null` 저장.

**Response 201** — 생성된 Todo 객체 반환

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 400 | `TITLE_REQUIRED` | 제목 누락 또는 빈 문자열 |
| 400 | `CATEGORY_REQUIRED` | categoryId 누락 |
| 404 | `CATEGORY_NOT_FOUND` | 존재하지 않는 categoryId |

---

#### `GET /api/todos/:id` — 할일 단건 조회

인증 필요. 본인 소유만 조회 가능.

**Response 200** — Todo 객체 반환

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 403 | `FORBIDDEN` | 타인 소유 할일 |
| 404 | `TODO_NOT_FOUND` | 존재하지 않는 할일 |

---

#### `PATCH /api/todos/:id` — 할일 수정

인증 필요. 수정할 필드만 포함하면 된다 (Partial Update).

**Request** (수정할 필드 중 하나 이상 필수)
```json
{
  "title": "기획서 수정 완료",
  "description": "최종본",
  "dueDate": "2026-05-25",
  "categoryId": "UUID",
  "isCompleted": true
}
```

> **`dueDate` 제거 방법**: `"dueDate": null` 명시 전달. 필드 자체를 생략하면 변경되지 않는다.

**완료 토글 예시**
```json
{ "isCompleted": true }   // 완료 처리
{ "isCompleted": false }  // 미완료로 되돌리기 (양방향 토글)
```

**Response 200** — 수정된 Todo 객체 반환

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 400 | `NO_FIELDS_TO_UPDATE` | 빈 객체 `{}` 전달 |
| 403 | `FORBIDDEN` | 타인 소유 할일 |
| 404 | `TODO_NOT_FOUND` | 존재하지 않는 할일 |

---

#### `DELETE /api/todos/:id` — 할일 삭제

인증 필요. 영구 삭제.

**Response 200**
```json
{ "status": "success", "data": { "message": "할일이 삭제되었습니다." }, "timestamp": "..." }
```

---

### 6.3 Categories — 카테고리

#### `GET /api/categories` — 카테고리 목록 조회

인증 필요. 기본 카테고리 3개 + 사용자 정의 카테고리를 함께 반환한다.

**Response 200**
```json
{
  "status": "success",
  "data": [
    { "id": "UUID", "userId": null, "name": "업무", "isDefault": true, "createdAt": "...", "updatedAt": "..." },
    { "id": "UUID", "userId": null, "name": "개인", "isDefault": true, "createdAt": "...", "updatedAt": "..." },
    { "id": "UUID", "userId": null, "name": "기타", "isDefault": true, "createdAt": "...", "updatedAt": "..." },
    { "id": "UUID", "userId": "사용자UUID", "name": "마케팅", "isDefault": false, "createdAt": "...", "updatedAt": "..." }
  ],
  "timestamp": "..."
}
```

> **정렬**: 기본 카테고리(`isDefault=true`) 먼저, 이후 사용자 정의 카테고리를 생성 순으로 반환.

**UI 처리 포인트**
- `isDefault === true`인 항목은 수정/삭제 버튼을 비활성화한다.
- `userId === null`은 기본 카테고리임을 의미한다.

---

#### `POST /api/categories` — 카테고리 생성

인증 필요.

**Request**
```json
{ "name": "마케팅" }
```

**Response 201** — 생성된 Category 객체 반환

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 409 | `CATEGORY_NAME_DUPLICATE` | 동일 사용자 범위 내 이름 중복 |

---

#### `PATCH /api/categories/:id` — 카테고리 수정

인증 필요. 이름 변경만 가능.

**Request**
```json
{ "name": "마케팅팀" }
```

**Response 200** — 수정된 Category 객체 반환

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 403 | `DEFAULT_CATEGORY` | 기본 카테고리 수정 시도 |
| 403 | `FORBIDDEN` | 타인 소유 카테고리 |
| 409 | `CATEGORY_NAME_DUPLICATE` | 이름 중복 |

---

#### `DELETE /api/categories/:id` — 카테고리 삭제

인증 필요.

**Response 200**
```json
{ "status": "success", "data": { "message": "카테고리가 삭제되었습니다." }, "timestamp": "..." }
```

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 400 | `CATEGORY_HAS_TODOS` | 해당 카테고리에 할일이 존재함 |
| 403 | `DEFAULT_CATEGORY` | 기본 카테고리 삭제 시도 |
| 403 | `FORBIDDEN` | 타인 소유 카테고리 |

---

### 6.4 Users — 사용자 정보

#### `PATCH /api/users/me` — 개인정보 수정

인증 필요. `name`과 `password` 중 하나 이상 포함해야 한다.

**Request 패턴**

```json
// 이름만 변경
{ "name": "김길동" }

// 비밀번호만 변경
{ "currentPassword": "pass1234", "password": "newpass5678" }

// 이름 + 비밀번호 동시 변경
{ "name": "김길동", "currentPassword": "pass1234", "password": "newpass5678" }
```

**Response 200**
```json
{
  "status": "success",
  "data": {
    "id": "UUID",
    "email": "user@example.com",
    "name": "김길동",
    "updatedAt": "..."
  },
  "timestamp": "..."
}
```

**이름 변경 성공 후 처리**
```typescript
const updatedUser = response.data.data;
useAuthStore.getState().updateUser({ name: updatedUser.name, updatedAt: updatedUser.updatedAt });
```

**주요 에러**
| 상태 | code | 상황 |
|------|------|------|
| 400 | `NO_UPDATE_FIELDS` | name, password 둘 다 미포함 |
| 400 | `NAME_EMPTY` | name이 빈 문자열 |
| 400 | `CURRENT_PASSWORD_REQUIRED` | password 변경 시 currentPassword 미포함 |
| 400 | `INVALID_PASSWORD_FORMAT` | 새 비밀번호 형식 불량 |
| 401 | `PASSWORD_MISMATCH` | 현재 비밀번호 불일치 |

---

## 7. 에러 코드 레퍼런스

| code | HTTP | 상황 |
|------|------|------|
| `TOKEN_MISSING` | 401 | Authorization 헤더 없음 |
| `TOKEN_INVALID` | 401 | 토큰 유효하지 않음 또는 만료 |
| `EMAIL_CONFLICT` | 409 | 이메일 중복 가입 |
| `INVALID_PASSWORD_FORMAT` | 400 | 비밀번호 8자 미만 또는 영문/숫자 미포함 |
| `TITLE_REQUIRED` | 400 | 할일 제목 누락 |
| `CATEGORY_REQUIRED` | 400 | 할일 categoryId 누락 |
| `NO_FIELDS_TO_UPDATE` | 400 | 할일 수정 시 빈 객체 전달 |
| `NO_UPDATE_FIELDS` | 400 | 프로필 수정 시 name/password 둘 다 미포함 |
| `NAME_EMPTY` | 400 | name이 빈 문자열 |
| `CURRENT_PASSWORD_REQUIRED` | 400 | 비밀번호 변경 시 currentPassword 누락 |
| `CATEGORY_HAS_TODOS` | 400 | 할일 있는 카테고리 삭제 시도 |
| `PASSWORD_MISMATCH` | 401 | 현재 비밀번호 불일치 |
| `FORBIDDEN` | 403 | 타인 소유 리소스 접근 |
| `DEFAULT_CATEGORY` | 403 | 기본 카테고리 수정/삭제 시도 |
| `TODO_NOT_FOUND` | 404 | 존재하지 않는 할일 |
| `CATEGORY_NOT_FOUND` | 404 | 존재하지 않는 카테고리 |
| `RESOURCE_NOT_FOUND` | 404 | 존재하지 않는 라우트 |
| `CATEGORY_NAME_DUPLICATE` | 409 | 카테고리 이름 중복 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## 8. 프론트엔드에서 처리할 비즈니스 규칙

서버가 강제하는 규칙이지만, UX를 위해 클라이언트에서도 미리 처리한다.

### 회원가입 / 비밀번호 변경
- 비밀번호: **8자 이상, 영문 + 숫자 조합** (Submit 전 클라이언트 검증)
- 비밀번호 확인 일치 여부 (서버는 검증 안 함 — 클라이언트 전용)

### 카테고리
- `isDefault === true`인 카테고리는 수정/삭제 버튼 **비활성화**
- 할일이 있는 카테고리 삭제 시도 시 안내 메시지 표시 (`CATEGORY_HAS_TODOS` 에러 처리)
- 카테고리 선택 드롭다운에 기본 3개 + 사용자 정의 카테고리 표시

### 할일 등록/수정 폼
- 제목 필수 입력 (Submit 전 검증)
- 카테고리 필수 선택 (Submit 전 검증)
- `isCompleted` 토글은 완료 → 미완료 양방향 모두 허용

### 필터링
- 필터 미선택 시 전체 할일 표시
- 카테고리 / 완료여부 / 기간 필터는 AND 조건 (모두 동시 적용 가능)
- "전체" 카테고리 옵션은 UI 전용 (DB에 없음) — `categoryId` 파라미터를 포함하지 않으면 전체 조회

---

## 9. 주요 통합 패턴

### 9.1 TanStack Query 키 설계 권장

```typescript
export const QUERY_KEYS = {
  todos: (filters?: TodoFilters) => ['todos', filters] as const,
  todo: (id: string) => ['todos', id] as const,
  categories: () => ['categories'] as const,
} as const;
```

### 9.2 할일 완료 토글 (낙관적 업데이트)

```typescript
const toggleTodo = useMutation({
  mutationFn: (todo: Todo) =>
    axiosInstance.patch(`/api/todos/${todo.id}`, { isCompleted: !todo.isCompleted }),
  onMutate: async (todo) => {
    await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos() });
    const prev = queryClient.getQueryData(QUERY_KEYS.todos());
    queryClient.setQueryData(QUERY_KEYS.todos(), (old: Todo[]) =>
      old.map((t) => t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t)
    );
    return { prev };
  },
  onError: (_, __, ctx) => {
    queryClient.setQueryData(QUERY_KEYS.todos(), ctx?.prev);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos() });
  },
});
```

### 9.3 401 응답 처리 흐름

```
API 응답 401
  ├─ TOKEN_MISSING → 로그인 화면으로 이동 (인증 없이 접근)
  ├─ TOKEN_INVALID → clearAuth() → 로그인 화면으로 이동 (만료 또는 변조)
  └─ PASSWORD_MISMATCH → UI 에러 메시지 표시 (로그아웃 하지 않음)
```

axios 인터셉터에서 `TOKEN_MISSING`, `TOKEN_INVALID`만 자동 리다이렉트 처리하고, `PASSWORD_MISMATCH`는 해당 폼에서 직접 처리한다.

```typescript
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const code = error.response?.data?.code;
    if (error.response?.status === 401 &&
        (code === 'TOKEN_MISSING' || code === 'TOKEN_INVALID' || !code)) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 9.4 mutation 성공 후 캐시 무효화 패턴

```typescript
// 할일 생성/수정/삭제 → todos 캐시 무효화
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos() });
}

// 카테고리 생성/수정/삭제 → categories 캐시 무효화
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
}
```

### 9.5 API 에러에서 code 추출

```typescript
// axios 에러에서 백엔드 code 추출
function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code ?? null;
  }
  return null;
}

// 사용 예
catch (error) {
  const code = getErrorCode(error);
  if (code === 'EMAIL_CONFLICT') {
    setError('이미 사용 중인 이메일입니다.');
  } else if (code === 'INVALID_PASSWORD_FORMAT') {
    setError('비밀번호는 8자 이상 영문+숫자 조합이어야 합니다.');
  } else {
    setError('잠시 후 다시 시도해주세요.');
  }
}
```

---

*이 문서는 백엔드 BE-01~BE-09 완료 기준으로 작성되었다. 백엔드 API 변경 시 이 문서를 함께 업데이트한다.*
