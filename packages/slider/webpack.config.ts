import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { Configuration } from 'webpack'
import 'webpack-dev-server'

const config: Configuration = {
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        compress: true,
        hot: false,
        inline: true,
        host: '0.0.0.0',
        port: 5080
    },
    entry: {
        app: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.mjs', '.tsx', '.ts', '.jsx', '.js', '.json']
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.(?:ts|js)$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                module: 'esnext'
                            }
                        }
                    }
                ],
                include: /src/,
                exclude: /node_modules/
            },
            {
                test: /\.s(a|c)ss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['app'],
            template: './src/index.ejs',
            hash: false
        })
    ]
}

export default config
