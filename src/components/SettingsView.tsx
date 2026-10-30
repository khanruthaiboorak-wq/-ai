/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Settings,
  Type,
  Globe,
  User,
  RefreshCw,
  Info,
  CheckCircle,
  Shield,
  Smartphone,
  Download,
} from 'lucide-react';
import { UserProfile, Language, FontScale } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';
import { getTranslation } from '../translations/i18n.ts';
import Logo from './Logo.tsx';

interface SettingsViewProps {
  userProfile: UserProfile;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontScale: FontScale;
  onFontScaleChange: (scale: FontScale) => void;
  onEditProfile: () => void;
  isOnline: boolean;
}

export default function SettingsView({
  userProfile,
  language,
  onLanguageChange,
  fontScale,
  onFontScaleChange,
  onEditProfile,
  isOnline,
}: SettingsViewProps) {
  const t = getTranslation(language);

  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = StorageService.syncOfflineQueue();
      setSyncStatusText(res.message);
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#2D6A4F]" />
          <span>{t.settings_title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
          ปรับแต่งภาษา ขนาดตัวอักษรเพื่อการอ่านที่สบายตา และการจัดการข้อมูล
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Font Scale Setting (Senior-friendly accessibility) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#1B4332] font-bold text-sm sm:text-base font-heading">
            <Type className="w-5 h-5 text-[#2D6A4F]" />
            <span>{t.settings_font_scale}</span>
          </div>
          <p className="text-xs text-[#6C655A]">
            ออกแบบให้ผู้สูงอายุและเด็กอ่านได้ชัดเจน สามารถปรับขนาดตัวอักษรได้ 3 ระดับ
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => onFontScaleChange('normal')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                fontScale === 'normal'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-base font-bold">16px</div>
              <div className="text-[11px] mt-0.5">{t.settings_font_normal}</div>
            </button>

            <button
              onClick={() => onFontScaleChange('large')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                fontScale === 'large'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-lg font-bold">18px</div>
              <div className="text-[11px] mt-0.5">{t.settings_font_large}</div>
            </button>

            <button
              onClick={() => onFontScaleChange('xlarge')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                fontScale === 'xlarge'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-xl font-bold">20px</div>
              <div className="text-[11px] mt-0.5">{t.settings_font_xlarge}</div>
            </button>
          </div>
        </div>

        {/* Language Switcher Setting */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#1B4332] font-bold text-sm sm:text-base font-heading">
            <Globe className="w-5 h-5 text-[#2D6A4F]" />
            <span>{t.settings_lang}</span>
          </div>
          <p className="text-xs text-[#6C655A]">
            เปลี่ยนภาษาของระบบ เมนู คำแนะนำการใส่ปุ๋ย และการแจ้งเตือนทั้งหมด
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => onLanguageChange('th')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                language === 'th'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-xl mb-1">🇹🇭</div>
              <div className="text-xs font-bold">ภาษาไทย</div>
            </button>

            <button
              onClick={() => onLanguageChange('en')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-xl mb-1">🇬🇧</div>
              <div className="text-xs font-bold">English</div>
            </button>

            <button
              onClick={() => onLanguageChange('zh')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                language === 'zh'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : 'bg-[#FAF7F0] text-[#4A453E] border-[#DDD5C5] hover:bg-[#F2ECE1]'
              }`}
            >
              <div className="text-xl mb-1">🇨🇳</div>
              <div className="text-xs font-bold">中文</div>
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#1B4332] font-bold text-sm sm:text-base font-heading">
              <User className="w-5 h-5 text-[#2D6A4F]" />
              <span>ข้อมูลส่วนตัวของคุณ</span>
            </div>
            <button
              onClick={onEditProfile}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              แก้ไขข้อมูล
            </button>
          </div>

          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E8E2D5] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8C8476]">ชื่อที่เรียก:</span>
              <span className="font-bold text-[#1B4332]">{userProfile.display_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C8476]">อายุ:</span>
              <span className="font-bold text-[#242220]">{userProfile.age} ปี</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C8476]">พื้นที่:</span>
              <span className="font-bold text-[#242220]">{userProfile.location || '-'}</span>
            </div>
            <div>
              <span className="text-[#8C8476] block mb-1">ประเภทการเกษตร:</span>
              <div className="flex flex-wrap gap-1">
                {userProfile.farming_types?.map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-white px-2 py-0.5 rounded-md border border-[#DDD5C5] font-semibold text-[#1B4332]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Offline Sync Status & Progressive Web App Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#1B4332] font-bold text-sm sm:text-base font-heading">
            <RefreshCw className={`w-5 h-5 text-[#2D6A4F] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{t.settings_offline_sync}</span>
          </div>

          <p className="text-xs text-[#6C655A] leading-relaxed">
            ข้อมูลแปลงเกษตรและปฏิทินใส่ปุ๋ยจัดเก็บในเครื่องอย่างปลอดภัย แม้ไม่มีสัญญาณอินเทอร์เน็ตในสวน
          </p>

          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E8E2D5] flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-[#1B4332]">สถานะการเชื่อมต่อ:</div>
              <div className="text-[11px] text-[#7A7264]">
                {isOnline ? '🟢 ออนไลน์พร้อมซิงก์ข้อมูล' : '🟡 ออฟไลน์ (บันทึกในเครื่อง)'}
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              {isSyncing ? 'กำลังซิงก์...' : t.settings_sync_now}
            </button>
          </div>

          {syncStatusText && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncStatusText}</span>
            </div>
          )}
        </div>
      </div>

      {/* About Soil Time Card */}
      <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0">
          <Logo size="lg" showSlogan={false} />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="text-lg font-bold text-[#1B4332] font-heading">
            Soil Time - “ดินดี เกษตรกรยิ้มได้”
          </div>
          <p className="text-xs sm:text-sm text-[#5C5549] leading-relaxed">
            พัฒนาขึ้นเพื่อเป็นเครื่องมือผู้ช่วยข้างกายเกษตรกรไทย ยกระดับผลผลิต ลดต้นทุนปุ๋ยเคมี และดูแลความอุดมสมบูรณ์ของดินอย่างยั่งยืน โดยสอดคล้องกับมาตรฐานทางวิชาการของกรมพัฒนาที่ดิน กระทรวงเกษตรและสหกรณ์
          </p>
          <div className="text-[11px] text-[#7F4F24] font-semibold pt-1">
            {t.settings_version}
          </div>
        </div>
      </div>
    </div>
  );
}
