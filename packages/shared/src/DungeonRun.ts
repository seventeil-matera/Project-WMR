import { ARENA, DUNGEON_ROOMS, PLAYER_BASE, type RoomTemplate } from "./dungeon.js";
import type {
  CombatEvent,
  MonsterPublic,
  PlayerPublic,
  RoomPublic,
  SkillId,
} from "./protocol.js";
import {
  damageMultiplierForTier,
  tierForProgress,
  type VisualTier,
} from "./tiers.js";

interface Monster {
  id: string;
  kind: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  damage: number;
  color: number;
  attackCd: number;
}

interface Cooldowns {
  basic: number;
  q: number;
  e: number;
}

export class DungeonRun {
  readonly playerId: string;
  private roomIndex = 0;
  private phase: 1 | 2 = 1;
  private phase2Fired = false;
  private monsters = new Map<string, Monster>();
  private nextMonsterId = 1;
  private roomsCleared = 0;
  private tier: VisualTier = 1;
  private alive = true;
  private cleared = false;
  private startedAt = Date.now();
  private roomEnterAt = Date.now();
  private events: CombatEvent[] = [];
  private transitionMs = 0;

  x = ARENA.width * 0.2;
  y = ARENA.height * 0.5;
  hp: number = PLAYER_BASE.maxHp;
  maxHp: number = PLAYER_BASE.maxHp;
  facing = 0;
  private cd: Cooldowns = { basic: 0, q: 0, e: 0 };
  private input = { dx: 0, dy: 0, skills: [] as SkillId[] };

  constructor(playerId: string) {
    this.playerId = playerId;
    this.enterRoom(0);
  }

  get isDone() {
    return !this.alive || this.cleared;
  }

  setInput(dx: number, dy: number, skills: SkillId[]) {
    const len = Math.hypot(dx, dy) || 1;
    this.input = {
      dx: dx / len,
      dy: dy / len,
      skills: [...skills],
    };
    if (dx !== 0 || dy !== 0) this.facing = Math.atan2(dy, dx);
  }

  tick(dt: number): CombatEvent[] {
    this.events = [];
    if (!this.alive || this.cleared) return this.events;

    if (this.transitionMs > 0) {
      this.transitionMs -= dt * 1000;
      if (this.transitionMs <= 0) this.advanceRoom();
      return this.events;
    }

    this.tickPlayer(dt);
    this.tickMonsters(dt);
    this.tickSkills();
    this.checkPhase();
    this.checkRoomClear();
    return this.events;
  }

  snapshot(tick: number) {
    return {
      type: "snapshot" as const,
      tick,
      room: this.roomPublic(),
      player: this.playerPublic(),
      monsters: this.monsterPublicList(),
      events: this.events,
    };
  }

  private room(): RoomTemplate {
    return DUNGEON_ROOMS[this.roomIndex]!;
  }

  private roomPublic(): RoomPublic {
    const r = this.room();
    return {
      index: r.index,
      label: r.label,
      kind: r.kind,
      phase: this.phase,
      cleared: this.roomsCleared,
      total: DUNGEON_ROOMS.length,
    };
  }

  private playerPublic(): PlayerPublic {
    return {
      id: this.playerId,
      x: this.x,
      y: this.y,
      hp: this.hp,
      maxHp: this.maxHp,
      tier: this.tier,
      facing: this.facing,
    };
  }

  private monsterPublicList(): MonsterPublic[] {
    return [...this.monsters.values()].map((m) => ({
      id: m.id,
      x: m.x,
      y: m.y,
      hp: m.hp,
      maxHp: m.maxHp,
      radius: m.radius,
      color: m.color,
      kind: m.kind,
    }));
  }

