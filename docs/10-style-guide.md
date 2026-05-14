# TodoListApp — 프론트엔드 스타일 가이드

> 버전: 1.1.0 | 작성일: 2026-05-14 (1차 릴리즈 후 업데이트)
> 디자인 레퍼런스: Studio Namma (Awwwards) — Editorial Minimal 스타일

---

## 1. 디자인 콘셉트

**"단순하고 대담하게(Bold Minimal)"**

- 군더더기 없는 여백과 강한 타이포그래피로 집중력 있는 UI를 구성한다.
- 흑백 기조에 앰버(Amber) 계열 단일 포인트 컬러만 사용한다.
- 인터랙션은 절제하되, 사용되는 곳에서는 명확하게 시각적으로 표현한다.

---

## 2. 컬러 팔레트

### 2.1 기본 컬러 (라이트모드)

| 이름 | 변수명 | Hex | 용도 |
|------|--------|-----|------|
| Background | `--color-bg` | `#F7F6F3` | 페이지 배경 (따뜻한 연회색) |
| Surface | `--color-surface` | `#FFFFFF` | 카드, 모달, 입력 필드 배경 |
| Dark | `--color-dark` | `#111111` | 헤더, 사이드바, 주요 텍스트 |
| Dark Soft | `--color-dark-soft` | `#2A2A2A` | 보조 어두운 영역 |
| Border | `--color-border` | `#D8D8D4` | 구분선, 테두리 |
| Text Primary | `--color-text-primary` | `#111111` | 본문 기본 텍스트 |
| Text Secondary | `--color-text-secondary` | `#7A7A78` | 보조 텍스트, 메타 정보 |
| Text Disabled | `--color-text-disabled` | `#B0B0AE` | 비활성 텍스트 |

### 2.2 포인트 컬러 (Amber)

| 이름 | 변수명 | Hex | 용도 |
|------|--------|-----|------|
| Amber | `--color-amber` | `#F5A623` | Primary 버튼, 강조 배지, 활성 상태 |
| Amber Light | `--color-amber-light` | `#FFF3D6` | Amber 배경 연하게 (hover 등) |
| Amber Dark | `--color-amber-dark` | `#C47D00` | Amber hover/pressed 상태 |

### 2.3 시맨틱 컬러

| 이름 | 변수명 | Hex | 용도 |
|------|--------|-----|------|
| Success | `--color-success` | `#2D7A4F` | 완료 상태, 성공 메시지 |
| Success Light | `--color-success-light` | `#E8F5EE` | 완료 배지 배경 |
| Error | `--color-error` | `#C0392B` | 에러 메시지, 삭제 버튼 |
| Error Light | `--color-error-light` | `#FDECEA` | 에러 배경 |

### 2.4 네비게이션 테마 변수 (헤더/사이드바)

**라이트모드에서 헤더는 흰색, 사이드바는 진하게 설정되며, 다크모드 확장 시 테마를 완전히 전환한다.**

| 변수명 | 라이트모드 | 다크모드 | 용도 |
|--------|----------|---------|------|
| `--color-nav-bg` | `#FFFFFF` | `#0A0A0A` | 헤더/네비 배경 |
| `--color-nav-text` | `#111111` | `#FFFFFF` | 헤더 텍스트 |
| `--color-nav-text-muted` | `#7A7A78` | rgba(255,255,255,0.6) | 헤더 보조 텍스트 |
| `--color-nav-hover` | 라이트 배경 | 다크 배경 | 헤더 hover 상태 |
| `--color-nav-border` | `#D8D8D4` | 진하게 | 헤더 하단 보더 |
| `--color-sidebar-bg` | `#FFFFFF` | `#111111` | 사이드바 배경 |
| `--color-sidebar-text` | `#111111` | `#FFFFFF` | 사이드바 텍스트 |
| `--color-sidebar-text-muted` | `#7A7A78` | rgba(255,255,255,0.5) | 사이드바 보조 텍스트 |
| `--color-sidebar-hover` | hover 배경 | 다크 hover | 사이드바 항목 hover |
| `--color-sidebar-border` | `#D8D8D4` | 진하게 | 사이드바 보더 |

### 2.5 CSS 변수 선언 예시 (라이트모드 현재)

