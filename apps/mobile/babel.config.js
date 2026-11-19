const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        // ENVFILE=.env.development — щоб у розробці ходити на локальний сервер
        path: path.resolve(__dirname, process.env.ENVFILE || '.env'),
        safe: false,
        allowUndefined: false,
      },
    ],
  ],
};
