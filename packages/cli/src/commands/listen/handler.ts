import { Subscriber } from '@task/pubsub'
import { Channel } from '@task/pubsub/dist/messages'
import { from } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { injectable } from 'tsyringe'
import { ListenArgs } from '.'

@injectable()
export class ListenHandler {

    constructor(
        protected readonly subscriber: Subscriber
    ) { }

    async handle(args: ListenArgs) {
        const ids = new Set(Array.isArray(args.account)
            ? args.account
            : args.account && [args.account] || []
        )

        let error: any

        const messages$ = this.subscriber.subscribe(Channel.Tracking)
            .pipe(
                catchError(err => {
                    console.error(err)
                    error = err
                    return from([])
                })
            )

        const sub = messages$
            .subscribe(msg => {
                if (ids.size && !ids.has(msg.accountId.toHexString()))
                    return

                console.log(`[${msg.timestamp}] ${msg.accountId.toHexString()}: "${msg.data}"`)
            })

        return messages$
            .toPromise()
            .then(() => {
                sub.unsubscribe()
                if (error)
                    throw (error)
            })
    }
}
