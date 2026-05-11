# 📚 DMU 도서관 대출 시스템

> 생성형 AI(Claude)를 활용해 React로 구현한 간단한 도서관 대출 시스템입니다.
> 하나의 GitHub 저장소를 **GitHub Actions(S3)** 와 **AWS Amplify**, 두 가지 방식으로 배포합니다.

## 🚀 빠른 링크

| | AWS URL | 시연 영상 |
| --- | --- | --- |
| **과제1** · GitHub Actions → S3 | [S3 버킷 콘솔](https://us-east-1.console.aws.amazon.com/s3/buckets/mybucket--20263627?region=us-east-1&tab=properties) | [▶ YouTube](https://youtu.be/GrNR13N85As) |
| **과제2** · AWS Amplify | [https://main.d3foq5qt49prgu.amplifyapp.com](https://main.d3foq5qt49prgu.amplifyapp.com/) | [▶ YouTube](https://youtu.be/ultvS7wibI4) |

> ⚠️ AWS Academy Lab 세션은 약 4시간만 유효합니다. 만료 후에는 위 URL이 비활성화될 수 있습니다.

---

## 시스템 개요

도서를 등록·검색하고 대출/반납을 관리하는 SPA. 백엔드 없이 브라우저 `localStorage`만으로 동작하므로 정적 호스팅(S3 / Amplify)만으로 충분합니다.

### 주요 기능

- 📚 **도서 관리** — 도서 등록 / 삭제, 제목·저자·ISBN 기반 검색
- 🔁 **대출 / 반납** — 대출자 이름과 함께 대출, 한 도서당 1명 동시 대출
- 📋 **대출 내역** — 대출 중 / 반납 완료 / 전체 필터, 대출·반납 시각 표시
- 📊 **대시보드** — 전체 / 대출 중 / 대출 가능 / 누적 대출 건수

### 기술 스택

`React 18` · `Vite 5` · `React Router 6` · `localStorage` · `Vitest` · `ESLint 9` · `GitHub Actions` · `AWS S3 Static Hosting` · `AWS Amplify Hosting`

### 디렉토리 구조

```
.
├── .github/workflows/ci-cd.yml      과제1 — GitHub Actions 워크플로우
├── amplify.yml                      과제2 — Amplify 빌드 스펙
├── src/
│   ├── App.jsx · main.jsx
│   ├── pages/                       HomePage · BooksPage · LoansPage
│   ├── store/libraryStore.jsx       Context + localStorage
│   ├── hooks/useLocalStorage.js
│   └── test/App.test.jsx            Vitest 스모크 테스트
├── index.html · vite.config.js · eslint.config.js
└── package.json
```

### 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # 결과물: dist/
```

---

## 과제1 — GitHub Actions로 CI/CD 환경 구축

[![과제1 시연 영상](https://img.youtube.com/vi/GrNR13N85As/hqdefault.jpg)](https://youtu.be/GrNR13N85As)

### 파이프라인

[.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) 단일 잡(`build-and-deploy`)에서 CI와 CD를 모두 수행합니다.

```
push → checkout → setup-node → npm ci → lint → test → build
                                                         │
                                                (main 푸시일 때만)
                                                         ▼
                                       configure-aws-credentials
                                                         │
                                                         ▼
                                       aws s3 sync ./dist → S3
```

- **PR**: lint / test / build까지만 실행 (배포 안 함)
- **`main` 푸시**: 빌드 검증 후 S3로 자동 배포
- `index.html`은 즉시 갱신 캐시(`max-age=0`), 나머지 자산은 `immutable`

### AWS S3 셋업 (최초 1회)

| 단계 | 설정 |
| --- | --- |
| 1. 버킷 생성 | 이름 = 워크플로우의 `S3_BUCKET`, Region = `us-east-1`/`us-west-1`, **Block public access 해제** |
| 2. Static website hosting | Index document = `index.html`, **Error document = `index.html`** (SPA 라우팅용) |
| 3. 퍼블릭 읽기 정책 | `s3:GetObject`를 `Principal: "*"` 로 허용 (아래 정책 참조) |

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::mybucket--20263627/*"
  }]
}
```

### GitHub Secrets (3개)

`Settings → Secrets and variables → Actions`에 추가:

- `AWS_ACCESS_KEY_ID` · `AWS_SECRET_ACCESS_KEY` · `AWS_SESSION_TOKEN`

> AWS Academy → Learner Lab → **AWS Details → AWS CLI: Show**의 `[default]` 블록 값
> Lab을 다시 시작할 때마다 3개 모두 **갱신 필수** (약 4시간 만료)

### 워크플로우 환경변수

```yaml
# .github/workflows/ci-cd.yml
env:
  AWS_REGION: us-east-1               # Academy 허용 리전
  S3_BUCKET: mybucket--20263627       # 자신의 버킷 이름
```

---

## 과제2 — AWS Amplify 서비스로 호스팅

[![과제2 시연 영상](https://img.youtube.com/vi/ultvS7wibI4/hqdefault.jpg)](https://youtu.be/ultvS7wibI4)

GitHub 저장소를 Amplify에 **직접 연결**하면 push마다 Amplify가 자체적으로 빌드/배포합니다. 과제1의 GitHub Actions와 **별개로** 동작하므로 한 번의 push에 두 배포가 동시에 갱신됩니다.

### 빌드 스펙 — [amplify.yml](amplify.yml)

```yaml
version: 1
frontend:
  phases:
    preBuild: { commands: [ npm ci ] }
    build:    { commands: [ npm run build ] }
  artifacts:
    baseDirectory: dist
    files: [ '**/*' ]
  cache:
    paths: [ node_modules/**/* ]
```

### 연결 절차

1. Amplify Console → **New app → Host web app**
2. Source: **GitHub** → 권한 부여 → 본 레포 선택 → Branch `main`
3. `amplify.yml`이 자동 감지됨 → **Save and deploy**
4. 빌드 완료 후 `https://main.<APP_ID>.amplifyapp.com` 발급

### SPA 라우팅 (Rewrites 1개 추가)

Console → **Rewrites and redirects → Add rule**

| Source | Target | Type |
| --- | --- | --- |
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

---

## 두 방식 비교

| 항목 | 과제1 · GitHub Actions → S3 | 과제2 · AWS Amplify |
| --- | --- | --- |
| 트리거 | `push to main` · PR | 연결 브랜치 push |
| 빌드 위치 | GitHub Actions runner | Amplify 빌드 환경 |
| 자격증명 관리 | GitHub Secrets (4시간마다 갱신) | Amplify 자체 관리 |
| CI 검증 | ESLint + Vitest + Build | Build (PR Preview 옵션) |
| 호스팅 | S3 정적 사이트 | Amplify CDN |
| 자동 HTTPS | ❌ | ✅ |
| 롤백 | 수동 재배포 | Console에서 1-click |

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| `ExpiredToken` (Actions) | Academy Lab 재시작 후 Secrets 3개 갱신 |
| 빌드 성공인데 사이트가 빈 화면 | 워크플로우가 `./` 대신 `./dist`를 sync 하는지 확인 |
| `/books` 직접 진입 시 403/404 | S3: Error document = `index.html` / Amplify: 위 Rewrites 규칙 추가 |
| `AccessDenied` (S3 객체) | 버킷 정책에 `s3:GetObject` 퍼블릭 허용 + Block public access 해제 |
| Amplify `npm ci` 실패 | `package-lock.json`이 커밋되어 있는지 확인 |
