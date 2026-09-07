import { audio } from "./audio";
import { winkGame } from "./integrations/wink/wink-adapter.js";
import { i18n } from "./system/I18nManager.js";

export const LOCAL_STORAGE_KEY = "bolacdauphong_dino_stats";

export function getEffectiveUser() {
  if (winkGame && winkGame.personalBest?.displayName) {
    return {
      name: winkGame.personalBest.displayName,
      avatar: "/assest/image/imagenobackgrd/001_avatar_laclac.webp",
    };
  }

  try {
    const savedUser = localStorage.getItem("google_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.name) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }

  if (winkGame && winkGame.isAuthenticated) {
    return {
      name: i18n.t("leaderboard.defaultMember"),
      avatar: "/assest/image/imagenobackgrd/001_avatar_laclac.webp",
    };
  }
  return null;
}

// HTML Dialog Overlays matching standard lacquer system
export function gameAlert(message) {
  return new Promise((resolve) => {
    if (!document.getElementById("game-alert-styles")) {
      const style = document.createElement("style");
      style.id = "game-alert-styles";
      style.textContent = `
        .game-alert-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100dvw; height: 100dvh;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; justify-content: center; align-items: center;
          z-index: 100000;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .game-alert-card {
          background: #FFF8E1;
          border: 5px solid #F9A825;
          box-shadow: inset 0 0 0 2.5px #FFF59D, 0 6px 0 #F57F17, 0 12px 25px rgba(0, 0, 0, 0.35);
          border-radius: 20px;
          padding: 28px 24px;
          width: 85%; max-width: 340px;
          text-align: center;
          transform: scale(0.85);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family:Be Vietnam Pro, sans-serif;
        }
        .game-alert-text {
          color: #4E342E;
          font-size: 17px;
          line-height: 1.6;
          margin: 0 0 24px 0;
          font-weight: 700;
          text-shadow: 0 1px 0 rgba(255,255,255,0.8);
        }
        .game-alert-img-btn {
          height: 48px; width: auto;
          cursor: pointer;
          transition: transform 0.1s ease, filter 0.1s ease;
        }
        .game-alert-img-btn:hover {
          transform: scale(1.08);
          filter: brightness(1.08);
        }
        .game-alert-img-btn:active {
          transform: scale(0.96);
          filter: brightness(0.92);
        }
        .game-alert-buttons-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }
      `;
      document.head.appendChild(style);
    }

    const existing = document.getElementById("game-alert-overlay-id");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "game-alert-overlay-id";
    overlay.className = "game-alert-overlay";

    const card = document.createElement("div");
    card.className = "game-alert-card";

    const text = document.createElement("p");
    text.className = "game-alert-text";
    text.innerText = message;

    const button = document.createElement("img");
    button.className = "game-alert-img-btn";
    button.src = "/assest/iconbtn/yes_btn.webp";
    button.alt = i18n.t("actions.confirm");

    card.appendChild(text);
    card.appendChild(button);
    overlay.appendChild(card);

    const container = document.getElementById("app") || document.body;
    container.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.transform = "scale(1)";
    });

    const closeAlert = () => {
      overlay.style.opacity = "0";
      card.style.transform = "scale(0.85)";
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 250);
    };

    button.addEventListener("click", closeAlert);
  });
}

export function gameConfirm(message) {
  return new Promise((resolve) => {
    if (!document.getElementById("game-alert-styles")) {
      gameAlert(""); // inject style tag
    }

    const existing = document.getElementById("game-alert-overlay-id");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "game-alert-overlay-id";
    overlay.className = "game-alert-overlay";

    const card = document.createElement("div");
    card.className = "game-alert-card";

    const text = document.createElement("p");
    text.className = "game-alert-text";
    text.innerText = message;

    const btnContainer = document.createElement("div");
    btnContainer.className = "game-alert-buttons-container";

    const okButton = document.createElement("img");
    okButton.className = "game-alert-img-btn";
    okButton.src = "/assest/iconbtn/yes_btn.webp";
    okButton.alt = i18n.t("actions.confirm");

    const cancelButton = document.createElement("img");
    cancelButton.className = "game-alert-img-btn";
    cancelButton.src = "/assest/iconbtn/close_btn.webp";
    cancelButton.alt = i18n.t("actions.cancel");

    btnContainer.appendChild(okButton);
    btnContainer.appendChild(cancelButton);
    card.appendChild(text);
    card.appendChild(btnContainer);
    overlay.appendChild(card);

    const container = document.getElementById("app") || document.body;
    container.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.transform = "scale(1)";
    });

    const handleSelect = (choice) => {
      overlay.style.opacity = "0";
      card.style.transform = "scale(0.85)";
      setTimeout(() => {
        overlay.remove();
        resolve(choice);
      }, 250);
    };

    okButton.addEventListener("click", () => handleSelect(true));
    cancelButton.addEventListener("click", () => handleSelect(false));
  });
}

export const AdManager = {
  showRewardedVideo: async () => {
    console.log("[AdManager] Requesting Rewarded Video...");
    audio.playClick();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  },
  showInterstitial: async () => {
    console.log("[AdManager] Showing Interstitial Ad...");
    audio.playClick();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },
};

