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
│   ├── proficiency/
│   │   ├── gain-proficiency/   # 숙련도 증가 액션
│   │   └── index.ts
│   ├── combat/                 # PvE 전투
│   │   ├── start-battle/       # 전투 시작
│   │   ├── attack/             # 공격
│   │   ├── end-battle/         # 전투 종료
│   │   ├── lib/damage.ts       # 데미지 계산
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

## 전투 시스템 (Combat)

턴제 전투 시스템. 몬스터는 속성을 가지며 숙련도와 연동.

### 맵
| ID | 이름 | 몬스터 | 안전지대 |
|----|------|--------|---------|
| town_square | 마을 광장 | - | O |
| shop_district | 상점가 | - | O |
| training_ground | 수련장 | 허수아비 | O |
| forest_entrance | 숲 입구 | 다람쥐 | X |
| deep_forest | 깊은 숲 | 늑대, 숲거미 | X |

### 몬스터
| ID | 이름 | 속성 | HP | 행동 | 보상 |
|----|------|------|----|----|------|
| scarecrow | 허수아비 | - | 50 | passive | 5 exp |
| squirrel | 다람쥐 | earth | 30 | aggressive | 10 exp, 5 gold |
| squirrel_elder | 늙은 다람쥐 | earth | 45 | defensive | 18 exp, 10 gold |
| wolf | 늑대 | - | 80 | aggressive | 30 exp, 15 gold |
| forest_spider | 숲거미 | dark | 60 | aggressive | 35 exp, 20 gold |

### 데미지 계산
```typescript
// 물리 데미지
physicalDamage = (baseDamage + STR * 0.5) * proficiencyMultiplier - defense

// 마법 데미지
magicDamage = (baseDamage + INT * 0.8)
            * proficiencyMultiplier
            * elementEffectiveness  // 상성
            * dayBoost              // 요일 보너스
            - (defense * 0.3)
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

## 스킬 시스템 (Skill)

스킬은 5가지 타입으로 분류되며, 전투 UI에서는 4개 카테고리로 표시됩니다.

### 스킬 타입 (SkillType)
| 타입 | 설명 | UI 카테고리 |
|------|------|------------|
| `physical_attack` | 물리 공격 | 무기 (weapon) |
| `magic_attack` | 마법 공격 | 마법 (magic) |
| `heal` | HP 회복 | 마법 (magic) |
| `buff` | 버프 (자신에게) | 보조 (support) |
| `debuff` | 디버프 (적에게) | 보조 (support) |

### UI 카테고리 (SkillCategory)
| 카테고리 | 탭 이름 | 포함 스킬 타입 |
|---------|--------|--------------|
| `weapon` | 무기 ⚔️ | physical_attack |
| `magic` | 마법 ✨ | magic_attack, heal |
| `support` | 보조 💊 | buff, debuff |
| `item` | 아이템 🎒 | (준비 중) |

### 스킬 데이터
- **위치**: `/public/data/skills.json`
- **총 21개 스킬**: 마법 공격 6개, 물리 공격 5개, 힐 1개, 버프 5개, 디버프 4개

### 주요 스킬 속성
```typescript
interface Skill {
  id: string;
  nameKo: string;          // 한글 이름 (UI 표시용)
  nameEn: string;          // 영문 이름
  type: SkillType;
  icon: string;
  mpCost: number;
  baseDamage?: number;     // 공격 스킬
  element?: MagicElement;  // 마법 속성
  healAmount?: number;     // 힐 스킬
  statusEffect?: StatusType;  // 버프/디버프
  target: SkillTarget;     // self | enemy
}
```

### 사용법
```typescript
import { useSkills, getSkillCategory } from "@/entities/skill";
import { useEquipmentStore } from "@/application/stores";

// 스킬 데이터 로드
const { data: allSkills } = useSkills();

// 습득한 스킬 필터링
const { learnedSkills } = useEquipmentStore();
const mySkills = allSkills.filter(s => learnedSkills.includes(s.id));

// 카테고리별 분류
const magicSkills = mySkills.filter(s =>
  s.type === "magic_attack" || s.type === "heal"
);
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
│   ├── pvp/                     # PvP 기능
│   │   ├── request-duel/        # useRequestDuel - 도전 신청
│   │   ├── respond-duel/        # useRespondDuel - 수락/거절
│   │   ├── duel-action/         # useDuelAction - 턴 행동
│   │   ├── lib/duelHelpers.ts   # 유틸리티
│   │   └── index.ts
│   │
│   └── game/
│       ├── lib/
│       │   └── useRealtimeDuel.ts   # 결투 이벤트 처리
│       └── ui/
│           ├── PlayerContextMenu.tsx # 유저 클릭 메뉴
│           ├── DuelRequestModal.tsx  # 도전 수락/거절 모달
│           └── DuelBattlePanel.tsx   # 결투 UI
```

### 사용법
```typescript
import { useRequestDuel, useRespondDuel, useDuelAction } from "@/features/pvp";
import { useRealtimeDuel, DuelRequestModal, DuelBattlePanel } from "@/features/game";
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
| WorldMap | `src/features/game/ui/WorldMap.tsx` | 맵 목록 (데이터 기반) |
| WorldMapModal | `src/features/game/ui/WorldMapModal.tsx` | 월드맵 모달 래퍼 |
| MapSelector | `src/features/game/ui/MapSelector.tsx` | 드롭다운 이동 UI |

### 월드맵 상태 표시
| 상태 | 색상 | 설명 |
|------|------|------|
| 현재 위치 | primary (●) | 플레이어가 현재 있는 맵 |
| 이동 가능 | success (●) | 연결되어 있고 레벨 충족 |
| 연결 안됨 | textMuted (●) | 현재 맵에서 직접 이동 불가 |
| 레벨 부족 | error (🔒) | minLevel 미충족 |

### 사용법
```typescript
import { WorldMapModal, MapSelector } from "@/features/game";

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
| 상태 | 캐릭터 프리뷰, 레벨, 경험치, 스태미나, 능력치, 재화 | `useProfile` |
| 숙련도 | 무기 9종 + 마법 6종 숙련도 | `useProficiencies` |
| 스킬 | 습득한 스킬 목록 | `equipmentStore.learnedSkills` |
| 장비 | 4슬롯 장비 현황 (무기, 갑옷, 투구, 장신구) | `equipmentStore` |
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
