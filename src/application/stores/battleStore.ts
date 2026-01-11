import { create } from "zustand";
import type { Monster } from "@/entities/monster";
import type { StatusEffect, StatusType } from "@/entities/status";
import type { QueuedAbility, Ability } from "@/entities/ability";
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
  getGuardSuccessMessage,
  getDodgeSkillSuccessMessage,
  getDodgeSkillFailMessage,
  getCounterReadyMessage,
} from "@/features/combat/lib/messages";

// ============ 타입 정의 ============

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

// 전투 페이즈
export type BattlePhase =
  | "planning"   // 행동 선택 중
  | "executing"  // 큐 실행 중
  | "ended";     // 전투 종료

// 큐에 들어가는 액션 (어빌리티 + 메타 정보)
export interface QueuedAction {
  ability: Ability;
  level: number;
  apCost: number;
  mpCost: number;
}

// 전투 상태
export interface BattleState {
  isInBattle: boolean;
  monster: Monster | null;
  phase: BattlePhase;

  // HP/MP
  monsterCurrentHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;

  // AP 시스템
  playerMaxAp: number;
  playerCurrentAp: number;
  monsterMaxAp: number;
  monsterCurrentAp: number;

  // 액션 큐 (턴 시작 시 행동 담아서 실행)
  playerQueue: QueuedAction[];
  monsterQueue: QueuedAction[];

  // DEX 기반 선공 (speed 사용)
  playerDex: number;
  monsterDex: number;
  playerGoesFirst: boolean;

  // 레거시 호환
  isPreemptivePhase: boolean;    // 선제공격 단계 (호환용)
  monsterGoesFirst: boolean;     // playerGoesFirst의 반대값

  // 턴
  turn: number;
  battleLog: BattleLogEntry[];
  result: BattleResult;
  usedWeaponType: string | null;

  // 상태이상
  playerBuffs: StatusEffect[];
  playerDebuffs: StatusEffect[];
  monsterBuffs: StatusEffect[];
  monsterDebuffs: StatusEffect[];

  // 방어 행동 큐 (여러 번 방어 시 스택)
  defensiveActions: DefensiveAction[];
}

// 방어 행동 타입
export interface DefensiveAction {
  type: "guard" | "dodge" | "counter";
  value: number; // guard: 감소율%, dodge: 회피확률%, counter: 반격데미지
}

// 기본 AP
const DEFAULT_PLAYER_MAX_AP = 10;
const DEFAULT_MONSTER_MAX_AP = 10;

// 초기 상태
const initialBattleState: BattleState = {
  isInBattle: false,
  monster: null,
  phase: "planning",
  monsterCurrentHp: 0,
  playerCurrentHp: 0,
  playerMaxHp: 100,
  playerMp: 50,
  playerMaxMp: 50,
  playerMaxAp: DEFAULT_PLAYER_MAX_AP,
  playerCurrentAp: DEFAULT_PLAYER_MAX_AP,
  monsterMaxAp: DEFAULT_MONSTER_MAX_AP,
  monsterCurrentAp: DEFAULT_MONSTER_MAX_AP,
  playerQueue: [],
  monsterQueue: [],
  playerDex: 10,
  monsterDex: 5,
  playerGoesFirst: true,
  isPreemptivePhase: false,
  monsterGoesFirst: false,
  turn: 0,
  battleLog: [],
  result: "ongoing",
  usedWeaponType: null,
  playerBuffs: [],
  playerDebuffs: [],
  monsterBuffs: [],
  monsterDebuffs: [],
  defensiveActions: [],
};

// ============ 스토어 인터페이스 ============

interface BattleStore {
  battle: BattleState;

  // 전투 시작/종료
  startBattle: (
    monster: Monster,
    playerHp: number,
    playerMaxHp: number,
    playerMp: number,
    playerMaxMp: number,
    playerDex?: number,
    playerMaxAp?: number
  ) => void;
  endBattle: (result: BattleResult) => void;
  resetBattle: () => void;

  // AP/큐 시스템
  addToPlayerQueue: (action: QueuedAction) => boolean;
  removeFromPlayerQueue: (index: number) => void;
  clearPlayerQueue: () => void;
  setMonsterQueue: (actions: QueuedAction[]) => void;

  // 턴 실행
  executeQueues: () => void;
  startNextTurn: () => void;

  // 데미지/힐
  dealDamageToMonster: (damage: number, message: string, weaponType?: string) => void;
  dealDamageToPlayer: (damage: number, message: string) => void;
  healPlayer: (amount: number) => void;

