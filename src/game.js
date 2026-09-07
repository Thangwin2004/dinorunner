import {
  Container,
  Graphics,
  Text,
  TextStyle,
  FillGradient,
  Sprite,
  AnimatedSprite,
  TilingSprite,
  Assets,
} from "pixi.js";
import { audio } from "./audio";
import gsap from "gsap";

import {
  AdManager,
  getStats,
  saveStats,
  getLeaderboardData,
  palettes,
  getColorStyle,
} from "./utils";
import { i18n } from "./system/I18nManager.js";

import { winkGame } from "./integrations/wink/wink-adapter.js";
import { AVATAR_BOUNDS, LEFT_FACING_AVATARS } from "./avatarData";

import {
  getAvatarColors,
  getAvatarCrop,
  createSkeletalPart,
  updateSkeletalRigTexture,
  updatePlayerLeg,
  updatePlayerArm,
  updatePlayerBody,
} from "./avatar";

import {
  injectHTMLPopupStyles,
  showHTMLSettings,
  hideHTMLSettings,
  showHTMLPaused,
  hideHTMLPaused,
  showHTMLReviveOffer,
  hideHTMLReviveOffer,
  showHTMLGameOver,
  hideHTMLGameOver,
  showHTMLAchievements,
  hideHTMLAchievements,
  showHTMLCharSelect,
  hideHTMLCharSelect,
  showHTMLInstructions,
  hideHTMLInstructions,
} from "./domUI";

