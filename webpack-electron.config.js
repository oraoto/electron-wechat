const { resolve } = require('path');
const webpack = require('webpack');

const is_production = process.env.NODE_ENV == 'production'

const entry = {
    electron: './src/Electron/Electron.ts'
}

module.exports = {
    entry: entry,
    performance: {
        hints: is_production ? "warning" : false
    },
    output: {
        path: './dist',
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.css', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'ts-loader' }
                ]
            }
        ]
    },
    target: 'electron',
    node: {
        __dirname: false
    }
    //devtool: 'source-map'
}