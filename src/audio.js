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
        this._loadSfxBuffer("gameover", "/assest/music/EndGame.wav");
      }

      // Giảm nhạc nền (Không dùng MediaElementSource để tránh lỗi lặp nhạc iOS Safari)
      this.bgm = this._createAudio("/assest/music/music.mp3", true, 0.05);

      if (!this.musicMuted && this.bgm && this.ctx) {
        // Must resume context on interaction
        this.ctx.resume().then(() => {
          this.bgm
            .play()
            .catch((e) =>
              console.log("BGM play deferred until interaction:", e),
            );
        });
      } else if (!this.musicMuted && this.bgm) {
        this.bgm
          .play()
          .catch((e) => console.log("BGM play deferred until interaction:", e));
      }
    } catch (e) {
      console.warn("Audio initialization deferred/failed:", e);
    }
  }

  async _loadSfxBuffer(key, src) {
    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const decodedData = await this.ctx.decodeAudioData(arrayBuffer);
      this.sfxBuffers[key] = decodedData;
    } catch (e) {
      console.log(`Failed to load SFX ${key}:`, e);
    }
  }

  /** Create a single Audio element (for BGM / game-over) */
  _createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    return audio;
  }

  syncMuteState() {
    if (this.ctx) {
      this.sfxGain.gain.value = this.sfxMuted ? 0 : 1;
    }

    if (this.bgm) {
      this.bgm.muted = this.musicMuted;
      if (!this.musicMuted) {
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        this.bgm.play().catch((e) => console.log(e));
      } else {
        this.bgm.pause();
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
    if (this.bgm) this.bgm.pause(); // Tạm dừng nhạc nền khi có nhạc Game Over

    // Nhạc Game Over
    if (this.musicMuted && this.sfxMuted) return;

    this.sfxGameOverNode = this._playSfx("gameover");
  }

  stopGameOver() {
    if (this.sfxGameOverNode) {
      try {
        this.sfxGameOverNode.stop();
      } catch (e) {}
      this.sfxGameOverNode = null;
    }
  }
}

export const audio = new AudioManager();
