import { assertIsDefined } from '@task/utils'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Lifecycle, scoped } from 'tsyringe'
import { Connection } from '../connection'

@scoped(Lifecycle.ContainerScoped)
export class ConnectionMock extends Connection {

    private static server = new MongoMemoryServer({
        autoStart: false,
        instance: {
            storageEngine: 'ephemeralForTest'
        }
    })

    private static connectionString?: string
    private static dbName?: string

    public static async start() {
        await ConnectionMock.server.ensureInstance()
        const [conn, db] = await Promise.all([
            ConnectionMock.server.getUri(),
            ConnectionMock.server.getDbName()
        ])

        ConnectionMock.connectionString = conn
        ConnectionMock.dbName = db
    }

    public static async stop() {
        return ConnectionMock.server.stop()
    }

    constructor(
        uri = ConnectionMock.connectionString,
        db = ConnectionMock.dbName
    ) {
        const msg = 'ConnectionMock.start shoud be run before using ConnectionMock mock.'
        assertIsDefined(uri, msg)
        assertIsDefined(db, msg)
        super(uri, db, '')
    }

    public async clear() {
        if (!this.db) return
        const dbs: Array<{ name: string }> = await this.db.listCollections().toArray()
        await Promise.all(dbs.map((db) => this.db?.collection(db.name).deleteMany({})))
    }
}
