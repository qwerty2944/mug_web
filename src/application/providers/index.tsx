"use client";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { UnityProvider } from "./UnityProvider";
import { ToasterConfig } from "./ToasterConfig";

// Re-export for external use
export { useUnityBridge } from "./UnityProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <UnityProvider>
            {children}
            <ToasterConfig />
          </UnityProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
