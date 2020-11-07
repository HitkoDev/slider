import RedisImpl from 'ioredis'
import { Lifecycle, scoped } from 'tsyringe'

// tslint:disable-next-line: no-var-requires
const MockImpl: typeof RedisImpl = require('ioredis-mock')

@scoped(Lifecycle.ContainerScoped)
export class RedisMock extends MockImpl { }
