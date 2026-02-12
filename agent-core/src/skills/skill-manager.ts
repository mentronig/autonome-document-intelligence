import { ISkill } from './types/ISkill';

export class SkillManager {
  private skills: Map<string, ISkill> = new Map();

  constructor() {
    // Optionally register default skills here later
  }

  public register(skill: ISkill): void {
    if (this.skills.has(skill.id)) {
      console.warn(`SkillManager: Overwriting existing skill '${skill.id}'`);
    }
    this.skills.set(skill.id, skill);
  }

  public getSkill(id: string): ISkill {
    const skill = this.skills.get(id);
    if (!skill) {
      throw new Error(
        `SkillManager: Skill with ID '${id}' not found. Available skills: ${Array.from(this.skills.keys()).join(', ')}`,
      );
    }
    return skill;
  }

  public getAvailableSkills(): string[] {
    return Array.from(this.skills.keys());
  }
}