```css
:root {
  /* 기본 색상 */
  --color-bg: #F7F6F3;
  --color-surface: #FFFFFF;
  --color-dark: #111111;
  --color-dark-soft: #2A2A2A;
  --color-border: #D8D8D4;
  --color-text-primary: #111111;
  --color-text-secondary: #7A7A78;
  --color-text-disabled: #B0B0AE;

  /* 포인트 컬러 */
  --color-amber: #F5A623;
  --color-amber-light: #FFF3D6;
  --color-amber-dark: #C47D00;

  /* 시맨틱 컬러 */
  --color-success: #2D7A4F;
  --color-success-light: #E8F5EE;
  --color-error: #C0392B;
  --color-error-light: #FDECEA;

  /* 네비게이션 변수 */
  --color-nav-bg: #FFFFFF;
  --color-nav-text: #111111;
  --color-nav-text-muted: #7A7A78;
  --color-nav-border: #D8D8D4;

  /* 사이드바 변수 */
  --color-sidebar-bg: #FFFFFF;
  --color-sidebar-text: #111111;
  --color-sidebar-text-muted: #7A7A78;
  --color-sidebar-border: #D8D8D4;
}
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 역할 | 폰트 | 대안 |
|------|------|------|
| Display (헤더, 로고) | `'Neue Haas Grotesk'` | `'Inter'`, `'Helvetica Neue'` |
| Body (본문) | `'Inter'` | `system-ui`, `-apple-system` |
| Mono (코드 등) | `'JetBrains Mono'` | `'Fira Code'`, `monospace` |

```css
:root {
  --font-display: 'Inter', 'Helvetica Neue', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

### 3.2 타입 스케일

| 이름 | 변수명 | 크기 | 굵기 | 용도 |
|------|--------|------|------|------|
| Display | `--text-display` | `48px` | `800` | 페이지 타이틀 (로그인 화면 앱명 등) |
| Heading 1 | `--text-h1` | `32px` | `700` | 섹션 제목 |
| Heading 2 | `--text-h2` | `24px` | `700` | 카드 제목, 모달 제목 |
| Heading 3 | `--text-h3` | `18px` | `600` | 서브섹션 |
| Body Large | `--text-body-lg` | `16px` | `400` | 일반 본문 |
| Body | `--text-body` | `14px` | `400` | 기본 본문, 입력값 |
| Small | `--text-sm` | `12px` | `400` | 메타 정보, 날짜, 배지 |
| Label | `--text-label` | `11px` | `600` | 대문자 레이블, 네비게이션 항목 |

```css
:root {
  --text-display: 800 48px/1.1 var(--font-display);
  --text-h1: 700 32px/1.2 var(--font-body);
  --text-h2: 700 24px/1.3 var(--font-body);
  --text-h3: 600 18px/1.4 var(--font-body);
  --text-body-lg: 400 16px/1.6 var(--font-body);
  --text-body: 400 14px/1.6 var(--font-body);
  --text-sm: 400 12px/1.5 var(--font-body);
  --text-label: 600 11px/1 var(--font-body);

  --letter-spacing-label: 0.08em;  /* 레이블 자간 */
  --letter-spacing-display: -0.02em; /* 디스플레이 자간 (타이트하게) */
}
```

---

## 4. 간격 (Spacing)

8px 기반 그리드를 사용한다.

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--space-1` | `4px` | 아이콘-텍스트 사이, 미세 간격 |
| `--space-2` | `8px` | 인라인 요소 간격 |
| `--space-3` | `12px` | 컴팩트 패딩 |
| `--space-4` | `16px` | 기본 패딩, 카드 내부 간격 |
| `--space-5` | `20px` | 중간 여백 |
| `--space-6` | `24px` | 섹션 내부 여백 |
| `--space-8` | `32px` | 섹션 간 여백 |
| `--space-10` | `40px` | 대형 여백 |
| `--space-12` | `48px` | 페이지 수직 패딩 |
| `--space-16` | `64px` | 레이아웃 주요 여백 |

---

## 5. 보더 & 쉐이도우

### 보더

```css
:root {
  --radius-sm: 4px;    /* 배지, 인풋 */
  --radius-md: 8px;    /* 버튼, 카드 */
  --radius-lg: 12px;   /* 모달, 사이드바 패널 */
  --radius-xl: 20px;   /* 대형 카드 */
  --radius-full: 9999px; /* 칩, 토글 */

  --border-default: 1px solid var(--color-border);
  --border-dark: 1px solid var(--color-dark);
  --border-focus: 2px solid var(--color-dark);
}
```

### 쉐이도우

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-overlay: 0 16px 48px rgba(0, 0, 0, 0.16); /* 모달 */
}
```

---

## 6. 아이콘 시스템

### 6.1 SVG 아이콘 구성

**모든 아이콘은 SVG로 구현되어 있으며, `CategoryIcons.tsx` 컴포넌트에서 정의된다.**

| 아이콘명 | 위치 | 용도 | 색상 |
|---------|------|------|------|
| `TagIcon` | `components/common/CategoryIcons.tsx` | 기본 카테고리 아이콘 | 앰버 (`--color-amber`) |
| `FolderIcon` | 동일 파일 | 사용자 정의 카테고리 아이콘 | 회색 (텍스트 색 상속) |

### 6.2 카테고리 아이콘 사용

**기본 카테고리(업무, 개인, 기타)는 `TagIcon`으로 렌더링되고, 사용자 정의 카테고리는 `FolderIcon`으로 표시된다.**

```typescript
import { TagIcon, FolderIcon } from '@/components/common/CategoryIcons';

// 기본 카테고리
<TagIcon size={20} color="var(--color-amber)" />

// 사용자 정의 카테고리
<FolderIcon size={20} color="currentColor" />
```

### 6.3 폼 select 옵션에서의 아이콘 표시

**HTML `<select>` 요소는 SVG를 직접 렌더링할 수 없으므로, 유니코드 기호를 사용한다.**

| 카테고리 타입 | 기호 | Unicode |
|-------------|------|---------|
| 기본 카테고리 | `▪` | U+25AA | 
| 사용자 정의 카테고리 | `▫` | U+25AB |

```typescript
<select>
  <option>▪ 업무</option>
  <option>▪ 개인</option>
  <option>▫ 나의 카테고리</option>
</select>
```

---

## 8. 컴포넌트 스펙

### 8.1 Button

3가지 variant를 사용한다.

#### Primary (Amber fill)
```css
.btn-primary {
  background: var(--color-amber);
  color: var(--color-dark);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font: 600 14px var(--font-body);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover  { background: var(--color-amber-dark); }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:disabled { background: var(--color-border); color: var(--color-text-disabled); cursor: not-allowed; }
```

#### Secondary (Dark outline)
```css
.btn-secondary {
  background: transparent;
  color: var(--color-dark);
  border: var(--border-dark);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font: 600 14px var(--font-body);
  transition: background 0.15s ease;
}
.btn-secondary:hover { background: var(--color-dark); color: var(--color-surface); }
```

#### Danger (Error)
```css
.btn-danger {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font: 600 14px var(--font-body);
}
.btn-danger:hover { background: var(--color-error); color: white; }
```

#### 크기 변형

| 크기 | 패딩 | 폰트 크기 |
|------|------|-----------|
| `sm` | `6px 14px` | `12px` |
| `md` (기본) | `10px 20px` | `14px` |
| `lg` | `14px 28px` | `16px` |

---

### 8.2 Input / Textarea

```css
.input {
  width: 100%;
  padding: 10px 14px;
  border: var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font: 400 14px var(--font-body);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s ease;
}
.input:focus {
  border: var(--border-focus);
}
.input::placeholder {
  color: var(--color-text-disabled);
}
.input.error {
  border-color: var(--color-error);
}
```

**레이블**
```css
.input-label {
  display: block;
  font: 600 11px var(--font-body);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}
```

---

### 8.3 Todo Card

```css
.todo-card {
  background: var(--color-surface);
  border: var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  transition: box-shadow 0.15s ease;
}
.todo-card:hover {
  box-shadow: var(--shadow-md);
}

/* 완료된 할일 */
.todo-card.completed .todo-title {
  text-decoration: line-through;
  color: var(--color-text-disabled);
}

/* 완료 체크박스 */
.todo-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.todo-checkbox.checked {
  background: var(--color-dark);
  border-color: var(--color-dark);
  /* 체크 아이콘 (흰색) */
}
```

---

### 8.4 Category Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font: 600 11px var(--font-body);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
}

