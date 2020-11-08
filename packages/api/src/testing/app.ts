import { Connection } from '@task/database'
import { ConnectionMock } from '@task/database/dist/testing/connection'
import { Redis } from '@task/pubsub'
import { RedisMock } from '@task/pubsub/dist/testing/services/redis'
import { DependencyContainer } from 'tsyringe'
import { buildApp } from '../app'

export async function prepareMockApp(c: DependencyContainer) {
    c.register(Connection, { useToken: ConnectionMock })
    c.register(Redis, { useToken: RedisMock })
    const app = await buildApp(c)
    return app
}
