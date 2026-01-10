"use client";

import { createContext, useEffect, useRef, ReactNode, useState, useCallback, useMemo } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useAppearanceStore, type SpriteNames } from "@/application/stores";

const UNITY_OBJECT_NAME = "SPUM_20260103203421028";

// 기본값 상수
const DEFAULT_BODY_INDEX = 11; // 12번째 종족 (human_1), 0-indexed
const DEFAULT_BROWN_COLOR = "6B4226"; // 갈색 (눈, 머리, 수염)

// Unity 설정을 컴포넌트 외부에서 상수로 정의 (React 19 호환성)
// 매 렌더링마다 새 객체가 생성되는 것을 방지하여 hooks 일관성 유지
const UNITY_CONFIG = {
  loaderUrl: "/unity/characterbuilder.loader.js",
  dataUrl: "/unity/characterbuilder.data",
  frameworkUrl: "/unity/characterbuilder.framework.js",
  codeUrl: "/unity/characterbuilder.wasm",
} as const;

const WEBGL_CONTEXT_ATTRIBUTES = {
  alpha: true,
  premultipliedAlpha: false,
} as const;

// Unity 컴포넌트 스타일 (참조 안정성)
const UNITY_STYLE = { width: "100%", height: "100%", background: "transparent" } as const;

export interface UnityContextValue {
  unityProvider: ReturnType<typeof useUnityContext>["unityProvider"] | null;
  isLoaded: boolean;
  loadingProgression: number;
  // Unity viewport 등록/해제
  registerViewport: (id: string, element: HTMLElement) => void;
  unregisterViewport: (id: string) => void;
  activeViewportId: string | null;
}

export const UnityCtx = createContext<UnityContextValue | null>(null);

export function UnityProviderInner({ children }: { children: ReactNode }) {
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

  // Unity viewport 관리 - 가장 최근에 등록된 viewport에 Unity 렌더링
  const [viewports, setViewports] = useState<Map<string, HTMLElement>>(new Map());
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);

  const registerViewport = useCallback((id: string, element: HTMLElement) => {
    setViewports((prev) => {
      const next = new Map(prev);
      next.set(id, element);
      return next;
    });
    setActiveViewportId(id);
  }, []);

  const unregisterViewport = useCallback((id: string) => {
    setViewports((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    setActiveViewportId((current) => {
      if (current === id) {
        // 다른 viewport가 있으면 그걸로 전환
        const remaining = Array.from(viewports.keys()).filter((k) => k !== id);
        return remaining.length > 0 ? remaining[remaining.length - 1] : null;
      }
      return current;
    });
  }, [viewports]);

  // useUnityContext 설정을 useMemo로 감싸서 참조 안정성 보장 (React 19 호환성)
  const unityConfig = useMemo(() => ({
    ...UNITY_CONFIG,
    webglContextAttributes: WEBGL_CONTEXT_ATTRIBUTES,
  }), []);

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext(unityConfig);

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
        const res = await fetch("/data/sprites/all-sprites.json");
        const jsonData = await res.json();

        // Unity 데이터 우선, 없으면 JSON 폴백
        const names: SpriteNames = {
          bodyNames: unityData.bodyNames?.length ? unityData.bodyNames : (jsonData.bodyNames || []),
          eyeNames: unityData.eyeNames?.length ? unityData.eyeNames : (jsonData.eyeNames || []),
          hairNames: unityData.hairNames?.length ? unityData.hairNames : (jsonData.hairNames || []),
          facehairNames: unityData.facehairNames?.length ? unityData.facehairNames : (jsonData.facehairNames || []),
          clothNames: unityData.clothNames?.length ? unityData.clothNames : (jsonData.clothNames || []),
          armorNames: unityData.armorNames?.length ? unityData.armorNames : (jsonData.armorNames || []),
          pantNames: unityData.pantNames?.length ? unityData.pantNames : (jsonData.pantNames || []),
          helmetNames: unityData.helmetNames?.length ? unityData.helmetNames : (jsonData.helmetNames || []),
          backNames: unityData.backNames?.length ? unityData.backNames : (jsonData.backNames || []),
          swordNames: unityData.swordNames?.length ? unityData.swordNames : (jsonData.swordNames || []),
          shieldNames: unityData.shieldNames?.length ? unityData.shieldNames : (jsonData.shieldNames || []),
          axeNames: unityData.axeNames?.length ? unityData.axeNames : (jsonData.axeNames || []),
          bowNames: unityData.bowNames?.length ? unityData.bowNames : (jsonData.bowNames || []),
          spearNames: unityData.spearNames?.length ? unityData.spearNames : (jsonData.spearNames || []),
          wandNames: unityData.wandNames?.length ? unityData.wandNames : (jsonData.wandNames || []),
          daggerNames: unityData.daggerNames?.length ? unityData.daggerNames : (jsonData.daggerNames || []),
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

  // 현재 활성 viewport 엘리먼트
  const activeViewport = activeViewportId ? viewports.get(activeViewportId) : null;

  // Unity 컨테이너 ref
  const unityContainerRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  // devicePixelRatio를 useState로 관리 (참조 안정성 + SSR 안전)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);

  // viewport 변경 시 Unity 컨테이너를 DOM 조작으로 이동
  useEffect(() => {
    const unityContainer = unityContainerRef.current;
    if (!unityContainer) return;

    if (activeViewport) {
      // viewport로 이동
      activeViewport.appendChild(unityContainer);
      unityContainer.style.position = "relative";
      unityContainer.style.width = "100%";
      unityContainer.style.height = "100%";
      unityContainer.style.opacity = "1";
    } else if (hiddenContainerRef.current) {
      // 숨김 컨테이너로 이동
      hiddenContainerRef.current.appendChild(unityContainer);
      unityContainer.style.position = "absolute";
      unityContainer.style.width = "1px";
      unityContainer.style.height = "1px";
      unityContainer.style.opacity = "0";
    }
  }, [activeViewport]);

  return (
    <UnityCtx.Provider
      value={{
        unityProvider,
        isLoaded,
        loadingProgression,
        registerViewport,
        unregisterViewport,
        activeViewportId,
      }}
    >
      {children}

      {/* 숨김 컨테이너 (viewport 없을 때 Unity가 여기에 있음) */}
      <div
        ref={hiddenContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -9999,
        }}
      >
        {/* Unity 컨테이너 (DOM 조작으로 이동됨) */}
        {unityProvider && (
          <div ref={unityContainerRef} style={{ width: "100%", height: "100%" }}>
            <Unity
              unityProvider={unityProvider}
              devicePixelRatio={devicePixelRatio}
              style={UNITY_STYLE}
            />
          </div>
        )}
      </div>
    </UnityCtx.Provider>
  );
}
