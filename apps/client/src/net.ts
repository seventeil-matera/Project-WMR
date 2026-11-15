import type { ClientMessage, ServerMessage, SkillId } from "@wmr/shared";

export type ServerHandler = (msg: ServerMessage) => void;

export class NetClient {
  private ws: WebSocket | null = null;
  private seq = 0;
  onMessage: ServerHandler = () => {};

  connect() {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${location.host}/ws`;
    this.ws = new WebSocket(url);
    this.ws.addEventListener("open", () => {
      this.send({ type: "hello", name: "Runner" });
    });
    this.ws.addEventListener("message", (ev) => {
      try {
        this.onMessage(JSON.parse(String(ev.data)) as ServerMessage);
      } catch {
        /* ignore */
      }
    });
  }

  startRun() {
    this.send({ type: "start_run" });
  }

  restart() {
    this.send({ type: "restart" });
  }

  sendInput(dx: number, dy: number, skills: SkillId[]) {
    this.seq += 1;
    this.send({ type: "input", seq: this.seq, dx, dy, skills });
  }

  private send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
