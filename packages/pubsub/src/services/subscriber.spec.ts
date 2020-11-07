import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { merge } from 'rxjs'
import { take } from 'rxjs/operators'
import { container, DependencyContainer } from 'tsyringe'
import { RedisMock } from '../../test/services/redis'
import { Redis } from './redis'
import { Subscriber } from './subscriber'

// tslint:disable: no-unused-expression

@suite
export class SubscriberService {

    childContainer: DependencyContainer
    redis: Redis
    pubClient: Redis

    before() {
        this.childContainer = container.createChildContainer()
        this.childContainer.register(Redis, { useToken: RedisMock })

        this.redis = this.childContainer.resolve(Redis)
        // Create secondary redis client for subscription commands
        this.pubClient = (this.redis as any).createConnectedClient() as Redis
    }

    after() {
        this.redis.disconnect()
        this.pubClient.disconnect()
        container.clearInstances()
    }

    @test
    async subscribe() {
        const channelName = 'testChannel'
        const value = 'test'

        const subscriber = this.childContainer.resolve(Subscriber)

        const messages$ = subscriber.subscribe(channelName)

        const sub = messages$.subscribe(message => {
            expect(message).to.equal(value)
        })

        const done = messages$
            .pipe(take(1))
            .toPromise()

        await this.pubClient.publish(channelName, value)
        // Should be ignored
        await this.pubClient.publish('otherChannel', 'otherValue')

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

        const messages1$ = subscriber.subscribe(channel1)
        const sub1 = messages1$.subscribe(message => {
            expect(message).to.equal(value1)
        })

        const messages2$ = subscriber.subscribe(channel2)
        const sub2 = messages2$.subscribe(message => {
            expect(message).to.equal(value2)
        })

        const done = merge(
            messages1$.pipe(take(1)),
            messages2$.pipe(take(1))
        )
            .toPromise()

        await this.pubClient.publish(channel1, value1)
        await this.pubClient.publish(channel2, value2)

        // Cleanup
        await done
        sub1.unsubscribe()
        sub2.unsubscribe()
    }

    // TODO: test connection events once ioredis-mock adds required functionality
}
