import { container } from 'tsyringe'
import { CommandModule } from 'yargs'
import { GlobalArgs } from '../..'

export interface ListenArgs extends GlobalArgs {
    account?: string | string[]
}

export const listen: CommandModule<GlobalArgs, ListenArgs> = {

    command: 'listen',
    describe: 'Listen for messages, and print output them to stdout',

    builder(argv) {
        return argv
            .option('account', {
                alias: 'f',
                type: 'string',
                desc: 'Filter messages by account id'
            })
    },

    async handler(args) {
        const { ListenHandler } = await import('./handler')
        const handler = container.resolve(ListenHandler)
        await handler.handle(args)
    }

}
