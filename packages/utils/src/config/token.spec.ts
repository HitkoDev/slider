import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { container } from 'tsyringe'
import { createToken } from './token'

// tslint:disable: no-unused-expression

@suite
export class ConfigToken {

    @test
    public async createValueToken() {
        const tokenName = 'VALUE_TOKEN'
        const value = 'test'

        const token = createToken({ useValue: value }, tokenName)

        expect(typeof token).to.equal('symbol')
        expect(token.toString()).to.equal(`Symbol(${tokenName})`)
        expect(container.resolve(token)).to.equal(value)
    }

    @test
    public async createFactoryToken() {
        const tokenName = 'FACTORY_TOKEN'
        const value = 'test'

        const token = createToken({ useFactory: () => value }, tokenName)

        expect(typeof token).to.equal('symbol')
        expect(token.toString()).to.equal(`Symbol(${tokenName})`)
        expect(container.resolve(token)).to.equal(value)
    }
}
