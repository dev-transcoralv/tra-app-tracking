// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ["dist/*"],
  },
  {
    // QA-12: en release console.* va al log del sistema (logcat). Usar
    // logError de src/utils/logger.ts, que no imprime datos sensibles.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/__tests__/**"],
    rules: { "no-console": "error" },
  },
]);
