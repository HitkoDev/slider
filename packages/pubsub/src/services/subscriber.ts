import { Observable, Subject } from 'rxjs'
import { publish, refCount } from 'rxjs/operators'
import { singleton } from 'tsyringe'
import { MessageTypes } from '../messages'
import { decodeMessage } from '../utils/encoder'
import { Redis } from './redis'

@singleton()
export class Subscriber {

    protected readonly subscriptions = new Map<string, {
        subject: Subject<string>
        observable: Observable<MessageTypes[keyof MessageTypes]>
    }>()
    protected ended = false

    constructor(
        protected readonly redis: Redis
    ) {
        this.redis.on('message', (channel, message) => {
            // Publish message to the apropriate observable if it exists
            const target = this.subscriptions?.get(channel)
            if (target)
                target.subject.next(message)
        })
        // Redis has been disconnected and won't reconnect
        this.redis.on('end', () => {
            this.ended = true
            this.subscriptions?.forEach(({ subject }) => subject.complete())
        })
    }

    subscribe<T extends keyof MessageTypes>(channel: T) {
        if (!this.subscriptions.has(channel)) {
            const subject = new Subject<string>()
            const observable = new Observable<MessageTypes[T]>(sub => {
                const subscription = subject.subscribe({
                    next: (val) => sub.next(decodeMessage(val) as MessageTypes[T]),
                    complete: () => sub.complete(),
                    error: (err) => sub.error(err)
                })

                if (subject.closed || this.ended) {
                    // There won't be any new messages
                    sub.complete()
                } else {
                    this.redis.subscribe(channel)
                        .catch(err => sub.error(err))

                    subscription.add(() => this.redis.unsubscribe(channel))
                }

                return subscription
            })
                .pipe(
                    // Don't subscribe unless there's someone listening
                    publish(),
                    // Ensure there's only one subscription per channel
                    refCount()
                )

            this.subscriptions.set(channel, {
                subject,
                observable
            })
        }

        // tslint:disable-next-line: no-non-null-assertion
        return this.subscriptions.get(channel)!.observable
    }
}
