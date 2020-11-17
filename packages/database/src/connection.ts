import { Db, MongoClient } from 'mongodb'
import { inject, singleton } from 'tsyringe'
import { createToken } from '../../utils/dist/config/token'
import { loadAuthCertificate } from './utils/auth'

/**
 * Mongodb url
 *
 * @example `mongodb://localhost:27017`
 */
export const MONGODB_URL = createToken<string>({
    name: 'MONGODB_URL'
})

/**
 * Database to use
 */
export const MONGODB_DB = createToken<string>({
    name: 'MONGODB_DB'
})

/**
 * Certificate for authentication, can be an empty string if there's no auth
 */
export const MONGODB_X509 = createToken<string>({
    name: 'MONGODB_X509',
    provider: {
        useValue: ''
    }
})

@singleton()
export class Connection {

    get isConnected() {
        return this.client ? this.client.isConnected() : false
    }

    /**
     * Current database connection
     */
    db?: Db

    /**
     * Mongodb client
     */
    client?: MongoClient

    private _connectPromise: Promise<Db> | undefined

    constructor(
        @inject(MONGODB_URL)
        protected readonly url: string,
        @inject(MONGODB_DB)
        protected readonly database: string,
        @inject(MONGODB_X509)
        protected readonly x509: string
    ) { }

    /**
     * Connects to Mongo database and returns connection
     */
    async connect() {
        if (!this._connectPromise) {
            this._connectPromise = loadAuthCertificate(this.x509)
                .then((pem) => MongoClient.connect(this.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    ...pem
                        ? {
                            sslKey: pem,
                            sslCert: pem
                        }
                        : {}
                }))
                .then((client) => {
                    this.client = client
                    this.db = this.client.db(this.database)
                    return this.db
                }).catch((e) => {
                    this._connectPromise = undefined
                    this.client = undefined
                    this.db = undefined
                    throw e
                })
        }

        return this._connectPromise
    }

    /**
     * Disconnects from the Mongo database
     */
    async disconnect() {
        if (this.client) {
            await this.client.close()
        }
        this._connectPromise = undefined
        this.db = undefined
        this.client = undefined
    }
}
