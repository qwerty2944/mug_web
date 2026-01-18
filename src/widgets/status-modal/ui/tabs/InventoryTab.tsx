"use client";

import { InventoryGrid } from "@/entities/inventory";
import type { InventoryTabProps } from "./types";

export function InventoryTab({ theme, inventoryItems, allItems, inventoryMaxSlots }: InventoryTabProps) {
  return (
    <InventoryGrid
      items={inventoryItems}
      allItems={allItems}
      maxSlots={inventoryMaxSlots}
      onUseItem={(slot, item) => {
        // TODO: 아이템 사용 기능 구현
        console.log("Use item:", slot, item);
      }}
      onDropItem={(slot) => {
        // TODO: 아이템 버리기 기능 구현
        console.log("Drop item:", slot);
      }}
    />
  );
}
