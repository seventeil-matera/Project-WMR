/**
 * Headless smoke: connect, start run, spam movement toward pack + skills,
 * assert room progress / clear or fail within timeout.
 */
import WebSocket from "ws";

const url = process.env.WMR_WS ?? "ws://127.0.0.1:8787/ws";
const ws = new WebSocket(url);

let cleared = 0;
let done = null;
let lastRoom = "";

ws.on("open", () => {
  ws.send(JSON.stringify({ type: "hello", name: "smoke" }));
  ws.send(JSON.stringify({ type: "start_run" }));
  setInterval(() => {
    const t = Date.now() / 1000;
    // orbit-ish kite so boss contact damage does not melt the bot
    ws.send(
      JSON.stringify({
        type: "input",
        seq: Date.now(),
        dx: Math.cos(t * 1.4) * 0.35 + 0.65,
        dy: Math.sin(t * 2.1),
        skills: t % 2.2 < 0.35 ? ["q"] : t % 3.5 < 0.2 ? ["e"] : [],
      }),
    );
  }, 50);
});

ws.on("message", (data) => {
  const msg = JSON.parse(String(data));
  if (msg.type !== "snapshot") return;
  lastRoom = msg.room.label;
  cleared = msg.room.cleared;
  for (const ev of msg.events) {
    if (ev.type === "run_clear") done = { ok: true, ms: ev.durationMs, tier: ev.tier };
    if (ev.type === "run_fail") done = { ok: false, reason: ev.reason };
  }
  if (done) {
    console.log(JSON.stringify({ ...done, cleared, lastRoom }, null, 2));
    ws.close();
    process.exit(done.ok ? 0 : 2);
  }
});

setTimeout(() => {
  console.error(JSON.stringify({ ok: false, timeout: true, cleared, lastRoom }));
  process.exit(1);
}, 180_000);
