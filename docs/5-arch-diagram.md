# TodoListApp — 기술 아키텍처 다이어그램

> 버전: 1.0.0 | 작성일: 2026-05-13

---

## 1. 전체 시스템 아키텍처

```mermaid
graph TD
    subgraph Client["클라이언트 (Browser / Mobile Web)"]
        FE["React 19 + TypeScript\nZustand · TanStack Query\ni18n (react-i18next)"]
    end

    subgraph Backend["백엔드 (Node.js + Express)"]
        MW["JWT 인증 미들웨어"]
        RT["라우터\n/auth · /todos · /categories · /users"]
        CT["컨트롤러"]
        SV["서비스\n(비즈니스 로직)"]
        RP["레포지토리\n(pg Raw SQL)"]
    end

    subgraph DB["데이터베이스 (PostgreSQL 17)"]
        TB["users (language 필드)\ntodos · categories"]
    end

    FE -->|"HTTPS REST API\n(JWT Bearer Token)"| MW
    MW --> RT
    RT --> CT
    CT --> SV
    SV --> RP
    RP -->|"Raw SQL"| TB
    FE -->|"언어 설정 동기화"| DB

    style Client fill:#E3F2FD,stroke:#1E88E5
    style Backend fill:#F3E5F5,stroke:#8E24AA
    style DB fill:#E8F5E9,stroke:#43A047
```

---

## 2. 백엔드 레이어 구조

```mermaid
graph LR
    A["Controller\n요청/응답 처리\n입력 유효성 검사"] -->|"도메인 객체"| B["Service\n비즈니스 규칙\n소유권·권한 검사"]
    B -->|"쿼리 파라미터"| C["Repository\npg Raw SQL\nsnake↔camelCase 변환"]
    C -->|"Result"| D[("PostgreSQL 17")]

    style A fill:#FFF9C4,stroke:#F9A825
    style B fill:#FCE4EC,stroke:#E91E63
    style C fill:#E8EAF6,stroke:#3949AB
    style D fill:#E8F5E9,stroke:#43A047
```

---

## 3. 프론트엔드 상태 관리 및 다국어 시스템

```mermaid
graph TD
    P["Pages / Components"]
    I18N["i18n (react-i18next)\n번역 파일: locales/{ko,en}.json\nuseTranslation() hook"]

    P -->|"서버 데이터 조회/변경"| TQ["TanStack Query\n캐시 · 로딩 · 에러 관리"]
    P -->|"UI · 인증 상태 읽기"| ZS["Zustand\n로그인 유저 · UI 상태"]
    P -->|"i18n 텍스트 렌더링"| I18N

    TQ -->|"HTTP 요청"| API["API Layer\naxios 인스턴스"]
    ZS -.->|"JWT Access Token 메모리 보관\n(새로고침 시 초기화)"| ZS
    I18N -.->|"사용자 언어 설정 저장\n(users.language)"| ZS

    style P fill:#E3F2FD,stroke:#1E88E5
    style TQ fill:#FFF3E0,stroke:#FB8C00
    style ZS fill:#EDE7F6,stroke:#7B1FA2
    style API fill:#F1F8E9,stroke:#558B2F
    style I18N fill:#FCE4EC,stroke:#E91E63
```

---

## 4. 인증 흐름

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant B as 백엔드
    participant D as PostgreSQL

    C->>B: POST /api/auth/login (email, password)
    B->>D: SELECT user WHERE email = $1
    D-->>B: user row
    B->>B: bcrypt.compare(password, hash)
    B-->>C: 200 OK + JWT Access Token
    C->>C: Zustand authStore에 토큰 저장 (메모리)

    Note over C,B: 이후 인증 필요 요청 (탭/페이지 유지 중)

    C->>B: GET /api/todos (Authorization: Bearer JWT)
    B->>B: JWT 검증 미들웨어
    B->>D: SELECT todos WHERE user_id = $1
    D-->>B: todos rows
    B-->>C: 200 OK + todos[]
```

---

## 5. 데이터베이스 ERD

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR email UK
        VARCHAR password
        VARCHAR name
        BOOLEAN dark_mode
        VARCHAR language "DEFAULT 'ko'"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    categories {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        BOOLEAN is_default
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    todos {
        UUID id PK
        UUID user_id FK
        UUID category_id FK
        VARCHAR title
        TEXT description
        DATE due_date
        BOOLEAN is_completed
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    users ||--o{ todos : "소유 (CASCADE DELETE)"
    users ||--o{ categories : "생성 (CASCADE DELETE)"
    categories ||--o{ todos : "분류"
```

---

## 6. API 엔드포인트 구조

```mermaid
graph LR
    API["/api"]

    API --> AUTH["/auth"]
    API --> TODOS["/todos"]
    API --> CAT["/categories"]
    API --> USERS["/users"]

    AUTH --> A1["POST /signup"]
    AUTH --> A2["POST /login"]
    AUTH --> A3["POST /logout"]
    AUTH --> A4["DELETE /account"]

    TODOS --> T1["GET / (필터: category·dueDate·isCompleted)"]
    TODOS --> T2["POST /"]
    TODOS --> T3["GET /:id"]
    TODOS --> T4["PATCH /:id"]
    TODOS --> T5["DELETE /:id"]

    CAT --> C1["GET /"]
    CAT --> C2["POST /"]
    CAT --> C3["PATCH /:id"]
    CAT --> C4["DELETE /:id"]

    USERS --> U1["PATCH /me"]

    API --> DOCS["/api-docs"]
    DOCS --> D1["GET / (Swagger UI)"]

    style AUTH fill:#FCE4EC,stroke:#E91E63
    style TODOS fill:#E8EAF6,stroke:#3949AB
    style CAT fill:#E8F5E9,stroke:#43A047
    style USERS fill:#FFF9C4,stroke:#F9A825
    style DOCS fill:#E0F2F1,stroke:#00897B
```

> **Swagger UI**: `GET /api-docs` 에서 `swagger-ui-express` 기반 API 문서를 제공한다. `swagger/swagger.json`을 읽어 렌더링하며, 개발 환경에서 API 탐색 및 수동 테스트에 활용한다.
