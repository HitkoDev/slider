import { Lifecycle, scoped } from 'tsyringe'
import { Connection } from '../../connection'
import { MongoRepository } from '../base'
import { AccountModel } from './model'

export {
    AccountModel
}

@scoped(Lifecycle.ContainerScoped)
export class AccountRepository extends MongoRepository<AccountModel> {

    constructor(
        connection: Connection
    ) {
        super(connection, AccountModel)
    }

    async createIndexes() {
        await this.col.createIndex({
            isActive: 1
        })
    }
}
