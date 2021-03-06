import 'reflect-metadata'

import yargs from 'yargs'
import { startApp } from './app'

// tslint:disable-next-line: no-unused-expression
yargs
    .command(
        '*',
        'Start API server',
        (builder) => builder
            .option('config', {
                alias: 'c',
                type: 'string',
                desc: 'Path to configuration file'
            })
            .option('port', {
                alias: 'p',
                type: 'number',
                desc: 'The port to bind to'
            })
            .option('sample', {
                alias: 's',
                type: 'boolean',
                desc: 'Generate sample accounts'
            }),
        async (args) => {
            try {
                await startApp(args)
            } catch (err) {
                console.error(err)
                process.exit(1)
            }
        }
    )
    .help()
    .scriptName('api')
    .argv
