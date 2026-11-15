import type { VisualTier } from "./tiers.js";

export type SkillId = "basic" | "q" | "e";

export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerPublic {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  tier: VisualTier;
  facing: number;
}

export interface MonsterPublic {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  color: number;
  kind: string;
}

export interface RoomPublic {
  index: number;
  label: string;
  kind: "normal" | "special";
  phase: 1 | 2;
  cleared: number;
  total: number;
}

export type ClientMessage =
  | { type: "hello"; name?: string }
  | { type: "start_run" }
  | { type: "input"; seq: number; dx: number; dy: number; skills: SkillId[] }
  | { type: "restart" };

export type CombatEvent =
  | { type: "spawn"; monsters: MonsterPublic[] }
  | { type: "hit"; targetId: string; damage: number; fromId: string; skill: SkillId }
  | { type: "kill"; targetId: string }
  | { type: "player_hit"; damage: number; hp: number }
  | { type: "room_clear"; roomIndex: number; tier: VisualTier }
  | { type: "tier_up"; tier: VisualTier }
  | { type: "phase"; phase: 1 | 2 }
  | { type: "run_clear"; durationMs: number; tier: VisualTier }
  | { type: "run_fail"; reason: string };

export type ServerMessage =
  | { type: "welcome"; playerId: string }
  | {
      type: "snapshot";
      tick: number;
      room: RoomPublic;
      player: PlayerPublic;
      monsters: MonsterPublic[];
      events: CombatEvent[];
    }
  | { type: "toast"; text: string };
