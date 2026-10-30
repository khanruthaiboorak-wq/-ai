/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, MapPin, CheckCircle, Sprout, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Logo from './Logo.tsx';
import { UserProfile, Language } from '../types/index.ts';
import { getTranslation } from '../translations/i18n.ts';

interface ProfileOnboardingProps {
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isModalMode?: boolean;
}

export default function ProfileOnboarding({
  initialProfile,
  onSave,
  onCancel,
  language,
  onLanguageChange,
  isModalMode = false,
}: ProfileOnboardingProps) {
  const t = getTranslation(language);

  // If user has no existing profile, start with welcome screen view
  const [step, setStep] = useState<1 | 2>(initialProfile ? 2 : 1);

  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '');
  const [age, setAge] = useState<string>(initialProfile?.age ? String(initialProfile.age) : '48');
  const [farmingTypes, setFarmingTypes] = useState<string[]>(
    initialProfile?.farming_types || ['สวนยางพารา', 'สวนผลไม้']
  );
  const [soilProblems, setSoilProblems] = useState<string[]>(
    initialProfile?.soil_problems || ['ดินแข็ง ดาน ดินแน่น', 'ดินเปรี้ยว (กรดจัด)']
  );
  const [location, setLocation] = useState(initialProfile?.location || 'พังงา');
  const [error, setError] = useState('');

  const availableFarms = [
    { id: 'rubber', label: t.farm_type_rubber, icon: '🪵' },
    { id: 'palm', label: t.farm_type_palm, icon: '🌴' },
    { id: 'rice', label: t.farm_type_rice, icon: '🌾' },
    { id: 'fruit', label: t.farm_type_fruit, icon: '🍈' },
    { id: 'veg', label: t.farm_type_veg, icon: '🥬' },
    { id: 'cashcrop', label: t.farm_type_cashcrop, icon: '🌽' },
    { id: 'other', label: t.farm_type_other, icon: '🌱' },
  ];

  const availableProblems = [
    { id: 'hard', label: t.prob_hard, icon: '🪨' },
    { id: 'acid', label: t.prob_acid, icon: '🧪' },
    { id: 'salt', label: t.prob_salt, icon: '🧂' },
    { id: 'degraded', label: t.prob_degraded, icon: '🍂' },
    { id: 'infertile', label: t.prob_infertile, icon: '⚠️' },
    { id: 'waterlog', label: t.prob_waterlog, icon: '💧' },
    { id: 'slow_growth', label: t.prob_slow_growth, icon: '🥀' },
    { id: 'unknown', label: t.prob_unknown, icon: '❓' },
  ];

  const toggleFarm = (label: string) => {
    setFarmingTypes((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const toggleProblem = (label: string) => {
    setSoilProblems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim() || (language === 'en' ? 'Farmer' : language === 'zh' ? '农友' : 'เกษตรกร');

    const profile: UserProfile = {
      user_id: initialProfile?.user_id || `user-${Date.now()}`,
      display_name: cleanName,
      age: age ? parseInt(age, 10) || 45 : 45,
      language,
      farming_types: farmingTypes.length > 0 ? farmingTypes : ['สวนยางพารา'],
      location: location.trim() || 'ประเทศไทย',
      soil_problems: soilProblems.length > 0 ? soilProblems : ['ไม่ทราบว่าดินมีปัญหาอะไร'],
      created_at: initialProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FBF9F4] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2DBD0] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Step 1: Welcome Splash Screen */}
        {step === 1 && (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center">
            {/* Language Selector Top Right */}
            <div className="w-full flex justify-end mb-4">
              <div className="inline-flex rounded-xl bg-[#EBE5D8] p-1 border border-[#DDD5C5]">
                <button
                  type="button"
                  onClick={() => onLanguageChange('th')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'th' ? 'bg-[#1B4332] text-white' : 'text-[#4A453E]'
                  }`}
                >
                  ไทย
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-[#1B4332] text-white' : 'text-[#4A453E]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('zh')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'zh' ? 'bg-[#1B4332] text-white' : 'text-[#4A453E]'
                  }`}
                >
                  中文
                </button>
              </div>
            </div>

            {/* Emblem Hero */}
            <div className="my-3 scale-110">
              <Logo size="xl" showSlogan={false} />
            </div>

            <div className="mt-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] font-heading">
                Soil Time
              </h1>
              <p className="text-lg sm:text-xl font-bold text-[#7F4F24] mt-1">
                {t.slogan}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#5C5549] max-w-md mt-2 mb-8 leading-relaxed">
              {t.welcome_sub}
            </p>

            {/* Visual Value Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full mb-8 text-left">
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D5] shadow-2xs">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-xs font-bold text-[#1B4332]">เข้าใจดิน</div>
                <div className="text-[11px] text-[#7A7264] line-clamp-2">แก้ดินเปรี้ยว ดินดาน ตรงจุด</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D5] shadow-2xs">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs font-bold text-[#1B4332]">ปฏิทินใส่ปุ๋ย</div>
                <div className="text-[11px] text-[#7A7264] line-clamp-2">แจ้งเตือนแม่นยำ ไม่พลาดรอบ</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E8E2D5] shadow-2xs">
                <div className="text-2xl mb-1">📶</div>
                <div className="text-xs font-bold text-[#1B4332]">ออฟไลน์ได้</div>
                <div className="text-[11px] text-[#7A7264] line-clamp-2">อยู่ในสวนไร้เน็ตก็ใช้งานได้</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-8 py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>{t.get_started}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Information Setup */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1B4332] font-heading flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-[#2D6A4F]" />
                  <span>{t.onboard_title}</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
                  {t.onboard_desc}
                </p>
              </div>
              {isModalMode && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-sm font-semibold text-[#7A7264] hover:text-[#242220] p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Display Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="display_name_input" className="block text-sm font-bold text-[#2D2A26] mb-1.5">
                    {t.name_label}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7A7264] absolute left-3.5 top-3.5" />
                    <input
                      id="display_name_input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t.name_placeholder}
                      className="w-full bg-white border border-[#D5CDC0] rounded-xl pl-10 pr-4 py-2.5 text-sm sm:text-base font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="age_input" className="block text-sm font-bold text-[#2D2A26] mb-1.5">
                    {t.age_label}
                  </label>
                  <input
                    id="age_input"
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t.age_placeholder}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-4 py-2.5 text-sm sm:text-base font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location_input" className="block text-sm font-bold text-[#2D2A26] mb-1.5">
                  {t.location_label}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#7A7264] absolute left-3.5 top-3.5" />
                  <input
                    id="location_input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.location_placeholder}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl pl-10 pr-4 py-2.5 text-sm sm:text-base font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Farming Types (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#2D2A26]">
                    {t.farm_types_label}
                  </label>
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {farmingTypes.length} {language === 'en' ? 'selected' : 'เลือกแล้ว'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableFarms.map((farm) => {
                    const isSelected = farmingTypes.includes(farm.label);
                    return (
                      <button
                        type="button"
                        key={farm.id}
                        onClick={() => toggleFarm(farm.label)}
                        className={`p-2.5 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                            : 'bg-white text-[#423C35] border-[#DCD4C7] hover:bg-[#F3EFE7]'
                        }`}
                      >
                        <span className="text-base">{farm.icon}</span>
                        <span className="truncate">{farm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Soil Problems (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#2D2A26]">
                    {t.soil_problems_label}
                  </label>
                  <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {soilProblems.length} {language === 'en' ? 'selected' : 'เลือกแล้ว'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableProblems.map((prob) => {
                    const isSelected = soilProblems.includes(prob.label);
                    return (
                      <button
                        type="button"
                        key={prob.id}
                        onClick={() => toggleProblem(prob.label)}
                        className={`p-2.5 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#7F4F24] text-white border-[#7F4F24] shadow-xs'
                            : 'bg-white text-[#423C35] border-[#DCD4C7] hover:bg-[#F3EFE7]'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{prob.icon}</span>
                          <span className="truncate">{prob.label}</span>
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 shrink-0 text-amber-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error notice if any */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="mt-8 pt-4 border-t border-[#E8E2D5] flex items-center justify-between gap-3">
              {isModalMode && onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-3 rounded-xl border border-[#D5CDC0] text-[#554E44] font-bold text-sm hover:bg-[#EBE5D8] cursor-pointer"
                >
                  {t.cancel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-[#7F4F24] hover:underline cursor-pointer"
                >
                  {t.back}
                </button>
              )}

              <button
                type="submit"
                className="px-7 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-bold text-base shadow-md shadow-emerald-950/20 cursor-pointer flex items-center gap-2 ml-auto"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>{initialProfile ? t.save : t.start_button}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
