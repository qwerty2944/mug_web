# 전투 시스템 (Combat System)

턴제 전투 시스템. 몬스터는 속성을 가지며 숙련도와 연동.

## 데미지 계산

### 물리 데미지
```
physicalDamage = (baseDamage + STR * 0.5) * proficiencyMultiplier * variance - defense
```
- variance: ±15% 랜덤 편차

### 마법 데미지
```
magicDamage = (baseDamage + INT * 0.8)
            * proficiencyMultiplier
            * elementEffectiveness  // 상성
            * dayBoost              // 요일 보너스
            * variance              // ±15%
            - (defense * 0.3)
```

## 공격 판정 시스템 (Hit Result)

공격 시 판정 순서: **빗맞음 → 회피 → 막기 → 치명타 → 명중**

| 결과 | 설명 | 데미지 |
|------|------|--------|
| `missed` | 공격 빗맞음 (물리만) | 0 |
| `dodged` | 상대가 회피 | 0 |
| `blocked` | 상대가 막음 | 50% |
| `critical` | 치명타 | 150~250% |
| `hit` | 일반 명중 | 100% |

### 확률 공식

#### 빗맞음 (Miss) - 물리 공격만
```
missChance = 5% (고정)
```

#### 회피 (Dodge) - DEX 기반
```
dodgeChance = 3% + DEX * 0.4 (최대 25%)
```
| DEX | 확률 |
|-----|------|
| 10 | 7% |
| 30 | 15% |
| 50 | 23% |

#### 막기 (Block) - CON 기반
```
blockChance = 5% + CON * 0.3 (최대 20%)
```
| CON | 확률 |
|-----|------|
| 10 | 8% |
| 30 | 14% |
| 50 | 20% |

- 막기 성공 시 데미지 50% 감소

#### 치명타 (Critical) - LCK 기반
```
critChance = 5% + LCK * 0.3 + secondaryStat * 0.05 (최대 60%)
critMultiplier = 1.5 + LCK * 0.01 (최대 2.5배)
```
- 물리 공격: LCK + DEX
- 마법 공격: LCK + INT

## 몬스터

| ID | 이름 | 속성 | HP | 행동 | 보상 |
|----|------|------|----|----|------|
| scarecrow | 허수아비 | - | 50 | passive | 5 exp |
| squirrel | 다람쥐 | earth | 30 | aggressive | 10 exp, 5 gold |
| squirrel_elder | 늙은 다람쥐 | earth | 45 | defensive | 18 exp, 10 gold |
| wolf | 늑대 | - | 80 | aggressive | 30 exp, 15 gold |
| forest_spider | 숲거미 | dark | 60 | aggressive | 35 exp, 20 gold |

## 관련 파일

- `src/features/combat/lib/damage.ts` - 데미지 및 판정 계산
- `src/features/combat/lib/messages.ts` - 전투 메시지
- `src/features/combat/attack/index.ts` - 공격 액션
- `src/features/combat/cast-spell/index.ts` - 스킬 사용
