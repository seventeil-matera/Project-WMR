import type { SkillId } from "@wmr/shared";

export class Input {
  private keys = new Set<string>();
  private skills: SkillId[] = [];

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (e.code === "KeyQ") this.skills.push("q");
      if (e.code === "KeyE") this.skills.push("e");
      if (e.code === "Space") {
        e.preventDefault();
        this.skills.push("basic");
      }
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }

  sample(): { dx: number; dy: number; skills: SkillId[] } {
    let dx = 0;
    let dy = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) dx -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) dx += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) dy -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) dy += 1;
    const skills = this.skills.splice(0, this.skills.length);
    return { dx, dy, skills };
  }
}
