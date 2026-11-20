# 아키텍처

기술 스택 초안.

```
Browser (Vite + Pixi)
    │  WSS
    ├────────────► Lobby Gateway ──► Lobby Shard (presence, chat, match)
    │                                    │
    │                                    ▼ match ok
    └────────────► Dungeon Gateway ──► Dungeon Room (authority sim)
                                           │
                                           ▼ clear
                                      Reward Service → DB
```

- 브라우저 번들·렌더: [Vite](vite.md), [Pixi](pixi.md)
- 로비 샤드: [로비 샤드](../lobby/shard.md). 채팅: [채팅](../lobby/chat.md). 매칭: [매칭](../lobby/match.md)
- 인던 권위 시뮬: [인던 룸](../combat/instance.md), [서버 권한](../network/authority.md)
- DB: [데이터베이스](database.md)
- 틱: [서버 권한](../network/authority.md)
