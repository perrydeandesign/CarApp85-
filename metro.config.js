const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Wrapped with withSentryConfig so JS bundles + source maps are stamped with a
 * Debug ID — required for Sentry to symbolicate minified production stack traces.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config));
