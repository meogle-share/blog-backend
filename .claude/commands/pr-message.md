# Pull Request Message Generator

현재 브랜치에서 푸쉬한 커밋들을 분석해서 PR 메시지를 작성해줘.

**PR 템플릿 경로:** `../../.github/pull_request_template.md`
**출력 경로:** `../temp/pr-message.txt`

## 요구사항
### 커밋 수집 시 base 브랜치 결정
1. **현재 브랜치의 upstream 확인:**
```bash
   git rev-parse --abbrev-ref @{upstream}
```
- upstream이 설정되어 있으면 그것을 base로 사용

2. **upstream이 없으면 git log로 부모 브랜치 추론:**
```bash
   # 현재 브랜치가 어디서 분기했는지 확인
   git show-branch | grep '*' | grep -v "$(git rev-parse --abbrev-ref HEAD)" | head -n1 | sed 's/.*\[\(.*\)\].*/\1/' | sed 's/[\^~].*//'
```

3. **기본값은 origin/main이 아닌 명시적 확인:**
    - 사용자에게 base 브랜치를 물어보기
    - 또는 git branch -r로 원격 브랜치 목록 확인 후 선택

### 필수 명령어 형식
- ❌ 금지: `git log origin/main..HEAD` (부모 브랜치가 main이 아닐 경우)
- ✅ 필수: `git log <부모_브랜치>..HEAD` (정확한 부모 브랜치 지정)
- ✅ 예시: `git log origin/feat/ddd..HEAD` (feat/ddd_test의 경우)

1. **커밋 내역 수집**
    - 현재 브랜치(base)에서 **git push 된 커밋들만 수집**
    - 각 커밋의 변경 파일과 내용 파악
    - 각 커밋 메시지도 참고

2. **PR 템플릿 형식 준수**
   - PR 템플릿 경로의 md 파일을 읽어서 해당 구조를 따르도록 작성

3. **작성 규칙**
   - **📎 연결된 PR**: 파생된 브랜치 이름을 명시
   - **🧩 작업 내용**:
     - 체크리스트는 커밋 내역 기반으로 자동 체크 (완료된 작업은 `[x]`)
     - 주요 변경 사항은 커밋 메시지와 변경된 파일을 기반으로 상세히 작성
     - 모듈/기능별로 그룹화하여 작성
   - **🚨 주의 사항 / 영향 범위**:
     - DB 마이그레이션, API 변경, 의존성 변경 등 중요 사항 명시
     - 기존 코드에 미치는 영향 분석

4. **분석 방법**
   - 커밋 메시지의 타입(feat, fix, refactor 등)을 기반으로 작업 내용 분류
   - 변경된 파일 경로를 통해 영향 범위 파악
   - 테스트 파일 추가 여부 확인
   - 설정 파일 변경 사항 확인

5. **출력 처리**
   - `.claude/temp/pr-message.txt` 파일에 저장
   - 기존 파일이 있으면 삭제하고 신규 파일 생성
   - 마크다운 형식 유지

## 제목
- 작성한 PR 메시지 내용을 포괄하는 제목 작성해줘

## 주의사항
- 커밋 메시지를 분석하되, 실제 코드 변경 내용도 함께 고려
- PR 템플릿의 모든 섹션을 빠짐없이 작성
- 한글로 작성하되, 기술 용어는 영문 유지
- 구체적이고 실용적인 정보 제공