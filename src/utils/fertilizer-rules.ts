/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'scheduled' | 'due' | 'overdue' | 'completed' | 'postponed' | 'cancelled';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued_offline';

export interface FertilizerSchedule {
  schedule_id: string;
  user_id?: string;
  farmer_name?: string;
  plot_id: string;
  plot_name?: string;
  fertilizer_name: string;
  application_date: string; // ISO 8601 YYYY-MM-DD
  quantity: number;
  unit: string;
  reminder_at: string; // ISO 8601 YYYY-MM-DD or full timestamp
  completed_at?: string | null;
  status: TaskStatus;
  notification_status: NotificationStatus;
  notes?: string;
}

/**
 * Calculates reminder date in ISO string format (YYYY-MM-DD).
 * For example: applicationDate = "2026-05-13", daysOffset = 7 -> "2026-05-20"
 * Or advance reminder: applicationDate = "2026-05-13", daysOffset = -2 -> "2026-05-11"
 */
export function calculateReminderDate(applicationDateIso: string, daysOffset: number): string {
  const parts = applicationDateIso.split('T')[0].split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const targetDate = new Date(Date.UTC(year, month, day));
  targetDate.setUTCDate(targetDate.getUTCDate() + daysOffset);

  const y = targetDate.getUTCFullYear();
  const m = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Derives current dynamic task status based on application date and completion state.
 */
export function deriveTaskStatus(
  task: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'>,
  todayIso: string
): TaskStatus {
  // If explicitly completed or cancelled, respect that terminal state
  if (task.status === 'completed' || task.status === 'cancelled') {
    return task.status;
  }

  const appDay = task.application_date.split('T')[0];
  const currentDay = todayIso.split('T')[0];

  if (currentDay < appDay) {
    return task.status === 'postponed' ? 'postponed' : 'scheduled';
  } else if (currentDay === appDay) {
    return 'due';
  } else {
    return 'overdue';
  }
}

/**
 * Postpones an existing task and recalculates reminder date.
 */
export function postponeTask(
  task: FertilizerSchedule,
  newApplicationDateIso: string,
  reminderDaysAhead = 1
): FertilizerSchedule {
  const newReminder = calculateReminderDate(newApplicationDateIso, -reminderDaysAhead);
  return {
    ...task,
    application_date: newApplicationDateIso,
    reminder_at: newReminder,
    status: 'postponed',
    notification_status: 'pending',
  };
}

/**
 * Marks task completed with timestamp and sets notification_status to delivered/read.
 */
export function completeTask(
  task: FertilizerSchedule,
  completedAtIso = new Date().toISOString()
): FertilizerSchedule {
  return {
    ...task,
    status: 'completed',
    completed_at: completedAtIso,
  };
}

/**
 * Soil Science Formula (Bioscience):
 * Calculate agricultural lime / dolomite required for acid soil neutralization.
 * Based on Department of Land Development Thailand (กรมพัฒนาที่ดิน).
 * Target pH for most tropical crops is 6.0 - 6.5.
 */
export function calculateLimeRequirement(
  currentPh: number,
  targetPh = 6.2,
  soilTexture: 'sand' | 'loam' | 'clay' = 'loam',
  areaRai = 1
): {
  needsTreatment: boolean;
  deltaPh: number;
  limeKgTotal: number;
  dolomiteKgTotal: number;
  scientificExplanation: string;
} {
  const delta = Math.max(0, targetPh - currentPh);
  if (delta <= 0.2 || currentPh >= 6.0) {
    return {
      needsTreatment: false,
      deltaPh: 0,
      limeKgTotal: 0,
      dolomiteKgTotal: 0,
      scientificExplanation: 'ค่าความเป็นกรด-ด่าง (pH) อยู่ในเกณฑ์เหมาะสมสำหรับพืชส่วนใหญ่ ไม่จำเป็นต้องใส่ปูนปรับสภาพดิน',
    };
  }

  // Base kg per rai per 0.5 pH difference
  let bufferMultiplier = 100; // Loam
  if (soilTexture === 'sand') bufferMultiplier = 60;
  if (soilTexture === 'clay') bufferMultiplier = 180;

  const limeKgPerRai = Math.round((delta / 0.5) * bufferMultiplier);
  const totalLime = limeKgPerRai * areaRai;
  // Dolomite CaMg(CO3)2 provides magnesium alongside calcium
  const totalDolomite = Math.round(totalLime * 1.15);

  return {
    needsTreatment: true,
    deltaPh: Number(delta.toFixed(2)),
    limeKgTotal: totalLime,
    dolomiteKgTotal: totalDolomite,
    scientificExplanation: `ดินเนื้อ${soilTexture === 'clay' ? 'เหนียว (ความจุแลกเปลี่ยนประจุบวกสูง)' : soilTexture === 'sand' ? 'ทราย (บัฟเฟอร์ต่ำ)' : 'ร่วน'} ต้องการปูนเพื่อจับไฮโดรเจนอิออน (H+) โดยใช้ปูนมาร์ลหรือโดโลไมท์หว่านก่อนปลูก 10-15 วัน`,
  };
}

/**
 * Merges offline queued records preventing duplicate identifiers.
 */
export function mergeOfflineItems<T extends { [key: string]: any }>(
  existing: T[],
  incoming: T[],
  idKey: keyof T
): T[] {
  const map = new Map<any, T>();
  for (const item of existing) {
    map.set(item[idKey], item);
  }
  for (const item of incoming) {
    map.set(item[idKey], item);
  }
  return Array.from(map.values());
}
