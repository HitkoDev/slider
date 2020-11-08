import { ObjectID } from '@task/database'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { container, DependencyContainer } from 'tsyringe'
import { RedisMock } from '../../test/services/redis'
import { Channel, MessageTypes } from '../messages'
import { decodeMessage } from '../utils/encoder'
import { Publisher } from './publisher'
import { Redis } from './redis'

// tslint:disable: no-unused-expression

@suite
export class PublisherService {

    childContainer: DependencyContainer
    redis: Redis
    subClient: Redis

    before() {
        this.childContainer = container.createChildContainer()
        this.childContainer.register(Redis, { useToken: RedisMock })

        this.redis = this.childContainer.resolve(Redis)
        // Create secondary redis client for subscription commands
        this.subClient = (this.redis as any).createConnectedClient() as Redis
    }

    after() {
        this.redis.disconnect()
        this.subClient.disconnect()
    }

    @test
    async publish() {
        const channelName = Channel.Tracking
        const value: MessageTypes[Channel.Tracking] = {
            accountId: new ObjectID(),
            timestamp: new Date(),
            data: 'test'
        }

        const publisher = this.childContainer.resolve(Publisher)

        const done = new Promise<{
            channel: string
            message: string
        }>((resolve, reject) => {
            this.subClient.on('message', (channel, message) => resolve({
                channel,
                message
            }))
            this.subClient.subscribe(channelName, (err) => {
                if (err)
                    reject(err)
            })
        })

        await publisher.publish(channelName, value)

        const result = await done
        expect(result.channel).to.equal(channelName)
        expect(decodeMessage(result.message)).to.deep.equal(value)
    }
}
