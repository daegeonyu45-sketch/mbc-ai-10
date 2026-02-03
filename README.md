
# Ullim AI: All-in-One Content Automation Platform (v2.6 Security Upgrade)

본 프로젝트는 생성형 AI를 활용하여 데이터 수집부터 기사 작성, 이미지 생성, 웹 게시까지 전 과정을 자동화하는 올인원 플랫폼입니다.

## 1. 보안 안내 (Security Policy)
- **API Key Guard**: 소스 코드 내에는 어떠한 API 키도 포함되어 있지 않습니다.
- **GitHub 안전 배포**: 본 프로젝트는 `process.env.API_KEY` 환경 변수를 사용하며, 사용자는 브라우저의 전용 다이얼로그(`window.aistudio.openSelectKey`)를 통해 본인의 키를 안전하게 설정할 수 있습니다.
- **데이터 보호**: 입력된 키는 로컬 환경에서만 안전하게 관리되며 외부로 노출되지 않습니다.

## 2. 프로젝트 폴더 구조
```text
root/
├── App.tsx                # 메인 라우팅 및 보안 가드(Key Guard) 로직
├── types.ts               # 데이터 타입 및 Enum 정의
├── services/
│   └── gemini.ts          # Google Gemini AI 연동 핵심 로직 (보안 강화)
├── components/
│   ├── SafeImage.tsx      # 이미지 로딩 오류 방지용 안전 컴포넌트
│   ├── Sidebar.tsx        # 관리자 사이드바 네비게이션
│   ├── WorkflowDashboard.tsx # 뉴스 리더 모드 대시보드
│   ├── AutomationEngine.tsx  # 키워드 기반 자동 생성 마법사 (하이브리드 엔진)
│   ├── SplitViewEditor.tsx   # AI 협업 라이브 에디터
│   ├── ContentCanvas.tsx     # 인터랙티브 뉴스 본문 렌더러 (네비게이션 개편)
│   ├── DataPipeline.tsx      # 데이터 수집 및 파이프라인 관리
│   └── Analytics.tsx         # 성과 통계 및 효율성 분석
└── index.html             # 엔트리 포인트 및 폰트 설정
```

## 3. 핵심 기술 스택
- **Frontend**: React (ES6 Modules), Tailwind CSS, Lucide React (Icons)
- **AI Core**: Google Gemini API (@google/genai)
  - `gemini-3-pro-preview`: 고품질 기사 작성 및 팩트 체크
  - `gemini-3-flash-preview`: 빠른 요약 및 카테고리 분류
  - `gemini-3-pro-image-preview`: 고품질 뉴스 보도 사진 생성
  - `googleSearch` Tool: 실시간 외부 데이터 Grounding (RAG)
- **Security**: Platform-native Key Selection Dialog Integration

## 4. 실행 가이드
1. 첫 접속 시 나타나는 **[AuraFlow AI Terminal]** 화면에서 API 키를 설정하세요.
2. 유료 GCP 프로젝트와 연결된 API 키를 사용하는 것이 권장됩니다 (Billing 필요).
3. [AI 엔진] 탭에서 원하는 키워드를 입력하여 실시간 보도 자료를 생성해 보세요.
4. [MZ 타겟팅] 탭의 카드뉴스 뷰어는 키보드 방향키와 좌우 네비게이션 버튼을 통해 조작 가능합니다.
