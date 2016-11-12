var webpack = require("webpack"),
    isDevelopment = !!process.env.isDevelopment;

module.exports = {
   entry: "./app.js",
   output: {
      path: __dirname,
      filename: "bundle.js"
   },
   module: {
      loaders: [
         { test: /\.css$/, loader: "style!css" }
      ]
   },
   resolve: { // как ищутся модули
      modulesDirectories: [ // если путь неотносительный, где искать
         './app/',
         './app/vendor',
         './node_modules/'
      ]
   },
   plugins: []
};

if (!isDevelopment) {
   module.exports.plugins.push(
       new webpack.optimize.UglifyJsPlugin({
          compress: {
             warnings: false,
             drop_console: true,
             unsafe: true
          }
       })
   );
}
