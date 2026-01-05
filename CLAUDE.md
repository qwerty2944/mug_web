# MUD Web - Claude 개발 가이드

## 프로젝트 개요
Fantasy MUD 게임 웹 클라이언트. Unity WebGL 캐릭터 빌더 + Supabase 백엔드.

## 기술 스택
- **Framework**: Next.js 16 (App Router)
- **상태관리**: Zustand (클라이언트), React Query (서버)
- **백엔드**: Supabase (Auth, Database, Realtime, Storage)
- **Unity**: react-unity-webgl

## 아키텍처: FSD (Feature-Sliced Design)

```
src/
├── application/            # 앱 레이어 (FSD)
│   ├── providers/          # 앱 프로바이더 (개별 파일 분리)
│   │   ├── index.tsx           # Providers 컴포지션
│   │   ├── QueryProvider.tsx   # React Query
│   │   ├── AuthProvider.tsx    # 인증 상태 동기화
│   │   ├── ThemeProvider.tsx   # 테마 초기화
│   │   ├── UnityProvider.tsx   # Unity WebGL
│   │   └── ToasterConfig.tsx   # Toast 설정
│   └── stores/             # Zustand 스토어 (클라이언트 상태만)
│       ├── index.ts            # 모든 store export
│       ├── authStore.ts        # 인증 상태 (userId, session)
│       ├── appearanceStore.ts  # Unity 캐릭터 외형
│       ├── profileStore.ts     # 캐릭터 생성 폼 상태
│       ├── gameStore.ts        # 연결 상태, 온라인 유저
│       ├── chatStore.ts        # 채팅 메시지, 캐시
│       ├── themeStore.ts       # 테마 설정
│       └── modalStore.ts       # 모달 상태
├── widgets/                # 복합 UI 블록 (헤더, 사이드바 등)
├── features/               # 기능 모듈 (동사형 액션 폴더)
│   ├── auth/
│   │   ├── sign-out/           # 로그아웃 액션
│   │   └── index.ts
│   ├── character/
│   │   ├── types/              # 타입, 프리셋, 상수
│   │   ├── ui/                 # UI 컴포넌트
│   │   └── index.ts
│   ├── game/
│   │   ├── update-location/    # 위치 업데이트 액션
│   │   ├── lib/                # useRealtimeChat 등 훅
│   │   ├── ui/                 # UI 컴포넌트
│   │   └── index.ts
│   ├── inventory/
│   │   ├── add-item/           # 아이템 추가
│   │   ├── remove-item/        # 아이템 삭제
│   │   ├── update-quantity/    # 수량 변경
│   │   ├── use-item/           # 아이템 사용
│   │   ├── move-item/          # 아이템 이동
│   │   └── index.ts
│   └── proficiency/
│       ├── gain-proficiency/   # 숙련도 증가 액션
│       └── index.ts
├── entities/               # 비즈니스 엔티티
│   ├── character/
│   │   ├── api/                # DB 조회 (fetchCharacters 등)
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   ├── inventory/
│   │   ├── api/                # DB 조회 (fetchInventory)
│   │   ├── queries/            # React Query 훅 (useInventory)
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   ├── user/
│   │   ├── api/                # DB 조회 (fetchProfile)
│   │   ├── queries/            # React Query 훅 (useProfile)
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   ├── map/
│   │   ├── api/                # DB 조회 (fetchMaps)
│   │   ├── queries/            # React Query 훅 (useMaps)
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   ├── chat/
│   │   ├── api/                # DB 조회/저장
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   └── proficiency/
│       ├── api/                # DB 조회/수정 (fetchProficiencies, increaseProficiency)
│       ├── queries/            # React Query 훅 (useProficiencies)
│       ├── lib/                # 유틸리티 (getRank, getDamageBonus, getMagicEffectiveness)
│       ├── types/              # 타입 및 상수 정의
│       └── index.ts
└── shared/                 # 공유 코드
    ├── ui/                 # UI 컴포넌트
    ├── api/                # API 클라이언트
    │   ├── supabase.ts         # Supabase 인스턴스
    │   ├── auth.ts             # 인증 API 추상화
    │   └── index.ts
    ├── types/              # 공용 타입
    └── config/             # 설정 (테마 정의)
```

