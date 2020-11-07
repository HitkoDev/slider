import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { Model } from './model'
import { Type } from './type'

// tslint:disable: no-unused-expression

class TestModel extends Model {
    static Type = Type.Account
    _type: Type.Account = Type.Account
    field: string
}

@suite
export class ModelBase {

    @test
    async init() {
        const value = 'test'
        const model = new TestModel({
            field: value
        })
        expect(model.field).to.equal(value)
        expect(model._type).to.equal(Type.Account)
        expect(model._id).to.be.undefined
    }
}
