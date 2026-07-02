class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;

    this.bgm = null;
    this.sfxHit = null;
    this.sfxBird = null;
    this.sfxJump = null;
    this.sfxSlide = null;
    this.sfxCoin = null;
    this.sfxMilestone = null;
    this.sfxClick = null;
    this.sfxGameOver = null;
    this.sfxCollect = null;

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
      }

      // Giảm nhạc nền, sử dụng GainNode
      this.bgm = this._createAudio(
        "/assest/music/music.mp3",
        true,
        0.05,
        this.bgmGain,
      );

      // SFX
      this.sfxHit = this._createAudio(
        "/assest/music/CharHit.mp3",
        false,
        0.8,
        this.sfxGain,
      );
      this.sfxBird = this._createAudio(
        "/assest/music/Throw.mp3",
        false,
        0.7,
        this.sfxGain,
      );
      this.sfxJump = this._createAudio(
        "/assest/music/Jump.mp3",
        false,
        0.7,
        this.sfxGain,
      );
      this.sfxSlide = this._createAudio(
        "/assest/music/SurfMud1.mp3",
        false,
        0.7,
        this.sfxGain,
      );
      this.sfxCoin = this._createAudio(
        "/assest/music/Button1.mp3",
        false,
        0.8,
        this.sfxGain,
      );

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

  _createAudio(src, loop, volume, gainNode) {
    const audio = new Audio(src);
    audio.loop = loop;

    if (this.ctx && gainNode) {
      // Connect to Web Audio API
      const source = this.ctx.createMediaElementSource(audio);

      // Individual gain for this specific sound
      const localGain = this.ctx.createGain();
      localGain.gain.value = volume;

      source.connect(localGain);
      localGain.connect(gainNode);
    } else {
      // Fallback
      audio.volume = volume;
    }
    return audio;
  }

  syncMuteState() {
    if (this.ctx) {
      this.bgmGain.gain.value = this.musicMuted ? 0 : 1;
    }

    if (this.bgm && !this.musicMuted) {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.bgm.play().catch((e) => console.log(e));
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

  _playSfx(audioElement) {
    if (!this.initialized) this.init();
    if (this.sfxMuted || !audioElement) return;
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    audioElement.currentTime = 0;
    audioElement.play().catch((e) => console.log(e));
  }

  playJump() {
    this._playSfx(this.sfxJump);
  }

  playSlide() {
    this._playSfx(this.sfxSlide);
  }

  playCollision() {
    this._playSfx(this.sfxHit);
  }

  playBird() {
    this._playSfx(this.sfxBird);
  }

  playCoin() {
    this._playSfx(this.sfxCoin);
  }

  playMilestone() {
    if (!this.initialized) this.init();
    if (!this.sfxMilestone) {
      this.sfxMilestone = this._createAudio(
        "/assest/music/LevelUp.mp3",
        false,
        0.6,
        this.sfxGain,
      );
    }
    this._playSfx(this.sfxMilestone);
  }

  playClick() {
    if (!this.initialized) this.init();
    if (!this.sfxClick) {
      this.sfxClick = this._createAudio(
        "/assest/music/Button3.mp3",
        false,
        0.5,
        this.sfxGain,
      );
    }
    this._playSfx(this.sfxClick);
  }

  playGameOver() {
    if (!this.initialized) this.init();
    if (this.bgm) this.bgm.pause(); // Tạm dừng nhạc nền khi có nhạc Game Over

    // Nhạc Game Over thuộc về nhạc nền, không phải SFX
    if (this.musicMuted) return;

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (!this.sfxGameOver) {
      // Connect to bgmGain because it's technically music
      this.sfxGameOver = this._createAudio(
        "/assest/music/EndGame.wav",
        false,
        0.5,
        this.bgmGain,
      );
    }
    this.sfxGameOver.currentTime = 0;
    this.sfxGameOver.play().catch((e) => console.log(e));
  }

  stopGameOver() {
    if (this.sfxGameOver) {
      this.sfxGameOver.pause();
      this.sfxGameOver.currentTime = 0;
    }
  }

  playCollect() {
    if (!this.initialized) this.init();
    if (!this.sfxCollect) {
      this.sfxCollect = this._createAudio(
        "/assest/music/LabelCollect.mp3",
        false,
        0.5,
        this.sfxGain,
      );
    }
    this._playSfx(this.sfxCollect);
  }
}

export const audio = new AudioManager();
