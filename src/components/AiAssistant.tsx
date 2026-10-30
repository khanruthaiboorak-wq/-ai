/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  WifiOff,
  Bot,
  User,
  CheckCircle,
} from 'lucide-react';
import { UserProfile, FarmPlot, Language } from '../types/index.ts';
import { getTranslation } from '../translations/i18n.ts';

interface AiAssistantProps {
  userProfile: UserProfile;
  plots: FarmPlot[];
  isOnline: boolean;
  onNavigateToKnowledge: () => void;
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: string;
  source?: string;
}

export default function AiAssistant({
  userProfile,
  plots,
  isOnline,
  onNavigateToKnowledge,
  language,
}: AiAssistantProps) {
  const t = getTranslation(language);

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'model',
    text: `สวัสดีครับคุณ ${userProfile.display_name}! ผมคือ Soil Time AI ผู้ช่วยด้านดินและพืชสำหรับแปลงเกษตรของคุณ (${userProfile.farming_types?.join(', ') || 'ทั่วไป'})\n\nมีข้อสงสัยเรื่องดินแข็ง ดินเปรี้ยว สูตรปุ๋ยหมักชีวภาพ หรือต้องการวิเคราะห์ภาพถ่ายดิน/ใบพืช สามารถสอบถามได้เลยครับ!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'Soil Time AI',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    'ทำอย่างไรให้ดินร่วนขึ้น?',
    'ดินเปรี้ยว (กรดจัด) ปรับปรุงอย่างไร?',
    'ปุ๋ยหมักชีวภาพและปุ๋ยอัดเม็ดควรใช้อย่างไร?',
    'ควรใส่ปุ๋ยช่วงไหนให้พืชดูดซึมดีที่สุด?',
    'มีวิธีลดต้นทุนการดูแลสวนอย่างไรบ้าง?',
    'ดินในสวนยางพารา/ปาล์มน้ำมันควรดูแลอย่างไร?',
  ];

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'th-TH';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text || 'ช่วยวิเคราะห์ภาพดิน/พืชนี้ให้หน่อยครับ',
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      if (currentImage) {
        // Image analysis
        const res = await fetch('/api/gemini/analyze-soil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
            description: text,
            cropType: userProfile.farming_types?.join(', ') || '',
          }),
        });
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'model',
          text: data.analysis || 'ไม่สามารถวิเคราะห์ภาพได้ในขณะนี้ โปรดลองใหม่อีกครั้ง',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Text chat
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
            userProfile,
            plots,
          }),
        });
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'model',
          text: data.text || 'ขออภัยครับ ไม่สามารถรับคำตอบได้ในขณะนี้',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      // Offline fallback
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'model',
        text: `ขณะนี้ไม่ได้เชื่อมต่ออินเทอร์เน็ตหรือเซิร์ฟเวอร์ไม่ตอบสนองชั่วคราว\n\nคำแนะนำเบื้องต้น: สำหรับการดูแลดินทั่วไป แนะนำให้ใส่ปุ๋ยหมักชีวภาพคลุมดินเพื่อเพิ่มความชื้น และตรวจวัดค่า pH สม่ำเสมอ คุณยังสามารถเปิดอ่านบทความใน "คลังความรู้เรื่องดิน" ที่บันทึกไว้ในเครื่องได้โดยไม่ต้องใช้อินเทอร์เน็ตครับ`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local_offline_backup',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white rounded-3xl border border-[#E5DFD4] shadow-sm overflow-hidden animate-in fade-in">
      {/* AI Header with Model Identity & Speech Controls */}
      <div className="bg-[#1B4332] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/40 flex items-center justify-center border border-emerald-400/30">
            <Bot className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading flex items-center gap-2">
              <span>{t.ai_header}</span>
              <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-medium">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-emerald-200 line-clamp-1">{t.ai_sub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={() => handleSpeak('')}
              className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>หยุดเสียง</span>
            </button>
          )}

          <button
            onClick={() => setMessages([initialGreeting])}
            className="p-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-emerald-200 text-xs font-medium cursor-pointer"
            title="ล้างการสนทนา"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline Alert Notice Banner if Offline */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t.ai_offline_warning}</span>
          </div>
          <button
            onClick={onNavigateToKnowledge}
            className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer shrink-0 ml-2"
          >
            เปิดคลังความรู้
          </button>
        </div>
      )}

      {/* Mandatory Disclaimer Box */}
      <div className="bg-[#FAF7F0] border-b border-[#E8E2D5] px-4 py-2 flex items-start gap-2 text-[11px] sm:text-xs text-[#7F4F24]">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-tight">
          <span className="font-bold">{t.ai_disclaimer_title}</span> {t.ai_disclaimer_body}
        </p>
      </div>

      {/* Message Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBF9F4]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#1B4332] text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-emerald-300" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-3xl text-sm sm:text-base leading-relaxed ${
                    isUser
                      ? 'bg-[#1B4332] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-[#242220] rounded-tl-xs border border-[#E5DFD4] shadow-xs'
                  }`}
                >
                  {/* Uploaded image if present */}
                  {msg.image && (
                    <div className="mb-2.5 rounded-2xl overflow-hidden border border-black/10">
                      <img
                        src={msg.image}
                        alt="Soil sample"
                        className="w-full max-h-60 object-cover"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-line font-body">{msg.text}</div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#7A7264]">
                      <span className="font-medium text-emerald-800">
                        {msg.source ? `แหล่งข้อมูล: ${msg.source}` : 'Soil Time Expert'}
                      </span>
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="flex items-center gap-1 font-bold text-[#1B4332] hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t.ai_speak_answer}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-[#8C8476] px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-emerald-300 animate-spin" />
            </div>
            <div className="bg-white border border-[#E5DFD4] p-4 rounded-3xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-[#6C655A]">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium">Soil Time AI กำลังประมวลผลคำตอบ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-[#F6F2E9] border-t border-[#E8E2D5] overflow-x-auto scrollbar-none">
          <div className="text-[11px] font-bold text-[#7F4F24] mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{t.ai_quick_questions}</span>
          </div>
          <div className="flex gap-1.5 pb-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-[#D5CDC0] text-xs font-semibold text-[#3D372E] hover:bg-[#EBE5D8] cursor-pointer shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Thumbnail if selected */}
      {selectedImage && (
        <div className="px-4 py-2 bg-[#FAF7F0] border-t border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-12 h-12 object-cover rounded-xl border border-emerald-400"
            />
            <div className="text-xs">
              <div className="font-bold text-[#1B4332]">ภาพตัวอย่างดิน/พืชที่เลือก</div>
              <div className="text-[11px] text-[#7A7264]">พร้อมส่งให้ AI วิเคราะห์เบื้องต้น</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
          >
            ลบรูป
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-white border-t border-[#E8E2D5] flex items-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#F4EFE6] hover:bg-[#EAE4D7] text-[#423C35] border border-[#DDD5C5] cursor-pointer transition-colors shrink-0"
          title={t.ai_image_prompt}
        >
          <Camera className="w-5 h-5 text-[#2D6A4F]" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.ai_input_placeholder}
          disabled={isLoading}
          className="flex-1 bg-[#FBF9F4] border border-[#D5CDC0] rounded-2xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading || (!inputText.trim() && !selectedImage)}
          className="p-2.5 sm:p-3 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-gray-300 text-white rounded-2xl shadow-md cursor-pointer transition-all shrink-0 flex items-center justify-center"
          title={t.ai_send}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
