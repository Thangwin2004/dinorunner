import { Assets } from "pixi.js";
import { audio } from "./audio";
import { saveStats, getStats, getLeaderboardData, AdManager } from "./utils";
import { getAvatarColors } from "./avatar";

export function injectHTMLPopupStyles() {
  if (document.getElementById("game-popup-styles")) return;

  const style = document.createElement("style");
  style.id = "game-popup-styles";
  style.textContent = `
    .game-popup-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .game-popup-card {
      background: #FFF8E1;
      border: 5px solid #F9A825;
      box-shadow: inset 0 0 0 2.5px #FFF59D, 0 6px 0 #F57F17, 0 12px 25px rgba(0, 0, 0, 0.35);
      border-radius: 20px;
      padding: 32px 24px 24px 24px;
      width: 85%; max-width: 320px;
      text-align: center;
      position: relative;
      transform: scale(0.85);
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease;
      opacity: 0;
      font-family: 'Fredoka', 'Baloo 2', 'Be Vietnam Pro', sans-serif;
      box-sizing: border-box;
    }
    .game-popup-card.wide {
      max-width: 440px;
      padding: 32px 16px 20px 16px;
    }
    .game-popup-title {
      position: absolute;
      top: -24px; left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(to bottom, #FFE500, #FF9900);
      border: 3px solid #FFF8B3;
      box-shadow: 0 4px 0 #8A4500, 0 6px 10px rgba(0,0,0,0.25);
      border-radius: 12px;
      color: #fff;
      font-size: 20px;
      font-weight: 900;
      padding: 6px 28px;
      text-shadow: 0 2px 3px rgba(0,0,0,0.3);
      letter-spacing: 2px;
      white-space: nowrap;
    }
    .game-popup-close-btn {
      position: absolute;
      top: -15px; right: -15px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #E53935;
      border: 3.5px solid #FFF;
      box-shadow: 0 3px 0 #B71C1C, 0 4px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex; justify-content: center; align-items: center;
      transition: transform 0.1s ease;
    }
    .game-popup-close-btn::before, .game-popup-close-btn::after {
      content: '';
      position: absolute;
      width: 16px; height: 3.5px;
      background: white;
      border-radius: 2px;
    }
    .game-popup-close-btn::before { transform: rotate(45deg); }
    .game-popup-close-btn::after { transform: rotate(-45deg); }
    .game-popup-close-btn:hover { transform: scale(1.1); }
    .game-popup-close-btn:active { transform: scale(0.9); }

    .game-settings-row-container {
      display: flex; flex-direction: column; gap: 12px;
      margin-top: 15px;
    }
    .game-settings-row {
      width: 100%; height: 56px;
      border-radius: 12px;
      background: #FFF;
      border: 2.5px solid #DDEAFF;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .game-settings-label {
      font-size: 17px; font-weight: bold; color: #4E342E;
    }
    .game-settings-toggle-btn {
      width: 64px; height: 40px;
      background-size: contain; background-repeat: no-repeat; background-position: center;
      background-color: transparent; border: none; cursor: pointer;
      transition: transform 0.1s;
    }
    .game-settings-toggle-btn:hover { transform: scale(1.05); }
    .game-settings-toggle-btn:active { transform: scale(0.95); }

    .game-settings-reset-btn {
      width: 100%; height: 46px;
      border-radius: 12px;
      background: linear-gradient(to bottom, #FF8A65, #E64A19);
      border: 2.5px solid #FFF8F5;
      box-shadow: 0 4px 0 #BF360C, 0 6px 8px rgba(0,0,0,0.2);
      color: white; font-size: 16px; font-weight: bold;
      cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;
      margin-top: 20px; transition: transform 0.1s, box-shadow 0.1s;
    }
    .game-settings-reset-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #BF360C, 0 8px 10px rgba(0,0,0,0.25); }
    .game-settings-reset-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #BF360C, 0 3px 4px rgba(0,0,0,0.2); }
    .game-settings-reset-icon { height: 20px; width: auto; }
    .game-settings-version {
      font-size: 11px; color: #FFB300; font-weight: bold; margin-top: 15px; letter-spacing: 0.5px;
    }

    .game-paused-action-container {
      display: flex; justify-content: center; gap: 20px; margin-top: 24px;
    }
    .game-paused-btn {
      width: 52px; height: 52px;
      background-size: contain; background-repeat: no-repeat; background-position: center;
      background-color: transparent; border: none; cursor: pointer;
      transition: transform 0.1s;
    }
    .game-paused-btn:hover { transform: scale(1.1); }
    .game-paused-btn:active { transform: scale(0.9); }

    .game-over-emblem {
      font-size: 56px; line-height: 1; margin: 10px 0;
      text-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .game-over-record-banner {
      background: #D32F2F; border: 2.5px solid #FFEB3B;
      border-radius: 6px; color: white; font-weight: 900;
      font-size: 13px; padding: 3px 12px; display: inline-block;
      letter-spacing: 1.5px; margin-bottom: 12px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    }
    .game-over-score {
      font-size: 26px; font-weight: 900; color: #4E342E;
      letter-spacing: 1px; margin-bottom: 6px;
    }
    .game-over-msg {
      font-size: 13px; font-weight: bold; color: #795548; margin-bottom: 20px;
    }
    .game-over-actions {
      display: flex; justify-content: center; align-items: center; gap: 14px;
    }
    .game-over-btn {
      width: 52px; height: 52px;
      background-size: contain; background-repeat: no-repeat; background-position: center;
      background-color: transparent; border: none; cursor: pointer;
      transition: transform 0.1s;
    }
    .game-over-btn:hover { transform: scale(1.1); }
    .game-over-btn:active { transform: scale(0.9); }

    .game-achievements-list {
      display: flex; flex-direction: column; gap: 8px;
      max-height: 280px; overflow-y: auto; margin-top: 15px;
      padding-right: 4px;
    }
    .game-achievements-list::-webkit-scrollbar { width: 6px; }
    .game-achievements-list::-webkit-scrollbar-track { background: #FFF8E1; }
    .game-achievements-list::-webkit-scrollbar-thumb { background: #FFD54F; border-radius: 3px; }

    .game-achievements-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; border-radius: 12px; background: #FFF;
      border: 2px solid #DDEAFF;
    }
    .game-achievements-row.rank-0 { background: #FFFDE7; border-color: #FFF59D; }
    .game-achievements-row.rank-1 { background: #F5F5F5; border-color: #E0E0E0; }
    .game-achievements-row.rank-2 { background: #FFF3E0; border-color: #FFE0B2; }

    .game-achievements-rank {
      font-size: 18px; font-weight: 900; color: #F57C00; width: 30px; text-align: center;
    }
    .game-achievements-info {
      display: flex; align-items: center; gap: 10px; flex: 1; margin-left: 10px;
    }
    .game-achievements-avatar-container {
      width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid #FFEA00; background: #FFF; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
    }
    .game-achievements-avatar {
      width: 100%; height: 100%; object-fit: cover;
    }
    .game-achievements-name {
      font-size: 15px; font-weight: bold; color: #4E342E;
    }
    .game-achievements-name.player {
      color: #E65100; font-weight: 900;
    }
    .game-achievements-score {
      font-size: 18px; font-weight: 900; color: #3E2723; min-width: 60px; text-align: right;
    }
    .game-achievements-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 12px; border-radius: 12px; background: #FFF9C4;
      border: 2.5px solid #FFEB3B; margin-top: 15px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .game-charselect-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      margin-top: 15px; max-height: 280px; overflow-y: auto;
      padding: 12px; box-sizing: border-box;
      background: #F5EFEB; border-radius: 16px;
      border: 3px solid #EAD8C3;
      box-shadow: inset 0 4px 10px rgba(0,0,0,0.08);
    }
    @media (max-width: 500px) or (max-height: 650px) {
      .game-charselect-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 8px; }
    }
    .game-charselect-grid::-webkit-scrollbar { width: 8px; }
    .game-charselect-grid::-webkit-scrollbar-track { background: #FFF8E1; border-radius: 4px; }
    .game-charselect-grid::-webkit-scrollbar-thumb { background: #FFD54F; border-radius: 4px; border: 2px solid #FFF8E1; }

    .game-charselect-item {
      aspect-ratio: 1; border-radius: 16px;
      background: linear-gradient(to bottom, #FFFFFF 0%, #FFF9F2 100%);
      border: 3.5px solid #FDFBF7; display: flex; justify-content: center;
      align-items: center; cursor: pointer;
      position: relative;
      box-shadow: 0 4px 0 #E2CCB5, 0 6px 12px rgba(0,0,0,0.08);
      transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease, border-color 0.15s ease;
      overflow: visible; /* to allow badge to clip nicely */
    }
    .game-charselect-item:hover {
      transform: translateY(-4px) scale(1.04);
      box-shadow: 0 8px 0 #E2CCB5, 0 10px 18px rgba(0,0,0,0.12);
      border-color: #FFE082;
    }
    .game-charselect-item.selected {
      border-color: #FFD54F;
      background: linear-gradient(to bottom, #FFE082 0%, #FFB300 100%);
      box-shadow: 0 4px 0 #E65100, 0 6px 12px rgba(230,81,0,0.25);
    }
    .game-charselect-item.selected:hover {
      transform: translateY(-4px) scale(1.04);
      box-shadow: 0 8px 0 #E65100, 0 10px 18px rgba(230,81,0,0.35);
    }
    .game-charselect-avatar {
      width: 88%; height: 88%; object-fit: contain;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08));
      transition: transform 0.15s ease;
    }
    .game-charselect-item:hover .game-charselect-avatar {
      transform: scale(1.06);
    }
    .game-charselect-paging {
      display: flex; justify-content: center; align-items: center; gap: 24px;
      margin-top: 18px;
    }
    .game-charselect-page-btn {
      width: 40px; height: 40px; background-size: contain; background-repeat: no-repeat;
      background-position: center; background-color: transparent; border: none;
      cursor: pointer; transition: transform 0.1s ease;
    }
    .game-charselect-page-btn:hover:not(:disabled) { transform: scale(1.15); }
    .game-charselect-page-btn:active:not(:disabled) { transform: scale(0.9); }
    .game-charselect-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .game-charselect-page-text {
      font-size: 18px; font-weight: 900; color: #F57F17; letter-spacing: 1.5px;
      text-shadow: 0 1px 0 white;
    }

    .game-instructions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-top: 15px; max-height: 280px; overflow-y: auto;
      padding-right: 4px; box-sizing: border-box; text-align: left;
    }
    @media (max-width: 420px) {
      .game-instructions-grid { grid-template-columns: 1fr; }
    }
    .game-instructions-grid::-webkit-scrollbar { width: 6px; }
    .game-instructions-grid::-webkit-scrollbar-track { background: #FFF8E1; }
    .game-instructions-grid::-webkit-scrollbar-thumb { background: #FFD54F; border-radius: 3px; }

    .game-instructions-row {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 10px; border-radius: 10px; background: #FFF;
      border: 2px solid #DDEAFF;
    }
    .game-instructions-icon-container {
      width: 32px; height: 32px; border-radius: 6px;
      background: #FFF9C4; display: flex; justify-content: center; align-items: center;
      flex-shrink: 0;
    }
    .game-instructions-icon {
      max-width: 24px; max-height: 24px; object-fit: contain;
    }
    .game-instructions-text {
      font-size: 12px; font-weight: bold; color: #4E342E;
    }
  `;
  document.head.appendChild(style);
}

