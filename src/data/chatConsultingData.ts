export interface ChatLinkCard {
  id: string;
  title: string;
  description: string;
  path: string;
  image?: string;
  badge?: string;
}

export const CHAT_LINK_CATALOG: Record<string, ChatLinkCard> = {
  signageCategory: {
    id: 'card-bang-hieu',
    title: 'Trang Danh Mục Bảng Hiệu Quảng Cáo',
    description: 'Tổng hợp bảng hiệu LED, chữ nổi, hộp đèn, Neon & dự toán chi phí tại xưởng',
    path: '/bang-hieu',
    image: '/assets/minh-tien-co-so.webp',
    badge: 'Danh mục Bảng hiệu',
  },
  signageAluLed: {
    id: 'card-alu-led',
    title: 'Bảng Hiệu Mặt Dựng Alu & Chữ Nổi Đèn LED',
    description: 'Khung sắt mạ kẽm, ốp Alu Alcorest, chữ nổi Mica/Inox gắn LED chống nước',
    path: '/bang-hieu#signage-alu-chu-noi',
    image: '/assets/minh-tien-co-so.webp',
    badge: 'Sản phẩm nổi bật',
  },
  signageInoxMica: {
    id: 'card-inox-mica',
    title: 'Chữ Nổi Inox Vàng Gương & Chữ Nổi Mica',
    description: 'Inox 304 không gỉ sét vùng biển, cắt CNC Laser uốn nổi 3D hắt sáng chân',
    path: '/bang-hieu#signage-chu-noi-inox-mica',
    image: '',
    badge: 'Cao cấp & Bền bỉ',
  },
  signageNeonFlex: {
    id: 'card-neon-flex',
    title: 'Đèn LED Neon Flex Uốn Chữ Nghệ Thuật',
    description: 'Dây LED silicon 12V uốn chữ & logo trang trí quán cafe, trà sữa, spa',
    path: '/bang-hieu#signage-neon-led',
    image: '/assets/Minhtien-QC-Decor.webp',
    badge: 'Xu hướng Decor',
  },
  signageLightbox: {
    id: 'card-hop-den',
    title: 'Hộp Đèn Hút Nổi 2 Mặt (Biển Vẫy) & Bạt 3M',
    description: 'Biển vẫy Mica hút nổi cầu lồi 2 mặt & hộp đèn bạt xuyên sáng tiết kiệm',
    path: '/bang-hieu#signage-hop-den-vay',
    image: '',
    badge: 'Thu hút 2 chiều phố',
  },
  signageEstimator: {
    id: 'card-du-toan',
    title: 'Công Cụ Dự Toán & Đặt Lịch Khảo Sát Tận Nơi',
    description: 'Tính nhẩm nhanh chi phí theo m² & đặt lịch thợ đo đạc miễn phí tại Kiên Lương',
    path: '/bang-hieu#du-toan-chi-phi',
    image: '/assets/minh-tien-ba-hon.webp',
    badge: 'Khảo sát miễn phí',
  },
  printCategory: {
    id: 'card-in-an',
    title: 'Trang Danh Mục Dịch Vụ In Ấn Thương Mại',
    description: 'In name card, catalogue, tem nhãn decal chống nước, hóa đơn & thiệp cưới',
    path: '/in-an',
    image: '/assets/banner-3.webp',
    badge: 'Danh mục In ấn',
  },
  printNameCard: {
    id: 'card-name-card',
    title: 'In Name Card / Danh Thiếp C300 & Catalogue',
    description: 'Giấy Couche 300gsm cán màng mờ 2 mặt sắc nét, nhận in từ 1 hộp lấy nhanh',
    path: '/in-an#print-name-card',
    image: '',
    badge: 'Ấn phẩm văn phòng',
  },
  printTemDecal: {
    id: 'card-tem-decal',
    title: 'In Tem Nhãn Decal Chống Nước & Hóa Đơn',
    description: 'Decal nhựa PVC bế demi dán ly/hũ đặc sản & hóa đơn Carbonless 1–3 liên',
    path: '/in-an#print-tem-nhan-decal',
    image: '',
    badge: 'In nhanh lấy liền',
  },
  printBannerStandee: {
    id: 'card-bat-standee',
    title: 'In Bạt Hiflex Khai Trương & Standee Cuốn Nhôm',
    description: 'In băng rôn, phông nền sự kiện, poster standee 60x160cm, 80x180cm sắc nét',
    path: '/in-an#print-bat-standee',
    image: '/assets/Banner-mt1.webp',
    badge: 'In khổ lớn',
  },
  photoIdService: {
    id: 'card-hinh-the',
    title: 'Dịch Vụ Chụp & In Ảnh - Hình Thẻ Lấy Ngay',
    description: 'Chụp hình thẻ 2x3, 3x4, 4x6, hộ chiếu, căn cước lấy liền sau 5–10 phút',
    path: '/chup-hinh-the',
    image: '/assets/Minh-Tien-storefront.webp',
    badge: 'Lấy ngay 5–10 phút',
  },
  facilityContact: {
    id: 'card-co-so',
    title: 'Địa Chỉ Cơ Sở 160 QL80 & Thông Tin Liên Hệ',
    description: '160 Quốc lộ 80, KP. Kiên Tân, Kiên Lương • Mở cửa 07:30–18:30 cả T7 & CN',
    path: '/co-so',
    image: '/assets/Minh-Tien-storefront.webp',
    badge: 'Bản đồ & Giờ mở cửa',
  },
  samplePortfolio: {
    id: 'card-mau-san-pham',
    title: 'Danh Mục Mẫu Sản Phẩm & Dự Án Thực Tế',
    description: 'Tham khảo các mẫu bảng hiệu, vách decor, hộp đèn và ấn phẩm tại xưởng',
    path: '/mau-san-pham',
    image: '/assets/banner-minh-tien.webp',
    badge: 'Mẫu thực tế',
  },
  moneyTransfer: {
    id: 'card-chuyen-tien',
    title: 'Dịch Vụ Chuyển Tiền & Gửi Tiền Nhanh 24/7',
    description: 'Chuyển khoản liên ngân hàng, rút tiền QR nhanh tại Kiên Tân, Ba Hòn, Kiên Lương',
    path: '/chuyen-tien',
    image: '/assets/Minh-Tien-storefront.webp',
    badge: 'Tiện ích 24/7',
  },
};

