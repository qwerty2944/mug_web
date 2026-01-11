"use client";

import { useState, useMemo } from "react";
import { useThemeStore } from "@/shared/config";
import { useBattleStore, useEquipmentStore } from "@/application/stores";
import type { Ability, ProficiencyType, CombatProficiencyType, WeaponType, Proficiencies, MagicElement as AbilityMagicElement } from "@/entities/ability";
import { getProficiencyInfo, getProficiencyValue, useAbilities } from "@/entities/ability";
import type { BattleActionTab, CombatSubTab } from "./ActionTabs";
import { CombatSubTabs, COMBAT_SUB_TABS, COMBAT_SUB_TAB_ORDER } from "./ActionTabs";
import { MagicSubTabs, MAGIC_ELEMENTS, type MagicElement } from "./MagicSubTabs";

// 방어 행동 타입
export type DefenseAction = "guard" | "dodge" | "counter";

interface ActionPanelProps {
  activeTab: BattleActionTab;
  proficiencies: Proficiencies | undefined;
  onWeaponAttack: (weaponType: CombatProficiencyType) => void;
  onDefenseAction: (action: DefenseAction) => void;
  onCastSkill: (ability: Ability) => void;
  onFlee: () => void;
  disabled?: boolean;
}

export function ActionPanel({
  activeTab,
  proficiencies,
  onWeaponAttack,
  onDefenseAction,
  onCastSkill,
  onFlee,
  disabled = false,
}: ActionPanelProps) {
  const { theme } = useThemeStore();
  const { canUseSkill, isPlayerSilenced } = useBattleStore();
  const { mainHand, learnedSkills } = useEquipmentStore();

  // 전투 스킬 서브탭 상태
  const [activeCombatSubTab, setActiveCombatSubTab] = useState<CombatSubTab>("all");

  // 마법 속성 서브탭 상태
  const [activeMagicElement, setActiveMagicElement] = useState<MagicElement>("all");

  // 어빌리티 데이터 로드
  const { data: allAbilities = [] } = useAbilities();

  // 배운 어빌리티만 필터링
  const learnedAbilityData = useMemo(() =>
    allAbilities.filter((ability) => learnedSkills.includes(ability.id)),
    [allAbilities, learnedSkills]
  );

  // 전투 스킬 (combatskill source)
  const combatSkills = useMemo(() =>
    learnedAbilityData.filter((skill) => skill.source === "combatskill"),
    [learnedAbilityData]
  );

  // 전투 스킬 카테고리별 필터링
  const filteredCombatSkills = useMemo(() => {
    if (activeCombatSubTab === "all") {
      return combatSkills.filter((skill) => skill.type !== "passive");
    }
    return combatSkills.filter(
      (skill) => skill.category === activeCombatSubTab && skill.type !== "passive"
    );
  }, [combatSkills, activeCombatSubTab]);

  // 배운 전투 스킬이 있는 카테고리 목록
  const availableCombatCategories = useMemo(() => [
    ...new Set(
      combatSkills
        .filter((skill) => skill.type !== "passive")
        .map((skill) => skill.category)
        .filter((c): c is string => !!c)
    ),
  ], [combatSkills]);

  // 마법 스킬 (마법 공격 + 힐)
  const magicSkills = useMemo(() =>
    learnedAbilityData.filter(
      (skill) => (skill.type === "attack" && skill.attackType === "magic") || skill.type === "heal"
    ),
    [learnedAbilityData]
  );

  // 현재 선택된 속성의 마법만 필터링
  const filteredMagicSkills = useMemo(() => {
    if (activeMagicElement === "all") {
      return magicSkills;
    }
    return magicSkills.filter((skill) => {
      const skillElement = skill.element || (skill.type === "heal" ? "holy" : null);
      return skillElement === activeMagicElement;
    });
  }, [magicSkills, activeMagicElement]);

  // 배운 마법이 있는 속성 목록
  const availableElements = useMemo(() => [
    ...new Set(
      magicSkills
        .map((skill) => skill.element || (skill.type === "heal" ? ("holy" as AbilityMagicElement) : null))
        .filter((e): e is AbilityMagicElement => e !== null)
    ),
  ], [magicSkills]);

  const isSilenced = isPlayerSilenced();

  // 장착 무기 정보
  const rawWeaponType = mainHand?.itemType;
  const equippedWeaponType = (rawWeaponType && typeof rawWeaponType === "string")
    ? rawWeaponType as WeaponType
    : null;
  const weaponInfo = equippedWeaponType
    ? getProficiencyInfo(equippedWeaponType)
    : null;

  return (
    <div className="flex flex-col" style={{ height: "280px" }}>
      {/* 전투 탭 */}
      {activeTab === "combat" && (
        <div className="flex flex-col h-full">
          {/* 서브탭 */}
          <div className="flex-shrink-0 px-3 pt-2">
            <CombatSubTabs
              activeSubTab={activeCombatSubTab}
              onSubTabChange={setActiveCombatSubTab}
              availableCategories={availableCombatCategories}
              disabled={disabled}
            />
          </div>

          {/* 스킬 그리드 - 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {/* 기본 공격 (항상 표시) */}
            <div className="mb-3">
              <div
                className="text-xs font-mono mb-1"
                style={{ color: theme.colors.textMuted }}
              >
                기본 공격
              </div>
              {mainHand && equippedWeaponType ? (
                <button
                  onClick={() => onWeaponAttack(equippedWeaponType)}
                  disabled={disabled}
                  className="w-full flex items-center gap-3 py-2 px-3 transition-colors font-mono"
                  style={{
                    background: theme.colors.bgLight,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="text-2xl">{mainHand.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{mainHand.itemName}</div>
                    <div
                      className="text-xs"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {weaponInfo?.nameKo ?? "무기"} · Lv.{getProficiencyValue(proficiencies, equippedWeaponType)}
                    </div>
                  </div>
                  <div
                    className="text-xs px-2 py-1"
                    style={{
                      background: theme.colors.primary + "20",
                      color: theme.colors.primary,
                    }}
                  >
                    공격
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onWeaponAttack("fist")}
                  disabled={disabled}
                  className="w-full flex items-center gap-3 py-2 px-3 transition-colors font-mono"
                  style={{
                    background: theme.colors.bgLight,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="text-2xl">👊</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">맨손</div>
                    <div
                      className="text-xs"
                      style={{ color: theme.colors.textMuted }}
                    >
                      무기 없음
                    </div>
                  </div>
                  <div
                    className="text-xs px-2 py-1"
                    style={{
                      background: theme.colors.textMuted + "20",
                      color: theme.colors.textMuted,
                    }}
                  >
                    공격
                  </div>
                </button>
              )}
            </div>

            {/* 전투 스킬 목록 */}
            {filteredCombatSkills.length > 0 && (
              <div className="mb-3">
                <div
                  className="text-xs font-mono mb-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  {activeCombatSubTab === "all"
                    ? "전체 스킬"
                    : COMBAT_SUB_TABS[activeCombatSubTab].nameKo}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {filteredCombatSkills.map((skill) => {
                    const canCast = canUseSkill(skill.baseCost?.mp ?? 0);
                    const hasEnoughAp = true; // TODO: AP 체크 추가
                    const canUse = canCast && hasEnoughAp;
                    return (
                      <SkillButton
                        key={skill.id}
                        skill={skill}
                        canCast={canUse}
                        disabled={disabled || !canUse}
                        onClick={() => onCastSkill(skill)}
                        compact
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 방어 행동 (defense 서브탭일 때만) */}
            {(activeCombatSubTab === "all" || activeCombatSubTab === "defense") && (
              <div className="mb-3">
                <div
                  className="text-xs font-mono mb-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  방어 행동
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <DefenseButton
                    icon="🛡️"
                    name="방어"
                    description="피해 50% 감소"
                    onClick={() => onDefenseAction("guard")}
                    disabled={disabled}
                    colorKey="primary"
                  />
                  <DefenseButton
                    icon="💨"
                    name="회피"
                    description="회피 +40%"
                    onClick={() => onDefenseAction("dodge")}
                    disabled={disabled}
                    colorKey="success"
                  />
                  <DefenseButton
                    icon="⚡"
                    name="반격"
                    description="막기시 반격"
                    onClick={() => onDefenseAction("counter")}
                    disabled={disabled}
                    colorKey="warning"
                  />
                </div>
              </div>
            )}

            {/* 배운 스킬 없음 안내 */}
            {filteredCombatSkills.length === 0 && activeCombatSubTab !== "all" && activeCombatSubTab !== "defense" && (
              <div
                className="text-center py-4 font-mono text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                {COMBAT_SUB_TABS[activeCombatSubTab].nameKo} 스킬이 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 마법 탭 */}
      {activeTab === "magic" && (
        <div className="flex flex-col h-full">
          {/* 속성 서브탭 */}
          {magicSkills.length > 0 && (
            <div className="flex-shrink-0 px-3 pt-2">
              <MagicSubTabs
                activeElement={activeMagicElement}
                onElementChange={setActiveMagicElement}
                availableElements={availableElements}
                disabled={disabled || isSilenced}
              />
            </div>
          )}

          {/* 마법 스킬 목록 - 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {/* 침묵 상태 표시 */}
            {isSilenced && (
              <div
                className="text-center py-2 font-mono text-sm"
                style={{ color: theme.colors.error }}
              >
                🤐 침묵 상태 - 마법 사용 불가
              </div>
            )}

            {/* 마법 스킬 그리드 */}
            {filteredMagicSkills.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5">
                {filteredMagicSkills.map((skill) => {
                  const canCast = canUseSkill(skill.baseCost?.mp ?? 0) && !isSilenced;
                  const proficiencyType = skill.element ?? "fire";
                  return (
                    <SkillButton
                      key={skill.id}
                      skill={skill}
                      proficiency={
                        getProficiencyValue(proficiencies, proficiencyType as ProficiencyType)
                      }
                      canCast={canCast}
                      disabled={disabled || !canCast}
                      onClick={() => onCastSkill(skill)}
                      compact
                    />
                  );
                })}
              </div>
            ) : magicSkills.length > 0 ? (
              <div
                className="text-center py-4 font-mono text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                {MAGIC_ELEMENTS[activeMagicElement].nameKo} 마법이 없습니다
              </div>
            ) : (
              <div
                className="text-center py-4 font-mono text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                배운 마법이 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 아이템 탭 */}
      {activeTab === "item" && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div
              className="text-center py-4 font-mono text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              🎒 아이템 기능 준비 중...
            </div>
          </div>
        </div>
      )}

      {/* 도주 버튼 (하단 고정) */}
      <div className="flex-shrink-0 px-3 pb-2">
        <button
          onClick={onFlee}
          disabled={disabled}
          className="w-full py-2 font-mono text-sm transition-colors"
          style={{
            background: theme.colors.bgDark,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textMuted,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          🏃 도주 (50%)
        </button>
      </div>
    </div>
  );
}

// 스킬 버튼 컴포넌트
interface SkillButtonProps {
  skill: Ability;
  proficiency?: number;
  canCast: boolean;
  disabled: boolean;
  onClick: () => void;
  compact?: boolean;
}

function SkillButton({
  skill,
  proficiency,
  canCast,
  disabled,
  onClick,
  compact = false,
}: SkillButtonProps) {
  const { theme } = useThemeStore();

  if (compact) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center gap-0.5 py-1.5 px-1 transition-colors font-mono"
        style={{
          background: canCast ? theme.colors.bgLight : theme.colors.bgDark,
          border: `1px solid ${canCast ? theme.colors.border : theme.colors.borderDim}`,
          color: canCast ? theme.colors.text : theme.colors.textMuted,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          borderRadius: "4px",
        }}
        title={skill.description.ko}
      >
        <span className="text-base">{skill.icon}</span>
        <span className="text-[10px] truncate w-full text-center leading-tight">{skill.nameKo}</span>
        {skill.baseCost?.mp ? (
          <span
            className="text-[9px]"
            style={{
              color: canCast ? theme.colors.primary : theme.colors.error,
            }}
          >
            {skill.baseCost.mp}MP
          </span>
        ) : skill.baseCost?.ap ? (
          <span
            className="text-[9px]"
            style={{
              color: canCast ? theme.colors.warning : theme.colors.error,
            }}
          >
            {skill.baseCost.ap}AP
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-0.5 py-2 px-1 transition-colors font-mono text-sm"
      style={{
        background: canCast ? theme.colors.bgLight : theme.colors.bgDark,
        border: `1px solid ${canCast ? theme.colors.border : theme.colors.borderDim}`,
        color: canCast ? theme.colors.text : theme.colors.textMuted,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      title={skill.description.ko}
    >
      <span className="text-lg">{skill.icon}</span>
      <span className="text-xs truncate w-full text-center">{skill.nameKo}</span>
      <span
        className="text-[10px]"
        style={{
          color: canCast ? theme.colors.primary : theme.colors.error,
        }}
      >
        MP {skill.baseCost?.mp ?? 0}
      </span>
      {proficiency !== undefined && proficiency > 0 && (
        <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
          Lv.{proficiency}
        </span>
      )}
    </button>
  );
}

// 방어 버튼 컴포넌트
interface DefenseButtonProps {
  icon: string;
  name: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  colorKey: "primary" | "success" | "warning";
}

function DefenseButton({
  icon,
  name,
  description,
  onClick,
  disabled,
  colorKey,
}: DefenseButtonProps) {
  const { theme } = useThemeStore();
  const color = theme.colors[colorKey];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-0.5 py-2 px-1 transition-colors font-mono"
      style={{
        background: theme.colors.bgLight,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "4px",
      }}
      title={description}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs">{name}</span>
      <span
        className="text-[9px]"
        style={{ color }}
      >
        {description}
      </span>
    </button>
  );
}
