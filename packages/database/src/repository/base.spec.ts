import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { Db, ObjectID } from 'mongodb'
import { container, DependencyContainer, injectable } from 'tsyringe'
import { Connection } from '../connection'
import { ConnectionMock } from '../testing/connection'
import { MongoRepository } from './base'
import { Model } from './model'
import { Type } from './type'

// tslint:disable: no-unused-expression

class TestModel extends Model {
    static Type = Type.Account
    _type: Type.Account = Type.Account
    field: string
}

@injectable()
class TestRepository extends MongoRepository<TestModel> {
    constructor(
        connection: Connection
    ) {
        super(connection, TestModel)
    }

    async createIndexes() {
        await this.col.createIndex({
            field: 1
        })
    }
}

@suite
export class RepositoryBase {

    childContainer: DependencyContainer
    connection: Connection

    static async before() {
        await ConnectionMock.start()
    }

    static async after() {
        await ConnectionMock.stop()
    }

    async before() {
        this.childContainer = container.createChildContainer()
        this.childContainer.register(Connection, { useToken: ConnectionMock })
        this.connection = this.childContainer.resolve(Connection)
    }

    @test
    async initialise() {
        const repository = this.childContainer.resolve(TestRepository)
        await repository.initPromise
        expect(repository.db).to.be.instanceOf(Db)
        expect(repository.col).to.exist

        const index = await repository.col.indexInformation()
        expect(Object.keys(index).length).to.equal(2)

        const indexSpecifications = Object.values(index)
        expect(indexSpecifications).to.deep.contain([['_id', 1]])
        expect(indexSpecifications).to.deep.contain([['field', 1]])
    }

    @test
    async dropIndex() {
        const repository = this.childContainer.resolve(TestRepository)
        await repository.initPromise
        const index = await repository.col.indexInformation()
        expect(Object.keys(index).length).to.equal(2)

        await repository.dropIndexes()
        const index2 = await repository.col.indexInformation()
        expect(Object.keys(index2).length).to.equal(1)

        const indexSpecifications = Object.values(index2)
        expect(indexSpecifications).to.deep.contain([['_id', 1]])
    }

    @test
    async crud() {
        const repository = this.childContainer.resolve(TestRepository)
        const value1 = 'test'
        const value2 = 'updated'

        // Create

        const model1 = await repository.create({ field: value1 })
        expect(model1).to.exist
        expect(model1).to.be.instanceOf(TestModel)
        expect(model1.field).to.equal(value1)

        // Read

        const model2 = await repository.findById(model1._id)
        expect(model2).to.be.instanceOf(TestModel)
        expect(model1._id.toHexString()).to.equal(model2?._id.toHexString())

        // Update

        const model3 = await repository.update(model1._id, { field: value2 })
        expect(model3).to.be.instanceOf(TestModel)
        expect(model1._id.toHexString()).to.equal(model3?._id.toHexString())
        expect(model3?.field).to.equal(value2)

        // Delete

        const model4 = await repository.delete(model1._id)
        expect(model4).to.be.instanceOf(TestModel)
        expect(model1._id.toHexString()).to.equal(model4?._id.toHexString())
        const model5 = await repository.findById(model1._id)
        expect(model5).to.be.undefined
    }

    @test
    async createWithId() {
        const repository = this.childContainer.resolve(TestRepository)
        const id = new ObjectID()
        const value = 'test'

        const model = await repository.create({
            _id: id,
            field: value
        })

        expect(model).to.exist
        expect(model._id.toHexString()).to.equal(id.toHexString())
        expect(model.field).to.equal(value)
    }

    @test
    async findNonExisting() {
        const repository = this.childContainer.resolve(TestRepository)
        const id = new ObjectID()

        const model = await repository.findById(id)

        expect(model).to.be.undefined
    }

    @test
    async emptyUpdate() {
        const repository = this.childContainer.resolve(TestRepository)
        const value = 'test'

        const model = await repository.create({ field: value })
        expect(model.field).to.equal(value)
        const updated = await repository.update(model._id, {})
        expect(updated?.field).to.equal(value)
        expect(model._id.toHexString()).to.equal(updated?._id.toHexString())
    }
}
