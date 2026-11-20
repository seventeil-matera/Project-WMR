# 매칭

로비 샤드에서 하는 일에 매칭이 있다. [로비 샤드](shard.md)

- 매칭이 되면(`match ok`) Dungeon Gateway로 넘긴다. [아키텍처](../tech/architecture.md)
- 메시지 초안: `match.queue` / `match.ready`. [메시지 초안](../network/messages.md)
- 매칭 큐는 Redis. [데이터베이스](../tech/database.md)
- 빠른 템포 기둥(매칭→클리어→보상→재입장, 한 던전 체감 5~10분): [방향](../concept/direction.md)
- 리스크 「매칭 대기」의 완화(봇 필러 또는 1~2인 스케일 던전 모드): [리스크](../concept/risks.md)
