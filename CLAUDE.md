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
│       ├── battleStore.ts      # PvE 전투 상태
│       ├── pvpStore.ts         # PvP 결투 상태
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
│   ├── chat/                   # 채팅 기능
│   │   ├── send-message/       # 메시지 전송 액션
│   │   ├── lib/                # useRealtimeChat 훅
│   │   ├── ui/                 # ChatBox, ChatInput, ChatMessage
│   │   └── index.ts
│   ├── duel/                   # 결투 기능
│   │   ├── request-duel/       # 결투 신청
│   │   ├── respond-duel/       # 결투 수락/거절
│   │   ├── lib/                # useRealtimeDuel 훅
│   │   ├── ui/                 # DuelRequestModal, DuelBattlePanel
│   │   └── index.ts
│   ├── inventory/
│   │   ├── add-item/           # 아이템 추가
│   │   ├── remove-item/        # 아이템 삭제
│   │   ├── update-quantity/    # 수량 변경
│   │   ├── use-item/           # 아이템 사용
│   │   ├── move-item/          # 아이템 이동
│   │   └── index.ts
│   ├── proficiency/
│   │   ├── gain-proficiency/   # 숙련도 증가 액션
│   │   └── index.ts
│   ├── combat/                 # PvE 전투
│   │   ├── start-battle/       # 전투 시작
│   │   ├── use-ability/        # 어빌리티 사용
│   │   ├── execute-queue/      # 큐 실행
│   │   ├── end-battle/         # 전투 종료
│   │   ├── lib/                # damage.ts, monsterAi.ts, messages.ts
│   │   ├── ui/                 # BattlePanel, ActionPanel, BattleHeader 등
│   │   └── index.ts
│   └── pvp/                    # PvP 결투
│       ├── request-duel/       # 결투 신청
│       ├── respond-duel/       # 수락/거절
│       ├── duel-action/        # 턴 행동
│       ├── lib/duelHelpers.ts  # 유틸리티
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
│   │   ├── ui/                 # WorldMap, WorldMapModal, MapSelector
│   │   └── index.ts
│   ├── monster/
│   │   ├── api/                # JSON 데이터 로드 (fetchMonsters)
│   │   ├── queries/            # React Query 훅 (useMonsters)
│   │   ├── lib/                # 유틸리티 (rollDrops, resistance)
│   │   ├── types/              # 타입 정의
│   │   ├── ui/                 # MonsterList
│   │   └── index.ts
│   ├── npc/
│   │   ├── api/                # JSON 데이터 로드 (fetchNpcs)
│   │   ├── queries/            # React Query 훅 (useNpcs)
│   │   ├── types/              # 타입 정의
│   │   ├── ui/                 # NpcList, HealerDialog
│   │   └── index.ts
│   ├── player/
│   │   ├── ui/                 # PlayerList, PlayerContextMenu
│   │   └── index.ts
│   ├── injury/
│   │   ├── lib/                # 유틸리티 (checkInjuryOccurrence)
│   │   ├── types/              # 타입 정의 (constants)
│   │   ├── ui/                 # InjuryDisplay
│   │   └── index.ts
│   ├── chat/
│   │   ├── api/                # DB 조회/저장
│   │   ├── types/              # 타입 정의
│   │   └── index.ts
│   ├── ability/                # 통합 어빌리티 시스템 (마법+스킬+숙련도)
│   │   ├── api/                # JSON 데이터 로드, 숙련도 함수
│   │   ├── queries/            # React Query 훅 (useAbilities)
│   │   ├── types/              # Ability, AbilityType, Proficiencies 타입
│   │   └── index.ts
│   └── item/
│       ├── api/                # JSON 데이터 로드 (fetchItems, fetchItemById)
│       ├── queries/            # React Query 훅 (useItems, useItem)
│       ├── lib/                # 유틸리티 (getRarityColor, calculateWeight)
│       ├── types/              # 아이템 타입, 등급, 무게 설정
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
8. **UI 위치 규칙**:
   - **기능 UI** (액션 포함): `features/*/ui/` (예: BattlePanel → `features/combat/ui/`)
   - **엔티티 표시 UI** (리스트, 뷰어): `entities/*/ui/` (예: MonsterList → `entities/monster/ui/`)
   - **채팅 UI**: `features/chat/ui/`
   - **결투 UI**: `features/duel/ui/`

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

## 테스트 페이지 (`/test`)

개발용 테스트 페이지. 두 가지 형식의 차이를 명확히 이해해야 함.

### 게임 테스트 (`/test/game`) - DB ID 기반

**용도**: 실제 게임에서 DB에 저장되는 형식 테스트

**저장 형식 (profiles 테이블)**:
```typescript
// character (JSONB) - 캐릭터 기본 정보 (외형 데이터 제외)
{
  "id": "char_xxx",
  "name": "캐릭터명",
  "gender": "male",
  "isMain": true,
  "preset": "warrior",
  "stats": {                          // 능력치
    "str": 15, "dex": 10, "con": 12,
    "int": 10, "wis": 10, "cha": 10, "lck": 10
  },
  "createdAt": "2026-01-01T00:00:00Z"
}

// appearance (JSONB) - 외형 데이터 (ID 기반)
{
  "raceId": "eastern_human",          // 종족 ID (races.json의 id)
  "eyeId": "eye_01",                  // 눈 ID (eye.json의 id)
  "hairId": "elf_hair_01",            // 머리 ID (hair.json의 id)
  "facehairId": null,                 // 수염 ID (facehair.json의 id)
  "hairColor": "#8B4513",             // 색상 hex
  "leftEyeColor": "#4A3728",
  "rightEyeColor": "#4A3728",
  "faceHairColor": "#8B4513"
}

// equipment (JSONB) - 장비 정보
{
  "rightHandId": "iron_sword",        // 아이템 ID (items/*.json의 id)
  "leftHandId": "wooden_shield",
  "helmetId": null,
  "armorId": "leather_armor",
  "clothId": null,
  "pantsId": "cloth_pants",
  "backId": null
}
```

**ID 매핑 흐름**:
1. 사용자가 "녹슨 검" 선택
2. `equipment.rightHandId = "rusty_sword"` (DB에 저장)
3. 게임 로드 시 `rusty_sword` → `spriteId: "elf_weapon_01"` → Unity 인덱스 변환

### 유니티 테스트 (`/test/unity`) - 스프라이트 인덱스 기반

**용도**: Unity WebGL이 직접 이해하는 형식 테스트

**저장 형식 (Unity 내부)**:
```typescript
// Unity가 받는 값 (JS_Set* 메서드 파라미터)
{
  rightWeapon: "Sword,3",           // "무기타입,스프라이트인덱스"
  leftWeapon: "Shield,0",
  helmet: 5,                        // 스프라이트 인덱스
  armor: 2,
  cloth: -1,                        // -1 = 없음
  pants: 1,
  back: -1
}

// Unity appearance
{
  bodyIndex: 3,                     // 신체 스프라이트 인덱스
  eyeIndex: 2,
  hairIndex: 5,
  facehairIndex: -1,
  hairColor: "#8B4513",
  leftEyeColor: "#4A3728",
  rightEyeColor: "#4A3728",
  faceHairColor: "#8B4513"
}
```

### 두 형식의 관계

```
[게임 DB]                         [변환]                      [Unity]
equipment.rightHandId        →  items.json에서 spriteId 조회  →  JS_SetRightWeapon("Sword,3")
  "iron_sword"                    "elf_weapon_03"                 인덱스 3

appearance.eyeId             →  eye.json에서 index 조회       →  JS_SetEye("2")
  "eye_01"                        index: 2                        인덱스 2

appearance.hairId            →  hair.json에서 index 조회      →  JS_SetHair("5")
  "elf_hair_01"                   index: 5                        인덱스 5
```

**참고**: `appearance` 컬럼은 ID 기반으로 저장되므로, 스프라이트 JSON 파일에서 인덱스를 조회해 Unity에 전달해야 합니다.

**핵심 차이**:
| 항목 | 게임 테스트 (DB) | 유니티 테스트 |
|------|------------------|---------------|
| 저장 값 | 아이템/외형 ID | 스프라이트 인덱스 |
| 용도 | 게임 저장/로드 | Unity 렌더링 |
| 예시 | `"iron_sword"` | `3` |
| 변환 필요 | O (ID → 인덱스) | X (직접 사용) |

