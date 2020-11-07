import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { merge } from 'rxjs'
import { take } from 'rxjs/operators'
import { container, DependencyContainer } from 'tsyringe'
import { RedisMock } from '../../test/services/redis'
import { Redis, REDIS_AUTH, REDIS_URI } from './redis'
import { Subscriber } from './subscriber'

// tslint:disable: no-unused-expression

@suite
export class SubscriberService {

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
    async subscribe() {
        const channelName = 'testChannel'
        const value = 'test'

        const subscriber = this.childContainer.resolve(Subscriber)

        // Create secondary redis client for publish commands
        const client = (this.redis as any).createConnectedClient() as Redis

        const messages$ = subscriber.subscribe(channelName)

        const sub = messages$.subscribe(message => {
            expect(message).to.equal(value)
        })

        const done = messages$
            .pipe(take(1))
            .toPromise()

        await client.publish(channelName, value)
        // Should be ignored
        await client.publish('otherChannel', 'otherValue')

        // Cleanup
        await done
        sub.unsubscribe()
    }

    @test
    async multichannel() {
        const channel1 = 'testChannel1'
        const value1 = 'test1'

        const channel2 = 'testChannel2'
        const value2 = 'test2'

        const subscriber = this.childContainer.resolve(Subscriber)

        // Create secondary redis client for publish commands
        const client = (this.redis as any).createConnectedClient() as Redis

        const messages1$ = subscriber.subscribe(channel1)
        const sub1 = messages1$.subscribe(message => {
            expect(message).to.equal(value1)
        })

        const messages2$ = subscriber.subscribe(channel2)
        const sub2 = messages2$.subscribe(message => {
            expect(message).to.equal(value2)
        })

        const done = merge(messages1$, messages2$)
            .pipe(take(2))
            .toPromise()

        await client.publish(channel1, value1)
        await client.publish(channel2, value2)

        // Cleanup
        await done
        sub1.unsubscribe()
        sub2.unsubscribe()
    }

    // TODO: test connection events once ioredis-mock adds required functionality
}
