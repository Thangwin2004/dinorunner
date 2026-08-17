import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";

export default [
  // .worktrees holds a full duplicate checkout (241MB). Without it here,
  // `eslint .` walks the copy and `pnpm build` takes minutes instead of seconds.
  {
    ignores: [
      "dist",
      "public",
      "public/**",
      "**/wink-bridge.js",
      ".worktrees",
      ".worktrees/**",
    ],
  },
  js.configs.recommended,
  prettier,
  {
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        AudioContext: "readonly",
        webkitAudioContext: "readonly",
        Audio: "readonly",
        console: "readonly",
        requestAnimationFrame: "readonly",
        Promise: "readonly",
        Math: "readonly",
        import: "readonly",
        localStorage: "readonly",
      },
    },
    rules: {},
  },
];
