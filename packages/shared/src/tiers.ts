export type VisualTier = 1 | 2 | 3 | 4;

export const TIER_COLORS: Record<VisualTier, number> = {
  1: 0x8ecae6,
  2: 0x90be6d,
  3: 0xf9c74f,
  4: 0xf94144,
};

export const TIER_LABELS: Record<VisualTier, string> = {
  1: "T1 견습",
  2: "T2 단련",
  3: "T3 각성",
  4: "T4 초월",
};

/** Rooms cleared (0-based next index) → visual tier */
export function tierForProgress(roomsCleared: number): VisualTier {
  if (roomsCleared >= 12) return 4;
  if (roomsCleared >= 8) return 3;
  if (roomsCleared >= 4) return 2;
  return 1;
}

export function damageMultiplierForTier(tier: VisualTier): number {
  return 0.85 + tier * 0.15;
}
