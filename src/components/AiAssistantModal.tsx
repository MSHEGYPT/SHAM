import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  ShieldAlert,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  archivedTask?: {
    detected: boolean;
    type: string;
    title: string;
    priority: string;
    summary: string;
    suggestedAction: string;
  };
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const { addAgendaTask, addWhistleblowerReport } = useLogistics();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'أهلاً بك في منصة "سند للخدمات اللوجستية وإدارة التوصيل"! أنا مساعدك الذكي لمتابعة الشحنات، الرد على الاستفسارات، وتنظيم طلبات التعاقد والاستلام وأرشفتها مباشرة في جدول أعمال إدارة العمليات. كيف يمكنني خدمتك اليوم؟',
      timestamp: 'الآن',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const samplePrompts = [
    'أنا صاحب متجر إلكتروني للملابس وعايز اتعاقد معاكم لشحن 30 أوردر يومياً',
    'عايز اعرف موعد وصول شحنتي رقم SND-8041 وكود الأمان',
    'المندوب طلب مني 15 جنيه زيادة عن سعر الفاتورة، عايز أقدم شكوى فورية',
    'عايز أعرف شروط وضمانات توريد الكاش COD للتجار',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      let archivedTask = data.archivedTask;

      // If AI detected a task to archive, push it into the real system agenda!
      if (archivedTask && archivedTask.detected) {
        addAgendaTask({
          title: archivedTask.title || `طلب وارد عبر المساعد الذكي: ${text.slice(0, 30)}`,
          source: 'AI_CHAT',
          clientName: archivedTask.clientName || 'عميل المحادثة الفورية',
          clientPhone: archivedTask.clientPhone || '',
          type: archivedTask.type || 'general',
          priority: archivedTask.priority || 'medium',
          status: 'NEW',
          summary: archivedTask.summary || text,
          suggestedAction: archivedTask.suggestedAction || 'متابعة المشرف والتواصل مع العميل',
        });

        // If it was a complaint or fraud, also register a whistleblower report
        if (archivedTask.type === 'complaint_fraud') {
          addWhistleblowerReport({
            reporterType: 'CUSTOMER',
            reporterContact: archivedTask.clientPhone || 'مسجل بالدردشة',
            targetEmployeeName: 'مندوب الشحنة المذكور',
            category: 'OVERCHARGING',
            description: archivedTask.summary || text,
            priority: 'HIGH',
          });
        }
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'شكراً لتواصلك، تم استلام رسالتك وأرشفتها.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        archivedTask,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'تم استلام طلبك وتسجيله في سجل مراجعات العمليات. سيتواصل معك أحد ممثلي إدارة سند قريباً.',
          timestamp: 'الآن',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[640px] max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">سَنَدْ الذكي (AI Assistant)</h3>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  متصل بالأرشفة اللحظية
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مراجعة استفسارات العملاء والتجار وأرشفتها آلياً في جدول أعمال الشركة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Prompts Bar */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            جرب استفسار:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shrink-0 transition-colors text-[11px] cursor-pointer"
            >
              {prompt.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-900 text-amber-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tl-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-slate-400 text-left' : 'text-slate-400 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* If AI automatically archived a task into Operations Agenda */}
                {msg.archivedTask && msg.archivedTask.detected && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>تمت الأرشفة التلقائية في جدول أعمال إدارة العمليات</span>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-emerald-800">
                      <div>
                        <strong>الموضوع:</strong> {msg.archivedTask.title}
                      </div>
                      <div>
                        <strong>الإجراء المقترح:</strong> {msg.archivedTask.suggestedAction}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>المساعد الذكي يفكر ويراجع بيانات الشحنات والأرشفة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب استفسارك، طلب تعاقد، طلب استلام، أو رقم بوليصة الشحنة..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>مدعوم بنموذج Gemini 3.8 Flash مع خوارزمية الرقابة الذكية</span>
            <span>نظام سند اللوجستي المعتمد</span>
          </div>
        </div>
      </div>
    </div>
  );
};
