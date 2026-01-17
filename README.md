# MUD Web - Fantasy MUD 게임 웹 클라이언트

Fantasy MUD 게임 웹 클라이언트. Unity WebGL 캐릭터 빌더와 Supabase 백엔드를 사용한 멀티플레이어 턴제 RPG.

## 주요 기능

- 턴제 전투 시스템 (AP 기반)
- 8속성 마법 + 12종 무기 스킬
- 실시간 채팅 및 PvP 결투
- 장비 강화/소켓 시스템
- 게임 내 시간/날씨 시스템
- Unity WebGL 캐릭터 커스터마이징

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| State | Zustand (client), React Query (server) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Game | Unity WebGL (react-unity-webgl) |
| Architecture | FSD (Feature-Sliced Design) |

## 빠른 시작

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 Supabase 정보 입력:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## 프로젝트 구조

FSD (Feature-Sliced Design) 아키텍처 사용:

```
src/
├── application/     # 앱 레이어 (stores, providers)
├── widgets/         # 복합 UI 블록
├── features/        # 기능 모듈 (동사형 액션)
├── entities/        # 비즈니스 엔티티
└── shared/          # 공유 코드 (API, 타입, UI)
```

**레이어 규칙**: app → widgets → features → entities → shared (상위만 import)

## 게임 시스템

| 시스템 | 설명 |
|--------|------|
| 전투 | AP 기반 턴제, 물리/마법 데미지, 상태이상 |
| 캐릭터 | 7개 능력치 (STR/DEX/CON/INT/WIS/CHA/LCK) |
| 장비 | 13단계 등급, 강화(+15), 소켓/룬워드 |
| 어빌리티 | 8속성 마법, 12종 무기 스킬, 레벨 기반 마법 |
| 몬스터 | AI 행동패턴, 물리/속성 저항 |
| 월드맵 | 연결된 맵 구조, 안전지대/위험지대 |
| PvP | 실시간 결투, DEX 기반 선공 |
| 채팅 | 실시간 + 귓속말 (크리스탈 시스템) |
| 시간 | 2시간 실시간 = 24시간 게임시간, 요일별 속성 강화 |
| 날씨 | 1시간 주기, 5종류, 속성 보너스 |

## 데이터 관리

게임 데이터는 JSON 파일로 관리하며, 스크립트로 통합 후 Supabase Storage에 업로드:

```bash
# 1. 개별 JSON 수정 (public/data/)

# 2. 통합 JSON 생성
npx tsx scripts/generate-abilities.ts
npx tsx scripts/generate-monsters.ts
npx tsx scripts/generate-items.ts

# 3. Storage 업로드
npm run upload-data
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run upload-data` | Supabase Storage 업로드 |
| `npx tsx scripts/generate-*.ts` | 데이터 통합 생성 |

## 문서

- [CLAUDE.md](./CLAUDE.md) - 개발 가이드 (상세)
- [docs/](./docs/README.md) - 시스템별 문서

### 주요 문서

| 문서 | 내용 |
|------|------|
| [전투 시스템](./docs/combat-system.md) | 데미지 계산, 공격 판정 |
| [숙련도 시스템](./docs/proficiency-system.md) | 무기/마법 숙련도 |
| [피로도 시스템](./docs/stamina-system.md) | 행동 소모, 자동 회복 |
| [성능 최적화](./docs/performance/README.md) | React Best Practices |

## 코드베이스 통계

| 분류 | 수량 |
|------|------|
| TypeScript 파일 | 259 |
| JSON 데이터 파일 | 159 |
| 엔티티 | 16 |
| 기능 모듈 | 10 |
| 마법 속성 | 8 |
| 무기 종류 | 12 |

## 라이선스

Private
