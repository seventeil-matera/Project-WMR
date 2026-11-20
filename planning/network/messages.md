# 메시지 초안

최소 세트. 초안.

- `lobby.join` / `lobby.chat` / `match.queue` / `match.ready`
- `dungeon.enter` / `input.frame` / `skill.cast`
- `snapshot` / `event.spawn|hit|kill|clear|tier_up`
- `reward.summary`

- 로비 입장·채팅: [로비 샤드](../lobby/shard.md), [채팅](../lobby/chat.md)
- 매칭: [매칭](../lobby/match.md)
- 보상 요약 이후 DB: [아키텍처](../tech/architecture.md)

구현된 v0 타입(`hello`, `start_run`, `restart`, `input`, `welcome`, `toast`, `snapshot`)은 위 이름과 다르다. 필드와 이벤트 목록: [프로토콜 v0](protocol-v0.md)
