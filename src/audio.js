class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgm = null;
    this.musicMuted = false;
    this.sfxMuted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
      this.bgm = new Audio("/assest/music/music.mp3");
      this.bgm.loop = true;
      this.bgm.volume = 0.02; // Giảm nhạc nền cực nhỏ

      // SFX
      this.sfxHit = new Audio("/assest/music/CharHit.mp3");
      this.sfxHit.volume = 0.8;
      this.sfxBird = new Audio("/assest/music/Throw.mp3");
      this.sfxBird.volume = 0.7;
      this.sfxJump = new Audio("/assest/music/Jump.mp3");
      this.sfxJump.volume = 0.7;
      this.sfxCoin = new Audio("/assest/music/Button1.mp3");
      this.sfxCoin.volume = 0.8;

      if (!this.musicMuted && this.bgm) {
        this.bgm
          .play()
          .catch((e) => console.log("BGM play deferred until interaction:", e));
      }
    } catch (e) {
      console.warn("Audio initialization deferred/failed:", e);
    }
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    if (this.bgm) {
      if (this.musicMuted) {
        this.bgm.pause();
      } else {
        this.bgm.play().catch((e) => console.log("BGM resume error:", e));
      }
    }
    return this.musicMuted;
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    return this.sfxMuted;
  }

  toggleMute() {
    const state = this.toggleMusicMute();
    this.sfxMuted = state;
    return state;
  }

  get isMuted() {
    return this.musicMuted && this.sfxMuted;
  }
  playJump() {
    this.init();
    if (this.sfxMuted) return;
    this.sfxJump.currentTime = 0;
    this.sfxJump.play().catch(e => console.log(e));
  }

  playCollision() {
    this.init();
    if (this.sfxMuted) return;
    this.sfxHit.currentTime = 0;
    this.sfxHit.play().catch(e => console.log(e));
  }

  playBird() {
    this.init();
    if (this.sfxMuted) return;
    this.sfxBird.currentTime = 0;
    this.sfxBird.play().catch(e => console.log(e));
  }

  playCoin() {
    this.init();
    if (this.sfxMuted) return;
    this.sfxCoin.currentTime = 0;
    this.sfxCoin.play().catch(e => console.log(e));
  }
  playMilestone() {
    this.init();
    if (this.sfxMuted) return;
    if (!this.sfxMilestone) {
      this.sfxMilestone = new Audio("/assest/music/LevelUp.mp3");
      this.sfxMilestone.volume = 0.6;
    }
    this.sfxMilestone.currentTime = 0;
    this.sfxMilestone.play().catch(e => console.log(e));
  }

  playClick() {
    this.init();
    if (this.sfxMuted) return;
    if (!this.sfxClick) {
      this.sfxClick = new Audio("/assest/music/Button3.mp3");
      this.sfxClick.volume = 0.5;
    }
    this.sfxClick.currentTime = 0;
    this.sfxClick.play().catch(e => console.log(e));
  }

  playGameOver() {
    this.init();
    if (this.sfxMuted) return;
    if (!this.sfxGameOver) {
      this.sfxGameOver = new Audio("/assest/music/EndGame.wav");
      this.sfxGameOver.volume = 0.5;
    }
    this.sfxGameOver.currentTime = 0;
    this.sfxGameOver.play().catch(e => console.log(e));
  }

  playCollect() {
    this.init();
    if (this.sfxMuted) return;
    if (!this.sfxCollect) {
      this.sfxCollect = new Audio("/assest/music/LabelCollect.mp3");
      this.sfxCollect.volume = 0.5;
    }
    this.sfxCollect.currentTime = 0;
    this.sfxCollect.play().catch(e => console.log(e));
  }
}

export const audio = new AudioManager();
