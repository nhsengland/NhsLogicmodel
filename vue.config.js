const prepareExportAssets = require('./build/prepareExportAssets.js');

module.exports = {
  transpileDependencies: [
    // can be string or regex
    'vue-clipboard2',
    'vue-color'
  ],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(cur)(\?.*)?$/,
          use: [
            /* config.module.rule('images').use('url-loader') */
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                fallback: {
                  loader: 'file-loader',
                  options: {
                    name: 'img/[name].[hash:8].[ext]'
                  }
                }
              }
            }
          ]
        },
      ]
    }
  },
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        var exportAssets = prepareExportAssets();
        args[0].EXPORT_JS = "`" + exportAssets.js + "`";
        args[0].EXPORT_CSS = "`" + exportAssets.css + "`";
        args[0].TEST_STRING = "`" + Math.random() + "`";
        return args;
      });
  }
};