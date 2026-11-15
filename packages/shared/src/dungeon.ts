export type RoomKind = "normal" | "special";

export interface MonsterSpawnSpec {
  id: string;
  hp: number;
  speed: number;
  radius: number;
  damage: number;
  color: number;
  count: number;
}

export interface RoomTemplate {
  index: number;
  kind: RoomKind;
  label: string;
  targetSeconds: number;
  spawns: MonsterSpawnSpec[];
  /** Optional second wave for special rooms */
  phase2Spawns?: MonsterSpawnSpec[];
  phase2HpThreshold?: number;
}

const normalPalette = [0xe76f51, 0xf4a261, 0xe9c46a, 0x2a9d8f, 0x264653];

function normalRoom(index: number): RoomTemplate {
  const wave = 1 + Math.floor(index / 3);
  const count = 3 + (index % 3);
  const hp = 28 + index * 6;
  return {
    index,
    kind: "normal",
    label: `방 ${index + 1}`,
    targetSeconds: 12,
    spawns: [
      {
        id: `trash-${index}`,
        hp,
        speed: 55 + index * 2,
        radius: 14 + (index % 3) * 2,
        damage: 3 + Math.floor(index / 5),
        color: normalPalette[index % normalPalette.length]!,
        count,
      },
      ...(wave >= 2
        ? [
            {
              id: `brute-${index}`,
              hp: hp * 1.6,
              speed: 38,
              radius: 20,
              damage: 5,
              color: 0xb5179e,
              count: 1,
            } satisfies MonsterSpawnSpec,
          ]
        : []),
    ],
  };
}

export const SPECIAL_ROOM: RoomTemplate = {
  index: 12,
  kind: "special",
  label: "특수 — 균열의 수호자",
  targetSeconds: 90,
  spawns: [
    {
      id: "guardian",
      hp: 1500,
      speed: 42,
      radius: 36,
      damage: 7,
      color: 0x7b2cbf,
      count: 1,
    },
    {
      id: "rift-add",
      hp: 60,
      speed: 62,
      radius: 12,
      damage: 3,
      color: 0xc77dff,
      count: 3,
    },
  ],
  phase2HpThreshold: 0.45,
  phase2Spawns: [
    {
      id: "rift-add-p2",
      hp: 75,
      speed: 68,
      radius: 13,
      damage: 4,
      color: 0xff006e,
      count: 4,
    },
  ],
};

export const DUNGEON_ROOMS: RoomTemplate[] = [
  ...Array.from({ length: 12 }, (_, i) => normalRoom(i)),
  SPECIAL_ROOM,
];

export const ARENA = {
  width: 960,
  height: 540,
  padding: 40,
} as const;

export const PLAYER_BASE = {
  radius: 16,
  speed: 210,
  maxHp: 120,
  basicDamage: 18,
  basicCooldownMs: 280,
  skillQDamage: 42,
  skillQCooldownMs: 1800,
  skillQRadius: 70,
  skillEDamage: 55,
  skillECooldownMs: 3200,
  skillEDash: 140,
} as const;
