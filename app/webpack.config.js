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
   }
};