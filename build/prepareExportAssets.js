const fs = require('fs');
const path = require('path');
const babel = require("@babel/core");

module.exports = function prepareExportAssets () {
  var _dirpath = path.resolve(__dirname);
  var cssFolder = _dirpath + '/../dist/css';
  var cssNames = fs.readdirSync(cssFolder);
  var cssString = '';
  for(var ind in cssNames) {
    cssString += fs.readFileSync(cssFolder + '/' + cssNames[ind], 'utf8');
  }

  var jsFiles = [
    _dirpath + '/../src/assets/lib/drawer.class.js',
    _dirpath + '/../src/assets/lib/addition_for_export.js'
  ];
  var jsString = '';
  for(var i in jsFiles) {
    var js = fs.readFileSync(jsFiles[i], 'utf8');
    var es5 = babel.transformSync(js.replace('export default drawer;', ''), {
      presets: [
        ['@babel/preset-env', {
            "targets": {
              "browsers": ['> 1%', 'ie 11'],
            }
        }],
        ["minify", {
          "keepFnName": true
        }]
      ]});
    jsString += es5.code;
  }

  return {css: cssString, js: jsString};
};