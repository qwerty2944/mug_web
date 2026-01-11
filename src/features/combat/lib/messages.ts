import type { CombatProficiencyType, WeaponBlockSpecial } from "@/entities/ability";

// 랜덤 선택 헬퍼
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============ 플레이어 공격 메시지 ============

// 세검 (찌르기)
const LIGHT_SWORD_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `번개처럼 빠른 찌르기가 ${name}을(를) 관통했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `세검이 허공을 가르며 ${name}의 급소를 노렸다! ${dmg}!`,
  (name: string, dmg: number) => `날렵한 칼끝이 ${name}을(를) 찔렀다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `정확한 일격! ${name}의 몸에 구멍이 뚫렸다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `순식간의 자돌! ${name}이(가) ${dmg}의 피해를 입었다!`,
];

// 중검 (베기)
const MEDIUM_SWORD_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `번개처럼 빠른 검격이 ${name}을(를) 스쳐 지나갔다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `중검이 허공을 가르며 ${name}에게 ${dmg}의 상처를 남겼다!`,
  (name: string, dmg: number) => `날카로운 칼날이 ${name}을(를) 갈랐다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `검의 궤적이 ${name}의 몸에 새겨졌다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `일섬! ${name}이(가) ${dmg}의 피해를 입었다!`,
];

// 대검 (강력한 베기)
const GREAT_SWORD_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `묵직한 대검이 ${name}을(를) 내려찍었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `대검의 거대한 칼날이 ${name}을(를) 두 동강냈다! ${dmg}!`,
  (name: string, dmg: number) => `압도적인 힘! 대검이 ${name}을(를) 강타했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `대검의 일격! ${name}이(가) 휘청거린다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `천하무적! ${name}이(가) ${dmg}의 피해를 입었다!`,
];

const AXE_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `무거운 도끼가 ${name}을(를) 내려찍었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `도끼날이 ${name}에게 깊이 박혔다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `묵직한 일격! ${name}이(가) ${dmg}의 피해를 입었다!`,
  (name: string, dmg: number) => `도끼가 바람을 가르며 ${name}을(를) 강타했다! ${dmg}!`,
  (name: string, dmg: number) => `파괴적인 도끼 공격! ${name}에게 ${dmg} 데미지!`,
];

const MACE_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `둔기가 ${name}의 뼈를 울렸다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `쿵! ${name}이(가) 둔기에 맞아 비틀거린다! ${dmg}!`,
  (name: string, dmg: number) => `둔중한 타격이 ${name}을(를) 강타했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `철퇴가 ${name}의 방어를 무시했다! ${dmg}!`,
  (name: string, dmg: number) => `망치가 ${name}을(를) 찧었다! ${dmg} 데미지!`,
];

const DAGGER_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `그림자처럼 빠른 단검이 ${name}을(를) 찔렀다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `단검이 ${name}의 급소를 노렸다! ${dmg}!`,
  (name: string, dmg: number) => `쉭! 단검이 ${name}을(를) 스쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `독사처럼 빠른 일격! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `단검의 춤! ${name}이(가) ${dmg}의 피해를 입었다!`,
];

const SPEAR_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `창이 ${name}을(를) 꿰뚫었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `긴 창끝이 ${name}에게 닿았다! ${dmg}!`,
  (name: string, dmg: number) => `예리한 창날이 ${name}을(를) 찔렀다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `창이 바람을 가르며 ${name}을(를) 관통했다! ${dmg}!`,
  (name: string, dmg: number) => `일점 돌파! ${name}에게 ${dmg} 데미지!`,
];

const BOW_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `화살이 ${name}에게 명중했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `퉁! 화살이 ${name}을(를) 관통했다! ${dmg}!`,
  (name: string, dmg: number) => `정확한 사격! ${name}이(가) ${dmg}의 피해를 입었다!`,
  (name: string, dmg: number) => `화살이 바람을 타고 ${name}에게 박혔다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `시위를 떠난 화살이 ${name}을(를) 꿰뚫었다! ${dmg}!`,
];