export function showHTMLSettings(game) {
  injectHTMLPopupStyles();

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
    game.switchState("MAIN_MENU");
  });
  card.appendChild(closeBtn);

  const rowContainer = document.createElement("div");
  rowContainer.className = "game-settings-row-container";

  const createToggleRow = (label, isEnabled, onToggle) => {
    const row = document.createElement("div");
    row.style.cssText = `width:100%; height:70px; border-radius:12px; background:#fbfaf5; border:3px solid #fff; display:flex; justify-content:space-between; align-items:center; padding:0 20px; box-sizing:border-box; margin-bottom: 15px;`;

    const text = document.createElement("span");
    text.style.cssText = `font-family:'Fredoka', 'Baloo 2', 'Be Vietnam Pro', sans-serif; font-size:18px; font-weight:bold; color:#47363B; letter-spacing:0.8px; white-space:nowrap;`;
    text.innerText = label;

    const toggle = document.createElement("div");
    const isMuted = !isEnabled;
    toggle.style.cssText = `width:96px; height:46px; border-radius:23px; background:${isMuted ? "#E8E3D8" : "#81C784"}; border:3px solid #fff; box-shadow: inset 0 3px 6px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1); cursor:pointer; position:relative; transition: background 0.25s, transform 0.1s; flex-shrink:0; display:flex; align-items:center;`;

    const statusText = document.createElement("span");
    statusText.innerText = isMuted ? "OFF" : "ON";
    statusText.style.cssText = `color:#fff; font-family:'Impact', 'Arial Black', sans-serif; font-size:18px; position:absolute; width:100%; text-align:center; padding-right:${isMuted ? "0" : "32px"}; padding-left:${isMuted ? "32px" : "0"}; box-sizing:border-box; transition: padding 0.25s; text-shadow: 0 2px 3px rgba(0,0,0,0.4); pointer-events:none;`;

    const knob = document.createElement("div");
    knob.style.cssText = `width:36px; height:36px; border-radius:50%; background:#fff; position:absolute; top:2px; left:${isMuted ? "3px" : "51px"}; transition: left 0.25s cubic-bezier(0.3, 1.2, 0.5, 1); box-shadow: 0 3px 6px rgba(0,0,0,0.4); pointer-events:none;`;

    toggle.appendChild(statusText);
    toggle.appendChild(knob);

    toggle.onclick = () => {
      const newState = onToggle(); // Returns state after toggle
      const nowMuted = !newState;
      toggle.style.background = nowMuted ? "#E8E3D8" : "#81C784";
      knob.style.left = nowMuted ? "3px" : "51px";
      statusText.innerText = nowMuted ? "OFF" : "ON";
      statusText.style.paddingRight = nowMuted ? "0" : "32px";
      statusText.style.paddingLeft = nowMuted ? "32px" : "0";
    };

    toggle.onmousedown = () => (toggle.style.transform = "scale(0.92)");
    toggle.onmouseup = () => (toggle.style.transform = "scale(1)");
    toggle.onmouseleave = () => (toggle.style.transform = "scale(1)");

    row.appendChild(text);
    row.appendChild(toggle);
    return row;
  };

  // Music row
  const musicRow = createToggleRow("ÂM NHẠC", !audio.musicMuted, () => {
    audio.playClick();
    audio.toggleMusicMute();
    return !audio.musicMuted;
  });
  rowContainer.appendChild(musicRow);

  // SFX row
  const sfxRow = createToggleRow("HIỆU ỨNG", !audio.sfxMuted, () => {
    audio.playClick();
    audio.toggleSfxMute();
    return !audio.sfxMuted;
  });
  rowContainer.appendChild(sfxRow);

  card.appendChild(rowContainer);

  // Note: Reset button "XÓA LỊCH SỬ" completely removed as requested.

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

