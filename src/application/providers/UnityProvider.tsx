"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useUnityContext } from "react-unity-webgl";
import { useAppearanceStore, type SpriteNames } from "@/application/stores";

const UNITY_OBJECT_NAME = "SPUM_20260103203421028";

// 기본값 상수
const DEFAULT_BODY_INDEX = 11; // 12번째 종족 (human_1), 0-indexed
const DEFAULT_BROWN_COLOR = "6B4226"; // 갈색 (눈, 머리, 수염)

interface UnityContextValue {
  unityProvider: ReturnType<typeof useUnityContext>["unityProvider"];
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityCtx = createContext<UnityContextValue | null>(null);

export function UnityProvider({ children }: { children: ReactNode }) {
  const {
    setUnityLoaded,
    setSendMessage,
    setSpriteCounts,
    setSpriteNames,
    setCharacterState,
    setAnimationState,
    setAnimationCounts,
  } = useAppearanceStore();

  // 초기화 완료 추적
  const isInitialized = useRef(false);

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/characterbuilder.loader.js",
    dataUrl: "/unity/characterbuilder.data",
    frameworkUrl: "/unity/characterbuilder.framework.js",
    codeUrl: "/unity/characterbuilder.wasm",
    webglContextAttributes: {
      alpha: true,
      premultipliedAlpha: false,
    },
  });

  // Unity 로드 상태 동기화
  useEffect(() => {
    if (isLoaded) {
      setUnityLoaded(true);
      setSendMessage(sendMessage, UNITY_OBJECT_NAME);
    }
  }, [isLoaded, sendMessage, setUnityLoaded, setSendMessage]);

  // Unity 이벤트 리스너
  useEffect(() => {
    const handleCharacterChanged = (e: CustomEvent) => {
      const state = e.detail;

      // 첫 번째 캐릭터 상태 수신 시 기본값 강제 적용
      if (!isInitialized.current) {
        isInitialized.current = true;

        // bodyIndex를 12번(인덱스 11)으로 강제 변경
        const modifiedState = {
          ...state,
          bodyIndex: DEFAULT_BODY_INDEX,
        };
        setCharacterState(modifiedState);

        // Unity에도 기본값 설정
        sendMessage(UNITY_OBJECT_NAME, "JS_SetBody", DEFAULT_BODY_INDEX.toString());
        sendMessage(UNITY_OBJECT_NAME, "JS_SetLeftEyeColor", DEFAULT_BROWN_COLOR);
        sendMessage(UNITY_OBJECT_NAME, "JS_SetRightEyeColor", DEFAULT_BROWN_COLOR);
        sendMessage(UNITY_OBJECT_NAME, "JS_SetHairColor", DEFAULT_BROWN_COLOR);
        sendMessage(UNITY_OBJECT_NAME, "JS_SetFacehairColor", DEFAULT_BROWN_COLOR);
      } else {
        setCharacterState(state);
      }
    };

    const handleSpritesLoaded = async (e: CustomEvent) => {
      const unityData = e.detail;
      // counts 설정
      setSpriteCounts(unityData);

      // Unity에서 일부 이름만 보내므로 all-sprites.json에서 나머지 로드
      try {
        const res = await fetch("/data/character/all-sprites.json");
        const jsonData = await res.json();

        // Unity 데이터 우선, 없으면 JSON 폴백
        const names: SpriteNames = {
          bodyNames: unityData.bodyNames?.length ? unityData.bodyNames : (jsonData.bodyNames || []),
          eyeNames: unityData.eyeNames?.length ? unityData.eyeNames : (jsonData.eyeNames || []),
          hairNames: unityData.hairNames?.length ? unityData.hairNames : (jsonData.hairNames || []),
          facehairNames: unityData.facehairNames?.length ? unityData.facehairNames : (jsonData.facehairNames || []),
          clothNames: unityData.clothNames?.length ? unityData.clothNames : (jsonData.clothNames || []),
          armorNames: unityData.armorNames?.length ? unityData.armorNames : (jsonData.armorNames || []),
          // Unity에서 안 보내는 것들은 JSON에서
          pantNames: jsonData.pantNames || [],
          helmetNames: jsonData.helmetNames || [],
          backNames: jsonData.backNames || [],
          swordNames: jsonData.swordNames || [],
          shieldNames: jsonData.shieldNames || [],
          axeNames: jsonData.axeNames || [],
          bowNames: jsonData.bowNames || [],
          wandNames: jsonData.wandNames || [],
        };
        setSpriteNames(names);
      } catch (err) {
        console.error("Failed to load sprite names:", err);
      }
    };
    const handleAnimationsLoaded = (e: CustomEvent) => setAnimationCounts(e.detail);
    const handleAnimationChanged = (e: CustomEvent) => setAnimationState(e.detail);

    window.addEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
    window.addEventListener("unitySpritesLoaded", handleSpritesLoaded as unknown as EventListener);
    window.addEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
    window.addEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);

    return () => {
      window.removeEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
      window.removeEventListener("unitySpritesLoaded", handleSpritesLoaded as unknown as EventListener);
      window.removeEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
      window.removeEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);
    };
  }, [setCharacterState, setSpriteCounts, setAnimationCounts, setAnimationState, setSpriteNames, sendMessage]);

  return (
    <UnityCtx.Provider value={{ unityProvider, isLoaded, loadingProgression }}>
      {children}
    </UnityCtx.Provider>
  );
}

export function useUnityBridge(): UnityContextValue {
  const context = useContext(UnityCtx);

  // Context 없이 사용하는 경우 (fallback)
  if (!context) {
    console.warn("useUnityBridge called outside UnityProvider");
    return {
      unityProvider: null as unknown as UnityContextValue["unityProvider"],
      isLoaded: false,
      loadingProgression: 0,
    };
  }

  return context;
}