  // 레거시 호환 (기존 코드용)
  playerAttack: (damage: number, message: string, weaponType?: string) => void;
  monsterAttack: (damage: number, message: string) => void;
  healHp: (amount: number) => void;
  monsterPreemptiveAttack: (damage: number, message: string) => void;

  // MP
  useMp: (amount: number) => boolean;

  // 도주
  playerFlee: () => boolean;

  // 로그
  addLog: (entry: Omit<BattleLogEntry, "timestamp">) => void;

  // 상태이상
  applyPlayerStatus: (type: StatusType, value: number, duration?: number) => void;
  applyMonsterStatus: (type: StatusType, value: number, duration?: number) => void;
  removePlayerStatus: (effectId: string) => void;
  removeMonsterStatus: (effectId: string) => void;
  processStatusEffects: () => void;
  tickAllStatuses: () => void;

  // 방어 자세
  // 방어 행동 큐
  addDefensiveAction: (type: "guard" | "dodge" | "counter", value: number) => void;
  clearDefensiveActions: () => void;
  getDefensiveActionCount: () => number;

  // 레거시 (하위호환)
  setDefensiveStance: (stance: "none" | "guard" | "dodge" | "counter", value?: number) => void;
  clearDefensiveStance: () => void;
  getDefensiveStance: () => { stance: string; value: number };

  // Getters
  isPlayerTurn: () => boolean;
  getMonsterHpPercent: () => number;
  getPlayerHpPercent: () => number;
  getPlayerMpPercent: () => number;
  getPlayerApPercent: () => number;
  canUseSkill: (mpCost: number) => boolean;
  canAffordAp: (apCost: number) => boolean;
  isPlayerIncapacitated: () => boolean;
  isPlayerSilenced: () => boolean;
  getPlayerAtkModifier: () => number;
  getPlayerDefModifier: () => number;
  getPlayerMagicModifier: () => number;
  getMonsterAtkModifier: () => number;
  getPlayerShieldAmount: () => number;
  getRemainingPlayerAp: () => number;
  getQueuedApCost: () => number;
}

