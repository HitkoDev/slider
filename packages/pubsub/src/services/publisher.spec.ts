import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { container, DependencyContainer } from 'tsyringe'
import { RedisMock } from '../../test/services/redis'
import { Publisher } from './publisher'
import { Redis, REDIS_AUTH, REDIS_URI } from './redis'

// tslint:disable: no-unused-expression

@suite
export class PublisherService {

    childContainer: DependencyContainer
    redis: Redis

    before() {
        this.childContainer = container.createChildContainer()
        this.childContainer.register(Redis, { useToken: RedisMock })
        this.childContainer.register(REDIS_URI, { useValue: 'redis://localhost:6379/5' })
        this.childContainer.register(REDIS_AUTH, { useValue: '' })

        this.redis = this.childContainer.resolve(Redis)
    }

    @test
    async publish() {
        const channelName = 'testChannel'
        const value = 'test'

        const publisher = this.childContainer.resolve(Publisher)

        const done = new Promise<{
            channel: string
            message: string
        }>((resolve, reject) => {
            // Create secondary redis client for subscription commands
            const client = (this.redis as any).createConnectedClient() as Redis
            client.on('message', (channel, message) => resolve({
                channel,
                message
            }))
            client.subscribe(channelName, (err) => {
                if (err)
                    reject(err)
            })
        })

        await publisher.publish(channelName, value)

        const result = await done
        expect(result.channel).to.equal(channelName)
        expect(result.message).to.equal(value)
    }
}
