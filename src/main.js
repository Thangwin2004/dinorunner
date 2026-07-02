import { Application } from "pixi.js";
import { GameController } from "./game";

(async () => {
  // 1. Create a new Application instance
  const app = new Application();

  const container = document.getElementById("pixi-container") || document.body;

  // 2. Initialize the application asynchronously (Vite safe IIFE pattern)
  await app.init({
    background: "#0a0b1e",
    resizeTo: container,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  // 3. Append the canvas view to the DOM container
  if (container.id === "pixi-container") {
    container.innerHTML = ""; // Clear loader text
    container.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

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
