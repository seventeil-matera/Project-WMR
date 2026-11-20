# Project-WMR

웹 MORPG(가칭 Mortgage) — 쇼츠형 던전 프로토타입.

## 지금 돌아가는 것

- 솔로 인던 **일반 12방 + 특수 1**
- WebSocket 서버 권위 **또는** 브라우저 **로컬 모드** (서버 없어도 플레이)
- 자동 평타 / Q 참격 / E 돌진
- 성장 **비주얼 티어 T1~T4**
- PixiJS 클라 (히트 FX, 쉐이크, 티어 오라)

## 실행 (본인 PC에서)

클라우드 에이전트의 `localhost`는 사용자 PC에서 열리지 않습니다.  
**저장소를 클론한 뒤 로컬에서** 실행하세요.

```bash
git clone https://github.com/seventeil-matera/Project-WMR.git
cd Project-WMR
git checkout cursor/web-morpg-stack-draft-769d
npm install
npm run build -w @wmr/shared
npm run dev:client   # :5173  — 이것만으로도 로컬 모드 플레이 가능
# (선택) npm run dev:server   # :8787 — 서버 권위 모드
```

브라우저에서 `http://localhost:5173` → **START RUN**

## 조작

| 키 | 동작 |
|----|------|
| WASD | 이동 |
| (자동) | 근접 평타 |
| Q | 범위 참격 |
| E | 돌진 |
| Space | 평타 수동 |

## 문서

- [컨셉 & 스택](planning/README.md)
- [방 비트표](planning/combat/normal-room-beats.md)
- [프로토콜 v0](planning/network/protocol-v0.md)
- [스테이지 컨셉 백로그 (미구현)](planning/stage/candidates.md)

## 구조

```
apps/client   Vite + PixiJS (+ 로컬 솔로 시뮬)
apps/server   Node WebSocket 권위 시뮬
packages/shared  던전 데이터·프로토콜·티어·DungeonRun
```
