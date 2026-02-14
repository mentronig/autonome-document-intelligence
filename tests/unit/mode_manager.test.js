"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mode_manager_1 = require("../../agent-core/src/engine/mode-manager");
describe('ModeManager', () => {
    let modeManager;
    beforeEach(() => {
        modeManager = new mode_manager_1.ModeManager();
    });
    test('should default to REVIEW mode', () => {
        expect(modeManager.getMode()).toBe(mode_manager_1.OperationalMode.REVIEW);
    });
    test('should allow switching mode', () => {
        modeManager.setMode(mode_manager_1.OperationalMode.MAD_DOG);
        expect(modeManager.getMode()).toBe(mode_manager_1.OperationalMode.MAD_DOG);
    });
    test('should auto-approve in MAD_DOG mode', async () => {
        modeManager.setMode(mode_manager_1.OperationalMode.MAD_DOG);
        const result = await modeManager.requireApproval('Test Action');
        expect(result).toBe(true);
    });
    test('should NOT auto-approve in REVIEW mode', async () => {
        modeManager.setMode(mode_manager_1.OperationalMode.REVIEW);
        const result = await modeManager.requireApproval('Test Action');
        expect(result).toBe(false);
    });
});
