class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;

    this.bgm = null;
    this.sfxGameOver = null;

    this.sfxBuffers = {};
    this.sfxVolumes = {
      hit: 0.8,
      bird: 0.7,
      jump: 0.7,
      slide: 0.7,
      coin: 0.8,
      milestone: 0.6,
      click: 0.5,
      collect: 0.5,
    };

    this.musicMuted = false;
    this.sfxMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.bgmGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);

        // Mute states
        this.bgmGain.gain.value = this.musicMuted ? 0 : 1;
        this.sfxGain.gain.value = this.sfxMuted ? 0 : 1;

        // Load SFX Buffers
        this._loadSfxBuffer("hit", "/assest/music/CharHit.mp3");
        this._loadSfxBuffer("bird", "/assest/music/Throw.mp3");
        this._loadSfxBuffer("jump", "/assest/music/Jump.mp3");
        this._loadSfxBuffer("slide", "/assest/music/SurfMud1.mp3");
        this._loadSfxBuffer("coin", "/assest/music/Button1.mp3");
        this._loadSfxBuffer("milestone", "/assest/music/LevelUp.mp3");
        this._loadSfxBuffer("click", "/assest/music/Button3.mp3");
        this._loadSfxBuffer("collect", "/assest/music/LabelCollect.mp3");
      }

      // Cấu hình BGM qua Web Audio API để đồng bộ âm lượng trên iOS
      this.bgm = new Audio("/assest/music/music.mp3");
      this.bgm.loop = true;

      const source = this.ctx.createMediaElementSource(this.bgm);
      const localGain = this.ctx.createGain();
      localGain.gain.value = 0.05; // Giảm âm lượng nhạc nền xuống 5%
      source.connect(localGain);
      localGain.connect(this.bgmGain);

      // Play once and never pause it to prevent iOS Safari bug
      this.ctx.resume().then(() => {
        this.bgm.play().catch((e) => console.log("BGM play deferred:", e));
      });
    } catch (e) {
      console.warn("Audio initialization deferred/failed:", e);
    }
  }

  async _loadSfxBuffer(key, src) {
    try {
      const response = await window.fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const decodedData = await this.ctx.decodeAudioData(arrayBuffer);
      this.sfxBuffers[key] = decodedData;
    } catch (e) {
      console.log(`Failed to load SFX ${key}:`, e);
    }
  }

  // Đã gỡ bỏ _createAudio vì không còn dùng tới

  syncMuteState() {
    if (this.ctx) {
      this.sfxGain.gain.value = this.sfxMuted ? 0 : 1;
      this.bgmGain.gain.value = this.musicMuted ? 0 : 1;
      if (!this.musicMuted && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    this.syncMuteState();
    return this.musicMuted;
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    if (this.ctx) {
      this.sfxGain.gain.value = this.sfxMuted ? 0 : 1;
    }
    return this.sfxMuted;
  }

  toggleMute() {
    const state = this.toggleMusicMute();
    this.sfxMuted = state;
    if (this.ctx) {
      this.sfxGain.gain.value = this.sfxMuted ? 0 : 1;
    }
    return state;
  }

  get isMuted() {
    return this.musicMuted && this.sfxMuted;
  }

  /** Play SFX using AudioBufferSourceNode (no limits, perfect for mobile) */
  _playSfx(key) {
    if (!this.initialized) this.init();
    if (this.sfxMuted || !this.ctx || !this.sfxBuffers[key]) return null;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.sfxBuffers[key];

    const localGain = this.ctx.createGain();
    localGain.gain.value = this.sfxVolumes[key] || 0.5;

    source.connect(localGain);
    localGain.connect(this.sfxGain);

    source.start(0);
    return source;
  }

  playJump() {
    this._playSfx("jump");
  }

  playSlide() {
    this._playSfx("slide");
  }

  playCollision() {
    this._playSfx("hit");
  }

  playBird() {
    this._playSfx("bird");
  }

  playCoin() {
    this._playSfx("coin");
  }

  playMilestone() {
    this._playSfx("milestone");
  }

  playClick() {
    this._playSfx("click");
  }

  playCollect() {
    this._playSfx("collect");
  }

  playGameOver() {
    if (!this.initialized) this.init();
    if (this.ctx) {
      this.bgmGain.gain.value = 0; // Tắt tiếng nhạc nền thay vì pause
    }
  }

  stopGameOver() {
    if (this.ctx && !this.musicMuted) {
      this.bgmGain.gain.value = 1; // Khôi phục tiếng nhạc nền
    }
  }
}

export const audio = new AudioManager();
