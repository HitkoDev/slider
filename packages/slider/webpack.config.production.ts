// @ts-ignore
import ClosurePlugin from '@liquid-js/closure-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import 'webpack-dev-server'
import { merge } from 'webpack-merge'
import config from './webpack.config'

config.module?.rules?.
    forEach?.(rule => (rule as any)?.use?.
        forEach?.((l: any) => l?.loader == 'css-loader' && l.options && (l.options.sourceMap = false)))

export default merge(config, {
    mode: 'production',
    output: {
        filename: '[name].js',
        publicPath: '.'
    },
    devtool: 'hidden-source-map',
    optimization: {
        minimizer: [
            new ClosurePlugin({
                mode: 'STANDARD',
                platform: 'native'
            }, {
                language_in: 'ECMASCRIPT_2018',
                language_out: 'ECMASCRIPT_2015'
            }),

            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 2015
                }
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
})
