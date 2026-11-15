import { TIER_LABELS, type ServerMessage } from "@wmr/shared";
import { Input } from "./input";
import { NetClient } from "./net";
import { WorldView } from "./worldView";

const hostEl = document.getElementById("app");
if (!hostEl) throw new Error("#app missing");
const host: HTMLElement = hostEl;

const roomLabel = document.getElementById("roomLabel")!;
const tierLabel = document.getElementById("tierLabel")!;
const progressLabel = document.getElementById("progressLabel")!;
const hpFill = document.getElementById("hpFill")!;
const toastEl = document.getElementById("toast")!;
const banner = document.getElementById("banner")!;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;

const net = new NetClient();
const input = new Input();
let view: WorldView;
let running = false;
let toastTimer = 0;

function showToast(text: string) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function setBanner(
  title: string,
  body: string,
  primary: string,
  onPrimary: () => void,
) {
  banner.innerHTML = `
    <h1>${title}</h1>
    <p>${body}</p>
    <button id="bannerPrimary" type="button">${primary}</button>
  `;
  banner.style.display = "block";
  const btn = document.getElementById("bannerPrimary") as HTMLButtonElement;
  btn.addEventListener("click", onPrimary);
}

function hideBanner() {
  banner.style.display = "none";
}

function onServer(msg: ServerMessage) {
  switch (msg.type) {
    case "welcome":
      showToast(`연결됨 · ${msg.playerId}`);
      break;
    case "toast":
      showToast(msg.text);
      break;
    case "snapshot": {
      running = true;
      hideBanner();
      const { room, player, monsters, events } = msg;
      roomLabel.innerHTML = `<strong>${room.label}</strong>${
        room.kind === "special" ? " · PHASE " + room.phase : ""
      }`;
      tierLabel.textContent = TIER_LABELS[player.tier];
      progressLabel.textContent = `진행 ${room.cleared} / ${room.total}`;
      const ratio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
      hpFill.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
      view.applySnapshot(room, player, monsters, events);

      for (const ev of events) {
        if (ev.type === "tier_up") showToast(`비주얼 업! ${TIER_LABELS[ev.tier]}`);
        if (ev.type === "phase") showToast("페이즈 2 — 균열이 커진다");
        if (ev.type === "run_clear") {
          running = false;
          setBanner(
            "CLEAR",
            `클리어 ${Math.round(ev.durationMs / 1000)}초 · ${TIER_LABELS[ev.tier]}`,
            "AGAIN",
            () => net.restart(),
          );
        }
        if (ev.type === "run_fail") {
          running = false;
          setBanner("DOWN", ev.reason, "RETRY", () => net.restart());
        }
      }
      break;
    }
  }
}

async function boot() {
  view = await WorldView.create(host);
  net.onMessage = onServer;
  net.connect();

  startBtn.addEventListener("click", () => {
    hideBanner();
    net.startRun();
  });

  // send input at ~30 Hz
  window.setInterval(() => {
    if (!running) return;
    const sample = input.sample();
    net.sendInput(sample.dx, sample.dy, sample.skills);
  }, 1000 / 30);
}

boot().catch((err) => {
  console.error(err);
  showToast("클라 초기화 실패");
});
