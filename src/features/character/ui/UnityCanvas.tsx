"use client";

import { Unity } from "react-unity-webgl";
import { useUnityBridge } from "../model";

export function UnityCanvas() {
  const { unityProvider, isLoaded, loadingProgression } = useUnityBridge();

  return (
    <div className="relative w-full h-full">
      {/* 로딩 오버레이 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <p className="mb-2">로딩 중... {Math.round(loadingProgression * 100)}%</p>
            <div className="w-48 h-2 bg-gray-700 rounded">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unity 캔버스 */}
      <div
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <Unity
          unityProvider={unityProvider}
          devicePixelRatio={typeof window !== "undefined" ? window.devicePixelRatio : 1}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>
    </div>
  );
}