  private enterRoom(index: number) {
    this.roomIndex = index;
    this.phase = 1;
    this.phase2Fired = false;
    this.monsters.clear();
    this.roomEnterAt = Date.now();
    this.x = ARENA.width * 0.18;
    this.y = ARENA.height * 0.5;
    this.spawnFromSpecs(this.room().spawns);
    this.events.push({
      type: "spawn",
      monsters: this.monsterPublicList(),
    });
  }

  private spawnFromSpecs(
    specs: RoomTemplate["spawns"],
    side: "right" | "scatter" = "right",
  ) {
    for (const spec of specs) {
      for (let i = 0; i < spec.count; i++) {
        const id = `m${this.nextMonsterId++}`;
        const angle = (i / Math.max(spec.count, 1)) * Math.PI - Math.PI / 2;
        const x =
          side === "right"
            ? ARENA.width * 0.72 + Math.cos(angle) * 40
            : ARENA.width * 0.5 + (Math.random() - 0.5) * 320;
        const y =
          side === "right"
            ? ARENA.height * 0.5 + Math.sin(angle) * 120
            : ARENA.height * 0.5 + (Math.random() - 0.5) * 220;
        this.monsters.set(id, {
          id,
          kind: spec.id,
          x: clamp(x, ARENA.padding, ARENA.width - ARENA.padding),
          y: clamp(y, ARENA.padding, ARENA.height - ARENA.padding),
          hp: spec.hp,
          maxHp: spec.hp,
          radius: spec.radius,
          speed: spec.speed,
          damage: spec.damage,
          color: spec.color,
          attackCd: 0.4 + Math.random() * 0.4,
        });
      }
    }
  }

  private tickPlayer(dt: number) {
    const moving = this.input.dx !== 0 || this.input.dy !== 0;
    if (moving) {
      this.x += this.input.dx * PLAYER_BASE.speed * dt;
      this.y += this.input.dy * PLAYER_BASE.speed * dt;
      this.x = clamp(this.x, ARENA.padding, ARENA.width - ARENA.padding);
      this.y = clamp(this.y, ARENA.padding, ARENA.height - ARENA.padding);
    }
    this.cd.basic = Math.max(0, this.cd.basic - dt * 1000);
    this.cd.q = Math.max(0, this.cd.q - dt * 1000);
    this.cd.e = Math.max(0, this.cd.e - dt * 1000);
  }

  private tickMonsters(dt: number) {
    for (const m of this.monsters.values()) {
      const dx = this.x - m.x;
      const dy = this.y - m.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stopAt = m.radius + PLAYER_BASE.radius - 2;
      if (dist > stopAt) {
        m.x += (dx / dist) * m.speed * dt;
        m.y += (dy / dist) * m.speed * dt;
      }
      m.attackCd -= dt;
      if (m.attackCd <= 0 && dist <= stopAt + 8) {
        m.attackCd = 0.85;
        this.hp -= m.damage;
        this.events.push({
          type: "player_hit",
          damage: m.damage,
          hp: Math.max(0, this.hp),
        });
        if (this.hp <= 0) {
          this.hp = 0;
          this.alive = false;
          this.events.push({ type: "run_fail", reason: "전투 불능" });
          return;
        }
      }
    }
  }

  private tickSkills() {
    const requested = new Set(this.input.skills);
    // Auto basic when idle request or always available
    if (requested.has("basic") || requested.size === 0) {
      this.tryBasic();
    }
    if (requested.has("q")) this.tryQ();
    if (requested.has("e")) this.tryE();
    this.input.skills = [];
  }

  private mult() {
    return damageMultiplierForTier(this.tier);
  }

  private tryBasic() {
    if (this.cd.basic > 0) return;
    const target = this.nearestMonster(PLAYER_BASE.radius + 52);
    if (!target) return;
    this.cd.basic = PLAYER_BASE.basicCooldownMs;
    this.facing = Math.atan2(target.y - this.y, target.x - this.x);
    this.applyDamage(target, PLAYER_BASE.basicDamage * this.mult(), "basic");
  }

