import { create } from "zustand";
import type { Monster } from "@/entities/monster";
import type { StatusEffect, StatusType } from "@/entities/status";
import {
  createStatusEffect,
  addStatusEffect,
  removeStatusEffect,
  tickStatusEffects,
  calculateDotDamage,
  calculateRegenHeal,
  calculateStatModifier,
  isIncapacitated,
  isSilenced,
  getShieldAmount,
  applyDamageToShield,
} from "@/entities/status";
import {
  getBattleStartMessage,
  getVictoryMessage,
  getDefeatMessage,
  getFleeSuccessMessage,
  getFleeFailMessage,
} from "@/features/combat/lib/messages";

// 전투 로그 엔트리
export interface BattleLogEntry {
  turn: number;
  actor: "player" | "monster" | "system";
  action: string;
  damage?: number;
  heal?: number;
  message: string;
  timestamp: number;
}

// 전투 결과
export type BattleResult = "ongoing" | "victory" | "defeat" | "fled";

// 전투 상태
export interface BattleState {
  isInBattle: boolean;
  monster: Monster | null;
  monsterCurrentHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  turn: number;
  battleLog: BattleLogEntry[];
  result: BattleResult;
  usedWeaponType: string | null;

  // 선공 시스템
  isPreemptivePhase: boolean; // 선제공격 단계인지
  monsterGoesFirst: boolean; // 몬스터가 선공인지

  // 상태이상
  playerBuffs: StatusEffect[];
  playerDebuffs: StatusEffect[];
  monsterBuffs: StatusEffect[];
  monsterDebuffs: StatusEffect[];
}

// 초기 상태
const initialBattleState: BattleState = {
  isInBattle: false,
  monster: null,
  monsterCurrentHp: 0,
  playerCurrentHp: 0,
  playerMaxHp: 100,
  playerMp: 50,
  playerMaxMp: 50,
  turn: 0,
  battleLog: [],
  result: "ongoing",
  usedWeaponType: null,
  isPreemptivePhase: false,
  monsterGoesFirst: false,
  playerBuffs: [],
  playerDebuffs: [],
  monsterBuffs: [],
  monsterDebuffs: [],
};

interface BattleStore {
  // State
  battle: BattleState;

  // Actions
  startBattle: (
    monster: Monster,
    playerHp: number,
    playerMaxHp: number,
    playerMp: number,
    playerMaxMp: number
  ) => void;
  playerAttack: (damage: number, message: string, weaponType?: string) => void;
  monsterAttack: (damage: number, message: string) => void;
  monsterPreemptiveAttack: (damage: number, message: string) => void;
  playerFlee: () => boolean;
  endBattle: (result: BattleResult) => void;
  addLog: (entry: Omit<BattleLogEntry, "timestamp">) => void;
  resetBattle: () => void;

  // MP 관리
  useMp: (amount: number) => boolean;
  healHp: (amount: number) => void;

  // 상태이상 관리
  applyPlayerStatus: (type: StatusType, value: number, duration?: number) => void;
  applyMonsterStatus: (type: StatusType, value: number, duration?: number) => void;
  removePlayerStatus: (effectId: string) => void;
  removeMonsterStatus: (effectId: string) => void;
  processStatusEffects: () => void; // 턴 시작 시 DoT/HoT 처리
  tickAllStatuses: () => void; // 턴 종료 시 지속시간 감소

  // Getters
  isPlayerTurn: () => boolean;
  getMonsterHpPercent: () => number;
  getPlayerHpPercent: () => number;
  getPlayerMpPercent: () => number;
  canUseSkill: (mpCost: number) => boolean;
  isPlayerIncapacitated: () => boolean;
  isPlayerSilenced: () => boolean;
  getPlayerAtkModifier: () => number;
  getPlayerDefModifier: () => number;
  getPlayerMagicModifier: () => number;
  getMonsterAtkModifier: () => number;
  getPlayerShieldAmount: () => number;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: initialBattleState,

