import type { DuelParticipant } from "@/application/stores";
import { calculateDamage, applyCritical } from "@/features/combat";
import type { ProficiencyType } from "@/entities/proficiency";

// ============ 선공 결정 ============

/**
 * DEX 기반 선공 결정
 * DEX가 높은 쪽이 선공, 동일하면 랜덤
 */
export function determineFirstTurn(
  player1: DuelParticipant,
  player2: DuelParticipant
): string {
  const dex1 = player1.stats.dex;
  const dex2 = player2.stats.dex;

  if (dex1 > dex2) return player1.id;
  if (dex2 > dex1) return player2.id;

  // DEX 동일 시 랜덤
  return Math.random() < 0.5 ? player1.id : player2.id;
}

// ============ PvP 방어력 계산 ============

/**
 * PvP 물리 방어력 (CON * 0.5)
 */
export function calculatePvpPhysicalDefense(con: number): number {
  return Math.floor(con * 0.5);
}

/**
 * PvP 마법 방어력 (WIS * 0.3)
 */
export function calculatePvpMagicDefense(wis: number): number {
  return Math.floor(wis * 0.3);
}

// ============ PvP 데미지 계산 ============

interface PvpDamageParams {
  attacker: DuelParticipant;
  defender: DuelParticipant;
  attackType: ProficiencyType;
  baseDamage?: number;
}

/**
 * PvP 데미지 계산
 * - 물리: calculateDamage 사용, 방어력은 CON * 0.5
 * - 마법: calculateDamage 사용, 방어력은 WIS * 0.3, 속성 상성 적용
 */
export function calculatePvpDamage(params: PvpDamageParams): {
  damage: number;
  isCritical: boolean;
} {
  const { attacker, defender, attackType, baseDamage = 10 } = params;

  // 무기 타입인지 마법 타입인지 확인
  const weaponTypes = ["sword", "axe", "mace", "dagger", "spear", "bow", "crossbow", "staff"];
  const isWeapon = weaponTypes.includes(attackType);

  // 방어력 계산
  const targetDefense = isWeapon
    ? calculatePvpPhysicalDefense(defender.stats.con)
    : calculatePvpMagicDefense(defender.stats.wis);

  // 숙련도 레벨
  const proficiencyLevel = attacker.proficiencies[attackType] ?? 0;

  // 기본 데미지 계산
  const damage = calculateDamage({
    baseDamage,
    attackerStats: attacker.stats,
    attackType,
    proficiencyLevel,
    targetDefense,
    targetElement: null, // PvP는 속성 상성 없음 (마법 간 상성만)
  });

  // 크리티컬 적용 (LCK + DEX/INT 기반)
  const lck = attacker.stats.lck ?? 10;
  const isPhysical = weaponTypes.includes(attackType);
  const secondaryStat = isPhysical ? attacker.stats.dex : attacker.stats.int;
  const { damage: finalDamage, isCritical } = applyCritical(damage, lck, secondaryStat);

  return {
    damage: Math.max(1, finalDamage), // 최소 1 데미지
    isCritical,
  };
}

// ============ HP 계산 ============

/**
 * 기본 HP 계산 (CON 기반)
 */
export function calculateMaxHp(con: number, level: number = 1): number {
  return 50 + con * 5 + level * 10;
}

// ============ 도주 확률 ============

/**
 * 도주 성공 확률 (DEX 기반)
 * 기본 30% + (내 DEX - 상대 DEX) * 2%
 */
export function calculateFleeChance(myDex: number, opponentDex: number): number {
  const baseChance = 0.3;
  const dexBonus = (myDex - opponentDex) * 0.02;
  return Math.min(0.8, Math.max(0.1, baseChance + dexBonus)); // 10% ~ 80%
}

/**
 * 도주 시도
 */
export function attemptFlee(myDex: number, opponentDex: number): boolean {
  const chance = calculateFleeChance(myDex, opponentDex);
  return Math.random() < chance;
}

// ============ 결투 ID 생성 ============

/**
 * 고유 결투 ID 생성
 */
export function generateDuelId(player1Id: string, player2Id: string): string {
  return `duel-${player1Id}-${player2Id}-${Date.now()}`;
}

// ============ 공격 메시지 생성 ============

interface AttackMessageParams {
  attackerName: string;
  defenderName: string;
  attackType: ProficiencyType;
  damage: number;
  isCritical: boolean;
}

/**
 * 공격 메시지 생성
 */
export function generateAttackMessage(params: AttackMessageParams): string {
  const { attackerName, defenderName, attackType, damage, isCritical } = params;

  const attackNames: Record<ProficiencyType, string> = {
    light_sword: "세검",
    medium_sword: "중검",
    great_sword: "대검",
    axe: "도끼",
    mace: "둔기",
    dagger: "단검",
    spear: "창",
    bow: "활",
    crossbow: "석궁",
    staff: "지팡이",
    fist: "격투",
    fire: "화염",
    ice: "냉기",
    lightning: "번개",
    earth: "대지",
    holy: "신성",
    dark: "암흑",
  };

  const attackName = attackNames[attackType] || attackType;
  const criticalPrefix = isCritical ? "치명타! " : "";

  return `${criticalPrefix}${attackerName}의 ${attackName} 공격! ${defenderName}에게 ${damage} 데미지!`;
}
