# DMU 도서관 대출 시스템

생성형 AI(Claude)를 활용해 React로 구현한 간단한 도서관 대출 시스템입니다.
하나의 GitHub 저장소를 **두 가지 방식**으로 배포합니다.

- **과제1** — GitHub Actions(CI/CD) → AWS S3 정적 웹 호스팅 (Academy)
- **과제2** — AWS Amplify Hosting (GitHub 저장소 직접 연결)

## 🌐 배포 URL & 시연 영상

> Lab 세션은 약 4시간만 유효합니다. 만료 후에는 URL이 비활성화될 수 있습니다.

| 구분 | 라이브 URL | 시연 영상 |
| --- | --- | --- |
| 과제1 · S3 | `http://mybucket--20263627.s3-website-us-east-1.amazonaws.com` | [▶ YouTube](https://youtu.be/GrNR13N85As) |
| 과제2 · Amplify | `https://main.<APP_ID>.amplifyapp.com` | [▶ YouTube](https://youtu.be/ultvS7wibI4) |

### 🎬 과제1 — GitHub Actions CI/CD 시연

[![과제1 시연 영상](https://img.youtube.com/vi/GrNR13N85As/hqdefault.jpg)](https://youtu.be/GrNR13N85As)

### 🎬 과제2 — AWS Amplify 호스팅 시연

[![과제2 시연 영상](https://img.youtube.com/vi/ultvS7wibI4/hqdefault.jpg)](https://youtu.be/ultvS7wibI4)

---

## 시스템 소개

**도서관 대출 시스템**은 사서/이용자가 도서를 등록·검색·대출·반납할 수 있는 SPA(Single Page Application)입니다. 백엔드 없이 브라우저 `localStorage`에 데이터를 보관하므로 별도 서버가 필요 없고, 정적 호스팅(S3/Amplify)만으로 동작합니다.

### 기능

- 📚 **도서 관리**: 도서 등록 / 삭제, 제목·저자·ISBN 기반 검색
- 🔁 **대출/반납**: 대출자 이름과 함께 대출, 한 도서당 1명만 동시 대출 가능
- 📋 **대출 내역**: 대출 중 / 반납 완료 / 전체 필터, 대출/반납 시각 표시
- 📊 **대시보드**: 전체 도서 수, 대출 중 수, 대출 가능 수, 누적 대출 건수

### 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React 18, React Router 6, Vite 5 |
| 상태/데이터 | React Context + `localStorage` |
| 테스트/품질 | Vitest, @testing-library/react, ESLint 9 |
| CI/CD | GitHub Actions |
| 호스팅 | AWS S3 Static Website Hosting / AWS Amplify Hosting |

### 디렉토리 구조

```
.
├── .github/workflows/ci-cd.yml      과제1 — GitHub Actions 워크플로우
├── amplify.yml                      과제2 — Amplify 빌드 스펙
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── hooks/useLocalStorage.js
    ├── store/libraryStore.jsx       LibraryProvider (Context + localStorage)
    ├── pages/{HomePage,BooksPage,LoansPage}.jsx
    └── test/App.test.jsx            Vitest 스모크 테스트
```

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm test
npm run build    # 결과물: dist/
```

---

# 과제1 — GitHub Actions로 CI/CD 환경 구축 (S3 배포)

## CI/CD 파이프라인

[.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) 한 잡(`build-and-deploy`)에서 CI와 CD를 모두 수행합니다.

```
push to main / PR
       │
       ▼
┌──────────────────────────────────────────────┐
│ build-and-deploy                             │
│   1. checkout                                │
│   2. setup-node@20 (+ npm cache)             │
│   3. npm ci                                  │
│   4. npm run lint                            │
│   5. npm test     (vitest)                   │
│   6. npm run build → dist/                   │
│  ── 여기까지 PR/푸시 모두 실행 ──                │
│   7. configure-aws-credentials (Academy)     │
│   8. aws s3 sync dist/ → s3://bucket         │
└──────────────────────────────────────────────┘
```

- **PR**: lint/test/build까지만 실행 → 배포는 하지 않음
- **`main` 푸시**: 빌드 검증 후 S3로 자동 배포
- `index.html`은 `Cache-Control: max-age=0`으로 즉시 갱신, 나머지 자산은 `immutable`로 길게 캐시

## AWS S3 셋업 (최초 1회)

AWS Academy 콘솔에서 다음 작업을 수행합니다.

### 1. 버킷 생성

- **Bucket name**: 워크플로우의 `S3_BUCKET` 값과 동일 (예: `mybucket--20263627`)
- **Region**: `us-east-1` 또는 `us-west-1` (Academy 제한)
- **Block all public access**: **해제**

### 2. Static website hosting 활성화

`Properties → Static website hosting → Edit`

- Hosting type: **Host a static website**
- Index document: `index.html`
- **Error document: `index.html`** ← SPA 라우팅용 (직접 URL 입력 시 404 방지)

### 3. 퍼블릭 읽기 정책

`Permissions → Bucket policy`에 아래 정책을 적용합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mybucket--20263627/*"
    }
  ]
}
```

> 버킷 이름은 자신의 것으로 수정하세요.

## GitHub Secrets 등록

`Settings → Secrets and variables → Actions → New repository secret`에서 아래 3개를 추가합니다.

| Secret 이름 | 설명 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS Academy `aws_access_key_id` (`ASIA...`로 시작) |
| `AWS_SECRET_ACCESS_KEY` | AWS Academy `aws_secret_access_key` |
| `AWS_SESSION_TOKEN` | AWS Academy `aws_session_token` |

> ⚠️ **AWS Academy 자격증명은 약 4시간마다 만료됩니다.** Lab을 새로 시작할 때마다
> 3개 값을 GitHub Secrets에서 갱신해야 다음 배포가 성공합니다.

자격증명 위치: AWS Academy → Modules → Learner Lab → **Start Lab** → **AWS Details → AWS CLI: Show**의 `[default]` 블록 3개 값

## 워크플로우 환경변수

`.github/workflows/ci-cd.yml` 상단 `env:` 블록을 자신의 환경에 맞춰 수정합니다.

```yaml
env:
  AWS_REGION: us-east-1               # Academy 허용 리전
  S3_BUCKET: mybucket--20263627       # 자신의 S3 버킷 이름
```

---

# 과제2 — AWS Amplify 서비스로 호스팅

GitHub 저장소를 Amplify에 **직접 연결**하면, push마다 Amplify가 자체적으로 빌드/배포합니다.
과제1의 GitHub Actions와 **별개로** 동작하므로 한 번의 push에 두 가지 배포가 동시에 갱신됩니다.

## Amplify 빌드 스펙

저장소 루트의 [amplify.yml](amplify.yml)이 Amplify의 빌드 스크립트입니다.

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Amplify 연결 절차

1. AWS Amplify Console → **New app → Host web app**
2. Source: **GitHub** → 저장소 권한 부여 → 본 레포(`dmu_Github_Actions`) 선택 → Branch `main`
3. Build settings 단계: `amplify.yml`이 자동 감지됨 → 그대로 두고 다음
4. **Save and deploy**
5. 빌드가 끝나면 `https://main.<APP_ID>.amplifyapp.com` 형식의 URL이 발급됨

### SPA 라우팅을 위한 Rewrites 설정 (직접 URL 진입 404 방지)

Amplify Console → **Rewrites and redirects → Add rule**

| Source address | Target address | Type |
| --- | --- | --- |
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

## CI/CD 비교

| 항목 | 과제1 (GitHub Actions → S3) | 과제2 (Amplify) |
| --- | --- | --- |
| 트리거 | push to `main`, PR | push to 연결된 브랜치 |
| 빌드 위치 | GitHub Actions runner | Amplify 빌드 환경 |
| 자격증명 관리 | GitHub Secrets (4시간 갱신) | Amplify가 자체 관리 |
| CI 검증 | ESLint + Vitest + 빌드 | 빌드 (PR 미리보기 옵션 가능) |
| 호스팅 | S3 정적 사이트 | Amplify CDN |
| 자동 HTTPS | ❌ (S3 정적 호스팅은 http) | ✅ |
| 롤백 | 수동 재배포 | Amplify Console 한 번에 가능 |

---

## 트러블슈팅

| 증상 | 원인/해결 |
| --- | --- |
| `ExpiredToken: The provided token has expired` (Actions) | Academy Lab 재시작 후 3개 Secret 갱신 |
| 빌드 성공인데 사이트가 비어 있음 | 워크플로우가 `./` 대신 `./dist`를 sync 하는지 확인 |
| `/books` 직접 URL 진입 시 403/404 | S3: Error document를 `index.html`로 설정 / Amplify: 위 Rewrites 규칙 추가 |
| `AccessDenied` on objects (S3) | 버킷 정책에 `s3:GetObject` `Principal: "*"` 허용 + Block public access 해제 |
| Amplify 빌드 실패 `npm ci` | `package-lock.json`이 커밋되어 있는지 확인 |