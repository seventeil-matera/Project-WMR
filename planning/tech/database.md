# 데이터베이스

기술 스택 초안.

| 영역 | 선택 | 이유 |
|------|------|------|
| DB | PostgreSQL | 계정·캐릭·인벤·티어 |
| 캐시/매칭 | Redis | 세션, 매칭 큐, 로비 프레즌스 |

- 계정·캐릭 1슬롯: [계정](../character/account.md), [캐릭터](../character/character.md)
- 티어: [성장 티어](../character/growth-tiers.md), [비주얼 티어](../art/visual-tiers.md)
- 매칭 큐: [매칭](../lobby/match.md)
- 로비 프레즌스: [로비 샤드](../lobby/shard.md)
- 클리어 보상 저장(Reward Service → DB): [아키텍처](architecture.md)
