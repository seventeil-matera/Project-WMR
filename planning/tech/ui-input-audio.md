# UI · 입력 · 오디오

기술 스택 초안.

## UI

게임 오버레이는 경량 DOM/HTML 또는 인캔버스 UI.

로비·상점·매칭은 DOM, 전투 HUD는 캔버스 가능.

- 로비: [로비 샤드](../lobby/shard.md)
- 상점: [상점](../lobby/shop.md)
- 매칭: [매칭](../lobby/match.md)
- 렌더: [Pixi](pixi.md)

## 입력

키보드·마우스 우선, 터치 스틱은 후순위 어댑터. Windows 웹 최적화.

1차는 UI·입력만 두고, 연출/해상도는 PC 기준으로 축소한다. [방향](../concept/direction.md)

모바일 동등 품질은 1차에서 제외하고, 터치 UI 실험만 허용한다. [1차 출시 단위](../concept/mvp.md)

프로토타입 키: [조작](../combat/controls.md)

## 오디오

Howler 또는 Web Audio 래퍼. 짧은 타격음 뱅크.
