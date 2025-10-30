/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    unstable_allowRequireContext: true,
  },
});
