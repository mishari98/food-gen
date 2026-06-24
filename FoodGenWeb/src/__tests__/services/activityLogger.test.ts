import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logActivity } from '../../services/activityLogger';

// Mock the firestore module
vi.mock('../../firebase/firestore', () => ({
  createActivityLog: vi.fn(),
}));

describe('activityLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createActivityLog with formatted data', async () => {
    const { createActivityLog } = await import('../../firebase/firestore');

    await logActivity({
      householdId: 'household1',
      action: 'created',
      details: 'Generated 3 meals for 2026-06-24',
      performedBy: 'user1',
      displayName: 'Juan',
    });

    expect(createActivityLog).toHaveBeenCalledWith('household1', {
      date: '2026-06-24',
      action: 'created',
      performedBy: 'user1',
      displayName: 'Juan',
      details: 'Generated 3 meals for 2026-06-24',
    });
  });

  it('handles errors gracefully without throwing', async () => {
    const { createActivityLog } = await import('../../firebase/firestore');
    (createActivityLog as any).mockRejectedValue(new Error('Firestore error'));

    // Should not throw
    await expect(
      logActivity({
        householdId: 'household1',
        action: 'manual_edit',
        details: 'Test',
        performedBy: 'user1',
        displayName: 'Juan',
      })
    ).resolves.toBeUndefined();
  });

  it('formats date correctly as YYYY-MM-DD', async () => {
    const { createActivityLog } = await import('../../firebase/firestore');

    await logActivity({
      householdId: 'h1',
      action: 'status_updated',
      details: 'Test',
      performedBy: 'u1',
      displayName: 'Name',
    });

    const callArg = (createActivityLog as any).mock.calls[0][1];
    // Date pattern: YYYY-MM-DD
    expect(callArg.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});