export interface ConsultationBundle {
  topic: 'signage' | 'print' | 'survey' | 'location' | 'photo' | 'money' | 'general';
  fallbackReply: string;
  cards: ChatLinkCard[];
}

export function getConsultationBundle(userMessage: string): ConsultationBundle {
  const q = userMessage.toLowerCase();

  // 1. Chủ đề Đặt lịch khảo sát
  if (
    q.includes('khảo sát') ||
    q.includes('đo đạc') ||
    q.includes('đặt lịch') ||
    q.includes('tận nơi')
  ) {
    return {
      topic: 'survey',
      fallbackReply:
        'Dạ cơ sở Minh Tiến nhận khảo sát, đo đạc mặt bằng tận nơi hoàn toàn MIỄN PHÍ tại khu vực Kiên Lương, Ba Hòn và mở rộng trong tỉnh An Giang ạ.\n\n' +
        '• Quy trình: Thợ kỹ thuật đến đo thực tế → Tư vấn mẫu vật liệu (Alu, chữ nổi Inox/Mica, hộp đèn LED) → Lên bản vẽ phối cảnh 3D & gửi báo giá chi tiết.\n' +
        '• Anh/chị có thể để lại Tên + Số điện thoại + Địa chỉ ngay tại khung chat, hoặc bấm "Chat Zalo trực tuyến" (0918 321 642) bên dưới để đặt lịch ngay ạ!',
      cards: [
        CHAT_LINK_CATALOG.signageCategory,
        CHAT_LINK_CATALOG.signageEstimator,
        CHAT_LINK_CATALOG.signageAluLed,
        CHAT_LINK_CATALOG.facilityContact,
      ],
    };
  }

  // 2. Chủ đề Địa chỉ & Giờ mở cửa
  if (
    q.includes('địa chỉ') ||
    q.includes('ở đâu') ||
    q.includes('giờ mở cửa') ||
    q.includes('mấy giờ') ||
    q.includes('bản đồ') ||
    q.includes('liên hệ') ||
    q.includes('số điện thoại')
  ) {
    return {
      topic: 'location',
      fallbackReply:
        'Dạ em gửi anh/chị thông tin địa chỉ và thời gian làm việc của Cơ sở Minh Tiến In Ấn & Quảng Cáo ạ:\n\n' +
        '• Địa chỉ: 160 Quốc lộ 80, Khu phố Kiên Tân, Kiên Lương, An Giang (khu vực trung tâm Kiên Tân, Ba Hòn).\n' +
        '• Giờ mở cửa: 07:30 – 18:30 tất cả các ngày trong tuần (Thứ Hai – Chủ Nhật, làm việc xuyên trưa).\n' +
        '• Hotline/Zalo Kỹ thuật & Bảng hiệu: 0918 321 642 • Hotline: 0888 816 160.\n' +
        'Anh/chị có thể bấm vào các thẻ bên dưới để xem hình ảnh cơ sở và các dịch vụ chính ạ!',
      cards: [
        CHAT_LINK_CATALOG.facilityContact,
        CHAT_LINK_CATALOG.signageCategory,
        CHAT_LINK_CATALOG.printCategory,
        CHAT_LINK_CATALOG.photoIdService,
      ],
    };
  }

  // 3. Chủ đề Chụp ảnh thẻ / Photocopy
  if (
    q.includes('hình thẻ') ||
    q.includes('ảnh thẻ') ||
    q.includes('hộ chiếu') ||
    q.includes('căn cước') ||
    q.includes('photocopy')
  ) {
    return {
      topic: 'photo',
      fallbackReply:
        'Dạ tại 160 Quốc lộ 80 (Kiên Lương), Minh Tiến có quầy chụp và in ảnh - hình thẻ lấy ngay chỉ sau 5–10 phút ạ:\n\n' +
        '• Đầy đủ kích thước: Ảnh 2x3, 3x4, 4x6, ảnh hộ chiếu (Passport), căn cước, bằng lái xe, hồ sơ xin việc/nhập học.\n' +
        '• Hỗ trợ chỉnh sáng tự nhiên, ghép áo sơ mi trắng/vest lịch sự, nhận in ảnh từ Zalo và photocopy tài liệu lấy liền.\n' +
        'Mời anh/chị xem chi tiết dịch vụ ở các thẻ đường dẫn bên dưới hoặc nhắn Zalo trực tuyến để được hỗ trợ ngay ạ!',
      cards: [
        CHAT_LINK_CATALOG.photoIdService,
        CHAT_LINK_CATALOG.printCategory,
        CHAT_LINK_CATALOG.signageCategory,
        CHAT_LINK_CATALOG.facilityContact,
      ],
    };
  }

  // 4. Chủ đề Chuyển tiền / Gửi tiền nhanh
  if (
    q.includes('chuyển tiền') ||
    q.includes('gửi tiền') ||
    q.includes('rút tiền') ||
    q.includes('momo') ||
    q.includes('ngân hàng')
  ) {
    return {
      topic: 'money',
      fallbackReply:
        'Dạ cơ sở Minh Tiến (160 Quốc lộ 80, KP. Kiên Tân, Ba Hòn, Kiên Lương) hỗ trợ dịch vụ Chuyển tiền & Gửi tiền nhanh liên ngân hàng 24/7 ạ:\n\n' +
        '• Chuyển tiền mặt vào mọi ngân hàng (Agribank, Vietcombank, BIDV, MB, VietinBank...), tiền nổi sau 1–3 phút, có biên lai xác nhận.\n' +
        '• Hỗ trợ rút tiền mặt qua mã QR, nạp/rút ví điện tử (MoMo, ZaloPay, Viettel Money), phục vụ xuyên trưa và cả Thứ Bảy, Chủ Nhật (07:30 – 18:30).\n' +
        'Anh/chị xem chi tiết tại thẻ dịch vụ bên dưới hoặc bấm Chat Zalo trực tuyến nhé ạ!',
      cards: [
        CHAT_LINK_CATALOG.moneyTransfer,
        CHAT_LINK_CATALOG.signageCategory,
        CHAT_LINK_CATALOG.printCategory,
        CHAT_LINK_CATALOG.facilityContact,
      ],
    };
  }

  // 5. Chủ đề In ấn (Name card, tem nhãn, hóa đơn, thiệp cưới, catalogue, bạt, standee)
  if (
    q.includes('in ấn') ||
    q.includes('in ') ||
    q.includes('name card') ||
    q.includes('danh thiếp') ||
    q.includes('tem nhãn') ||
    q.includes('decal') ||
    q.includes('hóa đơn') ||
    q.includes('thiệp cưới') ||
    q.includes('catalogue') ||
    q.includes('tờ rơi') ||
    q.includes('menu') ||
    q.includes('standee')
  ) {
    return {
      topic: 'print',
      fallbackReply:
        'Dạ xưởng in Minh Tiến (160 QL80, Kiên Lương) nhận in nhanh kỹ thuật số & offset sắc nét từ số lượng ít đến lớn ạ:\n\n' +
        '• Ấn phẩm kinh doanh: Name card C300 cán màng, Tem nhãn decal nhựa chống nước (bế demi sẵn), Hóa đơn bán lẻ/Phiếu thu chi Carbonless 1–3 liên, Catalogue, Menu nhựa PVC.\n' +
        '• Ấn phẩm sự kiện & cá nhân: Thiệp cưới, Bạt Hiflex khai trương, Standee cuốn nhôm, Chụp hình thẻ lấy ngay 5–10 phút.\n' +
        'Chi phí tính theo quy cách và số lượng in. Anh/chị bấm vào các thẻ sản phẩm bên dưới để xem chi tiết hoặc bấm "Chat Zalo trực tuyến" để nhận báo giá ngay ạ!',
      cards: [
        CHAT_LINK_CATALOG.printCategory,
        CHAT_LINK_CATALOG.signageCategory,
        CHAT_LINK_CATALOG.printNameCard,
        CHAT_LINK_CATALOG.printTemDecal,
        CHAT_LINK_CATALOG.photoIdService,
      ],
    };
  }

  // 6. Chủ đề Bảng hiệu quảng cáo / Báo giá bảng hiệu / Mặc định tư vấn chung
  return {
    topic: 'signage',
    fallbackReply:
      'Dạ tại xưởng Minh Tiến (160 QL80, Kiên Lương), chi phí làm bảng hiệu quảng cáo được tính minh bạch theo kích thước thực tế (m²) và chất liệu anh/chị lựa chọn ạ:\n\n' +
      '• Bảng hiệu Alu + Chữ nổi Mica/Inox gắn LED: Sang trọng, bền bỉ trước nắng gió vùng biển Kiên Lương – Ba Hòn.\n' +
      '• Đèn LED Neon Flex 12V & Hộp đèn hút nổi 2 mặt (Biển vẫy): Nổi bật cả ngày lẫn đêm cho quán cafe, spa, cửa hàng.\n' +
      '• Bảng bạt Hiflex / 3M khung sắt mạ kẽm: Tiết kiệm chi phí, thi công nhanh 1–2 ngày.\n' +
      'Minh Tiến khảo sát đo đạc tận nơi & dựng bản vẽ 3D hoàn toàn miễn phí, bảo hành 12–24 tháng. Anh/chị có thể bấm vào các thẻ bên dưới để xem chi tiết từng loại hoặc nhắn Zalo trực tuyến để nhận báo giá chính xác ạ!',
    cards: [
      CHAT_LINK_CATALOG.signageCategory,
      CHAT_LINK_CATALOG.signageAluLed,
      CHAT_LINK_CATALOG.signageInoxMica,
      CHAT_LINK_CATALOG.signageNeonFlex,
      CHAT_LINK_CATALOG.signageLightbox,
    ],
  };
}
