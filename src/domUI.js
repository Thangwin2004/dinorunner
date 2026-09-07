import { Assets } from "pixi.js";
import { audio } from "./audio";
import {
  saveStats,
  getStats,
  getLeaderboardData,
  fetchLeaderboardData,
  getEffectiveUser,
  AdManager,
} from "./utils";
import { winkGame } from "./integrations/wink/wink-adapter.js";
import { getAvatarColors } from "./avatar";
import { i18n } from "./system/I18nManager.js";

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
      background: #fdfbf7;
      border: 5px solid #ffca28;
      box-shadow:
        inset 0 0 0 2.5px #ffe082,
        0 6px 0 #ffa000,
        0 12px 25px rgba(0, 0, 0, 0.35);
      border-radius: 20px;
      padding: 36px 24px 20px 24px;
      width: 90%;
      max-width: 420px;
      text-align: center;
      position: relative;
      transform: scale(0.85);
      transition:
        transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        opacity 0.25s ease;
      opacity: 0;
      font-family: 'Be Vietnam Pro', sans-serif;
      box-sizing: border-box;
    }
    .game-popup-card.game-over-stitch-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #FFFDF0 60%, #FFF9E6 100%);
      border: 4.5px solid #FF9800;
      box-shadow: inset 0 0 0 2px #FFF9C4, 0 8px 0 #E65100, 0 16px 35px rgba(0, 0, 0, 0.4);
      border-radius: 32px;
      padding: 44px 24px 24px 24px;
      width: 88%; max-width: 320px;
      text-align: center;
      position: relative;
      font-family: Be Vietnam Pro, sans-serif;
      box-sizing: border-box;
    }
    .game-popup-card.wide {
      max-width: 440px;
      padding: 32px 16px 20px 16px;
    }
    .game-popup-title {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(180deg, #ffb300 0%, #ff8f00 100%);
      border: 2.5px solid #fff8e1;
      border-radius: 14px;
      box-shadow: 0 4px 0 #e65100;
      color: #ffffff;
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 6px 36px;
      text-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
      white-space: nowrap;
      text-transform: uppercase;
    }
    .game-popup-title.stitch-title-ribbon {
      top: -26px; left: 50%;
      transform: translateX(-50%);
      width: 200px; height: 50px;
      background: linear-gradient(180deg, #FFE033 0%, #FFB300 65%, #FF8F00 100%);
      border: 3.5px solid #FFFFFF;
      border-radius: 26px;
      box-shadow: inset 0 3px 0 rgba(255,255,255,0.7), 0 5.5px 0 #6D2800, 0 10px 20px rgba(0,0,0,0.3);
      color: #FFFFFF;
      font-size: 24px; font-weight: 900;
      padding: 0;
      display: flex; justify-content: center; align-items: center;
      text-shadow: 0 2.5px 0 #5D1C00, -1px -1px 0 #5D1C00, 1px -1px 0 #5D1C00, -1px 1px 0 #5D1C00, 1px 1px 0 #5D1C00;
      letter-spacing: 2px;
      white-space: nowrap;
    }
    .stitch-ribbon-gloss {
      position: absolute;
      top: 3px; left: 14px; right: 14px;
      height: 12px;
      background: rgba(255, 255, 255, 0.45);
      border-radius: 10px 10px 50% 50%;
      pointer-events: none;
    }
    .stitch-star-container {
      margin: 8px 0 0 0;
      display: flex; justify-content: center; align-items: center;
    }
    .stitch-score-container {
      margin: 0 0 12px 0;
      display: flex; justify-content: center; align-items: center;
      user-select: none;
    }
    .game-over-record-banner {
      background: #FFE6AE;
      border: 1.5px solid #F2A532;
      border-radius: 14px; color: #9A4D18; font-weight: 800;
      font-size: 12px; padding: 4px 14px; display: inline-block;
      letter-spacing: 0.8px; margin: 4px 0 6px;
    }
    .game-over-record-banner[hidden] { display: none; }
    .game-over-actions {
      display: flex; justify-content: center; align-items: center; gap: 16px;
      margin-top: 6px;
    }
    .stitch-action-btn-3d {
      position: relative;
      width: 58px; height: 58px;
      border-radius: 50%;
      border: 3.5px solid #FFFFFF;
      cursor: pointer;
      display: flex; justify-content: center; align-items: center;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      user-select: none;
      box-sizing: border-box;
      padding: 0;
    }
    .stitch-action-btn-3d:hover { transform: scale(1.12); }
    .stitch-action-btn-3d:active { transform: scale(0.92) translateY(3px); }

    .btn-green-3d {
      background: linear-gradient(180deg, #7CD076 0%, #4CAF50 50%, #2E7D32 100%);
      box-shadow: inset 0 3.5px 0 rgba(255,255,255,0.6), inset 0 -4.5px 0 #1B5E20, 0 5px 0 #1B5E20, 0 8px 16px rgba(0,0,0,0.3);
      color: #FFFFFF;
    }
    .btn-green-3d .stitch-btn-text {
      font-family: Be Vietnam Pro, sans-serif;
      font-size: 24px; font-weight: 900;
      color: #FFFFFF;
      text-shadow: 0 2px 0 #1B5E20;
    }

    .btn-yellow-3d {
      background: linear-gradient(180deg, #FFEB3B 0%, #FFB300 50%, #FF8F00 100%);
      box-shadow: inset 0 3.5px 0 rgba(255,255,255,0.7), inset 0 -4.5px 0 #E65100, 0 5px 0 #E65100, 0 8px 16px rgba(0,0,0,0.3);
      color: #FFFFFF;
    }

    .btn-blue-3d {
      background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 50%, #1565C0 100%);
      box-shadow: inset 0 3.5px 0 rgba(255,255,255,0.65), inset 0 -4.5px 0 #0D47A1, 0 5px 0 #0D47A1, 0 8px 16px rgba(0,0,0,0.3);
      color: #FFFFFF;
    }
    .game-popup-close-btn {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 40px;
      height: 40px;
      border: 2.5px solid #fff;
      border-radius: 50%;
      background: linear-gradient(180deg, #ff8278, #ea3f42);
      box-shadow:
        0 3px 0 #b9232b,
        0 6px 10px rgba(36, 24, 42, 0.2);
      cursor: pointer;
      transition: transform 0.15s ease;
      z-index: 100100;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }
    .game-popup-close-btn::before,
    .game-popup-close-btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 3px;
      border-radius: 2px;
      background: #fff;
      transform: translate(-50%, -50%) rotate(45deg);
    }
    .game-popup-close-btn::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
    .game-popup-close-btn:hover {
      transform: scale(1.1);
    }
    .game-popup-close-btn:active {
      transform: translateY(2px) scale(0.95);
      box-shadow: 0 1px 0 #b9232b;
    }

    .game-settings-row-container {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .game-settings-row {
      width: 100%;
      height: 64px;
      border-radius: 14px;
      background: #ffffff;
      border: 2.5px solid #ffe082;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      box-sizing: border-box;
      margin-bottom: 12px;
    }
    .game-settings-label {
      font-size: 17px;
      font-weight: bold;
      color: #47363b;
      letter-spacing: 0.8px;
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
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 12px;
      color: #8d6e63;
      margin-top: 14px;
      font-weight: 600;
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
      border: 2.5px solid #ffe082;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      margin-bottom: 12px;
    }
    .game-settings-language-row .game-settings-label,
    .game-settings-label {
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 17px;
      font-weight: bold;
      color: #47363b;
      letter-spacing: 0.8px;
      white-space: nowrap;
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
      color: #145a27;
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
        0 6px 10px rgba(36, 24, 42, 0.12);
      transition:
        filter 0.12s ease,
        border-color 0.12s ease,
        box-shadow 0.1s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .game-settings-language-select option {
      color: #145a27;
      background: #ffffff;
      font-weight: 700;
      text-shadow: none;
    }
    .game-settings-language-select:hover {
      filter: brightness(1.04);
    }
    .game-settings-language-select:active {
      transform: translateY(2px);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.9),
        0 1px 0 #2b9b50,
        0 3px 5px rgba(36, 24, 42, 0.12);
    }
    .game-settings-language-select:focus,
    .game-settings-language-select:focus-visible {
      outline: none;
      border-color: #25a653;
    }

    .game-paused-action-container,
    .game-over-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 18px;
      margin-top: 20px;
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
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      margin-top: 15px;
      box-sizing: border-box; text-align: left;
    }

    .game-instructions-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 14px; background: #FFF;
      border: 2.5px solid #FFE0B2;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      transition: transform 0.15s ease;
    }
    .game-instructions-row:active {
      transform: scale(0.97);
    }
    .game-instructions-emoji {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      flex-shrink: 0; font-size: 20px; line-height: 1;
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
      font-size: 12px; font-weight: 800; color: #4E342E;
      line-height: 1.3;
    }
    .game-instructions-tag {
      display: inline-block; font-size: 9px; font-weight: 900;
      padding: 2px 6px; border-radius: 6px; margin-top: 2px;
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

function createToggleRow(label, isEnabled, onToggle) {
  const row = document.createElement("div");
  row.style.cssText =
    "width:100%; height:64px; border-radius:14px; background:#ffffff; border:2.5px solid #ffe082; box-shadow:0 2px 4px rgba(0,0,0,0.04); display:flex; justify-content:space-between; align-items:center; padding:0 16px; box-sizing:border-box; margin-bottom:12px;";

  const text = document.createElement("span");
  text.style.cssText =
    "font-family:'Be Vietnam Pro', sans-serif; font-size:17px; font-weight:bold; color:#47363b; letter-spacing:0.8px; white-space:nowrap;";
  text.innerText = label;

  const toggle = document.createElement("div");
  const isMuted = !isEnabled;
  toggle.style.cssText = `width:86px; height:42px; border-radius:21px; background:${isMuted ? "#e8e3d8" : "linear-gradient(180deg,#7eea94,#25b957)"}; border:3px solid #fff; box-shadow: inset 0 2px 0 rgba(255,255,255,.4), 0 4px 0 ${isMuted ? "#7d7972" : "#14873b"}, 0 6px 10px rgba(0,0,0,0.15); cursor:pointer; position:relative; transition: background 0.25s, transform 0.1s; flex-shrink:0; display:flex; align-items:center;`;

  const statusText = document.createElement("span");
  statusText.innerText = isMuted ? "OFF" : "ON";
  statusText.style.cssText = `color:#fff; font-family:'Be Vietnam Pro', sans-serif; font-size:16px; position:absolute; width:100%; text-align:center; padding-right:${isMuted ? "0" : "28px"}; padding-left:${isMuted ? "28px" : "0"}; box-sizing:border-box; transition: padding 0.25s; text-shadow: 0 2px 3px rgba(0,0,0,0.4); pointer-events:none;`;

  const knob = document.createElement("div");
  knob.style.cssText = `width:32px; height:32px; border-radius:50%; background:#fff; position:absolute; top:2px; left:${isMuted ? "3px" : "45px"}; transition: left 0.25s cubic-bezier(0.3, 1.2, 0.5, 1); box-shadow: 0 3px 6px rgba(0,0,0,0.4); pointer-events:none;`;

  toggle.appendChild(statusText);
  toggle.appendChild(knob);

  toggle.onclick = () => {
    audio.playClick();
    const newState = onToggle(); // Returns state after toggle
    const nowMuted = !newState;
    toggle.style.background = nowMuted
      ? "#e8e3d8"
      : "linear-gradient(180deg,#7eea94,#25b957)";
    toggle.style.boxShadow = `inset 0 2px 0 rgba(255,255,255,.4), 0 4px 0 ${nowMuted ? "#7d7972" : "#14873b"}, 0 6px 10px rgba(0,0,0,0.15)`;
    knob.style.left = nowMuted ? "3px" : "45px";
    statusText.innerText = nowMuted ? "OFF" : "ON";
    statusText.style.paddingRight = nowMuted ? "0" : "28px";
    statusText.style.paddingLeft = nowMuted ? "28px" : "0";
  };

  toggle.onmousedown = () => (toggle.style.transform = "scale(0.92)");
  toggle.onmouseup = () => (toggle.style.transform = "scale(1)");
  toggle.onmouseleave = () => (toggle.style.transform = "scale(1)");

  row.appendChild(text);
  row.appendChild(toggle);
  row.labelElement = text;
  return row;
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
  title.innerText = i18n.t("settings.title");
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

  // Music row
  const musicRow = createToggleRow(
    "🎵 " + i18n.t("settings.music"),
    !audio.musicMuted,
    () => {
      audio.toggleMusicMute();
      return !audio.musicMuted;
    },
  );
  rowContainer.appendChild(musicRow);

  // SFX row
  const sfxRow = createToggleRow(
    "🔊 " + i18n.t("settings.sfx"),
    !audio.sfxMuted,
    () => {
      audio.toggleSfxMute();
      return !audio.sfxMuted;
    },
  );
  rowContainer.appendChild(sfxRow);

  // Language row (marth3 style)
  const createLanguageRow = () => {
    const row = document.createElement("div");
    row.className = "game-settings-language-row";

    const label = document.createElement("span");
    label.className = "game-settings-label";
    label.innerText = "🌐 " + i18n.t("settings.language");

    const select = document.createElement("select");
    select.className = "game-settings-language-select";
    select.setAttribute("aria-label", i18n.t("settings.language"));
    select.innerHTML = `
      <option value="en">${i18n.t("settings.english")}</option>
      <option value="vi">${i18n.t("settings.vietnamese")}</option>
    `;
    select.value = i18n.language;

    select.addEventListener("change", () => {
      audio.playClick();
      i18n.setLanguage(select.value);
      title.innerText = i18n.t("settings.title");
      musicRow.labelElement.innerText = "🎵 " + i18n.t("settings.music");
      sfxRow.labelElement.innerText = "🔊 " + i18n.t("settings.sfx");
      label.innerText = "🌐 " + i18n.t("settings.language");
      select.setAttribute("aria-label", i18n.t("settings.language"));
      select.innerHTML = `
        <option value="en">${i18n.t("settings.english")}</option>
        <option value="vi">${i18n.t("settings.vietnamese")}</option>
      `;
      select.value = i18n.language;
      versionText.innerText = i18n.t("settings.version");
    });

    row.append(label, select);
    return row;
  };
  rowContainer.appendChild(createLanguageRow());

  card.appendChild(rowContainer);

  // Version Text
  const versionText = document.createElement("div");
  versionText.className = "game-settings-version";
  versionText.innerText = i18n.t("settings.version");
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
  title.innerText = i18n.t("pause.title");
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
  const musicRow = createToggleRow(
    "🎵 " + i18n.t("settings.music"),
    !audio.musicMuted,
    () => {
      audio.toggleMusicMute();
      return !audio.musicMuted;
    },
  );
  rowContainer.appendChild(musicRow);

  // SFX row
  const sfxRow = createToggleRow(
    "🔊 " + i18n.t("settings.sfx"),
    !audio.sfxMuted,
    () => {
      audio.toggleSfxMute();
      return !audio.sfxMuted;
    },
  );
  rowContainer.appendChild(sfxRow);

  // Action buttons container: Home, Replay, Resume
  const actionContainer = document.createElement("div");
  actionContainer.className = "game-paused-action-container";

  // Home
  const homeBtn = document.createElement("button");
  homeBtn.className = "stitch-action-btn-3d btn-blue-3d";
  homeBtn.setAttribute("aria-label", i18n.t("pause.home"));
  homeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF" style="filter: drop-shadow(0 2px 0 #004080);"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
  homeBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("MAIN_MENU");
  });
  actionContainer.appendChild(homeBtn);

  // Replay
  const replayBtn = document.createElement("button");
  replayBtn.className = "stitch-action-btn-3d btn-yellow-3d";
  replayBtn.setAttribute("aria-label", i18n.t("pause.replay"));
  replayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF" style="filter: drop-shadow(0 2px 0 #9E6B00);"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.78 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91z"/></svg>`;
  replayBtn.addEventListener("click", () => {
    audio.playClick();
    game.initGame();
  });
  actionContainer.appendChild(replayBtn);

  // Resume
  const resumeBtn = document.createElement("button");
  resumeBtn.className = "stitch-action-btn-3d btn-green-3d";
  resumeBtn.setAttribute("aria-label", i18n.t("pause.resume"));
  resumeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF" style="filter: drop-shadow(0 2px 0 #1B5E20);"><path d="M8 5v14l11-7z"/></svg>`;
  resumeBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("PLAYING");
  });
  actionContainer.appendChild(resumeBtn);

  card.appendChild(rowContainer);
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
  title.innerText = i18n.t("revive.title");

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
    "margin: 0 auto; background: linear-gradient(180deg, #FFE082 0%, #FFB300 50%, #FF8F00 100%); border: 3.5px solid #FFFFFF; border-radius: 28px; padding: 12px 50px; color: #FFFFFF; font-size: 24px; font-weight: 900; font-family:Be Vietnam Pro, sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 3.5px 0 rgba(255,255,255,0.7), inset 0 -4px 0 #E65100, 0 5.5px 0 #E65100, 0 10px 20px rgba(0,0,0,0.3); transition: transform 0.12s ease; text-shadow: 0 2px 0 #BF360C;";

  const tvIcon = document.createElement("img");
  tvIcon.src = "/assest/iconbtn/images.webp";
  tvIcon.style.cssText = "height:30px;width:auto;margin-right:15px;";

  const yesText = document.createElement("span");
  yesText.innerText = i18n.t("revive.yes");
  yesText.style.textShadow = "0 2px 4px rgba(0,0,0,0.3)";

  yesBtn.appendChild(tvIcon);
  yesBtn.appendChild(yesText);

  const skipText = document.createElement("div");
  skipText.innerText = i18n.t("revive.skip");
  skipText.style.cssText =
    "margin-top:15px;font-family:Be Vietnam Pro, sans-serif;font-size:16px;color:#888;text-decoration:underline;cursor:pointer;font-weight:bold;";

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
  card.className = "game-popup-card game-over-stitch-card";

  // Ribbon Header
  const title = document.createElement("div");
  title.className = "game-popup-title stitch-title-ribbon";
  title.innerHTML = `<div class="stitch-ribbon-gloss"></div><span>${i18n.t("gameover.title")}</span>`;
  card.appendChild(title);

  // 1. 3D Golden Toy Star SVG Emblem (Juicy & Vibrant)
  const emblem = document.createElement("div");
  emblem.className = "stitch-star-container";
  emblem.innerHTML = `
    <style>
      @keyframes popStarAnim {
        0%, 100% { transform: scale(0.92) rotate(-2deg); filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25)); }
        50% { transform: scale(1.02) rotate(3deg); filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.15)); }
      }
      .anim-star {
        animation: popStarAnim 2.5s infinite ease-in-out;
      }
    </style>
    <svg class="anim-star" width="110" height="110" viewBox="0 0 100 100" style="overflow: visible;">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFF8D"/>
          <stop offset="35%" stop-color="#FFD54F"/>
          <stop offset="75%" stop-color="#FF8F00"/>
          <stop offset="100%" stop-color="#D84315"/>
        </linearGradient>
      </defs>
      
      <!-- Thick 3D Bottom Base (Brown) -->
      <polygon points="50,7 63.5,34.5 93.5,39 72,60 77,90 50,75.5 23,90 28,60 6.5,39 36.5,34.5" 
               fill="#A64000" stroke="#702B00" stroke-width="12" stroke-linejoin="round" transform="translate(0, 6)"/>
               
      <!-- Main Golden Body with Crisp White Highlight Stroke -->
      <polygon points="50,7 63.5,34.5 93.5,39 72,60 77,90 50,75.5 23,90 28,60 6.5,39 36.5,34.5" 
               fill="url(#starGrad)" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
               
      <!-- Inner Glossy Reflection (top half only) -->
      <polygon points="50,12 61,35 85,38 70,54 50,47 30,54 15,38 39,35" 
               fill="#FFFFFF" opacity="0.4" stroke="none" pointer-events="none" />
    </svg>
  `;
  card.appendChild(emblem);

  // 2. New Record Banner (If applicable)
  const recordBanner = document.createElement("div");
  recordBanner.className = "game-over-record-banner";
  recordBanner.innerText = i18n.t("gameover.newRecord");
  recordBanner.hidden = !game.isNewRecordThisRun;
  card.appendChild(recordBanner);

  // 3. 3D Sculpted Score Component (SVG Single-Object Render - Zero lines, Zero gaps!)
  const finalScore = Math.floor(game.score);
  const scoreVal = document.createElement("div");
  scoreVal.className = "stitch-score-container";

  const createScoreMarkup = (val) => `
    <svg viewBox="0 0 200 84" width="200" height="84" style="overflow: visible;">
      <defs>
        <linearGradient id="scoreRedGradFace" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF5252"/>
          <stop offset="45%" stop-color="#E53935"/>
          <stop offset="100%" stop-color="#B71C1C"/>
        </linearGradient>
        <filter id="scoreShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <!-- Layer 1: Dark Red 3D Base -->
      <text x="100" y="62" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="64" fill="#5D0000" filter="url(#scoreShadow)">${val}</text>
      <!-- Layer 2: Gold Outer Stroke -->
      <text x="100" y="56" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="64" fill="#FFC107" stroke="#FFC107" stroke-width="9" stroke-linejoin="round">${val}</text>
      <!-- Layer 3: Dark Red Outline -->
      <text x="100" y="56" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="64" fill="#7A0000" stroke="#7A0000" stroke-width="3" stroke-linejoin="round">${val}</text>
      <!-- Layer 4: Main Red Gradient Face -->
      <text x="100" y="56" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="64" fill="url(#scoreRedGradFace)">${val}</text>
    </svg>
  `;
  scoreVal.innerHTML = createScoreMarkup(finalScore);
  card.appendChild(scoreVal);

  // 4. Actions: Home, Replay, Double Score (x2)
  const actionContainer = document.createElement("div");
  actionContainer.className = "game-over-actions";

  // Home (Blue - Left)
  const homeBtn = document.createElement("button");
  homeBtn.className = "stitch-action-btn-3d btn-blue-3d";
  homeBtn.setAttribute("aria-label", i18n.t("pause.home"));
  homeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF" style="filter: drop-shadow(0 2px 0 #004080);"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
  homeBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("MAIN_MENU");
  });
  actionContainer.appendChild(homeBtn);

  // Replay (Yellow - Center)
  const replayBtn = document.createElement("button");
  replayBtn.className = "stitch-action-btn-3d btn-yellow-3d";
  replayBtn.setAttribute("aria-label", i18n.t("pause.replay"));
  replayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 0 #B73A00);"><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.3L2.5 16"/></svg>`;
  replayBtn.addEventListener("click", () => {
    audio.playClick();
    game.switchState("PLAYING");
  });
  actionContainer.appendChild(replayBtn);

  // Double Score (Green x2 - Right)
  if (!game.hasDoubledThisRun) {
    const doubleBtn = document.createElement("button");
    doubleBtn.className = "stitch-action-btn-3d btn-green-3d";
    doubleBtn.setAttribute("aria-label", i18n.t("gameover.doubleScore"));
    doubleBtn.innerHTML = `<span class="stitch-btn-text">x2</span>`;
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

        scoreVal.innerHTML = createScoreMarkup(newScore);
        recordBanner.hidden = !game.isNewRecordThisRun;
        doubleBtn.remove();
        game.updateUserUI();
      }
    });
    actionContainer.appendChild(doubleBtn);
  }

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
  title.innerText = i18n.t("leaderboard.title");
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
  card.appendChild(listContainer);

  const footer = document.createElement("div");
  footer.className = "game-achievements-footer";
  card.appendChild(footer);

  const renderEntries = (data) => {
    listContainer.innerHTML = "";
    if (!data || data.length === 0) {
      const emptyText = document.createElement("div");
      emptyText.style.cssText =
        "padding:24px;text-align:center;font-weight:700;color:#5D4037;";
      emptyText.innerHTML = i18n.t("leaderboard.empty");
      listContainer.appendChild(emptyText);
      return;
    }
    const limit = Math.min(10, data.length);
    for (let i = 0; i < limit; i++) {
      const entry = data[i];
      if (!entry) break;

      const row = document.createElement("div");
      row.className = `game-achievements-row rank-${i}`;

      const rankMedals = ["🥇", "🥈", "🥉"];
      const rankNum = entry.rank || i + 1;
      const rankText = document.createElement("span");
      rankText.className = "game-achievements-rank";
      rankText.innerText = rankMedals[rankNum - 1] || `${rankNum}`;
      row.appendChild(rankText);

      const info = document.createElement("div");
      info.className = "game-achievements-info";

      const avatarContainer = document.createElement("div");
      avatarContainer.className = "game-achievements-avatar-container";
      const avatarImg = document.createElement("img");
      avatarImg.className = "game-achievements-avatar";
      avatarImg.src =
        entry.avatar || "/assest/image/imagenobackgrd/001_avatar_laclac.webp";
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
  };

  const updateFooter = (pb) => {
    const user = getEffectiveUser();
    const stats = getStats();
    const localHighScore = stats?.highScore || 0;
    const pScore =
      pb?.score !== undefined && pb?.score !== null ? pb.score : localHighScore;
    const pName =
      pb?.displayName ||
      (user
        ? user.name
        : winkGame?.isAuthenticated
          ? i18n.t("leaderboard.defaultMember")
          : i18n.t("leaderboard.youGuest"));
    const pAvatar =
      user?.avatar ||
      window.selectedAvatarUrl ||
      "/assest/image/imagenobackgrd/001_avatar_laclac.webp";
    const rankNum = pb?.rank || (pScore > 0 ? 1 : 0);
    const rankMedals = ["🥇", "🥈", "🥉"];
    const rankDisplay =
      rankNum > 0 ? rankMedals[rankNum - 1] || `#${rankNum}` : "—";
    const youSuffix = i18n.currentLanguage === "en" ? "(You)" : "(Bạn)";

    footer.innerHTML = `
      <span class="game-achievements-rank">${rankDisplay}</span>
      <div class="game-achievements-info">
        <div class="game-achievements-avatar-container">
          <img class="game-achievements-avatar" src="${pAvatar}" />
        </div>
        <span class="game-achievements-name player">${pName} ${youSuffix}</span>
      </div>
      <span class="game-achievements-score">${pScore}</span>
    `;
  };

  // Initial render
  renderEntries(getLeaderboardData());
  updateFooter(winkGame?.personalBest);

  // Async API fetch
  fetchLeaderboardData().then((fetchedData) => {
    if (fetchedData && fetchedData.length > 0) {
      renderEntries(fetchedData);
    }
    updateFooter(winkGame?.personalBest);
  });

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
    title.innerText = i18n.t("charSelect.title");
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
    "/assest/image/imagenobackgrd/001_avatar_laclac.webp";

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
      url: `/assest/image/imagenobackgrd/${idxStr}_avatar_${avatarNames[i]}.webp`,
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
  title.innerText = i18n.t("instructions.title");
  card.appendChild(title);

  const allItems = [
    {
      label: i18n.t("instructions.tire"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.webp",
      tag: i18n.t("instructions.tagJump"),
      type: "danger",
      tagClass: "jump",
    },
    {
      label: i18n.t("instructions.fence"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.webp",
      tag: i18n.t("instructions.tagJump"),
      type: "danger",
      tagClass: "jump",
    },
    {
      label: i18n.t("instructions.table"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/bluetable.webp",
      tag: i18n.t("instructions.tagJump"),
      type: "danger",
      tagClass: "jump",
    },
    {
      label: i18n.t("instructions.scarecrow"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HinhNomBuNhin.webp",
      tag: i18n.t("instructions.tagJump"),
      type: "danger",
      tagClass: "jump",
    },
    {
      label: i18n.t("instructions.slipper"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.webp",
      tag: i18n.t("instructions.tagDuck"),
      type: "danger",
      tagClass: "duck",
    },
    {
      label: i18n.t("instructions.chair"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.webp",
      tag: i18n.t("instructions.tagDuck"),
      type: "danger",
      tagClass: "duck",
    },
    {
      label: i18n.t("instructions.banhChung"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).webp",
      tag: i18n.t("instructions.tagBonus"),
      type: "collect",
      tagClass: "bonus",
    },
    {
      label: i18n.t("instructions.banhMi"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.webp",
      tag: i18n.t("instructions.tagBonus"),
      type: "collect",
      tagClass: "bonus",
    },
    {
      label: i18n.t("instructions.drink"),
      img: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.webp",
      tag: i18n.t("instructions.tagBonus"),
      type: "collect",
      tagClass: "bonus",
    },
    {
      label: i18n.t("instructions.shield"),
      isShield: true,
      tag: i18n.t("instructions.tagShield"),
      type: "shield",
      tagClass: "power",
    },
  ];

  const grid = document.createElement("div");
  grid.className = "game-instructions-grid";

  allItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "game-instructions-row";

    const iconEl = document.createElement("div");
    iconEl.className = `game-instructions-emoji ${item.type}`;
    if (item.isShield) {
      iconEl.textContent = "🛡️";
    } else {
      const img = document.createElement("img");
      img.src = item.img;
      img.style.maxWidth = "26px";
      img.style.maxHeight = "26px";
      img.style.objectFit = "contain";
      iconEl.appendChild(img);
    }
    row.appendChild(iconEl);

    const textWrap = document.createElement("div");
    const label = document.createElement("div");
    label.className = "game-instructions-text";
    label.textContent = item.label;
    textWrap.appendChild(label);

    const tag = document.createElement("span");
    tag.className = `game-instructions-tag ${item.tagClass}`;
    tag.textContent = item.tag;
    textWrap.appendChild(tag);

    row.appendChild(textWrap);
    grid.appendChild(row);
  });

  card.appendChild(grid);

  const understandBtn = document.createElement("button");
  understandBtn.className = "game-settings-reset-btn";
  understandBtn.style.marginTop = "20px";
  understandBtn.innerText = i18n.t("instructions.gotIt");
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
