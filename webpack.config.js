const path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const { resolve } = require('path');
const webpack = require('webpack');

const is_production = process.env.NODE_ENV == 'production'

const devEntry = is_production ? [] : [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server'
];

const entry = {
    app: devEntry.concat('./src/index.tsx'),
}

module.exports = {
    entry: entry,
    performance: {
        hints: is_production ? "warning" : false
    },
    output: {
        path: './dist',
        filename: '[name].js',
        publicPath: './dist/',
    },
    resolve: {
        extensions: ['.js', '.css', '.ts', '.tsx']
    },
    devServer: {
        hot: true,
        contentBase: resolve(__dirname),
        publicPath: '/dist/',
        historyApiFallback: {
            rewrites: [
                { from: /^\/$/, to: '/' }
            ]
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'ts-loader' }
                ]
            },
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract({
            //         fallbackLoader: "style-loader",
            //         loader: 'css-loader'
            //     })
            // },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({ filename: 'bundle.css', disable: !is_production, allChunks: true }),
    ].concat(is_production ? [] : [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ]),
    target: 'electron-renderer',
    node: {
        __dirname: true
    },
    devtool: is_production ? 'source-map' : 'cheap-module-eval-source-map	'
}