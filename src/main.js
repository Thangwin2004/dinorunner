import { Application } from "pixi.js";
import { GameController } from "./game";

(async () => {
  // Wait for Google Fonts to be loaded before initializing the app or starting the game
  await document.fonts.ready;

  // 1. Create a new Application instance
  const app = new Application();

  const container = document.getElementById("pixi-container") || document.body;

  // 2. Initialize the application asynchronously (Vite safe IIFE pattern)
  await app.init({
    background: "#0a0b1e",
    resizeTo: container,
    antialias: true,
    autoDensity: true,
    resolution: Math.max(window.devicePixelRatio || 1, 2),
    preference: "webgl",
    roundPixels: true,
  });

  // 3. Append the canvas view to the DOM container
  if (container.id === "pixi-container") {
    container.innerHTML = ""; // Clear loader text
    container.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

  // 4. Hide Splash Screen smoothly
  const splash = document.getElementById("splash-screen");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
    }, 500);
  }

  // 5. Start Game Controller

  // Preload UI button assets
  const { Assets: PixiAssets } = await import("pixi.js");

  PixiAssets.add({ alias: "home_btn", src: "/assest/iconbtn/Home_btn.png" });
  PixiAssets.add({
    alias: "settings_btn",
    src: "/assest/iconbtn/setting_btn.png",
  });
  PixiAssets.add({ alias: "close_btn", src: "/assest/iconbtn/close_btn.png" });
  PixiAssets.add({ alias: "back_btn", src: "/assest/iconbtn/back_btn.png" });
  PixiAssets.add({
    alias: "replay_btn",
    src: "/assest/iconbtn/replay_btn.png",
  });
  PixiAssets.add({
    alias: "trophy_btn",
    src: "/assest/iconbtn/trophy_btn.png",
  });
  PixiAssets.add({ alias: "yes_btn", src: "/assest/iconbtn/yes_btn.png" });
  PixiAssets.add({
    alias: "delete_btn",
    src: "/assest/iconbtn/delete_btn.png",
  });
  PixiAssets.add({ alias: "hint_btn", src: "/assest/iconbtn/hint_btn.png" });
  PixiAssets.add({ alias: "toggle_on", src: "/assest/iconbtn/toggle_on.png" });
  PixiAssets.add({
    alias: "toggle_off",
    src: "/assest/iconbtn/toggle_off.png",
  });
  PixiAssets.add({ alias: "x2_btn", src: "/assest/iconbtn/x2_btn.png" });
  PixiAssets.add({
    alias: "revive_btn",
    src: "/assest/iconbtn/revive_btn.png",
  });
  PixiAssets.add({
    alias: "continue_btn",
    src: "/assest/iconbtn/continue_btn.png",
  });
  PixiAssets.add({
    alias: "next_btn",
    src: "/assest/iconbtn/next_btn.png",
  });
  PixiAssets.add({ alias: "quest_btn", src: "/assest/iconbtn/quest_btn.png" });
  PixiAssets.add({ alias: "user_btn", src: "/assest/iconbtn/user_btn.png" });
  PixiAssets.add({
    alias: "avatar_laclac",
    src: "/assest/image/imagebldp/001_avatar_laclac.png",
  });

  // Obstacle/Item preview assets for instructions UI
  PixiAssets.add({
    alias: "prop_lopxe",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/lopxeoto.png",
  });
  PixiAssets.add({
    alias: "prop_hangrao",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HangRao_01.png",
  });
  PixiAssets.add({
    alias: "prop_deptoong",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/DepToOng.png",
  });
  PixiAssets.add({
    alias: "prop_redchair",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/redchair.png",
  });
  PixiAssets.add({
    alias: "prop_banhchung",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/BanhChungBanhTet (1).png",
  });
  PixiAssets.add({
    alias: "prop_banhmi",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/banhmi.png",
  });
  PixiAssets.add({
    alias: "prop_bluetable",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/bluetable.png",
  });
  PixiAssets.add({
    alias: "prop_bunhin",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/HinhNomBuNhin.png",
  });
  PixiAssets.add({
    alias: "prop_reddrink",
    src: "/assest/image/Ref-20260630T071202Z-3-001/Ref/Props/reddrink.png",
  });

  await PixiAssets.load([
    "home_btn",
    "settings_btn",
    "close_btn",
    "back_btn",
    "replay_btn",
    "trophy_btn",
    "yes_btn",
    "delete_btn",
    "hint_btn",
    "toggle_on",
    "toggle_off",
    "x2_btn",
    "revive_btn",
    "continue_btn",
    "next_btn",
    "quest_btn",
    "user_btn",
    "avatar_laclac",
    "prop_lopxe",
    "prop_hangrao",
    "prop_deptoong",
    "prop_redchair",
    "prop_banhchung",
    "prop_banhmi",
    "prop_bluetable",
    "prop_bunhin",
    "prop_reddrink",
  ]);

  // 4. Create the game manager container
  const game = new GameController(app);
  app.stage.addChild(game);

  // 5. Connect the update loop to the Application ticker
  app.ticker.add((ticker) => {
    game.update(ticker);
  });

  // 6. Robust resize function that reads container size
  const handleResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    app.renderer.resize(w, h);
    game.resize();
  };

  // Connect window resize and ResizeObserver to game layout updates
  window.addEventListener("resize", handleResize);
  if (window.ResizeObserver) {
    const resizeObserver = new window.ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
  }

  // Run initial resize to align everything correctly
  handleResize();
})();
