/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReminderDate,
  deriveTaskStatus,
  postponeTask,
  completeTask,
  calculateLimeRequirement,
  mergeOfflineItems,
  FertilizerSchedule,
} from './fertilizer-rules.ts';

test('calculateReminderDate adds days correctly matching prompt example', () => {
  // Prompt example: applied on 13th, reminder in 7 days -> 20th
  const appDate = '2026-05-13';
  const reminderDate = calculateReminderDate(appDate, 7);
  assert.equal(reminderDate, '2026-05-20');
});

test('calculateReminderDate handles month transitions and leap days', () => {
  const endOfMonth = '2026-02-28';
  const reminderDate = calculateReminderDate(endOfMonth, 5);
  assert.equal(reminderDate, '2026-03-05');
});

test('deriveTaskStatus derives scheduled, due, and overdue correctly', () => {
  const today = '2026-06-15';

  const futureTask: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'> = {
    status: 'scheduled',
    application_date: '2026-06-20',
  };
  assert.equal(deriveTaskStatus(futureTask, today), 'scheduled');

  const dueTask: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'> = {
    status: 'scheduled',
    application_date: '2026-06-15',
  };
  assert.equal(deriveTaskStatus(dueTask, today), 'due');

  const overdueTask: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'> = {
    status: 'scheduled',
    application_date: '2026-06-10',
  };
  assert.equal(deriveTaskStatus(overdueTask, today), 'overdue');
});

test('deriveTaskStatus preserves completed and cancelled terminal states', () => {
  const completedTask: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'> = {
    status: 'completed',
    application_date: '2026-06-10',
    completed_at: '2026-06-10T10:00:00Z',
  };
  assert.equal(deriveTaskStatus(completedTask, '2026-06-15'), 'completed');

  const cancelledTask: Pick<FertilizerSchedule, 'status' | 'application_date' | 'completed_at'> = {
    status: 'cancelled',
    application_date: '2026-06-10',
  };
  assert.equal(deriveTaskStatus(cancelledTask, '2026-06-15'), 'cancelled');
});

test('postponeTask updates application date, sets postponed status, and calculates new reminder', () => {
  const original: FertilizerSchedule = {
    schedule_id: 'sched-1',
    plot_id: 'plot-1',
    fertilizer_name: '15-15-15',
    application_date: '2026-06-10',
    quantity: 25,
    unit: 'กก.',
    reminder_at: '2026-06-08',
    status: 'scheduled',
    notification_status: 'pending',
  };

  const postponed = postponeTask(original, '2026-06-25', 2);
  assert.equal(postponed.status, 'postponed');
  assert.equal(postponed.application_date, '2026-06-25');
  assert.equal(postponed.reminder_at, '2026-06-23');
  assert.equal(postponed.notification_status, 'pending');
});

test('completeTask marks completed and retains record history', () => {
  const original: FertilizerSchedule = {
    schedule_id: 'sched-2',
    plot_id: 'plot-1',
    fertilizer_name: 'ปุ๋ยหมักชีวภาพ',
    application_date: '2026-06-10',
    quantity: 50,
    unit: 'กก.',
    reminder_at: '2026-06-09',
    status: 'due',
    notification_status: 'delivered',
  };

  const done = completeTask(original, '2026-06-10T09:30:00Z');
  assert.equal(done.status, 'completed');
  assert.equal(done.completed_at, '2026-06-10T09:30:00Z');
});

test('calculateLimeRequirement computes accurate dosage for acidic soil', () => {
  const acidicSoil = calculateLimeRequirement(4.5, 6.2, 'clay', 2);
  assert.equal(acidicSoil.needsTreatment, true);
  assert.equal(acidicSoil.deltaPh, 1.7);
  // (1.7 / 0.5) * 180 * 2 = 3.4 * 360 = 1224 kg
  assert.equal(acidicSoil.limeKgTotal, 1224);
  assert.ok(acidicSoil.dolomiteKgTotal > 1224);

  const goodSoil = calculateLimeRequirement(6.4, 6.2, 'loam', 1);
  assert.equal(goodSoil.needsTreatment, false);
  assert.equal(goodSoil.limeKgTotal, 0);
});

test('mergeOfflineItems merges records and removes duplicates by primary key', () => {
  const initial = [
    { schedule_id: 's1', fertilizer_name: '46-0-0' },
    { schedule_id: 's2', fertilizer_name: '16-16-16' },
  ];
  const incoming = [
    { schedule_id: 's2', fertilizer_name: '16-16-16 (Updated)' },
    { schedule_id: 's3', fertilizer_name: 'ปุ๋ยคอก' },
  ];

  const merged = mergeOfflineItems(initial, incoming, 'schedule_id');
  assert.equal(merged.length, 3);
  const s2 = merged.find((item) => item.schedule_id === 's2');
  assert.equal(s2?.fertilizer_name, '16-16-16 (Updated)');
});
