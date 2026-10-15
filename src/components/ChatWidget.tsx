import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  MessageSquare,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Minimize2,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  UserCheck,
  ChevronRight,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  submitQuoteRequest,
  validateVietnamPhone,
  validateEmailOptional,
  extractVietnamPhoneFromText,
} from '../utils/quoteApi';
import {
  ChatLinkCard,
  getConsultationBundle,
} from '../data/chatConsultingData';
import { OptimizedImage } from './OptimizedImage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  cards?: ChatLinkCard[];
  showZaloCta?: boolean;
  isError?: boolean;
  isLeadSuccess?: boolean;
  failedUserPrompt?: string;
}

interface ChatWidgetProps {
  onNavigate?: (path: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

const SESSION_HISTORY_KEY = 'mt_chat_history_v2';
const SESSION_GREETED_KEY = 'mt_chat_auto_greeted_v1';
const LIVE_CHAT_ZALO_URL = 'https://zalo.me/0918321642';

const INITIAL_GREETING_TEXT =
  'Xin chào! Minh Tiến In Ấn & Quảng Cáo có thể hỗ trợ gì cho anh/chị ạ?';

const QUICK_SUGGESTIONS = [
  {
    label: 'Báo giá bảng hiệu',
    prompt:
      'Cho mình hỏi báo giá làm bảng hiệu quảng cáo (Alu, chữ nổi, hộp đèn, đèn LED) tại Minh Tiến tính như thế nào?',
  },
  {
    label: 'In ấn',
    prompt:
      'Tư vấn giúp mình dịch vụ in ấn (name card, tem nhãn decal, hóa đơn, catalogue, thiệp cưới) và hình thẻ lấy ngay tại Minh Tiến.',
  },
  {
    label: 'Địa chỉ & giờ mở cửa',
    prompt:
      'Cho mình xin địa chỉ chính xác, số điện thoại liên hệ và giờ mở cửa của cơ sở Minh Tiến Kiên Lương.',
  },
  {
    label: 'Đặt lịch khảo sát',
    prompt:
      'Mình muốn đặt lịch khảo sát đo đạc bảng hiệu tận nơi tại Kiên Lương / Ba Hòn thì cần cung cấp thông tin gì?',
  },
];

function formatCurrentTime(): string {
  try {
    return new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(SESSION_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Ignore storage read error
      }
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: INITIAL_GREETING_TEXT,
        timestamp: formatCurrentTime(),
        showZaloCta: true,
      },
    ];
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mini-form "Để lại SĐT nhận báo giá" ngay trong Chatbot
  const [showLeadForm, setShowLeadForm] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadService, setLeadService] = useState<string>('Bảng hiệu quảng cáo');
  const [leadNote, setLeadNote] = useState<string>('');
  const [leadHoneypot, setLeadHoneypot] = useState<string>('');
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadFormError, setLeadFormError] = useState<string>('');
  const [leadServerFailed, setLeadServerFailed] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Save conversation history in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(messages));
      } catch {
        // Ignore storage quota error
      }
    }
  }, [messages]);

  // Auto-show greeting after 3.8 seconds (within 3-5s window) once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let alreadyGreeted = false;
    try {
      alreadyGreeted = sessionStorage.getItem(SESSION_GREETED_KEY) === 'true';
    } catch {
      alreadyGreeted = false;
    }

    if (alreadyGreeted) return;

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_GREETED_KEY, 'true');
      } catch {
        // Ignore storage error
      }
      setShowGreetingBubble(true);
    }, 3800);

    return () => window.clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages change or typing indicator toggles
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, showLeadForm]);

  // Focus input when opening chat on desktop
  useEffect(() => {
    if (isOpen && !showLeadForm && typeof window !== 'undefined' && window.innerWidth >= 768) {
      const t = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, showLeadForm]);

  const handleOpenChat = () => {
    setShowGreetingBubble(false);
    try {
      sessionStorage.setItem(SESSION_GREETED_KEY, 'true');
    } catch {
      // Ignore
    }
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setShowGreetingBubble(false);
  };

  const handleNavigateCard = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const sendMessageToBot = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setShowGreetingBubble(false);
    setShowLeadForm(false);
    try {
      sessionStorage.setItem(SESSION_GREETED_KEY, 'true');
    } catch {
      // Ignore
    }
    if (!isOpen) {
      setIsOpen(true);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: formatCurrentTime(),
    };

    const historyForApi = messages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Lấy bộ câu trả lời dự phòng & danh sách thẻ đường dẫn/sản phẩm phù hợp theo chủ đề
    const fallbackBundle = getConsultationBundle(trimmed);

    // Kiểm tra xem khách có để lại số điện thoại Việt Nam trong tin nhắn chat không
    const detectedPhone = extractVietnamPhoneFromText(trimmed);

    try {
      if (detectedPhone) {
        const recentTranscript = [...historyForApi.slice(-4), { role: 'user', text: trimmed }]
          .map((m) => `${m.role === 'user' ? 'Khách' : 'Bot'}: ${m.text}`)
          .join('\n');

        const withoutPhone = trimmed.replace(/(?:\+?84|0)(?:[\s.\-]*\d){8,10}/g, '').trim();
        const inferredName =
          withoutPhone.length >= 2 && withoutPhone.length <= 45
            ? withoutPhone
            : `Khách hàng Chatbot (${detectedPhone})`;

        const quoteRes = await submitQuoteRequest({
          name: inferredName,
          phone: detectedPhone,
          service: 'Khách để lại SĐT trong Chatbot',
          message: `Tin nhắn khách gửi: "${trimmed}"\n\n--- Tóm tắt hội thoại gần nhất ---\n${recentTranscript}`,
          source: 'Chatbot Tư Vấn Trực Tuyến',
        });

        if (quoteRes.ok) {
          const confirmMsg: ChatMessage = {
            id: `lead-ok-${Date.now()}`,
            role: 'model',
            text: `Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm qua số điện thoại ${detectedPhone} của anh/chị ạ!`,
            timestamp: formatCurrentTime(),
            isLeadSuccess: true,
            showZaloCta: true,
          };
          setMessages((prev) => [...prev, confirmMsg]);
        } else {
          const errLeadMsg: ChatMessage = {
            id: `lead-err-${Date.now()}`,
            role: 'model',
            text:
              quoteRes.error ||
              `Hiện hệ thống gửi thông báo tự động đang tạm gián đoạn. Anh/chị vui lòng bấm nút Gọi điện hoặc Chat Zalo trực tuyến bên dưới để Minh Tiến tiếp nhận số ${detectedPhone} ngay ạ!`,
            timestamp: formatCurrentTime(),
            isError: true,
            showZaloCta: true,
          };
          setMessages((prev) => [...prev, errLeadMsg]);
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Nếu API trả về thành công có reply, dùng reply đó kèm cards; nếu không, dùng fallbackBundle có sẵn
      const finalReplyText =
        response.ok && typeof data.reply === 'string' && data.reply.trim()
          ? data.reply.trim()
          : fallbackBundle.fallbackReply;

      const finalCards: ChatLinkCard[] =
        Array.isArray(data.cards) && data.cards.length > 0
          ? data.cards
          : fallbackBundle.cards;

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: finalReplyText,
        timestamp: formatCurrentTime(),
        cards: finalCards,
        showZaloCta: true,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Khi mất mạng hoặc lỗi API, vẫn trả lời bằng câu trả lời dự phòng kèm đầy đủ thẻ đường dẫn & nút Zalo
      const botFallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        text: fallbackBundle.fallbackReply,
        timestamp: formatCurrentTime(),
        cards: fallbackBundle.cards,
        showZaloCta: true,
      };

      setMessages((prev) => [...prev, botFallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageToBot(inputValue);
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFormError('');
    setLeadServerFailed(false);

    if (!leadName.trim() || leadName.trim().length < 2) {
      setLeadFormError('Vui lòng nhập họ và tên của anh/chị (tối thiểu 2 ký tự).');
      return;
    }

    const phoneCheck = validateVietnamPhone(leadPhone);
    if (!leadPhone.trim() || !phoneCheck.valid) {
      setLeadFormError(
        'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số bắt đầu bằng 03, 05, 07, 08, 09...).'
      );
      return;
    }

    if (leadEmail.trim() && !validateEmailOptional(leadEmail)) {
      setLeadFormError('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsSubmittingLead(true);
    const res = await submitQuoteRequest({
      name: leadName.trim(),
      phone: phoneCheck.normalized,
      email: leadEmail.trim(),
      service: leadService,
      message:
        leadNote.trim() || 'Khách hàng để lại số điện thoại nhận báo giá từ khung Chatbot.',
      source: 'Form Để Lại SĐT Trong Chatbot',
      honeypot: leadHoneypot,
    });
    setIsSubmittingLead(false);

    if (!res.ok) {
      setLeadServerFailed(true);
      setLeadFormError(
        res.error ||
          'Hiện chưa gửi được yêu cầu tự động. Anh/chị vui lòng gọi điện hoặc bấm Chat Zalo trực tuyến bên dưới để Minh Tiến hỗ trợ ngay ạ!'
      );
      return;
    }

    const bundle = getConsultationBundle(leadService);
    const successMsg: ChatMessage = {
      id: `lead-form-ok-${Date.now()}`,
      role: 'model',
      text: `Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm!\n(Họ tên: ${leadName.trim()} • SĐT: ${phoneCheck.normalized} • Dịch vụ: ${leadService})`,
      timestamp: formatCurrentTime(),
      isLeadSuccess: true,
      cards: bundle.cards,
      showZaloCta: true,
    };
    setMessages((prev) => [...prev, successMsg]);
    setShowLeadForm(false);
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadNote('');
    setLeadHoneypot('');
  };

  const handleClearSession = () => {
    const resetMessages: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: INITIAL_GREETING_TEXT,
        timestamp: formatCurrentTime(),
        showZaloCta: true,
      },
    ];
    setMessages(resetMessages);
    try {
      sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(resetMessages));
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {/* Khung lời chào tự động sau 3-5 giây kèm 4 nút gợi ý nhanh */}
      {!isOpen && showGreetingBubble && (
        <div
          role="dialog"
          aria-label="Lời chào tư vấn trực tuyến Minh Tiến"
          className="fixed bottom-36 right-3.5 left-3.5 sm:left-auto sm:right-5 lg:bottom-24 lg:right-6 z-40 sm:w-[360px] rounded-2xl bg-white dark:bg-[#141622] border border-orange-200/90 dark:border-orange-900/60 shadow-[0_14px_40px_rgba(153,27,27,0.22)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.65)] p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header nhỏ của hộp lời chào */}
          <div className="flex items-start justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#991B1B] to-[#D97706] flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141622]" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B] dark:text-amber-400">
                  Minh Tiến In Ấn & Quảng Cáo
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Trợ lý tư vấn trực tuyến • 160 QL80 Kiên Lương
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGreetingBubble(false)}
              aria-label="Đóng lời chào"
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nội dung lời chào */}
          <div
            onClick={handleOpenChat}
            className="text-xs sm:text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-100 bg-orange-50/80 dark:bg-neutral-900/90 border border-orange-100 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 mb-3 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700/60 transition-colors"
          >
            {INITIAL_GREETING_TEXT}
          </div>

          {/* 4 Nút gợi ý nhanh */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Chọn nhanh nội dung anh/chị quan tâm:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendMessageToBot(item.prompt)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1F2E] text-[#991B1B] dark:text-amber-300 border border-[#991B1B]/25 dark:border-amber-500/30 hover:bg-[#991B1B] hover:text-white dark:hover:bg-amber-500 dark:hover:text-neutral-950 transition-all shadow-2xs cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <a
                href={LIVE_CHAT_ZALO_URL}
                target="_blank"
                rel="noopener"
                className="w-full py-2 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Zalo trực tuyến (0918 321 642)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Khung Chat chính khi mở */}
      {isOpen && (
        <section
          aria-label="Khung chat tư vấn trực tuyến Minh Tiến"
          className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-5 lg:bottom-6 lg:right-6 z-50 sm:w-[410px] max-h-[calc(100dvh-6.25rem)] lg:max-h-[640px] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#12131C] border border-neutral-200/90 dark:border-neutral-800 shadow-[0_20px_60px_rgba(0,0,0,0.28)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.75)] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Khung Chat */}
          <div className="bg-gradient-to-r from-[#881313] via-[#991B1B] to-[#B45309] text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#991B1B]"
                  title="Đang trực tuyến"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold tracking-wide truncate text-white">
                  Minh Tiến Tư Vấn Trực Tuyến
                </h3>
                <p className="text-[11px] text-amber-100/90 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0 text-amber-300" />
                  <span>160 QL80, Kiên Lương • 07:30–18:30</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleClearSession}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCloseChat}
                title="Thu gọn khung chat"
                aria-label="Thu gọn khung chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thanh đầu khung chat: Nút nổi bật "Chat Zalo trực tuyến" (0918321642) + Để lại SĐT */}
          <div className="bg-orange-50/95 dark:bg-[#191B28] border-b border-orange-200/80 dark:border-neutral-800 px-3 py-2 flex items-center justify-between gap-2 text-[11px] shrink-0">
            <a
              href={LIVE_CHAT_ZALO_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0068FF] hover:bg-[#0052cc] text-white font-extrabold shadow-xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Chat Zalo trực tuyến</span>
              <ExternalLink className="w-3 h-3 opacity-85 shrink-0" />
            </a>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowLeadForm((prev) => !prev);
                  setLeadFormError('');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 dark:bg-amber-500/15 text-[#991B1B] dark:text-amber-300 border border-[#991B1B]/25 dark:border-amber-500/30 font-bold hover:bg-[#991B1B] hover:text-white dark:hover:bg-amber-500 dark:hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3 h-3" />
                <span>{showLeadForm ? 'Quay lại chat' : 'Để lại SĐT'}</span>
              </button>

              <a
                href="tel:0918321642"
                title="Gọi 0918 321 642"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden xs:inline">0918 321 642</span>
              </a>
            </div>
          </div>

          {/* Form Để lại SĐT nhận báo giá ngay trong Chatbot */}
          {showLeadForm ? (
            <form
              onSubmit={handleLeadFormSubmit}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5] dark:bg-[#0E1017]"
              noValidate
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B] dark:text-amber-400">
                    Để lại SĐT nhận báo giá & khảo sát
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Minh Tiến sẽ gọi lại hoặc nhắn Zalo báo giá chi tiết cho anh/chị.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              {/* Honeypot ẩn */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={leadHoneypot}
                  onChange={(e) => setLeadHoneypot(e.target.value)}
                />
              </div>

              {leadFormError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-xs text-red-700 dark:text-red-300 space-y-2">
                  <div className="flex items-start gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span>{leadFormError}</span>
                  </div>
                  {leadServerFailed && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-red-200/70 dark:border-red-800/50">
                      <a
                        href="tel:0918321642"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#991B1B] text-white text-[11px] font-bold"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi 0918 321 642</span>
                      </a>
                      <a
                        href={LIVE_CHAT_ZALO_URL}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0068FF] text-white text-[11px] font-bold"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat Zalo trực tuyến</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Nhập họ tên anh/chị..."
                  disabled={isSubmittingLead}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#191C29] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Số điện thoại Việt Nam <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="Ví dụ: 0918321642"
                  disabled={isSubmittingLead}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#191C29] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Email <span className="text-neutral-400 font-normal">(Không bắt buộc)</span>
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="khachhang@gmail.com"
                  disabled={isSubmittingLead}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#191C29] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Dịch vụ cần báo giá
                </label>
                <select
                  value={leadService}
                  onChange={(e) => setLeadService(e.target.value)}
                  disabled={isSubmittingLead}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#191C29] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-[#991B1B]"
                >
                  <option value="Bảng hiệu quảng cáo">
                    Bảng hiệu quảng cáo (Alu, Chữ nổi, LED)
                  </option>
                  <option value="Đặt lịch khảo sát bảng hiệu">Đặt lịch khảo sát tận nơi</option>
                  <option value="Dịch vụ In ấn">
                    In ấn (Name card, Tem nhãn, Hóa đơn, Thiệp)
                  </option>
                  <option value="Chụp & In hình thẻ lấy ngay">Chụp & In hình thẻ lấy ngay</option>
                  <option value="Chuyển tiền & Gửi tiền nhanh 24/7">
                    Chuyển tiền & Gửi tiền nhanh 24/7
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Yêu cầu chi tiết
                </label>
                <textarea
                  rows={2}
                  value={leadNote}
                  onChange={(e) => setLeadNote(e.target.value)}
                  placeholder="Kích thước dự kiến, số lượng in hoặc địa chỉ khảo sát..."
                  disabled={isSubmittingLead}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#191C29] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-2.5 px-4 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmittingLead ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi thông tin báo giá</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <>
              {/* Danh sách tin nhắn */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#FAF8F5] dark:bg-[#0E1017] min-h-[260px] max-h-[380px] sm:max-h-[410px]">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`${
                          isUser ? 'max-w-[85%]' : 'w-full max-w-[95%]'
                        } rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-line ${
                          isUser
                            ? 'bg-[#991B1B] text-white rounded-br-xs'
                            : msg.isError
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/70 rounded-bl-xs'
                            : msg.isLeadSuccess
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/70 rounded-bl-xs font-semibold'
                            : 'bg-white dark:bg-[#191C29] text-neutral-800 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.isLeadSuccess && (
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Đã ghi nhận thông tin liên hệ</span>
                          </div>
                        )}

                        {msg.isError && (
                          <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Thông báo</span>
                          </div>
                        )}

                        <div>{msg.text}</div>

                        {/* Danh sách thẻ đường dẫn danh mục & sản phẩm/dịch vụ nổi bật */}
                        {!isUser && msg.cards && msg.cards.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-200/80 dark:border-neutral-800 space-y-2 whitespace-normal">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#991B1B] dark:text-amber-400 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 shrink-0" />
                              <span>Danh mục & Sản phẩm phù hợp (Bấm để xem):</span>
                            </div>

                            <div className="space-y-1.5">
                              {msg.cards.map((card) => (
                                <button
                                  key={card.id}
                                  type="button"
                                  onClick={() => handleNavigateCard(card.path)}
                                  className="w-full text-left p-2 rounded-xl bg-orange-50/70 dark:bg-[#12141F] hover:bg-orange-100/90 dark:hover:bg-[#22263A] border border-orange-200/80 dark:border-neutral-700/80 hover:border-[#991B1B] dark:hover:border-amber-500/60 transition-all flex items-center gap-2.5 group cursor-pointer shadow-2xs"
                                >
                                  {card.image ? (
                                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                      <OptimizedImage
                                        src={card.image}
                                        alt={card.title}
                                        width={88}
                                        height={88}
                                        sizes="44px"
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-11 h-11 rounded-lg shrink-0 bg-gradient-to-br from-[#991B1B]/15 to-amber-500/15 dark:from-[#991B1B]/30 dark:to-amber-500/20 border border-[#991B1B]/20 dark:border-amber-500/30 flex items-center justify-center text-[#991B1B] dark:text-amber-400">
                                      <Layers className="w-4 h-4" />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-extrabold text-neutral-900 dark:text-white group-hover:text-[#991B1B] dark:group-hover:text-amber-300 truncate transition-colors">
                                      {card.title}
                                    </div>
                                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                      {card.description}
                                    </p>
                                  </div>

                                  <ChevronRight className="w-4 h-4 text-[#991B1B] dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nút nổi bật "Chat Zalo trực tuyến" (0918321642) trong mỗi câu trả lời tư vấn */}
                        {!isUser && (
                          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-2 whitespace-normal">
                            <a
                              href={LIVE_CHAT_ZALO_URL}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0068FF] hover:bg-[#0052cc] text-white text-[11px] font-extrabold shadow-xs transition-all hover:scale-[1.02] active:scale-95"
                            >
                              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                              <span>Chat Zalo trực tuyến (0918 321 642)</span>
                              <ExternalLink className="w-3 h-3 opacity-85 shrink-0" />
                            </a>

                            <a
                              href="tel:0918321642"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#991B1B] dark:text-amber-400" />
                              <span>Gọi 0918 321 642</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {msg.timestamp && (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 px-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Trạng thái đang gõ (Typing indicator) */}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-white dark:bg-[#191C29] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] dark:bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] dark:bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] dark:bg-amber-400 animate-bounce" />
                      </div>
                      <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Minh Tiến đang xử lý & phản hồi...
                      </span>
                    </div>
                  </div>
                )}

                {/* Gợi ý nhanh luôn có sẵn để khách chọn dễ dàng */}
                {!isLoading && (
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Chủ đề tư vấn nhanh:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SUGGESTIONS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => sendMessageToBot(item.prompt)}
                          className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#191C29] text-[#991B1B] dark:text-amber-300 border border-[#991B1B]/25 dark:border-amber-500/30 hover:bg-[#991B1B] hover:text-white dark:hover:bg-amber-500 dark:hover:text-neutral-950 transition-colors cursor-pointer shadow-2xs"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Ô nhập tin nhắn */}
              <form
                onSubmit={handleFormSubmit}
                className="p-2.5 bg-white dark:bg-[#141622] border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc nhắn SĐT để nhận báo giá..."
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#1E2130] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border border-transparent focus:border-[#991B1B] dark:focus:border-amber-500 focus:bg-white dark:focus:bg-[#191C29] focus:outline-none transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Gửi tin nhắn"
                  className="p-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-500 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      {/* Nút Chat nổi ở góc dưới bên phải trên mọi trang, cao hơn MobileStickyBar (bottom-20 trên mobile) */}
      <div className="fixed bottom-20 right-3.5 sm:right-5 lg:bottom-6 lg:right-6 z-40">
        <button
          type="button"
          onClick={() => (isOpen ? handleCloseChat() : handleOpenChat())}
          aria-label={isOpen ? 'Đóng khung chat tư vấn' : 'Mở khung chat tư vấn trực tuyến'}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#991B1B] to-[#C2410C] hover:from-[#7F1D1D] hover:to-[#9A3412] text-white font-bold text-xs sm:text-sm shadow-[0_8px_28px_rgba(153,27,27,0.45)] hover:shadow-[0_12px_34px_rgba(153,27,27,0.6)] border border-amber-300/40 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            {isOpen ? (
              <X className="w-5 h-5 text-white transition-transform duration-200" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              </>
            )}
          </span>
          <span className="tracking-wide select-none">
            {isOpen ? 'Đóng chat' : 'Chat tư vấn'}
          </span>
        </button>
      </div>
    </>
  );
};

export default ChatWidget;
