import { ModeManager, OperationalMode } from '../../agent-core/src/engine/mode-manager';

describe('ModeManager', () => {
    let modeManager: ModeManager;

    beforeEach(() => {
        modeManager = new ModeManager();
    });

    test('should default to REVIEW mode', () => {
        expect(modeManager.getMode()).toBe(OperationalMode.REVIEW);
    });

    test('should allow switching mode', () => {
        modeManager.setMode(OperationalMode.MAD_DOG);
        expect(modeManager.getMode()).toBe(OperationalMode.MAD_DOG);
    });

    test('should auto-approve in MAD_DOG mode', async () => {
        modeManager.setMode(OperationalMode.MAD_DOG);
        const result = await modeManager.requireApproval('Test Action');
        expect(result).toBe(true);
    });

    test('should NOT auto-approve in REVIEW mode', async () => {
        modeManager.setMode(OperationalMode.REVIEW);
        const result = await modeManager.requireApproval('Test Action');
        expect(result).toBe(false);
    });
});
