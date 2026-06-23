import { createActivityLog } from '../firebase/firestore';
import type { ActivityLogEntry } from '../types/meal';

export type ActivityType = ActivityLogEntry['action'];

export interface ActivityLogData {
  householdId: string;
  action: ActivityType;
  details: string;
  performedBy: string;
  displayName: string;
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    await createActivityLog(data.householdId, {
      date: new Date().toISOString().split('T')[0],
      action: data.action,
      performedBy: data.performedBy,
      displayName: data.displayName,
      details: data.details,
    });
  } catch (e) {
    console.error('Failed to create activity log:', e);
  }
}
