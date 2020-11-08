import { assertIsDefined } from '@task/utils'
import { Collection, FilterQuery, ObjectID } from 'mongodb'
import { Connection } from '../connection'
import { IModelConstructor, Model } from './model'

export type BasicCreateInput<T extends Model> = Omit<T, keyof Model> & Partial<Pick<T, '_id'>>
export type BasicUpdateInput<T extends Model> = Partial<BasicCreateInput<T>>

export class MongoRepository<T extends Model = Model, TCreateInput = BasicCreateInput<T>, TUpdateInput = BasicUpdateInput<T>> {

    /**
     * Database reference
     * Before accessing it, ensure the connection to the database
     */
    get db() {
        assertIsDefined(this.connection.db, 'Cannot access database before connected.')
        return this.connection.db
    }

    /**
     * Collection reference
     * Before accessing it, ensure the connection to the database
     */
    get col() {
        return this.db.collection<T>(this.Class.Type)
    }

    readonly initPromise = this.connection.connect()
        .then(() => this.createCollections())
        .then(() => this.createIndexes())

    constructor(
        protected connection: Connection,
        protected Class: IModelConstructor<T>
    ) { }

    async findById(id: ObjectID) {
        await this.initPromise
        const entity = await this.col.findOne({ _id: id } as FilterQuery<T>)
        return entity ? this.instantiate(entity) : undefined
    }

    async create(data: TCreateInput) {
        await this.initPromise
        const result = await this.col.insertOne(data as any)
        return this.instantiate(result.ops[0])
    }

    async update(id: ObjectID, data: TUpdateInput) {
        await this.initPromise
        if (Object.keys(data).length < 1)
            return this.findById(id)
        const { value } = await this.col.findOneAndUpdate(
            { _id: id } as FilterQuery<T>,
            { $set: data },
            { returnOriginal: false }
        )
        return value ? this.instantiate(value) : undefined
    }

    async delete(id: ObjectID) {
        await this.initPromise
        const { value } = await this.col.findOneAndDelete({ _id: id } as FilterQuery<T>)
        return value ? this.instantiate(value) : undefined
    }

    /**
     * Create MongoDB indexes at initatialization of class
     */
    async createIndexes() { }

    /** Create MongoDB collection. */
    async createCollections(): Promise<Array<Collection<T>>> {
        const existing: Array<Collection<T>> = await this.db.listCollections({ name: this.Class.Type }).toArray()
        if (existing.length) return existing
        return this.db.createCollection(this.Class.Type).then((c) => [c])
    }

    /**
     * Drop every index for this repository
     */
    async dropIndexes() {
        await this.col.dropIndexes()
    }

    protected instantiate(entity: any) {
        return new this.Class(entity)
    }

}
