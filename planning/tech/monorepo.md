# 모노레포 (초안)

```
/
  apps/
    client/          # Vite + Pixi
    server/          # Lobby + Dungeon + API
  packages/
    shared/          # 프로토콜, 공식, 템플릿 타입
    config/          # 던전/몬스터/티어 데이터
  planning/          # 기획·스택
```

초안에 적혀 있던 기획 경로는 `docs/` 였다. 기획 문서는 `planning/`에 둔다.

프로토타입에서 이미 있는 패키지: `apps/client`, `apps/server`, `packages/shared`. [마일스톤](../concept/milestones.md)

공유 상수: [공유 패키지](shared.md). 클라이언트 선택: [Vite](vite.md), [Pixi](pixi.md). 서버: [Node](node.md).