### FSD 규칙
1. **상위 레이어는 하위만 import**: app → widgets → features → entities → shared
2. **같은 레이어 간 import 금지**: features/auth는 features/character를 직접 import 불가
3. **Public API**: 각 슬라이스는 index.ts로 export 관리
4. **스토어 중앙 집중**: 모든 Zustand 스토어는 `application/stores/`에 위치
5. **액션 분리**: 동사형 폴더 (sign-out, register-location 등)로 비동기 액션 분리
6. **DB 조회 분리**: entities/*/api/에서 Supabase 조회 로직 관리
7. **타입 폴더 통일**: `model/` 대신 `types/` 폴더명 사용 (타입, 상수, 프리셋 등)

### 상태 관리 원칙
| 상태 종류 | 관리 방식 | 위치 |
|-----------|-----------|------|
| **서버 상태** (DB 데이터) | React Query | `entities/*/queries/` |
| **클라이언트 상태** (UI 상태) | Zustand | `application/stores/` |
| **폼 상태** | React Hook Form 또는 useState | 컴포넌트 내부 |
| **화면 메타데이터** (activeTab 등) | useState | 컴포넌트 내부 |

**서버 상태 사용 예시:**
```typescript
// entities/user/queries/useProfile.ts
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId || ""),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}

// 컴포넌트에서 사용
function GamePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useProfile(user?.id);
  // ...
}
```

**클라이언트 상태 사용 예시:**
```typescript
// application/stores/gameStore.ts - 연결 상태, 온라인 유저 등
// application/stores/chatStore.ts - 채팅 메시지, 캐시 등
```

## Git 커밋 컨벤션

### 형식
```
<type>: <description>

[optional body]
```

### Type
| Type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `style` | 코드 스타일/포맷 |
| `chore` | 빌드, 설정, 패키지 등 |
| `docs` | 문서 |
| `test` | 테스트 |
| `perf` | 성능 개선 |

### 예시
```
feat: 캐릭터 설정 페이지 추가
fix: 로그인 리다이렉트 오류 수정
refactor: 캐릭터 스토어 선언적 구조로 변경
chore: Supabase 패키지 업데이트
```

## 코딩 컨벤션

### Zustand 스토어
- 컴포넌트는 **선언적**으로 작성 (로직은 스토어에)
- 스토어에서 computed 값, 액션 모두 관리
- 컴포넌트는 스토어 훅만 호출
- **모든 스토어는 `@/application/stores`에서 import**
- **스토어에 isLoading, error 상태 금지** (서버 상태는 React Query가 처리)

```typescript
// 스토어 import
import { useAuthStore, useGameStore, useAppearancePart } from "@/application/stores";

// Good: 선언적 컴포넌트
function PartRow({ type }: { type: PartType }) {
  const { getPartInfo, next, prev } = useAppearancePart(type);
  const info = getPartInfo();
  return <Row label={info.label} onNext={next} onPrev={prev} {...info} />;
}

// Bad: 로직이 컴포넌트에
function PartRow({ type }) {
  const store = useAppearanceStore();
  const current = store.characterState?.[`${type}Index`] ?? -1;
  const total = store.spriteCounts?.[`${type}Count`] ?? 0;
  // ...
}
```

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- 훅/유틸: `camelCase.ts`
- 상수: `SCREAMING_SNAKE_CASE`

### 테마 시스템 (필수)
모든 UI 컴포넌트는 테마 시스템을 사용해야 합니다.

**테마 스토어 사용법:**
```typescript
import { useThemeStore } from "@/application/stores";

