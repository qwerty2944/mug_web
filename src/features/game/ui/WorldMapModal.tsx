"use client";

import { Modal } from "@/shared/ui";
import { useThemeStore } from "@/shared/config";
import { WorldMap } from "./WorldMap";

interface WorldMapModalProps {
  open: boolean;
  onClose: () => void;
  currentMapId: string;
  onMapSelect: (mapId: string) => void;
  playerLevel: number;
}

export function WorldMapModal({
  open,
  onClose,
  currentMapId,
  onMapSelect,
  playerLevel,
}: WorldMapModalProps) {
  const { theme } = useThemeStore();

  const handleMapSelect = (mapId: string) => {
    onMapSelect(mapId);
    onClose();
  };

  return (
    <Modal.Root open={open} onClose={onClose}>
      <Modal.Overlay>
        <Modal.Content size="lg">
          <Modal.Header>월드맵</Modal.Header>
          <Modal.Body className="p-0">
            <WorldMap
              currentMapId={currentMapId}
              onMapSelect={handleMapSelect}
              playerLevel={playerLevel}
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-mono transition-colors"
              style={{
                background: theme.colors.bgDark,
                color: theme.colors.textMuted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              닫기
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
}
