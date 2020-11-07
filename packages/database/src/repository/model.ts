import { ObjectID } from 'mongodb'
import { Type } from './type'

export abstract class Model {
    /**
     * Master ID of the entity
     */
    public _id: ObjectID

    abstract _type: Type

    constructor(data: object) {
        Object.assign(this, data)
    }
}

export interface IModelConstructor<T extends Model> {
    Type: T['_type']
    new(data: object): T
}
