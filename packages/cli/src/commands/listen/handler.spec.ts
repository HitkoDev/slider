import { ObjectID } from '@task/database'
import { Subscriber } from '@task/pubsub'
import { Channel, TrackingMessage } from '@task/pubsub/dist/messages'
import { mockConsole } from '@task/utils/dist/testing/console'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { Subject } from 'rxjs'
import { capture, instance, mock, when } from 'ts-mockito'
import { container, DependencyContainer } from 'tsyringe'
import { ListenHandler } from './handler'

// tslint:disable: no-unused-expression

@suite
export class Listen {

    SubscriberMock: Subscriber
    messages$: Subject<TrackingMessage>
    childContainer: DependencyContainer
    handler: ListenHandler
    ConsoleMock: Console
    restoreConsole: () => void

    before() {
        this.childContainer = container.createChildContainer()
        this.SubscriberMock = mock(Subscriber)
        this.messages$ = new Subject<TrackingMessage>()
        when(this.SubscriberMock.subscribe(Channel.Tracking)).thenReturn(this.messages$.asObservable())

        const { ConsoleMock, restoreConsole } = mockConsole()
        this.ConsoleMock = ConsoleMock
        this.restoreConsole = restoreConsole

        this.childContainer.register(Subscriber, { useValue: instance(this.SubscriberMock) })
        this.handler = this.childContainer.resolve(ListenHandler)
    }

    after() {
        this.restoreConsole()
    }

    @test
    async handle() {
        const id = new ObjectID()
        const id2 = new ObjectID()
        const ts = new Date()
        const data = 'test'
        const data2 = 'foobar'

        const done = this.handler.handle({})

        this.messages$.next({
            accountId: id,
            timestamp: ts,
            data
        })

        this.messages$.next({
            accountId: id2,
            timestamp: ts,
            data: data2
        })

        const err = new Error()
        this.messages$.error(err)

        try {
            await done
        } catch (error) {
            expect(error).to.equal(err)
        }

        const [log] = capture(this.ConsoleMock.log).byCallIndex(0)
        expect(log).to.equal(`[${ts}] ${id.toHexString()}: "${data}"`)

        const [log2] = capture(this.ConsoleMock.log).byCallIndex(1)
        expect(log2).to.equal(`[${ts}] ${id2.toHexString()}: "${data2}"`)

        const [error] = capture(this.ConsoleMock.error).byCallIndex(0)
        expect(error).to.equal(err)
    }

    @test
    async filter() {
        const id = new ObjectID()
        const id2 = new ObjectID()
        const ts = new Date()
        const data = 'test'
        const data2 = 'foobar'

        this.handler.handle({ account: id2.toHexString() })
            .catch()

        this.messages$.next({
            accountId: id,
            timestamp: ts,
            data
        })

        this.messages$.next({
            accountId: id2,
            timestamp: ts,
            data: data2
        })

        // Only the second message should be processed
        const [log] = capture(this.ConsoleMock.log).byCallIndex(0)
        expect(log).to.equal(`[${ts}] ${id2.toHexString()}: "${data2}"`)
    }

    @test
    async filterMultiple() {
        const id = new ObjectID()
        const id2 = new ObjectID()
        const id3 = new ObjectID()
        const ts = new Date()
        const data = 'test'
        const data2 = 'foo'
        const data3 = 'bar'

        this.handler.handle({
            account: [
                id2.toHexString(),
                id3.toHexString()
            ]
        })
            .catch()

        this.messages$.next({
            accountId: id,
            timestamp: ts,
            data
        })

        this.messages$.next({
            accountId: id2,
            timestamp: ts,
            data: data2
        })

        this.messages$.next({
            accountId: id3,
            timestamp: ts,
            data: data3
        })

        // First message should be ignored
        const [log1] = capture(this.ConsoleMock.log).first()
        expect(log1).to.equal(`[${ts}] ${id2.toHexString()}: "${data2}"`)
        const [log2] = capture(this.ConsoleMock.log).last()
        expect(log2).to.equal(`[${ts}] ${id3.toHexString()}: "${data3}"`)
    }
}
