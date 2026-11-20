# 마일스톤

## 다음 문서

1. 일반/특수 방 초 단위 비트표 — [일반 방 비트](../combat/normal-room-beats.md), [특수 방 비트](../combat/special-room-beats.md)
2. 메시지 스키마 v0 — [프로토콜 v0](../network/protocol-v0.md)
3. 스테이지 타입 아이디어 (탄막/타이밍/제스처/연타) · **미구현** — [스테이지 후보](../stage/candidates.md)
4. `05-art-tier-pipeline.md` — 티어 아트 스펙. 적혀 있는 파이프라인 메모는 [아트 파이프라인](../art/pipeline.md). 티어 아트 스펙 본문은 아직 없다.
5. 프로토타입 마일스톤 — **로비 없이 솔로 12방 던전 클리어**부터. 방 구성은 [솔로 던전 구성](../combat/solo-dungeon.md)

## 프로토타입 현황 (구현됨)

- `apps/client` + `apps/server` + `packages/shared` 모노레포. 폴더 초안은 [모노레포](../tech/monorepo.md)
- 솔로 권위 시뮬: 일반 12 + 특수 1, 티어 T1~T4, Q/E/자동평타. 구성은 [솔로 던전 구성](../combat/solo-dungeon.md), 조작은 [조작](../combat/controls.md), 티어 표는 [비주얼 티어](../art/visual-tiers.md)
- 실행: `npm install && npm run build -w @wmr/shared && npm run dev:server` / `npm run dev:client`
- 스모크: 서버 켠 뒤 `npm run smoke` (헤드리스 풀클리어)
