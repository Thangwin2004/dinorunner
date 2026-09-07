const STORAGE_KEY = "winkgames:bo-lac-thiet-cuoc:language";
const SUPPORTED_LANGUAGES = Object.freeze(["en", "vi"]);

const messages = {
  en: {
    "game.title": "PEANUT\nDINO RUNNER",
    "game.documentTitle": "Peanut Tribe Dino Runner",
    "loading.progress": "LOADING {progress}%",

    "menu.play": "PLAY NOW",
    "menu.highScore": "BEST: {score}",
    "menu.instructions": "HOW TO PLAY",
    "menu.leaderboard": "LEADERBOARD",
    "menu.settings": "SETTINGS",
    "menu.charSelect": "CHARACTERS",
    "menu.member": "Member",
    "menu.guest": "Guest",

    "hud.score": "SCORE: {score}",
    "hud.best": "BEST: {score}",
    "hud.distance": "{dist}m",
    "hud.coins": "{coins}",
    "hud.speed": "SPEED: {speed}",

    "settings.title": "SETTINGS",
    "settings.music": "MUSIC",
    "settings.sfx": "SOUND FX",
    "settings.language": "LANGUAGE",
    "settings.resetBest": "RESET RECORD",
    "settings.version": "Version: 1.0.0",
    "settings.english": "English",
    "settings.vietnamese": "Tiếng Việt",

    "pause.title": "PAUSED",
    "pause.resume": "Resume",
    "pause.replay": "Replay",
    "pause.home": "Home",

    "instructions.title": "HOW TO PLAY",
    "instructions.jumpTitle": "JUMP",
    "instructions.jumpDesc":
      "Tap the left side or Up Arrow to jump over rocks and spikes.",
    "instructions.slideTitle": "SLIDE",
    "instructions.slideDesc":
      "Tap the right side or Down Arrow to slide under flying enemies.",
    "instructions.collectTitle": "COLLECT",
    "instructions.collectDesc":
      "Gather coins and snacks to boost your score multiplier.",
    "instructions.dodgeTitle": "SURVIVE",
    "instructions.dodgeDesc": "Avoid all hazards to run as far as you can!",

    "charSelect.title": "CHARACTERS",
    "charSelect.select": "SELECT",
    "charSelect.selected": "EQUIPPED",
    "charSelect.pet": "Sunny Pup",
    "charSelect.ninja": "Shadow Ninja",
    "charSelect.dino": "Baby Dino",

    "revive.title": "CONTINUE?",
    "revive.yes": "YES",
    "revive.prompt": "Watch an ad to revive and keep running!",
    "revive.skip": "No, thanks",

    "gameover.title": "GAME OVER",
    "gameover.score": "SCORE: {score}",
    "gameover.best": "BEST: {score}",
    "gameover.distance": "DISTANCE: {dist}m",
    "gameover.coins": "COINS: {coins}",
    "gameover.newRecord": "NEW RECORD! 🎉",
    "gameover.doubleScore": "Double Score (x2)",
    "gameover.tryAgain": "Better luck on your next run!",

    "instructions.gotIt": "I GOT IT",
    "instructions.tire": "Tire",
    "instructions.fence": "Fence",
    "instructions.table": "Plastic Table",
    "instructions.scarecrow": "Scarecrow",
    "instructions.slipper": "Honeycomb Slipper",
    "instructions.chair": "Flying Chair",
    "instructions.banhChung": "Chung Cake",
    "instructions.banhMi": "Baguette",
    "instructions.drink": "Soft Drink",
    "instructions.shield": "Invincible Shield",
    "instructions.tagJump": "Jump",
    "instructions.tagDuck": "Duck",
    "instructions.tagBonus": "+Points",
    "instructions.tagShield": "2 sec",

    "leaderboard.title": "LEADERBOARD",
    "leaderboard.rankHeader": "RANK",
    "leaderboard.playerHeader": "PLAYER",
    "leaderboard.scoreHeader": "SCORE",
    "leaderboard.empty":
      "No rankings yet.<br/>Play now and set the first record! 🚀",
    "leaderboard.defaultMember": "Player",
    "leaderboard.defaultMemberNumber": "Player #{rank}",
    "leaderboard.youGuest": "You (Guest)",
    "leaderboard.accountSignedIn": "Account: {name} (Signed in)",
    "leaderboard.memberSignedIn": "Account: Member (Signed in)",
    "leaderboard.signInToSave": "Sign in to Wink to save your score",
    "leaderboard.offline": "Offline (using device data)",
    "leaderboard.rank": "Rank: #{rank}",
    "leaderboard.noRank": "Rank: —",
    "leaderboard.score": "Score: {score}",

    "actions.home": "Home",
    "actions.replay": "Replay",
    "actions.continue": "Continue",
    "actions.confirm": "Confirm",
    "actions.cancel": "Cancel",
    "actions.skip": "No, thanks",
  },
  vi: {
    "game.title": "BƠ LẠC\nTHIẾT CƯỚC",
    "game.documentTitle": "Bơ Lạc Thiết Cước - Dino Runner",
    "loading.progress": "ĐANG TẢI {progress}%",

    "menu.play": "CHƠI NGAY",
    "menu.highScore": "KỶ LỤC: {score}",
    "menu.instructions": "HƯỚNG DẪN",
    "menu.leaderboard": "XẾP HẠNG",
    "menu.settings": "CÀI ĐẶT",
    "menu.charSelect": "NHÂN VẬT",
    "menu.member": "Thành viên",
    "menu.guest": "Khách",

    "hud.score": "ĐIỂM: {score}",
    "hud.best": "CAO NHẤT: {score}",
    "hud.distance": "{dist}m",
    "hud.coins": "{coins}",
    "hud.speed": "TỐC ĐỘ: {speed}",

    "settings.title": "CÀI ĐẶT",
    "settings.music": "ÂM NHẠC",
    "settings.sfx": "HIỆU ỨNG",
    "settings.language": "NGÔN NGỮ",
    "settings.resetBest": "ĐẶT LẠI KỶ LỤC",
    "settings.version": "Phiên bản: 1.0.0",
    "settings.english": "English",
    "settings.vietnamese": "Tiếng Việt",

    "pause.title": "TẠM DỪNG",
    "pause.resume": "Tiếp tục",
    "pause.replay": "Chơi lại",
    "pause.home": "Trang chính",

    "instructions.title": "HƯỚNG DẪN",
    "instructions.jumpTitle": "NHẢY",
    "instructions.jumpDesc":
      "Chạm nửa trái màn hình hoặc Phím Mũi Tên Lên để nhảy qua chướng ngại vật.",
    "instructions.slideTitle": "TRƯỢT",
    "instructions.slideDesc":
      "Chạm nửa phải màn hình hoặc Phím Mũi Tên Xuống để trượt né quái bay.",
    "instructions.collectTitle": "THU THẬP",
    "instructions.collectDesc":
      "Thu thập tiền vàng và đồ ăn để tăng hệ số nhân điểm.",
    "instructions.dodgeTitle": "SINH TỒN",
    "instructions.dodgeDesc":
      "Né tránh toàn bộ cạm bẫy để chạy xa nhất có thể!",

    "charSelect.title": "CHỌN NHÂN VẬT",
    "charSelect.select": "CHỌN",
    "charSelect.selected": "ĐANG DÙNG",
    "charSelect.pet": "Cún Cam Năng Động",
    "charSelect.ninja": "Ninja Bóng Đêm",
    "charSelect.dino": "Khủng Long Con",

    "revive.title": "HỒI SINH?",
    "revive.yes": "CÓ",
    "revive.prompt": "Xem quảng cáo để tiếp tục lượt chạy!",
    "revive.skip": "Không, cảm ơn",

    "gameover.title": "KẾT THÚC",
    "gameover.score": "ĐIỂM: {score}",
    "gameover.best": "CAO NHẤT: {score}",
    "gameover.distance": "QUÃNG ĐƯỜNG: {dist}m",
    "gameover.coins": "TIỀN VÀNG: {coins}",
    "gameover.newRecord": "KỶ LỤC MỚI! 🎉",
    "gameover.doubleScore": "Nhân đôi điểm (x2)",
    "gameover.tryAgain": "Cố gắng hơn ở lượt chạy kế tiếp nhé!",

    "instructions.gotIt": "ĐÃ HIỂU",
    "instructions.tire": "Lốp xe",
    "instructions.fence": "Hàng rào",
    "instructions.table": "Bàn nhựa",
    "instructions.scarecrow": "Bù nhìn",
    "instructions.slipper": "Dép tổ ong",
    "instructions.chair": "Ghế đỏ bay",
    "instructions.banhChung": "Bánh Chưng",
    "instructions.banhMi": "Bánh Mì",
    "instructions.drink": "Nước Ngọt",
    "instructions.shield": "Khiên Bất Tử",
    "instructions.tagJump": "Nhảy né",
    "instructions.tagDuck": "Cúi né",
    "instructions.tagBonus": "+Điểm",
    "instructions.tagShield": "2 giây",

    "leaderboard.title": "BẢNG VÀNG",
    "leaderboard.rankHeader": "HẠNG",
    "leaderboard.playerHeader": "THÀNH VIÊN",
    "leaderboard.scoreHeader": "ĐIỂM SỐ",
    "leaderboard.empty":
      "Chưa có thành tích nào.<br/>Hãy chạy ngay để thiết lập kỷ lục nhé! 🚀",
    "leaderboard.defaultMember": "Thành viên",
    "leaderboard.defaultMemberNumber": "Thành viên #{rank}",
    "leaderboard.youGuest": "Bạn (Khách)",
    "leaderboard.accountSignedIn": "Tài khoản: {name} (Đã đăng nhập)",
    "leaderboard.memberSignedIn": "Tài khoản: Thành viên (Đã đăng nhập)",
    "leaderboard.signInToSave": "Đăng nhập Wink để lưu thành tích",
    "leaderboard.offline": "Ngoại tuyến (dữ liệu thiết bị)",
    "leaderboard.rank": "Hạng: #{rank}",
    "leaderboard.noRank": "Hạng: —",
    "leaderboard.score": "Điểm: {score}",

    "actions.home": "Về trang chính",
    "actions.replay": "Chơi lại",
    "actions.continue": "Tiếp tục",
    "actions.confirm": "Đồng ý",
    "actions.cancel": "Hủy",
    "actions.skip": "Không, cảm ơn",
  },
};