  // 전투 시작
  startBattle: (monster, playerHp, playerMaxHp, playerMp, playerMaxMp) => {
    // 몬스터 behavior에 따른 선공 결정
    const monsterGoesFirst = monster.behavior === "aggressive";

    set({
      battle: {
        isInBattle: true,
        monster,
        monsterCurrentHp: monster.stats.hp,
        playerCurrentHp: playerHp,
        playerMaxHp,
        playerMp,
        playerMaxMp,
        turn: 1,
        battleLog: [
          {
            turn: 0,
            actor: "system",
            action: "start",
            message: getBattleStartMessage(monster.nameKo, monster.icon),
            timestamp: Date.now(),
          },
        ],
        result: "ongoing",
        usedWeaponType: null,
        isPreemptivePhase: monsterGoesFirst,
        monsterGoesFirst,
        playerBuffs: [],
        playerDebuffs: [],
        monsterBuffs: [],
        monsterDebuffs: [],
      },
    });
  },

  // 플레이어 공격
  playerAttack: (damage, message, weaponType) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;

    // 몬스터 보호막 확인
    let finalDamage = damage;
    let newMonsterBuffs = [...battle.monsterBuffs];
    const monsterShield = getShieldAmount(newMonsterBuffs);

    if (monsterShield > 0) {
      const { effects, remainingDamage } = applyDamageToShield(
        newMonsterBuffs,
        damage
      );
      newMonsterBuffs = effects;
      finalDamage = remainingDamage;

      if (remainingDamage < damage) {
        get().addLog({
          turn: battle.turn,
          actor: "system",
          action: "shield_absorb",
          message: `몬스터의 보호막이 ${damage - remainingDamage} 피해를 흡수했다!`,
        });
      }
    }

    const newMonsterHp = Math.max(0, battle.monsterCurrentHp - finalDamage);
    const newLog: BattleLogEntry = {
      turn: battle.turn,
      actor: "player",
      action: "attack",
      damage: finalDamage,
      message,
      timestamp: Date.now(),
    };