/* 기본 카테고리 */
.badge-default {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: var(--border-default);
}

/* 사용자 정의 카테고리 */
.badge-custom {
  background: var(--color-amber-light);
  color: var(--color-amber-dark);
}

/* 완료 상태 */
.badge-completed {
  background: var(--color-success-light);
  color: var(--color-success);
}
```

---

### 8.5 Modal

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 17, 17, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  width: 480px;
  max-width: calc(100vw - 32px);
  box-shadow: var(--shadow-overlay);
}

.modal-title {
  font: 700 24px var(--font-body);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}
```

---

## 9. 레이아웃

### 9.1 PC (768px 이상) — 2단 레이아웃

```
┌──────────────────────────────────────────┐
│              Header (56px)               │
├─────────────┬────────────────────────────┤
│             │                            │
│  Sidebar    │     Main Content           │
│  (240px)    │     (flex-grow: 1)         │
│             │                            │
│  카테고리    │     할일 목록 + 필터         │
│  네비게이션  │                            │
│             │                            │
└─────────────┴────────────────────────────┘
```

```css
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  background: var(--color-dark);
  color: var(--color-surface);
  padding: var(--space-6);
  overflow-y: auto;
}

.main {
  padding: var(--space-6) var(--space-8);
  overflow-y: auto;
}
```

