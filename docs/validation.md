# 검증 기록

검증일: 2026-10-20 (Asia/Seoul). 작업 디렉터리 `/workspace/Industrial-Engineer-Industrial-Safety-CBT`.

- 기준 소스: electrician-cbt `b9a682ccff1b460334b78d5bfad9375b7ec4fbb6`의 git archive. 원본 테스트 성공 수를 복사하지 않고 새 자격증용 테스트를 실행했다.
- 스킬: 소스 저장소에서 CBT 표준 1.3.1 폴더 전체를 복사했다. 대상 저장소에 기존 AGENTS.md는 없어 새 연결 문서를 만들었다.
- `npm ci --cache /tmp/cbt-npm-cache`: 종료 코드 0. Node 24.19.0, npm 11.9.0.
- `npm test -- --reporter=dot`: 종료 코드 0, 1,018개 통과. 1,000개는 등록 문항 각각의 별도 계산 경로·보기·반올림 검사이며, 시험 전체 범위 검수나 1,000개의 서로 다른 기능 검사를 뜻하지 않는다.
- 최초 브라우저 실행: PC/모바일 시나리오 18개 통과. 시험·자동 제출·재접속·답안 변경·과락 규칙의 모델 검사·정답 숨김·결과·오답·북마크·통계·등록·손상 원본 보존·두 모드 Space를 검증했다.
- 추가 회귀 검사: 작은 메뉴 390×480/740×360에서 wheel 및 CDP touchStart/move/end로 실제 입력한다. 확대 글자·뷰포트 높이 변경과 저장 실패 경고도 검사한다. 최종 실행 결과는 아래 갱신한다.
- 실기기·Firefox·Safari·외부 전문가 검수: 미실행.
- Q-Net 공식 원문: 프록시 CONNECT HTTP 403. 공식 시험 규칙·출제기준 대조는 차단. 법령·규정 문항은 미확인 수치를 만들지 않고 제외했다.
- 문제은행: 자체 제작 1,000개, 기출 0, 복원 0, 25개 유형 × 40개 조건. 각 과목 200개. ID·본문/보기 fingerprint 중복 없음. 숫자 조건 변형은 의미상 같은 유형으로 집계하며 독립 개념 수를 부풀리지 않는다. 자체 제작 문장은 공통 생성 원고를 내부 검토했으며 공식 대조나 전문가 검수는 아니다.
- GitHub: 기존 HTTPS Git 프록시로 읽기와 push dry-run이 동작했다. GitHub CLI API 요청은 Forbidden, api.github.com CONNECT는 HTTP 403. 토큰이 없다는 이유로 새 비밀값을 요구하지 않는다. GitHub API 접근/Pages 권한은 아직 검증되지 않았다.
- 네트워크 초안: Q-Net·법령정보·KOSHA 공식 자료와 GitHub API 도메인을 추가했다. 초안 저장만으로 현재 런타임 네트워크가 변경되지는 않는다.
- 공개 배포·공개 사이트 검증: 미완료. Pages 활성화 상태와 API 접근 확인이 필요하다.

현재 결과는 로컬 개발 검증과 제한된 내부 문항 검수다. 공식 시험 규칙 검증, 전 범위 출제기준 적합성, 원격 CI 성공, GitHub Pages 배포 성공을 대신하지 않는다.

최종 로컬 검사: `npm test -- --reporter=json --outputFile=/tmp/industrial-unit-final.json` 종료 코드 0, 1,018/1,018 통과.
추가 메뉴 검사 최초 4건 실패는 테스트가 사이드바에 가려진 scrim 중앙을 클릭한 문제였다. 노출된 배경 클릭으로 고친 뒤 메뉴 검사 10/10 통과. 프로그램적 scrollTop 설정 없이 실제 wheel/touch 입력을 사용했다.
생성기 재실행 전후 문제은행과 양식의 SHA-256 일치 확인. `docs/bank-sha256.json`에 해시 기록.
개발 서버 시작 및 브라우저 요청: HTTP 200, 대상 자격증 제목, 1440×1000 및 390×844에서 가로 넘침 없음. 화면 캡처 육안 확인 완료.
GitHub 공식 actions/configure-pages@v5의 action.yml을 읽었다. 최초 Pages 활성화는 기본 GITHUB_TOKEN으로 할 수 없으며 별도 관리자 권한이 필요하다. 추가 자격증명을 임의 생성하거나 요청하지 않고 실제 실행 결과에서 확인한다.
이번 사용자의 명시적 배포 요청을 수행하기 위해 `[deploy-pages]` main push만 배포 트리거에 추가했다. 사용자 수동 workflow_dispatch도 유지하며 일반 push/PR은 검증만 한다.

최종 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: 종료 코드 0, 30/30 통과(42.6초), 타입 검사·프로덕션 빌드 포함. 10개 메뉴 검사는 PC와 Pixel 7 환경에서 390×480/740×360의 wheel·touch 및 글자 확대·높이 변경을 다뤘다. Vite의 500 kB 초과 청크 경고는 남아 있다(은행을 포함한 JS 약 1.8 MB, gzip 약 134 kB). 이는 빌드 실패가 아니며 느린 기기에서 최초 처리 비용이 있을 수 있다.