const GROUND_RATIO = 0.84;
const FOREGROUND_HILLS_HEIGHT_RATIO = 0.72;
const SWIPE_DUCK_DURATION = 0.72;

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
    this.duckInputHeld = false;
    this.duckMinTime = 0;

    // Game objects
    this.obstacles = [];
    this.obstaclePool0 = []; // Ground Set A
    this.obstaclePool1 = []; // Ground Set B
    this.obstaclePool2 = []; // Flying
    this.obstaclePool3 = []; // Collectibles
    this.sparklePool = [];
    this.floatTextPool = [];

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
    this.parallaxContainer = new Container();
    this.addChildAt(this.parallaxContainer, 0);

    this.bgOverlay = new Graphics();
    this.addChild(this.bgOverlay);

    // Legacy fallback graphics are kept empty; the lightweight texture layers
    // below are used on every supported device.
    this.distantMountains = new Graphics();
    this.midMountains = new Graphics();
    this.closeMountains = new Graphics();
    this.addChild(this.distantMountains);
    this.addChild(this.midMountains);
    this.addChild(this.closeMountains);

    this.clouds = [];

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
    this.playerAnimations = null;
    this.currentPlayerAnimation = null;

    // Start loading assets
    this.loadAssets();

    // Create UIs
    this.setupUI();
    this.initDOMOverlays();

    // Subscribe to language changes
    i18n.subscribe(() => this.syncLanguage());
    this.syncLanguage();

    // Set initial state
    this.switchState("MAIN_MENU");
  }

  getGroundLevel(screenHeight = this.app.screen.height || 600) {
    return screenHeight * GROUND_RATIO;
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
        fontFamily: "Be Vietnam Pro",
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

    btn.label = label;
    btn.setLabelText = (newText) => {
      label.text = newText.toUpperCase();
    };

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
        if (onClick) onClick();
      });
      btn.on("pointerupoutside", () => {
        gsap.to(content, { y: 0, duration: 0.1 });
      });

      return btn;
    }

    // Fallback if texture not found
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
        fontFamily: "Be Vietnam Pro",
        fontSize: radius * 1.0,
        fill: 0xffffff,
        align: "center",
      }),
    });
    txt.anchor.set(0.5);
    face.addChild(txt);

    return btn;
  }

  async loadAssets() {
    try {
      const [skyTex, hillsTex] = await Promise.all([
        Assets.load("/assest/image/bg_parallax_sky_mountains.webp"),
        Assets.load("/assest/image/bg_parallax_hills_transparent.webp"),
      ]);

      if (!this.destroyed) {
        const sw = this.app.screen.width || 800;
        const sh = this.app.screen.height || 600;

        // Two composited textures are enough for the full scene. Keeping the
        // dirt road as cached vector geometry avoids a third scrolling texture.
        if (skyTex) {
          this.parallaxSkySprite = new TilingSprite({
            texture: skyTex,
            width: sw,
            height: this.getGroundLevel(sh),
          });
          this.parallaxSkySprite.y = 0;
          this.parallaxContainer.addChild(this.parallaxSkySprite);
        }

        // Foreground hills complete the scene without extra cloud Graphics.
        if (hillsTex) {
          const groundLevel = this.getGroundLevel(sh);
          const hillsHeight = groundLevel * FOREGROUND_HILLS_HEIGHT_RATIO;
          this.parallaxHillsSprite = new TilingSprite({
            texture: hillsTex,
            width: sw,
            height: hillsHeight,
          });
          this.parallaxHillsSprite.y = groundLevel - hillsHeight;
          this.parallaxContainer.addChild(this.parallaxHillsSprite);
        }

        this.resize();
      }

      // Preload obstacles and collectibles (multi-asset expansion)
      const assetPaths = [
        "/assest/image/obstacles/stone.webp",
        "/assest/image/obstacles/crate.webp",
        "/assest/image/obstacles/rock-monster.webp",
        "/assest/image/obstacles/spikes.webp",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.webp",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.webp",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).webp",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.webp",
        "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.webp",
      ];
      for (const path of assetPaths) {
        await Assets.load(path);
      }

      if (this.destroyed) return;

      const animationFrameCounts = { run: 8, jump: 8, slide: 10 };
      const loadAnimation = (action) =>
        Promise.all(
          Array.from({ length: animationFrameCounts[action] }, (_, index) =>
            Assets.load(
              `/assest/image/player_pet/${action}/${action}-${String(index + 1).padStart(2, "0")}.webp`,
            ),
          ),
        );
      const [runFrames, jumpFrames, slideFrames] = await Promise.all([
        loadAnimation("run"),
        loadAnimation("jump"),
        loadAnimation("slide"),
      ]);

      // Each action keeps the original art scale and a bottom-center anchor.
      // The source canvases differ by pose, so never assign width/height here:
      // doing so would make the character visibly grow when sliding.
      this.playerSprite = new Container();

      this.playerShadow = new Graphics()
        .ellipse(0, 0, 72, 14)
        .fill({ color: 0x3f2a22, alpha: 0.3 });
      this.playerShadow.position.set(0, 2);
      this.playerSprite.addChild(this.playerShadow);

      const createAnimation = (frames, animationSpeed, loop = true) => {
        const animation = new AnimatedSprite(frames);
        animation.anchor.set(0.5, 1);
        animation.animationSpeed = animationSpeed;
        animation.loop = loop;
        animation.visible = false;
        return animation;
      };

      this.playerAnimations = {
        // The authored cycles stay readable at 6–7 fps instead of flickering.
        run: createAnimation(runFrames, 0.11),
        jump: createAnimation(jumpFrames, 0.16, false),
        slide: createAnimation(slideFrames, 0.1),
      };
      Object.values(this.playerAnimations).forEach((animation) => {
        this.playerSprite.addChild(animation);
      });
      this.setPlayerAnimation("run");

      this.playerShieldGraphics = new Graphics();
      this.playerShieldGraphics
        .circle(0, -122, 145)
        .stroke({ width: 3, color: 0x81d4fa, alpha: 0.82 });
      this.playerSprite.addChild(this.playerShieldGraphics);

      this.gamePlayContainer.addChild(this.playerSprite);

      this.resize();
    } catch (e) {
      console.error("Error loading assets:", e);
    }
  }

  setPlayerAnimation(action) {
    const nextAnimation = this.playerAnimations?.[action];
    if (!nextAnimation || this.currentPlayerAnimation === action) return;

    Object.values(this.playerAnimations).forEach((animation) => {
      animation.visible = animation === nextAnimation;
      if (animation !== nextAnimation) animation.stop();
    });

    nextAnimation.gotoAndPlay(0);
    this.currentPlayerAnimation = action;
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
      text: "CÁO NHỎ PHIÊU LƯU KÝ",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
    this.highScoreText.anchor.set(0, 0.5);
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
        fontFamily: "Be Vietnam Pro",
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
      fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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

    this.settingsVersionText = new Text({
      text: "Phiên bản: 1.0.0",
      style: {
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
      text: "0",
      style: new TextStyle({
        fontFamily: "Be Vietnam Pro",
        fontSize: 44,
        fill: new FillGradient({
          end: { x: 0, y: 1 },
          colorStops: [
            { color: 0xffea00, offset: 0 },
            { color: 0xff9800, offset: 1 },
          ],
        }),
        stroke: { color: 0x794000, width: 4, join: "round" },
        dropShadow: {
          color: 0x000000,
          blur: 0,
          angle: Math.PI / 2,
          distance: 3,
          alpha: 0.4,
        },
        fontWeight: "900",
        letterSpacing: 2,
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
        fontFamily: "Be Vietnam Pro",
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

        this.gameOverScoreText.text = `${newScore} (X2!)`;
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
    this.duckInputHeld = false;
    this.duckMinTime = 0;
    this.playerVy = 0;

    // Position player firmly on the ground level
    const sh = this.app.screen.height || 600;
    this.playerY = this.getGroundLevel(sh);

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
    const groundLevel = this.getGroundLevel(sh);

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
      let sparkle;
      if (this.sparklePool.length > 0) {
        sparkle = this.sparklePool.pop();
        sparkle.alpha = 1; // reset alpha
      } else {
        sparkle = new Graphics();
        sparkle.circle(0, 0, 2 + Math.random() * 3).fill({ color: 0xffea00 });
      }

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
          this.sparklePool.push(sparkle);
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
    this.returnObstacleToPool(obs);
    this.obstacles.splice(index, 1);
  }

  spawnFloatingText(text, x, y) {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);

    let floatText;
    if (this.floatTextPool.length > 0) {
      floatText = this.floatTextPool.pop();
      floatText.text = text;
      floatText.alpha = 1;
    } else {
      floatText = new Text({
        text: text,
        style: new TextStyle({
          fontFamily: "Be Vietnam Pro",
          fontSize: 24,
          fontWeight: "900",
          fill: 0xffea00, // Gold yellow
          stroke: { color: 0x5d4037, width: 4 }, // Dark brown stroke
          align: "center",
        }),
        resolution: 3,
      });
      floatText.anchor.set(0.5);
    }

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
        if (this.gamePlayContainer.destroyed) return;
        this.gamePlayContainer.removeChild(floatText);
        this.floatTextPool.push(floatText);
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
        fontFamily: "Be Vietnam Pro",
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
            fontFamily: "Be Vietnam Pro",
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
      "/assest/image/imagenobackgrd/001_avatar_laclac.webp";

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
        url: `/assest/image/imagenobackgrd/${idxStr}_avatar_${avatarNames[i]}.webp`,
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

    this.mainMenuContainer.visible = false;
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
      if (newState === "MAIN_MENU") {
        const menuAvatarImg = document.getElementById("menu-avatar-img");
        if (menuAvatarImg) {
          menuAvatarImg.src = "/assest/image/player_pet/run/run-01.webp";
        }
      }
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
    this.duckInputHeld = false;
    this.duckMinTime = 0;
    this.lastMilestoneScore = 0;

    // Begin every new round from the first authored run frame.
    this.currentPlayerAnimation = null;
    this.setPlayerAnimation("run");

    const sh = this.app.screen.height || 600;
    this.playerY = this.getGroundLevel(sh);

    // ── Wink: start a new round ──
    this._winkRound = winkGame.startRound();

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

    // Determine scrolling speed: full speed in-game, ambient speed on Main Menu, frozen (0) on popups/modals
    let activeScrollSpeed = 0;
    if (this.gameState === "PLAYING" && !this.isAdShowing) {
      activeScrollSpeed = this.speed;
    } else if (this.gameState === "MAIN_MENU") {
      activeScrollSpeed = 3.5;
    } else {
      activeScrollSpeed = 0; // Freeze background when popup/modal is open
    }

    // Two texture layers provide enough depth while keeping draw calls and
    // texture memory low on mobile devices.
    if (activeScrollSpeed > 0) {
      if (this.parallaxSkySprite && this.parallaxSkySprite.tilePosition) {
        this.parallaxSkySprite.tilePosition.x -=
          activeScrollSpeed * elapsed * 0.035;
      }
      if (this.parallaxHillsSprite && this.parallaxHillsSprite.tilePosition) {
        this.parallaxHillsSprite.tilePosition.x -=
          activeScrollSpeed * elapsed * 0.22;
      }
    }

    if (this.gameState === "PLAYING" && !this.isAdShowing) {
      this.updateGameplay(elapsed);
    }
  }

  updateGameplay(elapsed) {
    this.gameTime += elapsed / 60; // elapsed is around 1 per frame (60fps)

    // A mobile swipe is a gesture, not a held pointer. Keep the slide active
    // long enough to clear one flying obstacle after the finger is released.
    if (this.duckMinTime > 0) {
      this.duckMinTime = Math.max(0, this.duckMinTime - elapsed / 60);
    }
    if (!this.duckInputHeld && this.duckMinTime <= 0) {
      this.isDucking = false;
    }

    // Gradual speed ramping
    this.speed = 6 + this.gameTime * 0.15;
    if (this.speed > 13) this.speed = 13;

    // Score increments
    this.score += 0.15 * elapsed;
    const currentIntScore = Math.floor(this.score);
    if (currentIntScore !== this.lastIntScore) {
      this.lastIntScore = currentIntScore;
      this.scoreText.text = `ĐIỂM: ${currentIntScore}`;
      const domScoreVal = document.getElementById("hud-score-val");
      if (domScoreVal) {
        domScoreVal.innerText = `${currentIntScore}`;
      } else {
        const domScore = document.getElementById("hud-score");
        if (domScore) domScore.innerText = `ĐIỂM: ${currentIntScore}`;
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
    const groundLevel = this.getGroundLevel(sh);

    if (this.isJumping) {
      this.playerVy += this.gravity * elapsed;
      this.playerY += this.playerVy * elapsed;

      if (this.playerY >= groundLevel) {
        this.playerY = groundLevel;
        this.playerVy = 0;
        this.isJumping = false;
      }
    } else {
      this.playerY = groundLevel;
      this.playerVy = 0;
    }

    // Position player and select the authored 2D frame animation.
    if (this.playerSprite) {
      this.playerSprite.position.set(sw * 0.2, this.playerY);

      if (this.isJumping) {
        const jumpHeight = Math.max(0, groundLevel - this.playerY);
        const shadowFactor = Math.max(0.2, 1 - jumpHeight / 180);
        if (this.playerShadow) {
          this.playerShadow.scale.set(shadowFactor, shadowFactor);
          this.playerShadow.alpha = 0.35 * shadowFactor;
        }
      } else if (this.isDucking) {
        if (this.playerShadow) {
          this.playerShadow.scale.set(1.4, 0.8);
          this.playerShadow.alpha = 0.45;
        }

        // Sliding dust
        this.dustTimer = (this.dustTimer || 0) + elapsed;
        if (this.dustTimer >= 4) {
          this.dustTimer = 0;
          this.spawnDustParticle(sw * 0.2 - 15, groundLevel + 4);
        }
      } else if (this.gameState === "PLAYING") {
        if (this.playerShadow) {
          this.playerShadow.scale.set(
            1 + Math.sin(this.gameTime * 8) * 0.08,
            1,
          );
          this.playerShadow.alpha = 0.35;
        }

        // Dust puffs at feet
        this.dustTimer = (this.dustTimer || 0) + elapsed;
        if (this.dustTimer >= 7) {
          this.dustTimer = 0;
          this.spawnDustParticle(sw * 0.2 - 12, groundLevel);
        }
      }

      if (this.playerAnimations && this.gameState === "PLAYING") {
        const action = this.isJumping
          ? "jump"
          : this.isDucking
            ? "slide"
            : "run";
        this.setPlayerAnimation(action);
      }

      // Update shield overlay
      if (this.playerShieldGraphics) {
        if (this.shieldTime > 0) {
          this.shieldTime -= elapsed;
          this.playerShieldGraphics.visible = true;
          const pulseScale = 1.0 + Math.sin(this.gameTime * 15) * 0.125;
          this.playerShieldGraphics.scale.set(pulseScale);
        } else {
          this.playerShieldGraphics.visible = false;
        }
      }

      // One constant scale for all states prevents run/slide size popping.
      this.playerSprite.scale.set(scale * 0.48);
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
            this.returnObstacleToPool(obs);
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
        this.returnObstacleToPool(obs);
        this.obstacles.splice(i, 1);
      }
    }
  }

  returnObstacleToPool(obs) {
    const type = obs.type;
    if (type === 0) {
      this.obstaclePool0.push(obs.sprite);
    } else if (type === 1) {
      this.obstaclePool1.push(obs.sprite);
    } else if (type === 2) {
      this.obstaclePool2.push(obs.sprite);
    } else if (type === 3) {
      this.obstaclePool3.push(obs.sprite);
    } else {
      obs.sprite.destroy({ children: true });
    }
  }

  spawnObstacle() {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1.0, sw / 450, sh / 650);
    const groundLevel = this.getGroundLevel(sh);

    // Obstacle/Item types: 0 (Ground set A), 1 (Ground set B), 2 (Flying), 3 (Collectible)
    let type = Math.floor(Math.random() * 4);

    // Flying obstacles only appear after 100 points
    if (this.score < 100 && type === 2) {
      type = Math.floor(Math.random() * 2); // 0 or 1
    }

    let container;
    let sprite;
    let aura;

    let spawnY = groundLevel;
    let width = 60 * scale;
    let height = 60 * scale;
    let baseY = groundLevel;
    let groundOffset = 0;
    let displayHeight = 60;
    let isSlipper = false;

    if (type === 0) {
      // Ground Set A: compact, unmistakable natural hazards.
      const choices = [
        {
          path: "/assest/image/obstacles/stone.webp",
          h: 48,
        },
        {
          path: "/assest/image/obstacles/crate.webp",
          h: 66,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];
      if (this.obstaclePool0.length > 0) {
        container = this.obstaclePool0.pop();
        sprite = container.children[0];
      } else {
        container = new Container();
        sprite = new Sprite();
        container.addChild(sprite);
      }

      sprite.texture = Sprite.from(selected.path).texture;
      displayHeight = selected.h;
      const artScale = (displayHeight * scale) / sprite.texture.height;
      sprite.scale.set(artScale);
      sprite.anchor.set(0.5, 1);
      sprite.position.set(0, 0);
      sprite.rotation = 0;

      width = sprite.texture.width * artScale;
      height = sprite.texture.height * artScale;
    } else if (type === 1) {
      // Ground Set B: high-contrast danger silhouettes, also ground-aligned.
      const choices = [
        {
          path: "/assest/image/obstacles/rock-monster.webp",
          h: 70,
        },
        {
          path: "/assest/image/obstacles/spikes.webp",
          h: 42,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];
      if (this.obstaclePool1.length > 0) {
        container = this.obstaclePool1.pop();
        sprite = container.children[0];
      } else {
        container = new Container();
        sprite = new Sprite();
        container.addChild(sprite);
      }

      sprite.texture = Sprite.from(selected.path).texture;
      displayHeight = selected.h;
      const artScale = (displayHeight * scale) / sprite.texture.height;
      sprite.scale.set(artScale);
      sprite.anchor.set(0.5, 1);
      sprite.position.set(0, 0);
      sprite.rotation = 0;

      width = sprite.texture.width * artScale;
      height = sprite.texture.height * artScale;
    } else if (type === 2) {
      // Flying Obstacles: Throwing chairs and slippers (Enlarged)
      const choices = [
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.webp",
          w: 85,
          h: 85,
          slipper: true,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.webp",
          w: 85,
          h: 85,
          slipper: true,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];

      const isHighSlipper = Math.random() > 0.5;
      // The lower lane still hits a standing player, but now leaves a clear
      // visual gap over the authored slide pose on every responsive scale.
      groundOffset = -(isHighSlipper ? 155 : 105);
      spawnY = groundLevel + groundOffset * scale;
      baseY = spawnY;
      displayHeight = selected.h;
      width = selected.w * scale;
      height = selected.h * scale;

      if (this.obstaclePool2.length > 0) {
        container = this.obstaclePool2.pop();
        sprite = container.children[0];
        gsap.killTweensOf(sprite);
      } else {
        container = new Container();
        sprite = new Sprite();
        container.addChild(sprite);
      }

      sprite.texture = Sprite.from(selected.path).texture;
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
      sprite.anchor.set(0.5, 0.5);
      sprite.y = 0; // reset y from previous gsap
      sprite.rotation = 0;

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
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).webp",
          w: 80,
          h: 80,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.webp",
          w: 80,
          h: 80,
        },
        {
          path: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.webp",
          w: 60,
          h: 90,
        },
      ];
      const selected = choices[Math.floor(Math.random() * choices.length)];

      groundOffset = -(Math.random() > 0.5 ? 24 : 80);
      spawnY = groundLevel + groundOffset * scale;
      baseY = spawnY;
      displayHeight = selected.h;
      width = selected.w * scale;
      height = selected.h * scale;

      if (this.obstaclePool3.length > 0) {
        container = this.obstaclePool3.pop();
        aura = container.children[0];
        sprite = container.children[1];
        aura.clear();
      } else {
        container = new Container();
        aura = new Graphics();
        sprite = new Sprite();
        container.addChild(aura);
        container.addChild(sprite);
      }

      // Glowing yellow/white cartoon aura behind collectible item for high contrast
      aura
        .circle(0, 0, Math.max(width, height) * 0.52)
        .fill({ color: 0xffea00, alpha: 0.4 })
        .stroke({ color: 0xffffff, width: 3, alpha: 0.9 });
      aura.scale.set(1); // reset scale

      sprite.texture = Sprite.from(selected.path).texture;
      sprite.width = selected.w * scale;
      sprite.height = selected.h * scale;
      sprite.anchor.set(0.5, 0.5);
      sprite.rotation = 0; // reset rotation
      container.scale.set(1);
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
      groundOffset: groundOffset,
      displayHeight: displayHeight,
      bobTimer: Math.random() * Math.PI,
      isSlipper: isSlipper,
    });
  }

  checkCollision(obs) {
    if (!this.playerSprite) return false;

    // Chairs and slippers are the dedicated slide-under obstacle. Avoid a
    // borderline AABB overlap from their rotating transparent canvas once the
    // player has successfully entered the duck/slide state.
    if (obs.type === 2 && this.isDucking) return false;

    // Use a gameplay hitbox around the body, excluding hair and outstretched
    // limbs so the collision remains fair to the illustrated silhouette.
    const playerPos = this.playerSprite.getGlobalPosition();
    const playerScale = Math.abs(this.playerSprite.worldTransform.a) || 1;
    const hitWidth = (this.isDucking ? 174 : 96) * playerScale;
    const hitHeight = (this.isDucking ? 104 : 190) * playerScale;
    const hitCenterX = playerPos.x + (this.isDucking ? 16 : 10) * playerScale;
    const px1 = hitCenterX - hitWidth / 2;
    const px2 = hitCenterX + hitWidth / 2;
    const py1 = playerPos.y - hitHeight;
    const py2 = playerPos.y - 4 * playerScale;
    const oBounds = obs.sprite.getBounds();

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
    this.gameOverScoreText.text = `${finalScore}`;

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
      this.gameOverMsgText.text = "👑 KỶ LỤC MỚI CỦA CÁO NHỎ! 👑";
      this.gameOverMsgText.style.fill = 0xffea00;
      this.gameOverMsgText.visible = true;
    } else {
      this.gameOverMsgText.text = "";
      this.gameOverMsgText.visible = false;
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

    if (data.length === 0) {
      const emptyText = new Text({
        text: "Chưa có thành tích.\nHãy chơi để thiết lập kỷ lục đầu tiên.",
        style: new TextStyle({
          fontFamily: "Be Vietnam Pro",
          fontSize: 16,
          fill: "#5D4037",
          align: "center",
        }),
      });
      emptyText.anchor.set(0.5);
      emptyText.position.set(0, -42);
      this.leadersContainer.addChild(emptyText);
    }

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
          fontFamily: "Be Vietnam Pro",
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
          fontFamily: "Be Vietnam Pro",
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
          fontFamily: "Be Vietnam Pro",
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
          fontFamily: "Be Vietnam Pro",
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
          fontFamily: "Be Vietnam Pro",
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
          fontFamily: "Be Vietnam Pro",
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
    const groundLevel = this.getGroundLevel(sh);
    const modalScale = Math.min(1.0, (sw - 32) / 460, (sh - 40) / 600);

    if (this.parallaxSkySprite || this.parallaxHillsSprite) {
      this.bgOverlay.cacheAsTexture(false);
      this.bgOverlay.clear();
      this.distantMountains.clear();
      this.midMountains.clear();
      this.closeMountains.clear();

      // Layer 0: Sky and distant mountains.
      if (this.parallaxSkySprite) {
        const skyH = groundLevel;
        this.parallaxSkySprite.visible = true;
        this.parallaxSkySprite.width = sw;
        this.parallaxSkySprite.height = skyH;
        this.parallaxSkySprite.y = 0;
        const texH = this.parallaxSkySprite.texture?.height || 1024;
        const s = skyH / texH;
        this.parallaxSkySprite.tileScale.set(s, s);
      }

      // Layer 1: low-detail foreground hills.
      if (this.parallaxHillsSprite) {
        const h = groundLevel * FOREGROUND_HILLS_HEIGHT_RATIO;
        this.parallaxHillsSprite.visible = true;
        this.parallaxHillsSprite.width = sw;
        this.parallaxHillsSprite.height = h;
        this.parallaxHillsSprite.y = groundLevel - h;
        const texH = this.parallaxHillsSprite.texture?.height || 1024;
        const s = h / texH;
        this.parallaxHillsSprite.tileScale.set(s, s);
      }

      // Cached road: it never changes between resizes, so it costs no per-frame
      // geometry rebuilding and replaces the former third texture layer.
      this.bgOverlay
        .rect(0, groundLevel, sw, sh - groundLevel)
        .fill({ color: 0x8c5a3c });
      this.bgOverlay.rect(0, groundLevel, sw, 9).fill({ color: 0x5a9b48 });
      this.bgOverlay
        .rect(0, groundLevel + 12, sw, 3)
        .fill({ color: 0xb9784e, alpha: 0.5 });
      this.bgOverlay
        .rect(0, groundLevel + 38, sw, 2)
        .fill({ color: 0x70432f, alpha: 0.26 });
      this.bgOverlay.cacheAsTexture(true);
    } else {
      // Redraw and scale fluffy white cartoon clouds (fallback)
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
      this.bgOverlay.setStrokeStyle({
        width: 2.0,
        color: 0x388e3c,
        alpha: 0.45,
      });
      this.bgOverlay.moveTo(0, groundLevel).lineTo(sw, groundLevel).stroke();

      // Traditional lacquer wave details below ground
      const waveHeight = 8;
      const waveLength = 36;
      const yBase = groundLevel + 12;
      this.bgOverlay.setStrokeStyle({
        width: 1.5,
        color: 0x5d4037,
        alpha: 0.25,
      });
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
    }

    const scale = Math.min(1.0, sw / 450, sh / 650);

    // Adjust player base Y
    if (!this.isJumping) {
      this.playerY = groundLevel;
    }

    // Existing actors also snap back to the same baseline after a responsive
    // resize; previously only newly spawned obstacles used the new screen Y.
    this.obstacles.forEach((obstacle) => {
      obstacle.baseY = groundLevel + (obstacle.groundOffset || 0) * scale;
      obstacle.sprite.y =
        obstacle.type === 3
          ? obstacle.baseY + Math.sin(obstacle.bobTimer || 0) * 12 * scale
          : obstacle.baseY;

      if (obstacle.type === 0 || obstacle.type === 1) {
        const art = obstacle.sprite.children[0];
        if (art?.texture?.height && obstacle.displayHeight) {
          const artScale =
            (obstacle.displayHeight * scale) / art.texture.height;
          art.scale.set(artScale);
          obstacle.width = art.texture.width * artScale;
          obstacle.height = art.texture.height * artScale;
        }
      }
    });

    // ==========================================
    // Resize MAIN MENU
    // ==========================================
    if (this.gameState === "MAIN_MENU") {
      this.menuMascotFrame.position.set(sw / 2, sh * 0.18);
      this.menuMascotFrame.scale.set(scale);

      // The menu and gameplay intentionally share one recognizable runner.
      Assets.load("/assest/image/player_pet/run/run-01.webp")
        .then((tex) => {
          if (!this.menuMascotSprite.destroyed) {
            this.menuMascotSprite.texture = tex;
            const mascotScale = Math.min(112 / tex.width, 112 / tex.height);
            this.menuMascotSprite.scale.set(mascotScale);
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
      this.scoreText.position.set(20 * scale, 30 * scale);

      this.highScoreText.style.fontSize = Math.max(
        12,
        Math.min(16, 16 * scale),
      );
      this.highScoreText.position.set(20 * scale, 65 * scale);

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
        this.duckInputHeld = true;
        this.isDucking = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.gameState !== "PLAYING") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.duckInputHeld = false;
        if (this.duckMinTime <= 0) this.isDucking = false;
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
          this.duckMinTime = SWIPE_DUCK_DURATION;
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
        if (this.duckMinTime <= 0) this.isDucking = false;
        this.isSwiping = false;
      }
    });
    this.app.stage.on("pointerupoutside", () => {
      if (this.gameState === "PLAYING") {
        if (this.duckMinTime <= 0) this.isDucking = false;
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
    const currentScore = Math.floor(this.score);
    const domScoreVal = document.getElementById("hud-score-val");
    if (domScoreVal) {
      domScoreVal.innerText = `${currentScore}`;
    } else {
      const domScore = document.getElementById("hud-score");
      if (domScore)
        domScore.innerText = i18n.t("hud.score", { score: currentScore });
    }

    const domHighScoreVal = document.getElementById("hud-highscore-val");
    if (domHighScoreVal) {
      domHighScoreVal.innerText = `${this.highScore}`;
    } else {
      const domHighScore = document.getElementById("hud-highscore");
      if (domHighScore)
        domHighScore.innerText = i18n.t("hud.best", { score: this.highScore });
    }

    const menuHighScoreVal = document.getElementById("menu-highscore-text");
    if (menuHighScoreVal) {
      menuHighScoreVal.innerText = i18n.t("menu.highScore", {
        score: this.highScore,
      });
    } else {
      const menuHighScoreText = document.getElementById("menu-highscore");
      if (menuHighScoreText) {
        menuHighScoreText.innerText = i18n.t("menu.highScore", {
          score: this.highScore,
        });
      }
    }
  }

  syncLanguage() {
    // 1. DOM Main Menu Title Signboard
    const titleParts = (i18n.t("game.title") || "CÁO NHỎ\nPHIÊU LƯU KÝ").split(
      "\n",
    );
    const line1 = document.querySelector(".title-line-1");
    if (line1) line1.textContent = titleParts[0] || "CÁO NHỎ";
    const line2 = document.querySelector(".title-line-2");
    if (line2) line2.textContent = titleParts[1] || "PHIÊU LƯU KÝ";

    // 2. DOM HUD labels
    const hudScoreLabel = document.querySelector("#hud-score .hud-badge-label");
    if (hudScoreLabel) {
      hudScoreLabel.textContent =
        i18n.t("hud.score", { score: "" }).replace(":", "").trim() + ":";
    }
    const hudHighscoreLabel = document.querySelector(
      "#hud-highscore .hud-badge-label",
    );
    if (hudHighscoreLabel) {
      hudHighscoreLabel.textContent =
        i18n.t("hud.best", { score: "" }).replace(":", "").trim() + ":";
    }

    if (this.menuTitleText && !this.menuTitleText.destroyed) {
      this.menuTitleText.text = i18n.t("game.title").replace("\n", " ");
    }
    if (this.menuHighScoreText && !this.menuHighScoreText.destroyed) {
      this.menuHighScoreText.text = `🏆 ${i18n.t("menu.highScore", {
        score: this.highScore,
      })}`;
    }
    if (this.playBtn && typeof this.playBtn.setLabelText === "function") {
      this.playBtn.setLabelText(i18n.t("menu.play"));
    }
    if (this.scoreText && !this.scoreText.destroyed) {
      this.scoreText.text = i18n.t("hud.score", {
        score: Math.floor(this.score || 0),
      });
    }
    if (this.highScoreText && !this.highScoreText.destroyed) {
      this.highScoreText.text = i18n.t("hud.best", {
        score: this.highScore || 0,
      });
    }
    if (this.settingsTitle && !this.settingsTitle.destroyed) {
      this.settingsTitle.text = i18n.t("settings.title");
    }
    if (this.settingsVersionText && !this.settingsVersionText.destroyed) {
      this.settingsVersionText.text = i18n.t("settings.version");
    }
    if (this.instructionsTitle && !this.instructionsTitle.destroyed) {
      this.instructionsTitle.text = i18n.t("instructions.title");
    }
    if (
      this.instructionsUnderstandBtn &&
      typeof this.instructionsUnderstandBtn.setLabelText === "function"
    ) {
      this.instructionsUnderstandBtn.setLabelText(i18n.t("instructions.gotIt"));
    }
    if (this.charTitle && !this.charTitle.destroyed) {
      this.charTitle.text = i18n.t("charSelect.title");
    }
    if (this.gameOverTitle && !this.gameOverTitle.destroyed) {
      this.gameOverTitle.text = i18n.t("gameover.title");
    }
    if (this.pauseTitle && !this.pauseTitle.destroyed) {
      this.pauseTitle.text = i18n.t("pause.title");
    }

    this.syncDOMScoreAndHighScore();

    const menuPlayBtn = document.getElementById("menu-play-btn");
    if (menuPlayBtn) {
      menuPlayBtn.innerText = i18n.t("menu.play");
    }

    const achievementsBtn = document.getElementById("menu-btn-achievements");
    if (achievementsBtn) {
      achievementsBtn.setAttribute("aria-label", i18n.t("menu.leaderboard"));
    }

    const instructionsBtn = document.getElementById("menu-btn-instructions");
    if (instructionsBtn) {
      instructionsBtn.setAttribute("aria-label", i18n.t("menu.instructions"));
    }

    const settingsBtn = document.getElementById("menu-btn-settings");
    if (settingsBtn) {
      settingsBtn.setAttribute("aria-label", i18n.t("menu.settings"));
    }

    const hudPauseBtn = document.getElementById("hud-pause-btn");
    if (hudPauseBtn) {
      hudPauseBtn.setAttribute("aria-label", i18n.t("pause.title"));
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
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          background: url(/assest/iconbtn/close_btn.webp) no-repeat center center;
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
          font-family:Be Vietnam Pro, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #4E342E;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .game-settings-language-row {
          width: 100%;
          height: 64px;
          padding: 0 16px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 3px solid #fff;
          border-radius: 12px;
          background: #fbfaf5;
          margin-bottom: 12px;
        }
        .game-settings-language-row .game-settings-label,
        .game-settings-language-row span {
          color: #47363b;
          font-size: 17px;
          letter-spacing: 0.8px;
          font-weight: bold;
        }
        .game-settings-language-select {
          width: 136px;
          height: 42px;
          flex: 0 0 136px;
          padding: 0 32px 0 16px;
          appearance: none;
          -webkit-appearance: none;
          border: 2px solid #72d58f;
          border-radius: 21px;
          color: #1b365d;
          background-color: #fbfaf5;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M2 2l5 5 5-5' fill='none' stroke='%2325a653' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"),
            linear-gradient(180deg, #fffef9 0%, #edf7ef 100%);
          background-repeat: no-repeat;
          background-position:
            right 12px center,
            center;
          background-size:
            14px 9px,
            100% 100%;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-shadow: none;
          cursor: pointer;
          outline: none;
          box-shadow:
            inset 0 2px 0 rgba(255, 255, 255, 0.9),
            0 3px 0 #2b9b50,
            0 6px 10px rgba(36, 24, 42, 0.14);
          transition:
            filter 0.12s ease,
            border-color 0.12s ease,
            box-shadow 0.1s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .game-settings-language-select option {
          color: #1b365d;
          background: #fbfaf5;
          font-weight: 700;
          text-shadow: none;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
          font-size: 44px;
          font-weight: 900;
          color: #E65100;
          margin: 4px 0 10px 0;
          letter-spacing: 1.5px;
          line-height: 1.1;
          text-shadow: 0 3px 0 #8C2500, 0 6px 12px rgba(0,0,0,0.15);
        }
        .game-over-msg {
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #4E342E;
        }
        .game-achievements-name.player {
          color: #FBC02D;
        }
        .game-achievements-score {
          font-family:Be Vietnam Pro, sans-serif;
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
          font-family:Be Vietnam Pro, sans-serif;
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
          box-sizing: border-box;
        }
        .game-instructions-row {
          background: #ffffff;
          border: 2.5px solid #FFE0B2;
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-sizing: border-box;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          transition: transform 0.15s ease;
        }
        .game-instructions-row:active {
          transform: scale(0.97);
        }
        .game-instructions-emoji {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          font-size: 20px;
          line-height: 1;
        }
        .game-instructions-emoji.danger {
          background: linear-gradient(135deg, #FFCDD2, #EF9A9A);
          border: 2px solid #E57373;
        }
        .game-instructions-emoji.collect {
          background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
          border: 2px solid #66BB6A;
        }
        .game-instructions-emoji.shield {
          background: linear-gradient(135deg, #BBDEFB, #90CAF9);
          border: 2px solid #42A5F5;
        }
        .game-instructions-text {
          font-family:Be Vietnam Pro, sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: #4E342E;
          text-align: left;
          line-height: 1.3;
        }
        .game-instructions-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }
        .game-instructions-tag.jump {
          background: #FFF3E0; color: #E65100;
        }
        .game-instructions-tag.duck {
          background: #E8F5E9; color: #2E7D32;
        }
        .game-instructions-tag.bonus {
          background: #F3E5F5; color: #7B1FA2;
        }
        .game-instructions-tag.power {
          background: #E3F2FD; color: #1565C0;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Bind avatar data and helper methods to GameController prototype
GameController.prototype.LEFT_FACING_AVATARS = LEFT_FACING_AVATARS;
GameController.prototype.AVATAR_BOUNDS = AVATAR_BOUNDS;
GameController.prototype.getAvatarColors = getAvatarColors;
GameController.prototype.getAvatarCrop = getAvatarCrop;
GameController.prototype.createSkeletalPart = createSkeletalPart;
GameController.prototype.updatePlayerLeg = updatePlayerLeg;
GameController.prototype.updatePlayerArm = updatePlayerArm;
GameController.prototype.updatePlayerBody = updatePlayerBody;

GameController.prototype.updateSkeletalRigTexture = function (tex, url) {
  updateSkeletalRigTexture(tex, url, {
    fullCharSprite: this.fullCharSprite,
    head: this.playerHead,
    body: this.playerBody,
    leftArm: this.leftArm,
    rightArm: this.rightArm,
    leftLeg: this.leftLeg,
    rightLeg: this.rightLeg,
  });
};

// Bind HTML overlay methods to GameController prototype
GameController.prototype.injectHTMLPopupStyles = injectHTMLPopupStyles;
GameController.prototype.showHTMLSettings = function () {
  showHTMLSettings(this);
};
GameController.prototype.hideHTMLSettings = hideHTMLSettings;
GameController.prototype.showHTMLPaused = function () {
  showHTMLPaused(this);
};
GameController.prototype.hideHTMLPaused = hideHTMLPaused;
GameController.prototype.showHTMLReviveOffer = function (onRevive, onSkip) {
  showHTMLReviveOffer(this, onRevive, onSkip);
};
GameController.prototype.hideHTMLReviveOffer = hideHTMLReviveOffer;
GameController.prototype.showHTMLGameOver = function () {
  // ── Wink: complete round + submit score ──
  if (this._winkRound) {
    winkGame.completeRound(this._winkRound, {
      metadata: { outcome: "game_over", score: Math.floor(this.score) },
    });
    if (winkGame.canSubmitScore) {
      winkGame
        .submitFinalScore({
          score: Math.floor(this.score),
          playTime: Math.round(
            (Date.now() - this._winkRound.startedAtMs) / 1000,
          ),
          gameMode: "classic",
        })
        .catch(() => {});
    }
  }

  showHTMLGameOver(this);
};
GameController.prototype.hideHTMLGameOver = hideHTMLGameOver;
GameController.prototype.showHTMLAchievements = function () {
  showHTMLAchievements(this);
};
GameController.prototype.hideHTMLAchievements = hideHTMLAchievements;
GameController.prototype.showHTMLCharSelect = function () {
  showHTMLCharSelect(this);
};
GameController.prototype.hideHTMLCharSelect = hideHTMLCharSelect;
GameController.prototype.showHTMLInstructions = function () {
  showHTMLInstructions(this);
};
GameController.prototype.hideHTMLInstructions = hideHTMLInstructions;
