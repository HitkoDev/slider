import { singleton } from 'tsyringe'
import { MessageTypes } from '../messages'
import { encodeMessage } from '../utils/encoder'
import { Redis } from './redis'

@singleton()
export class Publisher {

    constructor(
        protected readonly redis: Redis
    ) { }

    async publish<T extends keyof MessageTypes>(channel: T, message: MessageTypes[T]) {
        await this.redis.publish(channel, encodeMessage(message))
    }
}