function normalizeLanguage(value) {
  if (typeof value !== "string") return null;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : null;
}

function readStoredLanguage() {
  try {
    return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function readUrlLanguage() {
  try {
    const params = new window.URLSearchParams(window.location.search);
    return normalizeLanguage(
      params.get("locale") || params.get("lang") || params.get("language"),
    );
  } catch {
    return null;
  }
}

function readBrowserLanguage() {
  const candidates = [
    ...(globalThis.navigator?.languages || []),
    globalThis.navigator?.language,
  ];
  return candidates.map(normalizeLanguage).find(Boolean) || "en";
}

function readWinkLanguage(state) {
  return normalizeLanguage(
    state?.locale ||
      state?.language ||
      state?.preferences?.language ||
      state?.preferences?.locale,
  );
}

class I18nManager {
  constructor() {
    this.hasLocalOverride = Boolean(readStoredLanguage());
    this.language =
      readStoredLanguage() ||
      readUrlLanguage() ||
      readBrowserLanguage() ||
      "en";
    this.listeners = new Set();
    this.applyDocumentLanguage();
  }

  get currentLanguage() {
    return this.language;
  }

  applyDocumentLanguage() {
    if (globalThis.document?.documentElement) {
      document.documentElement.lang = this.language;
      document.title = this.t("game.documentTitle");
    }
  }

  setLanguage(language, { persist = true } = {}) {
    const normalized = normalizeLanguage(language) || "en";
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
        this.hasLocalOverride = true;
      } catch {
        // Session fallback
      }
    }
    if (normalized === this.language) return false;
    this.language = normalized;
    this.applyDocumentLanguage();
    for (const listener of this.listeners) listener(normalized);
    return true;
  }

  syncFromWink(state) {
    if (this.hasLocalOverride) return false;
    const platformLanguage = readWinkLanguage(state) || readUrlLanguage();
    if (!platformLanguage) return false;
    return this.setLanguage(platformLanguage, { persist: false });
  }

  t(key, variables = {}) {
    const template = messages[this.language]?.[key] ?? messages.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, name) =>
      variables[name] === undefined || variables[name] === null
        ? `{${name}}`
        : String(variables[name]),
    );
  }

  formatNumber(value) {
    const locale = this.language === "vi" ? "vi-VN" : "en-US";
    return Number(value || 0).toLocaleString(locale);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const i18n = new I18nManager();
export const t = (key, variables) => i18n.t(key, variables);
export { SUPPORTED_LANGUAGES };
