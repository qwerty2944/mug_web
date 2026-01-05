"use client";

import { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function GameLayout({ children, modal }: GameLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
