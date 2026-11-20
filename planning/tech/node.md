# Node

기술 스택 초안.

런타임: Node.js (TypeScript). 이유: 클라와 언어 공유, 인던 룸 모델에 충분. [언어](language.md)

실시간: WebSocket (uWebSockets / ws). 이유: 브라우저 표준, 인던·로비 분리 연결 가능.

- 메시지: [프로토콜 v0](../network/protocol-v0.md), [메시지 초안](../network/messages.md)
- 권위: [서버 권한](../network/authority.md)
- 로비: 샤드 프로세스. 인원·낮은 틱·전투 없음: [로비 샤드](../lobby/shard.md)
- 인던: 룸당 프로세스/워커 또는 룸 매니저 내 격리. 인원·수명: [인던 룸](../combat/instance.md)

호스팅: 컨테이너 (Fly/GCP/AWS 등). 이유: 인던 수평 확장.
