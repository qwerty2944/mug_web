"use client";

import { ReactNode } from "react";
import { UnityProvider } from "@/application/providers";

interface TestLayoutProps {
  children: ReactNode;
}

export default function TestLayout({ children }: TestLayoutProps) {
  return <UnityProvider>{children}</UnityProvider>;
}