function MyComponent() {
  const { theme } = useThemeStore();

  return (
    <div
      style={{
        background: theme.colors.bg,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      내용
    </div>
  );
}
```

**사용 가능한 색상:**
| 색상 | 용도 |
|------|------|
| `bg` | 기본 배경 |
| `bgLight` | 밝은 배경 (헤더, 카드) |
| `bgDark` | 어두운 배경 (입력필드) |
| `text` | 기본 텍스트 |
| `textDim` | 흐린 텍스트 |
| `textMuted` | 더 흐린 텍스트 |
| `primary` | 주요 강조색 |
| `primaryDim` | 흐린 강조색 |
| `border` | 테두리 |
| `borderDim` | 흐린 테두리 |
| `success` | 성공/안전 |
| `warning` | 경고 |
| `error` | 에러/위험 |

**규칙:**
1. **하드코딩 금지**: `text-gray-400`, `bg-gray-800` 등 Tailwind 색상 클래스 사용 금지
2. **inline style 사용**: 색상은 `style={{ color: theme.colors.xxx }}` 형태로 적용
3. **font-mono 권장**: MUD 게임 분위기를 위해 `font-mono` 클래스 적극 사용
4. **투명도 활용**: `${theme.colors.primary}20` 형태로 투명도 적용 가능

**테마 변경 기능:**
- `ThemeSettingsModal` 컴포넌트로 테마 선택 UI 제공
- 5가지 테마: amber(골드), green(터미널), cyan(사이버), purple(마법), red(지옥)

## 주요 명령어

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run capture-sprites  # Unity 스프라이트 캡처
npm run upload-data      # Supabase Storage 업로드
```

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Unity 연동

### GameObject 이름
현재 씬의 CharacterCustomizer가 붙은 오브젝트: `SPUM_20260103203421028`

### JS 브릿지 메서드
- `JS_NextBody`, `JS_PrevBody`, `JS_SetBody`
- `JS_SetHairColor`, `JS_SetClothColor`, ...
- `JS_Randomize`, `JS_ClearAll`, `JS_ResetColors`

## 숙련도 시스템 (Proficiency)

경험치와 별개로 동작하는 사용 기반 숙련 시스템. 무기/마법을 사용할수록 해당 숙련도가 상승.

### 무기 숙련 (8종)
| ID | 이름 | 영문 | 관련 스탯 |
|----|------|------|----------|
| sword | 검 | Sword | STR/DEX |
| axe | 도끼 | Axe | STR |
| mace | 둔기 | Mace | STR |
| dagger | 단검 | Dagger | DEX |
| spear | 창 | Spear | STR/DEX |
| bow | 활 | Bow | DEX |
| crossbow | 석궁 | Crossbow | DEX |
| staff | 지팡이 | Staff | INT/WIS |

### 마법 숙련 (6속성)
| ID | 이름 | 영문 | 상성 (강함→약함) |
|----|------|------|-----------------|
| fire | 화염 | Fire | ice에 강함, earth에 약함 |
| ice | 냉기 | Ice | lightning에 강함, fire에 약함 |
| lightning | 번개 | Lightning | earth에 강함, ice에 약함 |
| earth | 대지 | Earth | fire에 강함, lightning에 약함 |
| holy | 신성 | Holy | dark에 강함 |
| dark | 암흑 | Dark | holy에 강함 |

### 숙련도 등급 (0-100)
| 레벨 | 등급 | 데미지 보너스 | 속도 보너스 |
|------|------|--------------|------------|
| 0-19 | 초보 (Novice) | 0% | 0% |
| 20-39 | 견습 (Apprentice) | +5% | 0% |
| 40-59 | 숙련 (Journeyman) | +10% | +5% |
| 60-79 | 전문가 (Expert) | +15% | +10% |
| 80-99 | 달인 (Master) | +20% | +15% |
| 100 | 대가 (Grandmaster) | +25% | +20% |

### 사용법
```typescript
// 숙련도 조회
import { useProficiencies, getRankInfo, getDamageBonus } from "@/entities/proficiency";

const { data: proficiencies } = useProficiencies(userId);
const swordLevel = proficiencies?.sword ?? 0;
const rank = getRankInfo(swordLevel); // { id: "novice", nameKo: "초보", ... }
const bonus = getDamageBonus(swordLevel); // 0

// 숙련도 증가 (전투 시)
import { useGainProficiency } from "@/features/proficiency";

const gainProficiency = useGainProficiency(userId);
gainProficiency.mutate({ type: "sword", amount: 1 });

// 마법 상성 계산
import { getMagicEffectiveness } from "@/entities/proficiency";

const multiplier = getMagicEffectiveness("fire", "ice"); // 1.5 (강함)
```

### DB 테이블
- `proficiencies`: user_id별 14개 숙련도 값 (0-100)
- RPC `increase_proficiency(p_user_id, p_type, p_amount)`: 감소율 적용된 숙련도 증가

### 요일별 속성 강화
한국어 요일 한자를 기반으로 매일 특정 마법 속성이 +20% 강화됨.

| 요일 | 한자 | 속성 | 배율 |
|------|------|------|------|
| 월 | 月 (달) | ice ❄️ | +20% |
| 화 | 火 (불) | fire 🔥 | +20% |
| 수 | 水 (물) | lightning ⚡ | +20% |
| 목 | 木 (나무) | earth 🪨 | +20% |
| 금 | 金 (금) | holy ✨ | +20% |
| 토 | 土 (흙) | dark 🌑 | +20% |
| 일 | 日 (해) | - | 휴식 |

**사용법**:
```typescript
import { getTodayBoostInfo, getDayBoostMultiplier } from "@/entities/proficiency";

// 오늘 강화 정보
const { element, dayNameKo, multiplier } = getTodayBoostInfo();
// 화요일: { element: "fire", dayNameKo: "화", multiplier: 1.2 }

// 특정 속성의 요일 배율
const boost = getDayBoostMultiplier("fire"); // 화요일이면 1.2, 아니면 1.0
```