// Get high scores from localStorage
export function getStats() {
  try {
    const key = LOCAL_STORAGE_KEY;
    const data = window.localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }
  return {
    highScore: 0,
    history: [],
  };
}

// Save stats to localStorage
export function saveStats(stats) {
  try {
    const key = LOCAL_STORAGE_KEY;
    window.localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {
    console.error("Error writing localStorage:", e);
  }
}

export function getLeaderboardData() {
  const stats = getStats();
  const personalBest = stats.highScore || 0;
  const user = getEffectiveUser();
  const playerName = user
    ? user.name
    : winkGame?.isAuthenticated
      ? i18n.t("leaderboard.defaultMember")
      : i18n.t("leaderboard.youGuest");
  const playerAvatar =
    user?.avatar ||
    window.selectedAvatarUrl ||
    "/assest/image/imagenobackgrd/001_avatar_laclac.webp";

  if (personalBest <= 0) return [];

  return [
    {
      name: playerName,
      score: personalBest,
      avatar: playerAvatar,
      isPlayer: true,
      rank: 1,
    },
  ];
}

export async function fetchLeaderboardData() {
  const localList = getLeaderboardData();
  if (!winkGame) return localList;

  try {
    const [lbRes, pbRes] = await Promise.all([
      winkGame.refreshLeaderboard({ limit: 10 }),
      winkGame.getPersonalBest(),
    ]);

    if (lbRes && Array.isArray(lbRes.entries) && lbRes.entries.length > 0) {
      return lbRes.entries.map((item, idx) => ({
        name:
          item.displayName ||
          item.name ||
          i18n.t("leaderboard.defaultMemberNumber", {
            rank: item.rank || idx + 1,
          }),
        score: item.score || 0,
        avatar:
          item.avatarUrl ||
          "/assest/image/imagenobackgrd/001_avatar_laclac.webp",
        rank: item.rank || idx + 1,
        isPlayer: Boolean(
          item.userId && pbRes?.me?.userId && item.userId === pbRes.me.userId,
        ),
      }));
    }
  } catch (e) {
    console.warn("fetchLeaderboardData error:", e);
  }

  return localList;
}

export const palettes = {
  yellow: {
    top: 0xffd54f,
    bottom: 0xffb300,
    shadow: 0xff8f00,
    stroke: 0xffecb3,
  },
  green: {
    top: 0x7fff00,
    bottom: 0x00cc00,
    shadow: 0x006600,
    stroke: 0xd4ffd4,
  },
  pink: { top: 0xf06292, bottom: 0xc2185b, shadow: 0x880e4f, stroke: 0xf8bbd0 },
  blue: { top: 0x64b5f6, bottom: 0x1976d2, shadow: 0x0d47a1, stroke: 0xe3f2fd },
  purple: {
    top: 0xffb74d,
    bottom: 0xf57c00,
    shadow: 0xbf360c,
    stroke: 0xf2e6ff,
  },
  red: { top: 0xe57373, bottom: 0xe53935, shadow: 0xb71c1c, stroke: 0xffcdd2 },
};

export const getColorStyle = (colorValue, label = "") => {
  const lbl = String(label).toUpperCase();
  if (
    lbl.includes("PLAY") ||
    lbl.includes("REPLAY") ||
    lbl.includes("START") ||
    lbl.includes("NEXT") ||
    lbl.includes("DOUBLE") ||
    lbl.includes("GOT IT") ||
    lbl.includes("BẮT ĐẦU") ||
    lbl.includes("CHƠI LẠI") ||
    lbl.includes("NÚT CHƠI") ||
    lbl.includes("CỬA TIẾP") ||
    lbl.includes("NHÂN ĐÔI") ||
    lbl.includes("ĐÃ HIỂU")
  )
    return "green";
  if (
    lbl.includes("CONTINUE") ||
    lbl.includes("REVIVE") ||
    lbl.includes("CHARACTER") ||
    lbl.includes("SELECT") ||
    lbl.includes("TIẾP TỤC") ||
    lbl.includes("HỒI SINH") ||
    lbl.includes("TIẾP") ||
    lbl.includes("NHÂN VẬT") ||
    lbl.includes("CHỌN")
  )
    return "yellow";
  if (
    lbl.includes("BACK") ||
    lbl.includes("HOME") ||
    lbl.includes("CONFIRM") ||
    lbl.includes("LEADERBOARD") ||
    lbl.includes("QUAY LẠI") ||
    lbl.includes("TRANG CHỦ") ||
    lbl.includes("ĐỒNG Ý") ||
    lbl.includes("BẢNG VÀNG")
  )
    return "blue";
  if (
    lbl.includes("DELETE") ||
    lbl.includes("RESET") ||
    lbl.includes("CANCEL") ||
    lbl.includes("XÓA") ||
    lbl.includes("HỦY")
  )
    return "red";
  if (lbl.includes("GOOGLE")) return "yellow";
  return "yellow";
};
