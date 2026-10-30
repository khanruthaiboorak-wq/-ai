/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  ChevronRight,
  Filter,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { FarmPlot, Language } from '../types/index.ts';
import {
  FertilizerSchedule,
  TaskStatus,
  NotificationStatus,
  calculateReminderDate,
  postponeTask,
  completeTask,
} from '../utils/fertilizer-rules.ts';
import { getTranslation } from '../translations/i18n.ts';

interface FertilizerCalendarProps {
  schedules: FertilizerSchedule[];
  plots: FarmPlot[];
  onAddSchedule: (schedule: FertilizerSchedule) => void;
  onUpdateSchedule: (schedule: FertilizerSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  language: Language;
}

export default function FertilizerCalendar({
  schedules,
  plots,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  language,
}: FertilizerCalendarProps) {
  const t = getTranslation(language);

  const [filter, setFilter] = useState<'all' | 'due' | 'completed'>('all');
  const [selectedPlotFilter, setSelectedPlotFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<FertilizerSchedule | null>(null);

  // Form states for Add/Edit
  const [formPlotId, setFormPlotId] = useState(plots[0]?.plot_id || '');
  const [formFertilizerName, setFormFertilizerName] = useState('');
  const [formAppDate, setFormAppDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [formQuantity, setFormQuantity] = useState('25');
  const [formUnit, setFormUnit] = useState('กก.');
  const [formReminderOffset, setFormReminderOffset] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  // Postpone state
  const [postponeNewDate, setPostponeNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Calculate dynamic reminder date preview
  const calculatedReminderDate = calculateReminderDate(formAppDate, formReminderOffset);

  const filteredList = schedules.filter((item) => {
    if (selectedPlotFilter !== 'all' && item.plot_id !== selectedPlotFilter) {
      return false;
    }
    if (filter === 'due') {
      return item.status === 'due' || item.status === 'overdue';
    }
    if (filter === 'completed') {
      return item.status === 'completed';
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setActiveSchedule(null);
    setFormPlotId(plots[0]?.plot_id || '');
    setFormFertilizerName('');
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setFormAppDate(today);
    setFormQuantity('25');
    setFormUnit('กก.');
    setFormReminderOffset(0);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FertilizerSchedule) => {
    setActiveSchedule(item);
    setFormPlotId(item.plot_id);
    setFormFertilizerName(item.fertilizer_name);
    setFormAppDate(item.application_date);
    setFormQuantity(String(item.quantity));
    setFormUnit(item.unit);
    setFormReminderOffset(0);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenPlot = plots.find((p) => p.plot_id === formPlotId);
    const plotName = chosenPlot?.plot_name || 'แปลงเกษตร';

    const newSchedule: FertilizerSchedule = {
      schedule_id: activeSchedule?.schedule_id || `sched-${Date.now()}`,
      plot_id: formPlotId,
      plot_name: plotName,
      fertilizer_name: formFertilizerName.trim() || 'ปุ๋ยบำรุงดิน',
      application_date: formAppDate,
      quantity: parseFloat(formQuantity) || 1,
      unit: formUnit,
      reminder_at: calculatedReminderDate,
      status: activeSchedule?.status || 'scheduled',
      notification_status: activeSchedule?.notification_status || 'pending',
      notes: formNotes.trim(),
    };

    if (activeSchedule) {
      onUpdateSchedule(newSchedule);
    } else {
      onAddSchedule(newSchedule);
    }
    setIsModalOpen(false);
  };

  const handleCompleteTask = (schedule: FertilizerSchedule) => {
    const updated = completeTask(schedule);
    onUpdateSchedule(updated);
  };

  const handleConfirmPostpone = () => {
    if (!activeSchedule) return;
    const updated = postponeTask(activeSchedule, postponeNewDate, 1);
    onUpdateSchedule(updated);
    setIsPostponeModalOpen(false);
    setActiveSchedule(null);
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: t.status_task_completed,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
        };
      case 'due':
        return {
          label: t.status_task_due,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 animate-ping',
        };
      case 'overdue':
        return {
          label: t.status_task_overdue,
          bg: 'bg-red-100 text-red-900 border-red-300',
          dot: 'bg-red-600',
        };
      case 'postponed':
        return {
          label: t.status_task_postponed,
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          dot: 'bg-orange-500',
        };
      case 'cancelled':
        return {
          label: t.status_task_cancelled,
          bg: 'bg-gray-100 text-gray-700 border-gray-300',
          dot: 'bg-gray-400',
        };
      case 'scheduled':
      default:
        return {
          label: t.status_task_scheduled,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
    }
  };

  const getNotificationStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
        return { label: t.status_notif_delivered, color: 'text-emerald-700' };
      case 'read':
        return { label: t.status_notif_read, color: 'text-emerald-800' };
      case 'sent':
        return { label: t.status_notif_sent, color: 'text-blue-700' };
      case 'queued_offline':
        return { label: t.status_notif_queued_offline, color: 'text-amber-700' };
      case 'failed':
        return { label: t.status_notif_failed, color: 'text-red-700' };
      case 'pending':
      default:
        return { label: t.status_notif_pending, color: 'text-slate-600' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-[#2D6A4F]" />
            <span>{t.cal_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
            แยกสถานะงานใส่ปุ๋ยและสถานะแจ้งเตือนชัดเจน พร้อมคำนวณวันเตือนอัตโนมัติ
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{t.cal_add_button}</span>
        </button>
      </div>

      {/* Safety Checklist Banner */}
      <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-3xl border border-[#E8E2D5]">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7F4F24] font-heading mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>{t.cal_checklist_title}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-[#5C5549]">
          <div className="bg-white p-3 rounded-xl border border-[#EBE4D8] flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{t.cal_checklist_1}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#EBE4D8] flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{t.cal_checklist_2}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#EBE4D8] flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{t.cal_checklist_3}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5DFD4]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'bg-[#F4EFE6] text-[#4A453E] hover:bg-[#EBE5D8]'
            }`}
          >
            {t.cal_filter_all} ({schedules.length})
          </button>
          <button
            onClick={() => setFilter('due')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'due'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-[#F4EFE6] text-[#4A453E] hover:bg-[#EBE5D8]'
            }`}
          >
            {t.cal_filter_due}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-[#F4EFE6] text-[#4A453E] hover:bg-[#EBE5D8]'
            }`}
          >
            {t.cal_filter_done}
          </button>
        </div>

        {/* Plot Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#7A7264]" />
          <select
            value={selectedPlotFilter}
            onChange={(e) => setSelectedPlotFilter(e.target.value)}
            className="bg-[#F4EFE6] border border-[#DDD5C5] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1B4332] cursor-pointer focus:outline-hidden"
          >
            <option value="all">ทุกแปลงเกษตร</option>
            {plots.map((p) => (
              <option key={p.plot_id} value={p.plot_id}>
                {p.plot_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DFD4] p-6">
            <CalendarDays className="w-12 h-12 text-[#9E9585] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1B4332] font-heading">
              ไม่พบรายการใส่ปุ๋ยในหมวดนี้
            </h3>
            <p className="text-xs text-[#7A7264] mt-1">
              กดปุ่ม &quot;เพิ่มรายการใส่ปุ๋ยใหม่&quot; ด้านบนเพื่อบันทึกและตั้งค่าการแจ้งเตือน
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const taskBadge = getTaskStatusBadge(item.status);
            const notifBadge = getNotificationStatusBadge(item.notification_status);
            const isDone = item.status === 'completed';

            return (
              <div
                key={item.schedule_id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  item.status === 'due'
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
                    : item.status === 'overdue'
                    ? 'border-red-300 shadow-xs'
                    : 'border-[#E5DFD4] shadow-xs hover:border-[#1B4332]/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Plot Name badge */}
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B4332] border border-emerald-200">
                        🌱 {item.plot_name || 'แปลงเกษตร'}
                      </span>

                      {/* Task Status badge (Section 9.1) */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${taskBadge.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${taskBadge.dot}`} />
                        <span>สถานะงาน: {taskBadge.label}</span>
                      </span>

                      {/* Notification Status badge (Section 9.2) */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4EFE6] border border-[#DDD5C5] ${notifBadge.color}`}
                      >
                        🔔 แจ้งเตือน: {notifBadge.label}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1B4332] font-heading">
                      {item.fertilizer_name}
                    </h3>

                    {/* Timeline dates and quantity */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#5C5549] pt-1">
                      <div>
                        <span className="text-[#8C8476] block">วันกำหนดใส่:</span>
                        <span className="font-bold text-[#242220]">{item.application_date}</span>
                      </div>
                      <div>
                        <span className="text-[#8C8476] block">ปริมาณ:</span>
                        <span className="font-bold text-[#242220]">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8476] block">วันเตือนระบบ:</span>
                        <span className="font-bold text-[#7F4F24]">{item.reminder_at}</span>
                      </div>
                    </div>

                    {item.completed_at && (
                      <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>ยืนยันใส่ปุ๋ยจริงเมื่อ: {new Date(item.completed_at).toLocaleString('th-TH')}</span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs text-[#6C655A] bg-[#FAF7F0] p-2.5 rounded-xl border border-[#EDE7DD]">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F2ECE1]">
                    {!isDone && (
                      <>
                        <button
                          onClick={() => handleCompleteTask(item)}
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.cal_action_complete}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveSchedule(item);
                            setIsPostponeModalOpen(true);
                          }}
                          className="px-3.5 py-2.5 bg-[#FAF7F0] hover:bg-[#F0EAE0] text-[#7F4F24] border border-[#DDD5C5] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.cal_action_postpone}</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2.5 text-[#5C5549] hover:bg-[#F4EFE6] rounded-xl cursor-pointer"
                      title={t.cal_action_edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบรายการใส่ปุ๋ยนี้ใช่หรือไม่?')) {
                          onDeleteSchedule(item.schedule_id);
                        }
                      }}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      title={t.cal_action_delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add or Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FBF9F4] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2DBD0] overflow-hidden my-auto animate-in zoom-in-95">
            <form onSubmit={handleSaveSchedule} className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <h3 className="text-xl font-bold text-[#1B4332] font-heading flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#2D6A4F]" />
                  <span>{activeSchedule ? 'แก้ไขรายการใส่ปุ๋ย' : t.cal_modal_title}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-semibold text-[#7A7264] hover:text-[#242220] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Plot Select */}
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  {t.cal_field_plot}
                </label>
                <select
                  value={formPlotId}
                  onChange={(e) => setFormPlotId(e.target.value)}
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F]"
                >
                  {plots.map((p) => (
                    <option key={p.plot_id} value={p.plot_id}>
                      {p.plot_name} ({p.crop_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fertilizer Name */}
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  {t.cal_field_fert_name}
                </label>
                <input
                  type="text"
                  required
                  value={formFertilizerName}
                  onChange={(e) => setFormFertilizerName(e.target.value)}
                  placeholder={t.cal_field_fert_name_placeholder}
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              {/* Date & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    {t.cal_field_date}
                  </label>
                  <input
                    type="date"
                    required
                    value={formAppDate}
                    onChange={(e) => setFormAppDate(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-sm font-medium text-[#242220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    {t.cal_field_quantity}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-sm font-medium text-[#242220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    หน่วย
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-sm font-medium text-[#242220]"
                  >
                    <option value="กก.">กก.</option>
                    <option value="ลิตร">ลิตร</option>
                    <option value="กระสอบ">กระสอบ</option>
                    <option value="ตัน">ตัน</option>
                  </select>
                </div>
              </div>

              {/* Automatic Reminder Offset Calculation (Prompt Section 8 requirement) */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E8E2D5] space-y-2">
                <label className="block text-xs font-bold text-[#7F4F24]">
                  {t.cal_field_reminder_offset}
                </label>
                <select
                  value={formReminderOffset}
                  onChange={(e) => setFormReminderOffset(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                >
                  <option value={0}>{t.cal_offset_same_day}</option>
                  <option value={-1}>{t.cal_offset_1_day_before}</option>
                  <option value={-2}>{t.cal_offset_2_days_before}</option>
                  <option value={7}>{t.cal_offset_7_days_after}</option>
                  <option value={14}>{t.cal_offset_14_days_after}</option>
                  <option value={30}>{t.cal_offset_30_days_after}</option>
                </select>

                <div className="text-xs text-[#1B4332] font-semibold flex items-center justify-between pt-1">
                  <span>{t.cal_calculated_reminder_label}</span>
                  <span className="font-extrabold font-heading text-sm text-[#2D6A4F] bg-white px-2.5 py-0.5 rounded-lg border border-[#DDD5C5]">
                    {calculatedReminderDate}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  {t.cal_notes_label}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น หว่านรอบทรงพุ่ม, รดน้ำตามทันที, ตรวจความชื้นดินก่อนใส่"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2 text-xs font-medium text-[#242220]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D5CDC0] text-[#554E44] text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Postpone Task */}
      {isPostponeModalOpen && activeSchedule && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#FBF9F4] w-full max-w-md rounded-3xl shadow-2xl border border-[#E2DBD0] p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#7F4F24] font-heading flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>เลื่อนกำหนดการใส่ปุ๋ย</span>
            </h3>

            <p className="text-xs text-[#5C5549]">
              เลื่อนกำหนดสำหรับรายการ: <span className="font-bold">{activeSchedule.fertilizer_name}</span> ({activeSchedule.plot_name})
            </p>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                ระบุวันที่กำหนดใส่ใหม่:
              </label>
              <input
                type="date"
                required
                value={postponeNewDate}
                onChange={(e) => setPostponeNewDate(e.target.value)}
                className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#242220]"
              />
            </div>

            <p className="text-[11px] text-[#7A7264]">
              ระบบจะคำนวณวันแจ้งเตือนใหม่ล่วงหน้า 1 วัน และเปลี่ยนสถานะงานเป็น &quot;เลื่อนกำหนด&quot; อัตโนมัติ
            </p>

            <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPostponeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D5CDC0] text-xs font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmPostpone}
                className="px-5 py-2 bg-[#7F4F24] hover:bg-[#582F0E] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                ยืนยันการเลื่อน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
