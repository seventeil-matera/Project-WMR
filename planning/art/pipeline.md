# 아트 파이프라인

1. **방 템플릿** 소수 (직선 아레나, 원형, 복도형 등 3~4종). 방 비트: [일반 방](../combat/normal-room-beats.md), [특수 방](../combat/special-room-beats.md)
2. **몬스터 스킨 + 체력/위협 테이블**로 일반 방 양산
3. **특수몹**만 전용 패턴·페이즈·연출 스크립트. 프로토타입 특수 방: [특수 방 비트](../combat/special-room-beats.md)
4. **비주얼 티어 팩** (직업×티어) — 스프라이트/VFX 아틀라스. 단계 표: [비주얼 티어](visual-tiers.md)
5. 데이터는 JSON/YAML → 빌드 시 검증 후 서버·클라 공유. 패키지: [공유 패키지](../tech/shared.md), [모노레포](../tech/monorepo.md)

리스크 완화 “템플릿×스킨 양산, 특수만 수제”: [리스크](../concept/risks.md)

티어 아트 스펙으로 잡아 둔 문서 이름은 `05-art-tier-pipeline.md`이다. 본문은 아직 없다. [마일스톤](../concept/milestones.md)
