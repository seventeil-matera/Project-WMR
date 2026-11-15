import { Application, Container, Graphics, Text } from "pixi.js";
import {
  ARENA,
  TIER_COLORS,
  type CombatEvent,
  type MonsterPublic,
  type PlayerPublic,
  type RoomPublic,
  type VisualTier,
} from "@wmr/shared";

type Fx = {
  g: Graphics;
  life: number;
  max: number;
  update?: (t: number) => void;
};

export class WorldView {
  readonly app: Application;
  private root = new Container();
  private arena = new Graphics();
  private entities = new Container();
  private fxLayer = new Container();
  private playerG = new Graphics();
  private auraG = new Graphics();
  private monsterMap = new Map<string, Graphics>();
  private monsterPos = new Map<string, { x: number; y: number }>();
  private floating: { t: Text; life: number; vy: number }[] = [];
  private fx: Fx[] = [];
  private shake = 0;
  private roomFlash = 0;

  constructor(app: Application) {
    this.app = app;
    app.stage.addChild(this.root);
    this.root.addChild(this.arena, this.entities, this.fxLayer);
    this.entities.addChild(this.auraG, this.playerG);
    this.drawArena();
    app.ticker.add((ticker) => this.updateFx(ticker.deltaMS / 1000));
  }

  static async create(host: HTMLElement) {
    const app = new Application();
    await app.init({
      width: ARENA.width,
      height: ARENA.height,
      background: "#0a1224",
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    host.appendChild(app.canvas);
    return new WorldView(app);
  }

  applySnapshot(
    _room: RoomPublic,
    player: PlayerPublic,
    monsters: MonsterPublic[],
    events: CombatEvent[],
  ) {
    this.drawPlayer(player);
    this.syncMonsters(monsters);
    for (const ev of events) this.playEvent(ev, player);
  }

  private drawArena() {
    const g = this.arena;
    g.clear();
    g.rect(0, 0, ARENA.width, ARENA.height);
    g.fill(0x0a1224);
    g.setStrokeStyle({ width: 1, color: 0x1d2b4a, alpha: 0.7 });
    for (let x = 40; x < ARENA.width; x += 40) {
      g.moveTo(x, 20);
      g.lineTo(x, ARENA.height - 20);
      g.stroke();
    }
    for (let y = 40; y < ARENA.height; y += 40) {
      g.moveTo(20, y);
      g.lineTo(ARENA.width - 20, y);
      g.stroke();
    }
    g.roundRect(24, 24, ARENA.width - 48, ARENA.height - 48, 18);
    g.stroke({ width: 2, color: 0x5ce1ff, alpha: 0.35 });
  }

  private drawPlayer(p: PlayerPublic) {
    const color = TIER_COLORS[p.tier];
    this.auraG.clear();
    this.auraG.circle(p.x, p.y, 28 + p.tier * 4);
    this.auraG.fill({ color, alpha: 0.12 + p.tier * 0.04 });
    this.auraG.circle(p.x, p.y, 22 + p.tier * 2);
    this.auraG.stroke({ width: 2, color, alpha: 0.55 });

    this.playerG.clear();
    this.playerG.circle(p.x, p.y, 16);
    this.playerG.fill(0xe8eefc);
    this.playerG.stroke({ width: 3, color });
    const fx = Math.cos(p.facing) * 20;
    const fy = Math.sin(p.facing) * 20;
    this.playerG.moveTo(p.x, p.y);
    this.playerG.lineTo(p.x + fx, p.y + fy);
    this.playerG.stroke({ width: 3, color: 0x5ce1ff, alpha: 0.9 });
  }

  private syncMonsters(list: MonsterPublic[]) {
    const seen = new Set<string>();
    for (const m of list) {
      seen.add(m.id);
      this.monsterPos.set(m.id, { x: m.x, y: m.y });
      let g = this.monsterMap.get(m.id);
      if (!g) {
        g = new Graphics();
        this.monsterMap.set(m.id, g);
        this.entities.addChild(g);
      }
      g.clear();
      g.circle(m.x, m.y, m.radius);
      g.fill(m.color);
      g.stroke({ width: 2, color: 0xffffff, alpha: 0.25 });
      const ratio = Math.max(0, m.hp / m.maxHp);
      g.rect(m.x - m.radius, m.y - m.radius - 10, m.radius * 2 * ratio, 4);
      g.fill(0xff6b6b);
    }
    for (const [id, g] of this.monsterMap) {
      if (!seen.has(id)) {
        this.entities.removeChild(g);
        g.destroy();
        this.monsterMap.delete(id);
        this.monsterPos.delete(id);
      }
    }
  }

  private playEvent(ev: CombatEvent, player: PlayerPublic) {
    switch (ev.type) {
      case "hit": {
        const pos = this.monsterPos.get(ev.targetId) ?? {
          x: player.x + 40,
          y: player.y,
        };
        this.spawnBurst(
          pos.x,
          pos.y,
          ev.skill === "q" ? 0x5ce1ff : ev.skill === "e" ? 0xffffff : 0xffd166,
        );
        this.spawnDamageText(pos.x, pos.y - 10, ev.damage);
        if (ev.skill === "q") this.spawnRing(player.x, player.y, 70, 0x5ce1ff);
        if (ev.skill === "e") this.spawnDash(player.x, player.y, player.facing);
        this.shake = Math.max(this.shake, ev.skill === "basic" ? 0.08 : 0.16);
        break;
      }
      case "kill":
        this.shake = Math.max(this.shake, 0.12);
        break;
      case "player_hit":
        this.shake = Math.max(this.shake, 0.2);
        this.spawnDamageText(player.x, player.y - 24, ev.damage, 0xff6b6b);
        break;
      case "tier_up":
        this.spawnRing(player.x, player.y, 90, TIER_COLORS[ev.tier]);
        this.spawnRing(player.x, player.y, 130, TIER_COLORS[ev.tier]);
        break;
      case "phase":
        this.roomFlash = 0.45;
        break;
      case "room_clear":
        this.spawnRing(player.x, player.y, 110, 0x7cfc9a);
        break;
      default:
        break;
    }
  }

  private spawnBurst(x: number, y: number, color: number) {
    const g = new Graphics();
    this.fxLayer.addChild(g);
    this.fx.push({
      g,
      life: 0.25,
      max: 0.25,
      update: (t) => {
        const r = 8 + (1 - t) * 22;
        g.clear();
        g.circle(x, y, r);
        g.stroke({ width: 3, color, alpha: t });
      },
    });
  }

  private spawnRing(x: number, y: number, radius: number, color: number) {
    const g = new Graphics();
    this.fxLayer.addChild(g);
    this.fx.push({
      g,
      life: 0.35,
      max: 0.35,
      update: (t) => {
        g.clear();
        g.circle(x, y, radius * (1.15 - t * 0.15));
        g.stroke({ width: 4, color, alpha: t * 0.9 });
      },
    });
  }

  private spawnDash(x: number, y: number, facing: number) {
    const g = new Graphics();
    this.fxLayer.addChild(g);
    const tx = x - Math.cos(facing) * 80;
    const ty = y - Math.sin(facing) * 80;
    this.fx.push({
      g,
      life: 0.2,
      max: 0.2,
      update: (t) => {
        g.clear();
        g.moveTo(tx, ty);
        g.lineTo(x, y);
        g.stroke({ width: 6, color: 0xffffff, alpha: t });
      },
    });
  }

  private spawnDamageText(x: number, y: number, dmg: number, color = 0xfff1a8) {
    const t = new Text({
      text: String(dmg),
      style: {
        fontFamily: "Orbitron, sans-serif",
        fontSize: 16,
        fill: color,
        fontWeight: "700",
      },
    });
    t.x = x;
    t.y = y;
    t.anchor.set(0.5);
    this.fxLayer.addChild(t);
    this.floating.push({ t, life: 0.55, vy: -40 });
  }

  private updateFx(dt: number) {
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt);
      this.root.x = (Math.random() - 0.5) * this.shake * 24;
      this.root.y = (Math.random() - 0.5) * this.shake * 24;
    } else {
      this.root.x = 0;
      this.root.y = 0;
    }

    if (this.roomFlash > 0) {
      this.roomFlash = Math.max(0, this.roomFlash - dt);
      this.arena.alpha = 0.85 + Math.sin(this.roomFlash * 40) * 0.08;
    } else {
      this.arena.alpha = 1;
    }

    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i]!;
      f.life -= dt;
      const t = Math.max(0, f.life / f.max);
      f.update?.(t);
      if (f.life <= 0) {
        this.fxLayer.removeChild(f.g);
        f.g.destroy();
        this.fx.splice(i, 1);
      }
    }

    for (let i = this.floating.length - 1; i >= 0; i--) {
      const f = this.floating[i]!;
      f.life -= dt;
      f.t.y += f.vy * dt;
      f.t.alpha = Math.max(0, f.life / 0.55);
      if (f.life <= 0) {
        this.fxLayer.removeChild(f.t);
        f.t.destroy();
        this.floating.splice(i, 1);
      }
    }
  }
}
