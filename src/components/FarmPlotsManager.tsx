/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Activity,
  History,
  FlaskConical,
  ChevronRight,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { FarmPlot, CareLogItem, Language, SoilTestResult } from '../types/index.ts';
import { calculateLimeRequirement } from '../utils/fertilizer-rules.ts';
import { getTranslation } from '../translations/i18n.ts';

interface FarmPlotsManagerProps {
  plots: FarmPlot[];
  careLogs: CareLogItem[];
  onAddPlot: (plot: FarmPlot) => void;
  onUpdatePlot: (plot: FarmPlot) => void;
  onDeletePlot: (plotId: string) => void;
  onAddCareLog: (log: CareLogItem) => void;
  language: Language;
}

export default function FarmPlotsManager({
  plots,
  careLogs,
  onAddPlot,
  onUpdatePlot,
  onDeletePlot,
  onAddCareLog,
  language,
}: FarmPlotsManagerProps) {
  const t = getTranslation(language);

  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.plot_id || '');
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form states for Plot
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState('สวนยางพารา');
  const [areaRai, setAreaRai] = useState('5');
  const [plantingDate, setPlantingDate] = useState('2020-05-15');
  const [soilType, setSoilType] = useState('ดินร่วนปนทราย');
  const [soilPh, setSoilPh] = useState('5.0');
  const [organicMatter, setOrganicMatter] = useState('2.0');
  const [notes, setNotes] = useState('');

  // Form states for Care Log
  const [logTitle, setLogTitle] = useState('');
  const [logType, setLogType] = useState<'fertilizer' | 'soil_amendment' | 'observation'>('soil_amendment');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logDetails, setLogDetails] = useState('');
  const [logObservedResult, setLogObservedResult] = useState('');

  const currentPlot = plots.find((p) => p.plot_id === selectedPlotId) || plots[0];
  const plotLogs = careLogs.filter((l) => l.plot_id === currentPlot?.plot_id);

  // Scientific Lime Dosage Calculation
  const currentPhNumber = currentPlot?.soil_test_results?.ph || 5.2;
  const texture = currentPlot?.soil_type?.includes('เหนียว')
    ? 'clay'
    : currentPlot?.soil_type?.includes('ทราย')
    ? 'sand'
    : 'loam';

  const limeCalculation = calculateLimeRequirement(
    currentPhNumber,
    6.2,
    texture,
    currentPlot?.area_rai || 1
  );

  const handleOpenAddPlot = () => {
    setEditingPlot(null);
    setPlotName('');
    setCropType('สวนยางพารา');
    setAreaRai('4');
    setPlantingDate('2021-06-01');
    setSoilType('ดินร่วน');
    setSoilPh('5.2');
    setOrganicMatter('2.1');
    setNotes('');
    setIsPlotModalOpen(true);
  };

  const handleOpenEditPlot = (plot: FarmPlot) => {
    setEditingPlot(plot);
    setPlotName(plot.plot_name);
    setCropType(plot.crop_type);
    setAreaRai(String(plot.area_rai));
    setPlantingDate(plot.planting_date);
    setSoilType(plot.soil_type);
    setSoilPh(String(plot.soil_test_results?.ph || 5.5));
    setOrganicMatter(String(plot.soil_test_results?.organic_matter_percent || 2.0));
    setNotes(plot.notes || '');
    setIsPlotModalOpen(true);
  };

  const handleSavePlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlot: FarmPlot = {
      plot_id: editingPlot?.plot_id || `plot-${Date.now()}`,
      user_id: editingPlot?.user_id || 'user-default',
      plot_name: plotName.trim() || 'แปลงเกษตรของฉัน',
      crop_type: cropType,
      area_rai: parseFloat(areaRai) || 1,
      planting_date: plantingDate,
      soil_type: soilType,
      soil_test_results: {
        ph: parseFloat(soilPh) || 5.5,
        n_level: 'medium',
        p_level: 'medium',
        k_level: 'medium',
        organic_matter_percent: parseFloat(organicMatter) || 2.0,
        test_date: new Date().toISOString().split('T')[0],
      },
      notes: notes.trim(),
    };

    if (editingPlot) {
      onUpdatePlot(newPlot);
    } else {
      onAddPlot(newPlot);
      setSelectedPlotId(newPlot.plot_id);
    }
    setIsPlotModalOpen(false);
  };

  const handleSaveCareLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlot) return;

    const newLog: CareLogItem = {
      log_id: `log-${Date.now()}`,
      plot_id: currentPlot.plot_id,
      date: logDate,
      activity_type: logType,
      title: logTitle.trim() || 'บันทึกการดูแลแปลง',
      details: logDetails.trim(),
      observed_result: logObservedResult.trim(),
    };

    onAddCareLog(newLog);
    setIsLogModalOpen(false);
    setLogTitle('');
    setLogDetails('');
    setLogObservedResult('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#2D6A4F]" />
            <span>{t.plots_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
            จัดการแปลงเกษตรหลายแปลง ตรวจสอบค่า pH และบันทึกประวัติการดูแลต่อเนื่อง
          </p>
        </div>

        <button
          onClick={handleOpenAddPlot}
          className="px-6 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{t.plots_add}</span>
        </button>
      </div>

      {/* Plot Selector Chips */}
      {plots.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {plots.map((plot) => {
            const isSelected = plot.plot_id === currentPlot?.plot_id;
            return (
              <button
                key={plot.plot_id}
                onClick={() => setSelectedPlotId(plot.plot_id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                    : 'bg-white text-[#4A453E] border-[#DCD4C7] hover:bg-[#F3EFE7]'
                }`}
              >
                <span>🌱</span>
                <span>{plot.plot_name}</span>
                <span className="text-[11px] opacity-80">({plot.crop_type})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Current Plot Dashboard */}
      {currentPlot ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Plot Summary & Soil Health Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5DFD4] shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-[#F2ECE1] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#7F4F24] uppercase tracking-wide">
                    {currentPlot.crop_type}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1B4332] font-heading mt-0.5">
                    {currentPlot.plot_name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditPlot(currentPlot)}
                    className="p-2 text-[#5C5549] hover:bg-[#F4EFE6] rounded-xl cursor-pointer"
                    title={t.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {plots.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบแปลง "${currentPlot.plot_name}" ใช่หรือไม่?`)) {
                          onDeletePlot(currentPlot.plot_id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#EDE7DD]">
                  <span className="text-[#8C8476] block">ขนาดแปลง:</span>
                  <span className="font-extrabold text-base text-[#1B4332] font-heading">
                    {currentPlot.area_rai} ไร่
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#EDE7DD]">
                  <span className="text-[#8C8476] block">ลักษณะดิน:</span>
                  <span className="font-bold text-sm text-[#242220]">
                    {currentPlot.soil_type}
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#EDE7DD]">
                  <span className="text-[#8C8476] block">วันเริ่มปลูก:</span>
                  <span className="font-bold text-sm text-[#242220]">
                    {currentPlot.planting_date}
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#EDE7DD]">
                  <span className="text-[#8C8476] block">อินทรียวัตถุ (OM):</span>
                  <span className="font-extrabold text-base text-emerald-800 font-heading">
                    {currentPlot.soil_test_results?.organic_matter_percent || 1.8}%
                  </span>
                </div>
              </div>

              {/* Interactive Soil pH Gauge & Chemical Health */}
              <div className="bg-gradient-to-r from-amber-50/60 to-emerald-50/60 p-5 rounded-2xl border border-emerald-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1B4332]">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#2D6A4F]" />
                    <span>ผลตรวจค่ากรด-ด่างดิน (Soil pH)</span>
                  </span>
                  <span className="text-base font-extrabold font-heading text-[#7F4F24] bg-white px-2.5 py-0.5 rounded-lg border border-[#DDD5C5]">
                    pH {currentPhNumber}
                  </span>
                </div>

                {/* pH Scale Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-500 to-blue-500 relative">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-black rounded-full shadow-md"
                      style={{
                        left: `${Math.min(95, Math.max(5, ((currentPhNumber - 4.0) / 4.5) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7A7264] px-1 font-semibold">
                    <span>4.0 (กรดจัดมาก)</span>
                    <span>5.5 (กรดปานกลาง)</span>
                    <span className="text-emerald-700 font-bold">6.0-6.5 (เหมาะสม)</span>
                    <span>7.0 (กลาง)</span>
                    <span>8.5 (ด่าง)</span>
                  </div>
                </div>

                {/* Acidity Interpretation */}
                <div className="text-xs text-[#423C35] pt-1">
                  {currentPhNumber < 5.0 ? (
                    <span className="text-red-700 font-bold">
                      ⚠️ ดินเปรี้ยวจัด (pH &lt; 5.0): รากพืชดูดซึมฟอสฟอรัสได้ยาก ควรใส่โดโลไมท์ปรับปรุงดิน
                    </span>
                  ) : currentPhNumber <= 6.5 ? (
                    <span className="text-emerald-800 font-bold">
                      ✅ ดินมีความสมดุลกรด-ด่างดีเยี่ยม (pH 5.5 - 6.5): ธาตุอาหารละลายตัวในรูปที่พืชดูดกินได้เต็มที่
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold">
                      ℹ️ ดินค่อนข้างเป็นกลางถึงด่างอ่อน
                    </span>
                  )}
                </div>
              </div>

              {/* Scientific Dolomite / Lime Calculator based on Pure Logic Rules */}
              {limeCalculation.needsTreatment && (
                <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E0D8CB] space-y-2 text-xs">
                  <div className="font-bold text-[#7F4F24] flex items-center gap-1.5 font-heading">
                    <Activity className="w-4 h-4 text-[#7F4F24]" />
                    <span>คำนวณปริมาณปูนมาร์ล / โดโลไมท์ตามหลักวิทยาศาสตร์ดิน:</span>
                  </div>
                  <p className="text-[#5C5549] leading-relaxed">
                    เพื่อยกระดับค่า pH จาก {currentPhNumber} เป็น 6.2 ในพื้นที่ {currentPlot.area_rai} ไร่ (เนื้อ{currentPlot.soil_type}):
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-bold">
                    <span className="bg-white px-3 py-1.5 rounded-xl border border-[#D5CDC0] text-[#1B4332]">
                      ปูนมาร์ล: {limeCalculation.limeKgTotal} กก.
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-xl border border-[#D5CDC0] text-[#7F4F24]">
                      โดโลไมท์ (เสริมแมกนีเซียม): {limeCalculation.dolomiteKgTotal} กก.
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7264] italic">
                    {limeCalculation.scientificExplanation}
                  </p>
                </div>
              )}

              {currentPlot.notes && (
                <div className="text-xs text-[#5C5549] bg-[#F7F4EE] p-3 rounded-2xl border border-[#E5DFD4]">
                  <span className="font-bold text-[#1B4332]">หมายเหตุแปลง:</span> {currentPlot.notes}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Plot Care Log & History */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#E5DFD4] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                <h3 className="text-base font-bold text-[#1B4332] font-heading flex items-center gap-2">
                  <History className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t.plots_history_title}</span>
                </h3>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </button>
              </div>

              {plotLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#7A7264]">
                  ยังไม่มีบันทึกการดูแลสำหรับแปลงนี้ กดปุ่ม &quot;บันทึก&quot; ด้านบนเพื่อเพิ่มประวัติ
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {plotLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E8E2D5] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1B4332] font-heading">{log.title}</span>
                        <span className="text-[10px] text-[#8C8476]">{log.date}</span>
                      </div>
                      <p className="text-[#5C5549]">{log.details}</p>
                      {log.observed_result && (
                        <div className="bg-white p-2 rounded-xl text-[11px] text-emerald-800 font-medium border border-emerald-100 flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>ผลที่สังเกตได้: {log.observed_result}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DFD4] p-6">
          <Layers className="w-12 h-12 text-[#9E9585] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1B4332] font-heading">{t.plots_no_plots}</h3>
        </div>
      )}

      {/* Modal: Add or Edit Farm Plot */}
      {isPlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FBF9F4] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2DBD0] overflow-hidden my-auto animate-in zoom-in-95">
            <form onSubmit={handleSavePlot} className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <h3 className="text-xl font-bold text-[#1B4332] font-heading">
                  {editingPlot ? 'แก้ไขข้อมูลแปลงเกษตร' : 'เพิ่มแปลงเกษตรใหม่'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="text-sm font-semibold text-[#7A7264] hover:text-[#242220] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  ชื่อแปลงเกษตร
                </label>
                <input
                  type="text"
                  required
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder="เช่น สวนยางพาราควนหิน, สวนทุเรียนเนินงาม"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2 text-sm font-medium text-[#242220]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    พืชที่ปลูก
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                  >
                    <option value="สวนยางพารา">สวนยางพารา</option>
                    <option value="สวนปาล์มน้ำมัน">สวนปาล์มน้ำมัน</option>
                    <option value="สวนผลไม้">สวนผลไม้ (ทุเรียน/มังคุด)</option>
                    <option value="นาข้าว">นาข้าว</option>
                    <option value="ผักสวนครัว">ผักสวนครัว / ผักอินทรีย์</option>
                    <option value="พืชไร่">พืชไร่</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    พื้นที่ (ไร่)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={areaRai}
                    onChange={(e) => setAreaRai(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    ลักษณะเนื้อดิน
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                  >
                    <option value="ดินร่วน">ดินร่วน</option>
                    <option value="ดินร่วนปนทราย">ดินร่วนปนทราย</option>
                    <option value="ดินเหนียว">ดินเหนียว</option>
                    <option value="ดินทราย">ดินทราย</option>
                    <option value="ดินลูกรัง">ดินลูกรัง / มีกรวด</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    ค่า pH ดิน (หากทราบ)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="9.0"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  หมายเหตุ / ปัญหาที่พบบริเวณนี้
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น ดินแข็งเป็นดาน, น้ำขังช่วงมรสุม, ใบเหลืองต้นไม่โต"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3.5 py-2 text-xs font-medium text-[#242220]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CDC0] text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Care Log */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#FBF9F4] w-full max-w-md rounded-3xl shadow-2xl border border-[#E2DBD0] p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#1B4332] font-heading">
              {t.plots_log_add}
            </h3>

            <form onSubmit={handleSaveCareLog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  หัวข้อกิจกรรม
                </label>
                <input
                  type="text"
                  required
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  placeholder="เช่น ใส่ปุ๋ยหมักชีวภาพ, ตัดหญ้าคลุมโคน, ฉีดน้ำหมัก"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-2 text-xs font-medium text-[#242220]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    วันที่ดำเนินการ
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-1.5 text-xs font-medium text-[#242220]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                    ประเภทกิจกรรม
                  </label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as any)}
                    className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-1.5 text-xs font-medium text-[#242220]"
                  >
                    <option value="soil_amendment">ปรับปรุงดิน</option>
                    <option value="fertilizer">ใส่ปุ๋ย</option>
                    <option value="observation">สังเกตผล</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  รายละเอียดที่ทำ
                </label>
                <textarea
                  rows={2}
                  required
                  value={logDetails}
                  onChange={(e) => setLogDetails(e.target.value)}
                  placeholder="เช่น หว่านโดโลไมท์ 100 กก. ผสมรดน้ำหมักหน่อกล้วย"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-1.5 text-xs font-medium text-[#242220]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                  ผลที่สังเกตได้ (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={logObservedResult}
                  onChange={(e) => setLogObservedResult(e.target.value)}
                  placeholder="เช่น รากฝอยเริ่มแทงขาว ดินร่วนขึ้น ยอดแตกดี"
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl px-3 py-1.5 text-xs font-medium text-[#242220]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CDC0] text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
