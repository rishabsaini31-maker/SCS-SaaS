"use client";

import type { ReactNode } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { AuthGate } from "@/components/AuthGate";

export default function MobileRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <MobileLayout>{children}</MobileLayout>
    </AuthGate>
  );
}