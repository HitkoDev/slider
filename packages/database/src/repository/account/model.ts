import { ObjectID } from 'mongodb'
import { Model } from '../model'
import { Type } from '../type'

export class AccountModel extends Model {
    static readonly Type: Type.Account = Type.Account
    readonly _type: Type.Account = Type.Account
    /**
     * Account id
     */
    _id: ObjectID
    /**
     * Account name
     */
    name: string
    /**
     * Indicates whether an account is active
     */
    isActive: boolean
}
