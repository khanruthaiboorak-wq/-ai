/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Headphones,
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import { UserProfile, FarmPlot, Language } from '../types/index.ts';
import { FertilizerSchedule } from '../utils/fertilizer-rules.ts';
import { getTranslation } from '../translations/i18n.ts';
import WeatherForecastCard from './WeatherForecastCard.tsx';

interface HomeDashboardProps {
  userProfile: UserProfile;
  plots: FarmPlot[];
  schedules: FertilizerSchedule[];
  bookmarkedCount: number;
  onNavigate: (tab: string) => void;
  language: Language;
}

export default function HomeDashboard({
  userProfile,
  plots,
  schedules,
  bookmarkedCount,
  onNavigate,
  language,
}: HomeDashboardProps) {
  const t = getTranslation(language);

  const dueOrOverdueTasks = schedules.filter(
    (s) => s.status === 'due' || s.status === 'overdue'
  );

  const completedCount = schedules.filter((s) => s.status === 'completed').length;

  // Contextual tips based on user's crops and problems
  const userCrops = userProfile.farming_types || [];
  const userProblems = userProfile.soil_problems || [];

  const mainMenus = [
    {
      id: 'ai',
      title: t.menu_ai_title,
      desc: t.menu_ai_desc,
      icon: Sparkles,
      color: 'bg-emerald-800 text-white',
      badge: 'แนะนำ',
      border: 'border-emerald-700',
    },
    {
      id: 'knowledge',
      title: t.menu_knowledge_title,
      desc: t.menu_knowledge_desc,
      icon: BookOpen,
      color: 'bg-[#7F4F24] text-white',
      badge: 'ออฟไลน์ได้',
      border: 'border-[#7F4F24]',
    },
    {
      id: 'calendar',
      title: t.menu_calendar_title,
      desc: t.menu_calendar_desc,
      icon: Calendar,
      color: 'bg-[#2D6A4F] text-white',
      badge: dueOrOverdueTasks.length > 0 ? `${dueOrOverdueTasks.length} รายการ` : 'ระบบเตือน',
      border: 'border-[#2D6A4F]',
    },
    {
      id: 'plots',
      title: t.menu_plots_title,
      desc: t.menu_plots_desc,
      icon: Layers,
      color: 'bg-[#582F0E] text-white',
      badge: `${plots.length} แปลง`,
      border: 'border-[#582F0E]',
    },
    {
      id: 'admin',
      title: t.menu_admin_title,
      desc: t.menu_admin_desc,
      icon: Headphones,
      color: 'bg-[#1B4332] text-white',
      badge: 'สายด่วน 1760',
      border: 'border-[#1B4332]',
    },
    {
      id: 'settings',
      title: t.menu_settings_title,
      desc: t.menu_settings_desc,
      icon: Settings,
      color: 'bg-[#4056A1] text-white',
      badge: 'ปรับขนาดอักษร',
      border: 'border-[#4056A1]',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Warm Personalized Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-white p-6 sm:p-10 shadow-xl border border-emerald-900/30">
        {/* Soft Organic Background Leaf Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <svg width="280" height="280" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C70 30 100 50 100 100 C50 100 30 70 0 50 C30 50 50 30 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <span>คำขวัญ: “ดินดี เกษตรกรยิ้มได้”</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
            {t.greeting_prefix} คุณ{userProfile.display_name}
          </h1>
          <p className="text-base sm:text-xl font-medium text-emerald-100 mt-2 leading-relaxed">
            {t.greeting_sub}
          </p>

          {/* Quick Context Summary */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold text-emerald-200">
            <span className="bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-400/20">
              📍 พื้นที่: {userProfile.location || 'ประเทศไทย'}
            </span>
            <span className="bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-400/20">
              🌱 พืชที่ดูแล: {userCrops.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>

        {/* Quick Stat Pill Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 relative z-10">
          <button
            onClick={() => onNavigate('plots')}
            className="text-left bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl cursor-pointer"
          >
            <div className="text-2xl font-bold font-heading">{plots.length}</div>
            <div className="text-xs text-emerald-200 font-medium">{t.quick_stats_plots}</div>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className={`text-left p-3 rounded-2xl transition-all cursor-pointer ${
              dueOrOverdueTasks.length > 0
                ? 'bg-amber-400/20 border border-amber-300/30'
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <div className="text-2xl font-bold font-heading text-amber-200">
              {dueOrOverdueTasks.length}
            </div>
            <div className="text-xs text-amber-100 font-medium">{t.quick_stats_due}</div>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="text-left bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl cursor-pointer"
          >
            <div className="text-2xl font-bold font-heading text-emerald-300">
              {completedCount}
            </div>
            <div className="text-xs text-emerald-200 font-medium">{t.status_task_completed}</div>
          </button>

          <button
            onClick={() => onNavigate('knowledge')}
            className="text-left bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl cursor-pointer"
          >
            <div className="text-2xl font-bold font-heading">{bookmarkedCount}</div>
            <div className="text-xs text-emerald-200 font-medium">{t.quick_stats_saved_articles}</div>
          </button>
        </div>
      </div>

      {/* Due / Overdue Alert Banner if tasks exist */}
      {dueOrOverdueTasks.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm sm:text-base font-heading">
                แจ้งเตือนรอบใส่ปุ๋ย: ถึงกำหนด {dueOrOverdueTasks.length} รายการ
              </div>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                รายการ: {dueOrOverdueTasks[0].fertilizer_name} ({dueOrOverdueTasks[0].plot_name}) - กำหนดใส่ {dueOrOverdueTasks[0].application_date}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>ดูปฏิทินใส่ปุ๋ย</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Local Weather Forecast & Fertilizer Advisory Card */}
      <WeatherForecastCard
        userProfile={userProfile}
        schedules={schedules}
        onNavigate={onNavigate}
        language={language}
      />

      {/* 6 Primary Application Menus (Specified in User Prompt Section 4) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2">
            <span>เมนูหลัก 6 ส่วน</span>
          </h2>
          <span className="text-xs font-semibold text-[#7A7264]">
            เข้าถึงได้รวดเร็วทุกฟังก์ชัน
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {mainMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                onClick={() => onNavigate(menu.id)}
                className="group relative text-left bg-white hover:bg-[#FDFBF7] p-5 sm:p-6 rounded-3xl border border-[#E5DFD4] hover:border-[#1B4332]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-md ${menu.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F4EFE6] text-[#554E44] border border-[#DDD5C5]">
                      {menu.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1B4332] font-heading group-hover:text-[#2D6A4F] transition-colors">
                    {idx + 1}. {menu.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6C655A] mt-1.5 leading-relaxed">
                    {menu.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs font-bold text-[#2D6A4F] group-hover:translate-x-1 transition-transform">
                  <span>เปิดใช้งาน</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Soil Care Advice Section */}
      <div className="bg-[#FAF7F0] p-6 rounded-3xl border border-[#E8E2D5]">
        <div className="flex items-center gap-2.5 text-[#7F4F24] font-bold text-sm sm:text-base font-heading mb-3">
          <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
          <span>{t.tips_title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EBE4D8]">
            <div className="text-xs font-bold text-[#1B4332] mb-1 flex items-center gap-1.5">
              <span>🌾</span>
              <span>คำแนะนำสำหรับ {userCrops[0] || 'พืชในแปลงของคุณ'}</span>
            </div>
            <p className="text-xs text-[#5C5549] leading-relaxed">
              ใส่ปุ๋ยตามแนวทรงพุ่มด้านนอกขณะที่ดินมีความชื้นสม่ำเสมอ หลีกเลี่ยงการใส่ปุ๋ยกองชิดโคนต้น และเสริมอินทรียวัตถุอย่างน้อยปีละ 1-2 ครั้งเพื่อช่วยดูดซับธาตุอาหาร
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EBE4D8]">
            <div className="text-xs font-bold text-[#7F4F24] mb-1 flex items-center gap-1.5">
              <span>🧪</span>
              <span>การรับมือ {userProblems[0] || 'การปรับโครงสร้างดิน'}</span>
            </div>
            <p className="text-xs text-[#5C5549] leading-relaxed">
              หากดินเป็นกรด (pH ต่ำกว่า 5.5) ควรหว่านโดโลไมท์ปรับสภาพล่วงหน้า 10-15 วันก่อนใส่ปุ๋ยเคมี ห้ามใส่พร้อมปุ๋ยยูเรียวันเดียวกันเด็ดขาด
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
