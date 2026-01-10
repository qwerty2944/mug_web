# 스프라이트 매핑 시스템

## 개요

Unity 캐릭터 빌더의 스프라이트 데이터를 웹에서 사용하기 위한 매핑 시스템입니다.

## 핵심 원칙

> **⚠️ 중요: `all-sprites.json`이 유일한 원본(Single Source of Truth)입니다.**

- Unity `SpriteExporter.cs`가 `all-sprites.json`을 생성
- 모든 개별 매핑 파일은 `all-sprites.json`의 순서를 따름
- 인덱스 변경 시 반드시 `sync-sprite-mappings.js` 실행

## 폴더 구조

```
public/data/sprites/
├── all-sprites.json              # ⭐ 원본 (Unity에서 생성)
├── appearance/                   # 외형
│   ├── body.json                 # 신체 (21개)
│   ├── eye.json                  # 눈 (15개)
│   ├── hair.json                 # 머리 (75개)
│   └── facehair.json             # 수염/장식 (20개)
└── equipment/
    ├── weapons/                  # 무기
    │   ├── sword.json            # 검 (26개)
    │   ├── axe.json              # 도끼 (5개)
    │   ├── bow.json              # 활 (10개)
    │   ├── shield.json           # 방패 (14개)
    │   ├── spear.json            # 창 (2개)
    │   ├── wand.json             # 지팡이 (20개)
    │   └── dagger.json           # 단검 (2개)
    └── armor/                    # 방어구
        ├── helmet.json           # 투구 (120개)
        ├── armor.json            # 갑옷 (59개)
        ├── cloth.json            # 옷 (131개)
        ├── pant.json             # 바지 (60개)
        └── back.json             # 등 (34개)
```

## 데이터 구조

### all-sprites.json (원본)

Unity에서 내보낸 스프라이트 목록. **이 순서가 Unity 인덱스와 1:1 매핑됩니다.**

```json
{
  "bodyCount": 21,
  "bodyNames": ["New_Elf_1", "New_Elf_2", "Zombie_1", ...],
  "eyeCount": 15,
  "eyeNames": ["Eye", "Eye0", "Eye1", ...],
  // ... 기타 카테고리
}
```

### 개별 매핑 파일 구조

```json
{
  "sprites": ["New_Elf_1", "New_Elf_2", ...],  // 원본 순서 유지
  "count": 21,
  "nameToIndex": {                              // 스프라이트명 → 인덱스
    "New_Elf_1": 0,
    "New_Elf_2": 1,
    ...
  },
  "bodies": [                                   // 상세 정보 배열
    {
      "id": "new_elf_1",                        // DB 저장용 ID (소문자)
      "index": 0,                               // Unity 통신용 인덱스
      "sprite": "New_Elf_1",                    // 원본 스프라이트명
      "ko": "신규 엘프 1",                       // 한글 이름
      "en": "New Elf 1",                        // 영문 이름
      "race": "elf"                             // 추가 메타데이터 (선택)
    },
    ...
  ],
  "idToIndex": {                                // ID → 인덱스
    "new_elf_1": 0,
    "new_elf_2": 1,
    ...
  }
}
```

## 필드 설명

| 필드 | 용도 | 예시 |
|------|------|------|
| `id` | DB 저장, API 통신 | `"elf_weapon_03"` |
| `index` | Unity 메서드 호출 | `0` |
| `sprite` | 원본 파일명 참조 | `"Elf_Weapon_03"` |
| `ko` | UI 표시 (한글) | `"엘프 검 1"` |
| `en` | UI 표시 (영문) | `"Elf Sword 1"` |
| `race` | 종족 필터링 | `"elf"`, `"human"`, `"orc"` |
| `style` | 스타일 필터링 | `"knight"`, `"mage"`, `"common"` |

## 사용 방법

### 1. Unity에서 스프라이트 내보내기

Unity Editor에서:
- `Tools > Export Sprite Data` 실행
- `all-sprites.json` 자동 생성됨

### 2. 매핑 파일 동기화

```bash
node scripts/sync-sprite-mappings.js
```

