import { singleton } from 'tsyringe'
import { Redis } from './redis'

@singleton()
export class Publisher {

    constructor(
        protected readonly redis: Redis
    ) { }

    async publish(channel: string, message: string) {
        await this.redis.publish(channel, message)
    }
}