    // 몬스터 처치 확인
    if (newMonsterHp <= 0) {
      set({
        battle: {
          ...battle,
          monsterCurrentHp: 0,
          monsterBuffs: newMonsterBuffs,
          battleLog: [
            ...battle.battleLog,
            newLog,
            {
              turn: battle.turn,
              actor: "system",
              action: "victory",
              message: getVictoryMessage(battle.monster?.nameKo || "적"),
              timestamp: Date.now(),
            },
          ],
          result: "victory",
          usedWeaponType: weaponType || battle.usedWeaponType,
        },
      });
    } else {
      set({
        battle: {
          ...battle,
          monsterCurrentHp: newMonsterHp,
          monsterBuffs: newMonsterBuffs,
          battleLog: [...battle.battleLog, newLog],
          usedWeaponType: weaponType || battle.usedWeaponType,
        },
      });
    }
  },

  // 몬스터 공격
  monsterAttack: (damage, message) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;

    // 플레이어 보호막 확인
    let finalDamage = damage;
    let newPlayerBuffs = [...battle.playerBuffs];
    const playerShield = getShieldAmount(newPlayerBuffs);

    if (playerShield > 0) {
      const { effects, remainingDamage } = applyDamageToShield(
        newPlayerBuffs,
        damage
      );
      newPlayerBuffs = effects;
      finalDamage = remainingDamage;

      if (remainingDamage < damage) {
        get().addLog({
          turn: battle.turn,
          actor: "system",
          action: "shield_absorb",
          message: `보호막이 ${damage - remainingDamage} 피해를 흡수했다!`,
        });
      }
    }

    const newPlayerHp = Math.max(0, battle.playerCurrentHp - finalDamage);
    const newLog: BattleLogEntry = {
      turn: battle.turn,
      actor: "monster",
      action: "attack",
      damage: finalDamage,
      message,
      timestamp: Date.now(),
    };

    // 플레이어 패배 확인
    if (newPlayerHp <= 0) {
      set({
        battle: {
          ...battle,
          playerCurrentHp: 0,
          playerBuffs: newPlayerBuffs,
          turn: battle.turn + 1,
          battleLog: [
            ...battle.battleLog,
            newLog,
            {
              turn: battle.turn,
              actor: "system",
              action: "defeat",
              message: getDefeatMessage(),
              timestamp: Date.now(),
            },
          ],
          result: "defeat",
        },
      });
    } else {
      set({
        battle: {
          ...battle,
          playerCurrentHp: newPlayerHp,
          playerBuffs: newPlayerBuffs,
          turn: battle.turn + 1,
          battleLog: [...battle.battleLog, newLog],
        },
      });
    }
  },

  // 몬스터 선제공격 (aggressive 몬스터 전용)
  monsterPreemptiveAttack: (damage, message) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;
    if (!battle.isPreemptivePhase) return;

    // 플레이어 보호막 확인
    let finalDamage = damage;
    let newPlayerBuffs = [...battle.playerBuffs];
    const playerShield = getShieldAmount(newPlayerBuffs);

    if (playerShield > 0) {
      const { effects, remainingDamage } = applyDamageToShield(
        newPlayerBuffs,
        damage
      );
      newPlayerBuffs = effects;
      finalDamage = remainingDamage;

      if (remainingDamage < damage) {
        get().addLog({
          turn: battle.turn,
          actor: "system",
          action: "shield_absorb",
          message: `보호막이 ${damage - remainingDamage} 피해를 흡수했다!`,
        });
      }
    }

    const newPlayerHp = Math.max(0, battle.playerCurrentHp - finalDamage);
    const newLog: BattleLogEntry = {
      turn: 0, // 선제공격은 턴 0
      actor: "monster",
      action: "preemptive",
      damage: finalDamage,
      message,
      timestamp: Date.now(),
    };

    // 플레이어 패배 확인
    if (newPlayerHp <= 0) {
      set({
        battle: {
          ...battle,
          playerCurrentHp: 0,
          playerBuffs: newPlayerBuffs,
          isPreemptivePhase: false,
          battleLog: [
            ...battle.battleLog,
            newLog,
            {
              turn: 0,
              actor: "system",
              action: "defeat",
              message: getDefeatMessage(),
              timestamp: Date.now(),
            },
          ],
          result: "defeat",
        },
      });
    } else {
      // 선제공격 후 플레이어 턴으로
      set({
        battle: {
          ...battle,
          playerCurrentHp: newPlayerHp,
          playerBuffs: newPlayerBuffs,
          isPreemptivePhase: false,
          battleLog: [...battle.battleLog, newLog],
        },
      });
    }
  },

  // 도주 시도
  playerFlee: () => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return false;

    const fleeChance = 0.5;
    const success = Math.random() < fleeChance;

    if (success) {
      set({
        battle: {
          ...battle,
          battleLog: [
            ...battle.battleLog,
            {
              turn: battle.turn,
              actor: "player",
              action: "flee",
              message: getFleeSuccessMessage(),
              timestamp: Date.now(),
            },
          ],
          result: "fled",
        },
      });
    } else {
      set({
        battle: {
          ...battle,
          battleLog: [
            ...battle.battleLog,
            {
              turn: battle.turn,
              actor: "player",
              action: "flee_fail",
              message: getFleeFailMessage(),
              timestamp: Date.now(),
            },
          ],
        },
      });
    }

    return success;
  },

  // 전투 종료
  endBattle: (result) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        result,
        isInBattle: result === "ongoing",
      },
    });
  },

  // 로그 추가
  addLog: (entry) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        battleLog: [...battle.battleLog, { ...entry, timestamp: Date.now() }],
      },
    });
  },

  // 전투 초기화
  resetBattle: () => {
    set({ battle: initialBattleState });
  },

  // MP 사용
  useMp: (amount) => {
    const { battle } = get();
    if (battle.playerMp < amount) return false;

    set({
      battle: {
        ...battle,
        playerMp: battle.playerMp - amount,
      },
    });
    return true;
  },

  // HP 회복
  healHp: (amount) => {
    const { battle } = get();
    const newHp = Math.min(battle.playerMaxHp, battle.playerCurrentHp + amount);
    const actualHeal = newHp - battle.playerCurrentHp;

    if (actualHeal > 0) {
      set({
        battle: {
          ...battle,
          playerCurrentHp: newHp,
        },
      });

      get().addLog({
        turn: battle.turn,
        actor: "player",
        action: "heal",
        heal: actualHeal,
        message: `HP를 ${actualHeal} 회복했다!`,
      });
    }
  },

  // 플레이어에게 상태이상 적용
  applyPlayerStatus: (type, value, duration) => {
    const { battle } = get();
    const effect = createStatusEffect(type, value, duration);
    const isDebuff = effect.category === "debuff";

    if (isDebuff) {
      const newDebuffs = addStatusEffect(battle.playerDebuffs, effect);
      set({
        battle: {
          ...battle,
          playerDebuffs: newDebuffs,
        },
      });
      get().addLog({
        turn: battle.turn,
        actor: "system",
        action: "debuff",
        message: `${effect.icon} ${effect.nameKo} 상태이상에 걸렸다!`,
      });
    } else {
      const newBuffs = addStatusEffect(battle.playerBuffs, effect);
      set({
        battle: {
          ...battle,
          playerBuffs: newBuffs,
        },
      });
      get().addLog({
        turn: battle.turn,
        actor: "player",
        action: "buff",
        message: `${effect.icon} ${effect.nameKo} 효과가 발동했다!`,
      });
    }
  },

  // 몬스터에게 상태이상 적용
  applyMonsterStatus: (type, value, duration) => {
    const { battle } = get();
    const effect = createStatusEffect(type, value, duration);
    const isDebuff = effect.category === "debuff";

    if (isDebuff) {
      const newDebuffs = addStatusEffect(battle.monsterDebuffs, effect);
      set({
        battle: {
          ...battle,
          monsterDebuffs: newDebuffs,
        },
      });
      get().addLog({
        turn: battle.turn,
        actor: "player",
        action: "debuff",
        message: `${battle.monster?.nameKo}에게 ${effect.icon} ${effect.nameKo}를 걸었다!`,
      });
    } else {
      const newBuffs = addStatusEffect(battle.monsterBuffs, effect);
      set({
        battle: {
          ...battle,
          monsterBuffs: newBuffs,
        },
      });
    }
  },

  // 플레이어 상태이상 제거
  removePlayerStatus: (effectId) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        playerBuffs: removeStatusEffect(battle.playerBuffs, effectId),
        playerDebuffs: removeStatusEffect(battle.playerDebuffs, effectId),
      },
    });
  },

  // 몬스터 상태이상 제거
  removeMonsterStatus: (effectId) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        monsterBuffs: removeStatusEffect(battle.monsterBuffs, effectId),
        monsterDebuffs: removeStatusEffect(battle.monsterDebuffs, effectId),
      },
    });
  },

  // 턴 시작 시 DoT/HoT 처리
  processStatusEffects: () => {
    const { battle } = get();
    if (!battle.isInBattle) return;

    // 플레이어 DoT 피해
    const playerDot = calculateDotDamage(battle.playerDebuffs);
    if (playerDot > 0) {
      const newHp = Math.max(0, battle.playerCurrentHp - playerDot);
      set({
        battle: {
          ...get().battle,
          playerCurrentHp: newHp,
        },
      });
      get().addLog({
        turn: battle.turn,
        actor: "system",
        action: "dot",
        damage: playerDot,
        message: `지속 피해로 ${playerDot} 데미지를 받았다!`,
      });

      if (newHp <= 0) {
        get().endBattle("defeat");
        return;
      }
    }

    // 플레이어 HoT 회복
    const playerHot = calculateRegenHeal(battle.playerBuffs);
    if (playerHot > 0) {
      const newHp = Math.min(
        battle.playerMaxHp,
        battle.playerCurrentHp + playerHot
      );
      const actualHeal = newHp - battle.playerCurrentHp;
      if (actualHeal > 0) {
        set({
          battle: {
            ...get().battle,
            playerCurrentHp: newHp,
          },
        });
        get().addLog({
          turn: battle.turn,
          actor: "system",
          action: "hot",
          heal: actualHeal,
          message: `재생 효과로 HP ${actualHeal} 회복!`,
        });
      }
    }

    // 몬스터 DoT 피해
    const monsterDot = calculateDotDamage(battle.monsterDebuffs);
    if (monsterDot > 0) {
      const newHp = Math.max(0, battle.monsterCurrentHp - monsterDot);
      set({
        battle: {
          ...get().battle,
          monsterCurrentHp: newHp,
        },
      });
      get().addLog({
        turn: battle.turn,
        actor: "system",
        action: "dot",
        damage: monsterDot,
        message: `${battle.monster?.nameKo}이(가) 지속 피해로 ${monsterDot} 데미지!`,
      });

      if (newHp <= 0) {
        get().endBattle("victory");
      }
    }
  },

  // 턴 종료 시 모든 상태이상 지속시간 감소
  tickAllStatuses: () => {
    const { battle } = get();

    const newPlayerBuffs = tickStatusEffects(battle.playerBuffs);
    const newPlayerDebuffs = tickStatusEffects(battle.playerDebuffs);
    const newMonsterBuffs = tickStatusEffects(battle.monsterBuffs);
    const newMonsterDebuffs = tickStatusEffects(battle.monsterDebuffs);

    // 만료된 효과 로그
    const expiredPlayerBuffs = battle.playerBuffs.filter(
      (b) => !newPlayerBuffs.find((nb) => nb.id === b.id)
    );
    const expiredPlayerDebuffs = battle.playerDebuffs.filter(
      (d) => !newPlayerDebuffs.find((nd) => nd.id === d.id)
    );

    expiredPlayerBuffs.forEach((buff) => {
      get().addLog({
        turn: battle.turn,
        actor: "system",
        action: "buff_expire",
        message: `${buff.icon} ${buff.nameKo} 효과가 사라졌다.`,
      });
    });

    expiredPlayerDebuffs.forEach((debuff) => {
      get().addLog({
        turn: battle.turn,
        actor: "system",
        action: "debuff_expire",
        message: `${debuff.icon} ${debuff.nameKo} 효과가 해제되었다.`,
      });
    });

    set({
      battle: {
        ...battle,
        playerBuffs: newPlayerBuffs,
        playerDebuffs: newPlayerDebuffs,
        monsterBuffs: newMonsterBuffs,
        monsterDebuffs: newMonsterDebuffs,
      },
    });
  },

  // Getters
  isPlayerTurn: () => {
    const { battle } = get();
    // 선제공격 단계에서는 몬스터가 선공이면 플레이어 턴 아님
    if (battle.isPreemptivePhase && battle.monsterGoesFirst) {
      return false;
    }
    return battle.turn % 2 === 1;
  },

  getMonsterHpPercent: () => {
    const { battle } = get();
    if (!battle.monster) return 0;
    return (battle.monsterCurrentHp / battle.monster.stats.hp) * 100;
  },

  getPlayerHpPercent: () => {
    const { battle } = get();
    if (battle.playerMaxHp === 0) return 0;
    return (battle.playerCurrentHp / battle.playerMaxHp) * 100;
  },

  getPlayerMpPercent: () => {
    const { battle } = get();
    if (battle.playerMaxMp === 0) return 0;
    return (battle.playerMp / battle.playerMaxMp) * 100;
  },

  canUseSkill: (mpCost) => {
    const { battle } = get();
    return battle.playerMp >= mpCost;
  },

  isPlayerIncapacitated: () => {
    const { battle } = get();
    return isIncapacitated(battle.playerDebuffs);
  },

  isPlayerSilenced: () => {
    const { battle } = get();
    return isSilenced(battle.playerDebuffs);
  },

  getPlayerAtkModifier: () => {
    const { battle } = get();
    const buffMod = calculateStatModifier(battle.playerBuffs, "atk");
    const debuffMod = calculateStatModifier(battle.playerDebuffs, "atk");
    return buffMod + debuffMod;
  },

  getPlayerDefModifier: () => {
    const { battle } = get();
    const buffMod = calculateStatModifier(battle.playerBuffs, "def");
    const debuffMod = calculateStatModifier(battle.playerDebuffs, "def");
    return buffMod + debuffMod;
  },

  getPlayerMagicModifier: () => {
    const { battle } = get();
    const buffMod = calculateStatModifier(battle.playerBuffs, "magic");
    const debuffMod = calculateStatModifier(battle.playerDebuffs, "magic");
    return buffMod + debuffMod;
  },

  getMonsterAtkModifier: () => {
    const { battle } = get();
    const buffMod = calculateStatModifier(battle.monsterBuffs, "atk");
    const debuffMod = calculateStatModifier(battle.monsterDebuffs, "atk");
    return buffMod + debuffMod;
  },

  getPlayerShieldAmount: () => {
    const { battle } = get();
    return getShieldAmount(battle.playerBuffs);
  },
}));