## 주요 명령어

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run capture-sprites  # Unity 스프라이트 캡처
npm run upload-data      # Supabase Storage 업로드
```

## 데이터 생성 시스템

게임 데이터는 개별 JSON 파일로 관리하고, 스크립트로 통합 JSON을 생성합니다.

### !! 중요: 데이터 수정 워크플로우 !!

**데이터 수정 시 반드시 아래 3단계를 모두 수행해야 합니다:**

```bash
# 1. 개별 JSON 수정 (예: public/data/monsters/amorphous/slime.json)

# 2. 통합 JSON 생성 (필수!)
npx tsx scripts/generate-monsters.ts   # 몬스터
npx tsx scripts/generate-maps.ts       # 맵
npx tsx scripts/generate-items.ts      # 아이템
npx tsx scripts/generate-abilities.ts  # 어빌리티
npx tsx scripts/generate-races.ts      # 종족
npx tsx scripts/generate-appearance.ts # 외형

# 3. Supabase Storage 업로드 (필수!)
npm run upload-data
```

| 데이터 | 개별 파일 위치 | 통합 파일 | 생성 스크립트 |
|--------|---------------|----------|--------------|
| 몬스터 | `monsters/[type]/*.json` | `monsters.json` | `generate-monsters.ts` |
| 맵 | `world/maps/[region]/*.json` | `world/maps.json` | `generate-maps.ts` |
| 아이템 | `items/[category]/*.json` | `*.json` (카테고리별) | `generate-items.ts` |
| 어빌리티 | `abilities/[type]/*.json` | `*skills.json` | `generate-abilities.ts` |
| 종족 | `appearance/races/[race]/*.json` | `races.json` | `generate-races.ts` |

**빠뜨리면 안 되는 이유:**
- 게임은 통합 JSON만 로드함 (개별 파일은 편집용)
- Supabase Storage가 기본 데이터 소스 (로컬은 fallback)
- 업로드 안 하면 브라우저에서 구버전 데이터 사용

### 아이템 데이터 (`/public/data/items/`)

```
items/
├── equipment/              # 장비 (개별 파일)
│   ├── weapons/
│   │   ├── swords.json
│   │   ├── axes.json
│   │   └── ...
│   ├── wearables/          # 방어구 (armors → wearables로 변경)
│   │   ├── helmets.json
│   │   ├── armors.json     # 갑옷 (chests.json → armors.json으로 변경)
│   │   ├── clothes.json
│   │   ├── pants.json
│   │   ├── backs.json
│   │   └── ...
│   └── accessories/
│       ├── rings.json
│       └── necklaces.json
├── consumables/            # 소비 아이템 (개별 파일)
│   ├── potions.json
│   ├── food.json
│   └── scrolls.json
├── materials/              # 재료 (개별 파일)
│   ├── ores.json
│   ├── herbs.json
│   └── ...
├── misc/                   # 기타 (개별 파일)
│   ├── keys.json
│   └── quest.json
├── metadata.json           # 메타데이터 (등급, 색상 시스템 등)
├── equipment.json          # ← 생성됨 (weapons + wearables + accessories)
├── consumables.json        # ← 생성됨
├── materials.json          # ← 생성됨
└── misc.json               # ← 생성됨
```

**생성 명령:**
```bash
npx tsx scripts/generate-items.ts
```

### 종족 데이터 (`/public/data/appearance/races/`)

```
appearance/races/
├── humans/                 # 인간 변종 (개별 파일)
│   ├── northern.json
│   ├── southern.json
│   └── ...
├── elves/                  # 엘프 변종 (개별 파일)
│   ├── high_elf.json
│   ├── wood_elf.json
│   └── ...
├── dwarves/
├── orcs/
├── undead/
├── others/
├── metadata.json           # 메타데이터 (색상 프리셋 등)
└── races.json              # ← 생성됨 (모든 종족 통합)
```

**생성 명령:**
```bash
npx tsx scripts/generate-races.ts
```

### NPC 데이터 (`/public/data/npcs/`)

```
npcs/
├── healers.json            # 치료사 NPC
├── merchants.json          # 상인 NPC (향후)
├── trainers.json           # 훈련사 NPC (향후)
└── quests.json             # 퀘스트 NPC (향후)
```

### 외형 데이터 (`/public/data/appearance/`)

```
appearance/
├── eyes/                   # 눈 외형 (종족별 개별 파일)
│   ├── human.json
│   ├── elf.json
│   ├── dwarf.json
│   ├── metadata.json       # 눈 메타데이터
│   └── ...
├── facehair/               # 수염 외형 (종족별 개별 파일)
│   ├── human.json
│   ├── dwarf.json
│   ├── metadata.json       # 수염 메타데이터
│   └── ...
├── metadata.json           # 외형 메타데이터 (카테고리, 색상 프리셋 등)
├── eyes.json               # ← 생성됨 (모든 종족 눈 통합)
└── facehair.json           # ← 생성됨 (모든 종족 수염 통합)
```

**생성 명령:**
```bash
npx tsx scripts/generate-appearance.ts
```

### 능력 데이터 (`/public/data/abilities/`)

```
abilities/
├── spell/                  # 마법 주문 (속성별 개별 파일)
│   ├── fire.json           # 화염 마법
│   ├── ice.json            # 냉기 마법
│   ├── lightning.json      # 번개 마법
│   ├── earth.json          # 대지 마법
│   ├── holy.json           # 신성 마법 + 치유 마법
│   ├── dark.json           # 암흑 마법
│   └── metadata.json       # 속성 상성, 요일 강화 등
├── lifeskill/              # 생활 스킬
│   ├── medical.json        # 의료 (응급처치, 약초학, 수술)
│   └── knowledge.json      # 지식 (해부학, 금속학, 식물학, 보석학)
├── craftskill/             # 제작 스킬 (하위 폴더 구조)
│   ├── blacksmithing/      # 대장장이
│   ├── tailoring/          # 재봉
│   ├── cooking/            # 요리
│   ├── alchemy/            # 연금술
│   └── jewelcrafting/      # 보석세공
├── combatskill/            # 전투 스킬 (하위 폴더 구조)
│   ├── weapon/             # 무기 스킬
│   │   ├── sword/          # 검술 (common, light_sword, medium_sword, great_sword)
│   │   ├── axe.json        # 도끼술
│   │   ├── mace.json       # 둔기술
│   │   ├── dagger.json     # 단검술
│   │   ├── spear.json      # 창술
│   │   ├── bow.json        # 궁술
│   │   ├── crossbow.json   # 석궁술
│   │   ├── staff.json      # 장봉술
│   │   ├── shield.json     # 방패술
│   │   └── dual_wield.json # 쌍수
│   ├── martial/            # 무술 스킬 (fist, kick, stance)
│   ├── defense/            # 방어 스킬
│   ├── utility/            # 전술 스킬
│   └── warcry/             # 함성 스킬 (전투 외침)
├── song/                   # 노래 스킬 (별도 카테고리)
│   └── song.json           # 유지형/즉시형 노래
├── metadata.json           # 능력 메타데이터
├── spells.json             # ← 생성됨 (43개 마법 통합)
├── lifeskills.json         # ← 생성됨 (7개 생활 스킬 통합)
├── craftskills.json        # ← 생성됨 (42개 제작 스킬 통합)
└── combatskills.json       # ← 생성됨 (89개 전투 스킬 통합)
```

### 스킬 타입 체계 (v2.0)

모든 스킬은 `type` 필드로 주요 효과를 분류하고, 공격 스킬은 추가로 `attackType`으로 데미지 계산 방식을 지정합니다.

#### 스킬 타입 (type)
| type | 한글 | 설명 | UI 색상 |
|------|------|------|---------|
| `passive` | 패시브 | 항상 적용되는 지속 효과 | #9CA3AF (회색) |
| `attack` | 공격 | 적에게 피해를 주는 스킬 | #EF4444 (빨강) |
| `heal` | 치유 | HP를 회복하는 스킬 | #22C55E (초록) |
| `buff` | 버프 | 자신/아군 능력치 강화 | #3B82F6 (파랑) |
| `debuff` | 디버프 | 적 능력치 약화 | #A855F7 (보라) |
| `utility` | 유틸리티 | 전투 보조 (분석, 이동, 상태해제) | #F59E0B (주황) |
| `craft` | 제작 | 아이템 제작 스킬 | #8B5CF6 (보라) |

#### 공격 타입 (attackType)
`type: "attack"`인 스킬에만 적용됩니다.

| attackType | 한글 | 데미지 스케일링 | 방어 타입 |
|------------|------|----------------|----------|
| `melee_physical` | 근접 물리 | STR/DEX | physical |
| `ranged_physical` | 원거리 물리 | DEX | physical |
| `magic` | 마법 | INT/WIS | magical |
| `dot` | 지속 피해 | varies | varies |

#### 스킬 데이터 예시
```json
{
  "id": "chop",
  "nameKo": "찍기",
  "type": "attack",
  "attackType": "melee_physical",
  "usageContext": "combat_only",
  "baseDamage": 30,
  "apCost": 6
}
```

### 스킬 사용 컨텍스트 (usageContext)

모든 스킬에는 `usageContext` 필드가 있어 언제 사용 가능한지 구분합니다.

| usageContext | 설명 | 예시 |
|--------------|------|------|
| `passive` | 항상 적용 (패시브 스킬) | 제작 숙련도 보너스, 지식 스킬 |
| `combat_only` | 전투에서만 사용 가능 | 공격 마법, 무기 스킬, 디버프 |
| `field_only` | 일반 상황에서만 사용 가능 | 제작, 수리, 채집 |
| `both` | 전투/일반 모두 사용 가능 | 치유 마법, 버프 마법 |

### 속성 상성 시스템

마법 속성 간 상성 관계가 적용됩니다.

```
fire ─(강함)→ ice ─(강함)→ lightning ─(강함)→ earth ─(강함)→ fire (순환)
holy ←→ dark (상호 강함)
```

| 공격 속성 | 강한 대상 | 약한 대상 | 강함 배율 | 약함 배율 |
|----------|----------|----------|----------|----------|
| fire | ice | earth | 1.5x | 0.75x |
| ice | lightning | fire | 1.5x | 0.75x |
| lightning | earth | ice | 1.5x | 0.75x |
| earth | fire | lightning | 1.5x | 0.75x |
| holy | dark | - | 1.5x | 1.0x |
| dark | holy | - | 1.5x | 1.0x |

### 요일별 속성 강화

한국어 요일 한자를 기반으로 매일 특정 마법 속성이 +20% 강화됩니다.

| 요일 | 한자 | 속성 | 배율 |
|------|------|------|------|
| 월 | 月 (달) | ice | 1.2x |
| 화 | 火 (불) | fire | 1.2x |
| 수 | 水 (물) | lightning | 1.2x |
| 목 | 木 (나무) | earth | 1.2x |
| 금 | 金 (금) | holy | 1.2x |
| 토 | 土 (흙) | dark | 1.2x |
| 일 | 日 (해) | - | 휴식의 날 |

**생성 명령:**
```bash
npx tsx scripts/generate-abilities.ts
```

### 데이터 파일 규칙

1. **개별 파일**: 편집용 원본 데이터 (weapons/swords.json 등)
2. **통합 파일**: 런타임 로드용 (equipment.json 등) - 스크립트로 생성
3. **metadata.json**: 시스템 메타데이터 (등급, 색상 프리셋 등)
4. **spriteId 사용**: 스프라이트 참조는 인덱스가 아닌 ID 사용

```json
// 개별 파일 (swords.json)
{
  "category": "equipment",
  "subcategory": "weapon",
  "weaponType": "sword",
  "spriteMapping": "/data/sprites/equipment/weapon/sword.json",
  "items": [
    {
      "id": "iron_sword",
      "spriteId": "elf_weapon_03",  // spriteIndex 대신 spriteId 사용
      ...
    }
  ]
}
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

**참고**: 숙련도 타입과 함수는 `@/entities/ability`에서 관리합니다. (어빌리티 시스템 섹션 참조)

### 무기 숙련 (12종)
| ID | 이름 | 아이콘 | 관련 스탯 |
|----|------|--------|----------|
| light_sword | 세검 | 🗡️ | DEX |
| medium_sword | 중검 | ⚔️ | STR/DEX |
| great_sword | 대검 | 🗡️ | STR |
| axe | 도끼 | 🪓 | STR |
| mace | 둔기 | 🔨 | STR |
| dagger | 단검 | 🔪 | DEX |
| spear | 창 | 🔱 | STR/DEX |
| bow | 활 | 🏹 | DEX |
| crossbow | 석궁 | 🎯 | DEX |
| staff | 지팡이 | 🪄 | INT/WIS |
| fist | 주먹 | 👊 | STR/DEX |
| shield | 방패 | 🛡️ | CON |

### 마법 숙련 (7속성)
| ID | 이름 | 아이콘 | 상성 (강함→약함) |
|----|------|--------|-----------------|
| fire | 화염 | 🔥 | ice에 강함, earth에 약함 |
| ice | 냉기 | ❄️ | lightning에 강함, fire에 약함 |
| lightning | 번개 | ⚡ | earth에 강함, ice에 약함 |
| earth | 대지 | 🪨 | fire에 강함, lightning에 약함 |
| holy | 신성 | ✨ | dark에 강함 |
| dark | 암흑 | 🌑 | holy에 강함 |
| poison | 독 | ☠️ | - |

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
// 숙련도 관련 함수는 @/entities/ability에서 import
import {
  useProficiencies,
  getProficiencyValue,
  getProficiencyInfo,
  getRankInfo,
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
} from "@/entities/ability";

// 숙련도 조회
const { data: proficiencies } = useProficiencies(userId);
const swordLevel = getProficiencyValue(proficiencies, "medium_sword");
const rank = getRankInfo(swordLevel); // { id: "novice", nameKo: "초보", ... }
const bonus = getDamageMultiplier(swordLevel);

// 마법 상성 계산
const multiplier = getMagicEffectiveness("fire", "ice"); // 1.5 (강함)
```

### DB 테이블
- `proficiencies`: user_id별 숙련도 값 (0-100)
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
import { getDayBoostMultiplier } from "@/entities/ability";

// 특정 속성의 요일 배율
const boost = getDayBoostMultiplier("fire"); // 화요일이면 1.2, 아니면 1.0
```

## 전투 시스템 (Combat)

턴제 전투 시스템. 상세 기획은 [docs/combat-system.md](docs/combat-system.md) 참조.

### 주요 기능
- 데미지 편차 (±15%)
- 공격 판정: 빗맞음 → 회피 → 막기 → 치명타 → 명중
- 회피(DEX), 막기(CON), 치명타(LCK) 스탯 연동
- 선공/비선공 시스템 (몬스터 behavior 기반)

### 선공 시스템 (Preemptive Strike)

몬스터 `behavior` 필드에 따라 선공이 결정됨. 상세 기획은 [docs/preemptive-system.md](docs/preemptive-system.md) 참조.

| behavior | 선공 | 설명 |
|----------|------|------|
| `passive` | 플레이어 | 공격 안 함 (훈련용) |
| `defensive` | 플레이어 | 방어적, 플레이어가 먼저 |
| `aggressive` | **몬스터** | 공격적, 몬스터가 선제공격 |

```typescript
// BattleState 선공 관련 필드
interface BattleState {
  isPreemptivePhase: boolean;  // 선제공격 단계
  monsterGoesFirst: boolean;   // 몬스터 선공 여부
}
```

### 저항 시스템 (Resistance System)

몬스터는 두 가지 종류의 저항을 가질 수 있습니다:

**중요**: 물리 공격은 물리 저항에만 영향받고, 마법 공격은 속성 저항에만 영향받습니다.

#### 물리 저항 (Physical Resistance)
물리 공격(근접/원거리)에만 적용됩니다.

| 타입 | 필드명 | 설명 | 관련 무기 |
|------|--------|------|----------|
| 베기 | `slashResist` | 검, 도끼 등의 베기 공격 | sword, axe |
| 찌르기 | `pierceResist` | 창, 단검, 활 등의 찌르기 공격 | spear, dagger, bow |
| 타격 | `crushResist` | 둔기, 주먹 등의 타격 공격 | mace, fist, staff |

#### 속성 저항 (Element Resistance)
마법 공격에만 적용됩니다.

| 속성 | 필드명 | 아이콘 |
|------|--------|--------|
| 화염 | `fire` | 🔥 |
| 냉기 | `ice` | ❄️ |
| 번개 | `lightning` | ⚡ |
| 대지 | `earth` | 🪨 |
| 신성 | `holy` | ✨ |
| 암흑 | `dark` | 🌑 |
| 독 | `poison` | ☠️ |

#### 저항 배율
| 값 | 의미 | 효과 |
|----|------|------|
| 0.5 | 강함 | 데미지 50% 감소 |
| 1.0 | 보통 | 기본 데미지 |
| 1.5 | 약함 | 데미지 50% 증가 |

#### 몬스터 데이터 예시
```json
{
  "stats": {
    "hp": 50,
    "attack": 10,
    "defense": 5,
    "speed": 8,
    "physicalResist": {
      "slashResist": 1.0,
      "pierceResist": 1.5,
      "crushResist": 0.5
    },
    "elementResist": {
      "fire": 1.5,
      "ice": 0.5,
      "lightning": 1.0
    }
  }
}
```

#### 사용법
```typescript
import { getPhysicalResistance, getElementResistance } from "@/entities/monster";

// 물리 공격 시 - 물리 저항 적용
const physicalMultiplier = getPhysicalResistance(monster.stats, "slash");

// 마법 공격 시 - 속성 저항 적용
const elementMultiplier = getElementResistance(monster.stats, "fire");
```

### 사용법
```typescript
import { useStartBattle, useAttack, useEndBattle } from "@/features/combat";
import { useMonstersByMap } from "@/entities/monster";
import { useBattleStore } from "@/application/stores";

// 몬스터 조회
const { data: monsters } = useMonstersByMap("training_ground");

// 전투 시작
const { start } = useStartBattle();
start(monster, playerHp, playerMaxHp);

// 공격
const { attack } = useAttack();
attack({
  attackType: "sword",
  proficiencyLevel: 10,
  attackerStats: { str: 10, dex: 8, ... },
});

// 전투 종료 및 보상
const { endBattle, isVictory } = useEndBattle({ userId });
if (isVictory) endBattle(); // 보상 지급 + 숙련도 상승
```

## 어빌리티 시스템 (Ability)

**중요**: 이 프로젝트에서는 "스킬(Skill)"이나 "마법(Spell)" 대신 **"어빌리티(Ability)"** 용어를 사용합니다.
모든 전투 행동(물리 공격, 마법, 버프, 디버프 등)은 통합된 `Ability` 타입으로 관리됩니다.

### 데이터 구조 (`public/data/abilities/`)

```
public/data/abilities/
├── spell/                  # 마법 주문 (속성별)
│   ├── fire.json           # 화염 마법
│   ├── ice.json            # 냉기 마법
│   ├── lightning.json      # 번개 마법
│   ├── earth.json          # 대지 마법
│   ├── holy.json           # 신성 마법 + 치유
│   ├── dark.json           # 암흑 마법
│   └── metadata.json       # 속성 상성, 요일 강화
├── combatskill/            # 전투 스킬
│   ├── weapon/             # 무기 스킬
│   │   ├── sword/          # 검술 (common, light_sword, medium_sword, great_sword)
│   │   ├── axe.json        # 도끼술
│   │   ├── mace.json       # 둔기술
│   │   ├── dagger.json     # 단검술
│   │   ├── spear.json      # 창술
│   │   ├── bow.json        # 궁술
│   │   ├── crossbow.json   # 석궁술
│   │   ├── staff.json      # 장봉술
│   │   ├── shield.json     # 방패술
│   │   └── dual_wield.json # 쌍수
│   ├── martial/            # 무술 (fist, kick, stance)
│   ├── defense/            # 방어 스킬
│   ├── utility/            # 전술 스킬
│   ├── warcry/             # 함성 스킬
│   └── common/             # 공용 스킬
├── lifeskill/              # 생활 스킬
│   ├── medical.json        # 의료 (응급처치, 약초학, 수술)
│   └── knowledge.json      # 지식 (해부학, 금속학, 식물학, 보석학)
├── craftskill/             # 제작 스킬
│   ├── blacksmithing/      # 대장장이
│   ├── tailoring/          # 재봉
│   ├── cooking/            # 요리
│   ├── alchemy/            # 연금술
│   └── jewelcrafting/      # 보석세공
├── song/                   # 노래 스킬
│   └── song.json           # 유지형/즉시형 노래
├── metadata.json           # 어빌리티 메타데이터
├── spells.json             # 생성됨 (마법 통합)
├── combatskills.json       # 생성됨 (전투 스킬 통합)
├── lifeskills.json         # 생성됨 (생활 스킬 통합)
└── craftskills.json        # 생성됨 (제작 스킬 통합)
```

### 어빌리티 타입 (AbilityType)

| type | 설명 | UI 색상 |
|------|------|---------|
| `passive` | 패시브 (항상 적용) | #9CA3AF (회색) |
| `attack` | 공격 (적에게 피해) | #EF4444 (빨강) |
| `heal` | 치유 (HP 회복) | #22C55E (초록) |
| `buff` | 버프 (자신/아군 강화) | #3B82F6 (파랑) |
| `debuff` | 디버프 (적 약화) | #A855F7 (보라) |
| `utility` | 유틸리티 (분석, 이동) | #F59E0B (주황) |
| `defense` | 방어 (가드, 회피) | - |

### 공격 타입 (AttackType)

`type: "attack"`인 어빌리티에만 적용됩니다.

| attackType | 데미지 스케일링 | 방어 타입 |
|------------|----------------|----------|
| `melee_physical` | STR/DEX | 물리 |
| `ranged_physical` | DEX | 물리 |
| `magic` | INT/WIS | 마법 |

### 물리 공격 타입 (PhysicalAttackType)

무기별 물리 데미지 속성 (저항 계산용):

| 타입 | 설명 | 주요 무기 |
|------|------|----------|
| `slash` | 베기 | 검, 도끼 |
| `pierce` | 찌르기 | 창, 단검, 활 |
| `blunt` | 타격 | 둔기, 방패, 주먹 |
| `crush` | 분쇄 | 도끼, 둔기 |

### 마법 속성 (MagicElement)

| 속성 | 아이콘 | 상성 (강함) | 상성 (약함) |
|------|--------|------------|------------|
| fire | 🔥 | ice | earth |
| ice | ❄️ | lightning | fire |
| lightning | ⚡ | earth | ice |
| earth | 🪨 | fire | lightning |
| holy | ✨ | dark | - |
| dark | 🌑 | holy | - |
| poison | ☠️ | - | - |

### 무기 숙련도 타입 (WeaponType)

| 타입 | 이름 | 아이콘 | 특성 |
|------|------|--------|------|
| `light_sword` | 세검 | 🗡️ | DEX, 찌르기 |
| `medium_sword` | 중검 | ⚔️ | STR/DEX, 베기 |
| `great_sword` | 대검 | 🗡️ | STR, 베기/패리 |
| `axe` | 도끼 | 🪓 | STR, 강력 일격 |
| `mace` | 둔기 | 🔨 | STR, 방어 무시 |
| `dagger` | 단검 | 🔪 | DEX, 빠른 연속 |
| `spear` | 창 | 🔱 | STR/DEX, 긴 사거리 |
| `bow` | 활 | 🏹 | DEX, 원거리 |
| `crossbow` | 석궁 | 🎯 | DEX, 강한 원거리 |
| `staff` | 지팡이 | 🪄 | INT/WIS, 마법 증폭 |
| `fist` | 주먹 | 👊 | STR/DEX, 맨손 |
| `shield` | 방패 | 🛡️ | CON, 방어 |

### Ability 인터페이스

```typescript
interface Ability {
  id: string;
  nameKo: string;
  nameEn: string;
  description: { ko: string; en: string };
  icon: string;

  // 분류
  source: "spell" | "combatskill" | "monster";
  type: AbilityType;           // attack, heal, buff 등
  attackType?: AttackType;     // attack일 때만 (melee_physical, ranged_physical, magic)
  element?: MagicElement;      // 마법 속성

  // 사용 컨텍스트
  usageContext: "passive" | "combat_only" | "field_only" | "both";

  // 레벨/숙련도
  maxLevel: number;
  expPerLevel: number;
  levelBonuses: AbilityLevelBonus[];

  // 비용
  baseCost: {
    ap?: number;    // 액션 포인트 (물리)
    mp?: number;    // 마나 포인트 (마법)
  };

  // 요구 조건
  requirements: AbilityRequirements;

  // 타겟
  target?: "self" | "enemy" | "all_enemies" | "all_allies";
}
```

### 숙련도 타입 (통합)

숙련도 관련 타입들은 `@/entities/ability`에서 관리합니다:

```typescript
import type {
  WeaponType,           // 무기 12종
  MagicElement,         // 마법 7속성
  PhysicalAttackType,   // 물리 공격 타입
  CombatProficiencyType, // WeaponType | MagicElement
  ProficiencyType,      // 전체 숙련도 타입
  Proficiencies,        // 숙련도 값 객체
} from "@/entities/ability";
```

### 사용법

```typescript
import {
  useAbilities,
  getProficiencyValue,
  getProficiencyInfo,
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  WEAPON_ATTACK_TYPE,
  WEAPON_PROFICIENCIES,
  MAGIC_PROFICIENCIES,
} from "@/entities/ability";
import type { Ability, WeaponType, MagicElement } from "@/entities/ability";

// 모든 어빌리티 조회
const { data: abilities } = useAbilities();

// 마법 어빌리티 필터링
const magicAbilities = abilities.filter(
  (a) => a.type === "attack" && a.attackType === "magic"
);

// 숙련도 값 조회
const swordLevel = getProficiencyValue(proficiencies, "medium_sword");

// 숙련도 정보 조회
const info = getProficiencyInfo("fire"); // { nameKo: "화염", icon: "🔥", ... }

// 무기별 물리 공격 타입 조회
const attackType = WEAPON_ATTACK_TYPE["medium_sword"]; // "slash"
```

### 폴더 구조 (코드)

```
src/entities/ability/
├── types/index.ts           # Ability, AbilityType, Proficiencies 타입
├── api/index.ts             # fetchAbilities, 숙련도 함수, 상수
├── queries/index.ts         # useAbilities
└── index.ts                 # Public API
```

### 용어 규칙

| 사용하지 않음 | 대신 사용 |
|--------------|----------|
| Skill | Ability |
| Spell | Ability (source: "spell") |
| useSkills | useAbilities |
| skill.mpCost | ability.baseCost.mp |
| skill.description | ability.description.ko |

코드에서 "skill"이라는 단어가 보이면 "ability"로 변경하세요.

## 아이템 시스템 (Item)

아이템 데이터 관리 및 인벤토리 연동. 상세 기획은 `/public/data/items.json` 참조.

### 아이템 분류 (ItemType)
| 타입 | 설명 | 스택 |
|------|------|------|
| `equipment` | 장비 (무기, 방어구) | 불가 |
| `consumable` | 소비 (물약, 음식) | 20 |
| `material` | 재료 (드랍템) | 99 |
| `misc` | 기타 (열쇠, 퀘스트) | 10 |

### 등급 시스템 (Rarity) - 아키에이지 13단계

| Tier | 등급 | 한글 | 색상 | 드랍 배율 | 가치 배율 |
|------|------|------|------|----------|----------|
| 0 | crude | 저급 | gray-500 | 1.5x | 0.5x |
| 1 | common | 일반 | gray-300 | 1.0x | 1.0x |
| 2 | grand | 고급 | green | 0.6x | 2.0x |
| 3 | rare | 희귀 | blue | 0.35x | 4.0x |
| 4 | arcane | 고대 | yellow | 0.2x | 8.0x |
| 5 | heroic | 영웅 | orange | 0.12x | 15.0x |
| 6 | unique | 유일 | purple | 0.07x | 30.0x |
| 7 | celestial | 유물 | red | 0.03x | 60.0x |
| 8 | divine | 경이 | pink | 0.015x | 120.0x |
| 9 | epic | 서사 | cyan | 0.007x | 250.0x |
| 10 | legendary | 전설 | amber | 0.003x | 500.0x |
| 11 | mythic | 신화 | red-pink | 0.001x | 1000.0x |
| 12 | eternal | 태초 | gold | 0.0003x | 2500.0x |

### 무게 시스템
```
최대 소지량 = 50kg + (STR × 2kg)
과적 (100~150%) = 속도 50% 감소
150% 초과 = 아이템 획득 불가
```

### 사용법
```typescript
import { useItems, useItem, getRarityColor, calculateMaxCarryCapacity } from "@/entities/item";
import { useAddItem } from "@/features/inventory";

// 아이템 조회
const { data: items } = useItems();
const { data: acorn } = useItem("acorn");

// 등급 색상
const color = getRarityColor("rare"); // #3B82F6

// 무게 계산
const maxWeight = calculateMaxCarryCapacity({ str: 15 }); // 80kg

// 인벤토리 추가
const addItem = useAddItem(userId);
addItem.mutate({ itemId: "acorn", itemType: "material", quantity: 3 });
```

### 몬스터 드랍
전투 승리 시 자동으로 드랍 아이템이 인벤토리에 추가됩니다.
- 드랍 확률은 `monsters.json`의 `drops` 필드에 정의
- 등급에 따라 드랍 확률이 조정됨

## 경험치/레벨 시스템 (Experience/Level)

전투 승리 시 경험치 획득, 레벨업 처리.

### 레벨업 공식
```
필요 경험치 = 현재 레벨 × 100
예: Lv.1 → 100exp, Lv.5 → 500exp, Lv.10 → 1000exp
```

### 경험치 보너스
| 조건 | 배율 |
|------|------|
| 높은 레벨 몬스터 | +10% × 레벨 차이 |
| 5레벨 이하 몬스터 | -50% |
| 기본 | 100% |

### 사용법
```typescript
import { checkLevelUp, getExpForLevel, updateProfile } from "@/entities/user";

// 레벨업 체크
const result = checkLevelUp(currentLevel, currentExp + gainedExp);
// { newLevel: 2, newExp: 50, leveledUp: true, levelsGained: 1 }

// 프로필 업데이트
await updateProfile({
  userId,
  level: result.newLevel,
  experience: result.newExp,
  gold: profile.gold + rewards.gold,
});
```

## 피로도 시스템 (Fatigue)

행동에 피로도를 소모하고, 크론잡으로 자동 회복.

### 최대 피로도 (CON 기반)
```
최대 피로도 = 50 + (CON × 5)
```

| CON | 최대 피로도 |
|-----|------------|
| 10 | 100 |
| 15 | 125 |
| 20 | 150 |

버프나 장비와 무관하게 캐릭터의 **기본 CON 스탯**만 적용.

### 피로도 소모
| 행동 | 소모량 |
|------|--------|
| 맵 이동 | 5 |
| 전투 시작 | 3 |
| 전투 턴당 | 1 |
| PvP 결투 | 10 |

### 피로도 회복 (크론잡)
```
회복 주기 = 10분마다
회복량 = 10 피로도 (= 분당 1 피로도)
```

**Edge Function**: `recover-fatigue`
- pg_cron에서 10분마다 호출
- 모든 유저의 피로도 일괄 회복
- CON 기반 최대 피로도 초과 방지

### DB 함수
| 함수 | 설명 |
|------|------|
| `consume_fatigue(user_id, amount)` | 피로도 소모 |
| `restore_fatigue(user_id, amount)` | 피로도 회복 |
| `batch_recover_fatigue(amount)` | 전체 유저 일괄 회복 (크론잡용) |
| `calculate_max_fatigue_from_con(con)` | CON 기반 최대 피로도 계산 |
| `get_main_character_con(characters)` | 메인 캐릭터 CON 추출 |
| `get_user_max_fatigue(user_id)` | 유저별 최대 피로도 조회 |

### 사용법
```typescript
import { consumeFatigue, FATIGUE_COST } from "@/entities/user";
import { calculateMaxFatigue, getMaxFatigueFromProfile } from "@/entities/user";

// 피로도 소모
const result = await consumeFatigue(userId, FATIGUE_COST.MAP_MOVE);
if (!result.success) {
  toast.error(result.message); // "피로도가 부족합니다"
}

// 최대 피로도 계산 (프론트엔드)
const maxFatigue = calculateMaxFatigue(15); // CON 15 → 125
const maxFromProfile = getMaxFatigueFromProfile(profile); // 프로필에서 추출
```

### 자동 적용 위치
- `useStartBattle`: 전투 시작 시 피로도 소모
- `useUpdateLocation`: 맵 이동 시 피로도 소모
- `recover-fatigue`: 10분마다 전체 유저 일괄 회복 (크론잡)

## 통신용 크리스탈 시스템 (Whisper Crystal)

귓속말(/w) 기능을 사용하기 위해 필요한 크리스탈 충전 시스템.

### 크리스탈 등급
| ID | 이름 | 충전량 | 기능 |
|---|------|--------|------|
| `crystal_basic` | 기본 크리스탈 | 10회 | 귓속말 /w |
| `crystal_advanced` | 고급 크리스탈 | 30회 | 귓속말 /w, 빠른 답장 /r |
| `crystal_superior` | 최고급 크리스탈 | 100회 | 귓속말 /w, 빠른 답장 /r |

### 명령어
| 명령어 | 설명 | 필요 등급 |
|--------|------|----------|
| `/w 닉네임 메시지` | 해당 유저에게 귓속말 | basic 이상 |
| `/r 메시지` | 마지막 귓말 상대에게 답장 | advanced 이상 |

### DB 컬럼 (profiles)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `whisper_charges` | INTEGER | 남은 충전 횟수 |
| `crystal_tier` | TEXT | 현재 크리스탈 등급 (basic/advanced/superior/null) |

### DB 함수
| 함수 | 설명 |
|------|------|
| `use_crystal(user_id, tier, charges)` | 크리스탈 활성화 → 새 충전량 반환 |
| `consume_whisper_charge(user_id)` | 귓말 1회 소모 → `{success, remaining, tier}` |

### 사용법
```typescript
import { useUseCrystal, isCrystalItem, getCrystalCharges } from "@/features/inventory";
import { consumeWhisperCharge } from "@/entities/user";

// 크리스탈 아이템 확인
if (isCrystalItem(itemId)) {
  const charges = getCrystalCharges(itemId); // 10, 30, 100
}

// 인벤토리에서 크리스탈 사용
const useCrystal = useUseCrystal(userId);
useCrystal.mutate({ crystalId: "crystal_basic", inventoryId: item.id });

// 귓말 시 자동으로 충전 소모 (useRealtimeChat 내부에서 처리)
// - 충전 부족 시 "통신용 크리스탈이 필요합니다" 토스트
// - /r 명령어를 basic 등급으로 시도 시 "고급 크리스탈 이상이 필요합니다" 토스트
```

### 폴더 구조
```
src/
├── entities/user/
│   ├── api/index.ts          # useCrystal(), consumeWhisperCharge()
│   └── types/index.ts        # CrystalTier 타입
│
├── features/
│   ├── inventory/
│   │   └── use-crystal/      # useUseCrystal 훅
│   │
│   └── chat/lib/
│       └── useRealtimeChat.ts  # 귓말 시 충전 체크/소모
│
└── public/data/items.json    # crystal_basic, crystal_advanced, crystal_superior
```

## PvP 결투 시스템 (Duel)

유저 간 실시간 턴제 결투 시스템. Supabase Realtime을 활용한 도전/수락/전투 진행.

### 설계
- **턴 순서**: DEX 기반 (높은 DEX가 선공)
- **패배 페널티**: 없음 (친선 경기)
- **도전 대기 시간**: 30초

### 결투 플로우
```
1. PlayerList에서 유저 클릭 → 메뉴 표시
2. "결투 신청" 클릭 → Realtime broadcast: "duel_request"
3. 상대방에게 모달 표시 (30초 제한)
4. 수락 시 → DEX 비교로 선공 결정 → 결투 시작
5. 턴 진행 (Realtime 동기화)
6. HP 0 → 결투 종료 → 숙련도 증가 (양쪽 모두)
```

### PvP 방어력
- 물리 방어: `CON * 0.5`
- 마법 방어: `WIS * 0.3`

### 폴더 구조
```
src/
├── application/stores/
│   └── pvpStore.ts              # PvP 상태 관리
│
├── features/
│   ├── pvp/                     # PvP 액션
│   │   ├── request-duel/        # useRequestDuel - 도전 신청
│   │   ├── respond-duel/        # useRespondDuel - 수락/거절
│   │   ├── duel-action/         # useDuelAction - 턴 행동
│   │   ├── lib/duelHelpers.ts   # 유틸리티
│   │   └── index.ts
│   │
│   ├── duel/                    # 결투 UI/훅
│   │   ├── lib/
│   │   │   └── useRealtimeDuel.ts   # 결투 이벤트 처리
│   │   └── ui/
│   │       ├── DuelRequestModal.tsx  # 도전 수락/거절 모달
│   │       └── DuelBattlePanel.tsx   # 결투 UI
│   │
│   └── game/ui/
│       └── PlayerContextMenu.tsx # 유저 클릭 메뉴
```

### 사용법
```typescript
import { useRequestDuel, useRespondDuel, useDuelAction } from "@/features/pvp";
import { useRealtimeDuel, DuelRequestModal, DuelBattlePanel } from "@/features/duel";
import { usePvpStore } from "@/application/stores";

// 결투 신청
const { requestDuel } = useRequestDuel({ userId, characterName, mapId });
requestDuel(targetUser);

// 결투 수락/거절
const { acceptDuel, declineDuel, pendingRequests } = useRespondDuel({ userId });
acceptDuel(request.challengerId);

// 결투 중 공격
const { attack, flee, isMyTurn } = useDuelAction({ userId });
if (isMyTurn) attack("sword");

// 결투 상태 구독
const { activeDuel, isInDuel } = usePvpStore();
```

### Realtime 이벤트
| 이벤트 | 설명 |
|--------|------|
| duel_request | 결투 신청 |
| duel_response | 수락/거절 응답 |
| duel_start | 결투 시작 |
| duel_action | 턴 행동 (공격/도주) |
| duel_end | 결투 종료 |

## 월드맵 시스템 (World Map)

게임 세계의 맵 구조와 이동을 시각화하는 시스템.

### 맵 구조
```
🏠 starting_village (시작 마을) - 안전지대
├── 🎯 training_ground (수련장) - 안전, 허수아비
├── 🏪 market_square (시장 광장) - 안전
│   └── ⚔️ arena (투기장) - Lv.10+, PvP
└── 🌲 forest_entrance (숲 입구) - 위험
    ├── 🎯 training_ground (수련장)
    └── 🌳 deep_forest (깊은 숲) - Lv.5+
        └── 🏛️ ancient_ruins (고대 유적) - Lv.10+
```

### 맵 목록
| ID | 이름 | 레벨 | 안전 | 연결 |
|----|------|------|------|------|
| starting_village | 시작 마을 | 1 | O | 숲입구, 시장광장, 수련장 |
| training_ground | 수련장 | 1 | O | 시작마을, 숲입구 |
| market_square | 시장 광장 | 1 | O | 시작마을, 투기장 |
| forest_entrance | 숲 입구 | 1 | X | 시작마을, 수련장, 깊은숲 |
| deep_forest | 깊은 숲 | 5 | X | 숲입구, 고대유적 |
| ancient_ruins | 고대 유적 | 10 | X | 깊은숲 |
| arena | 투기장 | 10 | X | 시장광장 (PvP) |

### 몬스터 배치
| 맵 | 몬스터 | 레벨 | 속성 |
|---|--------|------|------|
| training_ground | 허수아비 | 1 | - |
| forest_entrance | 다람쥐 | 2 | earth |
| forest_entrance | 늙은 다람쥐 | 3 | earth |
| deep_forest | 늑대 | 5 | - |
| deep_forest | 숲거미 | 6 | dark |

### UI 컴포넌트
| 컴포넌트 | 파일 | 용도 |
|---------|------|------|
| WorldMap | `src/entities/map/ui/WorldMap.tsx` | 맵 목록 (데이터 기반) |
| WorldMapModal | `src/entities/map/ui/WorldMapModal.tsx` | 월드맵 모달 래퍼 |
| MapSelector | `src/entities/map/ui/MapSelector.tsx` | 드롭다운 이동 UI |

### 월드맵 상태 표시
| 상태 | 색상 | 설명 |
|------|------|------|
| 현재 위치 | primary (●) | 플레이어가 현재 있는 맵 |
| 이동 가능 | success (●) | 연결되어 있고 레벨 충족 |
| 연결 안됨 | textMuted (●) | 현재 맵에서 직접 이동 불가 |
| 레벨 부족 | error (🔒) | minLevel 미충족 |

### 사용법
```typescript
import { WorldMapModal, MapSelector } from "@/entities/map";

// 게임 페이지에서
const [showWorldMap, setShowWorldMap] = useState(false);

// 월드맵 버튼
<button onClick={() => setShowWorldMap(true)}>🗺️ 월드맵</button>

// 드롭다운 이동
<MapSelector
  currentMapId={mapId}
  onMapChange={handleMapChange}
  playerLevel={profile.level}
/>

// 월드맵 모달
<WorldMapModal
  open={showWorldMap}
  onClose={() => setShowWorldMap(false)}
  currentMapId={mapId}
  onMapSelect={handleMapChange}
  playerLevel={profile.level}
/>
```

## 상태 모달 시스템 (Status Modal)

캐릭터 정보를 확인하는 5탭 모달 시스템.

### 탭 구성
| 탭 | 내용 | 데이터 소스 |
|---|------|------------|
| 상태 | 캐릭터 프리뷰, 레벨, 경험치, **HP/MP**, 스태미나, 능력치, 재화 | `useProfile` |
| 숙련도 | 무기 12종 + 마법 6종 숙련도 | `useProficiencies` |
| 스킬 | 습득한 스킬 목록 | `equipmentStore.learnedSkills` |
| 장비 | 12슬롯 장비 현황 (무기, 방어구, 장신구) | `equipmentStore` |
| 인벤토리 | 보유 아이템 그리드 | `useInventory` |

### 파일
| 파일 | 용도 |
|------|------|
| `app/game/@modal/(.)status/page.tsx` | 모달 버전 (Next.js 병렬 라우트) |
| `app/game/status/page.tsx` | 전체 페이지 버전 |

### 능력치 (Stats)
| 스탯 | 아이콘 | 설명 |
|------|-------|------|
| STR (힘) | 💪 | 물리 공격력 |
| DEX (민첩) | 🏃 | 회피, 물리 치명타 보조 |
| CON (체력) | ❤️ | HP, 물리 방어 |
| INT (지능) | 🧠 | 마법 공격력, 마법 치명타 보조 |
| WIS (지혜) | 🔮 | MP, 마법 방어 |
| CHA (매력) | ✨ | NPC 상호작용 |
| LCK (행운) | 🍀 | 치명타 확률/배율 |

### 치명타 시스템
```typescript
// 치명타 확률: 5% + LCK*0.3 + (DEX or INT)*0.05 (최대 60%)
getCriticalChance(lck, secondaryStat)

// 치명타 배율: 1.5 + LCK*0.01 (최대 2.5x)
getCriticalMultiplier(lck)

// 물리 공격: LCK + DEX
// 마법 공격: LCK + INT
```

### 사용법
```typescript
// 상태창 링크 (모달)
<Link href="/game/status">상태창 열기</Link>

// router.back()으로 모달 닫기
const handleClose = () => router.back();
```

## 게임 시간 시스템 (Game Time)

게임 내 밤낮 사이클 시스템. 2시간 실시간 = 24시간 게임 시간.

### 시간대 (4단계, 30분씩 균등)

| 시간대 | 아이콘 | 버프 효과 |
|--------|--------|----------|
| night (밤) | 🌙 | 암흑 +20%, DEX +10% |
| dawn (새벽) | 🌅 | 신성 +15% |
| day (낮) | ☀️ | 신성 +15% |
| dusk (황혼) | 🌆 | 없음 |

### 시간 계산 공식
```typescript
cycleMs = 2시간 = 7,200,000ms
elapsed = Date.now() - game_epoch
cyclePosition = elapsed % cycleMs
cycleProgress = (cyclePosition / cycleMs) * 100

// 30분씩 4등분
// 0-25% = night, 25-50% = dawn, 50-75% = day, 75-100% = dusk
```

### UI 명도 오버레이
시간대에 따라 게임 화면에 색상 오버레이 적용.

| 시간대 | 오버레이 색상 | 설명 |
|--------|--------------|------|
| day | 없음 | 밝은 낮 |
| dawn | 연한 하늘색 (8%) | 여명의 푸른빛 |
| dusk | 연한 주황색 (10%) | 노을빛 |
| night | 미드나잇 블루 (15%) | 어두운 밤 |

```typescript
import { getPeriodOverlayStyle } from "@/entities/game-time";

const overlay = getPeriodOverlayStyle("night");
// { background: "rgba(25, 25, 112, 0.15)", opacity: 1 }
```

### 사용법
```typescript
import { useRealtimeGameTime, GameTimeClock } from "@/entities/game-time";

// 시간 조회
const { gameTime, isDay, isNight } = useRealtimeGameTime();

// UI 컴포넌트
<GameTimeClock compact />  // 컴팩트 (호버시 버프 표시)
<GameTimeClock />          // 전체 표시

// 시간대 변경 이벤트
useOnPeriodChange((from, to) => {
  if (to === "night") toast("밤이 되었습니다!");
});
```

### 폴더 구조
```
src/entities/game-time/
├── types/index.ts           # Period, GameTime 타입
├── api/index.ts             # fetchGameSettings
├── queries/index.ts         # useGameSettings
├── lib/
│   ├── calculateLocalTime.ts    # 시간 계산
│   ├── useRealtimeGameTime.ts   # 실시간 훅
│   └── timeBuffs.ts             # 시간대 버프
├── ui/
│   ├── GameTimeClock.tsx        # 시간 표시 UI
│   └── AtmosphericText.tsx      # 맵별 분위기 메시지
└── index.ts
```

## 날씨 시스템 (Weather)

실시간 1시간 = 날씨 1사이클 (5종류 순환).

### 날씨 종류 (5가지, 12분씩 순환)

| 날씨 | 아이콘 | 효과 |
|------|--------|------|
| sunny (맑음) | ☀️ | 신성 +10%, 암흑 -10% |
| cloudy (흐림) | ☁️ | 없음 |
| rainy (비) | 🌧️ | 번개 +15%, 화염 -10% |
| stormy (폭풍) | ⛈️ | 번개 +25% |
| foggy (안개) | 🌫️ | 암흑 +15% |

### 날씨 계산 공식
```typescript
cycleMs = 1시간 = 3,600,000ms
elapsed = Date.now() - weather_epoch
cyclePosition = elapsed % cycleMs
weatherIndex = floor((cyclePosition / cycleMs) * 5)

// 12분씩 5등분
// 0-20% = sunny, 20-40% = cloudy, ...
```

### 사용법
```typescript
import { useRealtimeWeather, WeatherDisplay } from "@/entities/weather";

// 날씨 조회
const { weather } = useRealtimeWeather();

// UI 컴포넌트
<WeatherDisplay compact />  // 컴팩트 (호버시 버프 표시)

// 날씨 변경 이벤트
useOnWeatherChange((from, to) => {
  if (to === "rainy") toast("비가 내리기 시작합니다!");
});

// 전투 데미지에 날씨 적용
calculateMagicDamage({
  ...params,
  weather: weather?.currentWeather,  // 날씨 배율 적용
});
```

### 시간대 + 날씨 조합 예시

| 시간대 | 날씨 | 암흑 마법 배율 |
|--------|------|---------------|
| night | foggy | 1.2 × 1.15 = 1.38 (+38%) |
| night | sunny | 1.2 × 0.9 = 1.08 (+8%) |
| day | stormy | 1.0 × 1.0 = 1.0 |

### 폴더 구조
```
src/entities/weather/
├── types/index.ts           # WeatherType, Weather 타입
├── api/index.ts             # fetchWeatherSettings
├── queries/index.ts         # useWeatherSettings
├── lib/
│   ├── calculateWeather.ts      # 날씨 계산
│   ├── useRealtimeWeather.ts    # 실시간 훅
│   └── weatherEffects.ts        # 날씨 버프
├── ui/
│   └── WeatherDisplay.tsx       # 날씨 표시 UI
└── index.ts
```

## 분위기 메시지 (Atmospheric Text)

맵과 시간대에 따른 분위기 있는 랜덤 메시지 표시.

### 데이터 위치
`public/data/atmospheric-messages.json`

### 사용법
```typescript
import { AtmosphericText } from "@/entities/game-time";

// 맵 헤더에 분위기 메시지 표시
<AtmosphericText mapId={currentMapId} className="mt-1" />
```

### 메시지 예시
- 황혼 + 숲 입구: "개와 늑대의 시간. 숲이 깨어난다."
- 밤 + 깊은 숲: "완벽한 어둠. 발 밑도 보이지 않는다."
- 새벽 + 시작 마을: "마을에 첫 닭울음 소리가 울려퍼진다."

## HP/MP 시스템

캐릭터의 체력(HP)과 마나(MP)를 관리하는 시스템.

### HP 계산
```typescript
최대 HP = 50 + (CON × 5) + (레벨 × 10)

// 예시: CON 11, 레벨 2
// 50 + (11 × 5) + (2 × 10) = 50 + 55 + 20 = 125
```

| CON | Lv.1 HP | Lv.5 HP | Lv.10 HP |
|-----|---------|---------|----------|
| 10 | 110 | 150 | 200 |
| 15 | 135 | 175 | 225 |
| 20 | 160 | 200 | 250 |

### MP 계산
```typescript
최대 MP = 20 + (WIS × 3) + INT

// 예시: WIS 10, INT 10
// 20 + (10 × 3) + 10 = 20 + 30 + 10 = 60
```

| WIS | INT | MP |
|-----|-----|-----|
| 10 | 10 | 60 |
| 15 | 12 | 77 |
| 20 | 15 | 95 |

### DB 저장
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `current_hp` | INTEGER | 현재 HP (null이면 최대HP) |
| `current_mp` | INTEGER | 현재 MP (null이면 최대MP) |

### 전투 후 HP/MP 저장
전투 종료 시 (승리/패배/도주) 현재 HP와 MP가 DB에 저장됩니다.

```typescript
// 전투 종료 후 자동 저장
await updateProfile({
  userId,
  currentHp: battleState.playerCurrentHp,
  currentMp: battleState.playerMp,
});
```

### UI 표시
상태창(상태 탭)에서 HP/MP 바로 확인 가능:
- ❤️ HP: 빨간색 바 (50% 이하 노란색, 20% 이하 진한 빨강)
- 💧 MP: 파란색(primary) 바

## 숙련도 시스템 확장 (v2)

**참고**: 이 섹션의 내용은 "숙련도 시스템" 및 "어빌리티 시스템" 섹션으로 통합되었습니다.
숙련도 관련 타입과 함수는 모두 `@/entities/ability`에서 import하세요.

### 숙련도 획득 (레벨 기반)
몬스터 레벨과 플레이어 레벨 차이에 따라 숙련도 획득량이 결정됩니다.

| 레벨 차이 | 획득량 | 설명 |
|----------|--------|------|
| 몬스터 > 플레이어+5 | 3 | 높은 레벨 도전 보너스 |
| 몬스터 > 플레이어 | 2 | 약간 높은 몬스터 |
| 몬스터 = 플레이어 | 1 | 동등 레벨 |
| 몬스터 < 플레이어-5 | 0 | 너무 낮은 몬스터 |

### 숙련도 상수 export
```typescript
import {
  WEAPON_PROFICIENCIES,      // 무기 12종
  MAGIC_PROFICIENCIES,       // 마법 7속성
  WEAPON_ATTACK_TYPE,        // 무기별 물리 공격 타입
  DEFAULT_PROFICIENCIES,     // 기본 숙련도 값
} from "@/entities/ability";
```

## 데미지 계산 시스템

전투 데미지 계산을 위한 함수들.

### 물리 데미지
```typescript
import { calculatePhysicalDamage } from "@/features/combat";

const damage = calculatePhysicalDamage({
  baseDamage: 10,
  str: 15,
  proficiencyLevel: 30,
  proficiencyBonus: getDamageBonus(30), // +10%
  criticalHit: false,
  criticalMultiplier: 1.5,
});
```

### 마법 데미지
```typescript
import { calculateMagicDamage } from "@/features/combat";

const damage = calculateMagicDamage({
  baseDamage: 20,
  int: 15,
  proficiencyLevel: 40,
  element: "fire",
  targetElement: "ice",      // 상성 보너스
  period: "day",             // 시간대 보너스
  weather: "sunny",          // 날씨 보너스
});
```

### 판정 순서
1. **빗맞음** (10%) - 완전 실패
2. **회피** (DEX 기반) - 완전 회피
3. **막기** (CON 기반) - 데미지 절반
4. **치명타** (LCK 기반) - 1.5~2.5배
5. **명중** - 일반 데미지

### 전투 메시지
| 판정 | 메시지 예시 |
|------|------------|
| 빗맞음 | "공격이 허공을 가른다!" |
| 회피 | "🌀 몬스터가 교묘하게 피했다!" |
| 막기 | "🛡️ 몬스터가 공격을 막았다!" |
| 치명타 | "💥 치명타! 15 데미지!" |
| 명중 | "검으로 10 데미지를 입혔다!" |

## 부상 시스템 (Injury)

마비노기 스타일의 부상 시스템. **최대 HP는 불변**이고, **회복 가능한 HP 상한**만 감소합니다.

### 핵심 개념
| 용어 | 설명 |
|------|------|
| `maxHp` | 최대 HP (부상과 무관하게 불변) |
| `recoverableHp` | 회복 가능 HP 상한 (부상으로 감소) |
| `currentHp` | 현재 HP |

**예시**: maxHp=100, 중상(25% 감소)
- `recoverableHp` = 75
- 포션을 먹어도 75까지만 회복 가능
- 부상 치료 시 다시 100까지 회복 가능

### 부상 등급
| 등급 | 아이콘 | HP 회복 상한 감소 | 자연치유 | 치료 방법 |
|------|--------|-----------------|---------|----------|
| 경상 (Light) | 🩹 | -10% | 30분 | 응급처치 |
| 중상 (Medium) | 🩸 | -25% | 2시간 | 약초학 |
| 치명상 (Critical) | 💀 | -50% | 불가 | 수술 |

### 부상 발생 조건
- HP가 30% 이하일 때 패배 시 발생 가능
- 몬스터 레벨이 높을수록 확률 증가
- 치명타 피격 시 확률 2배
- 최대 80%까지만 감소 (최소 20% HP까지는 회복 가능)

### 상태창 HP 바 UI
```
[███████░░░░░░░░████]
 현재HP  회복가능  부상
 (녹색)  (회색)   (어두운빨강)
```

### 타입 정의
```typescript
interface InjuryConfig {
  type: InjuryType;
  nameKo: string;
  hpRecoveryReduction: number;  // HP 회복 상한 감소율 (0.1 = 10%)
  healMethod: MedicalType;
  naturalHealTime: number | null;
  // ...
}
```

### 사용법
```typescript
import {
  calculateTotalRecoveryReduction,
  INJURY_CONFIG,
} from "@/entities/injury";
import { calculateDerivedStats } from "@/entities/character";

// 파생 스탯 계산 (부상 포함)
const stats = calculateDerivedStats(
  baseStats,
  equipmentStats,
  level,
  injuries  // 부상 목록 전달
);

// 회복 가능 HP 확인
console.log(stats.maxHp);              // 100 (불변)
console.log(stats.recoverableHp);      // 75 (부상으로 감소)
console.log(stats.injuryRecoveryReduction); // 0.25 (25% 감소)
```

### 폴더 구조
```
src/entities/injury/
├── types/
│   ├── index.ts        # CharacterInjury, InjuryConfig 타입
│   └── constants.ts    # INJURY_CONFIG, calculateTotalRecoveryReduction
├── lib/
│   └── index.ts        # checkInjuryOccurrence, filterNaturallyHealedInjuries
└── index.ts            # Public API
```