// ============ 스토어 구현 ============

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: initialBattleState,

  // 전투 시작
  startBattle: (monster, playerHp, playerMaxHp, playerMp, playerMaxMp, playerDex = 10, playerMaxAp) => {
    const monsterDex = monster.stats.speed ?? 5;
    const monsterAp = monster.maxAp ?? DEFAULT_MONSTER_MAX_AP;
    const pMaxAp = playerMaxAp ?? DEFAULT_PLAYER_MAX_AP;
    const playerGoesFirst = playerDex >= monsterDex;
    const monsterGoesFirst = !playerGoesFirst;
    // 레거시: aggressive 몬스터는 선제공격 페이즈 진입
    const isPreemptivePhase = monsterGoesFirst && monster.behavior === "aggressive";

    set({
      battle: {
        isInBattle: true,
        monster,
        phase: "planning",
        monsterCurrentHp: monster.stats.hp,
        playerCurrentHp: playerHp,
        playerMaxHp,
        playerMp,
        playerMaxMp,
        playerMaxAp: pMaxAp,
        playerCurrentAp: pMaxAp,
        monsterMaxAp: monsterAp,
        monsterCurrentAp: monsterAp,
        playerQueue: [],
        monsterQueue: [],
        playerDex,
        monsterDex,
        playerGoesFirst,
        isPreemptivePhase,
        monsterGoesFirst,
        turn: 1,
        battleLog: [
          {
            turn: 0,
            actor: "system",
            action: "start",
            message: getBattleStartMessage(monster.nameKo, monster.icon),
            timestamp: Date.now(),
          },
          {
            turn: 0,
            actor: "system",
            action: "initiative",
            message: playerGoesFirst
              ? `DEX ${playerDex} vs ${monsterDex} - 플레이어 선공!`
              : `DEX ${playerDex} vs ${monsterDex} - ${monster.nameKo} 선공!`,
            timestamp: Date.now(),
          },
        ],
        result: "ongoing",
        usedWeaponType: null,
        playerBuffs: [],
        playerDebuffs: [],
        monsterBuffs: [],
        monsterDebuffs: [],
        defensiveActions: [],
      },
    });
  },

  // 전투 종료
  endBattle: (result) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        result,
        phase: "ended",
        isInBattle: result === "ongoing",
      },
    });
  },

  // 전투 초기화
  resetBattle: () => {
    set({ battle: initialBattleState });
  },

  // 플레이어 큐에 행동 추가
  addToPlayerQueue: (action) => {
    const { battle } = get();
    const totalQueuedAp = battle.playerQueue.reduce((sum, a) => sum + a.apCost, 0);
    const newTotal = totalQueuedAp + action.apCost;

    if (newTotal > battle.playerMaxAp) {
      return false; // AP 초과
    }

    if (action.mpCost > 0 && action.mpCost > battle.playerMp) {
      return false; // MP 부족
    }

    set({
      battle: {
        ...battle,
        playerQueue: [...battle.playerQueue, action],
      },
    });
    return true;
  },

  // 플레이어 큐에서 행동 제거
  removeFromPlayerQueue: (index) => {
    const { battle } = get();
    const newQueue = [...battle.playerQueue];
    newQueue.splice(index, 1);
    set({
      battle: {
        ...battle,
        playerQueue: newQueue,
      },
    });
  },

  // 플레이어 큐 클리어
  clearPlayerQueue: () => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        playerQueue: [],
      },
    });
  },

  // 몬스터 큐 설정 (AI가 결정)
  setMonsterQueue: (actions) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        monsterQueue: actions,
      },
    });
  },

  // 큐 실행 (플레이어와 몬스터가 번갈아가며 실행)
  executeQueues: () => {
    const { battle } = get();
    if (battle.phase !== "planning") return;

    set({
      battle: {
        ...battle,
        phase: "executing",
      },
    });

    // 실제 실행은 BattlePanel UI에서 순차적으로 처리
    // 여기서는 phase만 변경
  },

  // 다음 턴 시작
  startNextTurn: () => {
    const { battle, tickAllStatuses, processStatusEffects } = get();

    // 상태이상 효과 처리
    processStatusEffects();
    tickAllStatuses();

    // AP 회복 및 큐 초기화
    set({
      battle: {
        ...battle,
        turn: battle.turn + 1,
        phase: "planning",
        playerCurrentAp: battle.playerMaxAp,
        monsterCurrentAp: battle.monsterMaxAp,
        playerQueue: [],
        monsterQueue: [],
      },
    });

    get().addLog({
      turn: battle.turn + 1,
      actor: "system",
      action: "new_turn",
      message: `=== 턴 ${battle.turn + 1} ===`,
    });
  },

  // 몬스터에게 데미지
  dealDamageToMonster: (damage, message, weaponType) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;

    // 몬스터 보호막 확인
    let finalDamage = damage;
    let newMonsterBuffs = [...battle.monsterBuffs];
    const monsterShield = getShieldAmount(newMonsterBuffs);

    if (monsterShield > 0) {
      const { effects, remainingDamage } = applyDamageToShield(newMonsterBuffs, damage);
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
          phase: "ended",
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

  // 플레이어에게 데미지
  dealDamageToPlayer: (damage, message) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;

    let finalDamage = damage;
    let newPlayerBuffs = [...battle.playerBuffs];
    let defensiveMessage = "";
    let newDefensiveActions = [...battle.defensiveActions];

    // 1. 방어 행동 큐 확인 (첫 번째 액션 소비)
    if (newDefensiveActions.length > 0) {
      const action = newDefensiveActions.shift()!; // 첫 번째 액션 꺼내기

      if (action.type === "guard" && action.value > 0) {
        // 막기: 데미지 감소
        const reduction = action.value / 100; // % -> 소수
        const reduced = Math.floor(finalDamage * reduction);
        finalDamage = finalDamage - reduced;
        defensiveMessage = getGuardSuccessMessage(reduced) + " ";
      } else if (action.type === "dodge") {
        // 회피: 확률 굴림
        const dodgeRoll = Math.random() * 100;
        if (dodgeRoll < action.value) {
          finalDamage = 0;
          defensiveMessage = getDodgeSkillSuccessMessage() + " ";
        } else {
          defensiveMessage = getDodgeSkillFailMessage() + " ";
        }
      } else if (action.type === "counter") {
        // 반격: 나중에 구현
        defensiveMessage = getCounterReadyMessage() + " ";
      }
    }

    // 2. 플레이어 보호막 확인
    const playerShield = getShieldAmount(newPlayerBuffs);

    if (playerShield > 0 && finalDamage > 0) {
      const { effects, remainingDamage } = applyDamageToShield(newPlayerBuffs, finalDamage);
      newPlayerBuffs = effects;

      if (remainingDamage < finalDamage) {
        get().addLog({
          turn: battle.turn,
          actor: "system",
          action: "shield_absorb",
          message: `보호막이 ${finalDamage - remainingDamage} 피해를 흡수했다!`,
        });
      }
      finalDamage = remainingDamage;
    }

    const newPlayerHp = Math.max(0, battle.playerCurrentHp - finalDamage);
    const finalMessage = defensiveMessage + message;
    const newLog: BattleLogEntry = {
      turn: battle.turn,
      actor: "monster",
      action: "attack",
      damage: finalDamage,
      message: finalMessage,
      timestamp: Date.now(),
    };

    if (newPlayerHp <= 0) {
      set({
        battle: {
          ...battle,
          playerCurrentHp: 0,
          playerBuffs: newPlayerBuffs,
          defensiveActions: newDefensiveActions,
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
          phase: "ended",
        },
      });
    } else {
      set({
        battle: {
          ...battle,
          playerCurrentHp: newPlayerHp,
          playerBuffs: newPlayerBuffs,
          defensiveActions: newDefensiveActions,
          battleLog: [...battle.battleLog, newLog],
        },
      });
    }
  },

  // 플레이어 힐
  healPlayer: (amount) => {
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

  // 레거시 호환 메서드들 (기존 코드용)
  playerAttack: (damage, message, weaponType) => {
    get().dealDamageToMonster(damage, message, weaponType);
  },

  monsterAttack: (damage, message) => {
    get().dealDamageToPlayer(damage, message);
  },

  healHp: (amount) => {
    get().healPlayer(amount);
  },

  monsterPreemptiveAttack: (damage, message) => {
    // 선제공격 후 isPreemptivePhase를 false로 설정
    const { battle } = get();
    get().dealDamageToPlayer(damage, message);
    set({
      battle: {
        ...get().battle,
        isPreemptivePhase: false,
      },
    });
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

  // 도주
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
          phase: "ended",
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

  // 방어 행동 추가 (큐에 푸시)
  addDefensiveAction: (type, value) => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        defensiveActions: [...battle.defensiveActions, { type, value }],
      },
    });
  },

  // 방어 행동 큐 초기화
  clearDefensiveActions: () => {
    const { battle } = get();
    set({
      battle: {
        ...battle,
        defensiveActions: [],
      },
    });
  },

  // 방어 행동 남은 횟수
  getDefensiveActionCount: () => {
    const { battle } = get();
    return battle.defensiveActions.length;
  },

  // 레거시: 방어 자세 설정 (addDefensiveAction으로 매핑)
  setDefensiveStance: (stance, value = 0) => {
    if (stance === "none") {
      get().clearDefensiveActions();
    } else {
      get().addDefensiveAction(stance, value);
    }
  },

  // 레거시: 방어 자세 초기화
  clearDefensiveStance: () => {
    get().clearDefensiveActions();
  },

  // 레거시: 방어 자세 가져오기 (첫 번째 액션 반환)
  getDefensiveStance: () => {
    const { battle } = get();
    if (battle.defensiveActions.length === 0) {
      return { stance: "none", value: 0 };
    }
    const first = battle.defensiveActions[0];
    return { stance: first.type, value: first.value };
  },

  // 플레이어 상태이상 적용
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

  // 몬스터 상태이상 적용
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

  // DoT/HoT 처리
  processStatusEffects: () => {
    const { battle } = get();
    if (!battle.isInBattle) return;

    // 플레이어 DoT
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

    // 플레이어 HoT
    const playerHot = calculateRegenHeal(battle.playerBuffs);
    if (playerHot > 0) {
      const newHp = Math.min(battle.playerMaxHp, battle.playerCurrentHp + playerHot);
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

    // 몬스터 DoT
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

  // 상태이상 틱
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
    return battle.phase === "planning";
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

  getPlayerApPercent: () => {
    const { battle } = get();
    if (battle.playerMaxAp === 0) return 0;
    return (battle.playerCurrentAp / battle.playerMaxAp) * 100;
  },

  canUseSkill: (mpCost) => {
    const { battle } = get();
    return battle.playerMp >= mpCost;
  },

  canAffordAp: (apCost) => {
    const { battle } = get();
    const queuedAp = battle.playerQueue.reduce((sum, a) => sum + a.apCost, 0);
    return queuedAp + apCost <= battle.playerMaxAp;
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

  getRemainingPlayerAp: () => {
    const { battle } = get();
    const queuedAp = battle.playerQueue.reduce((sum, a) => sum + a.apCost, 0);
    return battle.playerMaxAp - queuedAp;
  },

  getQueuedApCost: () => {
    const { battle } = get();
    return battle.playerQueue.reduce((sum, a) => sum + a.apCost, 0);
  },
}));
