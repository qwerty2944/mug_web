// ============ 맵 타입 ============

export interface GameMap {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string | null;
  descriptionEn: string | null;
  icon: string;
  minLevel: number;
  maxPlayers: number;
  isPvp: boolean;
  isSafeZone: boolean;
  connectedMaps: string[];
}
