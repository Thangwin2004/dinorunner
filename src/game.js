import {
  Container,
  Graphics,
  Text,
  TextStyle,
  FillGradient,
  Sprite,
  Assets,
} from "pixi.js";
import { audio } from "./audio";
import gsap from "gsap";

// HTML Dialog Overlays matching standard lacquer system
function gameAlert(message) {
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
          background: #fbfaf5;
          border: 5px solid #5900b3;
          box-shadow: inset 0 0 0 2.5px #ffea00, 0 10px 25px rgba(0, 0, 0, 0.35);
          border-radius: 20px;
          padding: 28px 24px;
          width: 85%; max-width: 340px;
          text-align: center;
          transform: scale(0.85);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Outfit', sans-serif;
        }
        .game-alert-text {
          color: #360207;
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
    button.src = "/assest/iconbtn/yes_btn.png";
    button.alt = "ĐỒNG Ý";

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

function gameConfirm(message) {
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
    okButton.src = "/assest/iconbtn/yes_btn.png";
    okButton.alt = "ĐỒNG Ý";

    const cancelButton = document.createElement("img");
    cancelButton.className = "game-alert-img-btn";
    cancelButton.src = "/assest/iconbtn/close_btn.png";
    cancelButton.alt = "HỦY";

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
    await gameAlert(
      "📺 Đang tải quảng cáo... Vui lòng xem hết để nhận phần thưởng!",
    );
    return new Promise((resolve) => {
      setTimeout(async () => {
        await gameAlert(
          "🎉 Cảm ơn bạn đã xem quảng cáo! Phần thưởng đã được mở khóa.",
        );
        resolve(true);
      }, 1500);
    });
  },
  showInterstitial: async () => {
    console.log("[AdManager] Showing Interstitial Ad...");
    audio.playClick();
    await gameAlert("📺 Đang hiển thị quảng cáo giữa màn hình...");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },
};

const LOCAL_STORAGE_KEY = "bolacdauphong_dino_stats";

