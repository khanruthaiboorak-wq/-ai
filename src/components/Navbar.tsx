/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wifi, WifiOff, Globe, Type, User } from 'lucide-react';
import Logo from './Logo.tsx';
import { Language, FontScale, UserProfile } from '../types/index.ts';
import { getTranslation } from '../translations/i18n.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontScale: FontScale;
  onFontScaleChange: (scale: FontScale) => void;
  isOnline: boolean;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  isOwnerMode?: boolean;
  onOpenOwnerAuth?: () => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  fontScale,
  onFontScaleChange,
  isOnline,
  userProfile,
  onOpenProfile,
  isOwnerMode = false,
  onOpenOwnerAuth,
}: NavbarProps) {
  const t = getTranslation(language);

  const navItems = [
    { id: 'home', label: t.nav_home, icon: '🏡' },
    { id: 'ai', label: t.nav_ai, icon: '🤖' },
    { id: 'calendar', label: t.nav_calendar, icon: '📅' },
    { id: 'plots', label: t.nav_plots, icon: '🌱' },
    { id: 'knowledge', label: t.nav_knowledge, icon: '📚' },
    { id: 'admin', label: t.nav_admin, icon: '💬' },
    { id: 'settings', label: t.nav_settings, icon: '⚙️' },
    {
      id: 'owner',
      label: isOwnerMode ? '👑 โหมดเจ้าของ (Active)' : t.nav_owner,
      icon: '👑',
      isOwner: true,
    },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.isOwner) {
      if (isOwnerMode) {
        onSelectTab('owner');
      } else if (onOpenOwnerAuth) {
        onOpenOwnerAuth();
      } else {
        onSelectTab('owner');
      }
      return;
    }
    onSelectTab(item.id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DA] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[3.75rem] sm:min-h-[4.5rem] py-1">
          {/* Logo & Slogan Click to Home */}
          <button
            onClick={() => onSelectTab('home')}
            className="cursor-pointer text-left focus:outline-hidden rounded-xl hover:opacity-90 transition-opacity"
            aria-label="Soil Time Home"
          >
            <Logo size="md" showSlogan={true} />
          </button>

          {/* Center navigation tabs (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F4EFE6] p-1.5 rounded-2xl border border-[#E2DBD0]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const isOwnerBtn = item.isOwner;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? isOwnerBtn
                        ? 'bg-amber-500 text-[#1B4332] font-extrabold shadow-xs'
                        : 'bg-[#1B4332] text-white shadow-xs'
                      : isOwnerBtn
                      ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'text-[#4A453E] hover:text-[#1B4332] hover:bg-white/60'
                  }`}
                >
                  <span className="text-sm xl:text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility cluster: Online/Offline indicator, Font Scale, Language, Owner trigger, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Owner quick button */}
            <button
              type="button"
              onClick={isOwnerMode ? () => onSelectTab('owner') : onOpenOwnerAuth}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isOwnerMode
                  ? 'bg-amber-400 text-[#1B4332] shadow-xs hover:bg-amber-300 font-extrabold ring-2 ring-amber-400/50'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
              title="เฉพาะเจ้าของระบบเข้าดูข้อมูลทุกคนผ่านแอปนี้เท่านั้น"
            >
              <span>👑</span>
              <span className="hidden sm:inline">
                {isOwnerMode ? 'เจ้าของระบบ' : 'เจ้าของระบบ'}
              </span>
            </button>
            {/* Online / Offline status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              }`}
              title={isOnline ? t.online_badge : t.offline_badge}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">{t.online_badge}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.offline_badge}</span>
                </>
              )}
            </div>

            {/* Font scaling selector for seniors */}
            <div className="hidden sm:flex items-center bg-[#F4EFE6] p-0.5 rounded-xl border border-[#E2DBD0]">
              <button
                onClick={() => onFontScaleChange('normal')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontScale === 'normal' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#6C655A]'
                }`}
                title={t.settings_font_normal}
              >
                A
              </button>
              <button
                onClick={() => onFontScaleChange('large')}
                className={`px-2 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  fontScale === 'large' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#6C655A]'
                }`}
                title={t.settings_font_large}
              >
                A+
              </button>
              <button
                onClick={() => onFontScaleChange('xlarge')}
                className={`px-2 py-1 rounded-lg text-base font-bold transition-all cursor-pointer ${
                  fontScale === 'xlarge' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#6C655A]'
                }`}
                title={t.settings_font_xlarge}
              >
                A++
              </button>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <label htmlFor="language-select" className="sr-only">
                {t.settings_lang}
              </label>
              <div className="flex items-center gap-1 bg-[#F4EFE6] px-2.5 py-1.5 rounded-xl border border-[#E2DBD0] text-xs font-bold text-[#1B4332]">
                <Globe className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-transparent font-semibold cursor-pointer focus:outline-hidden text-xs"
                >
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>

            {/* User profile avatar / button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-emerald-300 text-[#1B4332] text-xs font-semibold cursor-pointer transition-colors"
              title={t.settings_profile}
            >
              <User className="w-4 h-4 text-[#2D6A4F]" />
              <span className="hidden md:inline font-medium max-w-[90px] truncate">
                {userProfile?.display_name || 'เกษตรกร'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar (bottom or sub-header) */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-[#EFEAE1] scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const isOwnerBtn = item.isOwner;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  isActive
                    ? isOwnerBtn
                      ? 'bg-amber-500 text-[#1B4332] font-extrabold shadow-xs'
                      : 'bg-[#1B4332] text-white shadow-xs'
                    : isOwnerBtn
                    ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                    : 'bg-[#F4EFE6] text-[#4A453E] hover:bg-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
