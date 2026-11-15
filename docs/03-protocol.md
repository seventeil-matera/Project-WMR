# 프로토콜 v0 (JSON over WebSocket)

엔드포인트: `ws://host/ws` (Vite 개발 시 `/ws` 프록시)

## Client → Server

| type | 필드 | 설명 |
|------|------|------|
| `hello` | `name?` | 접속 인사 |
| `start_run` | — | 솔로 던전 시작 |
| `restart` | — | 재시작 |
| `input` | `seq`, `dx`, `dy`, `skills[]` | 이동·스킬 입력 (`basic`/`q`/`e`) |

## Server → Client

| type | 설명 |
|------|------|
| `welcome` | `playerId` 부여 |
| `toast` | UI 토스트 문자열 |
| `snapshot` | 20Hz 권위 스냅샷 + `events[]` |

### snapshot

- `tick`, `room`, `player`, `monsters`, `events`
- 이벤트: `spawn` / `hit` / `kill` / `player_hit` / `room_clear` / `tier_up` / `phase` / `run_clear` / `run_fail`

데미지·사망·방 클리어·티어는 **서버만** 결정한다. 클라는 연출만 수행한다.
