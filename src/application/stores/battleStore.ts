import { create } from "zustand";
import type { Monster } from "@/entities/monster";

// 전투 로그 엔트리
export interface BattleLogEntry {
  turn: number;
  actor: "player" | "monster";
  action: string;
  damage?: number;
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
  turn: number;
  battleLog: BattleLogEntry[];
  result: BattleResult;
  usedWeaponType: string | null; // 사용한 무기/마법 타입 (숙련도 연동용)
}

// 초기 상태
const initialBattleState: BattleState = {
  isInBattle: false,
  monster: null,
  monsterCurrentHp: 0,
  playerCurrentHp: 0,
  playerMaxHp: 100,
  turn: 0,
  battleLog: [],
  result: "ongoing",
  usedWeaponType: null,
};

interface BattleStore {
  // State
  battle: BattleState;

  // Actions
  startBattle: (monster: Monster, playerHp: number, playerMaxHp: number) => void;
  playerAttack: (damage: number, message: string, weaponType?: string) => void;
  monsterAttack: (damage: number, message: string) => void;
  playerFlee: () => boolean;
  endBattle: (result: BattleResult) => void;
  addLog: (entry: Omit<BattleLogEntry, "timestamp">) => void;
  resetBattle: () => void;

  // Getters
  isPlayerTurn: () => boolean;
  getMonsterHpPercent: () => number;
  getPlayerHpPercent: () => number;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: initialBattleState,

  // 전투 시작
  startBattle: (monster, playerHp, playerMaxHp) => {
    set({
      battle: {
        isInBattle: true,
        monster,
        monsterCurrentHp: monster.stats.hp,
        playerCurrentHp: playerHp,
        playerMaxHp,
        turn: 1,
        battleLog: [
          {
            turn: 0,
            actor: "player",
            action: "start",
            message: `${monster.icon} ${monster.nameKo}(와)과의 전투 시작!`,
            timestamp: Date.now(),
          },
        ],
        result: "ongoing",
        usedWeaponType: null,
      },
    });
  },

  // 플레이어 공격
  playerAttack: (damage, message, weaponType) => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return;

    const newMonsterHp = Math.max(0, battle.monsterCurrentHp - damage);
    const newLog: BattleLogEntry = {
      turn: battle.turn,
      actor: "player",
      action: "attack",
      damage,
      message,
      timestamp: Date.now(),
    };

    // 몬스터 처치 확인
    if (newMonsterHp <= 0) {
      set({
        battle: {
          ...battle,
          monsterCurrentHp: 0,
          battleLog: [
            ...battle.battleLog,
            newLog,
            {
              turn: battle.turn,
              actor: "player",
              action: "victory",
              message: `${battle.monster?.nameKo}을(를) 처치했다!`,
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

    const newPlayerHp = Math.max(0, battle.playerCurrentHp - damage);
    const newLog: BattleLogEntry = {
      turn: battle.turn,
      actor: "monster",
      action: "attack",
      damage,
      message,
      timestamp: Date.now(),
    };

    // 플레이어 패배 확인
    if (newPlayerHp <= 0) {
      set({
        battle: {
          ...battle,
          playerCurrentHp: 0,
          turn: battle.turn + 1,
          battleLog: [
            ...battle.battleLog,
            newLog,
            {
              turn: battle.turn,
              actor: "monster",
              action: "defeat",
              message: "당신은 쓰러졌다...",
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
          turn: battle.turn + 1,
          battleLog: [...battle.battleLog, newLog],
        },
      });
    }
  },

  // 도주 시도
  playerFlee: () => {
    const { battle } = get();
    if (!battle.isInBattle || battle.result !== "ongoing") return false;

    // 도주 확률: 50% + (플레이어 속도 - 몬스터 속도) * 5%
    // 간단히 50% 확률로 구현
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
              message: "도주에 성공했다!",
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
              message: "도주에 실패했다!",
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

  // 플레이어 턴인지 확인 (간단히 홀수 턴 = 플레이어)
  isPlayerTurn: () => {
    const { battle } = get();
    return battle.turn % 2 === 1;
  },

  // 몬스터 HP 퍼센트
  getMonsterHpPercent: () => {
    const { battle } = get();
    if (!battle.monster) return 0;
    return (battle.monsterCurrentHp / battle.monster.stats.hp) * 100;
  },

  // 플레이어 HP 퍼센트
  getPlayerHpPercent: () => {
    const { battle } = get();
    if (battle.playerMaxHp === 0) return 0;
    return (battle.playerCurrentHp / battle.playerMaxHp) * 100;
  },
}));
