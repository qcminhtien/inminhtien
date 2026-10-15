import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { getConsultationBundle } from './src/data/chatConsultingData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const MINH_TIEN_SYSTEM_INSTRUCTION = `Bạn là chuyên viên tư vấn trực tuyến của "Minh Tiến In Ấn & Quảng Cáo" (tên đầy đủ: Cơ Sở Minh Tiến In Ấn, Quảng Cáo & Decor).

QUY TẮC XƯNG HÔ & PHONG CÁCH:
- Luôn trả lời bằng tiếng Việt, xưng "em" và gọi khách hàng là "anh/chị".
- Giọng điệu lịch sự, nhiệt tình, tận tâm, chuyên nghiệp.
- Trả lời NGẮN GỌN, súc tích, chia ý rõ ràng (tối đa 3–5 câu hoặc gạch đầu dòng ngắn), dễ đọc trên điện thoại.

THÔNG TIN CHÍNH THỨC CỦA CƠ SỞ MINH TIẾN (CHỈ DỰA TRÊN DỮ LIỆU THẬT NÀY):
1. Địa chỉ & Thời gian làm việc:
   - Địa chỉ xưởng & cửa hàng: 160 Quốc lộ 80, Khu phố Kiên Tân, Kiên Lương, An Giang (khu vực trung tâm Kiên Tân, Ba Hòn, Kiên Lương).
   - Phạm vi phục vụ: Trực tiếp tại Kiên Tân, Ba Hòn, Kiên Lương và nhận khảo sát, vận chuyển, lắp đặt bảng hiệu trọn gói tại các khu vực lân cận cũng như mở rộng trong tỉnh An Giang.
   - Giờ mở cửa: 07:30 – 18:30 tất cả các ngày trong tuần (Thứ Hai đến Chủ Nhật, làm việc xuyên trưa và cả ngày Thứ Bảy, Chủ Nhật).
   - Bản đồ Google Maps: https://maps.app.goo.gl/2PCcYZFjKfwxqnnd9