export function hideHTMLSettings() {
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

export function showHTMLPaused(game) {
  injectHTMLPopupStyles();
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
    game.switchState("PLAYING");
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
    game.switchState("MAIN_MENU");
  });
  actionContainer.appendChild(homeBtn);

  // Replay
  const replayBtn = document.createElement("button");
  replayBtn.className = "game-paused-btn";
  replayBtn.style.backgroundImage = "url(/assest/iconbtn/replay_btn.png)";
  replayBtn.addEventListener("click", () => {
    audio.playClick();
    game.gameState = "PLAYING";
    game.switchState("PLAYING");
  });
  actionContainer.appendChild(replayBtn);

  // Resume
  const resumeBtn = document.createElement("button");
  resumeBtn.className = "game-paused-btn";
  resumeBtn.style.backgroundImage = "url(/assest/iconbtn/continue_btn.png)";
  resumeBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("PLAYING");
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

export function hideHTMLPaused() {
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

export function showHTMLReviveOffer(game, onRevive, onSkip) {
  injectHTMLPopupStyles();

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

export function hideHTMLReviveOffer() {
  const overlay = document.getElementById("game-revive-overlay-id");
  if (overlay) {
    overlay.remove();
  }
}

export function showHTMLGameOver(game) {
  injectHTMLPopupStyles();
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
  if (game.isNewRecordThisRun) {
    const recordBanner = document.createElement("div");
    recordBanner.className = "game-over-record-banner";
    recordBanner.innerText = "KỶ LỤC MỚI!";
    card.appendChild(recordBanner);
  }

  // 3. Score
  const finalScore = Math.floor(game.score);
  const scoreVal = document.createElement("div");
  scoreVal.className = "game-over-score";
  scoreVal.innerText = `ĐIỂM SỐ: ${finalScore}`;
  card.appendChild(scoreVal);

  // 4. Message
  const msgVal = document.createElement("div");
  msgVal.className = "game-over-msg";
  msgVal.innerText = game.isNewRecordThisRun
    ? "👑 KỶ LỤC MỚI CỦA BỘ LẠC! 👑"
    : "Bạn đã va phải chướng ngại vật!";
  card.appendChild(msgVal);

  // 5. Actions: Revive, Try Again, Home, Double Score
  const actionContainer = document.createElement("div");
  actionContainer.className = "game-over-actions";

  // Double Score
  if (!game.hasDoubledThisRun) {
    const doubleBtn = document.createElement("button");
    doubleBtn.className = "game-over-btn";
    doubleBtn.style.backgroundImage = "url(/assest/iconbtn/x2_btn.png)";
    doubleBtn.addEventListener("click", async () => {
      audio.playClick();
      const success = await AdManager.showRewardedVideo();
      if (success) {
        game.hasDoubledThisRun = true;
        game.score = game.score * 2;
        const newScore = Math.floor(game.score);

        const stats = getStats();
        if (newScore > stats.highScore) {
          stats.highScore = newScore;
          game.highScore = newScore;
          game.isNewRecordThisRun = true;
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
        game.updateUserUI();
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
    game.switchState("PLAYING");
  });
  actionContainer.appendChild(replayBtn);

  // Home
  const homeBtn = document.createElement("button");
  homeBtn.className = "game-over-btn";
  homeBtn.style.backgroundImage = "url(/assest/iconbtn/Home_btn.png)";
  homeBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("MAIN_MENU");
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

export function hideHTMLGameOver() {
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

export function showHTMLAchievements(game) {
  injectHTMLPopupStyles();
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
    game.switchState("MAIN_MENU");
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

export function hideHTMLAchievements() {
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

export function showHTMLCharSelect(game) {
  injectHTMLPopupStyles();

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
      game.switchState("MAIN_MENU");
    });
    card.appendChild(closeBtn);

    overlay.appendChild(card);
    const appContainer = document.getElementById("app") || document.body;
    appContainer.appendChild(overlay);
  }

  const currentAvatar =
    window.selectedAvatarUrl ||
    "/assest/image/imagenobackgrd/001_avatar_laclac.png";

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
      url: `/assest/image/imagenobackgrd/${idxStr}_avatar_${avatarNames[i]}.png`,
      name: avatarNames[i].toUpperCase(),
    });
  }

  const grid = document.createElement("div");
  grid.className = "game-charselect-grid";

  avatarList.forEach((item) => {
    const isSelected = item.url === currentAvatar;

    const gridItem = document.createElement("div");
    gridItem.className = `game-charselect-item${isSelected ? " selected" : ""}`;

    const img = document.createElement("img");
    img.className = "game-charselect-avatar";
    img.src = item.url;
    gridItem.appendChild(img);

    if (isSelected) {
      const badge = document.createElement("div");
      badge.className = "game-charselect-badge";
      badge.innerText = "✓";
      badge.style.cssText =
        "position:absolute; bottom:-3px; right:-3px; width:22px; height:22px; border-radius:50%; background:#4CAF50; color:#fff; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.16); border:2px solid #fff; z-index:2;";
      gridItem.appendChild(badge);
    }

    gridItem.addEventListener("click", () => {
      window.selectedAvatarUrl = item.url;
      window.localStorage.setItem("selected_avatar_url", item.url);

      Assets.load(item.url).then((tex) => {
        game.updateSkeletalRigTexture(tex, item.url);
        game.playerColors = getAvatarColors(item.url);
      });

      game.updateUserUI();
      audio.playClick();

      // Dynamically update selected styling on items to preserve scroll position
      const allItems = grid.querySelectorAll(".game-charselect-item");
      allItems.forEach((itm, idx) => {
        const otherItem = avatarList[idx];
        const isSel = otherItem.url === item.url;

        // Clean up old badge
        const oldBadge = itm.querySelector(".game-charselect-badge");
        if (oldBadge) oldBadge.remove();

        if (isSel) {
          itm.classList.add("selected");
          const badge = document.createElement("div");
          badge.className = "game-charselect-badge";
          badge.innerText = "✓";
          badge.style.cssText =
            "position:absolute; bottom:-3px; right:-3px; width:22px; height:22px; border-radius:50%; background:#4CAF50; color:#fff; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.16); border:2px solid #fff; z-index:2;";
          itm.appendChild(badge);
        } else {
          itm.classList.remove("selected");
        }
      });
    });

    grid.appendChild(gridItem);
  });
  card.appendChild(grid);

  if (overlay.style.opacity !== "1") {
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.opacity = "1";
      card.style.transform = "scale(1)";
    });
  }
}

export function hideHTMLCharSelect() {
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

export function showHTMLInstructions(game) {
  injectHTMLPopupStyles();
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
    game.switchState("MAIN_MENU");
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

export function hideHTMLInstructions() {
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
