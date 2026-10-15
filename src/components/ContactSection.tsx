import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Navigation,
  Send,
  CheckCircle2,
  Upload,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  submitQuoteRequest,
  validateVietnamPhone,
  validateEmailOptional,
} from '../utils/quoteApi';

export const ContactSection: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState('Bảng hiệu Alu, Mica, Chữ nổi LED');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const validate = () => {
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của anh/chị (tối thiểu 2 ký tự)';
    }
    const phoneCheck = validateVietnamPhone(phone);
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại liên hệ';
    } else if (!phoneCheck.valid) {
      newErrors.phone =
        'Số điện thoại Việt Nam không hợp lệ (10 số 03, 05, 07, 08, 09 hoặc số bàn 02...)';
    }
    if (email.trim() && !validateEmailOptional(email)) {
      newErrors.email = 'Địa chỉ email không đúng định dạng';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const phoneCheck = validateVietnamPhone(phone);
    const fullMessage = [
      content.trim(),
      fileName ? `[Khách đính kèm tên file tham khảo: ${fileName}]` : '',
    ]
      .filter(Boolean)
      .join('\n');

    setIsSubmitting(true);
    const result = await submitQuoteRequest({
      name: fullName.trim(),
      phone: phoneCheck.normalized,
      email: email.trim(),
      service: selectedService,
      message: fullMessage || 'Khách hàng gửi thông tin từ Form Liên Hệ & Báo Giá.',
      source: 'Form Liên Hệ & Tư Vấn Báo Giá',
      honeypot,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(
        result.error ||
          'Hiện chưa gửi được yêu cầu tự động. Anh/chị vui lòng gọi điện hoặc nhắn Zalo bên dưới để nhân viên Minh Tiến hỗ trợ ngay ạ!'
      );
      return;
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setContent('');
    setFileName(null);
    setHoneypot('');
    setIsSubmitted(false);
    setSubmitError('');
    setErrors({});
  };

  return (
    <section
      id="lien-he"
      className="py-16 lg:py-24 bg-[#FAFAFB] dark:bg-[#0B0C10] border-b border-neutral-200 dark:border-neutral-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#991B1B] dark:text-red-400">
            LIÊN HỆ & TƯ VẤN BÁO GIÁ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight leading-tight">
            BẠN ĐANG CÓ MỘT Ý TƯỞNG?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">
            HÃY ĐỂ MINH TIẾN GIÚP BẠN BIẾN NÓ THÀNH SẢN PHẨM THỰC TẾ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Quick Action Contact Buttons & Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12131D] border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-xs transition-colors">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                  MINH TIẾN IN ẤN & QUẢNG CÁO
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Nhận phản hồi ngay trong vòng vài phút. Không để bạn phải chờ đợi.
                </p>
              </div>

              {/* Prominent Quick Action Links: Zalo Thiệp Cưới & Google Maps */}
              <div className="space-y-2.5">
                <a
                  href="https://zalo.me/0915397975"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Zalo In Thiệp Cưới & In Nhanh</span>
                </a>

                <a
                  href="https://maps.app.goo.gl/2PCcYZFjKfwxqnnd9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#EA580C] to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  <span>Xem vị trí trên Google Maps</span>
                </a>
              </div>

              {/* Additional Hotline Call Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href="tel:0918321642"
                  className="py-2.5 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl text-center flex items-center justify-center gap-2 transition-colors text-xs font-bold"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>0918 321 642</span>
                </a>
                <a
                  href="tel:0888816160"
                  className="py-2.5 px-3 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-center flex items-center justify-center gap-2 transition-colors text-xs font-bold border border-neutral-300 dark:border-neutral-700"
                >
                  <Phone className="w-4 h-4 text-[#EA580C]" />
                  <span>0888816160</span>
                </a>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                    Zalo In Thiệp Cưới & In Nhanh:
                  </span>
                  <a
                    href="https://zalo.me/0915397975"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0068FF] dark:text-blue-400 hover:underline font-mono"
                  >
                    0915 397 975
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                    Google Maps:
                  </span>
                  <a
                    href="https://maps.app.goo.gl/2PCcYZFjKfwxqnnd9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#EA580C] hover:underline"
                  >
                    maps.app.goo.gl/2PCcYZFjKfwxqnnd9
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Hotline tư vấn:</span>
                  <a
                    href="tel:0888816160"
                    className="font-bold text-neutral-900 dark:text-white hover:text-[#991B1B] font-mono"
                  >
                    0888816160
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Kỹ thuật thi công:</span>
                  <a
                    href="tel:0918321642"
                    className="font-bold text-neutral-900 dark:text-white hover:text-[#991B1B] font-mono"
                  >
                    0918 321 642
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Điện thoại bàn:</span>
                  <a
                    href="tel:02973858055"
                    className="font-bold text-neutral-900 dark:text-white hover:text-[#991B1B] font-mono"
                  >
                    02973 858 055
                  </a>
                </div>
                <div className="flex items-start justify-between gap-4 pt-1">
                  <span className="text-neutral-500 dark:text-neutral-400 shrink-0">Địa chỉ:</span>
                  <span className="font-medium text-right text-neutral-900 dark:text-neutral-200">
                    160 Quốc lộ 80, KP. Kiên Tân, Kiên Lương, An Giang
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <span className="font-bold text-[#991B1B] dark:text-red-400">
                Lưu ý khi yêu cầu báo giá bảng hiệu:
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Quý khách có thể gửi kèm kích thước mặt bằng dự kiến (chiều ngang x chiều cao) hoặc
                hình ảnh hiện trạng mặt tiền để Minh Tiến lên phương án phối cảnh và báo giá sát
                thực tế nhất.
              </p>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#12131D] border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Cảm ơn anh/chị <strong>{fullName}</strong>. Minh Tiến đã nhận được thông tin liên
                    hệ cho dịch vụ <strong>{selectedService}</strong>. Chúng tôi sẽ gọi lại hoặc
                    phản hồi qua Zalo số <strong>{phone}</strong> trong ít phút!
                  </p>
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="tel:0918321642"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi 0918 321 642</span>
                    </a>
                    <a
                      href="https://zalo.me/0918321642"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Zalo</span>
                    </a>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Gửi thông tin yêu cầu tư vấn & báo giá
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Điền nhanh vào mẫu dưới đây, hệ thống sẽ thông báo ngay cho đội ngũ Minh Tiến.
                    </p>
                  </div>

                  {/* Honeypot ẩn chống spam */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="contact-website-hp">Website</label>
                    <input
                      id="contact-website-hp"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-xs text-red-700 dark:text-red-300 space-y-2.5">
                      <div className="flex items-start gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
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
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Họ tên */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Họ và tên <span className="text-[#991B1B] dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 text-neutral-900 dark:text-white transition-all ${
                          errors.fullName
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Số điện thoại <span className="text-[#991B1B] dark:text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0918321642"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 text-neutral-900 dark:text-white transition-all ${
                          errors.phone
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email không bắt buộc */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Email <span className="text-neutral-400 font-normal">(Không bắt buộc)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ví dụ: khachhang@gmail.com"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 text-neutral-900 dark:text-white transition-all ${
                          errors.email
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Dịch vụ cần tư vấn */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Dịch vụ cần tư vấn
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 transition-all text-neutral-800 dark:text-neutral-200"
                      >
                        <option value="Bảng hiệu Alu, Mica, Chữ nổi LED">
                          Bảng hiệu (Alu, Mica, Chữ nổi LED, Hộp đèn)
                        </option>
                        <option value="Đặt lịch khảo sát bảng hiệu tận nơi">
                          Đặt lịch khảo sát bảng hiệu tận nơi (Kiên Lương / Ba Hòn)
                        </option>
                        <option value="In ấn (Danh thiếp, Tờ rơi, Catalogue, Decal)">
                          In ấn (Danh thiếp, Tờ rơi, Decal, Thiệp, Catalogue)
                        </option>
                        <option value="Quảng cáo (Banner, Standee, Bạt Hiflex)">
                          Quảng cáo (Banner, Standee, Poster, Bạt Hiflex)
                        </option>
                        <option value="Decor không gian & Mặt tiền cửa hàng">
                          Decor không gian & Mặt tiền cửa hàng
                        </option>
                        <option value="Photocopy, Scan & Chụp hình thẻ lấy liền">
                          Photocopy, In tài liệu & Chụp hình thẻ lấy liền
                        </option>
                        <option value="Chuyển tiền & Gửi tiền nhanh 24/7">
                          Chuyển tiền & Gửi tiền nhanh 24/7
                        </option>
                        <option value="Hạng mục khác">Hạng mục khác theo nhu cầu riêng</option>
                      </select>
                    </div>
                  </div>

                  {/* Nội dung chi tiết */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Nội dung yêu cầu / Kích thước dự kiến
                    </label>
                    <textarea
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Mô tả ý tưởng của bạn, kích thước bảng hiệu hoặc số lượng in ấn dự kiến..."
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 transition-all text-neutral-800 dark:text-neutral-200"
                    />
                  </div>

                  {/* Upload hình ảnh tham khảo */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Upload hình ảnh tham khảo (nếu có)
                    </label>
                    <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#991B1B]/50 dark:hover:border-red-500/50 rounded-xl p-4 text-center transition-colors bg-neutral-50/50 dark:bg-neutral-900/50">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="reference-file"
                      />
                      {fileName ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <FileCheck className="w-4 h-4" />
                          <span>Đã chọn: {fileName}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-5 h-5 mx-auto text-neutral-400" />
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                            Kéo thả hoặc nhấp để tải ảnh mẫu / bản vẽ hiện trạng
                          </p>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            Hỗ trợ JPG, PNG, PDF tối đa 20MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi yêu cầu...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>GỬI YÊU CẦU BÁO GIÁ</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
