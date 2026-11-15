import type { ClientMessage, ServerMessage, SkillId } from "@wmr/shared";

export type ServerHandler = (msg: ServerMessage) => void;
export type ConnState = "connecting" | "online" | "offline";

export class NetClient {
  private ws: WebSocket | null = null;
  private seq = 0;
  private _state: ConnState = "connecting";
  onMessage: ServerHandler = () => {};
  onState: (state: ConnState) => void = () => {};

  get state() {
    return this._state;
  }

  get online() {
    return this._state === "online";
  }

  connect() {
    this.setState("connecting");
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${location.host}/ws`;

    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      this.setState("offline");
    };

    try {
      this.ws = new WebSocket(url);
    } catch {
      fail();
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!settled) {
        try {
          this.ws?.close();
        } catch {
          /* ignore */
        }
        fail();
      }
    }, 2500);

    this.ws.addEventListener("open", () => {
      settled = true;
      window.clearTimeout(timeout);
      this.setState("online");
      this.send({ type: "hello", name: "Runner" });
    });
    this.ws.addEventListener("message", (ev) => {
      try {
        this.onMessage(JSON.parse(String(ev.data)) as ServerMessage);
      } catch {
        /* ignore */
      }
    });
    this.ws.addEventListener("close", () => {
      window.clearTimeout(timeout);
      if (this._state === "online") this.setState("offline");
      else fail();
    });
    this.ws.addEventListener("error", () => {
      window.clearTimeout(timeout);
      fail();
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

  private setState(state: ConnState) {
    this._state = state;
    this.onState(state);
  }

  private send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
