(() => {
  'use strict';

  const CHATBOT_ID = 'anh-minh-chatbot';
  const HISTORY_KEY = 'anhMinhChatHistory';
  const HISTORY_VERSION_KEY = 'anhMinhChatHistoryVersion';
  const AM_CHATBOT_HISTORY_VERSION = 'durability-comparison-v10';
  const MAX_HISTORY = 20;
  const AVATAR_SRC = 'linh%20v%E1%BA%ADt%20AM.jpeg';
  const HOTLINE = '0905111223';
  const QUICK_REPLIES = [
    'Tư vấn chọn tivi',
    'Mình cần mua tivi',
    'Dưới 10 triệu',
    'Dưới 20 triệu',
    'Tivi mới',
    'Tivi cũ',
    'Thu cũ đổi mới',
    'Sửa tivi',
    'Liên hệ cửa hàng',
  ];
  const SMART_RECOMMENDER_QUICK_REPLIES = ['Dưới 10 triệu', 'Dưới 20 triệu', 'Tivi mới', 'Tivi cũ', 'Phòng ngủ', 'Phòng khách'];
  const WELCOME_MESSAGE = 'Xin chào 👋 Mình là AM AI – trợ lý của Anh Minh Store. Mình có thể giúp bạn tìm tivi phù hợp, tư vấn tivi mới/tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành và thông tin cửa hàng.';
  const START_MESSAGE = 'AM AI sẵn sàng tư vấn lại từ đầu ạ 👋 Bạn đang cần mua tivi mới, tivi cũ, hỏi bảo hành hay muốn tư vấn theo ngân sách?';
  const TV_BRANDS = ['samsung', 'lg', 'sony', 'toshiba', 'tcl', 'panasonic', 'sharp', 'xiaomi', 'casper', 'coocaa', 'skyworth', 'philips', 'hitachi', 'hisense'];
  const TV_BRAND_LABELS = {
    samsung: 'Samsung',
    lg: 'LG',
    sony: 'Sony',
    toshiba: 'Toshiba',
    tcl: 'TCL',
    panasonic: 'Panasonic',
    sharp: 'Sharp',
    xiaomi: 'Xiaomi',
    casper: 'Casper',
    coocaa: 'Coocaa',
    skyworth: 'Skyworth',
    philips: 'Philips',
    hitachi: 'Hitachi',
    hisense: 'Hisense',
  };
  const PRODUCT_SOURCE_PRIORITY = { dom: 3, live: 2, supabase: 2, unknown: 0 };
  const TV_SERIES_BY_BRAND_CHATBOT = {
    Samsung: [
      { label: 'Crystal UHD', aliases: ['crystal uhd', 'crystal', 'crystal 4k'] },
      { label: 'Neo QLED', aliases: ['neo qled', 'neo quantum', 'mini led'] },
      { label: 'QLED', aliases: ['qled', 'quantum dot'] },
      { label: 'OLED', aliases: ['oled'] },
      { label: 'The Frame', aliases: ['the frame'] },
      { label: 'The Serif', aliases: ['the serif'] },
      { label: 'The Sero', aliases: ['the sero'] },
      { label: 'Lifestyle TV', aliases: ['lifestyle'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    LG: [
      { label: 'OLED', aliases: ['oled'] },
      { label: 'QNED', aliases: ['qned'] },
      { label: 'NanoCell', aliases: ['nanocell', 'nano cell', 'nano'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
      { label: 'webOS', aliases: ['webos', 'web os'] },
      { label: 'StanbyME', aliases: ['stanbyme', 'stanby me'] },
    ],
    Sony: [
      { label: 'OLED', aliases: ['oled'] },
      { label: 'Mini LED', aliases: ['mini led'] },
      { label: 'Full Array LED', aliases: ['full array led', 'full array'] },
      { label: 'BRAVIA XR', aliases: ['bravia xr', 'cognitive processor xr', 'xr cognitive', 'processor xr'] },
      { label: 'BRAVIA', aliases: ['bravia'] },
      { label: 'Google TV', aliases: ['google tv', 'google tivi'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Toshiba: [
      { label: 'Z Series', aliases: ['z series', 'z670', 'z770'] },
      { label: 'M Series', aliases: ['m series', 'm550', 'm650'] },
      { label: 'C Series', aliases: ['c series', 'c350', 'c350lp', '50c350', '55c350', '65c350', '75c350', '50c350lp', '55c350lp', '65c350lp', '75c350lp', 'c450'] },
      { label: 'V Series', aliases: ['v series', 'v35', 'v35rp', '32v35', '43v35', '32v35rp', '43v35rp'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'REGZA', aliases: ['regza'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Hisense: [
      { label: 'ULED Mini LED', aliases: ['uled mini led', 'mini led'] },
      { label: 'ULED', aliases: ['uled'] },
      { label: 'QLED', aliases: ['qled', 'quantum dot'] },
      { label: 'Laser TV', aliases: ['laser tv', 'laser'] },
      { label: 'U Series', aliases: ['u series', 'u6', 'u7', 'u8'] },
      { label: 'A Series', aliases: ['a series', 'a4', 'a6'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'VIDAA', aliases: ['vidaa'] },
    ],
    TCL: [
      { label: 'QLED', aliases: ['qled', 'quantum dot'] },
      { label: 'Mini LED', aliases: ['mini led'] },
      { label: 'C Series', aliases: ['c series', 'c645', 'c745', 'c755', 'c845'] },
      { label: 'P Series', aliases: ['p series', 'p635', 'p735', 'p745'] },
      { label: 'S Series', aliases: ['s series', 's5400', 's5500'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Panasonic: [
      { label: 'OLED', aliases: ['oled'] },
      { label: 'LED', aliases: ['led'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'MX Series', aliases: ['mx series', 'mx'] },
      { label: 'LX Series', aliases: ['lx series', 'lx'] },
      { label: 'JX Series', aliases: ['jx series', 'jx'] },
    ],
    Sharp: [
      { label: 'AQUOS', aliases: ['aquos'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Xiaomi: [
      { label: 'Xiaomi TV A Pro', aliases: ['a pro', 'tv a pro'] },
      { label: 'Xiaomi TV A', aliases: ['tv a', 'xiaomi tv a', 'a series'] },
      { label: 'Xiaomi TV P1', aliases: ['p1', 'tv p1'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
    ],
    Casper: [
      { label: 'Casper Smart TV', aliases: ['smart tv', 'casper smart'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'HD / Full HD', aliases: ['hd', 'full hd', 'fhd'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Coocaa: [
      { label: 'Coocaa Smart TV', aliases: ['smart tv', 'coocaa smart'] },
      { label: 'S Series', aliases: ['s series', 's3', 's6', 's7'] },
      { label: 'Y Series', aliases: ['y series', 'y72'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Skyworth: [
      { label: 'Skyworth Smart TV', aliases: ['smart tv', 'skyworth smart'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'OLED', aliases: ['oled'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'SUE Series', aliases: ['sue', 'sue series'] },
      { label: 'G Series', aliases: ['g series', 'g3a'] },
    ],
    Philips: [
      { label: 'Ambilight', aliases: ['ambilight'] },
      { label: 'OLED', aliases: ['oled'] },
      { label: 'The One', aliases: ['the one'] },
      { label: 'Performance Series', aliases: ['performance series'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'LED', aliases: ['led'] },
    ],
    Hitachi: [
      { label: 'Hitachi Smart TV', aliases: ['smart tv', 'hitachi smart'] },
      { label: 'Android TV', aliases: ['android tv'] },
      { label: 'Google TV', aliases: ['google tv'] },
      { label: 'QLED', aliases: ['qled'] },
      { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
      { label: 'LED', aliases: ['led'] },
    ],
  };

  const TV_SERIES_COMPARISON_PROFILES = {
    led: {
      label: 'LED',
      aliases: ['led', 'led 4k'],
      level: 1,
      strengths: 'giá dễ tiếp cận, đủ dùng, tiết kiệm chi phí',
      tradeoffs: 'hình ảnh/độ tương phản thường không nổi bật bằng QLED/OLED/Mini LED',
      bestFor: 'phòng ngủ, nhu cầu cơ bản, ngân sách thấp',
      budgetPosition: 'thấp/phổ thông',
      shortSummary: 'dòng dễ mua, đủ dùng cho nhu cầu cơ bản',
    },
    uhd: {
      label: 'UHD / 4K UHD',
      aliases: ['uhd', '4k uhd', '4k', 'ultra hd', 'led 4k'],
      level: 2,
      strengths: 'độ phân giải 4K rõ nét, phổ biến, dễ chọn',
      tradeoffs: 'chất lượng màu/độ tương phản còn tuỳ tấm nền và dòng máy',
      bestFor: 'gia đình cần tivi 4K cơ bản',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'lựa chọn 4K cơ bản, dễ dùng cho gia đình',
    },
    crystal_uhd: {
      label: 'Crystal UHD',
      aliases: ['crystal uhd', 'crystal', 'crystal 4k', 'samsung crystal'],
      level: 3,
      strengths: 'dòng 4K phổ thông của Samsung, màu sắc sáng, dễ dùng, giá mềm hơn QLED',
      tradeoffs: 'màu và độ tương phản thường không nổi bật bằng QLED/OLED/Neo QLED',
      bestFor: 'khách thích Samsung, cần tivi mới dễ dùng, ngân sách vừa phải',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'Samsung 4K phổ thông, dễ dùng và hợp ngân sách vừa',
    },
    nanocell: {
      label: 'NanoCell',
      aliases: ['nanocell', 'nano cell', 'nano', 'lg nanocell'],
      level: 4,
      strengths: 'màu sắc tự nhiên, góc nhìn ổn, hợp xem gia đình',
      tradeoffs: 'độ đen/độ tương phản thường không bằng OLED/QLED cao cấp',
      bestFor: 'khách thích LG, xem phim/YouTube gia đình, muốn màu tự nhiên',
      budgetPosition: 'trung cấp',
      shortSummary: 'LG trung cấp, màu tự nhiên và dễ xem trong gia đình',
    },
    qled: {
      label: 'QLED',
      aliases: ['qled', 'quantum dot', 'samsung qled'],
      level: 5,
      strengths: 'màu rực rỡ, độ sáng tốt, hợp phòng sáng, xem thể thao/phim ổn',
      tradeoffs: 'độ đen thường không sâu bằng OLED',
      bestFor: 'phòng khách, xem bóng đá, nội dung màu sắc sống động',
      budgetPosition: 'trung cấp đến cao hơn',
      shortSummary: 'màu rực và sáng tốt, hợp phòng khách hoặc xem thể thao',
    },
    qned: {
      label: 'QNED',
      aliases: ['qned', 'lg qned'],
      level: 5,
      strengths: 'dòng LCD cao hơn của LG, màu sắc tốt, độ sáng/độ chi tiết tốt hơn dòng phổ thông',
      tradeoffs: 'vẫn phụ thuộc từng model; OLED vẫn mạnh hơn về độ đen',
      bestFor: 'khách thích LG, muốn nâng cấp hơn NanoCell/UHD',
      budgetPosition: 'trung cấp đến cao hơn',
      shortSummary: 'LG LCD nâng cấp, cân bằng màu sắc và độ sáng',
    },
    oled: {
      label: 'OLED',
      aliases: ['oled', 'lg oled'],
      level: 8,
      strengths: 'màu đen sâu, tương phản rất tốt, xem phim đẹp, hình ảnh cao cấp',
      tradeoffs: 'giá thường cao hơn; nên cân nhắc thói quen dùng nếu để hình tĩnh quá lâu',
      bestFor: 'xem phim, phòng tối, khách ưu tiên chất lượng hình ảnh',
      budgetPosition: 'cao cấp',
      shortSummary: 'cao cấp cho phim ảnh, phòng tối và độ tương phản đẹp',
    },
    neo_qled: {
      label: 'Neo QLED',
      aliases: ['neo qled', 'neo quantum', 'samsung neo qled'],
      level: 7,
      strengths: 'độ sáng cao, tương phản tốt, công nghệ Mini LED, hợp phòng sáng và nội dung HDR',
      tradeoffs: 'giá cao hơn QLED/Crystal; độ đen vẫn khác OLED theo công nghệ nền',
      bestFor: 'khách thích Samsung cao cấp, xem thể thao/phim phòng sáng',
      budgetPosition: 'cao cấp',
      shortSummary: 'Samsung cao cấp, sáng mạnh cho phòng sáng và HDR',
    },
    mini_led: {
      label: 'Mini LED',
      aliases: ['mini led', 'miniled'],
      level: 6,
      strengths: 'sáng mạnh, kiểm soát vùng sáng tốt, HDR tốt hơn LED thường',
      tradeoffs: 'giá cao hơn dòng phổ thông; chất lượng phụ thuộc số vùng đèn và xử lý hình ảnh',
      bestFor: 'phòng khách sáng, xem thể thao, phim HDR',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'sáng cao, HDR tốt, hợp không gian nhiều ánh sáng',
    },
    bravia_xr: {
      label: 'BRAVIA XR',
      aliases: ['bravia xr', 'sony bravia xr', 'cognitive processor xr', 'xr cognitive', 'processor xr'],
      level: 7,
      strengths: 'xử lý hình ảnh tự nhiên, chuyển động tốt, hợp phim/thể thao',
      tradeoffs: 'giá Sony thường cao hơn so với cấu hình cùng cỡ',
      bestFor: 'khách ưu tiên hình ảnh tự nhiên, xem phim/thể thao',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Sony cao cấp, mạnh về xử lý hình ảnh và chuyển động',
    },
    bravia: {
      label: 'BRAVIA',
      aliases: ['bravia', 'sony bravia'],
      level: 6,
      strengths: 'xử lý hình ảnh tự nhiên, chuyển động tốt, hợp phim/thể thao',
      tradeoffs: 'giá Sony thường cao hơn so với cấu hình cùng cỡ',
      bestFor: 'khách ưu tiên hình ảnh tự nhiên, xem phim/thể thao',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Sony nổi bật về màu tự nhiên và chuyển động',
    },
    full_array_led: {
      label: 'Full Array LED',
      aliases: ['full array led', 'full array'],
      level: 5,
      strengths: 'kiểm soát đèn nền tốt hơn LED thường, tương phản ổn',
      tradeoffs: 'chưa đạt độ đen sâu như OLED và còn tuỳ model',
      bestFor: 'xem phim/thể thao với ngân sách trung cao',
      budgetPosition: 'trung cấp đến trung cao',
      shortSummary: 'LED nâng cấp về kiểm soát sáng và tương phản',
    },
    regza: {
      label: 'REGZA',
      aliases: ['regza', 'toshiba regza'],
      level: 4,
      strengths: 'dễ dùng, hợp nhu cầu gia đình và xử lý hình ảnh cân bằng',
      tradeoffs: 'ít nổi bật hơn ở phân khúc cao cấp so với QLED/OLED mạnh',
      bestFor: 'khách thích Toshiba, cần tivi gia đình ổn định',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'dòng Toshiba dễ dùng cho gia đình',
    },
    uled_mini_led: {
      label: 'ULED Mini LED',
      aliases: ['uled mini led', 'hisense uled mini led'],
      level: 6,
      strengths: 'sáng tốt, Mini LED và thông số cạnh tranh trong tầm giá',
      tradeoffs: 'trải nghiệm còn tuỳ model/hệ điều hành',
      bestFor: 'khách muốn cấu hình cao, giá cạnh tranh',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Hisense nâng cấp, cấu hình tốt trong tầm tiền',
    },
    uled: {
      label: 'ULED',
      aliases: ['uled', 'hisense uled'],
      level: 5,
      strengths: 'dòng nâng cấp của Hisense, sáng tốt, màu sắc và tương phản khá trong tầm giá',
      tradeoffs: 'độ ổn định trải nghiệm còn tuỳ model/hệ điều hành',
      bestFor: 'khách muốn cấu hình tốt trong tầm giá',
      budgetPosition: 'trung cấp',
      shortSummary: 'Hisense tầm trung, thông số tốt so với giá',
    },
    laser_tv: {
      label: 'Laser TV',
      aliases: ['laser tv', 'laser'],
      level: 8,
      strengths: 'màn hình rất lớn, trải nghiệm gần máy chiếu/tivi cao cấp',
      tradeoffs: 'giá cao, kén không gian, không phải nhu cầu phổ thông',
      bestFor: 'phòng giải trí lớn',
      budgetPosition: 'cao cấp',
      shortSummary: 'màn hình rất lớn cho phòng giải trí chuyên biệt',
    },
    google_tv: {
      label: 'Google TV',
      aliases: ['google tv'],
      level: 3,
      strengths: 'kho ứng dụng phong phú, tìm kiếm giọng nói tiện, dễ dùng với tài khoản Google',
      tradeoffs: 'trải nghiệm mượt hay không còn tuỳ cấu hình từng model',
      bestFor: 'khách cần smart TV nhiều ứng dụng',
      budgetPosition: 'tuỳ model',
      shortSummary: 'hệ điều hành thông minh nhiều ứng dụng',
    },
    android_tv: {
      label: 'Android TV',
      aliases: ['android tv'],
      level: 3,
      strengths: 'nhiều ứng dụng, quen thuộc, dễ dùng',
      tradeoffs: 'độ mượt phụ thuộc chip/bộ nhớ từng model',
      bestFor: 'khách cần smart TV cơ bản, nhiều app',
      budgetPosition: 'tuỳ model',
      shortSummary: 'smart TV phổ biến, nhiều ứng dụng',
    },
    tizen: {
      label: 'Tizen',
      aliases: ['tizen'],
      level: 3,
      strengths: 'giao diện Samsung dễ dùng, nhiều tính năng thông minh và kết nối hệ sinh thái',
      tradeoffs: 'ứng dụng và cách dùng khác Google TV/webOS',
      bestFor: 'khách thích tivi Samsung và hệ sinh thái Samsung',
      budgetPosition: 'tuỳ model',
      shortSummary: 'hệ điều hành Samsung gọn và dễ dùng',
    },
    webos: {
      label: 'webOS',
      aliases: ['webos', 'web os'],
      level: 3,
      strengths: 'giao diện LG dễ dùng, điều khiển thuận tiện, hợp gia đình',
      tradeoffs: 'trải nghiệm app tuỳ đời máy và cấu hình',
      bestFor: 'khách thích LG, cần giao diện đơn giản',
      budgetPosition: 'tuỳ model',
      shortSummary: 'hệ điều hành LG thân thiện với gia đình',
    },
    ambilight: {
      label: 'Ambilight',
      aliases: ['ambilight', 'philips ambilight'],
      level: 5,
      strengths: 'hiệu ứng đèn nền sau tivi tạo cảm giác xem phim/giải trí nổi bật',
      tradeoffs: 'là điểm cộng trải nghiệm, không thay thế cho chất lượng tấm nền',
      bestFor: 'khách thích trải nghiệm phòng phim, hiệu ứng ánh sáng',
      budgetPosition: 'tuỳ model',
      shortSummary: 'điểm nhấn ánh sáng độc đáo của Philips',
    },
    the_frame: {
      label: 'The Frame',
      aliases: ['the frame', 'samsung the frame'],
      level: 5,
      strengths: 'thiết kế như tranh treo tường, hợp trang trí nội thất',
      tradeoffs: 'mua vì thiết kế/lifestyle nhiều hơn là tối ưu giá',
      bestFor: 'khách cần tivi đẹp như decor',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Samsung lifestyle TV cho không gian decor',
    },
    the_serif: {
      label: 'The Serif',
      aliases: ['the serif'],
      level: 5,
      strengths: 'thiết kế lifestyle nổi bật, hợp không gian decor',
      tradeoffs: 'không phải lựa chọn tối ưu nếu chỉ xét giá/cấu hình',
      bestFor: 'khách ưu tiên thiết kế khác biệt',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Samsung lifestyle TV thiên về thiết kế',
    },
    the_sero: {
      label: 'The Sero',
      aliases: ['the sero'],
      level: 5,
      strengths: 'thiết kế xoay độc đáo, hợp nội dung di động',
      tradeoffs: 'kén nhu cầu và không tối ưu cho số đông',
      bestFor: 'khách thích lifestyle TV lạ, dùng nhiều nội dung dọc',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'Samsung lifestyle TV có thiết kế xoay',
    },
    lifestyle_tv: {
      label: 'Lifestyle TV',
      aliases: ['lifestyle tv', 'lifestyle'],
      level: 5,
      strengths: 'thiết kế đẹp, tạo điểm nhấn nội thất',
      tradeoffs: 'thường mua theo phong cách nhiều hơn tối ưu giá',
      bestFor: 'khách cần tivi vừa xem vừa trang trí',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'nhóm tivi thiên về thiết kế và trải nghiệm sống',
    },
  };

  const TV_BRAND_COMPARISON_PROFILES = {
    samsung: {
      label: 'Samsung',
      strengths: 'màu sắc rực, hệ sinh thái tốt, nhiều dòng Crystal/QLED/Neo QLED/OLED, giao diện Tizen dễ dùng',
      tradeoffs: 'dòng cao cấp giá cao; dòng phổ thông nên xem kỹ công nghệ từng model',
      bestFor: 'khách thích màu sáng, nhiều tính năng thông minh, đa dạng lựa chọn',
      budgetPosition: 'phổ thông đến cao cấp',
      shortSummary: 'mạnh về màu rực, Tizen và nhiều lựa chọn từ phổ thông đến cao cấp',
    },
    lg: {
      label: 'LG',
      strengths: 'webOS dễ dùng, OLED mạnh, QNED/NanoCell nhiều lựa chọn, màu tự nhiên',
      tradeoffs: 'một số dòng phổ thông cần xem kỹ độ sáng/tấm nền',
      bestFor: 'xem phim, gia đình, khách thích giao diện dễ dùng',
      budgetPosition: 'phổ thông đến cao cấp',
      shortSummary: 'mạnh về webOS, OLED và màu sắc tự nhiên',
    },
    sony: {
      label: 'Sony',
      strengths: 'xử lý hình ảnh tự nhiên, chuyển động tốt, âm thanh/hình ảnh cân bằng, BRAVIA/BRAVIA XR mạnh',
      tradeoffs: 'giá thường cao hơn',
      bestFor: 'khách ưu tiên chất lượng hình ảnh tự nhiên, phim/thể thao',
      budgetPosition: 'trung cao đến cao cấp',
      shortSummary: 'mạnh về xử lý hình ảnh tự nhiên và chuyển động',
    },
    tcl: {
      label: 'TCL',
      strengths: 'cấu hình tốt trong tầm giá, nhiều dòng QLED/Mini LED/C Series, hợp khách muốn màn lớn giá hợp lý',
      tradeoffs: 'trải nghiệm phần mềm/độ hoàn thiện tuỳ model',
      bestFor: 'khách muốn nhiều công nghệ trong ngân sách vừa',
      budgetPosition: 'phổ thông đến trung cao',
      shortSummary: 'cấu hình tốt trong tầm giá, QLED/Mini LED cạnh tranh',
    },
    hisense: {
      label: 'Hisense',
      strengths: 'ULED/Mini LED giá cạnh tranh, thông số tốt trong tầm tiền',
      tradeoffs: 'cần kiểm tra từng model/hệ điều hành',
      bestFor: 'khách muốn cấu hình tốt, giá mềm hơn một số hãng lớn',
      budgetPosition: 'phổ thông đến trung cao',
      shortSummary: 'thông số tốt, ULED/Mini LED giá cạnh tranh',
    },
    toshiba: {
      label: 'Toshiba',
      strengths: 'dễ dùng, có REGZA/C Series, hợp nhu cầu gia đình cơ bản',
      tradeoffs: 'ít nổi bật hơn ở phân khúc cao cấp so với Samsung/LG/Sony',
      bestFor: 'khách cần tivi dễ dùng, ổn định, giá hợp lý',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'dễ dùng, hợp nhu cầu gia đình và giá hợp lý',
    },
    panasonic: {
      label: 'Panasonic',
      strengths: 'thương hiệu lâu đời, màu sắc dễ chịu, phù hợp nhu cầu gia đình',
      tradeoffs: 'độ đa dạng model có thể ít hơn',
      bestFor: 'khách thích thương hiệu bền, xem gia đình',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'thương hiệu lâu đời, màu dễ chịu cho gia đình',
    },
    sharp: {
      label: 'Sharp',
      strengths: 'AQUOS, độ bền/thương hiệu quen thuộc, nhu cầu cơ bản tốt',
      tradeoffs: 'ít nổi bật hơn ở mảng công nghệ mới so với các hãng đẩy QLED/OLED mạnh',
      bestFor: 'khách cần tivi gia đình cơ bản, dễ dùng',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'thương hiệu quen thuộc, hợp tivi gia đình cơ bản',
    },
    xiaomi: {
      label: 'Xiaomi',
      strengths: 'giá dễ tiếp cận, Google TV/Android TV phổ biến, nhiều tính năng thông minh',
      tradeoffs: 'chất lượng hình ảnh/âm thanh cần xem kỹ từng model',
      bestFor: 'khách cần smart TV giá mềm',
      budgetPosition: 'phổ thông',
      shortSummary: 'smart TV giá mềm, nhiều ứng dụng và dễ tiếp cận',
    },
    casper: {
      label: 'Casper',
      strengths: 'giá dễ chịu, dễ mua, hợp nhu cầu cơ bản',
      tradeoffs: 'phân khúc cao cấp không mạnh bằng Samsung/LG/Sony',
      bestFor: 'khách tiết kiệm chi phí',
      budgetPosition: 'phổ thông',
      shortSummary: 'giá dễ chịu cho nhu cầu cơ bản',
    },
    coocaa: {
      label: 'Coocaa',
      strengths: 'giá mềm, smart TV cơ bản, hợp phòng ngủ/phòng trọ',
      tradeoffs: 'chất lượng hình ảnh/độ hoàn thiện tuỳ model',
      bestFor: 'khách cần tivi rẻ, đủ dùng',
      budgetPosition: 'phổ thông',
      shortSummary: 'smart TV giá mềm, hợp phòng ngủ hoặc phòng trọ',
    },
    skyworth: {
      label: 'Skyworth',
      strengths: 'nhiều lựa chọn smart TV, có QLED/OLED ở một số dòng, giá cạnh tranh',
      tradeoffs: 'nên kiểm tra model cụ thể',
      bestFor: 'khách muốn nhiều lựa chọn trong tầm giá',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'nhiều smart TV giá cạnh tranh',
    },
    philips: {
      label: 'Philips',
      strengths: 'Ambilight độc đáo, trải nghiệm xem phim/giải trí có điểm nhấn',
      tradeoffs: 'không phải mọi model đều có Ambilight; cần kiểm tra từng mẫu',
      bestFor: 'khách thích hiệu ứng ánh sáng và trải nghiệm giải trí',
      budgetPosition: 'trung cấp đến cao hơn',
      shortSummary: 'nổi bật nhờ Ambilight và trải nghiệm giải trí',
    },
    hitachi: {
      label: 'Hitachi',
      strengths: 'thương hiệu quen thuộc, nhu cầu gia đình cơ bản',
      tradeoffs: 'ít nổi bật hơn ở công nghệ hình ảnh mới',
      bestFor: 'khách cần tivi dễ dùng, cơ bản',
      budgetPosition: 'phổ thông đến trung cấp',
      shortSummary: 'thương hiệu quen thuộc cho nhu cầu cơ bản',
    },
  };

  const DURABILITY_BRAND_GUIDANCE = {
    samsung: {
      strengths: 'nhiều mẫu, linh kiện/dịch vụ phổ biến, công nghệ đa dạng và dễ chọn theo ngân sách',
      note: 'độ bền còn tuỳ dòng Crystal/QLED/Neo QLED/OLED và cách sử dụng',
      quick: 'hợp nếu muốn nhiều lựa chọn, tính năng thông minh đa dạng và giá dễ chọn hơn',
    },
    sony: {
      strengths: 'xử lý hình ảnh tự nhiên, chuyển động tốt và cảm giác hoàn thiện tốt',
      note: 'giá thường cao hơn, nên so model cụ thể trước khi chốt',
      quick: 'đáng cân nhắc nếu ưu tiên trải nghiệm lâu dài và ngân sách rộng',
    },
    lg: {
      strengths: 'webOS dễ dùng, OLED mạnh, QNED/NanoCell nhiều lựa chọn và hợp gia đình',
      note: 'độ bền phụ thuộc từng model và thói quen sử dụng; riêng OLED nên dùng hợp lý',
      quick: 'hợp nếu thích giao diện dễ dùng, xem phim/gia đình và hệ sinh thái LG',
    },
    tcl: {
      strengths: 'cấu hình tốt trong tầm giá, nhiều QLED/Mini LED giá cạnh tranh',
      note: 'nên kiểm tra kỹ model, bảo hành và tình trạng máy',
      quick: 'hợp nếu muốn cấu hình cao, màn lớn và giá cạnh tranh',
    },
    hisense: {
      strengths: 'cấu hình tốt trong tầm giá, nhiều QLED/Mini LED giá cạnh tranh',
      note: 'nên kiểm tra kỹ model, bảo hành và tình trạng máy',
      quick: 'hợp nếu muốn thông số tốt trong tầm tiền và giá dễ tiếp cận',
    },
    xiaomi: {
      strengths: 'giá mềm, smart TV dễ tiếp cận và nhiều ứng dụng cơ bản',
      note: 'nên chọn theo nhu cầu cơ bản, kiểm tra bảo hành và model cụ thể',
      quick: 'hợp nếu ưu tiên giá mềm và nhu cầu xem cơ bản',
    },
    casper: {
      strengths: 'giá mềm, smart TV dễ tiếp cận và phù hợp nhu cầu cơ bản',
      note: 'nên chọn theo nhu cầu cơ bản, kiểm tra bảo hành và model cụ thể',
      quick: 'hợp nếu muốn tiết kiệm chi phí cho nhu cầu phổ thông',
    },
    coocaa: {
      strengths: 'giá mềm, smart TV dễ tiếp cận và phù hợp phòng ngủ/phòng trọ',
      note: 'nên chọn theo nhu cầu cơ bản, kiểm tra bảo hành và model cụ thể',
      quick: 'hợp nếu cần smart TV giá mềm cho nhu cầu đơn giản',
    },
    toshiba: {
      strengths: 'thương hiệu quen thuộc, phù hợp nhu cầu gia đình cơ bản',
      note: 'công nghệ và mẫu mã có thể không đa dạng bằng Samsung/LG/Sony',
      quick: 'hợp nếu cần tivi gia đình dễ dùng, không quá đòi hỏi công nghệ mới',
    },
    panasonic: {
      strengths: 'thương hiệu quen thuộc, phù hợp nhu cầu gia đình cơ bản',
      note: 'công nghệ và mẫu mã có thể không đa dạng bằng Samsung/LG/Sony',
      quick: 'hợp nếu ưu tiên thương hiệu quen thuộc và nhu cầu xem cơ bản',
    },
    sharp: {
      strengths: 'thương hiệu quen thuộc, phù hợp nhu cầu gia đình cơ bản',
      note: 'công nghệ và mẫu mã có thể không đa dạng bằng Samsung/LG/Sony',
      quick: 'hợp nếu cần tivi gia đình cơ bản, dễ dùng',
    },
    hitachi: {
      strengths: 'thương hiệu quen thuộc, phù hợp nhu cầu gia đình cơ bản',
      note: 'công nghệ và mẫu mã có thể không đa dạng bằng Samsung/LG/Sony',
      quick: 'hợp nếu cần lựa chọn quen thuộc cho gia đình',
    },
  };

  const DURABILITY_SERIES_GUIDANCE = {
    led: {
      strengths: 'thường là lựa chọn phổ thông, dễ dùng và chi phí hợp lý',
      note: 'hợp nếu muốn dùng cơ bản, ít đòi hỏi công nghệ cao',
      quick: 'hợp nhu cầu cơ bản và ngân sách tiết kiệm',
    },
    uhd: {
      strengths: 'thường là lựa chọn phổ thông, dễ dùng và chi phí hợp lý',
      note: 'hợp nếu muốn dùng cơ bản, ít đòi hỏi công nghệ cao',
      quick: 'hợp nhu cầu 4K cơ bản và ngân sách vừa phải',
    },
    crystal_uhd: {
      strengths: 'là dòng 4K phổ thông, dễ dùng và chi phí hợp lý',
      note: 'hợp nếu muốn dùng cơ bản, ít đòi hỏi công nghệ cao',
      quick: 'hợp nếu thích Samsung và cần lựa chọn 4K dễ tiếp cận',
    },
    qled: {
      strengths: 'nâng cấp về màu sắc/độ sáng so với dòng phổ thông, sáng tốt và hợp phòng sáng',
      note: 'độ bền phụ thuộc model, tấm nền và môi trường sử dụng',
      quick: 'phòng sáng hoặc xem bóng đá nhiều thì QLED dễ hợp hơn',
    },
    qned: {
      strengths: 'nâng cấp về màu sắc/độ sáng so với dòng phổ thông, nhiều lựa chọn trong hệ LG',
      note: 'độ bền phụ thuộc model, tấm nền và môi trường sử dụng',
      quick: 'hợp nếu thích LG/webOS và muốn nâng cấp hơn UHD/NanoCell',
    },
    nanocell: {
      strengths: 'nâng cấp về màu sắc so với dòng phổ thông và hợp xem gia đình',
      note: 'độ bền phụ thuộc model, tấm nền và môi trường sử dụng',
      quick: 'hợp nếu thích màu tự nhiên, webOS và nhu cầu gia đình',
    },
    oled: {
      strengths: 'hình ảnh đẹp, màu đen sâu và xem phim rất tốt',
      note: 'nên dùng hợp lý nếu thường xuyên để hình tĩnh quá lâu',
      quick: 'xem phim/phòng tối và ngân sách cao thì OLED đáng cân nhắc',
    },
    mini_led: {
      strengths: 'sáng mạnh, HDR tốt và hợp phòng sáng',
      note: 'giá cao hơn, nên chọn model có bảo hành rõ',
      quick: 'hợp phòng sáng, nội dung HDR hoặc thể thao',
    },
    neo_qled: {
      strengths: 'sáng mạnh, HDR tốt và hợp phòng sáng',
      note: 'giá cao hơn, nên chọn model có bảo hành rõ',
      quick: 'hợp nếu thích Samsung cao cấp, phòng sáng và thể thao/HDR',
    },
  };

  const CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR = [
    `#${CHATBOT_ID}`,
    '.am-chatbot-window',
    '.am-chatbot-popup',
    '.am-chatbot-panel',
    '.am-chatbot-widget',
  ].join(', ');

  const RECOMMENDATION_INTENT_KEYWORDS = [
    'nên mua', 'nen mua', 'tư vấn', 'tu van', 'chọn', 'chon', 'phù hợp', 'phu hop', 'loại nào', 'loai nao',
    'con nào', 'con nao', 'mua tivi', 'mua tv', 'tivi nào', 'tivi nao', 'tv nào', 'tv nao', 'phòng', 'phong',
    'ngân sách', 'ngan sach', 'dưới', 'duoi', 'tầm', 'tam', 'khoảng', 'khoang', 'triệu', 'trieu', 'tr',
    'inch', 'inh', 'giá rẻ', 'gia re', 'cao cấp', 'cao cap', 'world cup', 'bóng đá', 'bong da',
    'có mẫu', 'co mau', 'còn mẫu', 'con mau', 'mẫu nào', 'mau nao', 'còn hàng', 'con hang',
    'qled', 'oled', 'mini led', 'crystal', 'crystal uhd', 'nanocell', 'qned', 'bravia', 'google tv', 'android tv',
    ...TV_BRANDS,
  ];

  let elements = {};
  let chatHistory = [];
  let hasRenderedQuickReplies = false;

  const normalizeVietnameseText = (text = '') => String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const normalizeText = normalizeVietnameseText;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const safeLocalStorage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (error) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (error) { /* Chat still works without storage. */ }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch (error) { /* Chat still works without storage. */ }
    },
  };

  const getZaloHref = () => '#';

  const createAction = (label, href, primary = false, zaloChoice = false) => ({ label, type: 'link', href, primary, zaloChoice });
  const callAction = () => createAction('Gọi ngay', `tel:${HOTLINE}`, true);
  const zaloAction = () => createAction('Nhắn Zalo', getZaloHref(), false, true);
  const newTvAction = () => createAction('Xem tivi mới', 'index.html#tivi-moi', true);
  const oldTvAction = () => createAction('Xem tivi cũ', 'index.html#tivi-cu', true);
  const featuredAction = () => createAction('Xem sản phẩm nổi bật', 'index.html#san-pham');

  const createProductDetailUrl = (product) => {
    if (!product || !product.id) return '';
    return `product-detail.html?id=${encodeURIComponent(product.id)}`;
  };

  const getProductValue = (product, keys) => {
    for (const key of keys) {
      if (product && product[key] !== undefined && product[key] !== null && product[key] !== '') return product[key];
    }
    return '';
  };

  const stringifyProductInfo = (value) => {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.map(stringifyProductInfo).filter(Boolean).join(' ');
    if (typeof value === 'object') return Object.values(value).map(stringifyProductInfo).filter(Boolean).join(' ');
    return String(value);
  };

  const formatPriceText = (value) => {
    if (value === undefined || value === null || value === '') return 'Giá đang cập nhật';
    if (typeof value === 'number' && Number.isFinite(value)) return `${value.toLocaleString('vi-VN')}đ`;
    return String(value).trim() || 'Giá đang cập nhật';
  };

  const formatPriceNumberForChatbot = (value) => {
    const priceNumber = parseVietnamesePriceToNumber(value);
    return priceNumber ? `${priceNumber.toLocaleString('vi-VN')}đ` : formatPriceText(value);
  };

  const parseVietnamesePriceToNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const normalized = normalizeVietnameseText(raw)
      .replace(/vnđ|vnd|dong|dồng|đồng|₫|đ/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rangeMillionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:-|den|toi|–)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (rangeMillionMatch) return Math.round(Number(rangeMillionMatch[2].replace(',', '.')) * 1000000);

    const millionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (millionMatch) return Math.round(Number(millionMatch[1].replace(',', '.')) * 1000000);

    const compact = normalized.replace(/\s+/g, '');
    const groupedMatches = compact.match(/\d{1,3}(?:[.,]\d{3}){1,3}/g);
    if (groupedMatches?.length) {
      const number = Number(groupedMatches[groupedMatches.length - 1].replace(/[.,]/g, ''));
      if (Number.isFinite(number) && number > 0) return number;
    }

    const digits = normalized.replace(/[^\d]/g, '');
    if (!digits) return null;
    const number = Number(digits);
    if (!Number.isFinite(number) || number <= 0) return null;
    return number < 1000 ? number * 1000000 : number;
  };

  const parseSizeToNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const text = normalizeVietnameseText(value ?? '');
    if (!text) return null;
    const explicit = text.match(/\b(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh|\")?\b/);
    if (explicit) return Number(explicit[1]);
    const generic = text.match(/\b(\d{2})\b/);
    return generic ? Number(generic[1]) : null;
  };

  const normalizeProductForChatbot = (product = {}, index = 0) => {
    const id = getProductValue(product, ['id', 'slug', 'code', 'product_id', 'productId', 'sku']);
    const brand = String(getProductValue(product, ['brand', 'manufacturer', 'vendor']) || '').trim();
    const model = String(getProductValue(product, ['model', 'model_name', 'modelName', 'sku']) || '').trim();
    const name = String(getProductValue(product, ['full_name', 'fullName', 'name', 'title', 'product_name', 'productName']) || model || brand || 'Sản phẩm tivi').trim();
    const size = getProductValue(product, ['size', 'screen_size', 'screenSize']);
    const type = String(getProductValue(product, ['type', 'product_type', 'productType', 'category']) || '').trim();
    const condition = String(getProductValue(product, ['condition', 'status']) || '').trim();
    const warranty = String(getProductValue(product, ['warranty', 'badge']) || '').trim();
    const price = getProductValue(product, ['price', 'salePrice', 'sale_price', 'sellingPrice', 'selling_price', 'finalPrice', 'final_price']);
    const oldPrice = getProductValue(product, ['old_price', 'oldPrice', 'compareAtPrice', 'compare_at_price', 'originalPrice', 'original_price']);
    const images = getProductValue(product, ['images']);
    const image = String(getProductValue(product, ['image', 'image_url', 'imageUrl', 'thumbnail', 'thumbnail_url']) || (Array.isArray(images) ? images[0] : '') || '').trim();
    const featuresText = stringifyProductInfo([
      getProductValue(product, ['features']),
      getProductValue(product, ['description']),
      getProductValue(product, ['overview']),
      getProductValue(product, ['specifications']),
    ]);
    const normalizedProduct = {
      id: id ? String(id).trim() : '',
      brand,
      model,
      name,
      fullName: name,
      size: String(size || '').trim(),
      sizeNumber: parseSizeToNumber(size || name || model),
      type,
      condition,
      warranty,
      priceNumber: parseVietnamesePriceToNumber(price),
      priceText: formatPriceNumberForChatbot(price),
      oldPriceNumber: parseVietnamesePriceToNumber(oldPrice),
      oldPriceText: oldPrice ? formatPriceNumberForChatbot(oldPrice) : '',
      image,
      detailUrl: '',
      featuresText,
      isFeatured: Boolean(product.is_featured ?? product.isFeatured ?? product.featured ?? false),
      isActive: product.is_active ?? product.isActive ?? product.active ?? true,
      href: product.href || product.detailUrl || product.detail_url || product.url || '',
      source: product.__chatbotSource || 'unknown',
      sourcePriority: Number(product.__chatbotPriority || 0),
      sourceIndex: index,
    };
    normalizedProduct.detailUrl = normalizedProduct.href || createProductDetailUrl(normalizedProduct);
    normalizedProduct.searchableText = normalizeVietnameseText([
      normalizedProduct.id,
      normalizedProduct.brand,
      normalizedProduct.model,
      normalizedProduct.name,
      normalizedProduct.size,
      normalizedProduct.type,
      normalizedProduct.condition,
      normalizedProduct.warranty,
      normalizedProduct.priceText,
      normalizedProduct.featuresText,
    ].join(' '));
    return normalizedProduct;
  };

  const pickText = (root, selectors = []) => {
    for (const selector of selectors) {
      const element = root.querySelector(selector);
      const text = element?.textContent?.trim();
      if (text) return text;
      const attrText = element?.getAttribute?.('aria-label')?.trim();
      if (attrText) return attrText;
    }
    return '';
  };

  const pickAttribute = (root, selectors = [], attribute = 'src') => {
    for (const selector of selectors) {
      const element = root.querySelector(selector);
      const value = element?.getAttribute?.(attribute)?.trim();
      if (value) return value;
    }
    return '';
  };

  const isElementHiddenFromChatbotScrape = (element) => {
    if (!element) return true;
    if (element.hidden || element.getAttribute?.('aria-hidden') === 'true') return true;
    const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    return style?.display === 'none' || style?.visibility === 'hidden';
  };

  const isOldPriceElement = (element) => {
    if (!element) return false;
    const oldPricePattern = /old|original|compare|strike|was|line-through/i;
    const descriptor = [element.className, element.id, element.getAttribute?.('data-price-type'), element.getAttribute?.('aria-label')].join(' ');
    const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    return oldPricePattern.test(descriptor)
      || ['DEL', 'S', 'STRIKE'].includes(element.tagName)
      || Boolean(element.closest?.('del, s, strike, .product-price__old, .old-price, .compare-price, .original-price, .strike, [data-old-price]'))
      || style?.textDecorationLine?.includes('line-through');
  };

  const pickDomSalePrice = (root) => {
    const directSelectors = [
      '.product-price__sale',
      '.sale-price',
      '.current-price',
      '.price-current',
      '.price-sale',
      '[data-product-price]',
      '[data-price]',
    ];
    for (const selector of directSelectors) {
      const element = root.querySelector(selector);
      const text = element?.textContent?.trim() || element?.getAttribute?.('data-product-price') || element?.getAttribute?.('data-price') || '';
      if (text && !isElementHiddenFromChatbotScrape(element) && !isOldPriceElement(element) && parseVietnamesePriceToNumber(text)) return text.trim();
    }

    const priceContainer = root.querySelector('.product-price, .price, .product-card-price') || root;
    const candidates = Array.from(priceContainer.querySelectorAll('*'))
      .filter((element) => !isElementHiddenFromChatbotScrape(element) && !isOldPriceElement(element))
      .map((element) => ({ text: element.textContent?.trim() || '', price: parseVietnamesePriceToNumber(element.textContent || '') }))
      .filter((item) => item.text && item.price);

    if (candidates.length) return candidates[candidates.length - 1].text;

    const textWithoutOldPrices = Array.from(priceContainer.childNodes).map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (isElementHiddenFromChatbotScrape(node) || isOldPriceElement(node))) return '';
      return node.textContent || '';
    }).join(' ');
    const match = textWithoutOldPrices.match(/(?:gia\s*:?\s*)?\d{1,3}(?:[.,]\d{3}){1,3}\s*(?:đ|₫|vnd|vnđ)?|\d+\s*(?:trieu|triệu|tr\b)/i);
    return match ? match[0].trim() : '';
  };

  const pickDomOldPrice = (root) => {
    const oldElement = root.querySelector('.product-price__old, .old-price, .compare-price, .original-price, del, s, strike, [data-old-price]');
    return oldElement?.textContent?.trim() || oldElement?.getAttribute?.('data-old-price') || '';
  };

  const findProductIdFromHref = (href = '') => {
    if (!href) return '';
    try {
      const url = new URL(href, window.location.href);
      return url.searchParams.get('id') || '';
    } catch (error) {
      const match = String(href).match(/[?&]id=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    }
  };

  const readDomProductsForChatbot = () => {
    const productsFromDom = [];
    const cardSelector = [
      '.product-card',
      '.product-card-wrap',
      '.used-tv-card',
      '.product-item',
      '.product',
      '[data-product-id]',
      '[data-product-card]',
      '[data-used-tv-card]',
      '[data-new-tv-card]',
    ].join(', ');

    document.querySelectorAll(cardSelector).forEach((card, index) => {
      if (card.closest(CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR) || isElementHiddenFromChatbotScrape(card)) return;
      const productRoot = card.matches('.product-card-wrap') ? card : card.closest('.product-card-wrap') || card;
      if (productRoot.closest(CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR) || isElementHiddenFromChatbotScrape(productRoot)) return;
      const link = card.matches('a[href]') ? card : productRoot.querySelector('a[href]');
      const href = link?.getAttribute('href') || '';
      const name = pickText(productRoot, ['.product-card-name', '.product-title', '.product-name', 'h3', 'h2', '[data-product-name]', '[data-title]']);
      const explicitModel = pickText(productRoot, ['.product-card-model', '.product-model', '.model', '[data-product-model]', '[data-model]']);
      const inferredModel = (name || productRoot.textContent || '').match(/\b(?:UA|QA|KD|XR|KDL|OLED|QNED|TCL|L|55|43|50|65)[A-Z0-9-]{4,}\b/i)?.[0] || '';
      const model = explicitModel || inferredModel;
      const brand = pickText(productRoot, ['.product-card-brand', '.product-brand', '.brand', '[data-product-brand]', '[data-brand]'])
        || productRoot.getAttribute('data-used-brand')
        || productRoot.getAttribute('data-new-brand')
        || '';
      const size = pickText(productRoot, ['.product-size', '.product-card__size', '.screen-size', '[data-product-size]', '[data-size]'])
        || productRoot.getAttribute('data-used-size')
        || productRoot.getAttribute('data-new-size')
        || '';
      const type = pickText(productRoot, ['.product-type', '.product-card__type', '.category', '[data-product-type]', '[data-type]'])
        || productRoot.getAttribute('data-used-type')
        || productRoot.getAttribute('data-new-type')
        || '';
      const price = pickDomSalePrice(productRoot);
      const oldPrice = pickDomOldPrice(productRoot);
      const image = pickAttribute(productRoot, ['img.product-card__image', 'img'], 'src') || pickAttribute(productRoot, ['img'], 'data-src');
      const badge = pickText(productRoot, ['.product-card__badge', '.badge']);
      const allText = productRoot.textContent?.trim() || '';

      if (name || model || brand || price || allText) {
        productsFromDom.push({
          id: productRoot.getAttribute('data-product-id') || findProductIdFromHref(href) || '',
          fullName: name || allText.slice(0, 90),
          model,
          brand,
          size,
          type,
          price,
          oldPrice,
          image,
          href,
          badge,
          features: allText,
          __chatbotSource: 'dom',
          __chatbotPriority: PRODUCT_SOURCE_PRIORITY.dom,
        });
      }
    });
    return productsFromDom;
  };

  const cloneProductsWithSource = (items = [], source = 'unknown', priority = PRODUCT_SOURCE_PRIORITY.unknown) => items.map((item) => ({
    ...(item || {}),
    __chatbotSource: item?.__chatbotSource || source,
    __chatbotPriority: item?.__chatbotPriority ?? priority,
  }));

  const collectProductArraysFromObject = (source, rawProducts, sourceName = 'state', priority = PRODUCT_SOURCE_PRIORITY.live) => {
    if (!source || typeof source !== 'object') return;
    [
      'products',
      'allProducts',
      'loadedProducts',
      'siteProducts',
      'currentProducts',
      'filteredProducts',
      'visibleProducts',
      'supabaseProducts',
      'productCache',
      'cachedProducts',
      'items',
    ].forEach((key) => {
      if (Array.isArray(source[key])) rawProducts.push(...cloneProductsWithSource(source[key], `${sourceName}.${key}`, priority));
    });
  };

  const getProductDedupKeys = (product) => {
    const keys = [];
    const id = normalizeVietnameseText(product.id || '');
    const model = normalizeVietnameseText(product.model || '').replace(/\s+/g, '');
    if (id) keys.push(`id:${id}`);
    if (model) keys.push(`model:${model}`);
    return keys.length ? keys : [`name:${normalizeVietnameseText(product.name || product.fullName || '')}`];
  };

  const mergeChatbotProducts = (existing, incoming) => {
    const primary = incoming.sourcePriority >= existing.sourcePriority ? incoming : existing;
    const secondary = primary === incoming ? existing : incoming;
    return {
      ...secondary,
      ...primary,
      id: primary.id || secondary.id,
      brand: primary.brand || secondary.brand,
      model: primary.model || secondary.model,
      name: primary.name || secondary.name,
      fullName: primary.fullName || secondary.fullName,
      size: primary.size || secondary.size,
      sizeNumber: primary.sizeNumber || secondary.sizeNumber,
      type: primary.type || secondary.type,
      condition: primary.condition || secondary.condition,
      warranty: primary.warranty || secondary.warranty,
      priceNumber: primary.priceNumber,
      priceText: primary.priceText,
      oldPriceNumber: primary.oldPriceNumber,
      oldPriceText: primary.oldPriceText,
      image: primary.image || secondary.image,
      href: primary.href || secondary.href,
      detailUrl: primary.detailUrl || secondary.detailUrl,
      featuresText: primary.featuresText || secondary.featuresText || '',
      searchableText: primary.searchableText || secondary.searchableText || '',
      source: primary.source,
      sourcePriority: primary.sourcePriority,
      isActive: primary.isActive,
    };
  };

  const summarizeProductSources = (products = []) => products.reduce((summary, product) => {
    const source = product.source || 'unknown';
    summary[source] = (summary[source] || 0) + 1;
    return summary;
  }, {});

  const getAvailableProductsForChatbot = () => {
    const rawProducts = [];
    try {
      const currentKeys = [
        'currentProducts',
        'anhMinhProducts',
        'siteProducts',
        'loadedProducts',
        'allProducts',
        'filteredProducts',
        'visibleProducts',
        'supabaseProducts',
        'productCache',
        'cachedProducts',
      ];
      rawProducts.push(...readDomProductsForChatbot());

      currentKeys.forEach((key) => {
        if (Array.isArray(window[key])) rawProducts.push(...cloneProductsWithSource(window[key], `window.${key}`, PRODUCT_SOURCE_PRIORITY.live));
      });

      [
        window.AnhMinhStore,
        window.anhMinhStore,
        window.AnhMinhProductsState,
        window.AnhMinhProductStore,
        window.anhMinhProductStore,
        window.AnhMinhSupabase,
        window.anhMinhSupabase,
      ].forEach((state, index) => collectProductArraysFromObject(state, rawProducts, `state${index + 1}`, PRODUCT_SOURCE_PRIORITY.supabase));

    } catch (error) {
      console.warn('[AM AI] Không thể lấy dữ liệu sản phẩm cho chatbot.', error);
      return [];
    }

    const unique = new Map();
    const aliasToPrimaryKey = new Map();
    rawProducts.forEach((item, index) => {
      const product = normalizeProductForChatbot(item, index);
      if (!product.name && !product.model && !product.brand && !product.priceNumber) return;
      const keys = getProductDedupKeys(product).filter(Boolean);
      const existingKey = keys.map((key) => aliasToPrimaryKey.get(key) || (unique.has(key) ? key : '')).find(Boolean);
      const primaryKey = existingKey || keys[0] || `product-${index}`;
      const mergedProduct = existingKey ? mergeChatbotProducts(unique.get(existingKey), product) : product;
      unique.set(primaryKey, mergedProduct);
      keys.forEach((key) => aliasToPrimaryKey.set(key, primaryKey));
    });

    return Array.from(unique.values()).filter((product) => {
      const source = String(product.source || '').toLowerCase();
      if (source.includes('fallback') || source.includes('products.js')) return false;
      if (product.isActive === false || product.isActive === 'false') return false;
      return product.name || product.model || product.priceNumber;
    });
  };

  const getRecommendedRangeForArea = (area, roomType) => {
    if (roomType === 'bedroom' || roomType === 'small') return { min: 32, max: 43, label: '32–43 inch' };
    if (!area) return null;
    if (area <= 20) return { min: 43, max: 43, label: '43 inch' };
    if (area <= 25) return { min: 43, max: 50, label: '43–50 inch' };
    if (area < 30) return { min: 50, max: 55, label: '50–55 inch' };
    if (area <= 40) return { min: 55, max: 65, label: '55–65 inch' };
    return { min: 65, max: 75, label: '65–75 inch' };
  };

  const getRecommendedRangeForDistance = (distance) => {
    if (!distance) return null;
    if (distance < 2) return { min: 43, max: 50, label: '43–50 inch' };
    if (distance < 2.5) return { min: 50, max: 55, label: '50–55 inch' };
    if (distance <= 3) return { min: 55, max: 65, label: '55–65 inch' };
    return { min: 65, max: 98, label: '65 inch trở lên' };
  };

  const parseViewingDistanceFromMessage = (normalizedMessage = '') => {
    const directMatch = normalizedMessage.match(/(?:cach(?:\s+tivi)?|ngoi(?:\s+cach(?:\s+tivi)?)?|khoang cach xem)\s*(?:khoang|tam)?\s*(\d+(?:[.,]\d+)?)\s*(m|met|meter|mét)\b/);
    if (directMatch) return Number(directMatch[1].replace(',', '.'));
    const reverseMatch = normalizedMessage.match(/\b(\d+(?:[.,]\d+)?)\s*(m|met|meter|mét)\s*(?:thi|nen)?\s*(?:mua|chon|xem|ngoi|cach)/);
    if (reverseMatch && hasAny(normalizedMessage, ['khoang cach', 'ngoi cach', 'cach tivi', 'mua may inch', 'bao nhieu inch'])) {
      return Number(reverseMatch[1].replace(',', '.'));
    }
    return null;
  };

  const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const isWeakSeriesAlias = (alias = '') => {
    const compactAlias = normalizeVietnameseText(alias).replace(/\s+/g, '');
    return compactAlias.length <= 2 && !/\d/.test(compactAlias);
  };

  const textHasAlias = (text = '', alias = '') => {
    const normalizedText = normalizeVietnameseText(text);
    const normalizedAlias = normalizeVietnameseText(alias);
    if (!normalizedText || !normalizedAlias || isWeakSeriesAlias(normalizedAlias)) return false;
    if (normalizedAlias.includes(' ')) {
      const phrasePattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias).replace(/\s+/g, '\\s+')}([^a-z0-9]|$)`);
      return phrasePattern.test(normalizedText);
    }
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias)}([^a-z0-9]|$)`).test(normalizedText);
  };

  const getSeriesOptionsForBrand = (brand) => {
    if (brand && TV_SERIES_BY_BRAND_CHATBOT[brand]) return TV_SERIES_BY_BRAND_CHATBOT[brand];
    return Object.values(TV_SERIES_BY_BRAND_CHATBOT)
      .flat()
      .filter((series, index, allSeries) => allSeries.findIndex((item) => item.label === series.label) === index);
  };

  const TOSHIBA_MODEL_SERIES_PATTERNS = [
    { label: 'Z Series', patterns: [/\b(?:\d{2})?z(?:670|770)[a-z0-9]*\b/] },
    { label: 'M Series', patterns: [/\b(?:\d{2})?m(?:550|650)[a-z0-9]*\b/] },
    { label: 'C Series', patterns: [/\b(?:\d{2})?c350(?:lp)?\b/, /\b(?:\d{2})?c450[a-z0-9]*\b/] },
    { label: 'V Series', patterns: [/\b(?:32|43)?v35(?:rp)?\b/] },
  ];

  const detectToshibaModelSeriesFromText = (text = '') => {
    const compactText = normalizeVietnameseText(text).replace(/[^a-z0-9]+/g, ' ');
    return TOSHIBA_MODEL_SERIES_PATTERNS.find((series) => series.patterns.some((pattern) => pattern.test(compactText)))?.label || '';
  };

  const detectToshibaModelSeries = (product = {}) => detectToshibaModelSeriesFromText(getProductSeriesHaystack(product));

  const detectTvSeriesFromMessage = (normalizedMessage = '', brand = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    if (normalizeVietnameseText(brand) === 'toshiba') {
      const toshibaModelSeries = detectToshibaModelSeriesFromText(message);
      if (toshibaModelSeries) {
        const option = getSeriesOptionsForBrand(brand).find((series) => series.label === toshibaModelSeries);
        return {
          series: normalizeVietnameseText(toshibaModelSeries),
          seriesLabel: toshibaModelSeries,
          aliases: option?.aliases || [toshibaModelSeries],
        };
      }
    }
    const options = getSeriesOptionsForBrand(brand)
      .flatMap((series) => series.aliases.map((alias) => ({ ...series, alias: normalizeVietnameseText(alias) })))
      .sort((a, b) => b.alias.length - a.alias.length || b.label.length - a.label.length);
    const match = options.find((series) => textHasAlias(message, series.alias));
    if (!match) return null;
    return {
      series: normalizeVietnameseText(match.label),
      seriesLabel: match.label,
      aliases: getSeriesOptionsForBrand(brand).find((series) => series.label === match.label)?.aliases || [match.alias],
    };
  };

  const normalizeComparisonKey = (label = '') => normalizeVietnameseText(label).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  const getSeriesComparisonProfileByLabel = (label = '') => {
    const normalizedLabel = normalizeVietnameseText(label);
    return Object.values(TV_SERIES_COMPARISON_PROFILES).find((profile) => (
      normalizeVietnameseText(profile.label) === normalizedLabel
      || profile.aliases.some((alias) => normalizeVietnameseText(alias) === normalizedLabel)
    )) || null;
  };

  const getAllSeriesComparisonOptions = () => {
    const fromProfiles = Object.values(TV_SERIES_COMPARISON_PROFILES);
    const fromSeriesMap = Object.values(TV_SERIES_BY_BRAND_CHATBOT).flat().map((series) => ({
      ...series,
      ...(getSeriesComparisonProfileByLabel(series.label) || {}),
      label: series.label,
      aliases: [...new Set([...(getSeriesComparisonProfileByLabel(series.label)?.aliases || []), ...series.aliases])],
    }));
    return [...fromProfiles, ...fromSeriesMap]
      .filter((series, index, allSeries) => allSeries.findIndex((item) => item.label === series.label) === index);
  };

  const getDefaultBrandForSeries = (seriesLabel = '') => {
    const brandEntry = Object.entries(TV_SERIES_BY_BRAND_CHATBOT).find(([, seriesList]) => (
      seriesList.some((series) => series.label === seriesLabel)
    ));
    return brandEntry ? brandEntry[0] : '';
  };

  const findAliasMatchSpan = (message = '', alias = '') => {
    const normalizedAlias = normalizeVietnameseText(alias);
    if (!message || !normalizedAlias) return null;
    if (normalizedAlias.includes(' ')) {
      const index = message.indexOf(normalizedAlias);
      return index >= 0 ? { start: index, end: index + normalizedAlias.length } : null;
    }
    const match = message.match(new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias)}([^a-z0-9]|$)`));
    if (match?.index !== undefined) {
      const start = match.index + (match[1] ? match[1].length : 0);
      return { start, end: start + normalizedAlias.length };
    }
    return null;
  };

  const findAliasIndex = (message = '', alias = '') => {
    const span = findAliasMatchSpan(message, alias);
    if (span) return span.start;
    const normalizedAlias = normalizeVietnameseText(alias);
    const compactAlias = normalizedAlias.replace(/\s+/g, '');
    if (compactAlias.length >= 4) return message.replace(/\s+/g, '').indexOf(compactAlias);
    return -1;
  };

  const detectComparedBrands = (normalizedMessage = '') => TV_BRANDS
    .map((brand) => ({ type: 'brand', key: brand, label: TV_BRAND_LABELS[brand], profile: TV_BRAND_COMPARISON_PROFILES[brand], index: findAliasIndex(normalizedMessage, brand) }))
    .filter((brand) => brand.index >= 0 && brand.profile)
    .sort((a, b) => a.index - b.index);

  const detectComparedSeries = (normalizedMessage = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    const options = getAllSeriesComparisonOptions()
      .flatMap((series) => series.aliases.map((alias) => ({
        ...series,
        key: normalizeComparisonKey(series.label),
        alias,
        normalizedAlias: normalizeVietnameseText(alias),
      })))
      .sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length || b.label.length - a.label.length);
    const matches = [];
    const spansOverlap = (spanA, spanB) => spanA && spanB && spanA.start < spanB.end && spanB.start < spanA.end;
    options.forEach((series) => {
      if (matches.some((match) => match.label === series.label)) return;
      const profile = getSeriesComparisonProfileByLabel(series.label);
      if (!profile || !textHasAlias(message, series.alias)) return;
      const span = findAliasMatchSpan(message, series.alias) || { start: findAliasIndex(message, series.alias), end: findAliasIndex(message, series.alias) + series.normalizedAlias.length };
      if (span.start < 0 || matches.some((match) => spansOverlap(span, match.span))) return;
      matches.push({
        type: 'series',
        key: normalizeComparisonKey(profile.label),
        label: profile.label,
        profile,
        aliases: profile.aliases,
        defaultBrand: getDefaultBrandForSeries(profile.label),
        contextBrand: '',
        index: span.start,
        span,
      });
    });

    const brands = detectComparedBrands(message);
    matches.forEach((series) => {
      const nearbyBrand = brands
        .map((brand) => ({ ...brand, isBeforeSeries: brand.index <= series.index, distance: Math.min(Math.abs(brand.index - series.index), Math.abs(brand.index - (series.span?.end || series.index))) }))
        .filter((brand) => (brand.isBeforeSeries && series.index - brand.index <= 35) || (!brand.isBeforeSeries && brand.distance <= 12))
        .sort((a, b) => Number(b.isBeforeSeries) - Number(a.isBeforeSeries) || a.distance - b.distance)[0];
      series.contextBrand = nearbyBrand?.label || series.defaultBrand || '';
    });
    return matches.sort((a, b) => a.index - b.index);
  };

  const detectComparisonEntities = (normalizedMessage = '') => {
    const brands = detectComparedBrands(normalizedMessage);
    const series = detectComparedSeries(normalizedMessage);
    const seriesContextBrands = new Set(series.map((item) => normalizeVietnameseText(item.contextBrand)).filter(Boolean));
    const standaloneBrands = brands.filter((brand) => !seriesContextBrands.has(normalizeVietnameseText(brand.label)));
    return { brands, series, standaloneBrands, all: [...brands, ...series].sort((a, b) => a.index - b.index) };
  };

  const DURABILITY_INTENT_PHRASES = [
    'ben hon', 'hang nao ben', 'cai nao ben', 'loai nao ben', 'mau nao ben', 'dong nao ben',
    'it loi hon', 'it hu hon', 'de hu khong', 'tuoi tho', 'dung lau', 'dung lau hon', 'on dinh hon',
  ];

  const hasDurabilityIntent = (normalizedMessage = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    if (!message) return false;
    if (hasAny(message, DURABILITY_INTENT_PHRASES)) return true;
    if (/\bben\s+(khong|ko|k)\b/.test(message) && hasAny(message, ['tivi', 'tv', 'model', 'mau', 'hang', ...TV_BRANDS])) return true;
    if (/\b(it\s+loi|it\s+hu|tuoi\s+tho|dung\s+lau|on\s+dinh)\b/.test(message) && hasAny(message, ['tivi', 'tv', 'hang', 'mau', 'model', 'qled', 'oled', 'led', ...TV_BRANDS])) return true;
    return false;
  };

  const hasDurabilityComparisonIntent = (normalizedMessage = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    if (!hasDurabilityIntent(message)) return false;
    const entities = detectComparisonEntities(message);
    const comparableCount = entities.series.length + entities.brands.length;
    if (comparableCount >= 2) return true;
    return hasAny(message, ['hang nao ben', 'loai nao ben', 'mau nao ben', 'dong nao ben', 'tivi cu hang nao ben', 'tv cu hang nao ben']);
  };

  const isComparisonIntent = (normalizedMessage = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    if (!message) return false;
    if (hasDurabilityComparisonIntent(message)) return true;
    if (hasAny(message, ['so sanh', 'khac gi', 'khac nhau', 'cai nao hon', 'con nao hon', 'nen chon cai nao', 'nen mua cai nao', 'loai nao tot hon', 'hang nao tot hon', 'dong nao tot hon', 'hon khong', 'co hon', 'bang khong', 'ngon hon'])) return true;
    const entities = detectComparisonEntities(message);
    const comparableCount = entities.series.length + entities.brands.length;
    if (comparableCount < 2) return false;
    if (/\bvs\b/.test(message)) return true;
    if (/(^|\s)(voi|hay)(\s|$)/.test(message)) return true;
    return false;
  };

  const getNeedConclusionPrefix = (need = {}) => {
    if (need.usage?.includes('sports')) return 'Nếu ưu tiên xem bóng đá/phòng sáng';
    if (need.usage?.includes('movies')) return 'Nếu ưu tiên xem phim';
    if (need.budgetLabel) return `Với ngân sách ${need.budgetLabel}`;
    return 'Chốt nhanh';
  };

  const SERIES_PAIR_CONCLUSIONS = {
    crystal_uhd__qled: 'nếu ngân sách vừa thì Crystal UHD hợp hơn; muốn màu rực, sáng hơn cho phòng khách/xem thể thao thì chọn QLED.',
    crystal_uhd__qned: 'nếu muốn tiết kiệm thì Crystal UHD hợp hơn; muốn hình ảnh nhỉnh hơn và thích LG/webOS thì QNED đáng cân nhắc.',
    nanocell__qled: 'thích màu tự nhiên, webOS và xem gia đình thì nghiêng NanoCell; thích màu nổi, phòng sáng hoặc xem bóng đá thì nghiêng QLED.',
    qled__qned: 'nên chọn theo model cụ thể, giá, bảo hành và hệ điều hành bạn thích dùng; QNED nghiêng hệ LG, QLED có nhiều lựa chọn Samsung/TCL/Hisense.',
    oled__qled: 'phòng sáng/xem bóng đá chọn QLED; xem phim/phòng tối và ngân sách cao hơn thì OLED đáng chọn hơn.',
    mini_led__oled: 'phòng sáng và HDR chọn Mini LED; phòng tối/xem phim cần độ đen sâu thì OLED hợp hơn.',
    nanocell__qned: 'tiết kiệm và xem gia đình chọn NanoCell; muốn nâng cấp độ sáng/màu/tương phản thì QNED đáng cân nhắc.',
    led__qled: 'ngân sách thấp chọn LED/UHD; muốn màu và độ sáng đẹp hơn thì QLED hợp hơn.',
    qled__uhd: 'ngân sách thấp chọn UHD/4K UHD; muốn màu và độ sáng đẹp hơn thì QLED hợp hơn.',
    bravia__qled: 'thích màu tự nhiên/phim/thể thao mượt thì nghiêng Sony BRAVIA; thích màu rực, phòng sáng và nhiều tính năng thì Samsung QLED đáng cân nhắc.',
    bravia_xr__qled: 'thích xử lý hình ảnh tự nhiên thì nghiêng Sony BRAVIA XR; thích màu rực, sáng và tính năng thông minh thì Samsung QLED hợp hơn.',
    neo_qled__oled: 'phòng sáng, HDR và thể thao nghiêng Neo QLED; xem phim/phòng tối, cần độ đen sâu thì OLED hợp hơn.',
  };

  const BRAND_PAIR_CONCLUSIONS = {
    lg__samsung: 'thích màu nổi, phòng sáng, nhiều lựa chọn thì nghiêng Samsung; thích webOS, OLED hoặc màu tự nhiên thì nghiêng LG. Ngân sách thấp/vừa nên so model và giá thực tế.',
    samsung__sony: 'muốn nhiều lựa chọn và tính năng thông minh thì Samsung dễ chọn; ưu tiên hình ảnh tự nhiên, chuyển động tốt thì Sony đáng cân nhắc hơn.',
    lg__sony: 'xem phim/OLED và thích giao diện dễ dùng thì LG hợp; ưu tiên xử lý hình ảnh tự nhiên, chuyển động thể thao thì Sony mạnh.',
    samsung__tcl: 'muốn tiết kiệm/cấu hình cao trong tầm giá thì TCL đáng xem; muốn thương hiệu, Tizen và hệ sinh thái thì Samsung hợp hơn.',
    hisense__tcl: 'hai hãng đều cạnh tranh về cấu hình; nên so trực tiếp model, giá, bảo hành và kích thước đang có.',
    tcl__xiaomi: 'ưu tiên giá mềm và app cơ bản thì Xiaomi hợp; ưu tiên hình ảnh/cấu hình như QLED/Mini LED thì TCL đáng cân nhắc.',
    samsung__toshiba: 'tiết kiệm, dễ dùng cho gia đình thì Toshiba hợp; muốn nhiều công nghệ, màu đẹp và phân khúc rộng hơn thì Samsung đáng chọn.',
  };

  const getPairKey = (a = '', b = '') => [normalizeComparisonKey(a), normalizeComparisonKey(b)].sort().join('__');
  const getOrderedPairKey = (a = '', b = '') => `${normalizeComparisonKey(a)}__${normalizeComparisonKey(b)}`;

  const buildSeriesEntityLabel = (entity = {}) => entity.contextBrand && !entity.label.toLowerCase().includes(entity.contextBrand.toLowerCase())
    ? `${entity.contextBrand} ${entity.label}`
    : entity.label;

  const getSeriesConclusion = (seriesA, seriesB, need = {}) => {
    const pairConclusion = SERIES_PAIR_CONCLUSIONS[getPairKey(seriesA.key, seriesB.key)] || SERIES_PAIR_CONCLUSIONS[getOrderedPairKey(seriesA.key, seriesB.key)];
    if (pairConclusion) return `${getNeedConclusionPrefix(need)}: ${pairConclusion}`;
    if (seriesA.profile.level === seriesB.profile.level) return `Chốt nhanh: hai dòng khá gần phân khúc, nên chọn theo model cụ thể, giá, bảo hành và hệ điều hành bạn thích dùng.`;
    const lower = seriesA.profile.level < seriesB.profile.level ? seriesA : seriesB;
    const higher = lower === seriesA ? seriesB : seriesA;
    return `Chốt nhanh: muốn tiết kiệm thì ${buildSeriesEntityLabel(lower)} dễ tiếp cận hơn; muốn nâng chất lượng hình ảnh thì ${buildSeriesEntityLabel(higher)} đáng cân nhắc hơn.`;
  };

  const shouldSuggestProductsAfterComparison = (need = {}) => Boolean(
    need.requestedSize || need.minBudget || need.maxBudget || need.targetBudget || need.type || need.roomArea || need.roomType || need.viewingDistance
  );


  const getComparisonNextStepText = (need = {}) => shouldSuggestProductsAfterComparison(need)
    ? 'AM AI sẽ lọc mẫu đang có theo ngân sách/kích thước bạn vừa đưa ạ.'
    : 'Bạn cho mình ngân sách và kích thước, AM AI sẽ lọc mẫu đang có trên web nha.';

  const appendComparisonProductSuggestions = (reply, message, need, normalizedMessage) => {
    if (!shouldSuggestProductsAfterComparison(need, normalizedMessage)) return reply;
    const recommendationReply = recommendProductsForMessage(message);
    if (recommendationReply?.products?.length) {
      return {
        ...reply,
        text: `${reply.text}\nAM AI lọc nhanh vài mẫu đang có phù hợp bên dưới ạ.`,
        actions: [callAction(), zaloAction()],
        products: recommendationReply.products,
      };
    }
    return {
      ...reply,
      text: `${reply.text}\nHiện AM AI chưa thấy mẫu phù hợp chính xác trong dữ liệu đang có. Bạn có thể nhắn Zalo hoặc gọi Anh Minh Store để kiểm tra mẫu còn hàng chính xác nhất.`,
      actions: [zaloAction(), callAction()],
      products: [],
    };
  };

  const buildSeriesComparisonReply = (seriesA, seriesB, need = {}, message = '') => {
    const labelA = buildSeriesEntityLabel(seriesA);
    const labelB = buildSeriesEntityLabel(seriesB);
    const text = [
      `Dạ, ${labelA} và ${labelB} khác nhau chủ yếu ở công nghệ hình ảnh và tầm giá ạ.`,
      `• ${labelA}: thường mạnh về ${seriesA.profile.strengths}; phù hợp ${seriesA.profile.bestFor}.`,
      `• ${labelB}: thường mạnh về ${seriesB.profile.strengths}; phù hợp ${seriesB.profile.bestFor}.`,
      `${getSeriesConclusion(seriesA, seriesB, need)} ${getComparisonNextStepText(need)}`,
    ].join('\n');
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const getBrandConclusion = (brandA, brandB, need = {}) => {
    const conclusion = BRAND_PAIR_CONCLUSIONS[getPairKey(brandA.key, brandB.key)];
    if (conclusion) return `Chốt nhanh: ${conclusion}`;
    if (need.budgetLabel) return `Chốt nhanh: với ngân sách ${need.budgetLabel}, nên chọn model nào giá tốt hơn, bảo hành rõ hơn và đúng kích thước cần dùng.`;
    return `Chốt nhanh: tuỳ ngân sách và nhu cầu, mình nên so model cụ thể; hãng nào có giá tốt hơn, bảo hành rõ hơn và đúng công nghệ cần dùng thì đáng chọn hơn.`;
  };

  const buildBrandComparisonReply = (brandA, brandB, need = {}, message = '') => {
    const text = [
      `Dạ, ${brandA.label} và ${brandB.label} đều mạnh, nhưng hợp nhu cầu hơi khác nhau ạ.`,
      `• ${brandA.label}: thường mạnh về ${brandA.profile.strengths}.`,
      `• ${brandB.label}: thường mạnh về ${brandB.profile.strengths}.`,
      `${getBrandConclusion(brandA, brandB, need)} ${getComparisonNextStepText(need)}`,
    ].join('\n');
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const buildMixedComparisonReply = (entityA, entityB, need = {}, message = '') => {
    const brand = entityA.type === 'brand' ? entityA : entityB;
    const series = entityA.type === 'series' ? entityA : entityB;
    const seriesLabel = buildSeriesEntityLabel(series);
    const text = [
      `Dạ, ${brand.label} là hãng tivi, còn ${seriesLabel} là dòng/công nghệ nên mình nên so theo nhu cầu sử dụng ạ.`,
      `• ${brand.label}: thường mạnh về ${brand.profile.strengths}.`,
      `• ${seriesLabel}: thường mạnh về ${series.profile.strengths}; phù hợp ${series.profile.bestFor}.`,
      `Chốt nhanh: nếu bạn thích hệ sinh thái/thương hiệu ${brand.label} thì chọn model ${brand.label} phù hợp ngân sách; nếu ưu tiên công nghệ ${series.label} thì so các mẫu có ${series.label} theo giá, bảo hành và kích thước.`,
    ].join('\n');
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const getDurabilityBrandGuidance = (brand = {}) => {
    const key = normalizeComparisonKey(brand.key || brand.label || '');
    const fallback = brand.profile || TV_BRAND_COMPARISON_PROFILES[key] || {};
    return DURABILITY_BRAND_GUIDANCE[key] || {
      strengths: fallback.strengths || 'có các dòng tivi phù hợp từng phân khúc',
      note: 'nên so theo model cụ thể, tình trạng máy và chính sách bảo hành',
      quick: 'hợp nếu model đó đúng nhu cầu, giá tốt và bảo hành rõ',
    };
  };

  const getDurabilitySeriesGuidance = (series = {}) => {
    const key = normalizeComparisonKey(series.key || series.label || '');
    const profile = series.profile || getSeriesComparisonProfileByLabel(series.label) || {};
    return DURABILITY_SERIES_GUIDANCE[key] || {
      strengths: profile.strengths || 'có ưu điểm riêng theo từng phân khúc',
      note: 'độ bền phụ thuộc model, tấm nền, môi trường sử dụng và bảo hành',
      quick: profile.bestFor ? `hợp ${profile.bestFor}` : 'nên chọn theo model cụ thể và bảo hành rõ',
    };
  };

  const getDurabilityTopicText = (normalizedMessage = '') => {
    if (hasAny(normalizedMessage, ['it loi', 'it hu', 'de hu'])) return 'ít lỗi';
    if (hasAny(normalizedMessage, ['tuoi tho', 'dung lau', 'on dinh'])) return 'dùng lâu/ổn định';
    return 'độ bền';
  };

  const buildDurabilityGenericReply = (need = {}, message = '') => {
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    const oldTvNote = hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung'])
      ? 'Với tivi cũ, độ bền phụ thuộc rất nhiều vào tình trạng máy thực tế, số giờ sử dụng, màn hình, main/nguồn và lịch sử sửa chữa.'
      : 'Độ bền còn phụ thuộc model, cách sử dụng, môi trường đặt tivi và chính sách bảo hành.';
    const text = [
      `Dạ nếu hỏi hãng/dòng nào bền hơn thì AM AI không nên khẳng định tuyệt đối ạ. ${oldTvNote}`,
      '• Nên ưu tiên máy đã kiểm tra kỹ, màn hình ổn, không lỗi nền/sọc/ám màu và có bảo hành rõ.',
      '• Nên so theo model cụ thể hơn là chỉ so theo hãng; cùng một hãng vẫn có dòng phổ thông và dòng cao hơn.',
      'Bạn gửi giúp AM AI 2 hãng/model đang phân vân hoặc ngân sách + kích thước, mình sẽ so kỹ và lọc mẫu đang có phù hợp hơn ạ.',
    ].join('\n');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const buildSingleDurabilityReply = (entity, need = {}, message = '') => {
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    const isSeries = entity.type === 'series';
    const label = entity.label;
    const guide = isSeries ? getDurabilitySeriesGuidance(entity) : getDurabilityBrandGuidance(entity);
    const oldTvLine = hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung'])
      ? '\nNếu mua tivi cũ, nên ưu tiên tình trạng máy thực tế, màn hình ổn và bảo hành rõ hơn là chỉ nhìn hãng/dòng ạ.'
      : '';
    const text = [
      `Dạ ${label} có nhiều model/dòng khác nhau nên AM AI không nên khẳng định bền tuyệt đối ạ.`,
      `• Điểm mạnh: ${guide.strengths}.`,
      `• Lưu ý: ${guide.note}.`,
      `Nên so theo model cụ thể, nơi bán hỗ trợ và chính sách bảo hành. Bạn gửi model hoặc ngân sách + kích thước, AM AI sẽ lọc mẫu phù hợp hơn ạ.${oldTvLine}`,
    ].join('\n');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const buildDurabilityComparisonReply = (entityA, entityB, need = {}, message = '') => {
    const normalizedMessage = normalizeVietnameseText(message || need.normalizedMessage || '');
    const topic = getDurabilityTopicText(normalizedMessage);
    const isSeriesComparison = entityA.type === 'series' && entityB.type === 'series';
    const labelA = entityA.label;
    const labelB = entityB.label;
    const guideA = isSeriesComparison ? getDurabilitySeriesGuidance(entityA) : getDurabilityBrandGuidance(entityA);
    const guideB = isSeriesComparison ? getDurabilitySeriesGuidance(entityB) : getDurabilityBrandGuidance(entityB);
    const intro = isSeriesComparison
      ? `Dạ ${labelA} và ${labelB} khác nhau về công nghệ nên không nên chốt đơn giản là cái nào bền hơn ạ.`
      : topic === 'ít lỗi'
        ? `Dạ AM AI không nên khẳng định hãng nào ít lỗi hơn tuyệt đối ạ, vì còn tuỳ model và cách sử dụng.`
        : `Dạ nếu nói về ${topic} thì mình nên so theo model cụ thể hơn là chỉ so theo hãng ạ.`;
    const oldTvLine = hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung'])
      ? '\nNếu mua tivi cũ, nên ưu tiên máy đã kiểm tra kỹ, màn hình ổn và có bảo hành rõ.'
      : '';
    const closing = isSeriesComparison
      ? `Chốt nhanh: ${guideA.quick}; ${guideB.quick}. Quan trọng nhất vẫn là chọn model phù hợp nhu cầu, môi trường dùng và có bảo hành rõ ạ.${oldTvLine}`
      : `Chốt nhanh: ${guideA.quick}; còn ${guideB.quick}. Quan trọng nhất vẫn là chọn model có bảo hành rõ, nơi bán hỗ trợ tốt và phù hợp ngân sách hơn là chỉ chọn theo hãng ạ.${oldTvLine}`;
    const text = [
      intro,
      `• ${labelA}: ${guideA.strengths}. Lưu ý: ${guideA.note}.`,
      `• ${labelB}: ${guideB.strengths}. Lưu ý: ${guideB.note}.`,
      closing,
    ].join('\n');
    return appendComparisonProductSuggestions({ text, actions: [zaloAction(), callAction()], products: [] }, message, need, normalizedMessage);
  };

  const getComparisonReply = (message = '') => {
    const normalizedMessage = normalizeVietnameseText(message);
    const entities = detectComparisonEntities(normalizedMessage);
    const need = parseTvCustomerNeed(message);
    if (!isComparisonIntent(normalizedMessage)) return null;
    if (hasDurabilityComparisonIntent(normalizedMessage)) {
      if (entities.series.length >= 2) return buildDurabilityComparisonReply(entities.series[0], entities.series[1], need, message);
      if (entities.standaloneBrands.length >= 2) return buildDurabilityComparisonReply(entities.standaloneBrands[0], entities.standaloneBrands[1], need, message);
      if (entities.brands.length >= 2 && !entities.series.length) return buildDurabilityComparisonReply(entities.brands[0], entities.brands[1], need, message);
      if (entities.all.length >= 2) return buildDurabilityComparisonReply(entities.all[0], entities.all[1], need, message);
      if (need.requestedSize || need.minBudget || need.maxBudget || need.targetBudget || need.roomArea || need.roomType || need.viewingDistance) return null;
      if (entities.series.length === 1) return buildSingleDurabilityReply(entities.series[0], need, message);
      if (entities.standaloneBrands.length === 1) return buildSingleDurabilityReply(entities.standaloneBrands[0], need, message);
      if (entities.brands.length === 1) return buildSingleDurabilityReply(entities.brands[0], need, message);
      return buildDurabilityGenericReply(need, message);
    }
    if (entities.series.length >= 2) return buildSeriesComparisonReply(entities.series[0], entities.series[1], need, message);
    if (entities.standaloneBrands.length >= 2) return buildBrandComparisonReply(entities.standaloneBrands[0], entities.standaloneBrands[1], need, message);
    if (entities.brands.length >= 2 && !entities.series.length) return buildBrandComparisonReply(entities.brands[0], entities.brands[1], need, message);
    if (entities.all.length >= 2) return buildMixedComparisonReply(entities.all[0], entities.all[1], need, message);
    return null;
  };

  const getProductSeriesHaystack = (product = {}) => [
    product.name,
    product.fullName,
    product.full_name,
    product.model,
    product.type,
    product.condition,
    product.features,
    product.featuresText,
    product.description,
    product.overview,
    product.specifications,
    product.searchableText,
  ].map((value) => {
    if (Array.isArray(value)) return value.join(' ');
    if (value && typeof value === 'object') return Object.values(value).join(' ');
    return value || '';
  }).join(' ');

  const productMatchesSeriesAliases = (product = {}, series = {}, haystack = '') => {
    const values = [series.label, ...(series.aliases || [])];
    return values.some((alias) => textHasAlias(haystack, alias));
  };

  const isSonyLedFallbackMatch = (product = {}, need = {}, haystack = '') => {
    if (normalizeVietnameseText(need.brand) !== 'sony' || normalizeVietnameseText(need.seriesLabel) !== 'led') return false;
    const sonyOptions = getSeriesOptionsForBrand('Sony');
    const hasHigherDisplayTechnology = ['OLED', 'Mini LED', 'Full Array LED'].some((label) => {
      const series = sonyOptions.find((option) => normalizeVietnameseText(option.label) === normalizeVietnameseText(label));
      return series && productMatchesSeriesAliases(product, series, haystack);
    });
    return !hasHigherDisplayTechnology;
  };

  const productMatchesSeries = (product, need) => {
    if (!need?.seriesLabel) return false;
    const haystack = getProductSeriesHaystack(product);
    const normalizedBrand = normalizeVietnameseText(need.brand);
    const normalizedNeedSeries = normalizeVietnameseText(need.seriesLabel);
    if (normalizedBrand === 'toshiba') {
      const modelSeries = detectToshibaModelSeries(product);
      if (modelSeries) return normalizeVietnameseText(modelSeries) === normalizedNeedSeries;
    }
    const series = getSeriesOptionsForBrand(need.brand).find((option) => normalizeVietnameseText(option.label) === normalizedNeedSeries);
    const aliases = need.seriesAliases?.length ? need.seriesAliases : series?.aliases || [need.seriesLabel];
    if (normalizedBrand === 'sony' && normalizedNeedSeries === 'led') {
      return isSonyLedFallbackMatch(product, need, haystack);
    }
    return [need.seriesLabel, ...aliases].some((alias) => textHasAlias(haystack, alias));
  };

  const parseBudgetFromMessage = (message, normalizedMessage) => {
    const need = {};
    const toMillion = (numberText) => Math.round(Number(String(numberText).replace(',', '.')) * 1000000);
    const rangeMatch = normalizedMessage.match(/(?:tu\s*)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi|–)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?/);
    if (rangeMatch) {
      need.minBudget = toMillion(rangeMatch[1]);
      need.maxBudget = toMillion(rangeMatch[2]);
      need.budgetLabel = `${rangeMatch[1]}–${rangeMatch[2]} triệu`;
      return need;
    }

    const belowMatch = normalizedMessage.match(/(?:duoi|khong qua|toi da|duoi muc|nho hon|be hon)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?|(?:tam|khoang)?\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?\s*(?:do lai|tro xuong|tro lai|quay dau)/);
    if (belowMatch) {
      const valueText = belowMatch[1] || belowMatch[3];
      const value = Number(valueText.replace(',', '.'));
      need.maxBudget = toMillion(valueText);
      need.isMaxBudgetStrict = true;
      need.budgetLabel = `dưới ${value} triệu`;
      return need;
    }

    const aroundMatch = normalizedMessage.match(/(?:tam|khoang|khoan|gan|tam gia|ngan sach|muc gia|budget)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (aroundMatch) {
      const value = Number(aroundMatch[1].replace(',', '.'));
      need.targetBudget = Math.round(value * 1000000);
      need.minBudget = Math.round(value * 0.85 * 1000000);
      need.maxBudget = Math.round(value * 1.135 * 1000000);
      need.budgetLabel = `tầm ${value} triệu`;
      return need;
    }

    const millionMatch = normalizedMessage.match(/\b(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (millionMatch) {
      const value = Number(millionMatch[1].replace(',', '.'));
      need.targetBudget = Math.round(value * 1000000);
      need.maxBudget = Math.round(value * 1.125 * 1000000);
      need.budgetLabel = `khoảng ${value} triệu`;
    }

    if (hasAny(normalizedMessage, ['gia re', 're', 'tiết kiệm', 'tiet kiem'])) {
      need.budgetPreference = 'cheap';
      need.budgetLabel = need.budgetLabel || 'ưu tiên giá rẻ';
      need.maxBudget = need.maxBudget || 10000000;
      need.isMaxBudgetStrict = need.isMaxBudgetStrict || !need.targetBudget;
    }
    if (hasAny(normalizedMessage, ['cao cap', 'hang xin', 'premium'])) {
      need.budgetPreference = 'premium';
      need.budgetLabel = need.budgetLabel || 'ưu tiên cao cấp';
    }
    return need;
  };

  const parseTvCustomerNeed = (message = '') => {
    const originalMessage = String(message || '');
    const normalizedMessage = normalizeVietnameseText(originalMessage);
    const need = {
      originalMessage,
      normalizedMessage,
      usage: [],
      preferences: [],
      requestedSize: null,
      recommendedRange: null,
      hasBuyingIntent: false,
      isVagueAdvice: false,
    };

    need.hasBuyingIntent = RECOMMENDATION_INTENT_KEYWORDS.some((keyword) => normalizedMessage.includes(normalizeVietnameseText(keyword)));
    const brand = TV_BRANDS.find((item) => normalizedMessage.includes(item));
    if (brand) need.brand = TV_BRAND_LABELS[brand];

    const detectedSeries = detectTvSeriesFromMessage(normalizedMessage, need.brand);
    if (detectedSeries) {
      need.series = detectedSeries.series;
      need.seriesLabel = detectedSeries.seriesLabel;
      need.seriesAliases = detectedSeries.aliases;
    }

    const areaMatch = normalizedMessage.match(/\b(\d{1,2})\s*(m2|m\s*2|met vuong|mét vuông)\b/);
    if (areaMatch) need.roomArea = Number(areaMatch[1]);
    if (hasAny(normalizedMessage, ['phong ngu'])) {
      need.roomType = 'bedroom';
      need.usage.push('bedroom');
    }
    if (hasAny(normalizedMessage, ['phong khach'])) {
      need.roomType = 'livingroom';
      need.usage.push('livingroom');
    }
    if (hasAny(normalizedMessage, ['phong nho'])) need.roomType = 'small';
    if (hasAny(normalizedMessage, ['phong rong', 'phong lon'])) need.roomType = 'large';
    need.recommendedRange = getRecommendedRangeForArea(need.roomArea, need.roomType);
    if (!need.recommendedRange && need.roomType === 'livingroom') need.recommendedRange = { min: 55, max: 65, label: '55–65 inch' };
    if (need.roomType === 'large' && !need.roomArea) need.recommendedRange = { min: 65, max: 75, label: '65–75 inch' };

    need.viewingDistance = parseViewingDistanceFromMessage(normalizedMessage);
    const distanceRange = getRecommendedRangeForDistance(need.viewingDistance);
    if (distanceRange) need.recommendedRange = distanceRange;

    const sizeMatch = normalizedMessage.match(/\b(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh|\")?\b/);
    if (sizeMatch) need.requestedSize = Number(sizeMatch[1]);

    Object.assign(need, parseBudgetFromMessage(originalMessage, normalizedMessage));

    const isNewOldChoiceQuestion = hasAny(normalizedMessage, ['tivi moi hay cu', 'tivi cu hay moi', 'mua cu hay mua moi', 'tivi cu voi tivi moi']);
    if (!isNewOldChoiceQuestion && hasAny(normalizedMessage, ['tivi moi', 'tv moi', 'hang moi', 'moi 100%', 'chinh hang'])) need.type = 'Tivi mới';
    if (!isNewOldChoiceQuestion && hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung', 'second hand'])) need.type = 'Tivi cũ';

    if (hasAny(normalizedMessage, ['xem phim', 'xem netflix', 'netflix', 'xem phim nhieu', 'mua tivi xem phim', 'giai tri gia dinh'])) need.usage.push('movies');
    if (hasAny(normalizedMessage, ['bong da', 'world cup', 'the thao', 'xem da banh', 'chuyen dong muot', 'mua tivi xem bong da'])) need.usage.push('sports');
    if (hasAny(normalizedMessage, ['choi game', 'gaming', 'game'])) need.usage.push('gaming');
    if (hasAny(normalizedMessage, ['nguoi lon tuoi', 'nguoi gia dung', 'mua cho ba me', 'mua cho bo me', 'mua cho ong ba', 'de dung', 'remote de bam'])) need.usage.push('elderly');
    if (hasAny(normalizedMessage, ['youtube', 'xem youtube', 'xem youtube thoi', 'mua cho ba me xem youtube'])) need.usage.push('youtube');
    if (hasAny(normalizedMessage, ['hoc online'])) need.usage.push('learning');
    if (hasAny(normalizedMessage, ['karaoke'])) need.usage.push('karaoke');

    ['qled', 'oled', 'mini led', '4k', 'google tv', 'android tv', 'tizen', 'webos', 'am thanh tot', 'hinh anh dep', 'tiet kiem dien', 'bao hanh lau'].forEach((preference) => {
      if (normalizedMessage.includes(preference)) need.preferences.push(preference);
    });
    if (hasAny(normalizedMessage, ['gia re', 're'])) need.usage.push('cheap');
    if (hasAny(normalizedMessage, ['cao cap'])) need.usage.push('premium');

    const meaningfulSignals = [need.brand, need.seriesLabel, need.requestedSize, need.roomArea, need.roomType, need.viewingDistance, need.minBudget, need.maxBudget, need.targetBudget, need.type, ...need.usage, ...need.preferences].filter(Boolean).length;
    const broadBuyingRequest = hasAny(normalizedMessage, [
      'tu van tivi', 'tu van chon tivi', 'chon tivi', 'tu van mua tivi', 'tu van mua tv',
      'shop tu van tivi', 'can mua tivi', 'can mua tv', 'minh can mua tivi', 'toi muon mua tivi',
      'muon mua tivi', 'mua tivi', 'mua tv',
    ]);
    need.isVagueAdvice = need.hasBuyingIntent && meaningfulSignals === 0 && broadBuyingRequest;
    return need;
  };

  const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(normalizeText(keyword)));

  const productMatchesType = (product, type) => {
    if (!type) return false;
    const haystack = normalizeVietnameseText([product.type, product.condition, product.searchableText].join(' '));
    if (type === 'Tivi mới') return /\b(tivi moi|tv moi|hang moi|moi 100|chinh hang|moi)\b/.test(haystack);
    if (type === 'Tivi cũ') return /\b(tivi cu|tv cu|da qua su dung|second hand|cu)\b/.test(haystack);
    return false;
  };

  const scoreProductForNeed = (product, need) => {
    let score = 0;
    const reasons = [];
    const haystack = product.searchableText || normalizeVietnameseText(JSON.stringify(product));
    const size = product.sizeNumber || parseSizeToNumber([product.size, product.name, product.model].join(' '));
    const price = product.priceNumber;

    if (need.brand && haystack.includes(normalizeVietnameseText(need.brand))) {
      score += 35;
      reasons.push(`đúng hãng ${need.brand}`);
    }

    if (need.seriesLabel) {
      if (productMatchesSeries(product, need)) {
        score += 35;
        reasons.push(`đúng dòng ${need.seriesLabel}`);
      } else {
        score -= 20;
      }
    }

    if (need.type) {
      if (productMatchesType(product, need.type)) {
        score += 35;
        reasons.push(`phù hợp nhu cầu ${need.type.toLowerCase()}`);
      } else if (product.type || product.condition) {
        score -= 40;
      }
    }

    if (need.requestedSize && size) {
      const diff = Math.abs(size - need.requestedSize);
      if (diff === 0) {
        score += 35;
        reasons.push(`đúng kích thước ${need.requestedSize} inch`);
      } else if (diff <= 5) {
        score += 10;
        reasons.push(`kích thước gần ${need.requestedSize} inch`);
      }
    } else if (need.recommendedRange && size) {
      if (size >= need.recommendedRange.min && size <= need.recommendedRange.max) {
        score += 25;
        reasons.push(`nằm trong gợi ý ${need.recommendedRange.label}`);
      } else if (Math.abs(size - need.recommendedRange.min) <= 5 || Math.abs(size - need.recommendedRange.max) <= 5) {
        score += 10;
        reasons.push(`kích thước gần khoảng ${need.recommendedRange.label}`);
      }
    }

    if ((need.minBudget || need.maxBudget || need.targetBudget || need.budgetPreference === 'cheap') && price) {
      const min = need.minBudget || 0;
      const max = need.maxBudget || need.targetBudget || Infinity;
      if (price >= min && price <= max) {
        score += 50;
        if (need.maxBudget) {
          reasons.push(`Giá hiện tại dưới ${Math.round(need.maxBudget / 1000000)} triệu.`);
        } else {
          reasons.push(`giá phù hợp ${need.budgetLabel || 'ngân sách'}`);
        }
      } else if (!need.isMaxBudgetStrict && Number.isFinite(max) && price > max && price <= max * 1.1) {
        score += 15;
        reasons.push('giá chỉ nhỉnh hơn ngân sách khoảng 10%');
      } else if (price < min) {
        score += 15;
        reasons.push('giá thấp hơn ngân sách dự kiến');
      } else if (Number.isFinite(max) && price > max * 1.1) {
        score -= 50;
      }
      if (need.budgetPreference === 'cheap' && price <= 10000000) score += 10;
    }

    if (need.usage.includes('movies') || need.usage.includes('sports')) {
      if (/4k|qled|oled|mini led|hdr|motion/.test(haystack)) {
        score += 10;
        reasons.push(need.usage.includes('sports') ? 'hợp xem bóng đá/thể thao' : 'hợp xem phim');
      }
    }
    if (need.usage.includes('gaming') && /120hz|144hz|game mode|allm|freesync|hdmi 2\.1|hdmi2\.1/.test(haystack)) {
      score += 10;
      reasons.push('có điểm mạnh cho chơi game');
    }
    if (need.usage.includes('bedroom') && size >= 32 && size <= 43) {
      score += 10;
      reasons.push('gọn cho phòng ngủ');
    }
    if (need.usage.includes('livingroom') && size >= 55) {
      score += 10;
      reasons.push('màn hình lớn cho phòng khách');
    }
    if (need.usage.includes('elderly') && ((size >= 43 && size <= 55) || /youtube|google tv|android tv|smart|webos|tizen/.test(haystack))) {
      score += 10;
      reasons.push('dễ dùng cho người lớn tuổi');
    }
    if (need.usage.includes('youtube') && /youtube|google tv|android tv|smart|webos|tizen/.test(haystack)) {
      score += 8;
      reasons.push('phù hợp xem YouTube');
    }
    if (need.usage.includes('cheap') && (productMatchesType(product, 'Tivi cũ') || (price && price <= 10000000))) {
      score += 10;
      reasons.push('ưu tiên tiết kiệm chi phí');
    }
    if (need.usage.includes('premium') && (/qled|oled|mini led|neo qled|sony|samsung/.test(haystack))) {
      score += 10;
      reasons.push('thiên về phân khúc cao cấp');
    }
    need.preferences.forEach((preference) => {
      if (haystack.includes(preference)) {
        score += 8;
        reasons.push(`có ${preference.toUpperCase()}`);
      }
    });
    if (need.preferences.includes('am thanh tot') && /dolby|sound|loa|am thanh/.test(haystack)) {
      score += 8;
      reasons.push('có điểm mạnh về âm thanh');
    }
    if (need.preferences.includes('hinh anh dep') && /4k|qled|oled|mini led|hdr|quantum|triluminos/.test(haystack)) {
      score += 8;
      reasons.push('hình ảnh đẹp trong tầm giá');
    }
    if (need.preferences.includes('bao hanh lau') && product.warranty) {
      score += 8;
      reasons.push('có thông tin bảo hành rõ');
    }

    if (product.isFeatured) score += 5;
    if (product.warranty) score += 5;
    if (!need.brand && !need.type && !need.requestedSize && !need.recommendedRange && !need.maxBudget && !need.usage.length && product.isFeatured) {
      score += 10;
      reasons.push('sản phẩm nổi bật trên website');
    }

    return { product, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  };

  const buildUnderstandingText = (need) => {
    const filterParts = [];
    if (need.brand) filterParts.push(need.brand);
    if (need.seriesLabel) filterParts.push(`dòng ${need.seriesLabel}`);
    if (need.requestedSize) filterParts.push(`khoảng ${need.requestedSize} inch`);
    if (need.budgetLabel) filterParts.push(`ngân sách ${need.budgetLabel}`);
    if (need.type) filterParts.push(need.type.toLowerCase());
    if (filterParts.length) return `Dạ, mình sẽ lọc theo ${filterParts.join(', ')}.`;

    const parts = [];
    if (need.roomType === 'bedroom') parts.push('phòng ngủ');
    if (need.roomType === 'livingroom') parts.push('phòng khách');
    if (need.roomArea) parts.push(`khoảng ${need.roomArea}m²`);
    if (need.recommendedRange) parts.push(`kích thước gợi ý ${need.recommendedRange.label}`);
    if (!parts.length) return 'Dạ, mình đã hiểu bạn đang cần tư vấn chọn tivi phù hợp.';
    return `Dạ, mình hiểu bạn đang tìm tivi cho ${parts.join(', ')}.`;
  };

  const buildRecommendationSummary = (need, hasStrongMatch) => {
    if (need.brand && need.seriesLabel && !need.requestedSize && !need.budgetLabel) return `Dạ, mình sẽ ưu tiên ${need.brand} ${need.seriesLabel} trong dữ liệu sản phẩm đang có.`;
    if (need.budgetLabel && !need.brand && !need.seriesLabel && !need.requestedSize && !need.recommendedRange && !need.type) return `${need.budgetLabel.charAt(0).toUpperCase()}${need.budgetLabel.slice(1)} thì hiện trên web mình có vài mẫu phù hợp. Mình gợi ý bạn xem trước các mẫu này:`;
    if (need.recommendedRange) return `Dựa trên nhu cầu này, mình gợi ý ưu tiên tivi ${need.recommendedRange.label} để xem cân đối với không gian.`;
    if (need.usage.includes('elderly')) return 'Với nhu cầu mua cho người lớn tuổi, mình ưu tiên tivi dễ dùng, chữ rõ, âm thanh nghe rõ và có YouTube/ứng dụng cơ bản.';
    if (need.seriesLabel && !need.brand) return `Mình sẽ ưu tiên dòng ${need.seriesLabel} trong dữ liệu sản phẩm đang có.`;
    if (need.requestedSize) return `Mình sẽ ưu tiên các mẫu ${need.requestedSize} inch đang có trong dữ liệu sản phẩm của Anh Minh Store.`;
    if (need.usage.includes('sports')) return 'Với nhu cầu xem bóng đá/World Cup, mình ưu tiên tivi màn hình lớn, 4K và có công nghệ chuyển động tốt.';
    if (need.usage.includes('movies')) return 'Với nhu cầu xem phim, mình ưu tiên tivi 4K, QLED/OLED/Mini LED hoặc mẫu có HDR khi dữ liệu sản phẩm có thông tin này.';
    if (need.usage.includes('cheap')) return 'Với nhu cầu giá rẻ, mình ưu tiên mẫu có giá thấp hơn hoặc tivi cũ đã kiểm tra.';
    if (!hasStrongMatch) return 'Dữ liệu hiện có chưa khớp thật mạnh, nên mình hiển thị các mẫu gần nhất để bạn tham khảo thêm.';
    return 'Trong dữ liệu hiện có trên website, các mẫu phù hợp nhất là:';
  };

  const debugChatbotRecommendations = (sourceSummary, products, need, recommendations) => {
    const ua43u8500f = products.find((product) => normalizeVietnameseText(product.model).replace(/\s+/g, '') === 'ua43u8500f');
    console.debug('[AM AI] product sources', { ...sourceSummary, UA43U8500F: ua43u8500f ? { source: ua43u8500f.source, priceNumber: ua43u8500f.priceNumber, priceText: ua43u8500f.priceText, oldPriceText: ua43u8500f.oldPriceText } : null });
    console.debug('[AM AI] normalized final products', products);
    console.debug('[AM AI] parsed need', need);
    console.debug('[AM AI] recommendations', recommendations);
  };

  const getProductRecommendationKey = (product = {}) => {
    const id = normalizeVietnameseText(product.id || '');
    const model = normalizeVietnameseText(product.model || '').replace(/\s+/g, '');
    const name = normalizeVietnameseText(product.name || product.fullName || '').replace(/\s+/g, '');
    return id || model || name;
  };

  const productMatchesExplicitNeed = (product, need = {}) => {
    const haystack = product.searchableText || normalizeVietnameseText(JSON.stringify(product));
    if (need.brand && !haystack.includes(normalizeVietnameseText(need.brand))) return false;
    if (need.seriesLabel && !productMatchesSeries(product, need)) return false;
    if (need.requestedSize) {
      const size = product.sizeNumber || parseSizeToNumber([product.size, product.name, product.model].join(' '));
      if (size !== need.requestedSize) return false;
    }
    return true;
  };

  const selectBalancedBudgetRecommendations = (scoredProducts = [], need = {}) => {
    const hasBudgetSignal = Boolean(need.maxBudget || need.targetBudget || need.budgetLabel);
    const obeysStrictBudget = (item) => !need.isMaxBudgetStrict || !need.maxBudget || (item.product.priceNumber && item.product.priceNumber <= need.maxBudget);
    const candidates = scoredProducts.filter(obeysStrictBudget);
    const selected = [];
    const selectedKeys = new Set();
    const addItem = (item) => {
      if (!item || selected.length >= 3) return false;
      const key = getProductRecommendationKey(item.product);
      if (key && selectedKeys.has(key)) return false;
      selected.push(item);
      if (key) selectedKeys.add(key);
      return true;
    };
    const addFrom = (items, limit) => {
      let added = 0;
      items.some((item) => {
        if (added >= limit || selected.length >= 3) return true;
        if (addItem(item)) added += 1;
        return false;
      });
    };

    if (need.type) {
      const preferredTypeMatches = candidates.filter((item) => productMatchesType(item.product, need.type));
      preferredTypeMatches.forEach(addItem);
      candidates.forEach(addItem);
      return selected.slice(0, 3);
    }

    if (hasBudgetSignal) {
      const newTvMatches = candidates.filter((item) => productMatchesType(item.product, 'Tivi mới'));
      const oldTvMatches = candidates.filter((item) => productMatchesType(item.product, 'Tivi cũ'));
      addFrom(newTvMatches, 2);
      addFrom(oldTvMatches, 1);
      candidates.forEach(addItem);
      return selected.slice(0, 3);
    }

    return candidates.slice(0, 3);
  };

  const recommendProductsForMessage = (message = '') => {
    const need = parseTvCustomerNeed(message);
    if (!need.hasBuyingIntent) return null;

    if (need.isVagueAdvice) {
      return {
        text: 'Dạ được ạ 😊 Bạn cho AM AI xin thêm ngân sách khoảng bao nhiêu, kích thước mong muốn và bạn muốn tivi mới hay tivi cũ để mình gợi ý sát hơn nha.',
        actions: [callAction(), zaloAction()],
        quickReplies: SMART_RECOMMENDER_QUICK_REPLIES,
        products: [],
      };
    }

    const products = getAvailableProductsForChatbot();
    const sourceSummary = summarizeProductSources(products);
    if (!products.length) {
      debugChatbotRecommendations(sourceSummary, products, need, []);
      return getNoMatchingProductsReply();
    }

    const eligibleProducts = products.filter((product) => {
      if (need.isMaxBudgetStrict && need.maxBudget && (!product.priceNumber || product.priceNumber > need.maxBudget)) return false;
      if (need.type && !productMatchesType(product, need.type)) return false;
      return true;
    });

    if (need.isMaxBudgetStrict && need.maxBudget && !eligibleProducts.length) {
      const emptyRecommendations = [];
      debugChatbotRecommendations(sourceSummary, products, need, emptyRecommendations);
      return getNoMatchingProductsReply();
    }

    const scored = eligibleProducts
      .map((product) => scoreProductForNeed(product, need))
      .sort((a, b) => b.score - a.score);
    const explicitMatches = scored.filter((item) => productMatchesExplicitNeed(item.product, need));
    const scoredMatches = (need.brand || need.seriesLabel || need.requestedSize) ? explicitMatches : scored;
    const strongMatches = scoredMatches.filter((item) => item.score >= 25);
    const positiveMatches = strongMatches.length ? strongMatches : scoredMatches.filter((item) => item.score > 0);
    const selected = selectBalancedBudgetRecommendations(positiveMatches, need);

    if (!selected.length) {
      debugChatbotRecommendations(sourceSummary, products, need, []);
      return getNoMatchingProductsReply();
    }

    const recommendedProducts = selected.map((item) => ({
      ...item.product,
      reason: item.reasons.length ? item.reasons.join(', ') : 'phù hợp nhất theo dữ liệu hiện có',
      score: item.score,
    }));
    debugChatbotRecommendations(sourceSummary, products, need, recommendedProducts);
    const intro = buildUnderstandingText(need);
    const summary = buildRecommendationSummary(need, strongMatches.length > 0);
    const budgetMixText = need.budgetLabel && !need.type && !need.brand && !need.seriesLabel && !need.requestedSize
      ? `Dạ, với ngân sách ${need.budgetLabel}, AM AI gợi ý ${recommendedProducts.length} mẫu trong tầm giá${recommendedProducts.length >= 3 ? ': ưu tiên 2 tivi mới và 1 tivi cũ để bạn dễ so sánh' : ' phù hợp nhất theo dữ liệu hiện có'}.`
      : '';
    const detailHint = strongMatches.length
      ? 'Bạn có thể bấm “Xem chi tiết” để xem hình ảnh, thông số và đặt hàng.'
      : 'Các mẫu này là lựa chọn gần nhất; nếu muốn chắc hơn, bạn có thể gọi hoặc nhắn Zalo để cửa hàng kiểm tra tồn kho và tư vấn nhanh.';

    return {
      text: budgetMixText || `${intro}\n${summary}\nTrong dữ liệu hiện có của Anh Minh Store, mình gợi ý 3 mẫu sau:\n${detailHint}`,
      actions: [callAction(), zaloAction()],
      products: recommendedProducts,
    };
  };

  const findMatchingProducts = (message = '') => {
    const normalizedMessage = normalizeText(message);
    const products = getAvailableProductsForChatbot();
    if (!normalizedMessage || !products.length) return [];

    const words = normalizedMessage.split(' ').filter((word) => word.length >= 2);
    const brandHits = TV_BRANDS.filter((brand) => normalizedMessage.includes(brand));
    const sizeHits = normalizedMessage.match(/\b\d{2}\s*(inch|in|inh|")?\b/g) || [];
    const typeHits = ['tivi moi', 'tv moi', 'hang moi', 'tivi cu', 'tv cu', 'second hand'].filter((type) => normalizedMessage.includes(type));

    const scored = products.map((product) => {
      const haystack = product.searchableText;
      const haystackCompact = haystack.replace(/\s+/g, '');
      let score = 0;
      brandHits.forEach((brand) => { if (haystack.includes(brand)) score += 5; });
      sizeHits.forEach((size) => { if (haystackCompact.includes(normalizeText(size).replace(/\s+/g, ''))) score += 3; });
      typeHits.forEach((type) => { if (haystack.includes(type)) score += 3; });
      words.forEach((word) => { if (haystack.includes(word)) score += word.length > 3 ? 1 : 0.4; });
      const normalizedModel = normalizeText(product.model).replace(/\s+/g, '');
      const normalizedMessageCompact = normalizedMessage.replace(/\s+/g, '');
      if (normalizedModel && (normalizedMessageCompact.includes(normalizedModel) || normalizedModel.includes(normalizedMessageCompact))) score += 8;
      return { product, score };
    }).filter((item) => item.score >= 3);

    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.product);
  };

  const getBrandReply = (normalizedMessage) => {
    const brandReplies = {
      samsung: 'Samsung thường mạnh về giao diện thông minh, màu sắc rực rỡ, nhiều mẫu 4K/QLED và tính năng kết nối tiện ích. Nếu bạn thích hình ảnh sáng, màu nổi và hệ sinh thái thông minh thì Samsung là lựa chọn dễ dùng.',
      lg: 'LG thường được đánh giá cao ở hệ điều hành webOS dễ dùng, màu sắc tự nhiên và nhiều lựa chọn từ LED đến OLED. Nếu bạn thích giao diện mượt và xem phim nhiều, LG là lựa chọn đáng cân nhắc.',
      sony: 'Sony thường nổi bật về xử lý hình ảnh tự nhiên, độ nét và trải nghiệm xem phim/thể thao. Nếu bạn ưu tiên chất lượng hình ảnh và âm thanh cân bằng, Sony là lựa chọn cao cấp hơn.',
    };
    const matchedBrand = TV_BRANDS.find((brand) => normalizedMessage.includes(brand));
    if (!matchedBrand) return null;
    return brandReplies[matchedBrand] || 'Thương hiệu này có nhiều mẫu tivi theo từng phân khúc. Bạn có thể lọc theo hãng trên website hoặc gửi model cụ thể để mình hỗ trợ tốt hơn.';
  };

  const formatProductText = (products) => products.map((product, index) => {
    const name = product.name || product.fullName || product.model || 'Sản phẩm tivi';
    const model = product.model ? ` – Model ${product.model}` : '';
    const price = product.priceText ? ` – Giá: ${product.priceText}` : '';
    return `${index + 1}. ${name}${model}${price}`;
  }).join('\n');

  const isMainlyGreeting = (normalizedMessage = '') => {
    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    return /^(xin chao|chao|hello|hi|alo|chao shop|shop oi|em oi|anh oi)(?:\s+(shop|am ai|anh minh|ban|nha|a|ạ))*$/.test(compactMessage);
  };

  const isMainlyThanks = (normalizedMessage = '') => {
    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    return /^(ok\s*)?(cam on|thank you|thanks|thank)(\s+(shop|ban|em|anh|am ai|nha|nhe|a|ạ))*$/.test(compactMessage);
  };

  const getConversationIntent = (normalizedMessage = '') => {
    if (!normalizedMessage) return null;
    const hasPurchaseSignal = RECOMMENDATION_INTENT_KEYWORDS.some((keyword) => normalizedMessage.includes(normalizeVietnameseText(keyword)))
      || /\b\d+(?:[.,]\d+)?\s*(trieu|tr\b|m\b)/.test(normalizedMessage);
    if (hasPurchaseSignal) return null;

    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    if (isMainlyGreeting(normalizedMessage)) {
      return {
        text: 'Dạ AM AI chào bạn 👋 Bạn đang cần mua tivi mới, tivi cũ hay muốn tư vấn theo ngân sách ạ?',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: [],
      };
    }

    if (isMainlyThanks(normalizedMessage)) {
      return {
        text: 'Dạ AM AI cảm ơn bạn ạ 😊 Khi cần xem giá, chọn tivi theo ngân sách hoặc hỏi về thu cũ đổi mới/sửa tivi, bạn cứ nhắn mình nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (/^(ok|oke|okay|tam biet|bye|goodbye)(\s+(shop|ban|em|anh|nha|nhe|a|ạ))*$/.test(compactMessage)) {
      return {
        text: 'Dạ vâng ạ. Khi cần tư vấn thêm về tivi, bạn cứ nhắn AM AI nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    return null;
  };

  const getRoomSizeProducts = (normalizedMessage = '') => {
    const need = parseTvCustomerNeed(normalizedMessage);
    const range = need.recommendedRange || getRecommendedRangeForArea(need.roomArea, need.roomType);
    if (!range) return [];
    return getAvailableProductsForChatbot()
      .filter((product) => product.sizeNumber && product.sizeNumber >= range.min && product.sizeNumber <= range.max)
      .slice(0, 3)
      .map((product) => ({ ...product, reason: `phù hợp khoảng ${range.label}` }));
  };

  const getNoMatchingProductsReply = () => ({
    text: 'Hiện AM AI chưa thấy mẫu phù hợp chính xác trong dữ liệu đang có ạ. Bạn có thể tăng/giảm ngân sách, đổi kích thước, hoặc nhắn Zalo để cửa hàng kiểm tra thêm mẫu mới về nha.',
    actions: [zaloAction(), callAction(), featuredAction()],
    products: [],
  });

  const getSupportIntentReply = (normalizedMessage = '') => {
    if (!normalizedMessage) return null;

    if (hasAny(normalizedMessage, [
      'con hang khong', 'con mau nay khong', 'mau nay con khong', 'co san khong', 'con con nay khong',
      'con 55 inch khong', 'con khong shop',
    ]) || /\bcon\s+(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh)?\s*khong\b/.test(normalizedMessage)) {
      return {
        id: 'availability',
        text: 'Dạ sản phẩm trên web là dữ liệu đang được cập nhật ạ. Để chắc chắn mẫu còn hàng tại kho, bạn gửi model hoặc bấm xem chi tiết rồi nhắn Zalo/gọi hotline để Anh Minh Store kiểm tra nhanh và chính xác nhất nha.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['tra gop', 'co tra gop khong', 'mua gop', 'gop duoc khong', 'tra truoc bao nhieu'])) {
      return {
        id: 'installment',
        text: 'Dạ Anh Minh Store có hỗ trợ tư vấn trả góp tuỳ sản phẩm và chương trình ạ. Bạn gửi mẫu tivi đang quan tâm hoặc ngân sách dự kiến, bên em sẽ kiểm tra phương án phù hợp cho mình nha.',
        actions: [zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['giao hang', 'giao tan noi', 'ship khong', 'co ship khong', 'co lap dat khong', 'treo tuong', 'lap gia treo', 'giao trong ngay khong'])) {
      return {
        id: 'delivery',
        text: 'Dạ bên em có hỗ trợ giao hàng và tư vấn lắp đặt tại Đà Nẵng ạ. Nếu cần treo tường hoặc lắp giá treo, bạn cho biết kích thước tivi và khu vực giao để cửa hàng báo hỗ trợ cụ thể nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    const viewingDistance = parseViewingDistanceFromMessage(normalizedMessage);
    if (viewingDistance || hasAny(normalizedMessage, ['khoang cach xem', 'ngoi xa bao nhieu', 'cach 2 met mua may inch', 'cach 3m nen mua bao nhieu inch', 'ngoi cach tivi 2.5m'])) {
      const range = getRecommendedRangeForDistance(viewingDistance);
      const text = range
        ? `Dạ nếu mình ngồi cách tivi khoảng ${viewingDistance}m thì nên chọn ${range.label}. Nếu có thêm ngân sách mong muốn, AM AI sẽ lọc mẫu phù hợp hơn nha.`
        : 'Dạ nếu ngồi cách tivi khoảng 1.5–2m thì nên chọn 43–50 inch. Khoảng 2–2.5m có thể chọn 50–55 inch. Khoảng 2.5–3m nên chọn 55–65 inch, còn trên 3m thì 65 inch trở lên sẽ xem đã hơn ạ.';
      return {
        id: 'viewing-distance',
        text,
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['nen mua tivi moi hay cu', 'mua tivi moi hay cu tot hon', 'nen mua tivi cu hay moi', 'mua cu hay mua moi', 'tivi cu voi tivi moi'])
      || (hasAny(normalizedMessage, ['ngan sach it']) && hasAny(normalizedMessage, ['nen mua loai nao', 'mua loai nao', 'loai nao']))) {
      return {
        id: 'new-old-choice',
        text: 'Dạ nếu mình ưu tiên yên tâm, bảo hành dài và công nghệ mới thì nên chọn tivi mới. Nếu mình muốn tiết kiệm chi phí và chấp nhận chọn kỹ tình trạng máy thì tivi cũ sẽ hợp hơn ạ. Bạn cho AM AI biết ngân sách và kích thước mong muốn, mình sẽ gợi ý sát hơn nha.',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['mua cho ba me', 'mua cho bo me', 'mua cho ong ba', 'nguoi lon tuoi dung', 'nguoi gia dung', 'remote de bam', 'xem youtube thoi', 'mua cho ba me xem youtube'])
      || (hasAny(normalizedMessage, ['de dung']) && hasAny(normalizedMessage, ['tivi', 'tv', 'remote', 'youtube', 'nguoi lon tuoi', 'nguoi gia', 'ba me', 'bo me', 'ong ba']))) {
      return {
        id: 'elderly-users',
        text: 'Dạ nếu mua cho người lớn tuổi, mình nên ưu tiên tivi dễ dùng, chữ rõ, âm thanh nghe rõ, remote dễ bấm và có YouTube/ứng dụng cơ bản. Kích thước thường nên chọn 43–55 inch tuỳ phòng để xem thoải mái mà không quá rối ạ.',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['xem bong da', 'xem world cup', 'world cup', 'xem the thao', 'chuyen dong muot', 'xem da banh', 'mua tivi xem bong da'])) {
      return {
        id: 'sports-viewing',
        text: 'Dạ nếu xem bóng đá/World Cup, mình nên ưu tiên màn hình từ 55 inch trở lên nếu phòng khách đủ rộng, độ phân giải 4K và công nghệ chuyển động tốt. Nếu ngân sách cho phép, QLED/OLED/Mini LED sẽ cho trải nghiệm hình ảnh đã hơn ạ.',
        actions: [newTvAction(), featuredAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['xem phim', 'xem netflix', 'netflix', 'xem youtube', 'xem phim nhieu', 'mua tivi xem phim', 'giai tri gia dinh'])) {
      return {
        id: 'movies-entertainment',
        text: 'Dạ nếu xem phim/Netflix nhiều, mình nên ưu tiên tivi 4K, màu sắc đẹp, độ tương phản tốt và kích thước phù hợp khoảng cách xem. Nếu ngân sách tốt hơn, QLED/OLED/Mini LED sẽ cho trải nghiệm phim ảnh nổi bật hơn ạ.',
        actions: [newTvAction(), featuredAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['doi tra', 'loi doi khong', 'mua ve loi thi sao', 'khong thich co doi duoc khong', 'doi duoc khong', 'tra hang duoc khong'])) {
      return {
        id: 'return-exchange',
        text: 'Dạ chính sách đổi trả/hỗ trợ sẽ tuỳ tình trạng sản phẩm và lỗi thực tế ạ. Nếu sản phẩm phát sinh vấn đề, bạn liên hệ Anh Minh Store sớm kèm hình ảnh/video để cửa hàng kiểm tra và hỗ trợ theo từng trường hợp cụ thể nha.',
        actions: [zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['thanh toan sao', 'chuyen khoan duoc khong', 'tra tien mat duoc khong', 'coc truoc khong', 'dat coc', 'thanh toan khi nhan hang', 'cod khong'])) {
      return {
        id: 'payment',
        text: 'Dạ về thanh toán, mình có thể liên hệ Anh Minh Store để xác nhận hình thức phù hợp như tiền mặt, chuyển khoản hoặc đặt cọc theo từng đơn hàng ạ. Cửa hàng sẽ xác nhận lại mẫu, giá, bảo hành và thời gian giao trước khi chốt đơn.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['phong 20m2', 'phong 25m2', 'phong 30m2', 'phong 40m2', 'phong ngu nen dung tivi gi', 'phong khach nen mua may inch', 'may inch la vua', 'bao nhieu inch'])
      || /\bphong\s*\d{1,2}\s*(m2|m\s*2|met vuong)\b/.test(normalizedMessage)) {
      return {
        id: 'room-size',
        text: 'Dạ nếu phòng ngủ/phòng nhỏ thì mình nên ưu tiên 32–43 inch. Phòng khoảng 20–25m² có thể chọn 43–50 inch. Phòng 30–40m² nên chọn 55–65 inch để xem đã hơn, còn phòng rộng có thể lên 65–75 inch. Bạn cho AM AI biết thêm ngân sách để mình gợi ý mẫu phù hợp hơn nha.',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: getRoomSizeProducts(normalizedMessage),
      };
    }

    if (hasAny(normalizedMessage, ['tivi cu co tot khong', 'tivi cu co on khong', 'co nen mua tivi cu khong', 'tivi qua su dung co ben khong', 'mua tivi cu so hu'])) {
      return {
        id: 'old-tv-confidence',
        text: 'Dạ tivi cũ phù hợp khi mình muốn tiết kiệm chi phí ạ. Bên em ưu tiên tư vấn máy đã kiểm tra tình trạng, thông tin bảo hành rõ theo từng sản phẩm. Khi xem tivi cũ, bạn nên kiểm tra kỹ ảnh thực tế, model, tình trạng màn hình và thời gian bảo hành trước khi chốt nha.',
        actions: [oldTvAction(), zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['tivi khong len nguon', 'mat hinh', 'co tieng khong hinh', 'mat tieng', 'man hinh soc', 'be man', 'loi man', 'den nen', 'bo nguon', 'main', 'sua tivi'])) {
      return {
        id: 'repair',
        text: 'Dạ bên em có hỗ trợ kiểm tra và sửa tivi tại Đà Nẵng ạ. Bạn gửi giúp em 3 thông tin: hãng/model tivi, kích thước màn hình và ảnh hoặc video lỗi hiện tại. Kỹ thuật bên em sẽ tư vấn hướng xử lý rõ hơn qua Zalo hoặc hotline nha.',
        actions: [zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['mua sao', 'dat hang sao', 'dat tivi', 'chot don', 'giu hang', 'giu mau nay', 'minh muon mua', 'mua ngay'])) {
      return {
        id: 'order',
        text: 'Dạ bạn có thể bấm ‘Đặt hàng ngay’ ở trang sản phẩm, nhập họ tên và số điện thoại. Anh Minh Store sẽ liên hệ xác nhận lại mẫu, giá, bảo hành và thời gian giao trước khi chốt đơn ạ.',
        actions: [callAction(), zaloAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['so dien thoai', 'hotline', 'lien he', 'goi tu van', 'tu van lai', 'cho minh so', 'dia chi', 'cua hang o dau'])) {
      return {
        id: 'contact',
        text: 'Dạ bạn có thể liên hệ Anh Minh Store qua hotline 0905111223 - 0774111223 ạ. Cơ sở 1: 100 Tiểu La, Hải Châu, Đà Nẵng. Cơ sở 2: 540B Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['dat qua', 'mac qua', 'gia cao qua', 'co giam khong', 'bot duoc khong', 'giam gia khong', 'co khuyen mai khong', 'co qua tang khong', 'gia tot hon duoc khong', 'fix gia khong'])) {
      return {
        id: 'price-objection',
        text: 'Dạ em hiểu ạ 😊 Giá bên em đi kèm kiểm tra máy kỹ, tư vấn lắp đặt rõ ràng và hỗ trợ sau bán. Tuỳ sản phẩm hoặc chương trình, Anh Minh Store có thể hỗ trợ thêm quà tặng như remote, giá treo hoặc ưu đãi lắp đặt. Bạn gửi model hoặc ngân sách mong muốn, AM AI sẽ gợi ý mẫu hợp hơn ạ.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['bao hanh', 'bao hanh bao lau', 'tivi moi bao hanh', 'san pham qua sua chua bao hanh', 'qua sua chua bao hanh may thang'])) {
      return {
        id: 'warranty',
        text: 'Dạ chính sách bảo hành bên em như sau ạ: sản phẩm tivi mới bảo hành 2 năm. Sản phẩm đã qua sửa chữa bảo hành 6 tháng. Riêng tivi cũ/đã qua sử dụng có thể tuỳ tình trạng máy và thông tin từng sản phẩm, bạn gửi model hoặc bấm xem chi tiết để AM AI hỗ trợ kiểm tra rõ hơn nha.',
        actions: [featuredAction(), zaloAction(), callAction()],
        products: [],
      };
    }

    return null;
  };

  const hasClearIntent = (message = '') => Boolean(getSupportIntentReply(normalizeText(message)));

  const hasStrongProductRecommendationIntent = (message = '') => {
    const need = parseTvCustomerNeed(message);
    const hasNumericBudget = Boolean(need.minBudget || need.targetBudget || (need.maxBudget && need.budgetPreference !== 'cheap'));
    const hasSpecificProductFilter = Boolean(need.brand || need.seriesLabel || need.type || hasNumericBudget);
    return Boolean(hasSpecificProductFilter || (need.requestedSize && hasNumericBudget) || need.roomArea || need.roomType || (need.viewingDistance && hasNumericBudget));
  };

  const getBotReply = (message) => {
    const normalizedMessage = normalizeText(message);
    const earlyConversationReply = (isMainlyGreeting(normalizedMessage) || isMainlyThanks(normalizedMessage)) ? getConversationIntent(normalizedMessage) : null;
    if (earlyConversationReply) return earlyConversationReply;

    const supportIntentReply = getSupportIntentReply(normalizedMessage);
    const strongProductIntent = hasStrongProductRecommendationIntent(message);

    const hasExplicitBudgetSignal = /(?:duoi|khong qua|toi da|tam|khoang|ngan sach|muc gia)\s*\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s*(trieu|tr\b)\b/.test(normalizedMessage);
    if (supportIntentReply && (supportIntentReply.id === 'room-size' || (supportIntentReply.id === 'viewing-distance' && !hasExplicitBudgetSignal) || !strongProductIntent)) return supportIntentReply;

    const comparisonReply = getComparisonReply(message);
    if (comparisonReply) return comparisonReply;

    const recommendationReply = recommendProductsForMessage(message);
    if (recommendationReply) {
      if (supportIntentReply?.id === 'availability' && recommendationReply.products?.length) {
        return {
          ...recommendationReply,
          text: `${recommendationReply.text}
Dạ để chắc chắn mẫu còn hàng tại kho, bạn bấm xem chi tiết rồi nhắn Zalo/gọi hotline để Anh Minh Store kiểm tra nhanh nha.`,
          actions: [featuredAction(), zaloAction(), callAction()],
        };
      }
      if (hasDurabilityIntent(normalizedMessage)) {
        return {
          ...recommendationReply,
          text: `${recommendationReply.text}

Lưu ý thêm về độ bền: nên chọn model có bảo hành rõ, kiểm tra tình trạng máy kỹ (đặc biệt với tivi cũ) và dùng đúng môi trường; AM AI không khẳng định hãng/dòng nào bền tuyệt đối ạ.`,
        };
      }
      return recommendationReply;
    }

    const conversationReply = getConversationIntent(normalizedMessage);
    if (conversationReply) return conversationReply;
    if (supportIntentReply) return supportIntentReply;

    const isPriceObjection = hasAny(normalizedMessage, [
      'đắt quá',
      'mắc quá',
      'giá cao quá',
      'có giảm không',
      'bớt được không',
      'giảm giá không',
      'có khuyến mãi không',
      'có quà tặng không',
      'giá tốt hơn được không',
    ]);
    if (isPriceObjection) {
      return {
        text: 'Dạ em hiểu ạ 😊 Giá bên em đi kèm kiểm tra máy kỹ, tư vấn lắp đặt rõ ràng và hỗ trợ sau bán. Tuỳ sản phẩm/chương trình, Anh Minh Store có thể hỗ trợ thêm quà tặng như remote, giá treo hoặc ưu đãi lắp đặt. Bạn gửi model hoặc ngân sách mong muốn, AM AI sẽ gợi ý mẫu hợp hơn ạ.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    const matchedProducts = findMatchingProducts(message);
    const likelyProductSearch = /\d{2}|qled|oled|mini led|4k|smart|model|gia|inch|inh|ua|qa|kd|tcl|sony|samsung|lg/i.test(message);

    if (matchedProducts.length && likelyProductSearch) {
      return {
        text: `Mình tìm thấy vài sản phẩm phù hợp:\n\n${formatProductText(matchedProducts)}\n\nBạn có thể bấm xem chi tiết để kiểm tra hình ảnh, bảo hành và đặt hàng.`,
        actions: [featuredAction(), zaloAction()],
        products: matchedProducts.map((product) => ({ ...product, reason: 'khớp với từ khóa bạn vừa hỏi' })),
      };
    }

    if (hasAny(normalizedMessage, ['tivi mới', 'tv mới', 'hàng mới', 'chính hãng', 'mới 100%'])) {
      return { text: 'Dạ, Anh Minh Store có các mẫu tivi mới chính hãng. Bạn có thể xem mục Tivi mới để lọc theo hãng, kích thước và giá. Nếu cần tư vấn nhanh, bạn có thể gửi ngân sách và kích thước mong muốn.', actions: [newTvAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['tivi cũ', 'tv cũ', 'đã qua sử dụng', 'second hand'])) {
      return { text: 'Dạ, Anh Minh Store có tivi cũ đã qua sử dụng, phù hợp nếu bạn muốn tiết kiệm chi phí. Mỗi sản phẩm sẽ có thông tin tình trạng và bảo hành riêng. Bạn nên xem kỹ ảnh, model và bảo hành trước khi đặt.', actions: [oldTvAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['thu cũ đổi mới', 'thu cũ', 'đổi tivi', 'đổi mới', 'bán tivi cũ', 'thu mua tivi cũ'])) {
      return { text: 'Dạ có. Anh Minh Store hỗ trợ thu cũ đổi mới. Bạn có thể gửi hình ảnh tivi, model, kích thước, tình trạng máy và lỗi nếu có qua Zalo để được báo giá nhanh hơn.', actions: [zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['sửa tivi', 'sửa tv', 'tivi hỏng', 'không lên nguồn', 'mất hình', 'mất tiếng', 'màn hình sọc', 'bể màn', 'lỗi màn', 'đèn nền', 'main', 'bo nguồn'])) {
      return { text: 'Dạ, Anh Minh Store có hỗ trợ sửa tivi tại Đà Nẵng. Bạn có thể mô tả lỗi, gửi ảnh hoặc video tình trạng tivi qua Zalo để kỹ thuật viên tư vấn và báo hướng xử lý trước.', actions: [zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['bảo hành', 'bảo hành bao lâu', 'sp mới bảo hành mấy năm', 'tivi mới bảo hành', 'sản phẩm qua sửa chữa bảo hành', 'qua sửa chữa bảo hành mấy tháng', 'đã sửa bảo hành bao lâu', 'đổi trả', 'lỗi', 'hậu mãi'])) {
      return { text: 'Dạ chính sách bảo hành bên em như sau ạ: sản phẩm tivi mới bảo hành 2 năm. Sản phẩm đã qua sửa chữa bảo hành 6 tháng. Riêng tivi cũ/đã qua sử dụng có thể tuỳ tình trạng máy và thông tin từng sản phẩm, bạn gửi model hoặc bấm xem chi tiết để AM AI hỗ trợ kiểm tra rõ hơn nha.', actions: [featuredAction(), zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['đặt hàng', 'mua', 'mua ngay', 'còn hàng', 'chốt đơn', 'giao hàng', 'ship', 'đặt tivi'])) {
      return { text: 'Bạn có thể bấm nút “Đặt hàng ngay” trong trang sản phẩm, điền họ tên và số điện thoại. Anh Minh Store sẽ liên hệ xác nhận thông tin trước khi sản phẩm được giao.', actions: [callAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['địa chỉ', 'ở đâu', 'hotline', 'số điện thoại', 'liên hệ', 'cửa hàng', 'giờ làm', 'đà nẵng'])) {
      return { text: 'Bạn có thể liên hệ Anh Minh Store qua hotline 0905111223 - 0774111223. Cơ sở 1: 100 Tiểu La, Hải Châu, Đà Nẵng. Cơ sở 2: 540B Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng.', actions: [callAction(), zaloAction()], products: [] };
    }

    const brandReply = getBrandReply(normalizedMessage);
    if (brandReply) return { text: brandReply, actions: [featuredAction(), zaloAction()], products: [] };

    if (hasAny(normalizedMessage, ['tư vấn', 'chọn tivi', 'phòng ngủ', 'phòng khách', 'diện tích', 'mấy inch', 'bao nhiêu inch', '20m2', '25m2', '30m2', '40m2', 'giá rẻ', 'dưới 10 triệu', 'dưới 15 triệu', 'cao cấp'])) {
      return { text: 'Nếu bạn dùng cho phòng ngủ nhỏ, mình gợi ý 32–43 inch. Phòng khách khoảng 20–25m² nên chọn 43–50 inch. Phòng 30–40m² nên chọn 55–65 inch để xem đã hơn; phòng khách rộng có thể chọn từ 65 inch trở lên. Nếu hay xem phim/thể thao, bạn nên ưu tiên 4K, QLED/OLED/mini LED khi ngân sách cho phép. Bạn có thể cho mình biết ngân sách và diện tích phòng để mình gợi ý sát hơn nha.', actions: [newTvAction(), oldTvAction(), featuredAction()], products: [] };
    }

    if (likelyProductSearch && !matchedProducts.length) {
      return getNoMatchingProductsReply();
    }

    return { text: 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về tivi mới, tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành, giá sản phẩm hoặc địa chỉ cửa hàng nha.', actions: [newTvAction(), oldTvAction(), callAction(), zaloAction()], products: [] };
  };

  const saveChatHistory = () => {
    const safeHistory = chatHistory.slice(-MAX_HISTORY).map((item) => ({
      role: item.role,
      content: item.content,
      actions: item.actions || [],
      quickReplies: item.quickReplies || [],
    }));
    safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
    safeLocalStorage.set(HISTORY_KEY, JSON.stringify(safeHistory));
  };

  const loadChatHistory = () => {
    if (safeLocalStorage.get(HISTORY_VERSION_KEY) !== AM_CHATBOT_HISTORY_VERSION) {
      safeLocalStorage.remove(HISTORY_KEY);
      safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
      return [];
    }
    const raw = safeLocalStorage.get(HISTORY_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch (error) {
      return [];
    }
  };

  const scrollChatToBottom = () => {
    if (!elements.body) return;
    elements.body.scrollTop = elements.body.scrollHeight;
  };

  const renderActions = (actions = []) => {
    if (!actions.length) return '';
    return `<div class="am-chatbot-actions">${actions.map((action) => {
      const isZaloAction = action.zaloChoice || normalizeText(action.label).includes('zalo');
      return `<a class="am-chatbot-action-btn${action.primary ? ' am-chatbot-action-btn--primary' : ''}" href="${escapeHtml(action.href)}"${isZaloAction ? ' data-zalo-choice' : ''}>${escapeHtml(action.label)}</a>`;
    }).join('')}</div>`;
  };

  const renderQuickReplyButtons = (quickReplies = []) => {
    if (!quickReplies.length) return '';
    return `<div class="am-chatbot-quick-replies am-chatbot-quick-replies--inline">${quickReplies.map((reply) => `<button class="am-chatbot-quick-btn" type="button" data-chatbot-quick="${escapeHtml(reply)}">${escapeHtml(reply)}</button>`).join('')}</div>`;
  };

  const renderProductSuggestionCards = (products = []) => {
    if (!products.length) return '';
    return `<div class="am-chatbot-product-list">${products.map((product) => {
      const name = product.name || product.fullName || product.model || 'Sản phẩm tivi';
      const meta = [product.model, product.size].filter(Boolean).join(' • ');
      const reason = product.reason || 'Phù hợp với nhu cầu bạn vừa hỏi.';
      const href = product.detailUrl || product.href || createProductDetailUrl(product);
      const image = product.image || '';
      const imageHtml = image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
        : '<span class="am-chatbot-product-placeholder" aria-hidden="true">TV</span>';
      const detailButton = href ? `<a class="am-chatbot-product-detail" href="${escapeHtml(href)}">Xem chi tiết</a>` : '';
      const oldPrice = product.oldPriceText || product.oldPrice || product.old_price || '';
      const oldPriceHtml = oldPrice ? `<span class="am-chatbot-product-old-price">Giá cũ: ${escapeHtml(oldPrice)}</span>` : '';
      return `<article class="am-chatbot-product-card"><div class="am-chatbot-product-thumb">${imageHtml}</div><div class="am-chatbot-product-info"><strong>${escapeHtml(name)}</strong><span class="am-chatbot-product-meta">${escapeHtml(meta || 'Sản phẩm tivi')}</span><span class="am-chatbot-product-price">${escapeHtml(product.priceText || product.price || 'Giá đang cập nhật')}</span>${oldPriceHtml}<p>${escapeHtml(reason)}</p>${detailButton}</div></article>`;
    }).join('')}</div>`;
  };

  const renderProducts = renderProductSuggestionCards;

  const appendMessage = (role, content, actions = [], products = [], shouldSave = true, quickReplies = []) => {
    if (!elements.body) return;
    const messageEl = document.createElement('div');
    messageEl.className = `am-chatbot-message ${role}`;
    messageEl.innerHTML = `<div class="am-chatbot-bubble">${escapeHtml(content)}${role === 'bot' ? renderActions(actions) + renderProducts(products) + renderQuickReplyButtons(quickReplies) : ''}</div>`;
    elements.body.appendChild(messageEl);

    if (shouldSave) {
      chatHistory.push({ role, content, actions, quickReplies });
      chatHistory = chatHistory.slice(-MAX_HISTORY);
      saveChatHistory();
    }
    scrollChatToBottom();
  };

  const renderQuickReplies = () => {
    if (!elements.body || hasRenderedQuickReplies) return;
    const quickWrap = document.createElement('div');
    quickWrap.className = 'am-chatbot-quick-replies';
    quickWrap.innerHTML = QUICK_REPLIES.map((reply) => `<button class="am-chatbot-quick-btn" type="button" data-chatbot-quick="${escapeHtml(reply)}">${escapeHtml(reply)}</button>`).join('');
    elements.body.appendChild(quickWrap);
    hasRenderedQuickReplies = true;
    scrollChatToBottom();
  };

  const showTypingIndicator = () => {
    const typing = document.createElement('div');
    typing.className = 'am-chatbot-message bot am-chatbot-typing-wrap';
    typing.innerHTML = '<div class="am-chatbot-bubble am-chatbot-typing">AM AI đang trả lời...</div>';
    elements.body.appendChild(typing);
    scrollChatToBottom();
    return typing;
  };

  const handleUserMessage = (message) => {
    const trimmed = String(message || '').trim();
    if (!trimmed) return;
    appendMessage('user', trimmed);
    const typing = showTypingIndicator();
    window.setTimeout(() => {
      typing.remove();
      const reply = getBotReply(trimmed);
      appendMessage('bot', reply.text, reply.actions, reply.products, true, reply.quickReplies || []);
    }, 400 + Math.floor(Math.random() * 300));
  };

  const openChatbot = () => {
    elements.window?.classList.add('open');
    elements.button?.classList.add('is-open');
    elements.button?.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => elements.input?.focus(), 120);
  };

  const closeChatbot = () => {
    elements.window?.classList.remove('open');
    elements.button?.classList.remove('is-open');
    elements.button?.setAttribute('aria-expanded', 'false');
  };

  const toggleChatbot = () => {
    if (elements.window?.classList.contains('open')) closeChatbot();
    else openChatbot();
  };

  const resetChatbotConversation = (welcomeText = WELCOME_MESSAGE) => {
    chatHistory = [];
    hasRenderedQuickReplies = false;
    safeLocalStorage.remove(HISTORY_KEY);
    safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
    elements.body.innerHTML = '';
    appendMessage('bot', welcomeText);
    renderQuickReplies();
  };

  const clearChatHistory = () => {
    resetChatbotConversation(WELCOME_MESSAGE);
  };

  const startChatbotConversation = () => {
    resetChatbotConversation(START_MESSAGE);
  };

  const injectChatbot = () => {
    if (document.getElementById(CHATBOT_ID)) return;
    const root = document.createElement('div');
    root.id = CHATBOT_ID;
    root.className = 'am-chatbot-root';
    root.innerHTML = `
      <section class="am-chatbot-window" aria-label="AM AI - Trợ lý tư vấn" aria-live="polite">
        <header class="am-chatbot-header">
          <span class="am-chatbot-avatar-frame am-chatbot-avatar-frame--small"><img class="am-chatbot-avatar" src="${AVATAR_SRC}" alt="AM AI" loading="lazy" decoding="async"></span>
          <span class="am-chatbot-title-wrap"><strong class="am-chatbot-title">AM AI</strong><span class="am-chatbot-subtitle">Trợ lý tư vấn của Anh Minh Store</span><span class="am-chatbot-header-status">Đang hỗ trợ</span></span>
          <button class="am-chatbot-close" type="button" aria-label="Đóng chatbot">×</button>
        </header>
        <div class="am-chatbot-body" role="log" aria-live="polite"></div>
        <footer class="am-chatbot-footer">
          <div class="am-chatbot-footer-actions">
            <button class="am-chatbot-clear" type="button">Xoá hội thoại</button>
            <button class="am-chatbot-start" type="button">Bắt đầu</button>
          </div>
          <form class="am-chatbot-form">
            <input class="am-chatbot-input" type="text" placeholder="Nhập câu hỏi của bạn..." aria-label="Nhập câu hỏi cho AM AI" autocomplete="off">
            <button class="am-chatbot-send" type="submit">Gửi</button>
          </form>
          <p class="am-chatbot-note">AM AI trả lời tự động. Với thông tin chính xác nhất, vui lòng gọi hoặc nhắn Zalo cho cửa hàng.</p>
        </footer>
      </section>
      <div class="am-chatbot-button-wrap">
        <span class="am-chatbot-label">Hỏi AM AI</span>
        <button class="am-chatbot-button" type="button" aria-label="Mở AM AI" aria-expanded="false">
          <span class="am-chatbot-avatar-frame"><img class="am-chatbot-avatar" src="${AVATAR_SRC}" alt="Mascot AM AI" loading="lazy" decoding="async"><span class="am-chatbot-status-dot" aria-hidden="true"></span></span>
        </button>
      </div>`;
    document.body.appendChild(root);
  };

  const bindEvents = () => {
    elements.button.addEventListener('click', toggleChatbot);
    elements.close.addEventListener('click', closeChatbot);
    elements.clear.addEventListener('click', clearChatHistory);
    elements.start.addEventListener('click', startChatbotConversation);
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = elements.input.value.trim();
      if (!value) return;
      elements.input.value = '';
      handleUserMessage(value);
    });
    elements.body.addEventListener('click', (event) => {
      const quickButton = event.target.closest('[data-chatbot-quick]');
      if (quickButton) handleUserMessage(quickButton.dataset.chatbotQuick);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeChatbot();
    });
  };

  const initAnhMinhChatbot = () => {
    injectChatbot();
    const root = document.getElementById(CHATBOT_ID);
    elements = {
      root,
      window: root.querySelector('.am-chatbot-window'),
      button: root.querySelector('.am-chatbot-button'),
      close: root.querySelector('.am-chatbot-close'),
      body: root.querySelector('.am-chatbot-body'),
      form: root.querySelector('.am-chatbot-form'),
      input: root.querySelector('.am-chatbot-input'),
      clear: root.querySelector('.am-chatbot-clear'),
      start: root.querySelector('.am-chatbot-start'),
    };

    chatHistory = loadChatHistory();
    if (chatHistory.length) {
      chatHistory.forEach((item) => appendMessage(item.role, item.content, item.actions, item.products, false, item.quickReplies || []));
    } else {
      appendMessage('bot', WELCOME_MESSAGE);
      renderQuickReplies();
    }
    bindEvents();
  };

  window.initAnhMinhChatbot = initAnhMinhChatbot;
  window.getBotReply = getBotReply;
  window.findMatchingProducts = findMatchingProducts;
  window.normalizeText = normalizeText;
  window.normalizeVietnameseText = normalizeVietnameseText;
  window.parseVietnamesePriceToNumber = parseVietnamesePriceToNumber;
  window.parseSizeToNumber = parseSizeToNumber;
  window.normalizeProductForChatbot = normalizeProductForChatbot;
  window.getAvailableProductsForChatbot = getAvailableProductsForChatbot;
  window.detectTvSeriesFromMessage = detectTvSeriesFromMessage;
  window.isComparisonIntent = isComparisonIntent;
  window.hasDurabilityIntent = hasDurabilityIntent;
  window.hasDurabilityComparisonIntent = hasDurabilityComparisonIntent;
  window.buildDurabilityComparisonReply = buildDurabilityComparisonReply;
  window.detectComparedBrands = detectComparedBrands;
  window.detectComparedSeries = detectComparedSeries;
  window.detectComparisonEntities = detectComparisonEntities;
  window.getComparisonReply = getComparisonReply;
  window.parseTvCustomerNeed = parseTvCustomerNeed;
  window.scoreProductForNeed = scoreProductForNeed;
  window.recommendProductsForMessage = recommendProductsForMessage;
  window.renderProductSuggestionCards = renderProductSuggestionCards;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnhMinhChatbot, { once: true });
  } else {
    initAnhMinhChatbot();
  }
})();
