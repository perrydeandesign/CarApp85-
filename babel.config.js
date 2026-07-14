module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,          // ⭐ FIXED
        allowUndefined: false,
        verbose: false,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
