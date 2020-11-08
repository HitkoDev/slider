import 'reflect-metadata'

import { REDIS_AUTH, REDIS_URI } from '@task/pubsub'
import { loadConfigFile } from '@task/utils'
import { container } from 'tsyringe'
import yargs from 'yargs'
import { listen } from './commands/listen'
import { CONFIG, ConfigurationSchema } from './config/schema'

export interface GlobalArgs {
    config?: string
}

// tslint:disable-next-line: no-unused-expression
yargs
    .option('config', {
        alias: 'c',
        type: 'string',
        desc: 'Path to configuration file.'
    })
    .middleware(async (args) => {
        // Load config file
        if (args.config)
            await loadConfigFile(args.config, ConfigurationSchema)

        container.register(REDIS_URI, { useFactory: (c) => c.resolve(CONFIG).redis.uri })
        container.register(REDIS_AUTH, { useFactory: (c) => c.resolve(CONFIG).redis.auth })
    })
    .command(listen)
    .demandCommand()
    .help()
    .argv
