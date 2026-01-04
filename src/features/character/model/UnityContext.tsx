"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useUnityContext } from "react-unity-webgl";
import { useAppearanceStore } from "./appearanceStore";

const UNITY_OBJECT_NAME = "SPUM_20260103203421028";

interface UnityContextValue {
  unityProvider: ReturnType<typeof useUnityContext>["unityProvider"];
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityCtx = createContext<UnityContextValue | null>(null);

export function UnityContextProvider({ children }: { children: ReactNode }) {
  const {
    setUnityLoaded,
    setSendMessage,
    setSpriteCounts,
    setCharacterState,
    setAnimationState,
    setAnimationCounts,
  } = useAppearanceStore();

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/characterbuilder.loader.js",
    dataUrl: "/unity/characterbuilder.data.br",
    frameworkUrl: "/unity/characterbuilder.framework.js.br",
    codeUrl: "/unity/characterbuilder.wasm.br",
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
    const handleCharacterChanged = (e: CustomEvent) => setCharacterState(e.detail);
    const handleSpritesLoaded = (e: CustomEvent) => setSpriteCounts(e.detail);
    const handleAnimationsLoaded = (e: CustomEvent) => setAnimationCounts(e.detail);
    const handleAnimationChanged = (e: CustomEvent) => setAnimationState(e.detail);

    window.addEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
    window.addEventListener("unitySpritesLoaded", handleSpritesLoaded as EventListener);
    window.addEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
    window.addEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);

    return () => {
      window.removeEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
      window.removeEventListener("unitySpritesLoaded", handleSpritesLoaded as EventListener);
      window.removeEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
      window.removeEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);
    };
  }, [setCharacterState, setSpriteCounts, setAnimationCounts, setAnimationState]);

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
    console.warn("useUnityBridge called outside UnityContextProvider");
    return {
      unityProvider: null as unknown as UnityContextValue["unityProvider"],
      isLoaded: false,
      loadingProgression: 0,
    };
  }

  return context;
}
