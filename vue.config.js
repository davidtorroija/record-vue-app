const webpack = require('webpack');
const { resolve } = require("path");
const rootResolve = (path) => (resolve(__dirname, "..", path));

module.exports = {
  configureWebpack: {
    plugins: [
       new webpack.ProvidePlugin({
         WaveSurfer: 'wavesurfer.js'
       })
     ],
     // Alias `wavesurfer` to the correct wavesurfer package.
     // (wavesurfer.js has some non-standard naming convention)
     resolve: {
       alias: {
         wavesurfer: require.resolve('wavesurfer.js'),
         lib: rootResolve("lib"),
       }
     },
  }
}
