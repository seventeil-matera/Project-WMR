import { DungeonRun, type ServerMessage, type SkillId } from "@wmr/shared";

const TICK_HZ = 20;
const DT = 1 / TICK_HZ;

/** Browser-side solo sim when WebSocket server is unreachable. */
export class LocalSession {
  private run: DungeonRun | null = null;
  private tick = 0;
  private timer: number | null = null;
  onMessage: (msg: ServerMessage) => void = () => {};

  start() {
    this.stopTimer();
    this.run = new DungeonRun("local");
    this.tick = 0;
    this.onMessage({ type: "toast", text: "로컬 모드 — 서버 없이 솔로 플레이" });
    this.timer = window.setInterval(() => this.step(), 1000 / TICK_HZ);
  }

  restart() {
    this.start();
  }

  setInput(dx: number, dy: number, skills: SkillId[]) {
    this.run?.setInput(dx, dy, skills);
  }

  get active() {
    return this.run !== null && !this.run.isDone;
  }

  dispose() {
    this.stopTimer();
    this.run = null;
  }

  private step() {
    if (!this.run) return;
    this.tick += 1;
    this.run.tick(DT);
    this.onMessage(this.run.snapshot(this.tick));
    if (this.run.isDone) this.stopTimer();
  }

  private stopTimer() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