### 9.2 모바일 (768px 미만) — 단일 컬럼

```
┌──────────────────┐
│   Header (56px)  │
├──────────────────┤
│                  │
│   Main Content   │
│   (full width)   │
│                  │
├──────────────────┤
│  Bottom Nav Bar  │
└──────────────────┘
```

```css
@media (max-width: 767px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 56px 1fr 64px;
  }
  .sidebar { display: none; }
  .main { padding: var(--space-4); }
}
```

---

## 10. Header / Sidebar 스타일

### Header

```css
.header {
  background: var(--color-dark);
  color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  grid-column: 1 / -1;
}

.header-logo {
  font: 700 16px var(--font-display);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
  color: var(--color-surface);
}
```

### Sidebar 네비게이션

```css
.sidebar-section-title {
  font: 600 11px var(--font-body);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  margin-bottom: var(--space-3);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font: 400 14px var(--font-body);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: rgba(255,255,255,0.08);
  color: var(--color-surface);
}

.sidebar-item.active {
  background: var(--color-amber);
  color: var(--color-dark);
  font-weight: 600;
}
```

---

## 11. 인터랙션 원칙

| 상황 | 처리 |
|------|------|
| 버튼 hover | 색상 전환 (`transition: 0.15s ease`) |
| 버튼 클릭 | `scale(0.98)` 축소 효과 |
| 카드 hover | 좌측에 3px 앰버 보더 애니메이션 + `box-shadow` 추가 |
| 완료 토글 | 체크 애니메이션 + 텍스트 strike-through |
| 로딩 | 스피너 또는 skeleton (배경 회색 블록) |
| 에러 | 인풋 border → error 컬러 + 에러 메시지 텍스트 |
| 모달 진입 | fade + scale-up (`opacity 0→1, scale 0.95→1`) |
| 페이지 전환 | fade (`opacity 0.15s`) |
| 언어 변경 | 즉시 전체 UI 텍스트 및 카테고리명 변환 |

---

## 12. 인증 화면 (로그인 / 회원가입) 레이아웃

```
┌─────────────────────────────────────────┐
│                                         │
│          배경: var(--color-bg)          │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │     앱 이름 (Display Bold)       │   │
│   │                                 │   │
│   │     이메일 Input                 │   │
│   │     비밀번호 Input               │   │
│   │                                 │   │
│   │     [Primary Button - 로그인]   │   │
│   │                                 │   │
│   │     회원가입 링크 (텍스트)         │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

- 카드 너비: 400px (모바일에서 full width - 32px margin)
- 카드 배경: `var(--color-surface)`, 그림자: `var(--shadow-lg)`
- 앱 이름: Display Bold, `letter-spacing: var(--letter-spacing-display)`

---

## 13. 반응형 브레이크포인트

```css
/* Mobile first */
/* base: ~767px (모바일) */

@media (min-width: 768px) {
  /* 태블릿 / PC — 사이드바 2단 레이아웃 */
}

@media (min-width: 1280px) {
  /* 와이드 스크린 — 최대 콘텐츠 너비 제한 */
  .main { max-width: 900px; }
}
```

---

*이 스타일 가이드는 Studio Namma의 Bold Minimal 디자인 철학을 참고하여 TodoListApp에 맞게 재해석한 것이다. 구현 시 Tailwind CSS를 사용할 경우 위 CSS 변수를 `tailwind.config.js`의 `theme.extend`에 매핑하여 사용한다.*