// Get high scores from localStorage
function getStats() {
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
function saveStats(stats) {
  try {
    const key = LOCAL_STORAGE_KEY;
    window.localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {
    console.error("Error writing localStorage:", e);
  }
}

function getLeaderboardData() {
  const stats = getStats();
  const personalBest = stats.highScore || 0;

  // Mock entries
  const entries = [
    {
      name: "Lạc Lạc",
      score: 580,
      avatar: "/assest/image/imagebldp/001_avatar_laclac.png",
      isPlayer: false,
    },
    {
      name: "Đậu Phộng",
      score: 450,
      avatar: "/assest/image/imagebldp/015_avatar_dauLan.png",
      isPlayer: false,
    },
    {
      name: "Ếch Xanh",
      score: 320,
      avatar: "/assest/image/imagebldp/010_avatar_echxanh1.png",
      isPlayer: false,
    },
    {
      name: "Vịt Lùn",
      score: 210,
      avatar: "/assest/image/imagebldp/003_avatar_duck.png",
      isPlayer: false,
    },
    {
      name: "Mèo Ú",
      score: 150,
      avatar: "/assest/image/imagebldp/012_avatar_hubcat.png",
      isPlayer: false,
    },
  ];

  const playerName = "Bạn";
  const playerAvatar =
    window.selectedAvatarUrl || "/assest/image/imagebldp/001_avatar_laclac.png";

  entries.push({
    name: playerName,
    score: personalBest,
    avatar: playerAvatar,
    isPlayer: true,
  });

  // Sort descending
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

const palettes = {
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

const getColorStyle = (colorValue, label = "") => {
  const lbl = String(label).toUpperCase();
  if (
    lbl.includes("PLAY") ||
    lbl.includes("BẮT ĐẦU") ||
    lbl.includes("CHƠI LẠI") ||
    lbl.includes("NÚT CHƠI") ||
    lbl.includes("CỬA TIẾP") ||
    lbl.includes("NHÂN ĐÔI")
  )
    return "green";
  if (
    lbl.includes("TIẾP TỤC") ||
    lbl.includes("HỒI SINH") ||
    lbl.includes("TIẾP") ||
    lbl.includes("NHÂN VẬT") ||
    lbl.includes("CHỌN")
  )
    return "yellow";
  if (
    lbl.includes("QUAY LẠI") ||
    lbl.includes("BACK") ||
    lbl.includes("TRANG CHỦ") ||
    lbl.includes("ĐỒNG Ý") ||
    lbl.includes("BẢNG VÀNG")
  )
    return "blue";
  if (lbl.includes("XÓA") || lbl.includes("RESET") || lbl.includes("HỦY"))
    return "red";
  if (lbl.includes("GOOGLE")) return "yellow";
  return "yellow";
};

export class GameController extends Container {
  constructor(app) {
    super();
    this.app = app;

    this.gameState = "MAIN_MENU"; // MAIN_MENU, PLAYING, GAME_OVER, LEADERBOARD
    this.score = 0;
    this.highScore = 0;
    this.speed = 5;
    this.gameTime = 0;
    this.isMuted = false;

    // Physics parameters
    this.gravity = 0.5;
    this.jumpForce = -12;
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isDucking = false;

    // Game objects
    this.obstacles = [];
    this.nextSpawnTime = 0;
    this.lastMilestoneScore = 0;

    // Ad and revive tracking
    this.defeatCount = 0;
    this.hasRevivedThisRun = false;
    this.hasDoubledThisRun = false;
    this.shieldTime = 0;
    this.charSelectPage = 0;

    // Load Highscore
    this.highScore = getStats().highScore;

    // Background Layers
    this.bgOverlay = new Graphics();
    this.addChild(this.bgOverlay);

    // Parallax Mountain Layers (Vietnamese Mountains)
    this.distantMountains = new Graphics();
    this.midMountains = new Graphics();
    this.closeMountains = new Graphics();
    this.addChild(this.distantMountains);
    this.addChild(this.midMountains);
    this.addChild(this.closeMountains);

    // Floating Clouds
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      const cloud = new Graphics();
      this.addChild(cloud);
      this.clouds.push(cloud);
      cloud.x = Math.random() * 800;
      cloud.y = 50 + Math.random() * 150;
      cloud.speed = 0.1 + Math.random() * 0.15;
      cloud.w = 90 + Math.random() * 30;
      cloud.h = 40 + Math.random() * 15;
    }

    // Screen containers
    this.mainMenuContainer = new Container();
    this.gamePlayContainer = new Container();
    this.gameOverContainer = new Container();
    this.achievementsContainer = new Container();
    this.settingsContainer = new Container();
    this.pauseContainer = new Container();
    this.charSelectContainer = new Container();
    this.instructionsContainer = new Container();

    this.addChild(this.mainMenuContainer);
    this.addChild(this.gamePlayContainer);
    this.addChild(this.gameOverContainer);
    this.addChild(this.achievementsContainer);
    this.addChild(this.settingsContainer);
    this.addChild(this.pauseContainer);
    this.addChild(this.charSelectContainer);
    this.addChild(this.instructionsContainer);

    // User text for achievements screen
    this.achievementsUserText = null;

    // Sprite assets references
    this.playerSprite = null;
    this.laclacTexture = null;
    this.daulanTexture = null;
    this.echxanhTexture = null;
    this.duckTexture = null;

    // Start loading assets
    this.loadAssets();

    // Create UIs
    this.setupUI();
    this.initDOMOverlays();

    // Set initial state
    this.switchState("MAIN_MENU");
  }

  create3DButton(text, width, height, onClick) {
    const btn = new Container();
    btn.eventMode = "static";
    btn.cursor = "pointer";

    const content = new Container();
    btn.addChild(content);

    const shadow = new Graphics();
    const bg = new Graphics();
    const highlight = new Graphics();

    content.addChild(shadow);
    content.addChild(bg);
    content.addChild(highlight);

    const hh = height / 2;
    const isSmall = width < 150;
    const radius = hh;
    const shadowOffset = isSmall ? 4 : 6;

    const colorStyle = getColorStyle(null, text);
    const theme = palettes[colorStyle] || palettes.yellow;

    // 1. Base Shadow
    shadow
      .roundRect(-width / 2, -hh + shadowOffset, width, height, radius)
      .fill({ color: theme.shadow });

    // 2. Face Background (gradient)
    const btnGrad = new FillGradient({
      start: { x: 0, y: -hh },
      end: { x: 0, y: hh },
      colorStops: [
        { offset: 0, color: theme.top },
        { offset: 1, color: theme.bottom },
      ],
    });
    bg.roundRect(-width / 2, -hh, width, height, radius)
      .fill({ fill: btnGrad })
      .stroke({ color: theme.stroke, width: 2.5 });

    // 3. Highlight sheen
    highlight
      .ellipse(0, -hh / 2, width * 0.42, height * 0.2)
      .fill({ color: 0xffffff, alpha: 0.28 });

    // 4. Label & Icon
    let emojiTexture = null;
    let labelText = text;

    const emojiMapping = {
      "🏠": "home_btn",
      "🏡": "home_btn",
      "⚙️": "settings_btn",
      "✕": "close_btn",
      "❌": "close_btn",
      "↩️": "back_btn",
      "◀️": "back_btn",
      "▶️": "continue_btn",
      "🏆": "trophy_btn",
      "🔄": "replay_btn",
      "🗑️": "delete_btn",
      "💡": "hint_btn",
      "📺": "revive_btn",
      "❔": "quest_btn",
      "❓": "quest_btn",
      "👤": "user_btn",
    };

    const spaceIndex = text.indexOf(" ");
    if (spaceIndex !== -1) {
      const firstWord = text.substring(0, spaceIndex);
      if (emojiMapping[firstWord]) {
        try {
          emojiTexture = Assets.get(emojiMapping[firstWord]);
          labelText = text.substring(spaceIndex + 1);
        } catch (e) {
          console.warn("Asset lookup failed for button emoji:", firstWord, e);
        }
      }
    }
    const label = new Text({
      text: labelText.toUpperCase(),
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: Math.min(20, height * 0.45),
        fill: "#37474f",
        align: "center",
      }),
    });
    label.anchor.set(0.5);

    if (emojiTexture) {
      const sprite = new Sprite(emojiTexture);
      sprite.anchor.set(0.5);
      // Scale sprite to fit height nicely
      const spriteSize = height * 0.85;
      sprite.width = spriteSize;
      sprite.height = spriteSize;

      content.addChild(sprite);
      content.addChild(label);

      const gap = 10;
      const totalW = sprite.width + gap + label.width;
      sprite.position.set(-totalW / 2 + sprite.width / 2, 0);
      label.position.set(totalW / 2 - label.width / 2, 0);
    } else {
      label.position.set(0, 0);
      content.addChild(label);
    }

    btn.on("pointerover", () => {
      gsap.to(btn.scale, { x: 1.05, y: 1.05, duration: 0.12 });
    });
    btn.on("pointerout", () => {
      gsap.to(btn.scale, { x: 1.0, y: 1.0, duration: 0.12 });
      gsap.to(content, { y: 0, duration: 0.1 });
    });
    btn.on("pointerdown", () => {
      gsap.to(content, { y: shadowOffset - 2, duration: 0.05 });
    });
    btn.on("pointerup", () => {
      gsap.to(content, { y: 0, duration: 0.1 });
      audio.playClick();
      onClick();
    });
    btn.on("pointerupoutside", () => {
      gsap.to(content, { y: 0, duration: 0.1 });
    });

    return btn;
  }

  createIconOnlyButton(emoji, radius, onClick) {
    const mapping = {
      "🏠": "home_btn",
      "🏡": "home_btn",
      "⚙️": "settings_btn",
      "✕": "close_btn",
      "❌": "close_btn",
      "↩️": "back_btn",
      "◀️": "back_btn",
      "▶️": "next_btn",
      "🏆": "trophy_btn",
      "🔄": "replay_btn",
      "🗑️": "delete_btn",
      "💡": "hint_btn",
      "📺": "revive_btn",
      "❔": "quest_btn",
      "❓": "quest_btn",
      "👤": "user_btn",
      x2: "x2_btn",
      X2: "x2_btn",
    };

    const texAlias = mapping[emoji];
    let tex = null;
    if (texAlias) {
      try {
        tex = Assets.get(texAlias);
      } catch (e) {
        console.warn("Texture lookup failed for alias:", texAlias, e);
      }
    }

    if (tex) {
      const btn = new Container();
      btn.eventMode = "static";
      btn.cursor = "pointer";

      const content = new Container();
      btn.addChild(content);

      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5);

      let mult = 1.0;

      const ratio = tex.width && tex.height ? tex.width / tex.height : 1;
      if (ratio > 1.2 || ratio < 0.8) {
        sprite.height = radius * 2 * mult;
        sprite.width = radius * 2 * ratio * mult;
      } else {
        sprite.width = radius * 2 * mult;
        sprite.height = radius * 2 * mult;
      }
      content.addChild(sprite);

      btn.updateStyle = (r) => {
        const ratio = tex.width && tex.height ? tex.width / tex.height : 1;
        if (ratio > 1.2 || ratio < 0.8) {
          sprite.height = r * 2 * mult;
          sprite.width = r * 2 * ratio * mult;
        } else {
          sprite.width = r * 2 * mult;
          sprite.height = r * 2 * mult;
        }
      };

      btn.on("pointerover", () => {
        gsap.to(btn.scale, { x: 1.08, y: 1.08, duration: 0.12 });
      });
      btn.on("pointerout", () => {
        gsap.to(btn.scale, { x: 1.0, y: 1.0, duration: 0.12 });
        gsap.to(content, { y: 0, duration: 0.1 });
      });
      btn.on("pointerdown", () => {
        gsap.to(content, { y: 4, duration: 0.05 });
      });
      btn.on("pointerup", () => {
        gsap.to(content, { y: 0, duration: 0.1 });
        audio.playClick();
        onClick();
      });
      btn.on("pointerupoutside", () => {
        gsap.to(content, { y: 0, duration: 0.1 });
      });

      return btn;
    } else {
      const btn = new Container();
      btn.eventMode = "static";
      btn.cursor = "pointer";

      const base = new Graphics();
      const face = new Graphics();

      const drawGraphics = (pressed = false) => {
        base.clear();
        face.clear();

        const offset = pressed ? 1.5 : 3;
        const color = palettes.purple;

        base.circle(0, offset, radius).fill({ color: color.shadow });

        face
          .circle(0, 0, radius)
          .fill({
            fill: new FillGradient({
              start: { x: 0, y: -radius },
              end: { x: 0, y: radius },
              colorStops: [
                { offset: 0, color: color.top },
                { offset: 1, color: color.bottom },
              ],
            }),
          })
          .stroke({ color: color.stroke, width: 2 });

        face
          .ellipse(0, -radius * 0.4, radius * 0.72, radius * 0.35)
          .fill({ color: 0xffffff, alpha: 0.28 });
      };

      drawGraphics();
      btn.addChild(base);
      btn.addChild(face);

      const txt = new Text({
        text: emoji,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: radius * 1.0,
          fill: 0xffffff,
          align: "center",
        }),
      });
      txt.anchor.set(0.5);
      face.addChild(txt);

      btn.on("pointerover", () => {
        gsap.to(btn.scale, { x: 1.08, y: 1.08, duration: 0.12 });
      });
      btn.on("pointerout", () => {
        gsap.to(btn.scale, { x: 1.0, y: 1.0, duration: 0.12 });
        drawGraphics(false);
      });
      btn.on("pointerdown", () => {
        drawGraphics(true);
        gsap.to(face.position, { y: 1.5, duration: 0.05 });
      });
      btn.on("pointerup", () => {
        drawGraphics(false);
        gsap.to(face.position, { y: 0, duration: 0.1 });
        audio.playClick();
        onClick();
      });
      btn.on("pointerupoutside", () => {
        drawGraphics(false);
        gsap.to(face.position, { y: 0, duration: 0.1 });
      });

      return btn;
    }
  }

  async loadAssets() {
    try {
      this.laclacTexture = await Assets.load(
        "/assest/image/imagebldp/001_avatar_laclac.png",
      );
      this.daulanTexture = await Assets.load(
        "/assest/image/imagebldp/015_avatar_dauLan.png",
      );
      this.echxanhTexture = await Assets.load(
        "/assest/image/imagebldp/010_avatar_echxanh1.png",
      );
      this.duckTexture = await Assets.load(
        "/assest/image/imagebldp/003_avatar_duck.png",
      );

      // Preload obstacles
      await Assets.load(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
      );
      await Assets.load(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
      );
      await Assets.load(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
      );
      await Assets.load(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
      );

      if (this.destroyed) return;

      // Initialize 2D character on play screen
      this.playerSprite = new Container();

      const savedAvatar =
        window.localStorage.getItem("selected_avatar_url") ||
        "/assest/image/imagebldp/001_avatar_laclac.png";
      window.selectedAvatarUrl = savedAvatar;
      this.playerColors = this.getAvatarColors(savedAvatar);
      const activeTex = await Assets.load(savedAvatar);

      // 1. Create Skeletal Rig Parts from the active avatar texture
      this.playerHead = this.createSkeletalPart(activeTex, "head", savedAvatar);
      this.playerHead.position.set(0, -62);

      this.playerBody = this.createSkeletalPart(activeTex, "body", savedAvatar);
      this.leftArm = this.createSkeletalPart(activeTex, "arm", savedAvatar);
      this.rightArm = this.createSkeletalPart(activeTex, "arm", savedAvatar);
      this.leftLeg = this.createSkeletalPart(activeTex, "leg", savedAvatar);
      this.rightLeg = this.createSkeletalPart(activeTex, "leg", savedAvatar);

      // Add to player container in correct layering order (back to front)
      this.playerSprite.addChild(this.leftArm);
      this.playerSprite.addChild(this.leftLeg);
      this.playerSprite.addChild(this.rightLeg);
      this.playerSprite.addChild(this.playerBody);
      this.playerSprite.addChild(this.playerHead);
      this.playerSprite.addChild(this.rightArm);

      this.playerShieldGraphics = new Graphics();
      this.playerSprite.addChild(this.playerShieldGraphics);

      this.gamePlayContainer.addChild(this.playerSprite);

      this.resize();
    } catch (e) {
      console.error("Error loading assets:", e);
    }
  }

  getAvatarColors(url) {
    const lowercase = url.toLowerCase();
    if (
      lowercase.includes("laclac") ||
      lowercase.includes("duck") ||
      lowercase.includes("tiguayel") ||
      lowercase.includes("dogoin")
    ) {
      return {
        head: 0xffb300,
        innerEar: 0xff8a80,
        body: 0x1e88e5,
        pants: 0x1565c0,
        sleeve: 0x1e88e5,
      }; // Lạc Lạc yellow + blue shirt style
    }
    if (
      lowercase.includes("echxanh") ||
      lowercase.includes("turtle") ||
      lowercase.includes("banhtung")
    ) {
      return {
        head: 0x66bb6a,
        innerEar: 0xff8a80,
        body: 0x66bb6a,
        pants: 0x2e7d32,
        sleeve: 0x66bb6a,
      }; // Green themed
    }
    if (
      lowercase.includes("cat") ||
      lowercase.includes("husky") ||
      lowercase.includes("unicorn") ||
      lowercase.includes("cloudball")
    ) {
      return {
        head: 0xf5f5f5,
        innerEar: 0xff8a80,
        body: 0xf5f5f5,
        pants: 0x37474f,
        sleeve: 0xf5f5f5,
      }; // White/Grey themed
    }
    if (
      lowercase.includes("long") ||
      lowercase.includes("daulan") ||
      lowercase.includes("ronaldo")
    ) {
      return {
        head: 0xd32f2f,
        innerEar: 0xffea00,
        body: 0xd32f2f,
        pants: 0xffea00,
        sleeve: 0xd32f2f,
      }; // Red/Gold themed
    }
    if (lowercase.includes("doremon") || lowercase.includes("poolpanda")) {
      return {
        head: 0x1e88e5,
        innerEar: 0xffea00,
        body: 0x1e88e5,
        pants: 0xf5f5f5,
        sleeve: 0x1e88e5,
      }; // Blue themed
    }
    return {
      head: 0xffa726,
      innerEar: 0xff8a80,
      body: 0xffa726,
      pants: 0x3f51b5,
      sleeve: 0xffa726,
    }; // Default Orange
  }

  getAvatarCrop(url, maskRadius) {
    // Since images have wildly different 3D camera angles and framings,
    // a single moderate zoom (1.5x) focusing on the upper-middle area
    // is the safest way to ensure faces aren't completely cropped out.
    const scale = 1.5;
    const yOffset = maskRadius * 0.4; // Shift image down slightly to focus on the top half

    return { size: maskRadius * 2 * scale, y: yOffset };
  }

  createSkeletalPart(tex, partType, url) {
    const partContainer = new Container();
    const sp = new Sprite(tex);
    sp.anchor.set(0.5);
    sp.scale.x = Math.abs(sp.scale.x);

    let maskShape = new Graphics();
    let border = new Graphics();

    if (partType === "head") {
      const crop = this.getAvatarCrop(url, 32);
      sp.width = crop.size;
      sp.height = crop.size;
      sp.y = crop.y;

      maskShape.circle(0, 0, 32).fill(0xffffff);
      border.circle(0, 0, 32).stroke({ width: 3, color: 0xffea00 });
    } else if (partType === "body") {
      sp.width = 120;
      sp.height = 120;
      sp.y = -10; // Torso center

      maskShape.roundRect(-16, -20, 32, 28, 12).fill(0xffffff);
      border
        .roundRect(-16, -20, 32, 28, 12)
        .stroke({ width: 3.5, color: 0x1a1a2e });
    } else if (partType === "arm") {
      // Massive zoom to sample a single color pixel from the face (skin color)
      sp.width = 1000;
      sp.height = 1000;
      sp.y = 40; // Shift texture down to sample the face/cheek area
      sp.x = 0;

      maskShape.roundRect(-6, 0, 12, 24, 6); // sleeve (longer)
      maskShape.circle(0, 24, 7); // fist (moved down)
      maskShape.fill(0xffffff);

      border
        .roundRect(-6, 0, 12, 24, 6)
        .stroke({ width: 2.5, color: 0x1a1a2e });
      border.circle(0, 24, 7).stroke({ width: 2.5, color: 0x1a1a2e });
    } else if (partType === "leg") {
      // Massive zoom to sample a single color pixel from the face (skin color)
      sp.width = 1000;
      sp.height = 1000;
      sp.y = 40; // Shift texture down to sample the face/cheek area
      sp.x = 0;

      maskShape.roundRect(-8, 0, 16, 28, 8); // leg (longer)
      maskShape.roundRect(-8, 22, 20, 10, 5); // foot pointing right (moved down)
      maskShape.fill(0xffffff);

      border.roundRect(-8, 0, 16, 28, 8).stroke({ width: 3, color: 0x1a1a2e });
      border.roundRect(-8, 22, 20, 10, 5).stroke({ width: 3, color: 0x1a1a2e });
    }

    sp.mask = maskShape;
    partContainer.addChild(sp);
    partContainer.addChild(maskShape);
    partContainer.addChild(border);

    return partContainer;
  }

  updateSkeletalRigTexture(tex, url) {
    const parts = [
      { container: this.playerHead, type: "head" },
      { container: this.playerBody, type: "body" },
      { container: this.leftArm, type: "arm" },
      { container: this.rightArm, type: "arm" },
      { container: this.leftLeg, type: "leg" },
      { container: this.rightLeg, type: "leg" },
    ];

    parts.forEach((p) => {
      if (p.container && p.container.children[0]) {
        const sp = p.container.children[0];
        sp.texture = tex;
        if (p.type === "head") {
          const crop = this.getAvatarCrop(url, 32);
          sp.width = crop.size;
          sp.height = crop.size;
          sp.scale.x = Math.abs(sp.scale.x);
          sp.y = crop.y;
        }
      }
    });
  }

  updatePlayerLeg(legContainer, hipX, hipY, phase, isJumping, isDucking) {
    legContainer.position.set(hipX, hipY);
    let angle = 0;
    if (isJumping) angle = -0.5;
    else if (isDucking) angle = -1.2;
    else angle = Math.cos(phase) * 0.7;
    legContainer.rotation = angle;
  }

  updatePlayerArm(
    armContainer,
    shoulderX,
    shoulderY,
    phase,
    isJumping,
    isDucking,
  ) {
    armContainer.position.set(shoulderX, shoulderY);
    let angle = 0;
    if (isJumping) angle = -2.2;
    else if (isDucking) angle = 0.8;
    else angle = -Math.cos(phase) * 0.8;
    armContainer.rotation = angle;
  }

  updatePlayerBody(bodyContainer, yOffset = -36) {
    bodyContainer.position.set(0, yOffset);
    bodyContainer.rotation = 0;
  }

  setupUI() {
    // ==========================================
    // 1. MAIN MENU SCREEN
    // ==========================================
    // Mascot Frame at the top of the main menu
    this.menuMascotFrame = new Container();
    this.mainMenuContainer.addChild(this.menuMascotFrame);

    this.menuMascotInner = new Container();
    this.menuMascotFrame.addChild(this.menuMascotInner);

    this.menuMascotSprite = new Sprite();
    this.menuMascotSprite.anchor.set(0.5);
    this.menuMascotSprite.width = 120;
    this.menuMascotSprite.height = 120;
    this.menuMascotInner.addChild(this.menuMascotSprite);

    const mascotMask = new Graphics().circle(0, 0, 60).fill(0xffffff);
    this.menuMascotSprite.mask = mascotMask;
    this.menuMascotInner.addChild(mascotMask);

    const mascotBorder = new Graphics()
      .circle(0, 0, 60)
      .fill({ color: 0xffffff, alpha: 0.15 })
      .stroke({ width: 4.5, color: 0xffea00 });
    this.menuMascotInner.addChild(mascotBorder);

    // Bouncing mascot animation
    gsap.to(this.menuMascotInner.scale, {
      x: 1.05,
      y: 0.95,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    this.menuTitleText = new Text({
      text: "BỘ LẠC PHIÊU LƯU KÝ",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 42,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffea00, offset: 0 },
            { color: 0xff3d00, offset: 1 },
          ],
        }),
        stroke: { color: 0xffffff, width: 5 },
        dropShadow: {
          color: 0x000000,
          blur: 2,
          angle: Math.PI / 6,
          distance: 4,
          alpha: 0.5,
        },
        fontWeight: "900",
        letterSpacing: 2,
        wordWrap: true,
        wordWrapWidth: 450,
        align: "center",
      }),
    });
    this.menuTitleText.anchor.set(0.5);
    this.mainMenuContainer.addChild(this.menuTitleText);

    this.menuSubtitleText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 12,
        fill: "#1565c0",

        fontWeight: "bold",
        letterSpacing: 1.5,
        wordWrap: true,
        wordWrapWidth: 400,
        align: "center",
      }),
    });
    this.menuSubtitleText.anchor.set(0.5);
    this.mainMenuContainer.addChild(this.menuSubtitleText);

    // 🏆 KỶ LỤC ĐIỂM
    this.menuHighScoreText = new Text({
      text: `🏆 KỶ LỤC ĐIỂM: ${this.highScore}`,
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 28,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 4, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 3,
          alpha: 0.3,
        },
        fontWeight: "900",
        letterSpacing: 2,
      }),
    });
    this.menuHighScoreText.anchor.set(0.5);
    this.mainMenuContainer.addChild(this.menuHighScoreText);

    this.playBtn = this.create3DButton("CHƠI NGAY", 220, 44, () => {
      this.switchState("PLAYING");
    });
    this.mainMenuContainer.addChild(this.playBtn);

    // Circular bottom sub-buttons
    this.achievementsBtn = this.createIconOnlyButton("🏆", 28, () => {
      this.switchState("ACHIEVEMENTS");
    });
    this.mainMenuContainer.addChild(this.achievementsBtn);

    this.charSelectBtn = this.createIconOnlyButton("👤", 28, () => {
      this.switchState("CHAR_SELECT");
    });
    this.mainMenuContainer.addChild(this.charSelectBtn);

    this.instructionsBtn = this.createIconOnlyButton("❓", 28, () => {
      this.switchState("INSTRUCTIONS");
    });
    this.mainMenuContainer.addChild(this.instructionsBtn);

    this.settingsBtn = this.createIconOnlyButton("⚙️", 28, () => {
      this.switchState("SETTINGS");
    });
    this.mainMenuContainer.addChild(this.settingsBtn);

    // ==========================================
    // 2. GAMEPLAY SCREEN
    // ==========================================
    this.scoreText = new Text({
      text: "ĐIỂM: 0",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 28,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 4, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 2,
          angle: Math.PI / 2,
          distance: 2,
          alpha: 0.4,
        },
        fontWeight: "900",
        letterSpacing: 3,
      }),
    });
    this.scoreText.anchor.set(0, 0.5);
    this.gamePlayContainer.addChild(this.scoreText);

    this.highScoreText = new Text({
      text: "KỶ LỤC: 0",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: 0xffffff,
        stroke: { color: 0x1565c0, width: 3, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.3,
        },
        fontWeight: "900",
        letterSpacing: 2,
      }),
    });
    this.highScoreText.anchor.set(1, 0.5);
    this.gamePlayContainer.addChild(this.highScoreText);

    this.pauseBtn = this.createIconOnlyButton("⏸", 16, () => {
      this.switchState("PAUSED");
    });
    this.gamePlayContainer.addChild(this.pauseBtn);

    // ==========================================
    // 3. GAME OVER SCREEN
    // ==========================================
    this.setupGameOverUI();
    this.setupPauseUI();
    this.setupInstructionsUI();

    // ==========================================
    // 4. ACHIEVEMENTS SCREEN (LEADERBOARD)
    // ==========================================
    this.leaderboardCard = new Container();
    this.achievementsContainer.addChild(this.leaderboardCard);

    const cardW = 500;
    const cardH = 580;

    // 1. Card Base Styling (purple 3D border, cream card face)
    const shadow = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c });
    this.leaderboardCard.addChild(shadow);

    const cardBorder = new Graphics();
    const borderGrad = new FillGradient({
      start: { x: 0, y: -cardH / 2 },
      end: { x: 0, y: cardH / 2 },
      colorStops: [
        { offset: 0, color: 0xffb74d },
        { offset: 1, color: 0xf57c00 },
      ],
    });
    cardBorder
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({ fill: borderGrad })
      .stroke({ color: 0xffea00, width: 2.5 });
    this.leaderboardCard.addChild(cardBorder);

    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.leaderboardCard.addChild(cardFace);

    // 2. Floating 3D Title Ribbon (Pink/Magenta)
    const ribbonShadow = new Graphics()
      .roundRect(-150, -cardH / 2 - 21 + 4, 300, 42, 10)
      .fill({ color: 0x800040 });
    this.leaderboardCard.addChild(ribbonShadow);

    const ribbon = new Graphics();
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0xff66b2 },
        { offset: 1, color: 0xcc0066 },
      ],
    });
    ribbon
      .roundRect(-150, -cardH / 2 - 21, 300, 42, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xffe6f2, width: 2 });
    this.leaderboardCard.addChild(ribbon);

    const titleText = new Text({
      text: "BẢNG VÀNG THÀNH TÍCH",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: 0xffffff,
        align: "center",
      }),
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, -cardH / 2);
    this.leaderboardCard.addChild(titleText);

    // 3. Header Labels
    const headerStyle = new TextStyle({
      fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
      fontSize: 13,
      fontWeight: "bold",
      fill: "#5900b3",
    });
    const lblRank = new Text({ text: "HẠNG", style: headerStyle });
    lblRank.anchor.set(0.5);
    lblRank.position.set(-170, -155);
    this.leaderboardCard.addChild(lblRank);

    const lblMember = new Text({ text: "THÀNH VIÊN", style: headerStyle });
    lblMember.anchor.set(0, 0.5);
    lblMember.position.set(-90, -155);
    this.leaderboardCard.addChild(lblMember);

    const lblScore = new Text({ text: "KỶ LỤC", style: headerStyle });
    lblScore.anchor.set(1, 0.5);
    lblScore.position.set(160, -155);
    this.leaderboardCard.addChild(lblScore);

    // 4. Rows Container
    this.leadersContainer = new Container();
    this.leaderboardCard.addChild(this.leadersContainer);

    // 5. Pinned Personal Best Footer
    this.footerBg = new Graphics();
    this.leaderboardCard.addChild(this.footerBg);
    this.footerContainer = new Container();
    this.leaderboardCard.addChild(this.footerContainer);

    // 6. Action buttons: only Achievements Back Button centered at x = 0
    this.achievementsBackBtn = this.createIconOnlyButton("↩️", 20, () => {
      this.switchState("MAIN_MENU");
    });
    this.achievementsBackBtn.position.set(0, 230);
    this.leaderboardCard.addChild(this.achievementsBackBtn);

    // Call sub-UI setups
    this.setupSettingsUI();
    this.setupCharSelectUI();
  }

  createToggleRow(labelText, yPos, getState, onToggle) {
    const row = new Container();
    row.position.set(0, yPos);

    // Row background card panel to group label and toggle visually
    const rowBg = new Graphics()
      .roundRect(-135, -28, 270, 56, 10)
      .fill({ color: 0xefede0 }) // Warm creamy beige
      .stroke({ color: 0xdfdac0, width: 1.5 });
    row.addChild(rowBg);

    // Left label (enlarged cartoon text)
    const label = new Text({
      text: labelText.toUpperCase(),
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: "#37474f",
        fontWeight: "bold",
        letterSpacing: 0.8,
      }),
    });
    label.anchor.set(0, 0.5);
    label.position.set(-115, 0);
    row.addChild(label);

    const trackTexOn = Assets.get("toggle_on");
    const trackTexOff = Assets.get("toggle_off");

    const track = new Sprite(getState() ? trackTexOff : trackTexOn);
    track.anchor.set(0.5);
    track.width = 100;
    track.height = 50;
    track.eventMode = "static";
    track.cursor = "pointer";
    track.position.set(80, 0);
    row.addChild(track);

    // Draw dotted connector line dynamically between text and switch
    const labelWidth = label.width;
    const startX = -115 + labelWidth + 12;
    const endX = 80 - 50 - 12;
    if (startX < endX) {
      const dots = new Graphics();
      for (let dx = startX; dx <= endX; dx += 6) {
        dots.circle(dx, 0, 1.5);
      }
      dots.fill({ color: 0xc0bba0 });
      row.addChild(dots);
    }

    const handleToggle = () => {
      audio.playCollect(); // Or click sound
      const isMuted = onToggle();
      track.texture = isMuted ? trackTexOff : trackTexOn;
    };

    row.updateVisuals = () => {
      track.texture = getState() ? trackTexOff : trackTexOn;
    };

    track.on("pointerdown", handleToggle);
    label.eventMode = "static";
    label.cursor = "pointer";
    label.on("pointerdown", handleToggle);

    return row;
  }

  setupSettingsUI() {
    // Backdrop
    this.settingsBackdrop = new Graphics();
    this.settingsContainer.addChild(this.settingsBackdrop);

    // Card Container
    this.settingsCard = new Container();
    this.settingsContainer.addChild(this.settingsCard);

    const cardW = 340;
    const cardH = 300;

    // 3D Shadow Base
    const shadow = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c });
    this.settingsCard.addChild(shadow);

    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.settingsCard.addChild(cardFace);

    // Title Ribbon
    const ribbonW = 210;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbonShadow = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x0d47a1 });
    this.settingsCard.addChild(ribbonShadow);

    const ribbon = new Graphics();
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0x64b5f6 },
        { offset: 1, color: 0x1976d2 },
      ],
    });
    ribbon
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xe3f2fd, width: 2 });
    this.settingsCard.addChild(ribbon);

    const title = new Text({
      text: "CÀI ĐẶT GAME",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: 0xffffff,
        align: "center",
      }),
    });
    title.anchor.set(0.5);
    title.position.set(0, ribbonY);
    this.settingsCard.addChild(title);

    // Close Button (X) on top-right
    const closeBtn = this.createIconOnlyButton("❌", 20, () => {
      this.switchState("MAIN_MENU");
    });
    closeBtn.position.set(cardW / 2 - 20, -cardH / 2 + 20);
    this.settingsCard.addChild(closeBtn);

    // Music row
    this.mainMusicRow = this.createToggleRow(
      "NHẠC NỀN",
      -60,
      () => audio.musicMuted,
      () => {
        audio.toggleMusicMute();
        return audio.musicMuted;
      },
    );
    this.settingsCard.addChild(this.mainMusicRow);

    // SFX row
    this.mainSfxRow = this.createToggleRow(
      "HIỆU ỨNG",
      -10,
      () => audio.sfxMuted,
      () => {
        audio.toggleSfxMute();
        return audio.sfxMuted;
      },
    );
    this.settingsCard.addChild(this.mainSfxRow);

    // Reset button
    const resetBtn = this.create3DButton(
      "🗑️ XÓA LỊCH SỬ",
      180,
      36,
      async () => {
        const confirmReset = await gameConfirm(
          "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu kỷ lục không?",
        );
        if (confirmReset) {
          saveStats({
            highScore: 0,
            history: [],
          });
          this.highScore = 0;
          this.updateAchievementsDisplay();
          await gameAlert("Đã xóa toàn bộ dữ liệu thành công!");
          this.switchState("MAIN_MENU");
        }
      },
    );
    resetBtn.position.set(0, 55);
    this.settingsCard.addChild(resetBtn);

    const versionText = new Text({
      text: "Phiên bản: 1.0.0",
      style: {
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 12,
        fill: "#aaaaaa",
      },
    });
    versionText.anchor.set(0.5);
    versionText.position.set(0, 110);
    this.settingsCard.addChild(versionText);
  }

  setupPauseUI() {
    this.pauseBackdrop = new Graphics();
    this.pauseContainer.addChild(this.pauseBackdrop);

    this.pauseCard = new Container();
    this.pauseContainer.addChild(this.pauseCard);

    const cardW = 340;
    const cardH = 300;

    // 1. Card Shadow
    const cardShadow = new Graphics()
      .roundRect(-cardW / 2 + 6, -cardH / 2 + 12, cardW, cardH, 20)
      .fill({ color: 0x000000, alpha: 0.25 });
    this.pauseCard.addChild(cardShadow);

    // 2. Purple 3D Border
    const borderBg = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c }) // Shadow Base
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({
        fill: new FillGradient({
          start: { x: 0, y: -cardH / 2 },
          end: { x: 0, y: cardH / 2 },
          colorStops: [
            { offset: 0, color: 0xffb74d },
            { offset: 1, color: 0xf57c00 },
          ],
        }),
      })
      .stroke({ color: 0xffea00, width: 2.5 }); // Gold inner border
    this.pauseCard.addChild(borderBg);

    // 3. Bright Cream Card Face
    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.pauseCard.addChild(cardFace);

    // 4. Floating 3D Title Ribbon (Cyan-Blue)
    const ribbonW = 210;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbon = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x0d47a1 }) // Ribbon shadow
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
      .fill({
        fill: new FillGradient({
          start: { x: 0, y: ribbonY - ribbonH / 2 },
          end: { x: 0, y: ribbonY + ribbonH / 2 },
          colorStops: [
            { offset: 0, color: 0x64b5f6 },
            { offset: 1, color: 0x1976d2 },
          ],
        }),
      })
      .stroke({ color: 0xe3f2fd, width: 2 });
    this.pauseCard.addChild(ribbon);

    // Title text inside ribbon
    const titleText = new Text({
      text: "CÀI ĐẶT GAME",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: "bold",
        letterSpacing: 1.5,
      }),
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, ribbonY);
    this.pauseCard.addChild(titleText);

    // Music row
    this.pauseMusicRow = this.createToggleRow(
      "NHẠC NỀN",
      -60,
      () => audio.musicMuted,
      () => {
        audio.toggleMusicMute();
        return audio.musicMuted;
      },
    );
    this.pauseCard.addChild(this.pauseMusicRow);

    // SFX row
    this.pauseSfxRow = this.createToggleRow(
      "HIỆU ỨNG",
      -10,
      () => audio.sfxMuted,
      () => {
        audio.toggleSfxMute();
        return audio.sfxMuted;
      },
    );
    this.pauseCard.addChild(this.pauseSfxRow);

    // Bottom buttons row: Home, Replay, Resume
    const btnHome = this.createIconOnlyButton("🏠", 26, async () => {
      const confirmQuit = await gameConfirm(
        "Bạn có muốn thoát về màn hình chính?",
      );
      if (confirmQuit) {
        this.switchState("MAIN_MENU");
      }
    });
    btnHome.position.set(-65, 60);
    this.pauseCard.addChild(btnHome);

    const btnReplay = this.createIconOnlyButton("🔄", 26, () => {
      // Temporarily set gameState to PLAYING before switchState so that isResuming is false
      // and it triggers resetGame()
      this.gameState = "PLAYING";
      this.switchState("PLAYING");
    });
    btnReplay.position.set(0, 60);
    this.pauseCard.addChild(btnReplay);

    const btnResume = this.createIconOnlyButton("▶️", 26, () => {
      // Calls switchState while gameState is still PAUSED, so isResuming is true, continuing the game
      this.switchState("PLAYING");
    });
    btnResume.position.set(65, 60);
    this.pauseCard.addChild(btnResume);
  }

  setupGameOverUI() {
    this.gameOverBackdrop = new Graphics();
    this.gameOverContainer.addChild(this.gameOverBackdrop);

    this.gameOverCard = new Container();
    this.gameOverContainer.addChild(this.gameOverCard);

    const cardW = 340;
    const cardH = 320;

    // 3D Shadow Base
    const shadow = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c });
    this.gameOverCard.addChild(shadow);

    // Main Card Border
    const cardBorder = new Graphics();
    const borderGrad = new FillGradient({
      start: { x: 0, y: -cardH / 2 },
      end: { x: 0, y: cardH / 2 },
      colorStops: [
        { offset: 0, color: 0xffb74d },
        { offset: 1, color: 0xf57c00 },
      ],
    });
    cardBorder
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({ fill: borderGrad })
      .stroke({ color: 0xffea00, width: 2.5 });
    this.gameOverCard.addChild(cardBorder);

    // Cream Card Face
    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.gameOverCard.addChild(cardFace);

    // Title Ribbon
    const ribbonW = 220;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbonShadow = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x4a000a });
    this.gameOverCard.addChild(ribbonShadow);

    const ribbon = new Graphics();
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0xff4d4d },
        { offset: 1, color: 0xcc0000 },
      ],
    });
    ribbon
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xffe6e6, width: 2 });
    this.gameOverCard.addChild(ribbon);

    const title = new Text({
      text: "TRÒ CHƠI KẾT THÚC",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 16,
        fill: 0xffffff,
        align: "center",
      }),
    });
    title.anchor.set(0.5);
    title.position.set(0, ribbonY);
    this.gameOverCard.addChild(title);

    // Golden Emblem Graphic
    this.emblemG = new Graphics()
      .circle(0, 0, 36)
      .fill({ color: 0x8a4500 }) // outer shadow
      .circle(0, -3, 33)
      .fill({ color: 0xffea00 }) // gold face
      .stroke({ color: 0x8a4500, width: 2 })
      .circle(0, -3, 26)
      .stroke({ color: 0xfff8b3, width: 1.5 });
    // Star inside emblem
    this.emblemG
      .poly([
        0, -17, 4, -7, 14, -7, 6, 0, 9, 10, 0, 4, -9, 10, -6, 0, -14, -7, -4,
        -7,
      ])
      .fill({ color: 0x8a4500 });
    this.emblemG.position.set(0, -70);
    this.gameOverCard.addChild(this.emblemG);

    // Kỷ lục mới banner
    this.newRecordBanner = new Graphics()
      .roundRect(-70, -12, 140, 24, 6)
      .fill({ color: 0xcc0000 })
      .stroke({ color: 0xffea00, width: 1.5 });
    this.newRecordBanner.position.set(0, -20);
    this.gameOverCard.addChild(this.newRecordBanner);

    const bannerText = new Text({
      text: "KỶ LỤC MỚI!",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 14,
        fill: 0xffffff,
        stroke: { color: 0x8a0000, width: 2, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 1,
          alpha: 0.5,
        },
        fontWeight: "900",
        letterSpacing: 3,
        align: "center",
      }),
    });
    bannerText.anchor.set(0.5);
    this.newRecordBanner.addChild(bannerText);

    // Score Text
    this.gameOverScoreText = new Text({
      text: "ĐIỂM SỐ: 0",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 28,
        fill: 0xffea00,
        stroke: { color: 0x1f2937, width: 3, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 2,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.5,
        },
        fontWeight: "900",
        letterSpacing: 4,
      }),
    });
    this.gameOverScoreText.anchor.set(0.5);
    this.gameOverScoreText.position.set(0, 15);
    this.gameOverCard.addChild(this.gameOverScoreText);

    // Message / Highscore Comparison Text
    this.gameOverMsgText = new Text({
      text: "KỶ LỤC CŨ: 0",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 16,
        fill: 0xffffff,
        stroke: { color: 0xc62828, width: 2, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.5,
        },
        fontWeight: "900",
        letterSpacing: 3,
      }),
    });
    this.gameOverMsgText.anchor.set(0.5);
    this.gameOverMsgText.position.set(0, 42);
    this.gameOverCard.addChild(this.gameOverMsgText);

    // Bottom row: Revive, Try Again, Home, Double Score
    this.reviveBtn = this.createIconOnlyButton("📺", 26, async () => {
      if (this.hasRevivedThisRun) {
        await gameAlert("Bạn chỉ có thể hồi sinh 1 lần mỗi lượt chơi!");
        return;
      }
      const success = await AdManager.showRewardedVideo();
      if (success) {
        this.hasRevivedThisRun = true;
        this.resumeAfterRevive();
      }
    });
    this.reviveBtn.position.set(-95, 95);
    this.gameOverCard.addChild(this.reviveBtn);

    // Double Score (x2)
    this.doubleBtn = this.createIconOnlyButton("x2", 26, async () => {
      if (this.hasDoubledThisRun) {
        await gameAlert("Bạn đã nhận nhân đôi điểm số cho lượt này rồi!");
        return;
      }
      const success = await AdManager.showRewardedVideo();
      if (success) {
        this.hasDoubledThisRun = true;
        const oldScore = Math.floor(this.score);
        this.score = this.score * 2;
        const newScore = Math.floor(this.score);

        const stats = getStats();
        if (newScore > stats.highScore) {
          stats.highScore = newScore;
          this.highScore = newScore;
        }
        if (stats.history.length > 0) {
          stats.history[0].score = newScore;
          stats.history.sort((a, b) => b.score - a.score);
        }
        saveStats(stats);

        this.gameOverScoreText.text = `ĐIỂM SỐ: ${newScore} (X2!)`;
        this.highScoreText.text = `KỶ LỤC: ${this.highScore}`;
        this.gameOverMsgText.text = "KỶ LỤC MỚI! HẠNG #1";
        this.doubleBtn.visible = false;
        await gameAlert(
          `🎉 Điểm số đã được nhân đôi từ ${oldScore} lên ${newScore}!`,
        );
      }
    });
    this.doubleBtn.position.set(-32, 95);
    this.gameOverCard.addChild(this.doubleBtn);

    this.restartBtn = this.createIconOnlyButton("🔄", 26, () => {
      this.switchState("PLAYING");
    });
    this.restartBtn.position.set(32, 95);
    this.gameOverCard.addChild(this.restartBtn);

    this.gameOverMenuBtn = this.createIconOnlyButton("🏠", 26, async () => {
      const confirmQuit = await gameConfirm(
        "Bạn có muốn thoát về màn hình chính?",
      );
      if (confirmQuit) {
        this.switchState("MAIN_MENU");
      }
    });
    this.gameOverMenuBtn.position.set(95, 95);
    this.gameOverCard.addChild(this.gameOverMenuBtn);
  }

  resumeAfterRevive() {
    this.isJumping = false;
    this.isDucking = false;
    this.playerVy = 0;

    // Position player a bit above the ground to be safe
    const sh = this.app.screen.height;
    this.playerY = sh * 0.7 - 50;

    // Clean obstacles near the player to prevent instant death
    this.obstacles.forEach((obs) => {
      this.gamePlayContainer.removeChild(obs.sprite);
    });
    this.obstacles = [];
    this.nextSpawnTime = 1.5; // Delay next spawn

    // Give a temporary shield of 120 frames (2 seconds)
    this.shieldTime = 120;

    // Resume state
    this.isReviving = true;
    this.switchState("PLAYING");
    this.isReviving = false;
  }

  spawnDustParticle() {
    if (!this.playerSprite) return;
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);
    const groundLevel = sh * 0.7;

    const dust = new Graphics();
    // Soft golden-brown dust particle
    dust
      .circle(0, 0, 3 + Math.random() * 4)
      .fill({ color: 0xd4af37, alpha: 0.45 });
    dust.x = this.playerSprite.x - 10 * scale;
    dust.y = groundLevel + 12 * scale;
    this.gamePlayContainer.addChild(dust);

    gsap.to(dust, {
      x: dust.x - (30 + Math.random() * 30) * scale,
      y: dust.y - (10 + Math.random() * 15) * scale,
      alpha: 0,
      duration: 0.4 + Math.random() * 0.3,
      ease: "sine.out",
      onComplete: () => {
        if (this.gamePlayContainer.destroyed) return;
        this.gamePlayContainer.removeChild(dust);
        dust.destroy();
      },
    });
  }

  spawnSparkleParticles(x, y) {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);

    for (let i = 0; i < 8; i++) {
      const sparkle = new Graphics();
      sparkle.circle(0, 0, 2 + Math.random() * 3).fill({ color: 0xffea00 });
      sparkle.x = x;
      sparkle.y = y;
      this.gamePlayContainer.addChild(sparkle);

      const angle = Math.random() * Math.PI * 2;
      const distance = (30 + Math.random() * 40) * scale;

      gsap.to(sparkle, {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 0.5,
        ease: "quad.out",
        onComplete: () => {
          if (this.gamePlayContainer.destroyed) return;
          this.gamePlayContainer.removeChild(sparkle);
          sparkle.destroy();
        },
      });
    }
  }

  collectPeanut(obs, index) {
    audio.playCollect();
    this.score += 10;
    this.spawnSparkleParticles(obs.sprite.x, obs.sprite.y);
    this.gamePlayContainer.removeChild(obs.sprite);
    this.obstacles.splice(index, 1);
  }

  setupCharSelectUI() {
    this.charSelectBackdrop = new Graphics();
    this.charSelectContainer.addChild(this.charSelectBackdrop);

    this.charSelectCard = new Container();
    this.charSelectContainer.addChild(this.charSelectCard);

    const cardW = 460;
    const cardH = 540;

    // 3D Shadow Base
    const shadow = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c });
    this.charSelectCard.addChild(shadow);

    // Main Card Border
    const cardBorder = new Graphics();
    const borderGrad = new FillGradient({
      start: { x: 0, y: -cardH / 2 },
      end: { x: 0, y: cardH / 2 },
      colorStops: [
        { offset: 0, color: 0xffb74d },
        { offset: 1, color: 0xf57c00 },
      ],
    });
    cardBorder
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({ fill: borderGrad })
      .stroke({ color: 0xffea00, width: 2.5 });
    this.charSelectCard.addChild(cardBorder);

    // Cream Card Face
    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.charSelectCard.addChild(cardFace);

    // Title Ribbon
    const ribbonShadow = new Graphics()
      .roundRect(-120, -cardH / 2 - 21 + 4, 240, 42, 10)
      .fill({ color: 0x0d47a1 });
    this.charSelectCard.addChild(ribbonShadow);

    const ribbon = new Graphics();
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0x64b5f6 },
        { offset: 1, color: 0x1976d2 },
      ],
    });
    ribbon
      .roundRect(-120, -cardH / 2 - 21, 240, 42, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xe3f2fd, width: 2 });
    this.charSelectCard.addChild(ribbon);

    const title = new Text({
      text: "CHỌN NHÂN VẬT",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 18,
        fill: 0xffffff,
        align: "center",
      }),
    });
    title.anchor.set(0.5);
    title.position.set(0, -cardH / 2);
    this.charSelectCard.addChild(title);

    // Top-right close button
    const closeBtn = this.createIconOnlyButton("❌", 20, () => {
      this.switchState("MAIN_MENU");
    });
    closeBtn.position.set(cardW / 2 - 20, -cardH / 2 + 20);
    this.charSelectCard.addChild(closeBtn);

    // Grid Container
    this.charGridContainer = new Container();
    this.charSelectCard.addChild(this.charGridContainer);

    // Pagination Row
    this.charPrevBtn = this.createIconOnlyButton("◀️", 18, () => {
      if (this.charSelectPage > 0) {
        this.charSelectPage--;
        this.updateCharSelectDisplay();
      }
    });
    this.charPrevBtn.position.set(-80, 190);
    this.charSelectCard.addChild(this.charPrevBtn);

    this.charPageText = new Text({
      text: "TRANG 1/4",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 14,
        fontWeight: "bold",
        fill: "#37474f",
      }),
    });
    this.charPageText.anchor.set(0.5);
    this.charPageText.position.set(0, 190);
    this.charSelectCard.addChild(this.charPageText);

    this.charNextBtn = this.createIconOnlyButton("▶️", 18, () => {
      if (this.charSelectPage < 3) {
        this.charSelectPage++;
        this.updateCharSelectDisplay();
      }
    });
    this.charNextBtn.position.set(80, 190);
    this.charSelectCard.addChild(this.charNextBtn);
  }

  setupInstructionsUI() {
    this.instructionsBackdrop = new Graphics();
    this.instructionsContainer.addChild(this.instructionsBackdrop);

    this.instructionsCard = new Container();
    this.instructionsContainer.addChild(this.instructionsCard);

    const cardW = 340;
    const cardH = 300;

    // 1. Card Shadow
    const cardShadow = new Graphics()
      .roundRect(-cardW / 2 + 6, -cardH / 2 + 12, cardW, cardH, 20)
      .fill({ color: 0x000000, alpha: 0.25 });
    this.instructionsCard.addChild(cardShadow);

    // 2. Purple 3D Border
    const borderBg = new Graphics()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c })
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({
        fill: new FillGradient({
          start: { x: 0, y: -cardH / 2 },
          end: { x: 0, y: cardH / 2 },
          colorStops: [
            { offset: 0, color: 0xffb74d },
            { offset: 1, color: 0xf57c00 },
          ],
        }),
      })
      .stroke({ color: 0xffea00, width: 2.5 });
    this.instructionsCard.addChild(borderBg);

    // 3. Bright Cream Card Face
    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xffffff });
    this.instructionsCard.addChild(cardFace);

    // 4. Floating 3D Title Ribbon (Orange/Yellow gradient)
    const ribbonW = 210;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbonShadow = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x8a4500 });
    this.instructionsCard.addChild(ribbonShadow);

    const ribbon = new Graphics();
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0xffe500 },
        { offset: 1, color: 0xff9900 },
      ],
    });
    ribbon
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xfff8b3, width: 2 });
    this.instructionsCard.addChild(ribbon);

    const titleText = new Text({
      text: "HƯỚNG DẪN CHƠI",
      style: new TextStyle({
        fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: "bold",
      }),
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, ribbonY);
    this.instructionsCard.addChild(titleText);

    // Instructions Lines
    const textStyle = new TextStyle({
      fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
      fontSize: 13,
      fontWeight: "bold",
      fill: "#37474f",
    });

    const lines = [
      "🏃‍♂️ LÊN / CHẠM: Nhảy qua đá & gai",
      "🦅 XUỐNG / VUỐT XUỐNG: Cúi đầu né chim bay",
      "🥜 THU THẬP: Nhặt hạt Lạc để tăng điểm",
      "🛡️ GIÁP: Nhặt khiên xanh để chắn va chạm",
    ];

    lines.forEach((line, idx) => {
      const lineText = new Text({ text: line, style: textStyle });
      lineText.anchor.set(0.5);
      lineText.position.set(0, -50 + idx * 30);
      this.instructionsCard.addChild(lineText);
    });

    // Bottom Action button: "ĐÃ HIỂU"
    const understandBtn = this.create3DButton("ĐÃ HIỂU", 160, 38, () => {
      this.switchState("MAIN_MENU");
    });
    understandBtn.position.set(0, 85);
    this.instructionsCard.addChild(understandBtn);
  }

  updateCharSelectDisplay() {
    this.charGridContainer.removeChildren();

    const itemsPerPage = 12;
    const startIndex = this.charSelectPage * itemsPerPage;
    const currentAvatar =
      window.selectedAvatarUrl ||
      "/assest/image/imagebldp/001_avatar_laclac.png";

    // Pad avatar file list
    const avatarList = [];
    const avatarNames = [
      "laclac",
      "cat_lick1",
      "duck",
      "turtle",
      "long",
      "horse",
      "tiguawhite",
      "husky",
      "doremonk",
      "echxanh1",
      "nudaeng",
      "hubcat",
      "unicorn",
      "zongbadou",
      "dauLan",
      "banhtung",
      "tiguayel",
      "megachard",
      "gigaboy",
      "cloudball",
      "culama",
      "poolpanda",
      "trollvn",
      "heothy",
      "zolype",
      "crick",
      "penguine",
      "timao",
      "caocal",
      "cowboy",
      "ninjadog",
      "petrocat",
      "richmonkey",
      "hazagi",
      "dogoin",
      "watermelon",
      "timone",
      "ronaldo",
      "hustmouse",
      "hitbear",
      "echxanh2",
      "zolype2",
      "cat_lick2",
      "poolpanda2",
    ];

    for (let i = 0; i < 44; i++) {
      const idxStr = String(i + 1).padStart(3, "0");
      avatarList.push({
        url: `/assest/image/imagebldp/${idxStr}_avatar_${avatarNames[i]}.png`,
        name: avatarNames[i].toUpperCase(),
      });
    }

    this.charPageText.text = `TRANG ${this.charSelectPage + 1}/4`;

    const cols = 4;
    const colGap = 90;
    const rowGap = 90;
    const startX = -135;
    const startY = -110;

    for (let idx = 0; idx < itemsPerPage; idx++) {
      const itemIdx = startIndex + idx;
      if (itemIdx >= avatarList.length) break;

      const item = avatarList[itemIdx];
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const xx = startX + col * colGap;
      const yy = startY + row * rowGap;

      const itemContainer = new Container();
      itemContainer.position.set(xx, yy);
      this.charGridContainer.addChild(itemContainer);

      // Selected highlight border
      const isSelected = item.url === currentAvatar;
      const border = new Graphics();
      if (isSelected) {
        border
          .circle(0, 0, 34)
          .fill({ color: 0xfff3cd })
          .stroke({ color: 0xffea00, width: 3 });
      } else {
        border
          .circle(0, 0, 32)
          .fill({ color: 0xffffff })
          .stroke({ color: 0xdfdac0, width: 1.5 });
      }
      itemContainer.addChild(border);

      // Avatar Sprite
      const spriteContainer = new Container();
      itemContainer.addChild(spriteContainer);

      Assets.load(item.url)
        .then((tex) => {
          if (spriteContainer.destroyed) return;
          const sp = new Sprite(tex);
          sp.anchor.set(0.5);
          const crop = this.getAvatarCrop(item.url, 30);
          sp.width = crop.size;
          sp.height = crop.size;
          sp.y = crop.y;

          const mask = new Graphics().circle(0, 0, 30).fill(0xffffff);
          sp.mask = mask;
          spriteContainer.addChild(sp);
          spriteContainer.addChild(mask);
        })
        .catch((e) =>
          console.warn("Failed to load select avatar:", item.url, e),
        );

      // Make interactive
      itemContainer.eventMode = "static";
      itemContainer.cursor = "pointer";
      itemContainer.on("pointertap", () => {
        window.selectedAvatarUrl = item.url;
        window.localStorage.setItem("selected_avatar_url", item.url);

        // Update gameplay player head sprite texture and colors
        Assets.load(item.url).then((tex) => {
          this.updateSkeletalRigTexture(tex, item.url);
          this.playerColors = this.getAvatarColors(item.url);
        });

        this.updateUserUI();

        audio.playClick();
        this.updateCharSelectDisplay();
      });

      // Hover animations
      itemContainer.on("pointerover", () => {
        gsap.to(itemContainer.scale, { x: 1.08, y: 1.08, duration: 0.1 });
      });
      itemContainer.on("pointerout", () => {
        gsap.to(itemContainer.scale, { x: 1.0, y: 1.0, duration: 0.1 });
      });
    }
  }

  switchState(newState) {
    if (this.gameState === "GAME_OVER" && newState !== "GAME_OVER") {
      audio.stopGameOver();
      audio.syncMuteState();
    }

    const isResuming = newState === "PLAYING" && this.gameState === "PAUSED";
    const isRestarting =
      newState === "PLAYING" && this.gameState === "GAME_OVER";

    this.gameState = newState;

    this.mainMenuContainer.visible =
      newState === "MAIN_MENU" ||
      newState === "SETTINGS" ||
      newState === "CHAR_SELECT" ||
      newState === "INSTRUCTIONS";
    this.gamePlayContainer.visible =
      newState === "PLAYING" ||
      newState === "PAUSED" ||
      newState === "GAME_OVER";
    this.gameOverContainer.visible = newState === "GAME_OVER";
    this.achievementsContainer.visible = newState === "ACHIEVEMENTS";
    this.settingsContainer.visible = newState === "SETTINGS";
    this.pauseContainer.visible = newState === "PAUSED";
    this.charSelectContainer.visible = newState === "CHAR_SELECT";
    this.instructionsContainer.visible = newState === "INSTRUCTIONS";

    // Hide or show the user profile widget depending on state to prevent overlapping during gameplay
    const profileWidget = document.getElementById("user-profile");
    if (profileWidget) {
      if (newState === "PLAYING" || newState === "PAUSED") {
        profileWidget.style.display = "none";
      } else {
        const savedUser = window.localStorage.getItem("google_user");
        if (savedUser) {
          profileWidget.style.display = "flex";
        }
      }
    }

    if (newState === "PLAYING") {
      // Only increment defeat count and potentially show interstitial if this is a true restart (not a revive)
      if (isRestarting && !this.isReviving) {
        this.defeatCount = (this.defeatCount || 0) + 1;
        if (this.defeatCount >= 3) {
          this.defeatCount = 0;
          AdManager.showInterstitial().then(() => {
            this.resetGame();
          });
          return;
        }
      }

      if (!isResuming && !this.isReviving) {
        this.resetGame();
      }
    } else if (newState === "ACHIEVEMENTS") {
      this.updateAchievementsDisplay();
    } else if (newState === "SETTINGS") {
      if (this.mainMusicRow) this.mainMusicRow.updateVisuals();
      if (this.mainSfxRow) this.mainSfxRow.updateVisuals();
    } else if (newState === "PAUSED") {
      if (this.pauseMusicRow) this.pauseMusicRow.updateVisuals();
      if (this.pauseSfxRow) this.pauseSfxRow.updateVisuals();
    } else if (newState === "CHAR_SELECT") {
      this.updateCharSelectDisplay();
    }

    this.resize();
  }

  resetGame() {
    audio.syncMuteState();
    audio.stopGameOver();
    this.score = 0;
    this.speed = 6;
    this.gameTime = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isDucking = false;
    this.lastMilestoneScore = 0;

    // Reset tracking flags
    this.hasRevivedThisRun = false;
    this.hasDoubledThisRun = false;
    this.shieldTime = 0;

    // Clean obstacles
    this.obstacles.forEach((obs) =>
      this.gamePlayContainer.removeChild(obs.sprite),
    );
    this.obstacles = [];
    this.nextSpawnTime = 1.0; // Spawn first obstacle after 1s
  }

  update(ticker) {
    const elapsed = ticker.deltaTime;
    const sw = this.app.screen.width;

    // Background clouds drift
    this.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed * elapsed;
      if (cloud.x + cloud.w < 0) {
        cloud.x = sw + 50;
        cloud.y = 50 + Math.random() * 150;
      }
    });

    // Parallax Mountain Scrolling
    if (this.gameState === "PLAYING") {
      this.distX = (this.distX || 0) + 0.05 * elapsed;
      this.midX = (this.midX || 0) + 0.2 * elapsed;
      this.closeX = (this.closeX || 0) + 0.6 * elapsed;

      this.distantMountains.x = -(this.distX % sw);
      this.midMountains.x = -(this.midX % sw);
      this.closeMountains.x = -(this.closeX % sw);
    }

    if (this.gameState === "PLAYING") {
      this.updateGameplay(elapsed);
    }
  }

  updateGameplay(elapsed) {
    this.gameTime += elapsed / 60; // elapsed is around 1 per frame (60fps)

    // Gradual speed ramping
    this.speed = 6 + this.gameTime * 0.15;
    if (this.speed > 13) this.speed = 13;

    // Score increments
    this.score += 0.15 * elapsed;
    const currentIntScore = Math.floor(this.score);
    this.scoreText.text = `ĐIỂM: ${currentIntScore}`;

    // Play milestone sound every 100 points
    if (
      currentIntScore > 0 &&
      currentIntScore % 100 === 0 &&
      currentIntScore > this.lastMilestoneScore
    ) {
      audio.playMilestone();
      this.lastMilestoneScore = currentIntScore;
    }

    // Apply gravity
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);
    const groundLevel = sh * 0.7;

    if (this.isJumping) {
      this.playerVy += this.gravity * elapsed;
      this.playerY += this.playerVy * elapsed;

      if (this.playerY >= groundLevel) {
        this.playerY = groundLevel;
        this.playerVy = 0;
        this.isJumping = false;
      }
    }

    // Position player and animate legs
    if (this.playerSprite) {
      this.playerSprite.position.set(sw * 0.2, this.playerY);

      // Update running/jumping/ducking animations for the 2D cartoon character
      if (!this.isJumping && !this.isDucking && this.gameState === "PLAYING") {
        this.runTime = (this.runTime || 0) + elapsed * this.speed * 0.05;

        // Bounce the head vertically with a subtle active bob, keeping it upright
        const bob = Math.abs(Math.sin(this.runTime)) * 3;
        this.playerHead.y = -72 + bob; // Shifted up 10px
        this.playerHead.rotation = Math.sin(this.runTime) * 0.03;

        this.updatePlayerBody(this.playerBody, -46); // Shifted up 10px
        this.updatePlayerLeg(
          this.leftLeg,
          -10,
          -32,
          this.runTime,
          false,
          false,
        ); // Adjusted for longer legs
        this.updatePlayerLeg(
          this.rightLeg,
          10,
          -32,
          this.runTime + Math.PI,
          false,
          false,
        );
        this.updatePlayerArm(
          this.leftArm,
          -16,
          -46,
          this.runTime,
          false,
          false,
        ); // Shifted up 10px
        this.updatePlayerArm(
          this.rightArm,
          16,
          -46,
          this.runTime + Math.PI,
          false,
          false,
        );

        // Running dust particles
        this.dustTimer = (this.dustTimer || 0) + elapsed;
        if (this.dustTimer >= 8) {
          this.dustTimer = 0;
          this.spawnDustParticle();
        }
      } else if (this.isJumping) {
        this.playerHead.y = -72;
        this.playerHead.rotation = 0; // head straight in the air

        this.updatePlayerBody(this.playerBody, -46);
        this.updatePlayerLeg(this.leftLeg, -10, -32, 0, true, false);
        this.updatePlayerLeg(this.rightLeg, 10, -32, 0, true, false);
        this.updatePlayerArm(this.leftArm, -16, -46, 0, true, false);
        this.updatePlayerArm(this.rightArm, 16, -46, 0, true, false);
      } else if (this.isDucking) {
        this.playerHead.y = -58; // Shifted up 10px from -48
        this.playerHead.rotation = 0;

        this.updatePlayerBody(this.playerBody, -36); // Shifted body up relatively
        this.updatePlayerLeg(this.leftLeg, -10, -22, 0, false, true);
        this.updatePlayerLeg(this.rightLeg, 10, -22, 0, false, true);
        this.updatePlayerArm(this.leftArm, -16, -36, 0, false, true);
        this.updatePlayerArm(this.rightArm, 16, -36, 0, false, true);
      } else {
        // Idle
        this.playerHead.y = -72;
        this.playerHead.rotation = 0;

        this.updatePlayerBody(this.playerBody, -46);
        this.updatePlayerLeg(this.leftLeg, -10, -32, 0, false, false);
        this.updatePlayerLeg(this.rightLeg, 10, -32, 0, false, false);
        this.updatePlayerArm(this.leftArm, -16, -46, 0, false, false);
        this.updatePlayerArm(this.rightArm, 16, -46, 0, false, false);
      }

      // Adjust player scale based on jumping/ducking (squash vertically for ducking)
      if (this.isDucking) {
        this.playerSprite.scale.set(scale * 0.95, scale * 0.45);
      } else {
        this.playerSprite.scale.set(scale * 0.95);
      }

      // Update shield overlay (centered around middle of body at y = -35)
      if (this.shieldTime > 0) {
        this.shieldTime -= elapsed;
        this.playerShieldGraphics.visible = true;
        this.playerShieldGraphics.clear();
        const pulseRadius = 40 + Math.sin(this.gameTime * 15) * 5;
        this.playerShieldGraphics
          .circle(0, -28, pulseRadius)
          .fill({ color: 0x64b5f6, alpha: 0.15 })
          .stroke({ width: 2, color: 0x00ffff, alpha: 0.6 });
      } else {
        this.playerShieldGraphics.visible = false;
      }
    }

    // Spawn obstacles
    this.nextSpawnTime -= elapsed / 60;
    if (this.nextSpawnTime <= 0) {
      this.spawnObstacle();
      this.nextSpawnTime = 1.3 + Math.random() * 1.5 - this.speed * 0.05;
      if (this.nextSpawnTime < 0.9) this.nextSpawnTime = 0.9;
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.sprite.x -= this.speed * elapsed;

      if (obs.type === 3 && obs.baseY) {
        // Bobbing peanut collectible
        obs.bobTimer = (obs.bobTimer || 0) + elapsed * 0.1;
        obs.sprite.y = obs.baseY + Math.sin(obs.bobTimer) * 8 * scale;
      } else if (obs.type === 2 && obs.sprite.children.length > 0) {
        // Spinning flying slipper
        obs.sprite.children[0].rotation -= 0.15 * elapsed;
      }

      // Check collision
      if (this.checkCollision(obs)) {
        if (obs.type === 3) {
          this.collectPeanut(obs, i);
          continue;
        } else {
          if (this.shieldTime > 0) {
            // Invulnerable: break obstacle!
            this.spawnSparkleParticles(obs.sprite.x, obs.sprite.y);
            this.gamePlayContainer.removeChild(obs.sprite);
            this.obstacles.splice(i, 1);
            continue;
          } else {
            this.handleGameOver();
            return;
          }
        }
      }

      // Remove out of screen obstacles
      if (obs.sprite.x + obs.width < 0) {
        this.gamePlayContainer.removeChild(obs.sprite);
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnObstacle() {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);
    const groundLevel = sh * 0.7;

    // Obstacle/Item types: 0 (Stone), 1 (Spikes), 2 (Flying Bird), 3 (Peanut)
    let type = Math.floor(Math.random() * 4);

    // Flying obstacles only appear after 100 points
    if (this.score < 100 && type === 2) {
      type = Math.floor(Math.random() * 2); // 0 or 1
    }

    const container = new Container();

    let spawnY = groundLevel;
    let width = 44 * scale;
    let height = 45 * scale;
    let baseY = groundLevel;

    if (type === 0) {
      // Stone -> Car Tire (lopxeoto)
      const sprite = Sprite.from(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
      );
      sprite.width = 75 * scale;
      sprite.height = 75 * scale;
      sprite.anchor.set(0.5, 1);
      sprite.y = 10 * scale; // sink into ground a bit
      container.addChild(sprite);
    } else if (type === 1) {
      // Spikes -> Wooden Fence
      const sprite = Sprite.from(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
      );
      sprite.width = 100 * scale;
      sprite.height = 75 * scale;
      sprite.anchor.set(0.5, 1);
      sprite.y = 10 * scale; // sink into ground a bit
      container.addChild(sprite);
    } else if (type === 2) {
      // Flying Bird -> Slipper
      // Randomize height:
      // High: groundLevel - 130 * scale (must duck, jumping hits it)
      // Low: groundLevel - 85 * scale (can duck or jump)
      const isHighSlipper = Math.random() > 0.5;
      spawnY = groundLevel - (isHighSlipper ? 130 : 85) * scale;
      width = 50 * scale;
      height = 40 * scale;

      const sprite = Sprite.from(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
      );
      sprite.width = 65 * scale;
      sprite.height = 65 * scale;
      sprite.anchor.set(0.5, 0.5);
      container.addChild(sprite);

      // SFX for bird spawn
      audio.playBird();

      // Wing animation is drawn in updateGameplay but we use GSAP or ignore it for sprite
      gsap.to(sprite, {
        y: -10 * scale,
        yoyo: true,
        repeat: -1,
        duration: 0.4,
        ease: "sine.inOut",
      });
    } else if (type === 3) {
      // Peanut collectible!
      spawnY =
        Math.random() > 0.5
          ? groundLevel - 18 * scale
          : groundLevel - 72 * scale;
      baseY = spawnY;
      width = 36 * scale;
      height = 20 * scale;

      const sprite = Sprite.from(
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
      );
      sprite.width = 60 * scale;
      sprite.height = 60 * scale;
      sprite.anchor.set(0.5, 0.5);
      container.addChild(sprite);
    }

    container.position.set(sw + 50, spawnY);
    this.gamePlayContainer.addChild(container);

    this.obstacles.push({
      sprite: container, // compatibility field name
      type: type,
      wingTimer: 0,
      graphics: null,
      width: width,
      height: height,
      baseY: baseY,
      bobTimer: Math.random() * Math.PI,
    });
  }

  checkCollision(obs) {
    if (!this.playerSprite) return false;

    const pBounds = this.playerSprite.getBounds();
    const oBounds = obs.sprite.getBounds();

    // Pad collision boundaries (forgiving collision feel)
    // Reduce player width by 20% on each side, height by 10%
    const px1 = pBounds.x + pBounds.width * 0.2;
    const px2 = pBounds.x + pBounds.width * 0.8;
    const py1 = pBounds.y + pBounds.height * 0.1;
    const py2 = pBounds.y + pBounds.height * 0.95;

    // Reduce obstacle width/height by 15%
    const ox1 = oBounds.x + oBounds.width * 0.15;
    const ox2 = oBounds.x + oBounds.width * 0.85;
    const oy1 = oBounds.y + oBounds.height * 0.15;
    const oy2 = oBounds.y + oBounds.height * 0.85;

    // AABB intersection check (correct PixiJS coordinate y-down layout)
    return px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1;
  }

  handleGameOver() {
    audio.playCollision();
    audio.playGameOver();

    const finalScore = Math.floor(this.score);
    this.gameOverScoreText.text = `ĐIỂM SỐ: ${finalScore}`;

    // Save stats
    const stats = getStats();
    let isNewRecord = false;
    if (finalScore > stats.highScore) {
      stats.highScore = finalScore;
      this.highScore = finalScore;
      isNewRecord = true;
    }

    // Append to top 10 history
    const date = new Date();
    const dateStr = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
    stats.history.push({ score: finalScore, date: dateStr });
    // Sort descending by score, limit to top 10
    stats.history.sort((a, b) => b.score - a.score);
    stats.history = stats.history.slice(0, 10);

    saveStats(stats);

    if (isNewRecord) {
      this.gameOverMsgText.text = "👑 KỶ LỤC MỚI CỦA BỘ LẠC! 👑";
      this.gameOverMsgText.style.fill = 0xffea00;
    } else {
      this.gameOverMsgText.text = "Bạn đã va phải chướng ngại vật!";
      this.gameOverMsgText.style.fill = 0xffecb3;
    }

    this.switchState("GAME_OVER");
  }

  updateAchievementsDisplay() {
    // Clear old list items
    this.leadersContainer.removeChildren();

    const data = getLeaderboardData();
    const startY = -120;
    const rowHeight = 44;

    // Draw top 6 entries
    for (let i = 0; i < 6; i++) {
      const entry = data[i];
      if (!entry) break;

      const ry = startY + i * rowHeight;

      // Row Background rounded rectangle
      const rowBg = new Graphics();
      const isEven = i % 2 === 0;
      let bgColor = isEven ? 0xfffcf0 : 0xf2eedb;
      let strokeColor = 0xdcd6bf;
      let strokeWidth = 1;

      if (i === 0) {
        bgColor = 0xfff8e1; // Gold highlight
        strokeColor = 0xffa500;
        strokeWidth = 2;
      } else if (i === 1) {
        bgColor = 0xf5f5f5; // Silver highlight
        strokeColor = 0xa0aab5;
        strokeWidth = 2;
      } else if (i === 2) {
        bgColor = 0xfff3e0; // Bronze highlight
        strokeColor = 0xcf7936;
        strokeWidth = 2;
      }

      rowBg
        .roundRect(-225, ry - 18, 450, 36, 6)
        .fill({ color: bgColor })
        .stroke({ color: strokeColor, width: strokeWidth });
      this.leadersContainer.addChild(rowBg);

      // Rank Medal or Text
      const rankMedals = ["🥇", "🥈", "🥉"];
      const isTop3 = i < 3;
      const rankText = new Text({
        text: rankMedals[i] || `${i + 1}`,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: isTop3 ? 22 : 14,
          fill: "#263238",
        }),
      });
      rankText.anchor.set(0.5);
      rankText.position.set(-170, ry);
      this.leadersContainer.addChild(rankText);

      // Avatar
      const avatarContainer = new Container();
      avatarContainer.position.set(-120, ry);
      this.leadersContainer.addChild(avatarContainer);

      const avatarBg = new Graphics()
        .circle(0, 0, 14)
        .fill({ color: 0xffffff })
        .stroke({ color: 0xd4af37, width: 1.5 });
      avatarContainer.addChild(avatarBg);

      Assets.load(entry.avatar)
        .then((tex) => {
          if (avatarContainer.destroyed) return;
          const sp = new Sprite(tex);
          sp.anchor.set(0.5);
          sp.width = 28;
          sp.height = 28;

          const mask = new Graphics().circle(0, 0, 14).fill(0xffffff);
          sp.mask = mask;
          avatarContainer.addChild(sp);
          avatarContainer.addChild(mask);
        })
        .catch((e) =>
          console.warn("Failed to load leaderboard avatar:", entry.avatar, e),
        );

      // Name text
      const nameText = new Text({
        text: entry.name,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: 13,
          fontWeight: "bold",
          fill: entry.isPlayer ? "#e53935" : "#263238",
        }),
      });
      nameText.anchor.set(0, 0.5);
      nameText.position.set(-90, ry);
      this.leadersContainer.addChild(nameText);

      // Score text
      const scoreText = new Text({
        text: `${entry.score}`,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: 13,
          fontWeight: "900",
          fill: "#263238",
        }),
      });
      scoreText.anchor.set(1, 0.5);
      scoreText.position.set(160, ry);
      this.leadersContainer.addChild(scoreText);
    }

    // Render Pinned Personal Best Footer
    this.footerBg.clear();
    this.footerContainer.removeChildren();

    this.footerBg
      .roundRect(-225, 143, 450, 44, 8)
      .fill({ color: 0xfff3cd })
      .stroke({ color: 0xffea00, width: 2 });

    const playerEntry = data.find((e) => e.isPlayer);
    const playerRank = data.findIndex((e) => e.isPlayer) + 1;

    if (playerEntry) {
      const ry = 165;

      const isTop3 = playerRank <= 3;
      const rankText = new Text({
        text: isTop3 ? ["🥇", "🥈", "🥉"][playerRank - 1] : `${playerRank}`,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: isTop3 ? 22 : 14,
          fill: "#263238",
        }),
      });
      rankText.anchor.set(0.5);
      rankText.position.set(-170, ry);
      this.footerContainer.addChild(rankText);

      // Avatar
      const avatarContainer = new Container();
      avatarContainer.position.set(-120, ry);
      this.footerContainer.addChild(avatarContainer);

      const avatarBg = new Graphics()
        .circle(0, 0, 14)
        .fill({ color: 0xffffff })
        .stroke({ color: 0xd4af37, width: 1.5 });
      avatarContainer.addChild(avatarBg);

      Assets.load(playerEntry.avatar)
        .then((tex) => {
          if (avatarContainer.destroyed) return;
          const sp = new Sprite(tex);
          sp.anchor.set(0.5);
          sp.width = 28;
          sp.height = 28;

          const mask = new Graphics().circle(0, 0, 14).fill(0xffffff);
          sp.mask = mask;
          avatarContainer.addChild(sp);
          avatarContainer.addChild(mask);
        })
        .catch((e) =>
          console.warn("Failed to load footer avatar:", playerEntry.avatar, e),
        );

      const nameText = new Text({
        text: `${playerEntry.name} (Bạn)`,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: 13,
          fontWeight: "bold",
          fill: "#e53935",
        }),
      });
      nameText.anchor.set(0, 0.5);
      nameText.position.set(-90, ry);
      this.footerContainer.addChild(nameText);

      const scoreText = new Text({
        text: `${playerEntry.score}`,
        style: new TextStyle({
          fontFamily: '"Outfit", "Nunito", "Arial", sans-serif',
          fontSize: 13,
          fontWeight: "900",
          fill: "#263238",
        }),
      });
      scoreText.anchor.set(1, 0.5);
      scoreText.position.set(160, ry);
      this.footerContainer.addChild(scoreText);
    }
  }

  resize() {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;

    // Draw bright and happy daylight sky gradient
    const bgGrad = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: sw, y: sh },
      colorStops: [
        { offset: 0, color: 0xb3e5fc }, // Bright cyan sky
        { offset: 1, color: 0xe1f5fe }, // Warm sun-kissed horizon
      ],
    });
    this.bgOverlay.clear().rect(0, 0, sw, sh).fill(bgGrad);

    // Redraw and scale fluffy white cartoon clouds
    this.clouds.forEach((cloud) => {
      cloud.clear();
      cloud.beginPath();
      // Friendly white border and solid white-translucent fill
      cloud.setStrokeStyle({ width: 1.5, color: 0xffffff, alpha: 0.95 });
      cloud.fill({ color: 0xffffff, alpha: 0.8 });

      const ch = cloud.h;
      const cw = cloud.w;
      cloud
        .circle(0, 0, ch * 0.5)
        .fill()
        .stroke();
      cloud
        .circle(-cw * 0.25, ch * 0.1, ch * 0.35)
        .fill()
        .stroke();
      cloud
        .circle(cw * 0.25, ch * 0.1, ch * 0.35)
        .fill()
        .stroke();
      cloud
        .moveTo(-cw * 0.5, ch * 0.22)
        .lineTo(cw * 0.5, ch * 0.22)
        .stroke();
      cloud
        .moveTo(-cw * 0.35, ch * 0.38)
        .bezierCurveTo(
          -cw * 0.15,
          ch * 0.45,
          cw * 0.15,
          ch * 0.45,
          cw * 0.35,
          ch * 0.38,
        )
        .stroke();
    });

    const groundLevel = sh * 0.7;

    // Parallax Mountain Rendering (Vietnamese Mountains)
    const drawMountainRange = (
      graphics,
      heights,
      color,
      alpha,
      maxPeakHeight,
    ) => {
      graphics.clear();

      graphics.beginPath();
      graphics.moveTo(0, groundLevel);

      const numPoints = heights.length;
      const dx = sw / (numPoints - 1);

      // Draw first range (from 0 to sw)
      for (let i = 0; i < numPoints; i++) {
        const x = i * dx;
        const peakY = groundLevel - heights[i] * maxPeakHeight;
        if (i === 0) {
          graphics.lineTo(x, peakY);
        } else {
          const prevX = (i - 1) * dx;
          const prevPeakY = groundLevel - heights[i - 1] * maxPeakHeight;
          graphics.bezierCurveTo(
            prevX + dx * 0.5,
            prevPeakY,
            x - dx * 0.5,
            peakY,
            x,
            peakY,
          );
        }
      }

      // Draw second range (from sw to sw * 2) for seamless wrapping
      for (let i = 0; i < numPoints; i++) {
        const x = sw + i * dx;
        const peakY = groundLevel - heights[i] * maxPeakHeight;
        const prevX = sw + (i - 1) * dx;
        const prevPeakY = groundLevel - heights[i - 1] * maxPeakHeight;
        graphics.bezierCurveTo(
          prevX + dx * 0.5,
          prevPeakY,
          x - dx * 0.5,
          peakY,
          x,
          peakY,
        );
      }

      graphics.lineTo(sw * 2, groundLevel);
      graphics.closePath();
      graphics.fill({ color, alpha });
    };

    // Draw the 3 layers of Ha Long style limestone mountains
    const distHeights = [
      0.35, 0.55, 0.28, 0.48, 0.2, 0.38, 0.28, 0.48, 0.22, 0.35,
    ];
    const midHeights = [
      0.22, 0.38, 0.16, 0.42, 0.26, 0.34, 0.22, 0.38, 0.18, 0.25,
    ];
    const closeHeights = [
      0.12, 0.24, 0.08, 0.28, 0.14, 0.2, 0.12, 0.22, 0.1, 0.16,
    ];

    drawMountainRange(
      this.distantMountains,
      distHeights,
      0xb0bec5, // Soft pastel blue/lavender
      0.65,
      sh * 0.45,
    );
    drawMountainRange(
      this.midMountains,
      midHeights,
      0x81c784, // Cheerful mint green
      0.8,
      sh * 0.32,
    );
    drawMountainRange(
      this.closeMountains,
      closeHeights,
      0x4caf50, // Bright grassy green
      1.0,
      sh * 0.22,
    );

    // Solid Ground Base (Dirt and Grass)
    this.bgOverlay
      .rect(0, groundLevel, sw, sh - groundLevel)
      .fill({ color: 0x8d6e63 });
    this.bgOverlay.rect(0, groundLevel, sw, 12).fill({ color: 0x4caf50 });

    // Cheerful green ground outlines
    this.bgOverlay.save();
    this.bgOverlay.setStrokeStyle({ width: 2.0, color: 0x388e3c, alpha: 0.45 });
    this.bgOverlay.moveTo(0, groundLevel).lineTo(sw, groundLevel).stroke();

    // Traditional lacquer wave details below ground
    const waveHeight = 8;
    const waveLength = 36;
    const yBase = groundLevel + 12;
    this.bgOverlay.setStrokeStyle({ width: 1.5, color: 0x5d4037, alpha: 0.25 });
    for (let x = -waveLength; x < sw + waveLength; x += waveLength) {
      this.bgOverlay
        .moveTo(x, yBase)
        .bezierCurveTo(
          x + waveLength * 0.25,
          yBase - waveHeight,
          x + waveLength * 0.75,
          yBase - waveHeight,
          x + waveLength,
          yBase,
        )
        .stroke();
    }
    this.bgOverlay.restore();

    const scale = Math.min(1.0, sw / 450, sh / 650);

    // Adjust player base Y
    if (!this.isJumping) {
      this.playerY = groundLevel;
    }

    // ==========================================
    // Resize MAIN MENU
    // ==========================================
    if (this.gameState === "MAIN_MENU") {
      this.menuMascotFrame.position.set(sw / 2, sh * 0.18);
      this.menuMascotFrame.scale.set(scale);

      // Make sure the mascot sprite texture is updated with the current avatar on load/change
      const activeAvatar =
        window.localStorage.getItem("selected_avatar_url") ||
        "/assest/image/imagebldp/001_avatar_laclac.png";
      Assets.load(activeAvatar)
        .then((tex) => {
          if (!this.menuMascotSprite.destroyed) {
            this.menuMascotSprite.texture = tex;
          }
        })
        .catch(() => {});

      this.menuTitleText.style.fontSize = Math.max(
        22,
        Math.min(38, 38 * scale),
      );
      this.menuTitleText.style.wordWrapWidth = sw * 0.9;
      this.menuTitleText.position.set(sw / 2, sh * 0.32);

      this.menuSubtitleText.style.fontSize = Math.max(
        8.5,
        Math.min(12, 12 * scale),
      );
      this.menuSubtitleText.style.wordWrapWidth = sw * 0.9;
      this.menuSubtitleText.position.set(sw / 2, sh * 0.38);

      this.menuHighScoreText.style.fontSize = Math.max(
        11,
        Math.min(15, 15 * scale),
      );
      this.menuHighScoreText.position.set(sw / 2, sh * 0.44);

      const playY = Math.max(sh * 0.44 + 70 * scale, sh * 0.56);
      this.playBtn.position.set(sw / 2, playY);
      this.playBtn.scale.set(scale);

      // Push bottom sub-buttons down to fill space but keep safe distance
      const buttonsY = Math.max(playY + 90 * scale, sh * 0.8);

      this.achievementsBtn.position.set(sw / 2 - 105 * scale, buttonsY);
      this.achievementsBtn.scale.set(scale);

      this.charSelectBtn.position.set(sw / 2 - 35 * scale, buttonsY);
      this.charSelectBtn.scale.set(scale);

      this.instructionsBtn.position.set(sw / 2 + 35 * scale, buttonsY);
      this.instructionsBtn.scale.set(scale);

      this.settingsBtn.position.set(sw / 2 + 105 * scale, buttonsY);
      this.settingsBtn.scale.set(scale);
    }

    // ==========================================
    // Resize GAMEPLAY
    // ==========================================
    if (this.gameState === "PLAYING") {
      this.scoreText.style.fontSize = Math.max(16, Math.min(22, 22 * scale));
      this.scoreText.position.set(25 * scale, 75 * scale);

      this.highScoreText.style.fontSize = Math.max(
        12,
        Math.min(16, 16 * scale),
      );
      this.highScoreText.position.set(sw - 25 * scale, 75 * scale);

      this.pauseBtn.position.set(sw - 35 * scale, 35 * scale);
      this.pauseBtn.scale.set(scale);
    }

    // ==========================================
    // Resize GAME OVER
    // ==========================================
    if (this.gameState === "GAME_OVER") {
      this.gameOverBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.gameOverCard.position.set(sw / 2, sh / 2);
      this.gameOverCard.scale.set(scale);
    }

    // ==========================================
    // Resize PAUSED
    // ==========================================
    if (this.gameState === "PAUSED") {
      this.pauseBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.pauseCard.position.set(sw / 2, sh / 2);
      this.pauseCard.scale.set(scale);
    }

    // ==========================================
    // Resize ACHIEVEMENTS
    // ==========================================
    if (this.gameState === "ACHIEVEMENTS") {
      this.leaderboardCard.position.set(sw / 2, sh / 2);
      this.leaderboardCard.scale.set(scale);
    }

    if (this.gameState === "SETTINGS") {
      this.settingsBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.settingsCard.position.set(sw / 2, sh / 2);
      this.settingsCard.scale.set(scale);
    }

    if (this.gameState === "CHAR_SELECT") {
      this.charSelectBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.charSelectCard.position.set(sw / 2, sh / 2);
      this.charSelectCard.scale.set(scale);
    }

    if (this.gameState === "INSTRUCTIONS") {
      this.instructionsBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.instructionsCard.position.set(sw / 2, sh / 2);
      this.instructionsCard.scale.set(scale);
    }
  }

  initDOMOverlays() {
    // Connect keyboard events for player controls
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        if (this.gameState === "PLAYING") {
          this.switchState("PAUSED");
        } else if (this.gameState === "PAUSED") {
          this.gameState = "PLAYING";
          this.switchState("PLAYING");
        }
        return;
      }

      if (this.gameState !== "PLAYING") return;

      if (e.key === "ArrowUp" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        this.jump();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!this.isDucking) audio.playSlide();
        this.isDucking = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.gameState !== "PLAYING") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.isDucking = false;
      }
    });

    // Touch/pointer screen tap/swipe controls for 1-handed Mobile play
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.touchStartY = 0;
    this.isSwiping = false;

    this.app.stage.on("pointerdown", (e) => {
      if (this.gameState === "PLAYING") {
        this.touchStartY = e.global.y;
        this.isSwiping = true;
      }
    });

    this.app.stage.on("pointermove", (e) => {
      if (this.gameState === "PLAYING" && this.isSwiping) {
        const dy = e.global.y - this.touchStartY;
        if (dy > 30) {
          // Swipe down: Duck
          if (!this.isDucking) audio.playSlide();
          this.isDucking = true;
          this.isSwiping = false;
        } else if (dy < -30) {
          // Swipe up: Jump
          this.jump();
          this.isSwiping = false;
        }
      }
    });

    this.app.stage.on("pointerup", () => {
      if (this.gameState === "PLAYING") {
        if (this.isSwiping) {
          // Tap without swiping: Default to Jump
          this.jump();
        }
        this.isDucking = false;
        this.isSwiping = false;
      }
    });
    this.app.stage.on("pointerupoutside", () => {
      if (this.gameState === "PLAYING") {
        this.isDucking = false;
        this.isSwiping = false;
      }
    });
  }

  jump() {
    if (!this.isJumping && !this.isDucking) {
      this.isJumping = true;
      this.playerVy = this.jumpForce;
      audio.playJump();
    }
  }

  updateUserUI() {
    // Load stats for current user
    this.highScore = getStats().highScore;
    this.highScoreText.text = `KỶ LỤC: ${this.highScore}`;

    // Re-draw achievements list if open
    if (this.gameState === "ACHIEVEMENTS") {
      this.updateAchievementsDisplay();
    }
  }
}
