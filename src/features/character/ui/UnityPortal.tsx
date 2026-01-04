"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Unity } from "react-unity-webgl";
import { useUnityBridge } from "../model";

// Portal 타겟 컨텍스트
interface UnityPortalContextValue {
  setPortalTarget: (el: HTMLElement | null) => void;
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityPortalContext = createContext<UnityPortalContextValue | null>(null);

/**
 * Unity 캔버스를 관리하는 Provider
 * Layout에 배치하면 Unity가 로드되고, 자식 페이지에서 UnityPortalTarget으로 표시 위치 지정
 */
export function UnityPortalProvider({ children }: { children: ReactNode }) {
  const { unityProvider, isLoaded, loadingProgression } = useUnityBridge();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // setPortalTarget을 useCallback으로 메모이제이션
  const setPortalTargetStable = useCallback((el: HTMLElement | null) => {
    setPortalTarget(el);
  }, []);

  // context value를 useMemo로 메모이제이션 (무한 렌더링 방지)
  const contextValue = useMemo<UnityPortalContextValue>(() => ({
    setPortalTarget: setPortalTargetStable,
    isLoaded,
    loadingProgression,
  }), [setPortalTargetStable, isLoaded, loadingProgression]);

  // Unity 캔버스 - 항상 적절한 크기로 렌더링 (WebGL 초기화에 필요)
  const unityCanvas = (
    <Unity
      unityProvider={unityProvider}
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    />
  );

  return (
    <UnityPortalContext.Provider value={contextValue}>
      {children}
      {/* Portal 타겟이 있으면 거기로, 없으면 화면 밖에 숨김 (WebGL 초기화를 위해 적절한 크기 유지) */}
      {portalTarget ? (
        createPortal(
          <div className="w-full h-full">{unityCanvas}</div>,
          portalTarget
        )
      ) : (
        <div
          className="fixed pointer-events-none opacity-0"
          style={{
            left: 0,
            top: 0,
            width: "400px",
            height: "400px",
            zIndex: -9999
          }}
          aria-hidden="true"
        >
          {unityCanvas}
        </div>
      )}
    </UnityPortalContext.Provider>
  );
}

/**
 * Unity 캔버스가 렌더링될 위치를 지정하는 컴포넌트
 * Unity가 로드될 때까지 로딩 인디케이터 표시
 */
export function UnityPortalTarget({ className }: { className?: string }) {
  const context = useContext(UnityPortalContext);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // setPortalTarget만 의존성으로 사용 (메모이제이션되어 안정적)
  const setPortalTarget = context?.setPortalTarget;

  useEffect(() => {
    if (setPortalTarget && containerRef) {
      setPortalTarget(containerRef);
      return () => setPortalTarget(null);
    }
  }, [setPortalTarget, containerRef]);

  const isLoaded = context?.isLoaded ?? false;
  const loadingProgression = context?.loadingProgression ?? 0;

  return (
    <div ref={setContainerRef} className={`relative ${className || ""}`}>
      {/* 로딩 오버레이 - Unity 캔버스 위에 표시 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <p className="mb-2">캐릭터 로딩 중... {Math.round(loadingProgression * 100)}%</p>
            <div className="w-32 h-2 bg-gray-700 rounded mx-auto">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