이 스크립트는:
- `all-sprites.json`을 읽음
- 모든 개별 매핑 파일을 재생성
- 한글 이름 자동 생성

### 3. 프론트엔드에서 사용

```typescript
// 매핑 데이터 로드
const res = await fetch("/data/sprites/equipment/weapons/sword.json");
const data = await res.json();

// ID로 인덱스 조회
const index = data.idToIndex["elf_weapon_03"]; // 0

// 인덱스로 상세 정보 조회
const item = data.swords.find(s => s.index === 0);
console.log(item.ko); // "엘프 검 1"

// Unity 호출
callUnity("JS_SetSword", index.toString());
```

### 4. DB 저장

```typescript
// 장비 저장 시 ID 사용
await supabase.from("equipment").insert({
  user_id: userId,
  slot: "main_hand",
  sprite_id: "elf_weapon_03",  // ID 저장
});

// 불러올 때 인덱스 변환
const { data } = await supabase.from("equipment").select();
const index = swordData.idToIndex[data.sprite_id]; // ID → 인덱스
callUnity("JS_SetSword", index.toString());
```

## 카테고리별 스프라이트 수

| 카테고리 | 한글 | 개수 | Unity 메서드 |
|----------|------|------|-------------|
| body | 신체 | 21 | JS_SetBody |
| eye | 눈 | 15 | JS_SetEye |
| hair | 머리 | 75 | JS_SetHair |
| facehair | 수염/장식 | 20 | JS_SetFacehair |
| helmet | 투구 | 120 | JS_SetHelmet |
| armor | 갑옷 | 59 | JS_SetArmor |
| cloth | 옷 | 131 | JS_SetCloth |
| pant | 바지 | 60 | JS_SetPant |
| back | 등 | 34 | JS_SetBack |
| sword | 검 | 26 | JS_SetSword |
| axe | 도끼 | 5 | JS_SetAxe |
| bow | 활 | 10 | JS_SetBow |
| shield | 방패 | 14 | JS_SetShield |
| spear | 창 | 2 | JS_SetSpear |
| wand | 지팡이 | 20 | JS_SetWand |
| dagger | 단검 | 2 | JS_SetDagger |

**총 스프라이트: 584개**

## 스타일 분류

| style | 설명 | 예시 스프라이트 |
|-------|------|----------------|
| `elf` | 엘프 스타일 | Elf_Weapon_03 |
| `orc` | 오크 스타일 | Orc_Weapon_02 |
| `undead` | 언데드 스타일 | Undead_Weapon_01 |
| `knight` | 기사 스타일 | Weapon_Knight_1 |
| `archer` | 궁수 스타일 | Weapon_Archer_1 |
| `healer` | 힐러 스타일 | Weapon_Healer_1 |
| `rogue` | 도적 스타일 | Weapon_Rogue_1 |
| `mage` | 마법사 스타일 | Weapon_Sorcerer |
| `common` | 일반 스타일 | Sword_1 |

## 종족 분류 (body/hair)

| race | 설명 | 예시 스프라이트 |
|------|------|----------------|
| `elf` | 엘프 | Elf_1, Elf_Hair_01 |
| `human` | 인간 | Human_1, Hair_m01 |
| `orc` | 오크 | Orc_1, Orc_Hair_01 |
| `undead` | 언데드 | Zombie_1, Skelton_1 |
| `tiefling` | 티플링 | Devil_1 |
| `common` | 공용 | Normal_Hair1 |

## 주의사항

1. **인덱스 불변성**: 새 스프라이트 추가 시 기존 인덱스는 절대 변경되면 안 됨
2. **ID 규칙**: 스프라이트명을 소문자로 변환, 공백은 `_`로 대체
3. **동기화 필수**: Unity에서 스프라이트 변경 후 반드시 `sync-sprite-mappings.js` 실행
4. **DB 저장**: 인덱스가 아닌 `id` 문자열로 저장하여 순서 변경에 대응

## 관련 파일

- `scripts/sync-sprite-mappings.js` - 매핑 동기화 스크립트
- `Assets/Scripts/Editor/SpriteExporter.cs` - Unity 스프라이트 내보내기
- `app/equipment-test/page.tsx` - 장비 테스트 페이지
