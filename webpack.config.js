const path = require('path')
const webpack = require('webpack')

let config = {
  entry: './assets/js/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  devServer: {
    noInfo: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),

            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
}

module.exports = config