const CROSSBOW_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `볼트가 ${name}의 갑옷을 뚫었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `석궁의 일격! ${name}에게 ${dmg}의 상처를 입혔다!`,
  (name: string, dmg: number) => `철화살이 ${name}을(를) 강타했다! ${dmg}!`,
  (name: string, dmg: number) => `파괴적인 볼트! ${name}이(가) ${dmg} 데미지를 입었다!`,
  (name: string, dmg: number) => `석궁 볼트가 ${name}에게 박혔다! ${dmg} 데미지!`,
];

const STAFF_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `마법 지팡이가 ${name}을(를) 후려쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `지팡이 끝에서 마력이 폭발했다! ${name}에게 ${dmg}!`,
  (name: string, dmg: number) => `지팡이로 ${name}의 머리를 내리쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `마력이 담긴 일격! ${name}이(가) ${dmg} 데미지를 입었다!`,
  (name: string, dmg: number) => `지팡이가 ${name}을(를) 휩쓸었다! ${dmg}!`,
];

const FIST_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `주먹이 ${name}의 턱을 강타했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `맨손의 일격! ${name}이(가) ${dmg}의 피해를 입었다!`,
  (name: string, dmg: number) => `${name}에게 강력한 펀치! ${dmg} 데미지!`,
  (name: string, dmg: number) => `기합! ${name}을(를) 주먹으로 가격했다! ${dmg}!`,
  (name: string, dmg: number) => `격투의 일격이 ${name}을(를) 흔들었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `불꽃처럼 빠른 연타! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `몸 전체를 실은 일격! ${name}이(가) 비틀거린다! ${dmg}!`,
];

const SHIELD_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `방패로 ${name}을(를) 강타했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `방패의 모서리가 ${name}을(를) 가격했다! ${dmg}!`,
  (name: string, dmg: number) => `${name}에게 쉴드 배시! ${dmg} 데미지!`,
  (name: string, dmg: number) => `방패로 ${name}을(를) 밀쳤다! ${dmg}!`,
  (name: string, dmg: number) => `강철 방패가 ${name}을(를) 내리쳤다! ${dmg} 데미지!`,
];

// 마법 공격 메시지
const FIRE_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `불꽃이 ${name}을(를) 집어삼켰다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `화염 폭발! ${name}이(가) ${dmg}의 화상을 입었다!`,
  (name: string, dmg: number) => `${name}이(가) 불길에 휩싸였다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `타오르는 화염! ${name}에게 ${dmg}!`,
  (name: string, dmg: number) => `불타오르라! ${name}이(가) ${dmg} 데미지를 입었다!`,
];

const ICE_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `얼음 결정이 ${name}을(를) 꿰뚫었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}이(가) 냉기에 얼어붙었다! ${dmg}!`,
  (name: string, dmg: number) => `차가운 서리가 ${name}을(를) 감쌌다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `빙결의 창! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}이(가) 얼음 조각에 맞았다! ${dmg}!`,
];

const LIGHTNING_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `번개가 ${name}을(를) 내리쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}이(가) 전격에 감전되었다! ${dmg}!`,
  (name: string, dmg: number) => `번개의 심판! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `쾅! 뇌전이 ${name}을(를) 관통했다! ${dmg}!`,
  (name: string, dmg: number) => `하늘의 분노! ${name}이(가) ${dmg}의 피해를 입었다!`,
];

const EARTH_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `대지가 솟아올라 ${name}을(를) 덮쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `바위가 ${name}에게 날아갔다! ${dmg}!`,
  (name: string, dmg: number) => `${name}이(가) 암석에 깔렸다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `대지의 힘! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `거대한 돌덩이가 ${name}을(를) 강타했다! ${dmg}!`,
];

const HOLY_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `신성한 빛이 ${name}을(를) 정화했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `성스러운 광휘! ${name}에게 ${dmg}!`,
  (name: string, dmg: number) => `${name}이(가) 신성력에 타올랐다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `천상의 심판! ${name}이(가) ${dmg}의 피해를 입었다!`,
  (name: string, dmg: number) => `신의 이름으로! ${name}에게 ${dmg} 데미지!`,
];

