"use client";

import { useModalStore } from "@/application/stores";

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
