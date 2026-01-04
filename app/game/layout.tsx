"use client";

import { ReactNode } from "react";
import { UnityPortalProvider } from "@/features/character";

interface GameLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function GameLayout({ children, modal }: GameLayoutProps) {
  return (
    <UnityPortalProvider>
      {children}
      {modal}
    </UnityPortalProvider>
  );
}
