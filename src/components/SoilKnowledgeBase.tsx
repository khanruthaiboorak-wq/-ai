/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  Atom,
  Share2,
} from 'lucide-react';
import { SoilArticle, BioscienceCompound, Language } from '../types/index.ts';
import { SOIL_ARTICLES, BIOSCIENCE_COMPOUNDS } from '../data/soil-knowledge.ts';
import { getTranslation } from '../translations/i18n.ts';

interface SoilKnowledgeBaseProps {
  bookmarkedIds: string[];
  downloadedIds: string[];
  onToggleBookmark: (id: string) => void;
  onToggleDownload: (id: string) => void;
  language: Language;
}

export default function SoilKnowledgeBase({
  bookmarkedIds,
  downloadedIds,
  onToggleBookmark,
  onToggleDownload,
  language,
}: SoilKnowledgeBaseProps) {
  const t = getTranslation(language);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<SoilArticle | null>(null);
  const [showScienceExplorer, setShowScienceExplorer] = useState(false);
  const [selectedCompound, setSelectedCompound] = useState<BioscienceCompound | null>(BIOSCIENCE_COMPOUNDS[0]);

  const categories = [
    { id: 'all', label: t.know_cat_all, icon: '📖' },
    { id: 'basic', label: t.know_cat_basic, icon: '🌱' },
    { id: 'problems', label: t.know_cat_problems, icon: '⚠️' },
    { id: 'organic', label: t.know_cat_organic, icon: '🍂' },
    { id: 'crops', label: t.know_cat_crops, icon: '🌴' },
    { id: 'sampling', label: t.know_cat_sampling, icon: '🧪' },
    { id: 'science', label: t.know_cat_science, icon: '🔬' },
  ];

  const filteredArticles = SOIL_ARTICLES.filter((article) => {
    if (activeCategory !== 'all' && article.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(q);
      const matchExcerpt = article.excerpt.toLowerCase().includes(q);
      const matchTags = article.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchExcerpt || matchTags;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner with Science Explorer Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#2D6A4F]" />
            <span>{t.know_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
            บทความอ่านง่าย พร้อมระบบดาวน์โหลดเก็บไว้ใช้ออฟไลน์ และเคมีดินตามหลักชีววิทยาศาสตร์
          </p>
        </div>

        <button
          onClick={() => setShowScienceExplorer(!showScienceExplorer)}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 ${
            showScienceExplorer
              ? 'bg-[#1B4332] text-white shadow-md'
              : 'bg-[#FAF7F0] text-[#7F4F24] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
          }`}
        >
          <Atom className="w-4 h-4 text-emerald-400" />
          <span>{showScienceExplorer ? 'ดูบทความทั่วไป' : '🔬 วิทยาศาสตร์ชีวภาพ & เคมีดิน'}</span>
        </button>
      </div>

      {/* Bioscience & Chemical Compounds Explorer (Science Skill Integration) */}
      {showScienceExplorer ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD4] shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between border-b border-[#F2ECE1] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>PubChem & Soil Chemistry Standards</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading">
                วิทยาศาสตร์ชีวภาพและเคมีธาตุอาหารในดิน (Bioscience)
              </h2>
              <p className="text-xs sm:text-sm text-[#6C655A] mt-1">
                โครงสร้างโมเลกุลที่แท้จริงจาก PubChem ปฏิกิริยาเคมีในดิน และประโยชน์ต่อพืชตามหลักวิชาการ
              </p>
            </div>
          </div>

          {/* Compound Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BIOSCIENCE_COMPOUNDS.map((comp) => {
              const isSelected = selectedCompound?.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompound(comp)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-[#FAF7F0] text-[#4A453E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <span>⚗️</span>
                  <span>{comp.name_th}</span>
                  <span className="text-[10px] opacity-75">({comp.formula})</span>
                </button>
              );
            })}
          </div>

          {/* Selected Compound Detail Card */}
          {selectedCompound && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF7F0] p-6 rounded-3xl border border-[#E8E2D5]">
              {/* 2D Molecular Structure from PubChem */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0D8CB] flex flex-col items-center justify-center text-center">
                <div className="w-full aspect-square max-w-[200px] flex items-center justify-center bg-white rounded-xl overflow-hidden p-2">
                  <img
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedCompound.pubchem_cid}/PNG`}
                    alt={selectedCompound.name_en}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails or offline
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="mt-3">
                  <div className="font-heading font-bold text-sm text-[#1B4332]">
                    {selectedCompound.name_en}
                  </div>
                  <div className="text-xs font-mono text-[#7F4F24] font-bold mt-0.5">
                    {selectedCompound.formula}
                  </div>
                  <div className="text-[11px] text-[#8C8476] mt-1">
                    PubChem CID: {selectedCompound.pubchem_cid} | MW: {selectedCompound.molecular_weight}
                  </div>
                </div>

                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedCompound.pubchem_cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>ดูข้อมูลใน PubChem</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Chemical details and Soil Reaction Equation */}
              <div className="md:col-span-2 space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-[#1B4332] font-heading mb-1">
                    บทบาทในการเกษตร:
                  </h3>
                  <p className="text-[#423C35] leading-relaxed bg-white p-3.5 rounded-2xl border border-[#E0D8CB]">
                    {selectedCompound.agricultural_role}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#7F4F24] font-heading mb-1">
                    ปฏิกิริยาเคมีเมื่อลงสู่ดิน (Reaction in Soil):
                  </h3>
                  <div className="bg-white p-3.5 rounded-2xl border border-[#E0D8CB] font-body font-medium text-xs text-[#1B4332] leading-relaxed">
                    {selectedCompound.reaction_in_soil}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                    <div className="font-bold text-emerald-900 mb-1">ประโยชน์ต่อพืช:</div>
                    <p className="text-emerald-800 leading-relaxed">
                      {selectedCompound.benefits_to_crop}
                    </p>
                  </div>
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                    <div className="font-bold text-amber-900 mb-1">ข้อควรระวังสำคัญ:</div>
                    <p className="text-amber-800 leading-relaxed">
                      {selectedCompound.cautions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-[#8C8476] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.know_search_placeholder}
            className="w-full bg-white border border-[#D5CDC0] rounded-2xl pl-12 pr-4 py-3 text-sm sm:text-base font-medium text-[#242220] shadow-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-white text-[#4A453E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => {
          const isBookmarked = bookmarkedIds.includes(article.id);
          const isDownloaded = downloadedIds.includes(article.id);

          return (
            <div
              key={article.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DFD4] shadow-xs hover:shadow-md hover:border-[#1B4332]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-xs text-[#8C8476] mb-3">
                  <span className="flex items-center gap-1 text-[#7F4F24] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.read_time}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Offline Saved Badge */}
                    {isDownloaded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ออฟไลน์แล้ว
                      </span>
                    )}

                    <button
                      onClick={() => onToggleBookmark(article.id)}
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-[#8C8476] hover:bg-[#F4EFE6]'
                      }`}
                      title={t.know_favorite}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1B4332] font-heading line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6C655A] mt-2 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#7F4F24] border border-[#EDE7DD]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-[#F2ECE1] flex items-center justify-between">
                <button
                  onClick={() => onToggleDownload(article.id)}
                  className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDownloaded
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#FAF7F0] text-[#554E44] border-[#D5CDC0] hover:bg-[#F0EAE0]'
                  }`}
                  title={t.know_save_offline}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloaded ? 'บันทึกในเครื่องแล้ว' : 'โหลดออฟไลน์'}</span>
                </button>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
                >
                  <span>อ่านต่อ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FBF9F4] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2DBD0] overflow-hidden my-auto animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#E8E2D5] bg-white flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#7F4F24] uppercase tracking-wide">
                  คลังความรู้ Soil Time
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-heading mt-1">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-sm font-semibold text-[#7A7264] hover:text-[#242220] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-[#3D372E] leading-relaxed">
              {/* Key takeaways */}
              <div className="bg-emerald-50/80 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-2">
                <div className="font-bold text-[#1B4332] text-sm font-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>สาระสำคัญที่ต้องจำ:</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {selectedArticle.key_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main text paragraphs */}
              <div className="space-y-3 font-body">
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Do's and Don'ts if available */}
              {selectedArticle.dos_and_donts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                    <div className="font-bold text-emerald-900 text-xs mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>สิ่งที่ควรทำ (DO):</span>
                    </div>
                    <ul className="space-y-1 text-xs text-[#423C35]">
                      {selectedArticle.dos_and_donts.dos.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-red-200">
                    <div className="font-bold text-red-900 text-xs mb-2 flex items-center gap-1.5">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>สิ่งที่ไม่ควรทำ (DON&apos;T):</span>
                    </div>
                    <ul className="space-y-1 text-xs text-[#423C35]">
                      {selectedArticle.dos_and_donts.donts.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E8E2D5] bg-white flex items-center justify-between">
              <button
                onClick={() => onToggleDownload(selectedArticle.id)}
                className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadedIds.includes(selectedArticle.id)
                    ? 'บันทึกในเครื่องแล้ว'
                    : 'ดาวน์โหลดเก็บไว้ใช้ออฟไลน์'}
                </span>
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
