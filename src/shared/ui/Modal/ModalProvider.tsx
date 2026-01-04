"use client";

import { useModalStore } from "@/shared/stores";

export function ModalProvider() {
  const { modals } = useModalStore();

  return (
    <>
      {modals.map((modal) => (
        <div key={modal.id}>{modal.component}</div>
      ))}
    </>
  );
}