2. Số điện thoại & Zalo liên hệ chính thức:
   - Hotline tư vấn chung: 0888 816 160
   - Hotline & Zalo Kỹ thuật / Bảng hiệu / Đặt lịch khảo sát: 0918 321 642 (https://zalo.me/0918321642)
   - Zalo In Thiệp Cưới, In Nhanh & Hình Thẻ: 0915 397 975 (https://zalo.me/0915397975)
   - Điện thoại bàn: 02973 858 055

3. Các dịch vụ và sản phẩm chính:
   - BẢNG HIỆU QUẢNG CÁO & DECOR:
     + Thiết kế & thi công mặt dựng nhôm Alu (Alcorest), lam sóng nhựa giả gỗ ngoài trời.
     + Chữ nổi Mica Đài Loan hắt sáng LED module, chữ nổi Inox 304 (vàng gương, trắng xước chống gỉ sét vùng biển).
     + Bảng hiệu hộp đèn bạt 3M / Hiflex khung sắt hộp mạ kẽm, biển vẫy tròn hút nổi Mica 2 mặt.
     + Đèn LED Neon Flex 12V uốn chữ nghệ thuật trang trí quán cafe, trà sữa, spa, studio; vách logo 3D quầy lễ tân.
     + Quy trình & Cam kết: Khảo sát đo đạc tận nơi MIỄN PHÍ tại Kiên Lương, Ba Hòn; lên bản vẽ phối cảnh 3D trước khi sản xuất; gia công trực tiếp tại xưởng 160 QL80 không qua trung gian; thời gian hoàn thiện thông thường 3–5 ngày (biển vẫy/hộp đèn nhỏ 1–2 ngày, hỗ trợ làm gấp kịp khai trương); bảo hành kết cấu & đèn LED từ 12 đến 24 tháng.
   - DỊCH VỤ IN ẤN THƯƠNG MẠI & THIỆP CƯỚI:
     + In Name Card / Danh thiếp (giấy Couche C300 cán màng mờ 2 mặt, ép kim).
     + In Catalogue, Brochure, Tờ rơi, Voucher, Menu thực đơn nhựa PVC chống thấm nước.
     + In Tem nhãn Decal dán sản phẩm (decal nhựa sữa chống nước, decal trong, decal giấy, bế demi sẵn).
     + In Hóa đơn bán lẻ, Phiếu thu – chi, Biểu mẫu Carbonless 1–3 liên đóng cuốn răng cưa, số nhảy.
     + In Thiệp cưới truyền thống & hiện đại, ép kim.
     + In khổ lớn: Bạt Hiflex khai trương, băng rôn, Standee cuốn nhôm / khung chữ X (60x160cm, 80x180cm), Decal PP, Decal dán kính văn phòng, Decal dán xe tải.
     + Nhận in từ số lượng ít (1 hộp name card, vài chục tem nhãn) đến số lượng lớn; lấy ngay trong ngày hoặc 1–2 ngày.
   - DỊCH VỤ CHỤP & IN ẢNH - HÌNH THẺ LẤY NGAY, PHOTOCOPY:
     + Chụp và in ảnh thẻ 2x3, 3x4, 4x6, ảnh hộ chiếu (Passport), căn cước, bằng lái xe, hồ sơ xin việc/nhập học lấy liền chỉ sau 5–10 phút tại 160 QL80.
     + Hỗ trợ chỉnh sáng tự nhiên, ghép áo sơ mi trắng / vest lịch sự, nhận in ảnh gửi qua Zalo 0915 397 975, ép plastic / ép lụa và photocopy tài liệu.
   - DỊCH VỤ CHUYỂN TIỀN, GỬI TIỀN NHANH 24/7 (KIÊN TÂN, BA HÒN, KIÊN LƯƠNG):
     + Chuyển tiền mặt liên ngân hàng Napas 24/7 vào mọi ngân hàng (Agribank, Vietcombank, BIDV, VietinBank, MB, Sacombank...), tiền nổi ngay sau 1–3 phút, có biên lai xác nhận.
     + Rút tiền mặt nhanh qua mã QR không cần chờ cây ATM; nạp/rút ví MoMo, ZaloPay, Viettel Money; thanh toán điện, nước, internet, trả góp. Phục vụ xuyên trưa và cả Thứ Bảy, Chủ Nhật (07:30 – 18:30).

QUY TẮC BÁO GIÁ & THÔNG TIN CHƯA CHẮC CHẮN (TUYỆT ĐỐI TUÂN THỦ):
- TUYỆT ĐỐI KHÔNG tự bịa ra con số giá tiền cụ thể hay thông tin khuyến mãi không có trong dữ liệu trên.
- Khi anh/chị hỏi giá làm bảng hiệu, in ấn, phí chuyển tiền hoặc yêu cầu báo giá cụ thể: hãy giải thích ngắn gọn rằng chi phí được tính minh bạch theo kích thước thực tế, chất liệu hoặc số lượng đặt in, sau đó mời anh/chị để lại Tên + Số điện thoại kèm nhu cầu ngay tại khung chat, hoặc bấm nút Gọi điện (0888 816 160 / 0918 321 642) hay kết nối Zalo (0915 397 975 / 0918 321 642) để nhân viên kỹ thuật Minh Tiến tư vấn và báo giá chính xác nhất ạ.
- Nếu khách hàng muốn đặt lịch khảo sát bảng hiệu: hãy hướng dẫn khách để lại Tên + Số điện thoại + Địa chỉ mặt bằng tại Kiên Lương / Ba Hòn / An Giang hoặc liên hệ trực tiếp Zalo/SĐT kỹ thuật 0918 321 642 để thợ đến đo đạc miễn phí.`;

interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface QuoteRequestPayload {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  message?: string;
  pageUrl?: string;
  source?: string;
  honeypot?: string;
}

// Rate limiter store per IP for /api/quote
const quoteRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 6; // max 6 quote requests per 10 mins per IP

function checkQuoteRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  // Clean up expired entries periodically
  if (quoteRateLimitMap.size > 500) {
    for (const [k, v] of quoteRateLimitMap.entries()) {
      if (now > v.resetAt) quoteRateLimitMap.delete(k);
    }
  }

  const record = quoteRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    quoteRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true };
}

function normalizeAndValidateVNPhone(rawPhone: string): { valid: boolean; normalized: string } {
  const cleaned = rawPhone.replace(/[\s.\-()]/g, '');
  const normalized = cleaned.replace(/^(\+?84)(?=[35789]\d{8}$|2\d{8,9}$)/, '0');
  const vnPhoneRegex = /^0([35789]\d{8}|2\d{8,9})$/;
  return {
    valid: vnPhoneRegex.test(normalized),
    normalized,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getVietnamTimestamp(): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  // API: Gửi email thông báo yêu cầu báo giá / đặt lịch khảo sát / liên hệ / SĐT từ chatbot
  app.post('/api/quote', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as QuoteRequestPayload;

      // 1. Kiểm tra trường honeypot chống bot spam
      if (body.honeypot && String(body.honeypot).trim().length > 0) {
        res.status(400).json({
          ok: false,
          error: 'Yêu cầu không hợp lệ (phát hiện spam).',
        });
        return;
      }

      // 2. Giới hạn tần suất gửi theo IP
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';
      const rateStatus = checkQuoteRateLimit(clientIp);
      if (!rateStatus.allowed) {
        res.status(429).json({
          ok: false,
          error: `Anh/chị đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau ${rateStatus.retryAfterSec} giây hoặc gọi trực tiếp Hotline 0888 816 160 / 0918 321 642.`,
        });
        return;
      }

      // 3. Kiểm tra dữ liệu bắt buộc (Tên + Số điện thoại Việt Nam hợp lệ)
      const rawName = typeof body.name === 'string' ? body.name.trim() : '';
      const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
      const rawService =
        typeof body.service === 'string' && body.service.trim()
          ? body.service.trim()
          : 'Tư vấn & Báo giá';
      const rawMessage =
        typeof body.message === 'string' && body.message.trim()
          ? body.message.trim()
          : 'Khách hàng để lại thông tin cần tư vấn & báo giá.';
      const rawPageUrl =
        typeof body.pageUrl === 'string' && body.pageUrl.trim()
          ? body.pageUrl.trim()
          : '/';
      const rawSource =
        typeof body.source === 'string' && body.source.trim()
          ? body.source.trim()
          : 'Form website';

      if (!rawName || rawName.length < 2 || rawName.length > 100) {
        res.status(400).json({
          ok: false,
          error: 'Vui lòng nhập họ và tên hợp lệ (từ 2 ký tự trở lên).',
        });
        return;
      }

      const phoneCheck = normalizeAndValidateVNPhone(rawPhone);
      if (!phoneCheck.valid) {
        res.status(400).json({
          ok: false,
          error:
            'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số bắt đầu bằng 03, 05, 07, 08, 09 hoặc số bàn 02...).',
        });
        return;
      }

      if (rawEmail && !isValidEmail(rawEmail)) {
        res.status(400).json({
          ok: false,
          error: 'Địa chỉ email không đúng định dạng.',
        });
        return;
      }

      // 4. Kiểm tra cấu hình SMTP Gmail trên server
      const smtpUser = process.env.SMTP_USER?.trim();
      const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
      const toEmail =
        process.env.QUOTE_TO_EMAIL?.trim() || 'contact.media.vnn@gmail.com';

      if (
        !smtpUser ||
        !smtpPass ||
        smtpUser === 'your-email@gmail.com' ||
        smtpPass === 'your-16-char-gmail-app-password'
      ) {
        console.error(
          'Missing SMTP configuration: SMTP_USER or SMTP_PASS is not configured in environment secrets.'
        );
        res.status(503).json({
          ok: false,
          error:
            'Hệ thống gửi email tự động đang chờ cấu hình máy chủ (SMTP). Anh/chị vui lòng bấm nút Gọi điện hoặc nhắn Zalo bên dưới để Minh Tiến tiếp nhận ngay ạ!',
        });
        return;
      }

      const vnTime = getVietnamTimestamp();
      const subject = `[Báo giá mới] ${rawName} - ${rawService}`;

      const safeName = escapeHtml(rawName);
      const safePhone = escapeHtml(phoneCheck.normalized);
      const safeEmail = rawEmail ? escapeHtml(rawEmail) : 'Không cung cấp';
      const safeService = escapeHtml(rawService);
      const safeMessage = escapeHtml(rawMessage).replace(/\n/g, '<br/>');
      const safePageUrl = escapeHtml(rawPageUrl);
      const safeSource = escapeHtml(rawSource);
      const safeTime = escapeHtml(vnTime);

      const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#991b1b,#b45309);padding:20px 24px;color:#ffffff;">
      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#fde68a;">
        MINH TIẾN IN ẤN &amp; QUẢNG CÁO • 160 QL80 KIÊN LƯƠNG
      </p>
      <h2 style="margin:6px 0 0;font-size:18px;font-weight:bold;">
        Yêu Cầu Báo Giá / Tư Vấn Mới
      </h2>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;width:165px;color:#52525b;">Họ và tên khách:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#18181b;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#52525b;">Số điện thoại:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;">
            <a href="tel:${safePhone}" style="color:#991b1b;font-weight:bold;text-decoration:none;font-size:15px;">${safePhone}</a>
            &nbsp;&bull;&nbsp;
            <a href="https://zalo.me/${safePhone}" style="color:#0068ff;font-weight:bold;text-decoration:none;">Mở Zalo khách</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#52525b;">Email khách hàng:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#18181b;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#52525b;">Dịch vụ quan tâm:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#b45309;">${safeService}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#52525b;vertical-align:top;">Nội dung yêu cầu:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#18181b;line-height:1.5;">${safeMessage}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#52525b;">Trang đang xem:</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#3f3f46;">${safePageUrl} <span style="color:#71717a;font-size:12px;">(${safeSource})</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:bold;color:#52525b;">Thời gian gửi (VN):</td>
          <td style="padding:10px 12px;color:#3f3f46;">${safeTime} (GMT+7)</td>
        </tr>
      </table>
    </div>
    <div style="background:#fafaf9;padding:14px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#71717a;text-align:center;">
      Email tự động từ hệ thống website <strong>Minh Tiến In Ấn &amp; Quảng Cáo</strong> (160 Quốc lộ 80, Kiên Lương, An Giang).
    </div>
  </div>
</body>
</html>`.trim();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Minh Tiến Website" <${smtpUser}>`,
        to: toEmail,
        ...(rawEmail ? { replyTo: rawEmail } : {}),
        subject,
        html: htmlContent,
        text: `YÊU CẦU BÁO GIÁ MỚI - MINH TIẾN\n- Họ tên: ${rawName}\n- Số điện thoại: ${phoneCheck.normalized}\n- Email: ${rawEmail || 'Không cung cấp'}\n- Dịch vụ quan tâm: ${rawService}\n- Nội dung yêu cầu: ${rawMessage}\n- Trang khách đang xem: ${rawPageUrl} (${rawSource})\n- Thời gian gửi (VN): ${vnTime} (GMT+7)`,
      });

      res.json({
        ok: true,
        message: 'Đã nhận yêu cầu, Minh Tiến sẽ liên hệ lại sớm',
      });
    } catch (error) {
      console.error('Error in /api/quote:', error);
      res.status(500).json({
        ok: false,
        error:
          'Hiện chưa gửi được yêu cầu tự động qua email. Anh/chị vui lòng bấm nút Gọi điện hoặc nhắn Zalo bên dưới để nhân viên Minh Tiến hỗ trợ ngay lập tức ạ!',
      });
    }
  });

  // API: Chatbot tư vấn tự động với Gemini (kèm câu trả lời & thẻ đường dẫn dự phòng theo chủ đề)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message, history } = (req.body || {}) as {
      message?: string;
      history?: ChatHistoryMessage[];
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Tin nhắn không hợp lệ.' });
      return;
    }

    const trimmedMessage = message.trim();
    const bundle = getConsultationBundle(trimmedMessage);

    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.json({
          reply: bundle.fallbackReply,
          cards: bundle.cards,
          isFallback: true,
        });
        return;
      }

      const ai = getGenAIClient();

      const safeHistory = Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                (item.role === 'user' || item.role === 'model') &&
                typeof item.text === 'string' &&
                item.text.trim().length > 0
            )
            .slice(-10)
        : [];

      const contents = [
        ...safeHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.text.trim() }],
        })),
        {
          role: 'user',
          parts: [{ text: trimmedMessage }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: MINH_TIEN_SYSTEM_INSTRUCTION,
          temperature: 0.35,
          topP: 0.9,
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.json({
          reply: bundle.fallbackReply,
          cards: bundle.cards,
          isFallback: true,
        });
        return;
      }

      res.json({
        reply: replyText,
        cards: bundle.cards,
      });
    } catch (error) {
      console.warn('Gemini API unavailable, serving topic fallback reply:', error);
      res.json({
        reply: bundle.fallbackReply,
        cards: bundle.cards,
        isFallback: true,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
