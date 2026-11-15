# Project-WMR

웹 MORPG(가칭 Mortgage) — 쇼츠형 던전 프로토타입.

## 지금 돌아가는 것

- 솔로 인던 **일반 12방 + 특수 1**
- **서버 권위** WebSocket 시뮬레이션 (20Hz)
- 자동 평타 / Q 참격 / E 돌진
- 성장 **비주얼 티어 T1~T4**
- PixiJS 클라 (히트 FX, 쉐이크, 티어 오라)

## 실행

```bash
npm install
npm run build -w @wmr/shared
npm run dev:server   # :8787
npm run dev:client   # :5173  (/ws → 8787 프록시)
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

- [컨셉 & 스택](docs/01-concept-and-stack.md)
- [방 비트표](docs/02-combat-room-beats.md)
- [프로토콜 v0](docs/03-protocol.md)

## 구조

```
apps/client   Vite + PixiJS
apps/server   Node WebSocket 권위 시뮬
packages/shared  던전 데이터·프로토콜·티어
```
