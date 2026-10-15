import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { SERVICES } from '../data/siteData';
import {
  submitQuoteRequest,
  validateVietnamPhone,
  validateEmailOptional,
} from '../utils/quoteApi';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
  serviceContext?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  defaultService = 'Bảng hiệu quảng cáo',
  serviceContext,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(serviceContext || defaultService);
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState(false);

  // Update selected service whenever serviceContext or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setService(serviceContext || defaultService);
      setSubmitted(false);
      setIsSubmitting(false);
      setError('');
      setServerError(false);
    }
  }, [isOpen, serviceContext, defaultService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setServerError(false);

    if (!name.trim() || name.trim().length < 2) {
      setError('Vui lòng nhập họ và tên của anh/chị (tối thiểu 2 ký tự).');
      return;
    }

    const phoneValidation = validateVietnamPhone(phone);
    if (!phone.trim() || !phoneValidation.valid) {
      setError(
        'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số bắt đầu bằng 03, 05, 07, 08, 09 hoặc số bàn 02...).'
      );
      return;
    }

    if (email.trim() && !validateEmailOptional(email)) {
      setError('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitQuoteRequest({
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: email.trim(),
      service: service || 'Tư vấn & Báo giá',
      message: note.trim() || 'Khách hàng gửi form nhận tư vấn & báo giá / đặt lịch khảo sát.',
      source: 'Form Báo Giá & Đặt Lịch Khảo Sát (Modal)',
      honeypot,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setServerError(true);
      setError(
        result.error ||
          'Hiện chưa gửi được yêu cầu tự động. Anh/chị vui lòng gọi điện hoặc nhắn Zalo bên dưới để Minh Tiến tiếp nhận ngay ạ!'
      );
      return;
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setName('');
    setPhone('');
    setEmail('');
    setNote('');
    setHoneypot('');
    setError('');
    setServerError(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-[#12131D] border border-transparent dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative transition-colors my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Đóng bảng tư vấn"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
              Cảm ơn anh/chị <strong>{name}</strong>! Hệ thống đã gửi thông báo yêu cầu tư vấn hạng mục{' '}
              <strong>{service}</strong>. Nhân viên Minh Tiến sẽ liên hệ lại qua số{' '}
              <strong>{phone}</strong> trong thời gian sớm nhất.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="tel:0918321642"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi 0918 321 642</span>
              </a>
              <a
                href="https://zalo.me/0918321642"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Zalo Ngay</span>
              </a>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <div className="text-xs font-bold text-[#991B1B] dark:text-red-400 uppercase tracking-wider">
                MINH TIẾN KIÊN LƯƠNG • 160 QL80
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
                Nhận tư vấn, Báo giá & Đặt lịch khảo sát
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Để lại thông tin để hệ thống gửi thông báo trực tiếp cho bộ phận báo giá & kỹ thuật.
              </p>
            </div>

            {/* Honeypot chống spam ẩn hoàn toàn với người dùng thật */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="quote-modal-website">Website</label>
              <input
                id="quote-modal-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-xs text-red-700 dark:text-red-300 font-medium border border-red-200 dark:border-red-800/70 space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {serverError && (
                  <div className="pt-2 border-t border-red-200/80 dark:border-red-800/60 flex flex-wrap gap-2">
                    <a
                      href="tel:0888816160"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#991B1B] text-white text-[11px] font-bold hover:bg-[#7F1D1D] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi 0888 816 160</span>
                    </a>
                    <a
                      href="tel:0918321642"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Kỹ thuật 0918 321 642</span>
                    </a>
                    <a
                      href="https://zalo.me/0918321642"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0068FF] text-white text-[11px] font-bold hover:bg-[#0052cc] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn Zalo Kỹ Thuật</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0918321642"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                Email nhận báo giá <span className="text-neutral-400 font-normal">(Không bắt buộc)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: khachhang@gmail.com"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                Hạng mục quan tâm
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20"
              >
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title} ({s.subtitle})
                  </option>
                ))}
                <option value="Đặt lịch khảo sát bảng hiệu tận nơi">
                  Đặt lịch khảo sát bảng hiệu tận nơi (Kiên Lương / Ba Hòn / An Giang)
                </option>
                <option value="Dịch vụ in ảnh - hình thẻ lấy ngay">
                  Dịch vụ in ảnh - hình thẻ lấy ngay
                </option>
                <option value="Tư vấn tổng hợp">Tư vấn tổng hợp theo nhu cầu riêng</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                Nội dung yêu cầu (Kích thước, số lượng, địa chỉ khảo sát...)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mô tả nhanh kích thước, số lượng hoặc địa chỉ cần khảo sát..."
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-70 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG GỬI YÊU CẦU...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU BÁO GIÁ NGAY</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href="tel:0918321642"
                className="text-neutral-700 dark:text-neutral-300 hover:text-[#EA580C] dark:hover:text-orange-400 font-semibold flex items-center gap-1 font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>0918 321 642</span>
              </a>
              <span className="text-neutral-300 dark:text-neutral-600">·</span>
              <a
                href="https://zalo.me/0915397975"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Zalo In Nhanh 0915 397 975</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
