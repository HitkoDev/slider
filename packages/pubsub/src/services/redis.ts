import { createToken } from '@task/utils'
import RedisImpl from 'ioredis'
import { inject, singleton } from 'tsyringe'

/**
 * Redis URL including the database number
 *
 * @example `redis://localhost:6379/5`
 */
export const REDIS_URL = createToken<string>({
    name: 'REDIS_URL'
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
        @inject(REDIS_URL)
        url: string,
        @inject(REDIS_AUTH)
        auth?: string
    ) {
        if (auth)
            super(url, { password: auth })
        else
            super(url)
    }
}
