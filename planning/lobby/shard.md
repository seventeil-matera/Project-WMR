# 로비 샤드

```
[로비 샤드] 동시 50~100명
  - 이동, 채팅, 매칭, 상점, 외형 확인
  - 전투·대형 PvP 없음
```

- 채팅: [채팅](chat.md)
- 매칭: [매칭](match.md)
- 상점: [상점](shop.md)
- 외형 확인: [외형 확인](appearance.md)
- 서버: 샤드 프로세스 (50~100). 전투 없음 → 낮은 틱. 런타임은 [Node](../tech/node.md). 틱 수치(5~10 Hz 또는 이벤트 드리븐, 보간 거의 불필요)는 [서버 권한](../network/authority.md)
- Lobby Gateway → Lobby Shard (presence, chat, match). 그림은 [아키텍처](../tech/architecture.md)
- 로비 프레즌스 캐시: [데이터베이스](../tech/database.md)
- 로비 UI는 DOM. [UI·입력·오디오](../tech/ui-input-audio.md)
- 1차: 로비 1샤드 (이동·채팅·매칭·외형). [1차 출시 단위](../concept/mvp.md)
- 월드 안에서 차지하는 자리: [범위](../concept/scope.md)

메시지 초안 이름 `lobby.join`: [메시지 초안](../network/messages.md)
