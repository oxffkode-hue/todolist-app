# E2E 통합 테스트 결과 보고서

**테스트 일시:** 2026-05-15  
**테스트 환경:** 백엔드 http://localhost:3000 / 프론트엔드 http://localhost:5173  
**테스트 계정:** jihyun.e2e@todolist.com / jihyun1234 (이름: 김지현)  
**도구:** Playwright MCP  

---

## 테스트 결과 요약

| # | 시나리오 | 결과 | 스크린샷 |
|---|----------|------|----------|
| 01 | 회원가입 | ✅ PASS | s01-signup-form.png, s01-signup-success.png |
| 02 | 로그인 | ✅ PASS | s02-login-success.png |
| 03 | Todo 생성 | ✅ PASS | s03-todo-create-form.png, s03-todo-created.png |
| 04 | Todo 완료 처리 | ✅ PASS | s04-todo-completed.png |
| 05 | Todo 수정 | ✅ PASS | s05-todo-updated.png |
| 06 | Todo 삭제 | ✅ PASS | s06-todo-deleted.png, s06-todo-delete-confirmed.png |
| 07 | 카테고리 생성 (아이콘 선택) | ✅ PASS | s07-category-form.png, s07-category-created.png |
| 08 | Todo 필터링 | ✅ PASS | s08-filter-completed.png, s08-filter-category-date.png |
| 09 | 프로필(이름) 수정 | ✅ PASS | s09-profile-name-changed.png |
| 10 | 다크모드 전환 | ✅ PASS | s10-darkmode-on.png |
| 11 | 언어 전환 (한국어 ↔ 영어) | ✅ PASS | s11-language-en.png, s11-language-ko-restored.png |

**전체 결과: 11 / 11 PASS**

---

## 시나리오별 상세 결과

### S01 · 회원가입 ✅ PASS

- 이름, 이메일, 비밀번호, 비밀번호 확인 입력
- 회원가입 버튼 클릭 → `/login` 리다이렉트 확인
- 비고: 비밀번호 유효성(8자 이상, 영문+숫자) 안내 메시지 표시 확인

### S02 · 로그인 ✅ PASS

- 이메일/비밀번호 입력 후 로그인
- `/` (홈, 할일 목록) 이동 확인
- 헤더에 "김지현님" 표시 확인
- 사이드바에 기본 카테고리 3개 (업무, 개인, 기타) 표시 확인

### S03 · Todo 생성 ✅ PASS

- "+ 새 할일 추가" 클릭 → 모달 열림
- 제목: "E2E 테스트 할일", 설명, 카테고리 "업무", 종료예정일 "2026-06-30" 입력
- 저장 후 목록에 항목 표시 확인 (총 1개 · 미완료 1개)

### S04 · Todo 완료 처리 ✅ PASS

- 완료 버튼 클릭 → 완료 상태로 변경
- 통계 "미완료 0개 · 완료 1개" 업데이트 확인
- 완료 아이콘(체크) 표시 확인

### S05 · Todo 수정 ✅ PASS

- 수정 버튼 클릭 → 수정 모달 열림
- 제목을 "E2E 테스트 할일 (수정됨)"으로 변경, 종료예정일 "2026-07-31"로 변경
- 저장 후 목록에 변경 내용 반영 확인

### S06 · Todo 삭제 ✅ PASS

- 임시 Todo "삭제할 임시 할일" 생성 후 삭제
- 삭제 버튼 클릭 → 삭제 확인 다이얼로그 표시
- 확인 클릭 후 목록에서 제거 확인

### S07 · 카테고리 생성 (아이콘 선택) ✅ PASS

- 카테고리 관리 페이지(/categories) 이동
- "기본 카테고리" 섹션에 수정/삭제 버튼 없음 확인
- "+ 카테고리 추가" 클릭 → 12개 아이콘 선택 UI 표시 확인
- 이름 "운동 루틴", 아이콘 "운동(dumbbell)" 선택 후 저장
- 사이드바에 "운동 루틴" 카테고리 추가 확인

### S08 · Todo 필터링 ✅ PASS

- 완료 여부 "완료" 필터 → 완료 항목만 표시 확인
- 카테고리 "업무" + 날짜 범위(2026-07-01 ~ 2026-07-31) 복합 필터 적용 확인
- 필터 드롭다운에 새로 생성한 "운동 루틴" 카테고리 표시 확인

### S09 · 프로필(이름) 수정 ✅ PASS

- 설정 페이지(/profile) 이동
- 이름 "김지현 → 김지현 (E2E)" 변경 후 저장
- 성공 메시지 "이름이 변경되었습니다." 표시 확인
- 헤더 "김지현 (E2E)님"으로 즉시 반영 확인

### S10 · 다크모드 전환 ✅ PASS

- 헤더 🌙 버튼 클릭 → 다크모드 활성화
- 버튼이 "라이트 모드로 전환"(☀)으로 변경 확인
- 다시 클릭 → 라이트모드 복원

### S11 · 언어 전환 (한국어 ↔ 영어) ✅ PASS

- "English" 버튼 클릭 → UI 전체 영어로 전환 확인
  - 네비게이션: "Todo List", "Categories", "Settings"
  - 기본 카테고리: "Work", "Personal", "Other"
  - 페이지 제목: "Profile Settings", "Change Name" 등
- "한국어" 버튼 클릭 → 한국어로 복원 확인

---

## 발견된 이슈

없음. 모든 시나리오 정상 동작.

---

## 스크린샷 목록

```
test/e2e/screenshots/
├── s01-signup-form.png
├── s01-signup-success.png
├── s02-login-success.png
├── s03-todo-create-form.png
├── s03-todo-created.png
├── s04-todo-completed.png
├── s05-todo-updated.png
├── s06-todo-deleted.png
├── s06-todo-delete-confirmed.png
├── s07-category-form.png
├── s07-category-created.png
├── s08-filter-completed.png
├── s08-filter-category-date.png
├── s09-profile-name-changed.png
├── s10-darkmode-on.png
├── s11-language-en.png
└── s11-language-ko-restored.png
```
