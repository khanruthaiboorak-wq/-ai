/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { UserProfile, Language } from '../types/index.ts';
import { FertilizerSchedule } from '../utils/fertilizer-rules.ts';
import { getTranslation } from '../translations/i18n.ts';
import {
  WeatherData,
  DailyForecast,
  fetchWeatherForecast,
  resolveLocationCoordinates,
  THAI_PROVINCES,
  POPULAR_PROVINCES,
} from '../utils/weather-fertilizer.ts';

interface WeatherForecastCardProps {
  userProfile: UserProfile;
  schedules?: FertilizerSchedule[];
  onNavigate: (tab: string) => void;
  language: Language;
}

export default function WeatherForecastCard({
  userProfile,
  schedules = [],
  onNavigate,
  language,
}: WeatherForecastCardProps) {
  const t = getTranslation(language);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [, startTransition] = useTransition();

  const dueTasks = schedules.filter((s) => s.status === 'due' || s.status === 'overdue');

  const loadWeather = async (
    targetLat?: number,
    targetLon?: number,
    targetName?: string,
    isGps: boolean = false
  ) => {
    setIsRefreshing(true);
    let lat = targetLat;
    let lon = targetLon;
    let locName = targetName;

    if (lat === undefined || lon === undefined || !locName) {
      const resolved = resolveLocationCoordinates(userProfile.location);
      lat = resolved.lat;
      lon = resolved.lon;
      locName = language === 'en' ? resolved.nameEn : resolved.nameTh;
    }

    const data = await fetchWeatherForecast(lat, lon, locName, isGps);
    startTransition(() => {
      setWeatherData(data);
      setSelectedDay(data.daily[0] || null);
      setLoading(false);
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    loadWeather();
  }, [userProfile.location]);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert(language === 'en' ? 'Geolocation is not supported by your browser' : 'เบราว์เซอร์ไม่รองรับการระบุพิกัด GPS');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        setShowLocationPicker(false);
        const name = language === 'en' ? 'Live Farm GPS' : 'พิกัด GPS แปลงสวนสด';
        loadWeather(pos.coords.latitude, pos.coords.longitude, name, true);
      },
      (_err) => {
        setIsDetectingGps(false);
        // Fallback to profile location gracefully
        loadWeather();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectProvince = (provKey: string) => {
    const prov = THAI_PROVINCES[provKey];
    if (prov) {
      const name = language === 'en' ? prov.en : prov.th;
      loadWeather(prov.lat, prov.lon, name, false);
      setShowLocationPicker(false);
      setSearchQuery('');
    }
  };

  // Weather Icon Renderer
  const renderWeatherIcon = (
    iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudLightning' | 'CloudDrizzle' | 'Wind',
    className: string = 'w-6 h-6'
  ) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-amber-400`} />;
      case 'Cloud':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-purple-500`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${className} text-teal-500`} />;
      case 'Wind':
        return <Wind className={`${className} text-cyan-500`} />;
      default:
        return <CloudSun className={`${className} text-amber-400`} />;
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5DFD4] shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-24 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!weatherData) return null;

  const current = weatherData.current;
  const advisory = weatherData.advisory;
  const isOptimal = advisory.suitability === 'optimal';
  const isCaution = advisory.suitability === 'caution';
  const isAvoid = advisory.suitability === 'avoid';

  // Filtered provinces for picker search
  const filteredProvinces = Object.entries(THAI_PROVINCES).filter(([key, val]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return key.toLowerCase().includes(q) || val.en.toLowerCase().includes(q);
  });

  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 border-2 border-[#E5DFD4] shadow-xs relative overflow-hidden transition-all">
      {/* Decorative top organic bar */}
      <div
        className={`h-2 absolute top-0 left-0 right-0 ${
          isOptimal
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
            : isCaution
            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
            : 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600'
        }`}
      />

      {/* Header: Title, Location Badge & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isOptimal
                  ? 'bg-emerald-100 text-emerald-800'
                  : isCaution
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {renderWeatherIcon(current.weatherIconName, 'w-5 h-5')}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2">
                <span>{t.weather_title}</span>
                {weatherData.isOfflineFallback && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {t.weather_offline_mode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#7A7264]">{t.weather_sub}</p>
            </div>
          </div>
        </div>

        {/* Location & Refresh Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#DDD5C5] text-xs font-bold text-[#1B4332] transition-colors cursor-pointer shadow-2xs"
            title={t.weather_change_loc}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span className="max-w-[130px] truncate">{weatherData.locationName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => loadWeather()}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#DDD5C5] text-slate-600 hover:text-[#1B4332] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title={`${t.weather_updated_at}: ${weatherData.lastUpdated}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location Selector Modal / Dropdown */}
      {showLocationPicker && (
        <div className="mb-6 p-4 bg-white rounded-2xl border-2 border-emerald-800/20 shadow-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{t.weather_change_loc}</span>
            </span>
            <button
              onClick={() => setShowLocationPicker(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕ ปิด
            </button>
          </div>

          {/* GPS Detection Button */}
          <button
            onClick={handleUseGps}
            disabled={isDetectingGps}
            className="w-full mb-3 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Compass className={`w-4 h-4 ${isDetectingGps ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
            <span>{isDetectingGps ? 'กำลังระบุพิกัด GPS...' : t.weather_use_gps}</span>
          </button>

          {/* Province Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาจังหวัด เช่น สุราษฎร์ธานี, เชียงใหม่..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          {/* Quick Popular Provinces */}
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5">จังหวัดยอดนิยม:</div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {filteredProvinces.slice(0, 20).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelectProvince(key)}
                className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  weatherData.locationName.includes(val.th) || weatherData.locationName.includes(val.en)
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {language === 'en' ? val.en : val.th}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Fertilizer Suitability Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 mb-5 border-2 shadow-xs transition-all ${
          isOptimal
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-300 text-emerald-950'
            : isCaution
            ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/60 border-amber-300 text-amber-950'
            : 'bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/60 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl shrink-0 shadow-xs ${
                isOptimal
                  ? 'bg-emerald-600 text-white'
                  : isCaution
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isOptimal && <CheckCircle2 className="w-6 h-6" />}
              {isCaution && <AlertTriangle className="w-6 h-6" />}
              {isAvoid && <XCircle className="w-6 h-6" />}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-white/80 backdrop-blur-xs border border-current/20">
                <span>{language === 'en' ? advisory.statusBadgeEn : advisory.statusBadgeTh}</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold font-heading leading-snug">
                {language === 'en' ? advisory.headlineEn : advisory.headlineTh}
              </h3>
              <p className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed">
                {language === 'en' ? advisory.actionRecommendationEn : advisory.actionRecommendationTh}
              </p>
            </div>
          </div>

          {/* Quick Action Button for Fertilizer Calendar */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {dueTasks.length > 0 && (
              <button
                onClick={() => onNavigate('calendar')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                  isAvoid
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : isCaution
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {isAvoid
                    ? (language === 'en' ? 'Postpone Tasks' : 'เลื่อนรอบใส่ปุ๋ย')
                    : (language === 'en' ? 'View Schedule' : 'ดูรอบใส่ปุ๋ย')}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Golden Hour / Best Window Today */}
        <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="w-3.5 h-3.5 text-current opacity-70" />
            <span>{t.weather_golden_hour}:</span>
            <span className="underline decoration-current/30 underline-offset-2">
              {language === 'en' ? advisory.bestTimeOfDayEn : advisory.bestTimeOfDayTh}
            </span>
          </div>

          {dueTasks.length > 0 && (
            <div className="font-semibold opacity-85">
              📅 มีปุ๋ยรอใส่ {dueTasks.length} รายการ ({dueTasks[0].fertilizer_name})
            </div>
          )}
        </div>
      </div>

      {/* 4 Core Weather Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Temperature */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#EBE4D8] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.weather_temp}</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading">
            {current.temperature}°C
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {language === 'en' ? current.weatherDescriptionEn : current.weatherDescriptionTh}
          </div>
        </div>

        {/* Rain Chance */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#EBE4D8] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.weather_rain_chance}</span>
            <CloudRain className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading flex items-baseline gap-1">
            <span>{current.precipitationProbability}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                current.precipitationProbability > 60
                  ? 'bg-rose-500'
                  : current.precipitationProbability > 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, current.precipitationProbability))}%` }}
            />
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#EBE4D8] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.weather_humidity}</span>
            <Droplets className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading">
            {current.relativeHumidity}%
          </div>
          <div className="text-[11px] text-slate-500">
            {current.relativeHumidity >= 60 ? 'ความชื้นดินและอากาศดี' : 'อากาศแห้ง'}
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#EBE4D8] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.weather_wind}</span>
            <Wind className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading">
            {current.windSpeed} <span className="text-xs font-normal text-slate-500">กม./ชม.</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {current.windSpeed <= 15 ? 'ลมสงบ เหมาะฉีดพ่น' : 'ลมแรง ละอองปลิว'}
          </div>
        </div>
      </div>

      {/* Two In-Depth Fertilizer Guidance Panels: Soil vs Foliar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {/* Soil Granular Fertilizer Guidance */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-2xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#7F4F24] font-heading">
            <span className="text-base">🌾</span>
            <span>{t.weather_soil_fert}</span>
          </div>
          <p className="text-xs text-[#5C5549] leading-relaxed">
            {language === 'en' ? advisory.soilFertilizerAdviceEn : advisory.soilFertilizerAdviceTh}
          </p>
        </div>

        {/* Foliar Spray / Bio-liquid Guidance */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-2xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#2D6A4F] font-heading">
            <span className="text-base">🍃</span>
            <span>{t.weather_foliar_fert}</span>
          </div>
          <p className="text-xs text-[#5C5549] leading-relaxed">
            {language === 'en' ? advisory.foliarFertilizerAdviceEn : advisory.foliarFertilizerAdviceTh}
          </p>
        </div>
      </div>

      {/* 5-Day Outlook for Agricultural Planning */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs font-bold text-[#1B4332] font-heading flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.weather_5day_outlook}</span>
          </div>
          <span className="text-[11px] text-slate-500">คลิกเพื่อดูรายละเอียด</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {weatherData.daily.map((day, idx) => {
            const isDaySelected = selectedDay?.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isDaySelected
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="text-[11px] font-bold">
                  {idx === 0
                    ? (language === 'en' ? 'Today' : 'วันนี้')
                    : idx === 1
                    ? (language === 'en' ? 'Tomorrow' : 'พรุ่งนี้')
                    : (language === 'en' ? day.dayLabelEn : day.dayLabelTh)}
                </div>

                <div className="my-1.5">{renderWeatherIcon(day.weatherIconName, 'w-5 h-5')}</div>

                <div className={`text-xs font-bold ${isDaySelected ? 'text-white' : 'text-slate-900'}`}>
                  {day.tempMax}° / {day.tempMin}°
                </div>

                <div className="flex items-center justify-center gap-0.5 text-[10px] mt-1 font-semibold text-blue-500">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{day.precipitationProbabilityMax}%</span>
                </div>

                {/* Suitability dot indicator */}
                <div className="mt-1.5 flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      day.suitability === 'optimal'
                        ? 'bg-emerald-500'
                        : day.suitability === 'caution'
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-bold ${
                      isDaySelected
                        ? 'text-emerald-100'
                        : day.suitability === 'optimal'
                        ? 'text-emerald-700'
                        : day.suitability === 'caution'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {language === 'en' ? day.recommendationEn : day.recommendationTh}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Expanded Detail if clicked */}
        {selectedDay && selectedDay.date !== weatherData.daily[0]?.date && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1B4332]">
                {language === 'en' ? selectedDay.dayLabelEn : selectedDay.dayLabelTh} ({selectedDay.date}):
              </span>
              <span className="text-slate-600">
                {language === 'en' ? selectedDay.weatherDescriptionTh : selectedDay.weatherDescriptionTh} • ฝน {selectedDay.precipitationProbabilityMax}%
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                selectedDay.suitability === 'optimal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedDay.suitability === 'caution'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {language === 'en' ? selectedDay.recommendationEn : selectedDay.recommendationTh}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
