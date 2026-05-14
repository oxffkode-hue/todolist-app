-- ============================================================
-- TodoListApp — Database Schema
-- PostgreSQL 17
-- 기준 문서: docs/6-erd.md v1.0.0
-- ============================================================

-- uuid-ossp 확장 활성화 (gen_random_uuid() 사용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    id          UUID            NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(255)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    dark_mode   BOOLEAN         NOT NULL DEFAULT false,
    language    VARCHAR(10)     NOT NULL DEFAULT 'ko',
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- 2. categories
-- ============================================================
CREATE TABLE categories (
    id          UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID,                           -- NULL = 시스템 기본 카테고리
    name        VARCHAR(100)    NOT NULL,
    icon        VARCHAR(30)     NOT NULL DEFAULT 'folder',
    is_default  BOOLEAN         NOT NULL DEFAULT false,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    -- 동일 사용자(user_id) 내 카테고리명 중복 불가
    -- NULL user_id(기본 카테고리)는 PostgreSQL UNIQUE 제약에서 NULL 값끼리 비교 시 중복으로 간주하지 않으므로,
    -- 기본 카테고리 이름 중복 방지는 애플리케이션 레벨에서 처리한다.
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- ============================================================
-- 3. todos
-- ============================================================
CREATE TABLE todos (
    id           UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID            NOT NULL,
    category_id  UUID            NOT NULL,
    title        VARCHAR(255)    NOT NULL,
    description  TEXT,
    due_date     DATE,
    is_completed BOOLEAN         NOT NULL DEFAULT false,
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos PRIMARY KEY (id),
    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_todos_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
        -- 할일이 있는 카테고리 삭제 불가 (BR-11): 앱 레벨에서 제한, DB는 RESTRICT 없음
);

-- ============================================================
-- 4. Seed Data — 기본 카테고리
-- user_id = NULL, is_default = true
-- ============================================================
INSERT INTO categories (id, user_id, name, is_default)
VALUES
    (gen_random_uuid(), NULL, '업무', true),
    (gen_random_uuid(), NULL, '개인', true),
    (gen_random_uuid(), NULL, '기타', true);
