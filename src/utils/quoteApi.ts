export interface SubmitQuoteParams {
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
  source?: string;
  honeypot?: string;
}

export interface SubmitQuoteResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export function validateVietnamPhone(rawPhone: string): {
  valid: boolean;
  normalized: string;
} {
  const cleaned = rawPhone.replace(/[\s.\-()]/g, '');
  const normalized = cleaned.replace(/^(\+?84)(?=[35789]\d{8}$|2\d{8,9}$)/, '0');
  const vnPhoneRegex = /^0([35789]\d{8}|2\d{8,9})$/;
  return {
    valid: vnPhoneRegex.test(normalized),
    normalized,
  };
}

export function validateEmailOptional(email: string): boolean {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Trích xuất số điện thoại Việt Nam hợp lệ nếu khách để lại trong tin nhắn Chatbot
 */
export function extractVietnamPhoneFromText(text: string): string | null {
  const candidates = text.match(/(?:\+?84|0)(?:[\s.\-]*\d){8,10}/g);
  if (!candidates) return null;

  for (const raw of candidates) {
    const check = validateVietnamPhone(raw);
    if (check.valid) {
      return check.normalized;
    }
  }
  return null;
}

export async function submitQuoteRequest(
  params: SubmitQuoteParams
): Promise<SubmitQuoteResult> {
  const pageUrl =
    typeof window !== 'undefined' ? window.location.href : '/';

  try {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.name.trim(),
        phone: params.phone.trim(),
        email: params.email?.trim() || '',
        service: params.service.trim() || 'Tư vấn & Báo giá',
        message: params.message?.trim() || '',
        pageUrl,
        source: params.source || 'Form báo giá',
        honeypot: params.honeypot || '',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error:
          data.error ||
          'Hiện chưa gửi được yêu cầu tự động. Anh/chị vui lòng bấm nút Gọi điện hoặc nhắn Zalo bên dưới để nhân viên Minh Tiến hỗ trợ ngay ạ!',
      };
    }

    return {
      ok: true,
      message: data.message || 'Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm',
    };
  } catch {
    return {
      ok: false,
      error:
        'Không thể kết nối máy chủ gửi yêu cầu lúc này. Anh/chị vui lòng bấm nút Gọi điện hoặc nhắn Zalo bên dưới để Minh Tiến tiếp nhận ngay ạ!',
    };
  }
}
