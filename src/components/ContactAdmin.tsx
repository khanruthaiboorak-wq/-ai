/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Headphones,
  PhoneCall,
  MessageSquare,
  Clock,
  Send,
  WifiOff,
  CheckCheck,
  Check,
  User,
  ShieldCheck,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { AdminMessage, Language, UserProfile } from '../types/index.ts';
import { getTranslation } from '../translations/i18n.ts';

interface ContactAdminProps {
  messages: AdminMessage[];
  onSendMessage: (msg: AdminMessage) => void;
  isOnline: boolean;
  language: Language;
  userProfile?: UserProfile | null;
}

export default function ContactAdmin({
  messages,
  onSendMessage,
  isOnline,
  language,
  userProfile,
}: ContactAdminProps) {
  const t = getTranslation(language);

  const [inputMessage, setInputMessage] = useState('');
  const [copiedLine, setCopiedLine] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: AdminMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      user_id: userProfile?.user_id,
      user_name: userProfile?.display_name || 'เกษตรกร',
      location: userProfile?.location || 'ประเทศไทย',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      status: isOnline ? 'sent' : 'queued_offline',
    };

    onSendMessage(newMsg);
    setInputMessage('');

    // If online, simulate expert staff receiving message and providing standard receipt acknowledgement
    if (isOnline) {
      setTimeout(() => {
        const staffAcknowledgement: AdminMessage = {
          id: `msg-ack-${Date.now()}`,
          sender: 'admin',
          message: 'เจ้าหน้าที่ศูนย์วิชาการเกษตรได้รับข้อความของคุณแล้ว กำลังตรวจสอบข้อมูลแปลงเกษตรและจะตอบกลับโดยเร็วในเวลาทำการ (08:30 - 17:00 น.) ขอขอบคุณที่ไว้วางใจ Soil Time ครับ',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          reply_to: newMsg.id,
        };
        onSendMessage(staffAcknowledgement);
      }, 1500);
    }
  };

  const getStatusBadge = (status: AdminMessage['status']) => {
    switch (status) {
      case 'queued_offline':
        return { label: t.status_notif_queued_offline, color: 'text-amber-700 font-semibold' };
      case 'sent':
        return { label: t.status_notif_sent, color: 'text-blue-700' };
      case 'delivered':
        return { label: t.status_notif_delivered, color: 'text-emerald-700' };
      case 'read':
      case 'replied':
        return { label: 'เจ้าหน้าที่ตอบกลับแล้ว', color: 'text-emerald-800 font-bold' };
      default:
        return { label: '', color: '' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5DFD4] shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-heading flex items-center gap-2.5">
          <Headphones className="w-7 h-7 text-[#2D6A4F]" />
          <span>{t.admin_title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6C655A] mt-1">{t.admin_subtitle}</p>
      </div>

      {/* Operating Hours & Hotline Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hours card (Transparent as required in prompt) */}
        <div className="bg-[#FAF7F0] p-5 rounded-3xl border border-[#E8E2D5] space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7F4F24] font-heading">
            <Clock className="w-4 h-4 text-[#2D6A4F]" />
            <span>{t.admin_hours_title}</span>
          </div>
          <p className="text-xs text-[#5C5549] leading-relaxed">
            {t.admin_hours_body}
          </p>
          <div className="pt-2 text-[11px] text-[#7A7264] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ระบบบันทึกข้อความเปิดรับ 24 ชั่วโมง (ตอบกลับในเวลาทำการ)</span>
          </div>
        </div>

        {/* Official Channels */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#1B4332] font-heading mb-1">
              ช่องทางด่วนกรมพัฒนาที่ดิน
            </div>
            <p className="text-xs text-[#6C655A]">
              สายด่วนเพื่อเกษตรกร ตรวจสอบการส่งตัวอย่างดิน และขอรับสารเร่ง พด. ฟรี
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="tel:1760"
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>สายด่วนพัฒนาที่ดิน 1760</span>
            </a>

            <a
              href="https://line.me/ti/p/~ktpp0602"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="เปิด LINE เพื่อแอดไอดี ktpp0602"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.admin_line_connect}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('ktpp0602');
                setCopiedLine(true);
                setTimeout(() => setCopiedLine(false), 2000);
              }}
              className="px-3.5 py-2.5 bg-[#FAF7F0] hover:bg-[#F0EAE0] text-[#4A453E] border border-[#DDD5C5] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="คัดลอก LINE ID ktpp0602"
            >
              {copiedLine ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">คัดลอกไอดีแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7A7264]" />
                  <span>คัดลอกไอดี (ktpp0602)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* In-App Direct Message Chat Box */}
      <div className="bg-white rounded-3xl border border-[#E5DFD4] shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 bg-[#F7F4EE] border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1B4332] font-heading">
                กล่องข้อความปรึกษาเจ้าหน้าที่เกษตร
              </div>
              <div className="text-[10px] text-[#7A7264]">
                แยกข้อความจากเจ้าหน้าที่จริงออกจากระบบ AI อัตโนมัติอย่างชัดเจน
              </div>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-[#554E44]">
            {isOnline ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>พร้อมส่งทันที</span>
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>คิวออฟไลน์</span>
              </span>
            )}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBF9F4]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isSystem = m.sender === 'system';
            const badge = getStatusBadge(m.status);

            if (isSystem) {
              return (
                <div key={m.id} className="text-center my-3">
                  <span className="inline-block bg-[#EFEAE0] text-[#554E44] px-4 py-1.5 rounded-full text-xs font-medium max-w-lg leading-relaxed">
                    📢 {m.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-emerald-900 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-300" />}
                </div>

                <div className="max-w-[80%] space-y-1">
                  <div className="text-[10px] font-bold text-[#7A7264] px-1 flex items-center gap-1">
                    <span>{isUser ? 'คุณ (เกษตรกร)' : '👨‍🌾 เจ้าหน้าที่ส่งเสริมการเกษตร'}</span>
                    {!isUser && (
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[9px]">
                        เจ้าหน้าที่จริง
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#1B4332] text-white rounded-tr-xs'
                        : 'bg-white text-[#242220] rounded-tl-xs border border-[#E2DBD0]'
                    }`}
                  >
                    {m.message}
                  </div>

                  <div
                    className={`text-[10px] px-1 flex items-center gap-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    } ${badge.color}`}
                  >
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {badge.label && <span>• {badge.label}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E8E2D5] flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isOnline ? t.admin_input_placeholder : 'ออฟไลน์: ข้อความจะถูกเก็บในเครื่องและส่งเมื่อต่อเน็ต...'}
            className="flex-1 bg-[#FBF9F4] border border-[#D5CDC0] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#242220] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-gray-300 text-white rounded-2xl shadow-xs cursor-pointer transition-all shrink-0"
            title={t.admin_send}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
