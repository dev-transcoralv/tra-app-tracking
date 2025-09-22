module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Only add this if your project explicitly needs it:
      "react-native-reanimated/plugin",
    ],
  };
};
