import { TIER_LABELS, type ServerMessage } from "@wmr/shared";
import { Input } from "./input";
import { LocalSession } from "./localSession";
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
const connLabel = document.getElementById("connLabel");

const net = new NetClient();
const local = new LocalSession();
const input = new Input();
let view: WorldView;
let running = false;
let mode: "net" | "local" = "local";
let toastTimer = 0;

function showToast(text: string) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function setConnText(text: string) {
  if (connLabel) connLabel.textContent = text;
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

function handleMessage(msg: ServerMessage) {
  switch (msg.type) {
    case "welcome":
      showToast(`서버 연결 · ${msg.playerId}`);
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
            () => startRun(),
          );
        }
        if (ev.type === "run_fail") {
          running = false;
          setBanner("DOWN", ev.reason, "RETRY", () => startRun());
        }
      }
      break;
    }
  }
}

function startRun() {
  hideBanner();
  if (net.online) {
    mode = "net";
    local.dispose();
    net.startRun();
    return;
  }
  mode = "local";
  setConnText("로컬 모드 (서버 없음)");
  local.start();
}

async function boot() {
  view = await WorldView.create(host);
  net.onMessage = handleMessage;
  local.onMessage = handleMessage;
  net.onState = (state) => {
    if (state === "online") {
      setConnText("서버 연결됨");
      showToast("서버 연결됨 — START로 시작");
    } else if (state === "offline") {
      setConnText("로컬 모드 사용 가능");
      showToast("서버 없음 → 로컬 모드로 플레이 가능");
    } else {
      setConnText("서버 연결 중…");
    }
  };
  net.connect();

  startBtn.addEventListener("click", () => startRun());

  window.setInterval(() => {
    if (!running) return;
    const sample = input.sample();
    if (mode === "net" && net.online) {
      net.sendInput(sample.dx, sample.dy, sample.skills);
    } else {
      local.setInput(sample.dx, sample.dy, sample.skills);
    }
  }, 1000 / 30);
}

boot().catch((err) => {
  console.error(err);
  showToast("클라 초기화 실패");
});
