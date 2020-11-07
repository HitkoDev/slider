import RedisImpl from 'ioredis'
import { inject, singleton } from 'tsyringe'
import { REDIS_AUTH, REDIS_URI } from '../../src/services/redis'

// tslint:disable-next-line: no-var-requires
const MockImpl: typeof RedisImpl = require('ioredis-mock')

@singleton()
export class RedisMock extends MockImpl {

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
