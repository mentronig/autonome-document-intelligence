export enum OperationalMode {
  MANUAL = 'MANUAL', // User triggers everything
  REVIEW = 'REVIEW', // Agent proposes, User approves
  MAD_DOG = 'MAD_DOG', // Agent acts fully autonomously
}

export class ModeManager {
  private currentMode: OperationalMode;

  constructor(initialMode: OperationalMode = OperationalMode.REVIEW) {
    this.currentMode = initialMode;
  }

  setMode(mode: OperationalMode) {
    console.log(`Switching Operational Mode to: ${mode}`);
    this.currentMode = mode;
  }

  getMode(): OperationalMode {
    return this.currentMode;
  }

  async requireApproval(actionDescription: string): Promise<boolean> {
    if (this.currentMode === OperationalMode.MAD_DOG) {
      console.log(`[MAD DOG] Auto-approving action: ${actionDescription}`);
      return true;
    }

    if (this.currentMode === OperationalMode.REVIEW) {
      console.log(`[REVIEW] Action requires approval: ${actionDescription}`);
      // In a real CLI, we would prompt here.
      // For now, we simulate waiting or return false to be safe in non-interactive.
      // But since this is an agent, we might use a callback or prompt.
      // For this POC, we'll log it and assume manual trigger needed or return false.
      return false;
    }

    return false;
  }
}
