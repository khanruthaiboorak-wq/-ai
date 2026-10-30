/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.tsx';
import ProfileOnboarding from './components/ProfileOnboarding.tsx';
import HomeDashboard from './components/HomeDashboard.tsx';
import AiAssistant from './components/AiAssistant.tsx';
import FertilizerCalendar from './components/FertilizerCalendar.tsx';
import FarmPlotsManager from './components/FarmPlotsManager.tsx';
import SoilKnowledgeBase from './components/SoilKnowledgeBase.tsx';
import ContactAdmin from './components/ContactAdmin.tsx';
import SettingsView from './components/SettingsView.tsx';
import OwnerDashboard from './components/OwnerDashboard.tsx';
import OwnerAuthModal from './components/OwnerAuthModal.tsx';
import {
  UserProfile,
  FarmPlot,
  CareLogItem,
  AdminMessage,
  Language,
  FontScale,
} from './types/index.ts';
import { FertilizerSchedule } from './utils/fertilizer-rules.ts';
import { StorageService } from './services/storage.ts';

export default function App() {
  // Check for ?autostart=1 query param (Ultra Mode guideline requirement)
  const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';

  // Core state: No email required, direct onboarding
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const existing = StorageService.getUserProfile();
    if (existing) return existing;
    if (isAutostart) {
      const defaultUser: UserProfile = {
        user_id: 'farmer-local-01',
        display_name: 'เกษตรกรไทย',
        age: 48,
        language: 'th',
        farming_types: ['สวนยางพารา', 'สวนผลไม้ (ทุเรียน)'],
        location: 'สุราษฎร์ธานี',
        soil_problems: ['ดินเปรี้ยว (กรดจัด)', 'ดินแข็ง ดาน ดินแน่น'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      StorageService.saveUserProfile(defaultUser);
      return defaultUser;
    }
    return null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>(() => userProfile?.language || 'th');
  const [fontScale, setFontScale] = useState<FontScale>(() => userProfile?.font_scale || 'normal');
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  // Owner Mode State: Only the owner can see everyone's data exclusively through this app
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => StorageService.isOwnerActive());
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);

  // System-wide datasets for Owner
  const [allFarmers, setAllFarmers] = useState<UserProfile[]>(() => StorageService.getAllFarmers());
  const [allPlots, setAllPlots] = useState<FarmPlot[]>(() => StorageService.getAllPlots());
  const [allSchedules, setAllSchedules] = useState<FertilizerSchedule[]>(() => StorageService.getAllSchedules());
  const [allMessages, setAllMessages] = useState<AdminMessage[]>(() => StorageService.getAllAdminMessages());

  // Individual farmer's personal domain data
  const [userPlots, setUserPlots] = useState<FarmPlot[]>(() => StorageService.getPlots(userProfile?.user_id));
  const [userSchedules, setUserSchedules] = useState<FertilizerSchedule[]>(() => StorageService.getSchedules(userProfile?.user_id));
  const [careLogs, setCareLogs] = useState<CareLogItem[]>(() => StorageService.getCareLogs());
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(() => StorageService.getAdminMessages(userProfile?.user_id));
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => StorageService.getBookmarkedArticles());
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => StorageService.getDownloadedArticles());

  // Refresh all state from storage
  const reloadAllData = useCallback(() => {
    setAllFarmers(StorageService.getAllFarmers());
    setAllPlots(StorageService.getAllPlots());
    setAllSchedules(StorageService.getAllSchedules());
    setAllMessages(StorageService.getAllAdminMessages());
    setUserPlots(StorageService.getPlots(userProfile?.user_id));
    setUserSchedules(StorageService.getSchedules(userProfile?.user_id));
    setAdminMessages(StorageService.getAdminMessages(userProfile?.user_id));
  }, [userProfile?.user_id]);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      StorageService.syncOfflineQueue();
      reloadAllData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reloadAllData]);

  // Handlers
  const handleSaveProfile = (updated: UserProfile) => {
    const nextProfile = {
      ...updated,
      language,
      font_scale: fontScale,
    };
    setUserProfile(nextProfile);
    StorageService.saveUserProfile(nextProfile);
    setIsProfileModalOpen(false);
    reloadAllData();
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (userProfile) {
      const updated = { ...userProfile, language: newLang };
      setUserProfile(updated);
      StorageService.saveUserProfile(updated);
    }
  };

  const handleFontScaleChange = (newScale: FontScale) => {
    setFontScale(newScale);
    if (userProfile) {
      const updated = { ...userProfile, font_scale: newScale };
      setUserProfile(updated);
      StorageService.saveUserProfile(updated);
    }
  };

  // Plot handlers
  const handleAddPlot = (plot: FarmPlot) => {
    const plotWithFarmer: FarmPlot = {
      ...plot,
      user_id: userProfile?.user_id || 'user-default',
      farmer_name: userProfile?.display_name || 'เกษตรกรไทย',
      farmer_location: userProfile?.location || 'ประเทศไทย',
    };
    StorageService.addPlot(plotWithFarmer);
    reloadAllData();
  };

  const handleUpdatePlot = (plot: FarmPlot) => {
    StorageService.updatePlot(plot);
    reloadAllData();
  };

  const handleDeletePlot = (plotId: string) => {
    StorageService.deletePlot(plotId);
    reloadAllData();
  };

  // Schedule handlers
  const handleAddSchedule = (schedule: FertilizerSchedule) => {
    const schedWithFarmer: FertilizerSchedule = {
      ...schedule,
      user_id: userProfile?.user_id || 'user-default',
      farmer_name: userProfile?.display_name || 'เกษตรกรไทย',
    };
    StorageService.addSchedule(schedWithFarmer);
    reloadAllData();
  };

  const handleUpdateSchedule = (schedule: FertilizerSchedule) => {
    StorageService.updateSchedule(schedule);
    reloadAllData();
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    StorageService.deleteSchedule(scheduleId);
    reloadAllData();
  };

  // Care log
  const handleAddCareLog = (log: CareLogItem) => {
    const next = StorageService.addCareLog(log);
    setCareLogs(next);
  };

  // Admin message
  const handleSendAdminMessage = (msg: AdminMessage) => {
    const next = StorageService.addAdminMessage(msg);
    setAdminMessages(next);
    reloadAllData();
  };

  // Bookmarks & downloads
  const handleToggleBookmark = (id: string) => {
    const next = StorageService.toggleBookmarkArticle(id);
    setBookmarkedIds(next);
  };

  const handleToggleDownload = (id: string) => {
    const next = StorageService.toggleDownloadedArticle(id);
    setDownloadedIds(next);
  };

  // Owner Mode triggers
  const handleOwnerAuthSuccess = () => {
    setIsOwnerMode(true);
    setIsOwnerAuthModalOpen(false);
    setCurrentTab('owner');
    reloadAllData();
  };

  const handleExitOwnerMode = () => {
    StorageService.setOwnerActive(false);
    setIsOwnerMode(false);
    setCurrentTab('home');
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'owner') {
      if (isOwnerMode) {
        setCurrentTab('owner');
      } else {
        setIsOwnerAuthModalOpen(true);
      }
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div
      className={`min-h-screen bg-[#FBF9F4] text-[#242220] flex flex-col font-scale-${fontScale}`}
    >
      {/* First-time Onboarding Modal - No email, direct entrance */}
      {!userProfile && (
        <ProfileOnboarding
          onSave={handleSaveProfile}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && userProfile && (
        <ProfileOnboarding
          initialProfile={userProfile}
          onSave={handleSaveProfile}
          onCancel={() => setIsProfileModalOpen(false)}
          language={language}
          onLanguageChange={handleLanguageChange}
          isModalMode={true}
        />
      )}

      {/* Owner Passcode Verification Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthModalOpen}
        onClose={() => setIsOwnerAuthModalOpen(false)}
        onSuccess={handleOwnerAuthSuccess}
        language={language}
      />

      {/* Persistent Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        language={language}
        onLanguageChange={handleLanguageChange}
        fontScale={fontScale}
        onFontScaleChange={handleFontScaleChange}
        isOnline={isOnline}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOwnerMode={isOwnerMode}
        onOpenOwnerAuth={() => setIsOwnerAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* EXCLUSIVE OWNER DASHBOARD: Owner can view all data of everyone across Thailand */}
        {currentTab === 'owner' && isOwnerMode ? (
          <OwnerDashboard
            farmers={allFarmers}
            plots={allPlots}
            schedules={allSchedules}
            messages={allMessages}
            onExitOwnerMode={handleExitOwnerMode}
            onRefreshData={reloadAllData}
            language={language}
          />
        ) : (
          userProfile && (
            <>
              {currentTab === 'home' && (
                <HomeDashboard
                  userProfile={userProfile}
                  plots={userPlots}
                  schedules={userSchedules}
                  bookmarkedCount={bookmarkedIds.length}
                  onNavigate={handleSelectTab}
                  language={language}
                />
              )}

              {currentTab === 'ai' && (
                <AiAssistant
                  userProfile={userProfile}
                  plots={userPlots}
                  isOnline={isOnline}
                  onNavigateToKnowledge={() => setCurrentTab('knowledge')}
                  language={language}
                />
              )}

              {currentTab === 'calendar' && (
                <FertilizerCalendar
                  schedules={userSchedules}
                  plots={userPlots}
                  onAddSchedule={handleAddSchedule}
                  onUpdateSchedule={handleUpdateSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                  language={language}
                />
              )}

              {currentTab === 'plots' && (
                <FarmPlotsManager
                  plots={userPlots}
                  careLogs={careLogs}
                  onAddPlot={handleAddPlot}
                  onUpdatePlot={handleUpdatePlot}
                  onDeletePlot={handleDeletePlot}
                  onAddCareLog={handleAddCareLog}
                  language={language}
                />
              )}

              {currentTab === 'knowledge' && (
                <SoilKnowledgeBase
                  bookmarkedIds={bookmarkedIds}
                  downloadedIds={downloadedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleDownload={handleToggleDownload}
                  language={language}
                />
              )}

              {currentTab === 'admin' && (
                <ContactAdmin
                  messages={adminMessages}
                  onSendMessage={handleSendAdminMessage}
                  isOnline={isOnline}
                  language={language}
                  userProfile={userProfile}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  userProfile={userProfile}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  fontScale={fontScale}
                  onFontScaleChange={handleFontScaleChange}
                  onEditProfile={() => setIsProfileModalOpen(true)}
                  isOnline={isOnline}
                />
              )}
            </>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-white py-6 mt-12 text-center text-xs text-[#7A7264]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-[#1B4332]">
            <span>🌱 Soil Time</span>
            <span>—</span>
            <span className="font-normal text-[#7F4F24]">“ดินดี เกษตรกรยิ้มได้”</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>เพื่อเกษตรกรไทย • รองรับการใช้งานออฟไลน์ • สอดคล้องกับมาตรฐานกรมพัฒนาที่ดิน</span>
            <span>•</span>
            <button
              type="button"
              onClick={isOwnerMode ? () => setCurrentTab('owner') : () => setIsOwnerAuthModalOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              👑 เฉพาะเจ้าของระบบ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
