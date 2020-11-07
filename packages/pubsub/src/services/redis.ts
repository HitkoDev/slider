import { createToken } from '@task/utils'
import RedisImpl from 'ioredis'
import { inject, singleton } from 'tsyringe'

/**
 * Redis URI including the database number
 *
 * @example `redis://localhost:6379/5`
 */
export const REDIS_URI = createToken<string>({
    name: 'REDIS_URI'
})

/**
 * Redis auth, can be an empty string if there's no auth
 */
export const REDIS_AUTH = createToken<string>({
    name: 'REDIS_AUTH',
    provider: {
        useValue: ''
    }
})

@singleton()
export class Redis extends RedisImpl {

    constructor(
        @inject(REDIS_URI)
        uri: string,
        @inject(REDIS_AUTH)
        auth?: string
    ) {
        if (auth)
            super(uri, { password: auth })
        else
            super(uri)
    }
}
