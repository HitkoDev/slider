import cors from '@koa/cors'
import { loadConfigFile } from '@task/utils'
import { IncomingMessage, ServerResponse } from 'http'
import Koa from 'koa'
import Router from 'koa-router'
import { container, DependencyContainer } from 'tsyringe'
import { AccountRepository, MONGODB_DB, MONGODB_URI, MONGODB_X509 } from '../../database/dist'
import { REDIS_AUTH, REDIS_URI } from '../../pubsub/dist'
import { CONFIG, ConfigurationSchema } from './config/schema'
import { AppContext, AppCustomContext, APP_CONTEXT } from './context'
import { accountRoutes } from './routes/account'

export class App extends Koa<any, AppCustomContext> {

    constructor(
        /**
         * Base container to use when initialising app
         * @default container
         */
        private readonly c: DependencyContainer = container
    ) {
        super()
    }

    public createContext(req: IncomingMessage, res: ServerResponse): AppContext {
        const ctx = super.createContext(req, res) as AppContext
        ctx.time = new Date()
        ctx.container = this.c.createChildContainer()
        ctx.container.register(APP_CONTEXT, { useValue: ctx })

        res.on('close', () => ctx.container.reset())
        return ctx
    }
}

export async function buildApp(
    /**
     * What container to use when initialising app.
     * @default container
     */
    c: DependencyContainer = container
) {
    const app = new App(c)
    const router = new Router<{}, AppCustomContext>()

    router
        .use('/account', accountRoutes.routes(), accountRoutes.allowedMethods())

    app
        .use(cors())
        .use(router.routes())
        .use(router.allowedMethods())

    return app
}

export async function startApp(args?: {
    /**
     * Path to a JSON file with config
     */
    config?: string
    /**
     *  Port to bind to
     */
    port?: number
    /**
     * If true, ensure sample accounts exist
     */
    sample?: boolean
}) {
    const { config, port = 8080, sample } = args || {}

    if (config)
        await loadConfigFile(config, ConfigurationSchema)

    container.register(MONGODB_URI, { useFactory: (c) => c.resolve(CONFIG).mongodb.uri })
    container.register(MONGODB_DB, { useFactory: (c) => c.resolve(CONFIG).mongodb.db })
    container.register(MONGODB_X509, { useFactory: (c) => c.resolve(CONFIG).mongodb.x509 })

    container.register(REDIS_URI, { useFactory: (c) => c.resolve(CONFIG).redis.uri })
    container.register(REDIS_AUTH, { useFactory: (c) => c.resolve(CONFIG).redis.auth })

    if (sample) {
        const accountRepository = container.resolve(AccountRepository)
        const accounts = await accountRepository.createMany([
            {
                name: 'user 1',
                isActive: true
            },
            {
                name: 'user 2',
                isActive: true
            },
            {
                name: 'inactive',
                isActive: false
            }
        ])
        console.log(`Sample users:`)
        for (const account of accounts)
            console.log(`${account.name}: ${account._id.toHexString()}`)
    }

    const app = await buildApp(container)
    app.listen(port)
    console.log(`Listening on http://0.0.0.0:${port}`)
}