const DARK_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `암흑이 ${name}을(를) 집어삼켰다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}이(가) 어둠에 잠식되었다! ${dmg}!`,
  (name: string, dmg: number) => `그림자의 일격! ${name}에게 ${dmg} 데미지!`,
  (name: string, dmg: number) => `저주의 힘! ${name}이(가) ${dmg}의 피해를 입었다!`,
  (name: string, dmg: number) => `심연에서 솟아오른 어둠! ${name}에게 ${dmg}!`,
];

const POISON_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `맹독이 ${name}을(를) 덮쳤다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}이(가) 독에 오염되었다! ${dmg}!`,
  (name: string, dmg: number) => `독안개가 ${name}을(를) 휘감았다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `치명적인 독! ${name}에게 ${dmg}의 피해!`,
  (name: string, dmg: number) => `독의 결정이 ${name}을(를) 관통했다! ${dmg}!`,
];

// 공격 타입별 메시지 맵 (전투 숙련도만 해당)
const ATTACK_MESSAGES: Record<CombatProficiencyType, ((name: string, dmg: number) => string)[]> = {
  light_sword: LIGHT_SWORD_ATTACK_MESSAGES,
  medium_sword: MEDIUM_SWORD_ATTACK_MESSAGES,
  great_sword: GREAT_SWORD_ATTACK_MESSAGES,
  axe: AXE_ATTACK_MESSAGES,
  mace: MACE_ATTACK_MESSAGES,
  dagger: DAGGER_ATTACK_MESSAGES,
  spear: SPEAR_ATTACK_MESSAGES,
  bow: BOW_ATTACK_MESSAGES,
  crossbow: CROSSBOW_ATTACK_MESSAGES,
  staff: STAFF_ATTACK_MESSAGES,
  fist: FIST_ATTACK_MESSAGES,
  shield: SHIELD_ATTACK_MESSAGES,
  fire: FIRE_ATTACK_MESSAGES,
  ice: ICE_ATTACK_MESSAGES,
  lightning: LIGHTNING_ATTACK_MESSAGES,
  earth: EARTH_ATTACK_MESSAGES,
  holy: HOLY_ATTACK_MESSAGES,
  dark: DARK_ATTACK_MESSAGES,
  poison: POISON_ATTACK_MESSAGES,
};

// ============ 크리티컬 히트 메시지 ============

const CRITICAL_PREFIXES = [
  "치명타!",
  "급소 공격!",
  "완벽한 일격!",
  "회심의 일격!",
  "크리티컬!",
  "약점 포착!",
  "정확한 급소!",
  "절명의 일격!",
];

// ============ 몬스터 공격 메시지 ============

const MONSTER_ATTACK_MESSAGES = [
  (name: string, dmg: number) => `${name}의 공격! ${dmg} 데미지를 받았다!`,
  (name: string, dmg: number) => `${name}이(가) 덤벼들었다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}의 맹공! ${dmg}의 상처를 입었다!`,
  (name: string, dmg: number) => `${name}에게 당했다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}의 반격이 명중했다! ${dmg}!`,
  (name: string, dmg: number) => `${name}이(가) 공격해왔다! ${dmg} 데미지!`,
  (name: string, dmg: number) => `${name}의 일격을 피하지 못했다! ${dmg}!`,
  (name: string, dmg: number) => `으악! ${name}에게 ${dmg} 데미지를 입었다!`,
];

// ============ 전투 시작/종료 메시지 ============

const BATTLE_START_MESSAGES = [
  (name: string, icon: string) => `${icon} ${name}이(가) 나타났다!`,
  (name: string, icon: string) => `${icon} 야생의 ${name}이(가) 모습을 드러냈다!`,
  (name: string, icon: string) => `${icon} ${name}과(와)의 전투 시작!`,
  (name: string, icon: string) => `${icon} 전방에 ${name}!`,
  (name: string, icon: string) => `${icon} ${name}이(가) 당신을 노려보고 있다!`,
];

const VICTORY_MESSAGES = [
  (name: string) => `${name}을(를) 쓰러뜨렸다!`,
  (name: string) => `${name}을(를) 처치했다!`,
  (name: string) => `전투 승리! ${name}을(를) 격파했다!`,
  (name: string) => `${name}이(가) 쓰러졌다!`,
  (name: string) => `승리! ${name}을(를) 물리쳤다!`,
];

const DEFEAT_MESSAGES = [
  "당신은 쓰러졌다...",
  "힘이 다했다...",
  "패배...",
  "더 이상 싸울 수 없다...",
  "시야가 흐려진다...",
  "무릎을 꿇었다...",
];

const FLEE_SUCCESS_MESSAGES = [
  "도주에 성공했다!",
  "재빠르게 도망쳤다!",
  "다리가 살았다!",
  "아슬아슬하게 탈출!",
  "전략적 후퇴 성공!",
];

const FLEE_FAIL_MESSAGES = [
  "도주에 실패했다!",
  "도망치지 못했다!",
  "막혔다!",
  "퇴로가 없다!",
  "도망칠 수 없다!",
];

// ============ 회피/막기/빗맞음 메시지 ============

const DODGE_MESSAGES = [
  (name: string) => `${name}이(가) 재빠르게 피했다!`,
  (name: string) => `${name}이(가) 공격을 회피했다!`,
  (name: string) => `${name}이(가) 몸을 날려 피했다!`,
  (name: string) => `${name}이(가) 살짝 비켜섰다!`,
  (name: string) => `${name}이(가) 민첩하게 회피!`,
];

const BLOCK_MESSAGES = [
  (name: string, reduced: number) => `${name}이(가) 공격을 막았다! (${reduced} 감소)`,
  (name: string, reduced: number) => `${name}이(가) 방어 자세! ${reduced} 피해 경감!`,
  (name: string, reduced: number) => `${name}이(가) 버텼다! ${reduced} 데미지 감소!`,
  (name: string, reduced: number) => `${name}의 방어! ${reduced} 피해 경감!`,
];

const MISS_MESSAGES = [
  (name: string) => `${name}에 대한 공격이 빗나갔다!`,
  (name: string) => `공격이 허공을 갈랐다!`,
  (name: string) => `${name}을(를) 맞히지 못했다!`,
  (name: string) => `빗맞았다!`,
  (name: string) => `공격이 빗나갔다!`,
];

const PLAYER_DODGE_MESSAGES = [
  "재빠르게 피했다!",
  "공격을 회피했다!",
  "아슬아슬하게 피했다!",
  "살짝 비켜섰다!",
  "민첩하게 회피!",
];

const PLAYER_BLOCK_MESSAGES = [
  (reduced: number) => `방어 성공! ${reduced} 피해 감소!`,
  (reduced: number) => `막았다! ${reduced} 데미지 경감!`,
  (reduced: number) => `버텼다! ${reduced} 피해 감소!`,
  (reduced: number) => `방어! ${reduced} 데미지 경감!`,
];

const MONSTER_MISS_MESSAGES = [
  "적의 공격이 빗나갔다!",
  "적의 공격을 피했다!",
  "공격이 스쳐 지나갔다!",
];

// ============ 물리 저항 피드백 메시지 ============

// 효과적 (저항 >= 1.3, 약점 공격)
const RESISTANCE_EFFECTIVE_MESSAGES = [
  "(효과적이다!)",
  "(약점을 찔렀다!)",
  "(치명적인 일격!)",
  "(제대로 먹혔다!)",
  "(약점 공격!)",
];

// 비효과적 (저항 <= 0.7, 강한 저항)
const RESISTANCE_INEFFECTIVE_MESSAGES = [
  "(효과가 없다...)",
  "(공격이 흡수됐다!)",
  "(별 효과가 없다...)",
  "(통하지 않는다!)",
  "(피해가 줄어들었다!)",
];

// 최소 데미지 (1 데미지, 방어력 못 뚫음)
const RESISTANCE_BLOCKED_MESSAGES = [
  "(간신히 스쳤다!)",
  "(방어력을 뚫지 못했다!)",
  "(찰과상에 불과하다!)",
  "(겨우 긁혔다!)",
  "(피해가 거의 없다!)",
];

// ============ 공개 API ============

/**
 * 공격 메시지 생성
 * @param attackType 공격 타입
 * @param targetName 대상 이름
 * @param damage 데미지
 * @param isCritical 치명타 여부
 * @param resistanceMultiplier 저항 배율 (1.0=보통, 1.5=약함, 0.5=강함)
 * @param isMinDamage 최소 데미지(1) 여부
 */
export function getAttackMessage(
  attackType: CombatProficiencyType,
  targetName: string,
  damage: number,
  isCritical: boolean = false,
  resistanceMultiplier: number = 1.0,
  isMinDamage: boolean = false
): string {
  const messages = ATTACK_MESSAGES[attackType] || MEDIUM_SWORD_ATTACK_MESSAGES;
  const baseMessage = randomPick(messages)(targetName, damage);

  let result = baseMessage;

  // 치명타 접두사
  if (isCritical) {
    const critPrefix = randomPick(CRITICAL_PREFIXES);
    result = `${critPrefix} ${result}`;
  }

  // 저항 피드백 추가
  if (isMinDamage) {
    // 최소 데미지 (방어력 못 뚫음)
    result = `${result} ${randomPick(RESISTANCE_BLOCKED_MESSAGES)}`;
  } else if (resistanceMultiplier >= 1.3) {
    // 효과적 (약점 공격)
    result = `${result} ${randomPick(RESISTANCE_EFFECTIVE_MESSAGES)}`;
  } else if (resistanceMultiplier <= 0.7) {
    // 비효과적 (강한 저항)
    result = `${result} ${randomPick(RESISTANCE_INEFFECTIVE_MESSAGES)}`;
  }

  return result;
}

/**
 * 몬스터 공격 메시지 생성
 */
export function getMonsterAttackMessage(monsterName: string, damage: number): string {
  return randomPick(MONSTER_ATTACK_MESSAGES)(monsterName, damage);
}

/**
 * 전투 시작 메시지 생성
 */
export function getBattleStartMessage(monsterName: string, icon: string): string {
  return randomPick(BATTLE_START_MESSAGES)(monsterName, icon);
}

/**
 * 승리 메시지 생성
 */
export function getVictoryMessage(monsterName: string): string {
  return randomPick(VICTORY_MESSAGES)(monsterName);
}

/**
 * 패배 메시지 생성
 */
export function getDefeatMessage(): string {
  return randomPick(DEFEAT_MESSAGES);
}

/**
 * 도주 성공 메시지 생성
 */
export function getFleeSuccessMessage(): string {
  return randomPick(FLEE_SUCCESS_MESSAGES);
}

/**
 * 도주 실패 메시지 생성
 */
export function getFleeFailMessage(): string {
  return randomPick(FLEE_FAIL_MESSAGES);
}

/**
 * 회피 메시지 생성 (몬스터가 플레이어 공격 회피)
 */
export function getDodgeMessage(defenderName: string): string {
  return randomPick(DODGE_MESSAGES)(defenderName);
}

/**
 * 막기 메시지 생성 (몬스터가 플레이어 공격 막기)
 */
export function getBlockMessage(defenderName: string, reducedDamage: number): string {
  return randomPick(BLOCK_MESSAGES)(defenderName, reducedDamage);
}

/**
 * 빗맞음 메시지 생성 (플레이어 공격 빗맞음)
 */
export function getMissMessage(targetName: string): string {
  return randomPick(MISS_MESSAGES)(targetName);
}

/**
 * 플레이어 회피 메시지 생성
 */
export function getPlayerDodgeMessage(): string {
  return randomPick(PLAYER_DODGE_MESSAGES);
}

/**
 * 플레이어 막기 메시지 생성
 */
export function getPlayerBlockMessage(reducedDamage: number): string {
  return randomPick(PLAYER_BLOCK_MESSAGES)(reducedDamage);
}

/**
 * 몬스터 공격 빗맞음 메시지
 */
export function getMonsterMissMessage(): string {
  return randomPick(MONSTER_MISS_MESSAGES);
}

// ============ 플레이어 방어 스킬 메시지 ============

// 막기 성공 메시지 (reduced 변수 필요)
const GUARD_SUCCESS_MESSAGES = [
  (reduced: number) => `🛡️ 단단히 막아냈다! (-${reduced})`,
  (reduced: number) => `🛡️ 방어 자세로 충격을 흡수했다! (-${reduced})`,
  (reduced: number) => `🛡️ 공격을 버텨냈다! (-${reduced})`,
  (reduced: number) => `🛡️ 굳건히 버텼다! (-${reduced})`,
  (reduced: number) => `🛡️ 몸을 웅크려 피해를 줄였다! (-${reduced})`,
  (reduced: number) => `🛡️ 방패를 높이 들어 막았다! (-${reduced})`,
  (reduced: number) => `🛡️ 타이밍을 읽고 방어했다! (-${reduced})`,
];

// 회피 성공 메시지
const DODGE_SKILL_SUCCESS_MESSAGES = [
  "💨 날렵하게 피했다!",
  "💨 몸을 비틀어 회피!",
  "💨 재빠르게 벗어났다!",
  "💨 공격이 빗나갔다!",
  "💨 가볍게 피해버렸다!",
  "💨 순간이동하듯 피했다!",
  "💨 바람처럼 흘렸다!",
  "💨 종이 한 장 차이로 피했다!",
];

// 회피 실패 메시지
const DODGE_SKILL_FAIL_MESSAGES = [
  "💨 피하려 했지만 실패!",
  "💨 회피가 늦었다!",
  "💨 몸이 굳어버렸다!",
  "💨 읽혔다!",
  "💨 피할 틈이 없었다!",
  "💨 발이 꼬였다!",
];

// 반격 준비 메시지
const COUNTER_READY_MESSAGES = [
  "⚔️ 반격 자세!",
  "⚔️ 틈을 노린다!",
  "⚔️ 역습을 준비한다!",
  "⚔️ 상대의 빈틈을 노린다!",
];

/**
 * 막기 성공 메시지 생성
 */
export function getGuardSuccessMessage(reducedDamage: number): string {
  return randomPick(GUARD_SUCCESS_MESSAGES)(reducedDamage);
}

/**
 * 회피 스킬 성공 메시지 생성
 */
export function getDodgeSkillSuccessMessage(): string {
  return randomPick(DODGE_SKILL_SUCCESS_MESSAGES);
}

/**
 * 회피 스킬 실패 메시지 생성
 */
export function getDodgeSkillFailMessage(): string {
  return randomPick(DODGE_SKILL_FAIL_MESSAGES);
}

/**
 * 반격 준비 메시지 생성
 */
export function getCounterReadyMessage(): string {
  return randomPick(COUNTER_READY_MESSAGES);
}

// ============ 무기막기 메시지 ============

// 무기막기 기본 메시지 (무기별)
const WEAPON_BLOCK_MESSAGES: Record<string, ((dmg: number) => string)[]> = {
  light_sword: [
    (dmg: number) => `세검으로 공격을 흘려냈다! (${dmg} 감소)`,
    (dmg: number) => `칼날로 적의 공격을 비틀었다! ${dmg} 피해 경감!`,
    (dmg: number) => `날렵하게 흘려막기! ${dmg} 데미지 감소!`,
  ],
  medium_sword: [
    (dmg: number) => `검으로 공격을 막아냈다! (${dmg} 감소)`,
    (dmg: number) => `검날이 부딪히며 불꽃이 튀었다! ${dmg} 피해 경감!`,
    (dmg: number) => `검막기! ${dmg} 데미지 감소!`,
  ],
  great_sword: [
    (dmg: number) => `대검으로 패리했다! (${dmg} 감소)`,
    (dmg: number) => `묵직한 대검이 적의 공격을 막아섰다! ${dmg} 피해 경감!`,
    (dmg: number) => `대검 패리! ${dmg} 데미지 감소!`,
  ],
  axe: [
    (dmg: number) => `도끼로 공격을 흘렸다! (${dmg} 감소)`,
    (dmg: number) => `도끼날이 적의 무기와 부딪혔다! ${dmg} 피해 경감!`,
  ],
  mace: [
    (dmg: number) => `둔기로 공격을 막아냈다! (${dmg} 감소)`,
    (dmg: number) => `철퇴가 적의 공격을 튕겨냈다! ${dmg} 피해 경감!`,
  ],
  dagger: [
    (dmg: number) => `단검으로 급소를 보호했다! (${dmg} 감소)`,
    (dmg: number) => `재빠르게 단검을 들어올렸다! ${dmg} 피해 경감!`,
  ],
  spear: [
    (dmg: number) => `창대로 공격을 흘렸다! (${dmg} 감소)`,
    (dmg: number) => `창이 적의 공격을 비틀어냈다! ${dmg} 피해 경감!`,
  ],
  bow: [
    (dmg: number) => `활로 급소를 보호했다! (${dmg} 감소)`,
  ],
  crossbow: [
    (dmg: number) => `석궁으로 급소를 보호했다! (${dmg} 감소)`,
  ],
  staff: [
    (dmg: number) => `지팡이로 공격을 막았다! (${dmg} 감소)`,
    (dmg: number) => `지팡이에서 마력이 튀어올랐다! ${dmg} 피해 경감!`,
  ],
  fist: [
    (dmg: number) => `팔로 공격을 막았다! (${dmg} 감소)`,
    (dmg: number) => `팔막기! ${dmg} 피해 경감!`,
    (dmg: number) => `재빠른 방어 자세! ${dmg} 데미지 감소!`,
  ],
};

// 무기막기 특수 효과 메시지
const WEAPON_BLOCK_SPECIAL_MESSAGES: Record<WeaponBlockSpecial, string[]> = {
  counter: [
    "반격 준비 완료!",
    "반격의 기회!",
    "막아내며 반격 태세!",
  ],
  riposte: [
    "즉시 반격!",
    "흘리며 찌르기!",
    "빠른 반격!",
  ],
  stun: [
    "충격으로 적이 비틀거린다!",
    "적이 잠시 멈칫했다!",
    "기절 효과!",
  ],
  deflect: [
    "마법을 반사했다!",
    "마력이 튕겨나갔다!",
    "마법 흘리기!",
  ],
  disarm: [
    "적의 무기를 떨어뜨렸다!",
    "무장해제 성공!",
    "적의 손에서 무기가 빠져나갔다!",
  ],
  none: [],
};

/**
 * 무기막기 메시지 생성
 * @param weaponType 무기 타입
 * @param reducedDamage 감소된 데미지
 * @param specialEffect 특수 효과 (발동 시)
 */
export function getWeaponBlockMessage(
  weaponType: string,
  reducedDamage: number,
  specialEffect?: WeaponBlockSpecial
): string {
  const messages = WEAPON_BLOCK_MESSAGES[weaponType] || WEAPON_BLOCK_MESSAGES.fist;
  let result = randomPick(messages)(reducedDamage);

  // 특수 효과 메시지 추가
  if (specialEffect) {
    const specialMessages = WEAPON_BLOCK_SPECIAL_MESSAGES[specialEffect];
    result = `${result} ${randomPick(specialMessages)}`;
  }

  return result;
}

/**
 * 플레이어 무기막기 메시지 (몬스터 공격에 대한 방어)
 */
export function getPlayerWeaponBlockMessage(
  weaponType: string,
  reducedDamage: number,
  specialEffect?: WeaponBlockSpecial
): string {
  return getWeaponBlockMessage(weaponType, reducedDamage, specialEffect);
}

/**
 * 반격 데미지 메시지
 */
export function getCounterDamageMessage(damage: number): string {
  const messages = [
    `반격! 적에게 ${damage} 데미지!`,
    `카운터 어택! ${damage}!`,
    `되돌려주었다! ${damage} 데미지!`,
    `막으며 반격! ${damage}!`,
  ];
  return randomPick(messages);
}
