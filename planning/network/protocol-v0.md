# 프로토콜 v0

스키마 후보: **MessagePack 또는 JSON** (1차는 JSON, 핫패스만 바이너리 검토).

아래는 구현된 v0. JSON over WebSocket.

엔드포인트: `ws://host/ws` (Vite 개발 시 `/ws` 프록시). 번들: [Vite](../tech/vite.md)

초안 메시지 이름(`lobby.join`, `dungeon.enter` 등)은 여기 타입과 다르다. [메시지 초안](messages.md)

## Client → Server

| type | 필드 | 설명 |
|------|------|------|
| `hello` | `name?` | 접속 인사 |
| `start_run` | — | 솔로 던전 시작 |
| `restart` | — | 재시작 |
| `input` | `seq`, `dx`, `dy`, `skills[]` | 이동·스킬 입력 (`basic`/`q`/`e`) |

조작 키와 `basic`/`q`/`e` 대응: [조작](../combat/controls.md)

## Server → Client

| type | 설명 |
|------|------|
| `welcome` | `playerId` 부여 |
| `toast` | UI 토스트 문자열 |
| `snapshot` | 20Hz 권위 스냅샷 + `events[]` |

### snapshot

- `tick`, `room`, `player`, `monsters`, `events`
- 이벤트: `spawn` / `hit` / `kill` / `player_hit` / `room_clear` / `tier_up` / `phase` / `run_clear` / `run_fail`

`room_clear` · `tier_up`: [일반 방 비트](../combat/normal-room-beats.md). `phase` · `run_clear`: [특수 방 비트](../combat/special-room-beats.md)

데미지·사망·방 클리어·티어는 **서버만** 결정한다. 클라는 연출만 수행한다. 틱과 권한 원칙: [서버 권한](authority.md)

공통 상수 패키지: [공유 패키지](../tech/shared.md)
