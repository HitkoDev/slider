import { AccountRepository, ObjectID } from '@task/database'
import { Publisher } from '@task/pubsub'
import { Channel } from '@task/pubsub/dist/messages'
import Router from 'koa-router'
import { AppCustomContext } from '../context'

export const accountRoutes = new Router<{}, AppCustomContext>()

accountRoutes.get('track', '/track/:id', async (ctx) => {
    const accountRepository = ctx.container.resolve(AccountRepository)
    const publisher = ctx.container.resolve(Publisher)

    let id: ObjectID | undefined
    if (ctx.params.id)
        try {
            id = new ObjectID(ctx.params.id)
        } catch (err) {
            ctx.status = 400
            ctx.body = 'Invaild ID'
            return
        }

    const account = id
        ? await accountRepository.findById(id)
        : undefined

    if (!account) {
        ctx.status = 404
        ctx.body = 'No such account'
        return
    }

    if (!account.isActive) {
        ctx.status = 403
        ctx.body = 'Deactivated account'
        return
    }

    const data = ctx.query.data

    await publisher.publish(Channel.Tracking, {
        accountId: account._id,
        timestamp: ctx.time,
        data
    })

    ctx.status = 200
    ctx.body = 'Accepted'
})
