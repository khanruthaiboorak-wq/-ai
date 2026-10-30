/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Sprout,
  Calendar,
  MessageSquare,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  LogOut,
  Send,
  MapPin,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  FarmPlot,
  AdminMessage,
  Language,
} from '../types/index.ts';
import { FertilizerSchedule } from '../utils/fertilizer-rules.ts';
import { getTranslation } from '../translations/i18n.ts';
import { StorageService } from '../services/storage.ts';

interface OwnerDashboardProps {
  farmers: UserProfile[];
  plots: FarmPlot[];
  schedules: FertilizerSchedule[];
  messages: AdminMessage[];
  onExitOwnerMode: () => void;
  onRefreshData: () => void;
  language: Language;
}

export default function OwnerDashboard({
  farmers,
  plots,
  schedules,
  messages,
  onExitOwnerMode,
  onRefreshData,
  language,
}: OwnerDashboardProps) {
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'plots' | 'schedules' | 'inbox' | 'export'>('overview');
  const [farmerSearch, setFarmerSearch] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  // Inquiries response state
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  // System Stats
  const totalAreaRai = useMemo(() => {
    return plots.reduce((sum, p) => sum + (Number(p.area_rai) || 0), 0);
  }, [plots]);

  const dueTasksCount = useMemo(() => {
    return schedules.filter((s) => s.status === 'due').length;
  }, [schedules]);

  const overdueTasksCount = useMemo(() => {
    return schedules.filter((s) => s.status === 'overdue').length;
  }, [schedules]);

  const unrepliedInquiries = useMemo(() => {
    return messages.filter((m) => m.sender === 'user' && m.status !== 'replied');
  }, [messages]);

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchSearch =
        f.display_name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
        f.location.toLowerCase().includes(farmerSearch.toLowerCase());
      const matchCrop =
        selectedCropFilter === 'all' ||
        f.farming_types.some((crop) => crop.includes(selectedCropFilter));
      return matchSearch && matchCrop;
    });
  }, [farmers, farmerSearch, selectedCropFilter]);

  // Filtered plots
  const filteredPlots = useMemo(() => {
    if (selectedFarmerId) {
      return plots.filter((p) => p.user_id === selectedFarmerId);
    }
    return plots.filter((p) => {
      const matchCrop =
        selectedCropFilter === 'all' || p.crop_type.includes(selectedCropFilter);
      return matchCrop;
    });
  }, [plots, selectedFarmerId, selectedCropFilter]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    let result = schedules;
    if (selectedFarmerId) {
      result = result.filter((s) => s.user_id === selectedFarmerId);
    }
    if (selectedStatusFilter !== 'all') {
      result = result.filter((s) => s.status === selectedStatusFilter);
    }
    return result;
  }, [schedules, selectedFarmerId, selectedStatusFilter]);

  const handleSendOwnerReply = (msgId: string) => {
    if (!replyText.trim()) return;
    StorageService.replyAsOwner(msgId, replyText);
    setReplyText('');
    setReplyTargetId(null);
    setReplySuccessMessage(t.owner_reply_success);
    onRefreshData();
    setTimeout(() => setReplySuccessMessage(null), 3000);
  };

  const handleExportDownload = () => {
    const jsonStr = StorageService.exportSystemData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soil-time-all-farmers-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExportJson = () => {
    const jsonStr = StorageService.exportSystemData();
    navigator.clipboard.writeText(jsonStr);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Exclusive Owner Mode indicator */}
      <div className="bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#7F4F24] text-white p-6 rounded-3xl shadow-lg border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400/20 backdrop-blur-md rounded-2xl border border-amber-300/40 text-2xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-[#1B4332] px-2.5 py-0.5 rounded-full shadow-xs">
                  {t.owner_badge_exclusive}
                </span>
                <span className="text-xs text-amber-200/90 font-medium">
                  เฉพาะเจ้าของระบบผ่านแอปนี้เท่านั้น
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 font-heading">
                {t.owner_title}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {t.owner_subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onExitOwnerMode}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border border-white/20 shadow-xs shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.owner_exit_btn}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Farmers */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7264] mb-1">
            <span>{t.owner_total_farmers}</span>
            <Users className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B4332]">
            {farmers.length}
          </div>
          <div className="text-[11px] text-[#7A7264] mt-1 truncate">
            ครอบคลุมทั่วประเทศ
          </div>
        </div>

        {/* Total Plots */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7264] mb-1">
            <span>{t.owner_total_plots}</span>
            <Sprout className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B4332]">
            {plots.length}
          </div>
          <div className="text-[11px] text-[#7A7264] mt-1">
            แปลงเพาะปลูกในระบบ
          </div>
        </div>

        {/* Total Acreage (Rai) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7264] mb-1">
            <span>{t.owner_total_area}</span>
            <span className="text-xs">🌾</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#7F4F24]">
            {totalAreaRai.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#7A7264] mt-1">
            ไร่ (แปลงที่บันทึกไว้)
          </div>
        </div>

        {/* Fertilizer Tasks & Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7264] mb-1">
            <span>{t.owner_total_tasks}</span>
            <Calendar className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B4332]">
            {schedules.length}
          </div>
          <div className="text-[11px] flex items-center gap-1.5 mt-1 font-semibold">
            {overdueTasksCount > 0 ? (
              <span className="text-rose-700">เกินกำหนด {overdueTasksCount}</span>
            ) : (
              <span className="text-emerald-700">ตามกำหนดทั้งหมด</span>
            )}
          </div>
        </div>

        {/* Unreplied Messages */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7264] mb-1">
            <span>ข้อความรอตอบ</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {unrepliedInquiries.length}
          </div>
          <div className="text-[11px] text-[#7A7264] mt-1">
            คำถามจากเกษตรกร
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-1.5 bg-[#EFE9DF] p-1.5 rounded-2xl border border-[#DDD5C5]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            setSelectedFarmerId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>📊</span>
          <span>{t.owner_tab_overview}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('farmers');
            setSelectedFarmerId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'farmers'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>👨‍🌾</span>
          <span>{t.owner_tab_farmers} ({farmers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plots')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'plots'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>🌾</span>
          <span>{t.owner_tab_plots} ({plots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'schedules'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>📅</span>
          <span>{t.owner_tab_schedules} ({schedules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 relative ${
            activeTab === 'inbox'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>💬</span>
          <span>{t.owner_tab_inbox}</span>
          {unrepliedInquiries.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'export'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#4A453E] hover:bg-white/60'
          }`}
        >
          <span>💾</span>
          <span>{t.owner_tab_export}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {replySuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{replySuccessMessage}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* National Agricultural Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#1B4332] flex items-center gap-2 font-heading">
                <span>🌱</span>
                <span>ประเภทการเกษตรของเกษตรกรในระบบ</span>
              </h2>
              <div className="space-y-2.5">
                {[
                  { name: 'สวนผลไม้ (ทุเรียน, มังคุด, เงาะ)', count: 3, percent: '60%' },
                  { name: 'สวนยางพารา', count: 2, percent: '40%' },
                  { name: 'นาข้าว', count: 1, percent: '20%' },
                  { name: 'พืชไร่ (ข้าวโพด, มันสำปะหลัง)', count: 1, percent: '20%' },
                  { name: 'ผักสวนครัว / ผักอินทรีย์', count: 1, percent: '20%' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#4A453E]">
                      <span>{item.name}</span>
                      <span>{item.count} แปลง ({item.percent})</span>
                    </div>
                    <div className="w-full bg-[#EFE9DF] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2D6A4F] h-full rounded-full transition-all"
                        style={{ width: item.percent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Soil Problems Reported by Farmers */}
            <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#7F4F24] flex items-center gap-2 font-heading">
                <span>🧪</span>
                <span>ปัญหาดินที่เกษตรกรไทยเผชิญมากที่สุด</span>
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs">
                  <div className="font-bold text-amber-900 flex items-center justify-between">
                    <span>1. ดินเปรี้ยวจัด (pH &lt; 5.0)</span>
                    <span className="text-amber-800">40% ของแปลง</span>
                  </div>
                  <p className="text-[#6C655A] mt-1">
                    พบมากในแปลงยางพาราและทุเรียนภาคใต้และภาคตะวันออก แนะนำการเติมโดโลไมท์ 100-200 กก./ไร่
                  </p>
                </div>

                <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-xs">
                  <div className="font-bold text-stone-900 flex items-center justify-between">
                    <span>2. ดินดานแข็ง / ขาดอินทรียวัตถุ</span>
                    <span className="text-stone-800">35% ของแปลง</span>
                  </div>
                  <p className="text-[#6C655A] mt-1">
                    พบในไร่ข้าวโพดและนาข้าว แนะนำการไถกลบตอซัง ปลูกพืชตระกูลถั่วบำรุงดิน
                  </p>
                </div>

                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs">
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>3. น้ำขัง / ระบายน้ำช้า</span>
                    <span className="text-blue-800">25% ของแปลง</span>
                  </div>
                  <p className="text-[#6C655A] mt-1">
                    แนะนำการขุดร่องระบายน้ำรอบแปลง และยกโคกสูง 60-80 ซม. ในไม้ผล
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="bg-[#FAF7F0] p-6 rounded-3xl border border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-[#1B4332] font-heading">
                พร้อมตรวจสอบเกษตรกรทุกคนหรือยัง?
              </div>
              <p className="text-xs sm:text-sm text-[#6C655A] mt-0.5">
                คุณสามารถค้นหา ตรวจสอบแปลง ดูกำหนดการใส่ปุ๋ย และตอบคำถามของเกษตรกรทุกคนได้ในหน้าต่างนี้
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('farmers')}
                className="px-4 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>ดูเกษตรกรทุกคน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>ตอบข้อความเกษตรกร ({unrepliedInquiries.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL FARMERS DIRECTORY */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-3xl border border-[#E5DFD4] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A7264] absolute left-3.5 top-3" />
              <input
                type="text"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder="ค้นหาชื่อเกษตรกร หรือ จังหวัด..."
                className="w-full bg-[#FAF7F0] border border-[#DDD5C5] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#2D2A26] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#7A7264]" />
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="bg-[#FAF7F0] border border-[#DDD5C5] rounded-xl px-3 py-2 text-xs font-bold text-[#1B4332] cursor-pointer focus:outline-hidden w-full sm:w-auto"
              >
                <option value="all">พืชทั้งหมด</option>
                <option value="ยาง">สวนยางพารา</option>
                <option value="ผลไม้">สวนผลไม้ (ทุเรียน/ส้ม)</option>
                <option value="ข้าว">นาข้าว</option>
                <option value="พืชไร่">พืชไร่</option>
              </select>
            </div>
          </div>

          {/* Farmers List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFarmers.map((farmer) => {
              const farmerPlots = plots.filter((p) => p.user_id === farmer.user_id);
              const farmerSchedules = schedules.filter((s) => s.user_id === farmer.user_id);
              const farmerArea = farmerPlots.reduce((sum, p) => sum + (Number(p.area_rai) || 0), 0);

              return (
                <div
                  key={farmer.user_id}
                  className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-3 hover:border-[#1B4332]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#1B4332] font-bold text-sm flex items-center justify-center border border-emerald-300">
                          {farmer.display_name.charAt(0) || 'ก'}
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-[#1B4332] font-heading">
                            {farmer.display_name}
                          </h3>
                          <div className="text-xs text-[#7A7264] flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                            <span>{farmer.location || 'ประเทศไทย'}</span>
                            <span>•</span>
                            <span>อายุ {farmer.age} ปี</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#7F4F24] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {farmerPlots.length} แปลง ({farmerArea} ไร่)
                      </span>
                    </div>
                  </div>

                  {/* Crops */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {farmer.farming_types.map((crop, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-[#FAF7F0] text-[#4A453E] px-2.5 py-1 rounded-md border border-[#E5DFD4]"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>

                  {/* Soil Issues */}
                  <div className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#EFEAE1] text-xs">
                    <span className="font-bold text-[#7F4F24]">ปัญหาดินที่ระบุ:</span>{' '}
                    <span className="text-[#5C5549]">{farmer.soil_problems.join(', ')}</span>
                  </div>

                  {/* Quick inspect button */}
                  <div className="pt-1 flex items-center justify-between border-t border-[#F2ECE1]">
                    <span className="text-[11px] text-[#7A7264]">
                      {farmerSchedules.length} แผนใส่ปุ๋ย
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmerId(farmer.user_id);
                        setActiveTab('plots');
                      }}
                      className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
                    >
                      <span>ดูแปลง & ตรวจดิน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALL PLOTS ACROSS THAILAND */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-[#E5DFD4]">
            <div className="text-xs sm:text-sm font-bold text-[#1B4332]">
              {selectedFarmerId ? (
                <div className="flex items-center gap-2">
                  <span>แปลงเกษตรของเกษตรกรที่เลือก</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFarmerId(null)}
                    className="text-xs font-bold text-blue-700 underline cursor-pointer"
                  >
                    (แสดงแปลงทุกคน)
                  </button>
                </div>
              ) : (
                <span>แปลงเกษตรทั้งหมดของทุกคน ({filteredPlots.length} แปลง)</span>
              )}
            </div>

            <div className="text-xs text-[#7A7264]">
              ตรวจสอบค่ากรด-ด่างดิน (pH) ทั่วประเทศ
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlots.map((plot) => {
              const ph = plot.soil_test_results?.ph;
              const isAcidic = ph && ph < 5.5;
              const isOptimal = ph && ph >= 5.5 && ph <= 6.8;

              return (
                <div
                  key={plot.plot_id}
                  className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-[#7F4F24] uppercase tracking-wide">
                        {plot.farmer_name || 'เกษตรกรไทย'} • {plot.farmer_location || 'ประเทศไทย'}
                      </div>
                      <h3 className="text-base font-extrabold text-[#1B4332] font-heading mt-0.5">
                        {plot.plot_name}
                      </h3>
                      <div className="text-xs text-[#5C5549] mt-0.5">
                        {plot.crop_type} • {plot.area_rai} ไร่
                      </div>
                    </div>

                    {ph && (
                      <div
                        className={`px-3 py-1.5 rounded-xl text-center border font-bold text-xs ${
                          isAcidic
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : isOptimal
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold">pH ดิน</div>
                        <div className="text-sm">{ph.toFixed(1)}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#EFEAE1] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#7A7264]">เนื้อดิน:</span>
                      <span className="font-semibold text-[#2D2A26]">{plot.soil_type}</span>
                    </div>
                    {plot.soil_test_results?.laboratory_name && (
                      <div className="flex justify-between">
                        <span className="text-[#7A7264]">หน่วยงานตรวจ:</span>
                        <span className="font-semibold text-[#1B4332] truncate max-w-[150px]">
                          {plot.soil_test_results.laboratory_name}
                        </span>
                      </div>
                    )}
                    {plot.notes && (
                      <div className="pt-1 text-[11px] text-[#6C655A] border-t border-[#EFEAE1]">
                        {plot.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ALL FERTILIZER SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="bg-white p-4 rounded-3xl border border-[#E5DFD4] shadow-xs flex flex-wrap gap-2 items-center justify-between">
            <div className="text-xs sm:text-sm font-bold text-[#1B4332]">
              ปฏิทินและภารกิจการใส่ปุ๋ยของเกษตรกรทุกคน ({filteredSchedules.length} รายการ)
            </div>

            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'due', label: 'ต้องใส่ปุ๋ยวันนี้' },
                { id: 'overdue', label: 'เกินกำหนด' },
                { id: 'scheduled', label: 'ตามแผนล่วงหน้า' },
                { id: 'completed', label: 'ใส่แล้ว' },
              ].map((btn) => (
                <button
                  type="button"
                  key={btn.id}
                  onClick={() => setSelectedStatusFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    selectedStatusFilter === btn.id
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-[#FAF7F0] text-[#4A453E] hover:bg-[#EFE9DF]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedules Table / Cards */}
          <div className="space-y-3">
            {filteredSchedules.map((task) => {
              const isDue = task.status === 'due';
              const isOverdue = task.status === 'overdue';
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.schedule_id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-50/70 border-rose-200'
                      : isDue
                      ? 'bg-amber-50/70 border-amber-200'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-[#E5DFD4]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#7F4F24] bg-white px-2 py-0.5 rounded-md border border-[#E2DBD0]">
                        {task.farmer_name || 'เกษตรกร'}
                      </span>
                      <span className="text-xs text-[#7A7264]">{task.plot_name}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#1B4332]">
                      {task.fertilizer_name} ({task.quantity} {task.unit})
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-[#6C655A]">{task.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <div className="font-bold text-[#2D2A26]">
                        กำหนด: {task.application_date}
                      </div>
                      <div className="text-[11px] text-[#7A7264]">
                        เตือนล่วงหน้า: {task.reminder_at}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isOverdue
                          ? 'bg-rose-700 text-white'
                          : isDue
                          ? 'bg-amber-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {isOverdue ? 'เกินกำหนด' : isDue ? 'ถึงกำหนดวันนี้' : isCompleted ? 'ใส่ปุ๋ยแล้ว' : 'รอถึงรอบ'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: INBOX & CONSULTATIONS */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-[#1B4332] font-heading flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2D6A4F]" />
              <span>ศูนย์รวมข้อความปรึกษาจากเกษตรกรทุกคน (Owner Inquiries Desk)</span>
            </h2>
            <p className="text-xs text-[#6C655A] mt-1">
              เจ้าของระบบสามารถตอบคำถาม ข้อสงสัย หรือให้คำแนะนำทางวิชาการแก่เกษตรกรได้โดยตรง
            </p>
          </div>

          <div className="space-y-4">
            {messages
              .filter((m) => m.sender === 'user')
              .map((msg) => {
                const isReplied = msg.status === 'replied';
                const replies = messages.filter((r) => r.reply_to === msg.id);

                return (
                  <div
                    key={msg.id}
                    className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1B4332]">
                            {msg.user_name || 'เกษตรกรไทย'}
                          </span>
                          {msg.location && (
                            <span className="text-xs text-[#7A7264] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                              {msg.location}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isReplied
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {isReplied ? 'ตอบกลับแล้ว' : 'รอเจ้าหน้าที่/เจ้าของตอบ'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A7264] mt-0.5">
                          {new Date(msg.timestamp).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] text-xs sm:text-sm text-[#2D2A26] leading-relaxed">
                      💬 &ldquo;{msg.message}&rdquo;
                    </div>

                    {/* Replies thread */}
                    {replies.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-emerald-500">
                        {replies.map((r) => (
                          <div key={r.id} className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                              <span>👑 คำตอบจากเจ้าของระบบ / ฝ่ายวิชาการ:</span>
                              <span className="text-[10px] font-normal text-emerald-700">
                                {new Date(r.timestamp).toLocaleString('th-TH')}
                              </span>
                            </div>
                            <p className="text-[#2D2A26]">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    {replyTargetId === msg.id ? (
                      <div className="space-y-2 pt-2 border-t border-[#EFEAE1]">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t.owner_reply_placeholder}
                          rows={3}
                          className="w-full bg-[#FAF7F0] border border-[#DDD5C5] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2A26] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTargetId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6C655A] hover:bg-[#EFEAE1] cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendOwnerReply(msg.id)}
                            className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ส่งคำตอบในฐานะเจ้าของระบบ</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTargetId(msg.id);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B4332] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-300 cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span>{isReplied ? 'ส่งคำตอบเพิ่มเติม' : 'พิมพ์ตอบเกษตรกรคนนี้'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 6: DATA EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1B4332] font-heading">
                ส่งออกข้อมูลทั้งหมดในระบบ Soil Time (Exclusive Owner Export)
              </h2>
              <p className="text-xs sm:text-sm text-[#6C655A]">
                สำรองข้อมูลเกษตรกรทุกคน แปลงเพาะปลูก แผนการใส่ปุ๋ย และบันทึกคำปรึกษาในรูปแบบ JSON
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>การคุ้มครองข้อมูลส่วนบุคคลของเกษตรกร</span>
            </div>
            ข้อมูลนี้สงวนสิทธิ์เฉพาะเจ้าของระบบผ่านแอป Soil Time เท่านั้น เกษตรกรรายบุคคลจะไม่สามารถมองเห็นข้อมูลของเกษตรกรคนอื่นได้
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportDownload}
              className="px-5 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ JSON ทั้งระบบ</span>
            </button>

            <button
              type="button"
              onClick={handleCopyExportJson}
              className="px-5 py-3 bg-[#FAF7F0] hover:bg-[#EFE9DF] text-[#4A453E] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              {copiedExport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">คัดลอก JSON แล้ว!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>คัดลอกข้อมูล JSON สู่คลิปบอร์ด</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