  private tryQ() {
    if (this.cd.q > 0) return;
    this.cd.q = PLAYER_BASE.skillQCooldownMs;
    const r = PLAYER_BASE.skillQRadius;
    for (const m of [...this.monsters.values()]) {
      if (Math.hypot(m.x - this.x, m.y - this.y) <= r + m.radius) {
        this.applyDamage(m, PLAYER_BASE.skillQDamage * this.mult(), "q");
      }
    }
  }

  private tryE() {
    if (this.cd.e > 0) return;
    this.cd.e = PLAYER_BASE.skillECooldownMs;
    this.x += Math.cos(this.facing) * PLAYER_BASE.skillEDash;
    this.y += Math.sin(this.facing) * PLAYER_BASE.skillEDash;
    this.x = clamp(this.x, ARENA.padding, ARENA.width - ARENA.padding);
    this.y = clamp(this.y, ARENA.padding, ARENA.height - ARENA.padding);
    for (const m of [...this.monsters.values()]) {
      if (Math.hypot(m.x - this.x, m.y - this.y) <= 60 + m.radius) {
        this.applyDamage(m, PLAYER_BASE.skillEDamage * this.mult(), "e");
      }
    }
  }

  private nearestMonster(maxDist: number): Monster | null {
    let best: Monster | null = null;
    let bestD = maxDist;
    for (const m of this.monsters.values()) {
      const d = Math.hypot(m.x - this.x, m.y - this.y) - m.radius;
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }

  private applyDamage(m: Monster, raw: number, skill: SkillId) {
    const damage = Math.round(raw);
    m.hp -= damage;
    this.events.push({
      type: "hit",
      targetId: m.id,
      damage,
      fromId: this.playerId,
      skill,
    });
    if (m.hp <= 0) {
      this.monsters.delete(m.id);
      this.events.push({ type: "kill", targetId: m.id });
    }
  }

  private checkPhase() {
    const room = this.room();
    if (room.kind !== "special" || this.phase2Fired || !room.phase2HpThreshold) {
      return;
    }
    const boss = [...this.monsters.values()].find((m) => m.kind === "guardian");
    if (!boss) return;
    if (boss.hp / boss.maxHp <= room.phase2HpThreshold) {
      this.phase2Fired = true;
      this.phase = 2;
      this.events.push({ type: "phase", phase: 2 });
      if (room.phase2Spawns) {
        this.spawnFromSpecs(room.phase2Spawns, "scatter");
        this.events.push({ type: "spawn", monsters: this.monsterPublicList() });
      }
    }
  }

  private checkRoomClear() {
    if (this.monsters.size > 0) return;
    const prevTier = this.tier;
    this.roomsCleared += 1;
    this.tier = tierForProgress(this.roomsCleared);
    this.maxHp = PLAYER_BASE.maxHp + (this.tier - 1) * 25;
    // Shorts pacing: top off between clips so tempo stays aggressive
    this.hp = Math.min(this.maxHp, this.hp + Math.round(this.maxHp * 0.55));
    this.events.push({
      type: "room_clear",
      roomIndex: this.roomIndex,
      tier: this.tier,
    });
    if (this.tier > prevTier) {
      this.events.push({ type: "tier_up", tier: this.tier });
    }

    if (this.roomIndex >= DUNGEON_ROOMS.length - 1) {
      this.cleared = true;
      this.events.push({
        type: "run_clear",
        durationMs: Date.now() - this.startedAt,
        tier: this.tier,
      });
      return;
    }

    // Shorts pacing: brief beat then next clip
    const elapsed = Date.now() - this.roomEnterAt;
    const target = this.room().targetSeconds * 1000;
    const remainFeel = Math.max(200, Math.min(900, target - elapsed));
    this.transitionMs = this.room().kind === "special" ? 1200 : remainFeel * 0.15 + 350;
  }

  private advanceRoom() {
    this.enterRoom(this.roomIndex + 1);
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
