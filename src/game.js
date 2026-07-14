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
          background: #FFF8E1;
          border: 5px solid #F9A825;
          box-shadow: inset 0 0 0 2.5px #FFF59D, 0 6px 0 #F57F17, 0 12px 25px rgba(0, 0, 0, 0.35);
          border-radius: 20px;
          padding: 28px 24px;
          width: 85%; max-width: 340px;
          text-align: center;
          transform: scale(0.85);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Be Vietnam Pro', sans-serif;
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
    this.isAdShowing = false;

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
        fontFamily: "Baloo 2",
        fontSize: Math.min(18, height * 0.45),
        fill: "#ffffff",
        fontWeight: "900",
        stroke: { color: "#4E342E", width: 3.5 },
        align: "center",
      }),
      roundPixels: true,
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
      "⏯️": "continue_btn",
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
          fontFamily: "Baloo 2",
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

      // Preload obstacles and collectibles (multi-asset expansion)
      const assetPaths = [
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HinhNomBuNhin.png",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/bluetable.png",
      ];
      for (const path of assetPaths) {
        await Assets.load(path);
      }

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
        fontFamily: "Baloo 2",
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
      roundPixels: true,
    });
    this.menuTitleText.anchor.set(0.5);
    this.mainMenuContainer.addChild(this.menuTitleText);

    this.menuSubtitleText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 12,
        fill: "#F9A825",

        fontWeight: "bold",
        letterSpacing: 1.5,
        wordWrap: true,
        wordWrapWidth: 400,
        align: "center",
      }),
      roundPixels: true,
    });
    this.menuSubtitleText.anchor.set(0.5);
    this.mainMenuContainer.addChild(this.menuSubtitleText);

    // 🏆 KỶ LỤC ĐIỂM
    this.menuHighScoreText = new Text({
      text: `🏆 KỶ LỤC ĐIỂM: ${this.highScore}`,
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 28,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 3, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 3,
          alpha: 0.3,
        },
        fontWeight: "900",
        letterSpacing: 6,
      }),
      roundPixels: true,
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
        fontFamily: "Baloo 2",
        fontSize: 28,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 3, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 2,
          angle: Math.PI / 2,
          distance: 2,
          alpha: 0.4,
        },
        fontWeight: "900",
        letterSpacing: 6,
      }),
      roundPixels: true,
    });
    this.scoreText.anchor.set(0, 0.5);
    this.gamePlayContainer.addChild(this.scoreText);

    this.highScoreText = new Text({
      text: "KỶ LỤC: 0",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 18,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 3, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.3,
        },
        fontWeight: "900",
        letterSpacing: 4,
      }),
      roundPixels: true,
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

    const cardW = 460;
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

    // 2. Floating 3D Title Ribbon (Orange/Yellow gradient)
    const ribbonShadow = new Graphics()
      .roundRect(-120, -cardH / 2 - 21 + 4, 240, 42, 10)
      .fill({ color: 0x8a4500 });
    this.leaderboardCard.addChild(ribbonShadow);

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
      .roundRect(-120, -cardH / 2 - 21, 240, 42, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xfff8b3, width: 2 });
    this.leaderboardCard.addChild(ribbon);

    const titleText = new Text({
      text: "BẢNG VÀNG",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 20,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
        align: "center",
      }),
      roundPixels: true,
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, -cardH / 2);
    this.leaderboardCard.addChild(titleText);

    // 3. Header Labels
    const headerStyle = new TextStyle({
      fontFamily: "Baloo 2",
      fontSize: 13,
      fontWeight: "900",
      fill: "#ffffff",
      stroke: { color: "#F9A825", width: 3, join: "round" },
    });
    const lblRank = new Text({
      text: "HẠNG",
      style: headerStyle,
      roundPixels: true,
    });
    lblRank.anchor.set(0.5);
    lblRank.position.set(-170, -155);
    this.leaderboardCard.addChild(lblRank);

    const lblMember = new Text({
      text: "THÀNH VIÊN",
      style: headerStyle,
      roundPixels: true,
    });
    lblMember.anchor.set(0, 0.5);
    lblMember.position.set(-90, -155);
    this.leaderboardCard.addChild(lblMember);

    const lblScore = new Text({
      text: "KỶ LỤC",
      style: headerStyle,
      roundPixels: true,
    });
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
    const rowBg = new Graphics();
    row.addChild(rowBg);

    // Left label (enlarged cartoon text matching the style of the confirmation modal in image 2)
    const label = new Text({
      text: labelText, // No toUpperCase() to show case exactly as passed
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 22,
        fill: "#4E342E",
        fontWeight: "700",
        stroke: { color: "#ffffff", width: 0.6 }, // Thin white outline to make diacritics pop
      }),
    });
    label.roundPixels = true; // Set roundPixels explicitly on the instance
    label.anchor.set(0, 0.5);
    row.addChild(label);

    const trackTexOn = Assets.get("toggle_on");
    const trackTexOff = Assets.get("toggle_off");

    const track = new Sprite(getState() ? trackTexOff : trackTexOn);
    track.anchor.set(0.5);
    track.eventMode = "static";
    track.cursor = "pointer";
    row.addChild(track);

    const dots = new Graphics();
    row.addChild(dots);

    // Dynamic layout update to adjust dimensions instead of scaling
    row.updateLayout = (isMobile) => {
      row.isMobileLayout = isMobile;
      const rowW = isMobile ? 300 : 410;
      const rowH = isMobile ? 54 : 64;
      const fontSize = isMobile ? 18 : 22;

      label.style.fontSize = fontSize;
      label.onViewUpdate(); // Force texture rebuild and boundary calculation immediately!

      rowBg
        .clear()
        .roundRect(-rowW / 2, -rowH / 2, rowW, rowH, 15)
        .fill({ color: 0xffffff })
        .stroke({ color: 0xddeaff, width: 3 });

      const labelX = isMobile ? -130 : -180;
      label.position.set(Math.round(labelX), 0);

      track.width = isMobile ? 64 : 76;
      track.height = isMobile ? 40 : 48;
      const trackX = isMobile ? 110 : 145;
      track.position.set(trackX, 0);

      dots.clear();
      const startX = labelX + label.width + 10;
      const endX = trackX - track.width / 2 - 10;
      if (startX < endX) {
        dots.beginPath();
        for (let dx = startX; dx <= endX; dx += 8) {
          dots.circle(dx, 0, 1.5);
        }
        dots.fill({ color: 0xccccdd });
      }
    };

    // Initialize with desktop layout by default
    row.updateLayout(false);

    const handleToggle = () => {
      audio.playCollect(); // Or click sound
      const isMuted = onToggle();
      track.texture = isMuted ? trackTexOff : trackTexOn;
      // Re-apply correct dimensions
      if (row.isMobileLayout) {
        track.width = 64;
        track.height = 40;
      } else {
        track.width = 76;
        track.height = 48;
      }
    };

    row.updateVisuals = () => {
      track.texture = getState() ? trackTexOff : trackTexOn;
      if (row.isMobileLayout) {
        track.width = 64;
        track.height = 40;
      } else {
        track.width = 76;
        track.height = 48;
      }
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

    // 3D Shadow Base
    this.settingsShadow = new Graphics();
    this.settingsCard.addChild(this.settingsShadow);

    // Main Card Border
    this.settingsBorder = new Graphics();
    this.settingsCard.addChild(this.settingsBorder);

    // Cream Card Face
    this.settingsFace = new Graphics();
    this.settingsCard.addChild(this.settingsFace);

    // Title Ribbon Shadow
    this.settingsRibbonShadow = new Graphics();
    this.settingsCard.addChild(this.settingsRibbonShadow);

    // Title Ribbon Graphic
    this.settingsRibbon = new Graphics();
    this.settingsCard.addChild(this.settingsRibbon);

    this.settingsTitle = new Text({
      text: "CÀI ĐẶT",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 22,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
        align: "center",
      }),
      roundPixels: true,
    });
    this.settingsTitle.anchor.set(0.5);
    this.settingsCard.addChild(this.settingsTitle);

    // Close Button (X) on top-right
    this.settingsCloseBtn = this.createIconOnlyButton("❌", 20, () => {
      this.switchState("MAIN_MENU");
    });
    this.settingsCard.addChild(this.settingsCloseBtn);

    // Music row
    this.mainMusicRow = this.createToggleRow(
      "🎵 Nhạc nền",
      -75,
      () => audio.musicMuted,
      () => {
        audio.toggleMusicMute();
        return audio.musicMuted;
      },
    );
    this.settingsCard.addChild(this.mainMusicRow);

    // SFX row
    this.mainSfxRow = this.createToggleRow(
      "🔊 Hiệu ứng",
      0,
      () => audio.sfxMuted,
      () => {
        audio.toggleSfxMute();
        return audio.sfxMuted;
      },
    );
    this.settingsCard.addChild(this.mainSfxRow);

    // Reset button
    this.settingsResetBtn = this.create3DButton(
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
          this.switchState("MAIN_MENU");
        }
      },
    );
    this.settingsCard.addChild(this.settingsResetBtn);

    this.settingsVersionText = new Text({
      text: "Phiên bản: 1.0.0",
      style: {
        fontFamily: "Baloo 2",
        fontSize: 12,
        fill: "#FFECB3",
      },
      roundPixels: true,
    });
    this.settingsVersionText.anchor.set(0.5);
    this.settingsCard.addChild(this.settingsVersionText);
  }

  setupPauseUI() {
    this.pauseBackdrop = new Graphics();
    this.pauseContainer.addChild(this.pauseBackdrop);

    this.pauseCard = new Container();
    this.pauseContainer.addChild(this.pauseCard);

    const cardW = 460;
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
    const ribbonW = 240;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbon = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x8a4500 }) // Ribbon shadow
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
      .fill({
        fill: new FillGradient({
          start: { x: 0, y: ribbonY - ribbonH / 2 },
          end: { x: 0, y: ribbonY + ribbonH / 2 },
          colorStops: [
            { offset: 0, color: 0xffe500 },
            { offset: 1, color: 0xff9900 },
          ],
        }),
      })
      .stroke({ color: 0xfff8b3, width: 2 });
    this.pauseCard.addChild(ribbon);

    // Title text inside ribbon
    const titleText = new Text({
      text: "CÀI ĐẶT",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 22,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
      }),
      roundPixels: true,
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, ribbonY);
    this.pauseCard.addChild(titleText);

    // Music row
    this.pauseMusicRow = this.createToggleRow(
      "🎵 Nhạc nền",
      -70,
      () => audio.musicMuted,
      () => {
        audio.toggleMusicMute();
        return audio.musicMuted;
      },
    );
    this.pauseCard.addChild(this.pauseMusicRow);

    // SFX row
    this.pauseSfxRow = this.createToggleRow(
      "🔊 Hiệu ứng",
      5,
      () => audio.sfxMuted,
      () => {
        audio.toggleSfxMute();
        return audio.sfxMuted;
      },
    );
    this.pauseCard.addChild(this.pauseSfxRow);

    // Bottom buttons row: Home, Replay, Resume
    const btnHome = this.createIconOnlyButton("🏠", 26, () => {
      this.switchState("MAIN_MENU");
    });
    btnHome.position.set(-65, 80);
    this.pauseCard.addChild(btnHome);

    const btnReplay = this.createIconOnlyButton("🔄", 26, () => {
      // Temporarily set gameState to PLAYING before switchState so that isResuming is false
      // and it triggers resetGame()
      this.gameState = "PLAYING";
      this.switchState("PLAYING");
    });
    btnReplay.position.set(0, 80);
    this.pauseCard.addChild(btnReplay);

    const btnResume = this.createIconOnlyButton("⏯️", 26, () => {
      // Calls switchState while gameState is PAUSED...
      this.switchState("PLAYING");
    });
    btnResume.position.set(65, 80);
    this.pauseCard.addChild(btnResume);
  }

  setupGameOverUI() {
    this.gameOverBackdrop = new Graphics();
    this.gameOverContainer.addChild(this.gameOverBackdrop);

    this.gameOverCard = new Container();
    this.gameOverContainer.addChild(this.gameOverCard);

    const cardW = 460;
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
    const ribbonW = 240;
    const ribbonH = 42;
    const ribbonY = -cardH / 2;
    const ribbonShadow = new Graphics()
      .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2 + 4, ribbonW, ribbonH, 10)
      .fill({ color: 0x8a4500 });
    this.gameOverCard.addChild(ribbonShadow);

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
    this.gameOverCard.addChild(ribbon);

    const title = new Text({
      text: "TRÒ CHƠI KẾT THÚC",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 20,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
        align: "center",
      }),
      roundPixels: true,
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
        fontFamily: "Baloo 2",
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
      roundPixels: true,
    });
    bannerText.anchor.set(0.5);
    this.newRecordBanner.addChild(bannerText);

    // Score Text
    this.gameOverScoreText = new Text({
      text: "ĐIỂM SỐ: 0",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 28,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 3, join: "round" },
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
      roundPixels: true,
    });
    this.gameOverScoreText.anchor.set(0.5);
    this.gameOverScoreText.position.set(0, 15);
    this.gameOverCard.addChild(this.gameOverScoreText);

    // Message / Highscore Comparison Text
    this.gameOverMsgText = new Text({
      text: "KỶ LỤC CŨ: 0",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 16,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffffff, offset: 0 },
            { color: 0xffe066, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 2, join: "round" },
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
      roundPixels: true,
    });
    this.gameOverMsgText.anchor.set(0.5);
    this.gameOverMsgText.position.set(0, 42);
    this.gameOverCard.addChild(this.gameOverMsgText);

    // Bottom row: Revive, Try Again, Home, Double Score
    this.reviveBtn = this.createIconOnlyButton("📺", 26, async () => {
      if (this.hasRevivedThisRun) {
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
        return;
      }
      const success = await AdManager.showRewardedVideo();
      if (success) {
        this.hasDoubledThisRun = true;
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
      }
    });
    this.doubleBtn.position.set(-32, 95);
    this.gameOverCard.addChild(this.doubleBtn);

    this.restartBtn = this.createIconOnlyButton("🔄", 26, () => {
      this.switchState("PLAYING");
    });
    this.restartBtn.position.set(32, 95);
    this.gameOverCard.addChild(this.restartBtn);

    this.gameOverMenuBtn = this.createIconOnlyButton("🏠", 26, () => {
      this.switchState("MAIN_MENU");
    });
    this.gameOverMenuBtn.position.set(95, 95);
    this.gameOverCard.addChild(this.gameOverMenuBtn);
  }

  resumeAfterRevive() {
    audio.stopGameOver();
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

    this.dustPool = this.dustPool || [];
    let dust;
    if (this.dustPool.length > 0) {
      dust = this.dustPool.pop();
      dust.alpha = 1;
    } else {
      dust = new Graphics();
      dust
        .circle(0, 0, 3 + Math.random() * 4)
        .fill({ color: 0xd4af37, alpha: 0.45 });
    }

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
        this.dustPool.push(dust);
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
    this.spawnFloatingText("+10", obs.sprite.x, obs.sprite.y);
    this.gamePlayContainer.removeChild(obs.sprite);
    obs.sprite.destroy({ children: true });
    this.obstacles.splice(index, 1);
  }

  spawnFloatingText(text, x, y) {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);

    const floatText = new Text({
      text: text,
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 24,
        fontWeight: "900",
        fill: 0xffea00, // Gold yellow
        stroke: { color: 0x5d4037, width: 4 }, // Dark brown stroke
        align: "center",
      }),
      resolution: 3,
    });
    floatText.anchor.set(0.5);
    floatText.position.set(x, y - 20 * scale);
    floatText.scale.set(scale);
    this.gamePlayContainer.addChild(floatText);

    // Float upwards and fade out
    gsap.to(floatText, {
      y: floatText.y - 60 * scale,
      alpha: 0,
      duration: 0.8,
      ease: "power1.out",
      onComplete: () => {
        this.gamePlayContainer.removeChild(floatText);
        floatText.destroy();
      },
    });
  }

  setupCharSelectUI() {
    this.charSelectBackdrop = new Graphics();
    this.charSelectContainer.addChild(this.charSelectBackdrop);

    this.charSelectCard = new Container();
    this.charSelectContainer.addChild(this.charSelectCard);

    // Card background graphics (redrawn dynamically in _layoutCharSelectCard)
    this.charCardShadow = new Graphics();
    this.charSelectCard.addChild(this.charCardShadow);

    this.charCardBorder = new Graphics();
    this.charSelectCard.addChild(this.charCardBorder);

    this.charCardFace = new Graphics();
    this.charSelectCard.addChild(this.charCardFace);

    this.charRibbonShadow = new Graphics();
    this.charSelectCard.addChild(this.charRibbonShadow);

    this.charRibbon = new Graphics();
    this.charSelectCard.addChild(this.charRibbon);

    this.charTitle = new Text({
      text: "CHỌN NHÂN VẬT",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 22,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
        align: "center",
      }),
      roundPixels: true,
    });
    this.charTitle.anchor.set(0.5);
    this.charSelectCard.addChild(this.charTitle);

    // Top-right close button
    this.charCloseBtn = this.createIconOnlyButton("❌", 20, () => {
      this.switchState("MAIN_MENU");
    });
    this.charSelectCard.addChild(this.charCloseBtn);

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
    this.charSelectCard.addChild(this.charPrevBtn);

    this.charPageText = new Text({
      text: "TRANG 1/4",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 18,
        fontWeight: "900",
        fill: "#F57F17",
        letterSpacing: 1.5,
      }),
      roundPixels: true,
    });
    this.charPageText.anchor.set(0.5);
    this.charSelectCard.addChild(this.charPageText);

    this.charNextBtn = this.createIconOnlyButton("▶️", 18, () => {
      if (this.charSelectPage < 3) {
        this.charSelectPage++;
        this.updateCharSelectDisplay();
      }
    });
    this.charSelectCard.addChild(this.charNextBtn);

    // Store current layout state (updated by _layoutCharSelectCard)
    this._charCardW = 460;
    this._charCardH = 440;
    this._charCols = 4;
  }

  /** Redraw character select card graphics for current screen dimensions */
  _layoutCharSelectCard(sw, sh) {
    const isMobile = sw < 500 || sh < 650;
    const cols = isMobile ? 3 : 4;
    const cardW = isMobile ? 380 : 460;
    const cardH = isMobile ? 500 : 440;

    this._charCardW = cardW;
    this._charCardH = cardH;
    this._charCols = cols;

    // Redraw shadow
    this.charCardShadow
      .clear()
      .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
      .fill({ color: 0xbf360c });

    // Redraw border with gradient
    const borderGrad = new FillGradient({
      start: { x: 0, y: -cardH / 2 },
      end: { x: 0, y: cardH / 2 },
      colorStops: [
        { offset: 0, color: 0xffb74d },
        { offset: 1, color: 0xf57c00 },
      ],
    });
    this.charCardBorder
      .clear()
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
      .fill({ fill: borderGrad })
      .stroke({ color: 0xffea00, width: 2.5 });

    // Redraw cream face
    this.charCardFace
      .clear()
      .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
      .fill({ color: 0xfbfaf5 });

    // Redraw ribbon shadow
    this.charRibbonShadow
      .clear()
      .roundRect(-120, -cardH / 2 - 21 + 4, 240, 42, 10)
      .fill({ color: 0x8a4500 });

    // Redraw ribbon with gradient
    const ribbonGrad = new FillGradient({
      start: { x: 0, y: -21 },
      end: { x: 0, y: 21 },
      colorStops: [
        { offset: 0, color: 0xffe500 },
        { offset: 1, color: 0xff9900 },
      ],
    });
    this.charRibbon
      .clear()
      .roundRect(-120, -cardH / 2 - 21, 240, 42, 10)
      .fill({ fill: ribbonGrad })
      .stroke({ color: 0xfff8b3, width: 2 });

    // Reposition title and close button
    this.charTitle.position.set(0, -cardH / 2);
    this.charCloseBtn.position.set(cardW / 2 - 20, -cardH / 2 + 20);

    // Reposition pagination at bottom of card
    const paginationY = cardH / 2 - 40;
    this.charPrevBtn.position.set(-80, paginationY);
    this.charPageText.position.set(0, paginationY);
    this.charNextBtn.position.set(80, paginationY);
  }

  setupInstructionsUI() {
    this.instructionsBackdrop = new Graphics();
    this.instructionsBackdrop.eventMode = "static";
    this.instructionsBackdrop.on("pointerdown", (e) => e.stopPropagation());
    this.instructionsContainer.addChild(this.instructionsBackdrop);

    this.instructionsCard = new Container();
    this.instructionsContainer.addChild(this.instructionsCard);

    // Member graphics properties for dynamic redraws in resize()
    this.instructionsShadow = new Graphics();
    this.instructionsBorder = new Graphics();
    this.instructionsFace = new Graphics();
    this.instructionsRibbonShadow = new Graphics();
    this.instructionsRibbon = new Graphics();

    this.instructionsCard.addChild(this.instructionsShadow);
    this.instructionsCard.addChild(this.instructionsBorder);
    this.instructionsCard.addChild(this.instructionsFace);
    this.instructionsCard.addChild(this.instructionsRibbonShadow);
    this.instructionsCard.addChild(this.instructionsRibbon);

    this.instructionsTitle = new Text({
      text: "HƯỚNG DẪN CHƠI",
      style: new TextStyle({
        fontFamily: "Baloo 2",
        fontSize: 22,
        fontWeight: "900",
        fill: 0xffffff,
        letterSpacing: 2,
        align: "center",
      }),
      roundPixels: true,
    });
    this.instructionsTitle.anchor.set(0.5);
    this.instructionsCard.addChild(this.instructionsTitle);

    // Column 1: Tránh Né (Left column)
    const leftItems = [
      { label: "Lốp xe (Nhảy né)", sprite: "prop_lopxe" },
      { label: "Hàng rào (Nhảy né)", sprite: "prop_hangrao" },
      { label: "Bàn nhựa (Nhảy né)", sprite: "prop_bluetable" },
      { label: "Bù nhìn (Nhảy né)", sprite: "prop_bunhin" },
      { label: "Dép tổ ong (Cúi né)", sprite: "prop_deptoong" },
      { label: "Ghế đỏ bay (Cúi né)", sprite: "prop_redchair" },
    ];

    // Column 2: Vật phẩm & Khiên (Right column)
    const rightItems = [
      { label: "Bánh Chưng (+Điểm)", sprite: "prop_banhchung" },
      { label: "Bánh Mì (+Điểm)", sprite: "prop_banhmi" },
      { label: "Nước Ngọt (+Điểm)", sprite: "prop_reddrink" },
      { label: "Khiên Bất Tử (2 giây)", sprite: "shield" },
    ];

    const createGridRows = (itemsData) => {
      return itemsData.map((data) => {
        const row = new Container();
        this.instructionsCard.addChild(row);

        row.iconBg = new Graphics();
        row.addChild(row.iconBg);

        if (data.sprite === "shield") {
          row.sprite = new Graphics();
          row.addChild(row.sprite);
        } else {
          row.sprite = Sprite.from(data.sprite);
          row.sprite.anchor.set(0.5);
          row.addChild(row.sprite);
        }

        row.labelText = new Text({
          text: data.label,
          style: new TextStyle({
            fontFamily: "Baloo 2",
            fontWeight: "800",
            fontSize: 13,
            fill: 0x3e2723, // Warm dark brown
          }),
          roundPixels: true,
        });
        row.labelText.anchor.set(0, 0.5);
        row.addChild(row.labelText);

        return row;
      });
    };

    this.leftRows = createGridRows(leftItems);
    this.rightRows = createGridRows(rightItems);

    // Bottom Action button: "ĐÃ HIỂU"
    this.instructionsUnderstandBtn = this.create3DButton(
      "ĐÃ HIỂU",
      160,
      38,
      () => {
        this.switchState("MAIN_MENU");
      },
    );
    this.instructionsCard.addChild(this.instructionsUnderstandBtn);
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

    const cols = this._charCols || 4;
    const isMobile3Col = cols === 3;
    const colGap = isMobile3Col ? 100 : 90;
    const rowGap = isMobile3Col ? 80 : 90;
    const gridW = (cols - 1) * colGap;
    const startX = -gridW / 2;
    const startY = isMobile3Col ? -120 : -90;

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
    this.gameOverContainer.visible = false;
    this.achievementsContainer.visible = false;
    this.settingsContainer.visible = false;
    this.pauseContainer.visible = false;
    this.charSelectContainer.visible = false;
    this.instructionsContainer.visible = false;

    // Toggle HTML Overlays
    const hudOverlay = document.getElementById("game-hud-overlay");
    const menuOverlay = document.getElementById("game-menu-overlay");

    if (hudOverlay) {
      hudOverlay.style.display =
        newState === "PLAYING" || newState === "PAUSED" ? "block" : "none";
    }

    if (menuOverlay) {
      menuOverlay.style.display = newState === "MAIN_MENU" ? "flex" : "none";
    }

    this.syncDOMScoreAndHighScore();

    if (newState === "SETTINGS") {
      this.showHTMLSettings();
    } else {
      this.hideHTMLSettings();
    }

    if (newState === "PAUSED") {
      this.showHTMLPaused();
    } else {
      this.hideHTMLPaused();
    }

    if (newState === "GAME_OVER") {
      this.showHTMLGameOver();
    } else {
      this.hideHTMLGameOver();
    }

    if (newState === "REVIVE_OFFER") {
      this.showHTMLReviveOffer(
        async () => {
          const success = await AdManager.showRewardedVideo();
          if (success) {
            this.hasRevivedThisRun = true;
            this.hideHTMLReviveOffer();
            this.resumeAfterRevive();
          } else {
            this.switchState("GAME_OVER");
          }
        },
        () => {
          this.switchState("GAME_OVER");
        },
      );
    } else {
      this.hideHTMLReviveOffer();
    }

    if (newState === "ACHIEVEMENTS") {
      this.showHTMLAchievements();
    } else {
      this.hideHTMLAchievements();
    }

    if (newState === "CHAR_SELECT") {
      this.showHTMLCharSelect();
    } else {
      this.hideHTMLCharSelect();
    }

    if (newState === "INSTRUCTIONS") {
      this.showHTMLInstructions();
    } else {
      this.hideHTMLInstructions();
    }

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
          this.isAdShowing = true;
          this.resetGame();
          // Hide HUD during ad
          if (hudOverlay) hudOverlay.style.display = "none";
          AdManager.showInterstitial().then(() => {
            this.isAdShowing = false;
            // Show HUD again
            if (hudOverlay) hudOverlay.style.display = "block";
            this.syncDOMScoreAndHighScore();
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

    if (this.gameState === "PLAYING" && !this.isAdShowing) {
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
    if (currentIntScore !== this.lastIntScore) {
      this.lastIntScore = currentIntScore;
      this.scoreText.text = `ĐIỂM: ${currentIntScore}`;
      const domScore = document.getElementById("hud-score");
      if (domScore) {
        domScore.innerText = `ĐIỂM: ${currentIntScore}`;
      }
    }

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
      // Update shield overlay (centered around middle of body at y = -35)
      if (this.shieldTime > 0) {
        this.shieldTime -= elapsed;
        this.playerShieldGraphics.visible = true;
        const pulseScale = 1.0 + Math.sin(this.gameTime * 15) * 0.125;
        this.playerShieldGraphics.scale.set(pulseScale);
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
        // Bobbing point items
        obs.bobTimer = (obs.bobTimer || 0) + elapsed * 0.12;
        obs.sprite.y = obs.baseY + Math.sin(obs.bobTimer) * 12 * scale;

        // Spin the inner sprite gently
        if (obs.sprite.children.length > 0) {
          obs.sprite.children[0].rotation += 0.03 * elapsed;
        }

        // Pulse the parent container scale instead of the inner sprite (preserving its width/height)
        const scalePulse = 1.0 + Math.sin(obs.bobTimer * 2) * 0.08;
        obs.sprite.scale.set(scalePulse);
      } else if (
        obs.type === 2 &&
        obs.isSlipper &&
        obs.sprite.children.length > 0
      ) {
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
            obs.sprite.destroy({ children: true });
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
        obs.sprite.destroy({ children: true });
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnObstacle() {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);
    const groundLevel = sh * 0.7;

    // Obstacle/Item types: 0 (Ground set A), 1 (Ground set B), 2 (Flying), 3 (Collectible)
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
    let isSlipper = false;

    if (type === 0) {
      // Ground Set A: Tires and fences
      const choices = [
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
          w: 75,
          h: 75,
          yOffset: 10,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
          w: 100,
          h: 75,
          yOffset: 10,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];
      const sprite = Sprite.from(selected.path);
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
      sprite.anchor.set(0.5, 1);
      sprite.y = selected.yOffset * scale;
      container.addChild(sprite);

      width = selected.w * scale;
      height = selected.h * scale;
    } else if (type === 1) {
      // Ground Set B: Blue tables and scarecrows
      const choices = [
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/bluetable.png",
          w: 85,
          h: 75,
          yOffset: 10,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HinhNomBuNhin.png",
          w: 60,
          h: 85,
          yOffset: 10,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];
      const sprite = Sprite.from(selected.path);
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
      sprite.anchor.set(0.5, 1);
      sprite.y = selected.yOffset * scale;
      container.addChild(sprite);

      width = selected.w * scale;
      height = selected.h * scale;
    } else if (type === 2) {
      // Flying Obstacles: Throwing chairs and slippers
      const choices = [
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.png",
          w: 65,
          h: 65,
          slipper: true,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
          w: 65,
          h: 65,
          slipper: true,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];

      const isHighSlipper = Math.random() > 0.5;
      spawnY = groundLevel - (isHighSlipper ? 130 : 85) * scale;
      width = selected.w * scale;
      height = selected.h * scale;

      const sprite = Sprite.from(selected.path);
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
      sprite.anchor.set(0.5, 0.5);
      container.addChild(sprite);

      // SFX for flying spawn
      audio.playBird();

      if (selected.slipper) {
        isSlipper = true;
      } else {
        // Paper kite bobs gently up/down
        gsap.to(sprite, {
          y: -10 * scale,
          yoyo: true,
          repeat: -1,
          duration: 0.4,
          ease: "sine.inOut",
        });
      }
    } else if (type === 3) {
      // Collectibles: Sticky Rice Cake, Bread, Red Drink bottle
      const choices = [
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
          w: 60,
          h: 60,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.png",
          w: 60,
          h: 60,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.png",
          w: 45,
          h: 70,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];

      spawnY =
        Math.random() > 0.5
          ? groundLevel - 18 * scale
          : groundLevel - 72 * scale;
      baseY = spawnY;
      width = selected.w * scale;
      height = selected.h * scale;

      const sprite = Sprite.from(selected.path);
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
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
      isSlipper: isSlipper,
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
    this.isNewRecordThisRun = isNewRecord;

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

    if (!this.hasRevivedThisRun) {
      this.switchState("REVIVE_OFFER");
    } else {
      this.switchState("GAME_OVER");
    }
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
        .roundRect(-205, ry - 18, 410, 36, 6)
        .fill({ color: bgColor })
        .stroke({ color: strokeColor, width: strokeWidth });
      this.leadersContainer.addChild(rowBg);

      // Rank Medal or Text
      const rankMedals = ["🥇", "🥈", "🥉"];
      const isTop3 = i < 3;
      const rankText = new Text({
        text: rankMedals[i] || `${i + 1}`,
        style: new TextStyle({
          fontFamily: "Baloo 2",
          fontSize: isTop3 ? 22 : 14,
          fill: "#4E342E",
        }),
        roundPixels: true,
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
          fontFamily: "Baloo 2",
          fontSize: 13,
          fontWeight: "bold",
          fill: entry.isPlayer ? "#FBC02D" : "#4E342E",
        }),
        roundPixels: true,
      });
      nameText.anchor.set(0, 0.5);
      nameText.position.set(-90, ry);
      this.leadersContainer.addChild(nameText);

      // Score text
      const scoreText = new Text({
        text: `${entry.score}`,
        style: new TextStyle({
          fontFamily: "Baloo 2",
          fontSize: 13,
          fontWeight: "900",
          fill: "#4E342E",
        }),
        roundPixels: true,
      });
      scoreText.anchor.set(1, 0.5);
      scoreText.position.set(160, ry);
      this.leadersContainer.addChild(scoreText);
    }

    // Render Pinned Personal Best Footer
    this.footerBg.clear();
    this.footerContainer.removeChildren();

    this.footerBg
      .roundRect(-205, 143, 410, 44, 8)
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
          fontFamily: "Baloo 2",
          fontSize: isTop3 ? 22 : 14,
          fill: "#4E342E",
        }),
        roundPixels: true,
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
          fontFamily: "Baloo 2",
          fontSize: 13,
          fontWeight: "bold",
          fill: "#FBC02D",
        }),
        roundPixels: true,
      });
      nameText.anchor.set(0, 0.5);
      nameText.position.set(-90, ry);
      this.footerContainer.addChild(nameText);

      const scoreText = new Text({
        text: `${playerEntry.score}`,
        style: new TextStyle({
          fontFamily: "Baloo 2",
          fontSize: 13,
          fontWeight: "900",
          fill: "#4E342E",
        }),
        roundPixels: true,
      });
      scoreText.anchor.set(1, 0.5);
      scoreText.position.set(160, ry);
      this.footerContainer.addChild(scoreText);
    }
  }

  resize() {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const modalScale = Math.min(1.0, (sw - 32) / 460, (sh - 40) / 600);

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
      this.gameOverCard.position.set(Math.round(sw / 2), Math.round(sh / 2));
      this.gameOverCard.scale.set(modalScale);
    }

    // ==========================================
    // Resize PAUSED
    // ==========================================
    if (this.gameState === "PAUSED") {
      this.pauseBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.pauseCard.position.set(Math.round(sw / 2), Math.round(sh / 2));
      this.pauseCard.scale.set(modalScale);
    }

    // ==========================================
    // Resize ACHIEVEMENTS
    // ==========================================
    if (this.gameState === "ACHIEVEMENTS") {
      this.leaderboardCard.position.set(Math.round(sw / 2), Math.round(sh / 2));
      this.leaderboardCard.scale.set(modalScale);
    }

    if (this.gameState === "SETTINGS") {
      this.settingsBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.settingsCard.position.set(Math.round(sw / 2), Math.round(sh / 2));
      this.settingsCard.scale.set(1); // Keep scale 1!

      // Layout calculations
      const isMobile = sw < 500 || sh < 600;
      const cardW = isMobile ? 340 : 460;
      const cardH = isMobile ? 320 : 300;

      // 1. Redraw Shadow
      this.settingsShadow
        .clear()
        .roundRect(-cardW / 2, -cardH / 2 + 6, cardW, cardH, 20)
        .fill({ color: 0xbf360c });

      // 2. Redraw Border (Gradient)
      const borderGrad = new FillGradient({
        start: { x: 0, y: -cardH / 2 },
        end: { x: 0, y: cardH / 2 },
        colorStops: [
          { offset: 0, color: 0xffb74d },
          { offset: 1, color: 0xf57c00 },
        ],
      });
      this.settingsBorder
        .clear()
        .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
        .fill({ fill: borderGrad })
        .stroke({ color: 0xffea00, width: 2.5 });

      // 3. Redraw Cream Face
      this.settingsFace
        .clear()
        .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
        .fill({ color: 0xfbfaf5 });

      // 4. Ribbon (Title banner)
      const ribbonW = isMobile ? 200 : 240;
      const ribbonH = isMobile ? 38 : 42;
      const ribbonY = -cardH / 2;

      this.settingsRibbonShadow
        .clear()
        .roundRect(
          -ribbonW / 2,
          ribbonY - ribbonH / 2 + 4,
          ribbonW,
          ribbonH,
          10,
        )
        .fill({ color: 0x8a4500 });

      const ribbonGrad = new FillGradient({
        start: { x: 0, y: -ribbonH / 2 },
        end: { x: 0, y: ribbonH / 2 },
        colorStops: [
          { offset: 0, color: 0xffe500 },
          { offset: 1, color: 0xff9900 },
        ],
      });
      this.settingsRibbon
        .clear()
        .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
        .fill({ fill: ribbonGrad })
        .stroke({ color: 0xfff8b3, width: 2 });

      // 5. Title Text Style and position
      this.settingsTitle.style.fontSize = isMobile ? 18 : 22;
      this.settingsTitle.position.set(0, ribbonY);

      // 6. Close Button
      this.settingsCloseBtn.position.set(cardW / 2 - 20, -cardH / 2 + 20);

      // 7. Toggle Rows layout update
      const musicRowY = isMobile ? -65 : -75;
      const sfxRowY = isMobile ? 0 : 0;
      this.mainMusicRow.position.set(0, musicRowY);
      this.mainSfxRow.position.set(0, sfxRowY);

      if (typeof this.mainMusicRow.updateLayout === "function") {
        this.mainMusicRow.updateLayout(isMobile);
      }
      if (typeof this.mainSfxRow.updateLayout === "function") {
        this.mainSfxRow.updateLayout(isMobile);
      }

      // 8. Reset Button
      const resetBtnY = isMobile ? 70 : 80;
      this.settingsResetBtn.position.set(0, resetBtnY);

      // 9. Version Text
      const versionTextY = isMobile ? 120 : 125;
      this.settingsVersionText.position.set(0, versionTextY);
    }

    if (this.gameState === "CHAR_SELECT") {
      this.charSelectBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.charSelectCard.position.set(Math.round(sw / 2), Math.round(sh / 2));

      // Adaptive layout: redraw card and grid for current screen size
      const prevCols = this._charCols;
      this._layoutCharSelectCard(sw, sh);
      const charScale = Math.min(
        1.0,
        (sw - 32) / this._charCardW,
        (sh - 40) / this._charCardH,
      );
      this.charSelectCard.scale.set(charScale);
      // Rebuild grid if column layout changed or first open
      if (
        prevCols !== this._charCols ||
        this.charGridContainer.children.length === 0
      ) {
        this.updateCharSelectDisplay();
      }
    }

    if (this.gameState === "INSTRUCTIONS") {
      this.instructionsBackdrop
        .clear()
        .rect(0, 0, sw, sh)
        .fill({ color: 0x000000, alpha: 0.65 });
      this.instructionsCard.position.set(
        Math.round(sw / 2),
        Math.round(sh / 2),
      );
      this.instructionsCard.scale.set(1); // LOCK SCALE TO 1 for pixel-perfect sharpness!

      const isMobile = sw < 500 || sh < 600;
      const cardW = isMobile ? Math.min(460, sw - 24) : 540;
      const cardH = isMobile ? 420 : 400;

      // 1. Redraw Shadow
      this.instructionsShadow
        .clear()
        .roundRect(-cardW / 2 + 6, -cardH / 2 + 12, cardW, cardH, 20)
        .fill({ color: 0x000000, alpha: 0.25 });

      // 2. Redraw Orange 3D Border
      this.instructionsBorder
        .clear()
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

      // 3. Redraw Cream Face
      this.instructionsFace
        .clear()
        .roundRect(-cardW / 2 + 8, -cardH / 2 + 8, cardW - 16, cardH - 16, 14)
        .fill({ color: 0xfbfaf5 });

      // 4. Redraw Title Ribbon
      const ribbonW = isMobile ? 200 : 240;
      const ribbonH = isMobile ? 38 : 42;
      const ribbonY = -cardH / 2;

      this.instructionsRibbonShadow
        .clear()
        .roundRect(
          -ribbonW / 2,
          ribbonY - ribbonH / 2 + 4,
          ribbonW,
          ribbonH,
          10,
        )
        .fill({ color: 0x8a4500 });

      this.instructionsRibbon
        .clear()
        .roundRect(-ribbonW / 2, ribbonY - ribbonH / 2, ribbonW, ribbonH, 10)
        .fill({
          fill: new FillGradient({
            start: { x: 0, y: -ribbonH / 2 },
            end: { x: 0, y: ribbonH / 2 },
            colorStops: [
              { offset: 0, color: 0xffe500 },
              { offset: 1, color: 0xff9900 },
            ],
          }),
        })
        .stroke({ color: 0xfff8b3, width: 2 });

      // 5. Title text position and font size
      this.instructionsTitle.style.fontSize = isMobile ? 18 : 22;
      this.instructionsTitle.position.set(0, ribbonY);

      // 6. Layout grid columns and rows dynamically
      const startY = -cardH / 2 + (isMobile ? 55 : 68);
      const rowHeight = isMobile ? 42 : 46;

      const iconW = isMobile ? 32 : 38;
      const iconH = isMobile ? 26 : 30;
      const spriteSize = isMobile ? 18 : 22;
      const gap = isMobile ? 8 : 12;

      const col1StartX = -cardW / 2 + (isMobile ? 18 : 28);
      const col2StartX = isMobile ? 10 : 25;

      const layoutRow = (row, i, colStartX) => {
        // Redraw icon background
        row.iconBg
          .clear()
          .roundRect(0, -iconH / 2, iconW, iconH, 6)
          .fill({ color: 0xefebe9 })
          .stroke({ color: 0xd7ccc8, width: 1.2 });

        // Resize & position sprite
        if (row.sprite instanceof Sprite) {
          const sp = row.sprite;
          if (sp.texture && sp.texture.width > 0) {
            const ratio = sp.texture.width / sp.texture.height;
            if (ratio > 1) {
              sp.width = spriteSize;
              sp.height = spriteSize / ratio;
            } else {
              sp.height = spriteSize;
              sp.width = spriteSize * ratio;
            }
          } else {
            sp.width = spriteSize;
            sp.height = spriteSize;
          }
          sp.position.set(iconW / 2, 0);
        } else if (row.sprite instanceof Graphics) {
          // Drawing shield vector icon
          row.sprite
            .clear()
            .ellipse(0, 0, isMobile ? 8 : 10, isMobile ? 10 : 13)
            .fill({ color: 0x29b6f6 })
            .stroke({ color: 0xffffff, width: 1.5 });
          row.sprite.position.set(iconW / 2, 0);
        }

        // Align label text next to the icon
        row.labelText.style.fontSize = isMobile ? 10.5 : 12.5;
        row.labelText.position.set(iconW + gap, 0);

        // Position the row container
        row.position.set(
          colStartX,
          Math.round(startY + i * rowHeight + rowHeight / 2),
        );
      };

      // Layout Left Column (CHƯỚNG NGẠI VẬT)
      this.leftRows.forEach((row, i) => {
        layoutRow(row, i, col1StartX);
      });

      // Layout Right Column (VẬT PHẨM & KHIÊN)
      this.rightRows.forEach((row, i) => {
        layoutRow(row, i, col2StartX);
      });

      // 7. Position bottom "ĐÃ HIỂU" button
      const buttonY = isMobile ? cardH / 2 - 40 : cardH / 2 - 50;
      this.instructionsUnderstandBtn.position.set(0, buttonY);
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

    // Hide blurry PixiJS text and button objects so we use clean HTML ones instead
    this.menuTitleText.visible = false;
    this.menuSubtitleText.visible = false;
    this.menuHighScoreText.visible = false;
    this.playBtn.visible = false;
    this.achievementsBtn.visible = false;
    this.charSelectBtn.visible = false;
    this.instructionsBtn.visible = false;
    this.settingsBtn.visible = false;

    this.scoreText.visible = false;
    this.highScoreText.visible = false;
    this.pauseBtn.visible = false;

    // Bind HTML HUD and Menu Buttons
    const menuPlayBtn = document.getElementById("menu-play-btn");
    if (menuPlayBtn) {
      menuPlayBtn.onclick = () => {
        audio.playClick();
        this.switchState("PLAYING");
      };
    }

    const hudPauseBtn = document.getElementById("hud-pause-btn");
    if (hudPauseBtn) {
      hudPauseBtn.onclick = (e) => {
        e.stopPropagation(); // Avoid jumping when tapping pause
        audio.playClick();
        if (this.gameState === "PLAYING") {
          this.switchState("PAUSED");
        }
      };
    }

    const btnAchievements = document.getElementById("menu-btn-achievements");
    if (btnAchievements) {
      btnAchievements.onclick = (e) => {
        e.stopPropagation();
        audio.playClick();
        this.switchState("ACHIEVEMENTS");
      };
    }

    const btnChar = document.getElementById("menu-btn-char");
    if (btnChar) {
      btnChar.onclick = (e) => {
        e.stopPropagation();
        audio.playClick();
        this.switchState("CHAR_SELECT");
      };
    }

    const btnInstructions = document.getElementById("menu-btn-instructions");
    if (btnInstructions) {
      btnInstructions.onclick = (e) => {
        e.stopPropagation();
        audio.playClick();
        this.switchState("INSTRUCTIONS");
      };
    }

    const btnSettings = document.getElementById("menu-btn-settings");
    if (btnSettings) {
      btnSettings.onclick = (e) => {
        e.stopPropagation();
        audio.playClick();
        this.switchState("SETTINGS");
      };
    }
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
    this.syncDOMScoreAndHighScore();

    // Re-draw achievements list if open
    if (this.gameState === "ACHIEVEMENTS") {
      this.updateAchievementsDisplay();
    }
  }

  syncDOMScoreAndHighScore() {
    const domScore = document.getElementById("hud-score");
    if (domScore) {
      domScore.innerText = `ĐIỂM: ${Math.floor(this.score)}`;
    }
    const domHighScore = document.getElementById("hud-highscore");
    if (domHighScore) {
      domHighScore.innerText = `KỶ LỤC: ${this.highScore}`;
    }
    const menuHighScoreText = document.getElementById("menu-highscore");
    if (menuHighScoreText) {
      menuHighScoreText.innerText = `🏆 KỶ LỤC ĐIỂM: ${this.highScore}`;
    }
  }

  injectHTMLPopupStyles() {
    if (!document.getElementById("game-popup-styles")) {
      const style = document.createElement("style");
      style.id = "game-popup-styles";
      style.textContent = `
        .game-popup-overlay {
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
          box-sizing: border-box;
        }
        .game-popup-card {
          background: #FFF8E1;
          border: 5px solid #F9A825;
          box-shadow: inset 0 0 0 2.5px #FFF59D, 0 6px 0 #F57F17, 0 12px 25px rgba(0, 0, 0, 0.35);
          border-radius: 20px;
          padding: 36px 24px 20px 24px;
          width: 90%; max-width: 420px;
          text-align: center;
          position: relative;
          transform: scale(0.85);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease;
          font-family: 'Be Vietnam Pro', sans-serif;
          box-sizing: border-box;
          opacity: 0;
        }
        .game-popup-card.wide {
          max-width: 460px;
        }
        .game-popup-title {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #FBC02D 0%, #F9A825 100%);
          border: 2.5px solid #FFF9C4;
          border-radius: 12px;
          box-shadow: 0 4px 0 #F57F17;
          color: #ffffff;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 6px 36px;
          text-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          text-transform: uppercase;
        }
        .game-popup-close-btn {
          position: absolute;
          top: -16px;
          right: -16px;
          width: 40px;
          height: 40px;
          border: none;
          background: url(/assest/iconbtn/close_btn.png) no-repeat center center;
          background-size: contain;
          cursor: pointer;
          transition: transform 0.15s ease;
          z-index: 100100;
        }
        .game-popup-close-btn:hover {
          transform: scale(1.1);
        }
        .game-popup-close-btn:active {
          transform: scale(0.92);
        }
        .game-settings-row-container {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .game-settings-row {
          background: #ffffff;
          border: 3.5px solid #FFF9C4;
          border-radius: 15px;
          padding: 10px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          height: 62px;
        }
        .game-settings-label {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #4E342E;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .game-settings-toggle-btn {
          width: 68px;
          height: 42px;
          border: none;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .game-settings-toggle-btn:hover {
          transform: scale(1.06);
        }
        .game-settings-toggle-btn:active {
          transform: scale(0.95);
        }
        .game-settings-reset-btn {
          background: linear-gradient(180deg, #FBC02D 0%, #FBC02D 100%);
          border: none;
          box-shadow: 0 4px 0 #F57F17;
          border-radius: 12px;
          color: #ffffff;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 16px;
          font-weight: 800;
          padding: 10px 24px;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.1s ease, filter 0.1s ease;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .game-settings-reset-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
        .game-settings-reset-btn:hover {
          transform: scale(1.05);
          filter: brightness(1.05);
        }
        .game-settings-reset-btn:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #F57F17;
        }
        .game-settings-version {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 12px;
          color: #4E342E;
          margin-top: 14px;
          font-weight: 600;
        }

        /* Paused popup */
        .game-paused-action-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 24px;
        }
        .game-paused-btn {
          width: 52px;
          height: 52px;
          border: none;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .game-paused-btn:hover {
          transform: scale(1.1);
        }
        .game-paused-btn:active {
          transform: scale(0.92);
        }

        /* Game Over popup */
        .game-over-emblem {
          width: 68px;
          height: 68px;
          background: #FFF59D;
          border: 3.5px solid #F9A825;
          border-radius: 50%;
          box-shadow: 0 5px 0 #F9A825, inset 0 0 0 2px #FFF9C4;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          color: #F9A825;
          margin: 10px auto;
          line-height: 1;
          position: relative;
          top: -5px;
        }
        .game-over-record-banner {
          background: #FBC02D;
          border: 1.5px solid #FFF59D;
          border-radius: 6px;
          color: #ffffff;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          padding: 4px 16px;
          display: inline-block;
          margin-bottom: 12px;
          box-shadow: 0 3px 0 #F9A825;
          text-shadow: 0 1px 1px rgba(0,0,0,0.5);
        }
        .game-over-score {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: #4E342E;
          margin: 8px 0;
          letter-spacing: 2px;
          text-shadow: 0 1px 0 #ffffff;
        }
        .game-over-msg {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #F57F17;
          margin-bottom: 20px;
        }
        .game-over-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }
        .game-over-btn {
          width: 52px;
          height: 52px;
          border: none;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .game-over-btn:hover {
          transform: scale(1.1);
        }
        .game-over-btn:active {
          transform: scale(0.92);
        }

        /* Achievements popup */
        .game-achievements-list {
          margin-top: 18px;
          max-height: min(350px, 50vh);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
          box-sizing: border-box;
        }
        .game-achievements-list::-webkit-scrollbar {
          width: 6px;
        }
        .game-achievements-list::-webkit-scrollbar-track {
          background: #FFF8E1;
          border-radius: 4px;
        }
        .game-achievements-list::-webkit-scrollbar-thumb {
          background: #FFECB3;
          border-radius: 4px;
        }
        .game-achievements-row {
          background: #ffffff;
          border: 1.5px solid #FFECB3;
          border-radius: 10px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          height: 48px;
          justify-content: space-between;
        }
        .game-achievements-row.rank-0 {
          background: #fff8e1;
          border: 2px solid #ffa500;
        }
        .game-achievements-row.rank-1 {
          background: #f5f5f5;
          border: 2px solid #a0aab5;
        }
        .game-achievements-row.rank-2 {
          background: #fff3e0;
          border: 2px solid #cf7936;
        }
        .game-achievements-rank {
          font-size: 18px;
          font-weight: 700;
          width: 32px;
          text-align: center;
          color: #4E342E;
        }
        .game-achievements-avatar-container {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          box-shadow: 0 5px 0 #F9A825, inset 0 0 0 2px #FFF9C4;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #F9A825;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-right: 10px;
        }
        .game-achievements-avatar {
          width: 28px;
          height: 28px;
          object-fit: cover;
          border-radius: 50%;
        }
        .game-achievements-info {
          display: flex;
          align-items: center;
          flex-grow: 1;
        }
        .game-achievements-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #4E342E;
        }
        .game-achievements-name.player {
          color: #FBC02D;
        }
        .game-achievements-score {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #4E342E;
          text-align: right;
        }
        .game-achievements-footer {
          margin-top: 14px;
          background: #fff3cd;
          border: 2px solid #FFF59D;
          border-radius: 12px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          box-sizing: border-box;
        }

        /* Character selection popup */
        .game-charselect-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          justify-items: center;
        }
        .game-charselect-item {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #dfdac0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          transition: transform 0.1s ease;
        }
        .game-charselect-item:hover {
          transform: scale(1.05);
        }
        .game-charselect-item.selected {
          border: 3px solid #FFF59D;
          background: #fff3cd;
          width: 72px;
          height: 72px;
        }
        .game-charselect-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
        }
        .game-charselect-paging {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }
        .game-charselect-page-btn {
          width: 38px;
          height: 38px;
          border: none;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .game-charselect-page-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }
        .game-charselect-page-btn:active:not(:disabled) {
          transform: scale(0.92);
        }
        .game-charselect-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .game-charselect-page-text {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #F57F17;
          letter-spacing: 1.5px;
          min-width: 100px;
          text-align: center;
        }

        /* Instructions popup */
        .game-instructions-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-height: min(450px, 65vh);
          overflow-y: auto;
          padding-right: 4px;
          box-sizing: border-box;
        }
        .game-instructions-grid::-webkit-scrollbar {
          width: 6px;
        }
        .game-instructions-grid::-webkit-scrollbar-track {
          background: #f1ebd8;
          border-radius: 4px;
        }
        .game-instructions-grid::-webkit-scrollbar-thumb {
          background: #c5beaa;
          border-radius: 4px;
        }
        .game-instructions-row {
          background: #ffffff;
          border: 2px solid #ddeaff;
          border-radius: 12px;
          padding: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-sizing: border-box;
          height: 52px;
        }
        .game-instructions-icon-container {
          width: 36px;
          height: 36px;
          border: 1.5px solid #FFE082;
          border-radius: 8px;
          background: #FFF8E1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .game-instructions-icon {
          max-width: 30px;
          max-height: 30px;
          object-fit: contain;
        }
        .game-instructions-text {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #4E342E;
          text-align: left;
          line-height: 1.2;
        }
      `;
      document.head.appendChild(style);
    }
  }

  showHTMLSettings() {
    this.injectHTMLPopupStyles();

    if (document.getElementById("game-settings-overlay-id")) return;

    const overlay = document.createElement("div");
    overlay.id = "game-settings-overlay-id";
    overlay.className = "game-popup-overlay";

    const card = document.createElement("div");
    card.className = "game-popup-card";

    // Title
    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "CÀI ĐẶT";
    card.appendChild(title);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "game-popup-close-btn";
    closeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("MAIN_MENU");
    });
    card.appendChild(closeBtn);

    const rowContainer = document.createElement("div");
    rowContainer.className = "game-settings-row-container";

    // Music row
    const musicRow = document.createElement("div");
    musicRow.className = "game-settings-row";
    const musicLabel = document.createElement("span");
    musicLabel.className = "game-settings-label";
    musicLabel.innerText = "🎵 Nhạc nền";
    musicRow.appendChild(musicLabel);

    const musicToggle = document.createElement("button");
    musicToggle.className = "game-settings-toggle-btn";
    musicToggle.style.backgroundImage = `url(${audio.musicMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    musicToggle.addEventListener("click", () => {
      audio.playClick();
      audio.toggleMusicMute();
      musicToggle.style.backgroundImage = `url(${audio.musicMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    });
    musicRow.appendChild(musicToggle);
    rowContainer.appendChild(musicRow);

    // SFX row
    const sfxRow = document.createElement("div");
    sfxRow.className = "game-settings-row";
    const sfxLabel = document.createElement("span");
    sfxLabel.className = "game-settings-label";
    sfxLabel.innerText = "🔊 Hiệu ứng";
    sfxRow.appendChild(sfxLabel);

    const sfxToggle = document.createElement("button");
    sfxToggle.className = "game-settings-toggle-btn";
    sfxToggle.style.backgroundImage = `url(${audio.sfxMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    sfxToggle.addEventListener("click", () => {
      audio.playClick();
      audio.toggleSfxMute();
      sfxToggle.style.backgroundImage = `url(${audio.sfxMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    });
    sfxRow.appendChild(sfxToggle);
    rowContainer.appendChild(sfxRow);

    card.appendChild(rowContainer);

    // Reset High Score Button
    const resetBtn = document.createElement("button");
    resetBtn.className = "game-settings-reset-btn";
    resetBtn.innerHTML = `<img src="/assest/iconbtn/delete_btn.png" class="game-settings-reset-icon" alt="" /> XÓA LỊCH SỬ`;
    resetBtn.addEventListener("click", async () => {
      audio.playClick();
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
        this.switchState("MAIN_MENU");
      }
    });
    card.appendChild(resetBtn);

    // Version Text
    const versionText = document.createElement("div");
    versionText.className = "game-settings-version";
    versionText.innerText = "Phiên bản: 1.0.0";
    card.appendChild(versionText);

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLSettings() {
    const overlay = document.getElementById("game-settings-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  showHTMLPaused() {
    this.injectHTMLPopupStyles();
    if (document.getElementById("game-paused-overlay-id")) return;

    const overlay = document.createElement("div");
    overlay.id = "game-paused-overlay-id";
    overlay.className = "game-popup-overlay";

    const card = document.createElement("div");
    card.className = "game-popup-card";

    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "CÀI ĐẶT";
    card.appendChild(title);

    // Close button (resumes play)
    const closeBtn = document.createElement("button");
    closeBtn.className = "game-popup-close-btn";
    closeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("PLAYING");
    });
    card.appendChild(closeBtn);

    const rowContainer = document.createElement("div");
    rowContainer.className = "game-settings-row-container";

    // Music row
    const musicRow = document.createElement("div");
    musicRow.className = "game-settings-row";
    const musicLabel = document.createElement("span");
    musicLabel.className = "game-settings-label";
    musicLabel.innerText = "🎵 Nhạc nền";
    musicRow.appendChild(musicLabel);

    const musicToggle = document.createElement("button");
    musicToggle.className = "game-settings-toggle-btn";
    musicToggle.style.backgroundImage = `url(${audio.musicMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    musicToggle.addEventListener("click", () => {
      audio.playClick();
      audio.toggleMusicMute();
      musicToggle.style.backgroundImage = `url(${audio.musicMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    });
    musicRow.appendChild(musicToggle);
    rowContainer.appendChild(musicRow);

    // SFX row
    const sfxRow = document.createElement("div");
    sfxRow.className = "game-settings-row";
    const sfxLabel = document.createElement("span");
    sfxLabel.className = "game-settings-label";
    sfxLabel.innerText = "🔊 Hiệu ứng";
    sfxRow.appendChild(sfxLabel);

    const sfxToggle = document.createElement("button");
    sfxToggle.className = "game-settings-toggle-btn";
    sfxToggle.style.backgroundImage = `url(${audio.sfxMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    sfxToggle.addEventListener("click", () => {
      audio.playClick();
      audio.toggleSfxMute();
      sfxToggle.style.backgroundImage = `url(${audio.sfxMuted ? "/assest/iconbtn/toggle_off.png" : "/assest/iconbtn/toggle_on.png"})`;
    });
    sfxRow.appendChild(sfxToggle);
    rowContainer.appendChild(sfxRow);

    card.appendChild(rowContainer);

    // Action buttons container: Home, Replay, Resume
    const actionContainer = document.createElement("div");
    actionContainer.className = "game-paused-action-container";

    // Home
    const homeBtn = document.createElement("button");
    homeBtn.className = "game-paused-btn";
    homeBtn.style.backgroundImage = "url(/assest/iconbtn/Home_btn.png)";
    homeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("MAIN_MENU");
    });
    actionContainer.appendChild(homeBtn);

    // Replay
    const replayBtn = document.createElement("button");
    replayBtn.className = "game-paused-btn";
    replayBtn.style.backgroundImage = "url(/assest/iconbtn/replay_btn.png)";
    replayBtn.addEventListener("click", () => {
      audio.playClick();
      this.gameState = "PLAYING";
      this.switchState("PLAYING");
    });
    actionContainer.appendChild(replayBtn);

    // Resume
    const resumeBtn = document.createElement("button");
    resumeBtn.className = "game-paused-btn";
    resumeBtn.style.backgroundImage = "url(/assest/iconbtn/continue_btn.png)";
    resumeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("PLAYING");
    });
    actionContainer.appendChild(resumeBtn);

    card.appendChild(actionContainer);

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLPaused() {
    const overlay = document.getElementById("game-paused-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  showHTMLReviveOffer(onRevive, onSkip) {
    this.injectHTMLPopupStyles();

    const existing = document.getElementById("game-revive-overlay-id");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "game-revive-overlay-id";
    overlay.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;";

    const card = document.createElement("div");
    card.className = "game-popup-card";

    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "HỒI SINH";

    const heartIcon = document.createElement("div");
    heartIcon.innerText = "💖";
    heartIcon.style.cssText =
      "font-size:110px;line-height:1;margin-bottom:20px;margin-top:10px;text-shadow:0 10px 20px rgba(0,0,0,0.2), 0 0 30px rgba(255,100,150,0.6);";
    heartIcon.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.2)" },
        { transform: "scale(1)" },
        { transform: "scale(1.2)" },
        { transform: "scale(1)" },
      ],
      { duration: 1200, iterations: Infinity, easing: "ease-in-out" },
    );

    const yesBtn = document.createElement("button");
    yesBtn.style.cssText =
      "margin: 0 auto; background:linear-gradient(to bottom, #ffa726, #F9A825);border:none;border-radius:12px;padding:10px 60px;color:white;font-size:26px;font-weight:900;font-family:'Nunito', 'Segoe UI', Arial, sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 0 #e65100, 0 8px 10px rgba(0,0,0,0.3);transition:transform 0.1s, box-shadow 0.1s;text-transform:uppercase;";

    const tvIcon = document.createElement("img");
    tvIcon.src = "/assest/iconbtn/images.png";
    tvIcon.style.cssText = "height:30px;width:auto;margin-right:15px;";

    const yesText = document.createElement("span");
    yesText.innerText = "CÓ";
    yesText.style.textShadow = "0 2px 4px rgba(0,0,0,0.3)";

    yesBtn.appendChild(tvIcon);
    yesBtn.appendChild(yesText);

    const skipText = document.createElement("div");
    skipText.innerText = "Không, cảm ơn";
    skipText.style.cssText =
      "margin-top:15px;font-family:sans-serif;font-size:16px;color:#888;text-decoration:underline;cursor:pointer;font-weight:bold;";

    card.appendChild(title);
    card.appendChild(heartIcon);
    card.appendChild(yesBtn);
    card.appendChild(skipText);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.style.opacity = "0";
      card.style.transform = "scale(0.85)";
      setTimeout(() => overlay.remove(), 250);
    };

    let isHandlingClick = false;
    yesBtn.addEventListener("click", () => {
      if (isHandlingClick) return;
      isHandlingClick = true;
      cleanup();
      onRevive();
    });

    skipText.addEventListener("click", () => {
      if (isHandlingClick) return;
      isHandlingClick = true;
      cleanup();
      onSkip();
    });

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLReviveOffer() {
    const overlay = document.getElementById("game-revive-overlay-id");
    if (overlay) {
      overlay.remove();
    }
  }

  showHTMLGameOver() {
    this.injectHTMLPopupStyles();
    if (document.getElementById("game-gameover-overlay-id")) return;

    const overlay = document.createElement("div");
    overlay.id = "game-gameover-overlay-id";
    overlay.className = "game-popup-overlay";

    const card = document.createElement("div");
    card.className = "game-popup-card";

    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "KẾT THÚC";
    card.appendChild(title);

    // 1. Golden Emblem with Star
    const emblem = document.createElement("div");
    emblem.className = "game-over-emblem";
    emblem.innerText = "⭐";
    card.appendChild(emblem);

    // 2. New Record Banner
    if (this.isNewRecordThisRun) {
      const recordBanner = document.createElement("div");
      recordBanner.className = "game-over-record-banner";
      recordBanner.innerText = "KỶ LỤC MỚI!";
      card.appendChild(recordBanner);
    }

    // 3. Score
    const finalScore = Math.floor(this.score);
    const scoreVal = document.createElement("div");
    scoreVal.className = "game-over-score";
    scoreVal.innerText = `ĐIỂM SỐ: ${finalScore}`;
    card.appendChild(scoreVal);

    // 4. Message
    const msgVal = document.createElement("div");
    msgVal.className = "game-over-msg";
    msgVal.innerText = this.isNewRecordThisRun
      ? "👑 KỶ LỤC MỚI CỦA BỘ LẠC! 👑"
      : "Bạn đã va phải chướng ngại vật!";
    card.appendChild(msgVal);

    // 5. Actions: Revive, Try Again, Home, Double Score
    const actionContainer = document.createElement("div");
    actionContainer.className = "game-over-actions";

    // Double Score
    if (!this.hasDoubledThisRun) {
      const doubleBtn = document.createElement("button");
      doubleBtn.className = "game-over-btn";
      doubleBtn.style.backgroundImage = "url(/assest/iconbtn/x2_btn.png)";
      doubleBtn.addEventListener("click", async () => {
        audio.playClick();
        const success = await AdManager.showRewardedVideo();
        if (success) {
          this.hasDoubledThisRun = true;
          this.score = this.score * 2;
          const newScore = Math.floor(this.score);

          const stats = getStats();
          if (newScore > stats.highScore) {
            stats.highScore = newScore;
            this.highScore = newScore;
            this.isNewRecordThisRun = true;
          }
          if (stats.history.length > 0) {
            stats.history[0].score = newScore;
            stats.history.sort((a, b) => b.score - a.score);
          }
          saveStats(stats);

          // Update text overlays
          scoreVal.innerText = `ĐIỂM SỐ: ${newScore} (X2!)`;
          msgVal.innerText = "KỶ LỤC MỚI! HẠNG #1";
          doubleBtn.remove();
          this.updateUserUI();
        }
      });
      actionContainer.appendChild(doubleBtn);
    }

    // Replay
    const replayBtn = document.createElement("button");
    replayBtn.className = "game-over-btn";
    replayBtn.style.backgroundImage = "url(/assest/iconbtn/replay_btn.png)";
    replayBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("PLAYING");
    });
    actionContainer.appendChild(replayBtn);

    // Home
    const homeBtn = document.createElement("button");
    homeBtn.className = "game-over-btn";
    homeBtn.style.backgroundImage = "url(/assest/iconbtn/Home_btn.png)";
    homeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("MAIN_MENU");
    });
    actionContainer.appendChild(homeBtn);

    card.appendChild(actionContainer);

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLGameOver() {
    const overlay = document.getElementById("game-gameover-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  showHTMLAchievements() {
    this.injectHTMLPopupStyles();
    if (document.getElementById("game-achievements-overlay-id")) return;

    const overlay = document.createElement("div");
    overlay.id = "game-achievements-overlay-id";
    overlay.className = "game-popup-overlay";

    const card = document.createElement("div");
    card.className = "game-popup-card wide";

    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "BẢNG VÀNG";
    card.appendChild(title);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "game-popup-close-btn";
    closeBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("MAIN_MENU");
    });
    card.appendChild(closeBtn);

    // Score entries
    const listContainer = document.createElement("div");
    listContainer.className = "game-achievements-list";

    const data = getLeaderboardData();
    for (let i = 0; i < 6; i++) {
      const entry = data[i];
      if (!entry) break;

      const row = document.createElement("div");
      row.className = `game-achievements-row rank-${i}`;

      const rankMedals = ["🥇", "🥈", "🥉"];
      const rankText = document.createElement("span");
      rankText.className = "game-achievements-rank";
      rankText.innerText = rankMedals[i] || `${i + 1}`;
      row.appendChild(rankText);

      const info = document.createElement("div");
      info.className = "game-achievements-info";

      const avatarContainer = document.createElement("div");
      avatarContainer.className = "game-achievements-avatar-container";
      const avatarImg = document.createElement("img");
      avatarImg.className = "game-achievements-avatar";
      avatarImg.src = entry.avatar;
      avatarContainer.appendChild(avatarImg);
      info.appendChild(avatarContainer);

      const nameText = document.createElement("span");
      nameText.className = `game-achievements-name${entry.isPlayer ? " player" : ""}`;
      nameText.innerText = entry.name;
      info.appendChild(nameText);

      row.appendChild(info);

      const scoreText = document.createElement("span");
      scoreText.className = "game-achievements-score";
      scoreText.innerText = entry.score;
      row.appendChild(scoreText);

      listContainer.appendChild(row);
    }
    card.appendChild(listContainer);

    // Pinned Footer (Personal Best)
    const playerEntry = data.find((e) => e.isPlayer);
    const playerRank = data.findIndex((e) => e.isPlayer) + 1;

    if (playerEntry) {
      const footer = document.createElement("div");
      footer.className = "game-achievements-footer";

      const rankMedals = ["🥇", "🥈", "🥉"];
      const rankText = document.createElement("span");
      rankText.className = "game-achievements-rank";
      rankText.innerText = rankMedals[playerRank - 1] || `${playerRank}`;
      footer.appendChild(rankText);

      const info = document.createElement("div");
      info.className = "game-achievements-info";

      const avatarContainer = document.createElement("div");
      avatarContainer.className = "game-achievements-avatar-container";
      const avatarImg = document.createElement("img");
      avatarImg.className = "game-achievements-avatar";
      avatarImg.src = playerEntry.avatar;
      avatarContainer.appendChild(avatarImg);
      info.appendChild(avatarContainer);

      const nameText = document.createElement("span");
      nameText.className = "game-achievements-name player";
      nameText.innerText = `${playerEntry.name} (Bạn)`;
      info.appendChild(nameText);

      footer.appendChild(info);

      const scoreText = document.createElement("span");
      scoreText.className = "game-achievements-score";
      scoreText.innerText = playerEntry.score;
      footer.appendChild(scoreText);

      card.appendChild(footer);
    }

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLAchievements() {
    const overlay = document.getElementById("game-achievements-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  showHTMLCharSelect() {
    this.injectHTMLPopupStyles();

    let overlay = document.getElementById("game-charselect-overlay-id");
    let card;
    if (overlay) {
      card = overlay.querySelector(".game-popup-card");
      const grid = card.querySelector(".game-charselect-grid");
      if (grid) grid.remove();
      const paging = card.querySelector(".game-charselect-paging");
      if (paging) paging.remove();
    } else {
      overlay = document.createElement("div");
      overlay.id = "game-charselect-overlay-id";
      overlay.className = "game-popup-overlay";

      card = document.createElement("div");
      card.className = "game-popup-card";

      const title = document.createElement("div");
      title.className = "game-popup-title";
      title.innerText = "CHỌN NHÂN VẬT";
      card.appendChild(title);

      const closeBtn = document.createElement("button");
      closeBtn.className = "game-popup-close-btn";
      closeBtn.addEventListener("click", () => {
        audio.playClick();
        this.switchState("MAIN_MENU");
      });
      card.appendChild(closeBtn);

      overlay.appendChild(card);
      const appContainer = document.getElementById("app") || document.body;
      appContainer.appendChild(overlay);
    }

    const itemsPerPage = 12;
    const startIndex = this.charSelectPage * itemsPerPage;
    const currentAvatar =
      window.selectedAvatarUrl ||
      "/assest/image/imagebldp/001_avatar_laclac.png";

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

    const avatarList = [];
    for (let i = 0; i < 44; i++) {
      const idxStr = String(i + 1).padStart(3, "0");
      avatarList.push({
        url: `/assest/image/imagebldp/${idxStr}_avatar_${avatarNames[i]}.png`,
        name: avatarNames[i].toUpperCase(),
      });
    }

    const grid = document.createElement("div");
    grid.className = "game-charselect-grid";

    for (let idx = 0; idx < itemsPerPage; idx++) {
      const itemIdx = startIndex + idx;
      if (itemIdx >= avatarList.length) break;

      const item = avatarList[itemIdx];
      const isSelected = item.url === currentAvatar;

      const gridItem = document.createElement("div");
      gridItem.className = `game-charselect-item${isSelected ? " selected" : ""}`;

      const img = document.createElement("img");
      img.className = "game-charselect-avatar";
      img.src = item.url;
      gridItem.appendChild(img);

      gridItem.addEventListener("click", () => {
        window.selectedAvatarUrl = item.url;
        window.localStorage.setItem("selected_avatar_url", item.url);

        Assets.load(item.url).then((tex) => {
          this.updateSkeletalRigTexture(tex, item.url);
          this.playerColors = this.getAvatarColors(item.url);
        });

        this.updateUserUI();
        audio.playClick();
        this.showHTMLCharSelect();
      });

      grid.appendChild(gridItem);
    }
    card.appendChild(grid);

    const paging = document.createElement("div");
    paging.className = "game-charselect-paging";

    const prevBtn = document.createElement("button");
    prevBtn.className = "game-charselect-page-btn";
    prevBtn.style.backgroundImage = "url(/assest/iconbtn/back_btn.png)";
    prevBtn.disabled = this.charSelectPage === 0;
    prevBtn.addEventListener("click", () => {
      audio.playClick();
      if (this.charSelectPage > 0) {
        this.charSelectPage--;
        this.showHTMLCharSelect();
      }
    });
    paging.appendChild(prevBtn);

    const pageText = document.createElement("span");
    pageText.className = "game-charselect-page-text";
    pageText.innerText = `TRANG ${this.charSelectPage + 1}/4`;
    paging.appendChild(pageText);

    const nextBtn = document.createElement("button");
    nextBtn.className = "game-charselect-page-btn";
    nextBtn.style.backgroundImage = "url(/assest/iconbtn/back_btn.png)";
    nextBtn.style.transform = "scaleX(-1)";
    nextBtn.disabled = this.charSelectPage === 3;
    nextBtn.addEventListener("click", () => {
      audio.playClick();
      if (this.charSelectPage < 3) {
        this.charSelectPage++;
        this.showHTMLCharSelect();
      }
    });
    paging.appendChild(nextBtn);

    card.appendChild(paging);

    if (overlay.style.opacity !== "1") {
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        card.style.opacity = "1";
        card.style.transform = "scale(1)";
      });
    }
  }

  hideHTMLCharSelect() {
    const overlay = document.getElementById("game-charselect-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  showHTMLInstructions() {
    this.injectHTMLPopupStyles();
    if (document.getElementById("game-instructions-overlay-id")) return;

    const overlay = document.createElement("div");
    overlay.id = "game-instructions-overlay-id";
    overlay.className = "game-popup-overlay";

    const card = document.createElement("div");
    card.className = "game-popup-card wide";

    const title = document.createElement("div");
    title.className = "game-popup-title";
    title.innerText = "HƯỚNG DẪN CHƠI";
    card.appendChild(title);

    const leftItems = [
      {
        label: "Lốp xe (Nhảy né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
      },
      {
        label: "Hàng rào (Nhảy né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
      },
      {
        label: "Bàn nhựa (Nhảy né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/bluetable.png",
      },
      {
        label: "Bù nhìn (Nhảy né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HinhNomBuNhin.png",
      },
      {
        label: "Dép tổ ong (Cúi né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
      },
      {
        label: "Ghế đỏ bay (Cúi né)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.png",
      },
    ];

    const rightItems = [
      {
        label: "Bánh Chưng (+Điểm)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
      },
      {
        label: "Bánh Mì (+Điểm)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.png",
      },
      {
        label: "Nước Ngọt (+Điểm)",
        img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.png",
      },
      { label: "Khiên Bất Tử (2 giây)", isShield: true },
    ];

    const grid = document.createElement("div");
    grid.className = "game-instructions-grid";

    const allItems = [...leftItems, ...rightItems];
    allItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = "game-instructions-row";

      const iconContainer = document.createElement("div");
      iconContainer.className = "game-instructions-icon-container";

      if (item.isShield) {
        iconContainer.innerHTML = `<span style="font-size: 22px; color: #29b6f6; line-height: 1;">🛡️</span>`;
      } else {
        const img = document.createElement("img");
        img.className = "game-instructions-icon";
        img.src = item.img;
        iconContainer.appendChild(img);
      }
      row.appendChild(iconContainer);

      const label = document.createElement("span");
      label.className = "game-instructions-text";
      label.innerText = item.label;
      row.appendChild(label);

      grid.appendChild(row);
    });

    card.appendChild(grid);

    const understandBtn = document.createElement("button");
    understandBtn.className = "game-settings-reset-btn";
    understandBtn.style.marginTop = "20px";
    understandBtn.innerText = "ĐÃ HIỂU";
    understandBtn.addEventListener("click", () => {
      audio.playClick();
      this.switchState("MAIN_MENU");
    });
    card.appendChild(understandBtn);

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }

  hideHTMLInstructions() {
    const overlay = document.getElementById("game-instructions-overlay-id");
    if (overlay) {
      const card = overlay.querySelector(".game-popup-card");
      overlay.style.opacity = "0";
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.85)";
      }
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }
}
