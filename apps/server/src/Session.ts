import type { WebSocket } from "ws";
import type { ClientMessage, ServerMessage, SkillId } from "@wmr/shared";
import { DungeonRun } from "./sim/DungeonRun.js";

const TICK_HZ = 20;
const DT = 1 / TICK_HZ;

export class Session {
  private run: DungeonRun | null = null;
  private tick = 0;
  private timer: NodeJS.Timeout | null = null;
  private playerId: string;

  constructor(
    private readonly ws: WebSocket,
    playerId: string,
  ) {
    this.playerId = playerId;
    this.send({ type: "welcome", playerId });
    this.send({
      type: "toast",
      text: "Start로 쇼츠형 던전(12방+특수)을 시작하세요",
    });
  }

  handle(raw: string) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "hello":
        this.send({ type: "toast", text: `접속: ${msg.name ?? "Runner"}` });
        break;
      case "start_run":
      case "restart":
        this.startRun();
        break;
      case "input":
        if (this.run && !this.run.isDone) {
          this.run.setInput(msg.dx, msg.dy, msg.skills as SkillId[]);
        }
        break;
    }
  }

  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.run = null;
  }

  private startRun() {
    if (this.timer) clearInterval(this.timer);
    this.run = new DungeonRun(this.playerId);
    this.tick = 0;
    this.send({ type: "toast", text: "던전 입장 — 빠른 클립 전투" });
    this.timer = setInterval(() => this.step(), 1000 / TICK_HZ);
  }

  private step() {
    if (!this.run) return;
    this.tick += 1;
    this.run.tick(DT);
    this.send(this.run.snapshot(this.tick));
    if (this.run.isDone && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private send(msg: ServerMessage) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
