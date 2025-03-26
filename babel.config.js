module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@services': './src/services',
            '@store': './src/store',
            '@theme': './src/theme',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
            '@assets': './assets'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ]
    ]
  };
};
